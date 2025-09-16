// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DOMACollateral
 * @dev NFT contract for DOMA domain names used as collateral in CircleFi
 */
contract DOMACollateral is ERC721, ERC721Enumerable, Ownable, ReentrancyGuard {
    struct Domain {
        string name;
        uint256 value; // USD value in 6 decimals
        uint256 lastValuation;
        bool isCollateral;
        address borrower;
        uint256 loanAmount;
    }

    mapping(uint256 => Domain) public domains;
    mapping(string => uint256) public domainNameToId;
    mapping(address => uint256[]) public userDomains;
    
    uint256 private _nextTokenId;
    uint256 public constant VALUATION_VALIDITY_PERIOD = 30 days;
    uint256 public constant MIN_DOMAIN_VALUE = 1000e6; // $1000 minimum
    uint256 public constant MAX_LTV = 50; // 50% max loan-to-value
    
    // Oracle for domain valuation (simplified for MVP)
    mapping(address => bool) public valuationOracles;
    
    event DomainMinted(uint256 indexed tokenId, string name, address indexed owner, uint256 value);
    event DomainValueUpdated(uint256 indexed tokenId, uint256 newValue, address indexed oracle);
    event DomainUsedAsCollateral(uint256 indexed tokenId, address indexed borrower, uint256 loanAmount);
    event CollateralReleased(uint256 indexed tokenId);

    constructor() ERC721("DOMA Domain Collateral", "DOMA") {
        _nextTokenId = 1;
    }

    /**
     * @dev Mint a new domain NFT
     */
    function mintDomain(
        string memory domainName,
        uint256 initialValue,
        address to
    ) external onlyOwner returns (uint256) {
        require(bytes(domainName).length > 0, "Domain name required");
        require(initialValue >= MIN_DOMAIN_VALUE, "Value below minimum");
        require(domainNameToId[domainName] == 0, "Domain already exists");

        uint256 tokenId = _nextTokenId++;
        
        domains[tokenId] = Domain({
            name: domainName,
            value: initialValue,
            lastValuation: block.timestamp,
            isCollateral: false,
            borrower: address(0),
            loanAmount: 0
        });
        
        domainNameToId[domainName] = tokenId;
        userDomains[to].push(tokenId);
        
        _safeMint(to, tokenId);
        
        emit DomainMinted(tokenId, domainName, to, initialValue);
        return tokenId;
    }

    /**
     * @dev Update domain valuation (oracle function)
     */
    function updateDomainValue(uint256 tokenId, uint256 newValue) external {
        require(valuationOracles[msg.sender], "Not authorized oracle");
        require(_exists(tokenId), "Domain does not exist");
        require(newValue >= MIN_DOMAIN_VALUE, "Value below minimum");
        require(!domains[tokenId].isCollateral, "Cannot update collateral domain");

        domains[tokenId].value = newValue;
        domains[tokenId].lastValuation = block.timestamp;
        
        emit DomainValueUpdated(tokenId, newValue, msg.sender);
    }

    /**
     * @dev Use domain as collateral for a loan
     */
    function useAsCollateral(
        uint256 tokenId,
        address borrower,
        uint256 loanAmount
    ) external onlyOwner {
        require(_exists(tokenId), "Domain does not exist");
        require(!domains[tokenId].isCollateral, "Already used as collateral");
        require(isValidCollateral(tokenId), "Valuation too old");
        require(
            loanAmount <= getMaxLoanAmount(tokenId),
            "Loan amount exceeds max LTV"
        );

        domains[tokenId].isCollateral = true;
        domains[tokenId].borrower = borrower;
        domains[tokenId].loanAmount = loanAmount;
        
        emit DomainUsedAsCollateral(tokenId, borrower, loanAmount);
    }

    /**
     * @dev Release domain from collateral
     */
    function releaseCollateral(uint256 tokenId) external onlyOwner {
        require(_exists(tokenId), "Domain does not exist");
        require(domains[tokenId].isCollateral, "Not used as collateral");

        domains[tokenId].isCollateral = false;
        domains[tokenId].borrower = address(0);
        domains[tokenId].loanAmount = 0;
        
        emit CollateralReleased(tokenId);
    }

    /**
     * @dev Check if domain valuation is still valid
     */
    function isValidCollateral(uint256 tokenId) public view returns (bool) {
        require(_exists(tokenId), "Domain does not exist");
        return block.timestamp - domains[tokenId].lastValuation <= VALUATION_VALIDITY_PERIOD;
    }

    /**
     * @dev Get maximum loan amount for a domain
     */
    function getMaxLoanAmount(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), "Domain does not exist");
        return (domains[tokenId].value * MAX_LTV) / 100;
    }

    /**
     * @dev Get current loan-to-value ratio
     */
    function getCurrentLTV(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), "Domain does not exist");
        if (!domains[tokenId].isCollateral || domains[tokenId].value == 0) {
            return 0;
        }
        return (domains[tokenId].loanAmount * 100) / domains[tokenId].value;
    }

    /**
     * @dev Add valuation oracle
     */
    function addValuationOracle(address oracle) external onlyOwner {
        valuationOracles[oracle] = true;
    }

    /**
     * @dev Remove valuation oracle
     */
    function removeValuationOracle(address oracle) external onlyOwner {
        valuationOracles[oracle] = false;
    }

    /**
     * @dev Get all domains owned by a user
     */
    function getUserDomains(address user) external view returns (uint256[] memory) {
        return userDomains[user];
    }

    /**
     * @dev Get domain info by name
     */
    function getDomainByName(string memory domainName) external view returns (
        uint256 tokenId,
        uint256 value,
        uint256 lastValuation,
        bool isCollateral,
        address borrower,
        uint256 loanAmount
    ) {
        tokenId = domainNameToId[domainName];
        require(tokenId != 0, "Domain does not exist");
        
        Domain memory domain = domains[tokenId];
        return (
            tokenId,
            domain.value,
            domain.lastValuation,
            domain.isCollateral,
            domain.borrower,
            domain.loanAmount
        );
    }

    // Override required functions
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        require(!domains[tokenId].isCollateral, "Cannot transfer collateral domain");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        
        // Update user domains mapping
        if (from != address(0) && to != address(0)) {
            // Remove from previous owner
            uint256[] storage fromDomains = userDomains[from];
            for (uint256 i = 0; i < fromDomains.length; i++) {
                if (fromDomains[i] == tokenId) {
                    fromDomains[i] = fromDomains[fromDomains.length - 1];
                    fromDomains.pop();
                    break;
                }
            }
            
            // Add to new owner
            userDomains[to].push(tokenId);
        }
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Domain does not exist");
        
        // Simple metadata for MVP - in production this would return proper JSON metadata
        return string(abi.encodePacked(
            "https://api.circlefi.io/domain/",
            Strings.toString(tokenId)
        ));
    }
}
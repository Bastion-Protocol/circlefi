// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/ICircleFi.sol";

contract MockDomainOracle is IDomainOracle, Ownable {
    struct DomainData {
        uint256 price;
        bool isValid;
        uint256 lastUpdated;
    }

    mapping(string => DomainData) private domainData;
    mapping(string => bool) public whitelistedDomains;

    event DomainPriceUpdated(string indexed domain, uint256 price);
    event DomainWhitelisted(string indexed domain);
    event DomainDelisted(string indexed domain);

    constructor() {
        // Initialize with some sample domains
        _setDomainPrice("example.com", 1000 * 1e18); // 1000 tokens
        _setDomainPrice("defi.org", 5000 * 1e18);    // 5000 tokens
        _setDomainPrice("crypto.io", 2500 * 1e18);   // 2500 tokens
        _setDomainPrice("web3.xyz", 800 * 1e18);     // 800 tokens
        
        whitelistedDomains["example.com"] = true;
        whitelistedDomains["defi.org"] = true;
        whitelistedDomains["crypto.io"] = true;
        whitelistedDomains["web3.xyz"] = true;
    }

    function getDomainPrice(string calldata domain) external view override returns (uint256) {
        require(domainData[domain].isValid, "Domain not found");
        return domainData[domain].price;
    }

    function isDomainValid(string calldata domain) external view override returns (bool) {
        return domainData[domain].isValid && whitelistedDomains[domain];
    }

    function getLastUpdated(string calldata domain) external view override returns (uint256) {
        return domainData[domain].lastUpdated;
    }

    function setDomainPrice(string calldata domain, uint256 price) external onlyOwner {
        _setDomainPrice(domain, price);
    }

    function _setDomainPrice(string memory domain, uint256 price) internal {
        domainData[domain] = DomainData({
            price: price,
            isValid: true,
            lastUpdated: block.timestamp
        });
        emit DomainPriceUpdated(domain, price);
    }

    function whitelistDomain(string calldata domain) external onlyOwner {
        whitelistedDomains[domain] = true;
        if (!domainData[domain].isValid) {
            domainData[domain] = DomainData({
                price: 1000 * 1e18, // Default price
                isValid: true,
                lastUpdated: block.timestamp
            });
        }
        emit DomainWhitelisted(domain);
    }

    function delistDomain(string calldata domain) external onlyOwner {
        whitelistedDomains[domain] = false;
        emit DomainDelisted(domain);
    }

    function updateMultipleDomainPrices(
        string[] calldata domains,
        uint256[] calldata prices
    ) external onlyOwner {
        require(domains.length == prices.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < domains.length; i++) {
            _setDomainPrice(domains[i], prices[i]);
        }
    }

    // Simulate DOMA API integration
    function simulatePriceFluctuation(string calldata domain, int256 percentageChange) external onlyOwner {
        require(domainData[domain].isValid, "Domain not found");
        
        uint256 currentPrice = domainData[domain].price;
        uint256 newPrice;
        
        if (percentageChange >= 0) {
            newPrice = currentPrice + (currentPrice * uint256(percentageChange)) / 100;
        } else {
            uint256 decrease = (currentPrice * uint256(-percentageChange)) / 100;
            newPrice = currentPrice > decrease ? currentPrice - decrease : 0;
        }
        
        _setDomainPrice(domain, newPrice);
    }
}
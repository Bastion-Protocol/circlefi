// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../interfaces/ICircleFi.sol";

contract MockYellowSDK is IYellowSDK {
    struct StateChannel {
        address[] participants;
        bytes state;
        bool isActive;
        uint256 lastUpdated;
    }

    mapping(bytes32 => StateChannel) public channels;
    mapping(address => bytes32[]) public userChannels;

    event ChannelCreated(bytes32 indexed channelId, address[] participants);
    event ChannelStateUpdated(bytes32 indexed channelId, bytes newState);
    event ChannelClosed(bytes32 indexed channelId);

    function createStateChannel(address[] calldata participants) external override returns (bytes32) {
        require(participants.length >= 2, "Need at least 2 participants");
        
        bytes32 channelId = keccak256(abi.encodePacked(participants, block.timestamp, block.number));
        
        channels[channelId] = StateChannel({
            participants: participants,
            state: "",
            isActive: true,
            lastUpdated: block.timestamp
        });

        // Add channel to each participant's list
        for (uint256 i = 0; i < participants.length; i++) {
            userChannels[participants[i]].push(channelId);
        }

        emit ChannelCreated(channelId, participants);
        return channelId;
    }

    function updateChannelState(bytes32 channelId, bytes calldata newState) external override {
        StateChannel storage channel = channels[channelId];
        require(channel.isActive, "Channel is not active");
        require(isParticipant(channelId, msg.sender), "Not a participant");
        
        channel.state = newState;
        channel.lastUpdated = block.timestamp;

        emit ChannelStateUpdated(channelId, newState);
    }

    function closeChannel(bytes32 channelId) external override {
        StateChannel storage channel = channels[channelId];
        require(channel.isActive, "Channel is not active");
        require(isParticipant(channelId, msg.sender), "Not a participant");
        
        channel.isActive = false;

        emit ChannelClosed(channelId);
    }

    function getChannelState(bytes32 channelId) external view override returns (bytes memory) {
        return channels[channelId].state;
    }

    function isParticipant(bytes32 channelId, address user) public view returns (bool) {
        StateChannel storage channel = channels[channelId];
        for (uint256 i = 0; i < channel.participants.length; i++) {
            if (channel.participants[i] == user) {
                return true;
            }
        }
        return false;
    }

    function getChannelParticipants(bytes32 channelId) external view returns (address[] memory) {
        return channels[channelId].participants;
    }

    function getUserChannels(address user) external view returns (bytes32[] memory) {
        return userChannels[user];
    }

    function isChannelActive(bytes32 channelId) external view returns (bool) {
        return channels[channelId].isActive;
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SentinelAlertRegistry
 * @notice On-chain registry for high-confidence liquidation cascade alerts.
 * @dev Deployed to Arbitrum mainnet. Only the authorized publisher (SENTINEL backend)
 *      can publish alerts. Alerts are immutable once published.
 */
contract SentinelAlertRegistry {
    address public authorizedPublisher;

    struct Alert {
        string market;
        uint256 cascadeProbability; // basis points: 8500 = 85%
        uint8 severity;             // 1=WATCH 2=ALERT 3=CASCADE_IMMINENT
        uint256 timestamp;
    }

    Alert[] public alerts;

    event AlertPublished(
        uint256 indexed alertId,
        address indexed publisher,
        string market,
        uint256 probability,
        uint8 severity,
        uint256 timestamp
    );

    error NotAuthorized();
    error InvalidSeverity();
    error InvalidProbability();

    modifier onlyAuthorizedPublisher() {
        if (msg.sender != authorizedPublisher) revert NotAuthorized();
        _;
    }

    constructor(address _publisher) {
        authorizedPublisher = _publisher;
    }

    /**
     * @notice Publish a cascade alert on-chain
     * @param market Market symbol (e.g. "BTC-PERP")
     * @param cascadeProbability Probability in basis points (0-10000)
     * @param severity Alert severity level (1-3)
     */
    function publishAlert(
        string memory market,
        uint256 cascadeProbability,
        uint8 severity
    ) external onlyAuthorizedPublisher {
        if (severity < 1 || severity > 3) revert InvalidSeverity();
        if (cascadeProbability > 10000) revert InvalidProbability();

        alerts.push(Alert(market, cascadeProbability, severity, block.timestamp));

        emit AlertPublished(
            alerts.length - 1,
            msg.sender,
            market,
            cascadeProbability,
            severity,
            block.timestamp
        );
    }

    /**
     * @notice Get total number of published alerts
     */
    function getAlertCount() external view returns (uint256) {
        return alerts.length;
    }

    /**
     * @notice Get a specific alert by ID
     */
    function getAlert(uint256 alertId) external view returns (Alert memory) {
        return alerts[alertId];
    }
}

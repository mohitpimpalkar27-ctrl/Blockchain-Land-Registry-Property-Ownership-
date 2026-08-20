// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Blockchain-Based Land Registry & Property Ownership System
 * @notice Educational prototype using only dummy/synthetic property data
 *         and test wallet addresses.
 *
 * IMPORTANT:
 * This smart contract does NOT establish legally valid property ownership.
 * It is only a blockchain course project / educational prototype.
 */
contract LandRegistry {

    // =========================================================
    // ADMIN / LAND AUTHORITY
    // =========================================================

    address public admin;

    constructor() {
        admin = msg.sender;
    }

    // =========================================================
    // PROPERTY STATUS
    // =========================================================

    enum PropertyStatus {
        REGISTERED,
        VERIFIED,
        TRANSFER_PENDING,
        TRANSFERRED,
        DISPUTED
    }

    // =========================================================
    // PROPERTY STRUCTURE
    // =========================================================

    struct Property {
        uint256 propertyId;
        string propertyNumber;
        string location;
        uint256 area;
        string propertyType;

        address currentOwner;
        address previousOwner;

        string documentHash;

        bool verified;

        PropertyStatus status;

        uint256 registeredAt;
        uint256 lastTransferredAt;
    }

    // =========================================================
    // STORAGE
    // =========================================================

    // propertyId => Property
    mapping(uint256 => Property) private properties;

    // propertyId => existence
    mapping(uint256 => bool) private propertyExistsMap;

    // owner => currently owned property IDs
    mapping(address => uint256[]) private ownerProperties;

    // propertyId => ownership history
    mapping(uint256 => address[]) private ownershipHistory;

    // =========================================================
    // EVENTS
    // =========================================================

    event PropertyRegistered(
        uint256 indexed propertyId,
        string propertyNumber,
        address indexed owner,
        uint256 timestamp
    );

    event PropertyVerified(
        uint256 indexed propertyId,
        address indexed verifier,
        uint256 timestamp
    );

    event OwnershipTransferred(
        uint256 indexed propertyId,
        address indexed previousOwner,
        address indexed newOwner,
        uint256 timestamp
    );

    event PropertyStatusUpdated(
        uint256 indexed propertyId,
        PropertyStatus newStatus,
        uint256 timestamp
    );

    // =========================================================
    // MODIFIERS
    // =========================================================

    modifier onlyAdmin() {
        require(
            msg.sender == admin,
            "Only admin can perform this action"
        );
        _;
    }

    modifier propertyMustExist(uint256 propertyId) {
        require(
            propertyExistsMap[propertyId],
            "Property does not exist"
        );
        _;
    }

    modifier onlyPropertyOwner(uint256 propertyId) {
        require(
            properties[propertyId].currentOwner == msg.sender,
            "Caller is not the property owner"
        );
        _;
    }

    // =========================================================
    // ADMIN FUNCTIONS
    // =========================================================

    function getAdmin() public view returns (address) {
        return admin;
    }

    // =========================================================
    // PROPERTY REGISTRATION
    // =========================================================

    function registerProperty(
        uint256 propertyId,
        string memory propertyNumber,
        string memory location,
        uint256 area,
        string memory propertyType,
        address initialOwner,
        string memory documentHash
    ) public onlyAdmin {

        require(
            !propertyExistsMap[propertyId],
            "Property ID already exists"
        );

        require(
            initialOwner != address(0),
            "Owner cannot be zero address"
        );

        require(
            area > 0,
            "Area must be greater than zero"
        );

        require(
            bytes(propertyNumber).length > 0,
            "Property number required"
        );

        require(
            bytes(location).length > 0,
            "Location required"
        );

        require(
            bytes(propertyType).length > 0,
            "Property type required"
        );

        require(
            bytes(documentHash).length > 0,
            "Document hash required"
        );

        properties[propertyId] = Property({
            propertyId: propertyId,
            propertyNumber: propertyNumber,
            location: location,
            area: area,
            propertyType: propertyType,
            currentOwner: initialOwner,
            previousOwner: address(0),
            documentHash: documentHash,
            verified: false,
            status: PropertyStatus.REGISTERED,
            registeredAt: block.timestamp,
            lastTransferredAt: 0
        });

        propertyExistsMap[propertyId] = true;

        ownerProperties[initialOwner].push(propertyId);

        ownershipHistory[propertyId].push(initialOwner);

        emit PropertyRegistered(
            propertyId,
            propertyNumber,
            initialOwner,
            block.timestamp
        );
    }

    // =========================================================
    // PROPERTY VERIFICATION
    // =========================================================

    function verifyProperty(
        uint256 propertyId
    )
        public
        onlyAdmin
        propertyMustExist(propertyId)
    {

        require(
            !properties[propertyId].verified,
            "Property already verified"
        );

        require(
            properties[propertyId].status != PropertyStatus.DISPUTED,
            "Disputed property cannot be verified"
        );

        properties[propertyId].verified = true;

        properties[propertyId].status =
            PropertyStatus.VERIFIED;

        emit PropertyVerified(
            propertyId,
            msg.sender,
            block.timestamp
        );

        emit PropertyStatusUpdated(
            propertyId,
            PropertyStatus.VERIFIED,
            block.timestamp
        );
    }

    // =========================================================
    // OWNERSHIP TRANSFER
    // =========================================================

    function transferOwnership(
        uint256 propertyId,
        address newOwner
    )
        public
        propertyMustExist(propertyId)
        onlyPropertyOwner(propertyId)
    {

        Property storage property =
            properties[propertyId];

        require(
            newOwner != address(0),
            "New owner cannot be zero address"
        );

        require(
            newOwner != property.currentOwner,
            "New owner must be different"
        );

        require(
            property.verified,
            "Property must be verified before transfer"
        );

        require(
            property.status != PropertyStatus.DISPUTED,
            "Disputed property cannot be transferred"
        );

        address oldOwner =
            property.currentOwner;

        property.previousOwner =
            oldOwner;

        property.currentOwner =
            newOwner;

        property.lastTransferredAt =
            block.timestamp;

        property.status =
            PropertyStatus.TRANSFERRED;

        _removePropertyFromOwner(
            oldOwner,
            propertyId
        );

        ownerProperties[newOwner].push(
            propertyId
        );

        ownershipHistory[propertyId].push(
            newOwner
        );

        emit OwnershipTransferred(
            propertyId,
            oldOwner,
            newOwner,
            block.timestamp
        );

        emit PropertyStatusUpdated(
            propertyId,
            PropertyStatus.TRANSFERRED,
            block.timestamp
        );
    }

    // =========================================================
    // PROPERTY STATUS UPDATE
    // =========================================================

    function updatePropertyStatus(
        uint256 propertyId,
        PropertyStatus newStatus
    )
        public
        onlyAdmin
        propertyMustExist(propertyId)
    {

        properties[propertyId].status =
            newStatus;

        emit PropertyStatusUpdated(
            propertyId,
            newStatus,
            block.timestamp
        );
    }

    // =========================================================
    // VIEW PROPERTY
    // =========================================================

    function getProperty(
        uint256 propertyId
    )
        public
        view
        propertyMustExist(propertyId)
        returns (Property memory)
    {

        return properties[propertyId];
    }

    // =========================================================
    // CHECK PROPERTY EXISTENCE
    // =========================================================

    function propertyExists(
        uint256 propertyId
    )
        public
        view
        returns (bool)
    {

        return propertyExistsMap[propertyId];
    }

    // =========================================================
    // GET PROPERTIES OWNED BY A WALLET
    // =========================================================

    function getPropertiesByOwner(
        address owner
    )
        public
        view
        returns (uint256[] memory)
    {

        return ownerProperties[owner];
    }

    // =========================================================
    // GET OWNERSHIP HISTORY
    // =========================================================

    function getOwnershipHistory(
        uint256 propertyId
    )
        public
        view
        propertyMustExist(propertyId)
        returns (address[] memory)
    {

        return ownershipHistory[propertyId];
    }

    // =========================================================
    // INTERNAL HELPER FUNCTION
    // =========================================================

    function _removePropertyFromOwner(
        address owner,
        uint256 propertyId
    )
        internal
    {

        uint256[] storage list =
            ownerProperties[owner];

        for (
            uint256 i = 0;
            i < list.length;
            i++
        ) {

            if (list[i] == propertyId) {

                list[i] =
                    list[list.length - 1];

                list.pop();

                break;
            }
        }
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/**
 * @title CompanyRegistry
 * @notice Manages company registration and metadata on Arc
 * @dev Maps companyId to company owner and stores basic company information
 */
contract CompanyRegistry {
    // Events
    event CompanyRegistered(uint256 indexed companyId, address indexed owner, string metadataHash);
    event CompanyMetadataUpdated(uint256 indexed companyId, string metadataHash);
    event CompanyOwnerUpdated(uint256 indexed companyId, address indexed oldOwner, address indexed newOwner);

    // Structs
    struct Company {
        address owner;
        string metadataHash; // IPFS hash or JSON string
        uint256 createdAt;
        bool exists;
    }

    // State variables
    uint256 public companyCount;
    mapping(uint256 => Company) public companies;
    mapping(address => uint256[]) public ownerCompanies; // Track companies by owner

    // Modifiers
    modifier onlyCompanyOwner(uint256 companyId) {
        require(companies[companyId].exists, "Company does not exist");
        require(companies[companyId].owner == msg.sender, "Not company owner");
        _;
    }

    /**
     * @notice Register a new company
     * @param metadataHash IPFS hash or JSON string containing company metadata
     * @return companyId The ID of the newly registered company
     */
    function registerCompany(string memory metadataHash) external returns (uint256) {
        companyCount++;
        uint256 companyId = companyCount;

        companies[companyId] = Company({
            owner: msg.sender,
            metadataHash: metadataHash,
            createdAt: block.timestamp,
            exists: true
        });

        ownerCompanies[msg.sender].push(companyId);

        emit CompanyRegistered(companyId, msg.sender, metadataHash);
        return companyId;
    }

    /**
     * @notice Update company metadata
     * @param companyId The ID of the company
     * @param metadataHash New metadata hash
     */
    function setCompanyMeta(uint256 companyId, string memory metadataHash) 
        external 
        onlyCompanyOwner(companyId) 
    {
        companies[companyId].metadataHash = metadataHash;
        emit CompanyMetadataUpdated(companyId, metadataHash);
    }

    /**
     * @notice Transfer company ownership
     * @param companyId The ID of the company
     * @param newOwner The new owner address
     */
    function transferOwnership(uint256 companyId, address newOwner) 
        external 
        onlyCompanyOwner(companyId) 
    {
        require(newOwner != address(0), "Invalid new owner");
        address oldOwner = companies[companyId].owner;
        companies[companyId].owner = newOwner;
        emit CompanyOwnerUpdated(companyId, oldOwner, newOwner);
    }

    /**
     * @notice Get company details
     * @param companyId The ID of the company
     * @return owner The owner address
     * @return metadataHash The metadata hash
     * @return createdAt The creation timestamp
     */
    function getCompany(uint256 companyId) 
        external 
        view 
        returns (address owner, string memory metadataHash, uint256 createdAt) 
    {
        require(companies[companyId].exists, "Company does not exist");
        Company memory company = companies[companyId];
        return (company.owner, company.metadataHash, company.createdAt);
    }

    /**
     * @notice Get all companies owned by an address
     * @param owner The owner address
     * @return companyIds Array of company IDs
     */
    function getOwnerCompanies(address owner) external view returns (uint256[] memory) {
        return ownerCompanies[owner];
    }
}



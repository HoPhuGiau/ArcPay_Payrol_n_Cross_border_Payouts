// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import "../CompanyRegistry.sol";

contract CompanyRegistryTest is Test {
    CompanyRegistry public registry;
    address public owner;

    function setUp() public {
        owner = address(this);
        registry = new CompanyRegistry();
    }

    function testRegisterCompany() public {
        string memory metadata = "QmTest123";
        uint256 companyId = registry.registerCompany(metadata);
        
        assertEq(companyId, 1);
        assertEq(registry.companyCount(), 1);
        
        (address regOwner, string memory regMetadata, ) = registry.getCompany(companyId);
        assertEq(regOwner, owner);
        assertEq(regMetadata, metadata);
    }

    function testUpdateCompanyMetadata() public {
        uint256 companyId = registry.registerCompany("QmTest123");
        registry.setCompanyMeta(companyId, "QmUpdated456");
        
        (, string memory metadata, ) = registry.getCompany(companyId);
        assertEq(metadata, "QmUpdated456");
    }

    function testTransferOwnership() public {
        uint256 companyId = registry.registerCompany("QmTest123");
        address newOwner = address(0x123);
        
        registry.transferOwnership(companyId, newOwner);
        
        (address regOwner, , ) = registry.getCompany(companyId);
        assertEq(regOwner, newOwner);
    }

    function testGetOwnerCompanies() public {
        registry.registerCompany("QmTest1");
        registry.registerCompany("QmTest2");
        
        uint256[] memory companies = registry.getOwnerCompanies(owner);
        assertEq(companies.length, 2);
        assertEq(companies[0], 1);
        assertEq(companies[1], 2);
    }
}


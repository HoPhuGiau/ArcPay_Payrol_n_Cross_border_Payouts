// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import "../CompanyRegistry.sol";
import "../PayrollManager.sol";

// Mock ERC20 token for testing
contract MockERC20 {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    uint8 public decimals = 6;

    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }
}

contract PayrollManagerTest is Test {
    CompanyRegistry public registry;
    PayrollManager public payroll;
    MockERC20 public usdc;
    MockERC20 public eurc;
    
    address public companyOwner;
    address public employee1;
    address public employee2;
    uint256 public companyId;

    function setUp() public {
        companyOwner = address(0x1);
        employee1 = address(0x2);
        employee2 = address(0x3);

        // Deploy contracts
        registry = new CompanyRegistry();
        payroll = new PayrollManager(address(registry));
        
        // Deploy mock tokens
        usdc = new MockERC20();
        eurc = new MockERC20();

        // Register company
        vm.prank(companyOwner);
        companyId = registry.registerCompany("QmCompany123");
    }

    function testAddEmployee() public {
        vm.prank(companyOwner);
        payroll.addEmployee(
            companyId,
            employee1,
            1000 * 10**6, // 1000 USDC
            address(usdc),
            PayrollManager.PayCycle.Monthly
        );

        (uint256 count, uint256 activeCount) = payroll.getEmployeeCount(companyId);
        assertEq(count, 1);
        assertEq(activeCount, 1);
    }

    function testCreatePayrollBatch() public {
        // Add employees
        vm.startPrank(companyOwner);
        payroll.addEmployee(companyId, employee1, 1000 * 10**6, address(usdc), PayrollManager.PayCycle.Monthly);
        payroll.addEmployee(companyId, employee2, 2000 * 10**6, address(usdc), PayrollManager.PayCycle.Monthly);
        vm.stopPrank();

        // Create batch
        vm.prank(companyOwner);
        uint256 batchId = payroll.createPayrollBatch(companyId, 202501, address(usdc));

        (,,, uint256 totalAmount, bool executed,, uint256 employeeCount) = payroll.payrollBatches(batchId);
        assertEq(totalAmount, 3000 * 10**6);
        assertEq(employeeCount, 2);
        assertFalse(executed);
    }

    function testExecutePayroll() public {
        // Setup: Add employees and create batch
        vm.startPrank(companyOwner);
        payroll.addEmployee(companyId, employee1, 1000 * 10**6, address(usdc), PayrollManager.PayCycle.Monthly);
        uint256 batchId = payroll.createPayrollBatch(companyId, 202501, address(usdc));
        vm.stopPrank();

        // Fund company owner and approve
        usdc.mint(companyOwner, 10000 * 10**6);
        vm.prank(companyOwner);
        usdc.approve(address(payroll), 10000 * 10**6);

        // Execute payroll
        vm.prank(companyOwner);
        payroll.executePayroll(batchId);

        // Verify payment
        assertEq(usdc.balanceOf(employee1), 1000 * 10**6);
        
        (,,,, bool executed,,) = payroll.payrollBatches(batchId);
        assertTrue(executed);
    }
}


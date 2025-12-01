// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "./CompanyRegistry.sol";

/**
 * @title PayrollManager
 * @notice Manages employee payroll and batch payments on Arc using USDC/EURC
 * @dev Handles employee management, payroll batch creation, and onchain salary payments
 */
contract PayrollManager {
    // Import IERC20 interface
    interface IERC20 {
        function transferFrom(address from, address to, uint256 amount) external returns (bool);
        function transfer(address to, uint256 amount) external returns (bool);
        function balanceOf(address account) external view returns (uint256);
        function allowance(address owner, address spender) external view returns (uint256);
        function approve(address spender, uint256 amount) external returns (bool);
    }

    // Token addresses from arcusdc.txt
    address public constant USDC = 0x3600000000000000000000000000000000000000;
    address public constant EURC = 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a;

    // Reference to CompanyRegistry
    CompanyRegistry public companyRegistry;

    // Enums
    enum PayCycle {
        Monthly,    // 0
        Weekly,     // 1
        BiWeekly,   // 2
        Quarterly   // 3
    }

    // Structs
    struct Employee {
        address wallet;
        uint256 basePay;      // Amount in token's smallest unit (6 decimals for USDC/EURC)
        address payToken;     // USDC or EURC address
        PayCycle payCycle;
        bool active;
        uint256 addedAt;
    }

    struct PayrollBatch {
        uint256 companyId;
        uint256 period;       // Timestamp or period identifier (e.g., yyyymm)
        address token;        // USDC or EURC
        uint256 totalAmount;
        bool executed;
        uint256 executedAt;
        uint256 employeeCount;
    }

    struct PaymentRecord {
        uint256 batchId;
        address employee;
        uint256 amount;
        address token;
        bool paid;
        uint256 paidAt;
    }

    // State variables
    mapping(uint256 => Employee[]) public companyEmployees; // companyId => employees
    mapping(uint256 => PayrollBatch) public payrollBatches;
    mapping(uint256 => PaymentRecord[]) public batchPayments; // batchId => payments
    mapping(address => PaymentRecord[]) public employeePayments; // employee wallet => payments
    
    uint256 public payrollBatchCount;
    uint256 public constant USDC_DECIMALS = 6;
    uint256 public constant EURC_DECIMALS = 6;

    // Events
    event EmployeeAdded(
        uint256 indexed companyId,
        address indexed employee,
        uint256 basePay,
        address token,
        PayCycle payCycle
    );
    event EmployeeUpdated(
        uint256 indexed companyId,
        address indexed employee,
        uint256 basePay,
        address token,
        PayCycle payCycle
    );
    event EmployeeDeactivated(uint256 indexed companyId, address indexed employee);
    event PayrollBatchCreated(
        uint256 indexed batchId,
        uint256 indexed companyId,
        uint256 period,
        address token,
        uint256 totalAmount,
        uint256 employeeCount
    );
    event PayrollExecuted(
        uint256 indexed batchId,
        uint256 indexed companyId,
        address token,
        uint256 totalAmount,
        uint256 employeeCount
    );
    event PaymentMade(
        uint256 indexed batchId,
        address indexed employee,
        uint256 amount,
        address token
    );

    // Modifiers
    modifier onlyCompanyOwner(uint256 companyId) {
        (address owner, , ) = companyRegistry.getCompany(companyId);
        require(owner == msg.sender, "Not company owner");
        _;
    }

    modifier validToken(address token) {
        require(token == USDC || token == EURC, "Invalid token");
        _;
    }

    /**
     * @notice Constructor
     * @param _companyRegistry Address of CompanyRegistry contract
     */
    constructor(address _companyRegistry) {
        require(_companyRegistry != address(0), "Invalid registry address");
        companyRegistry = CompanyRegistry(_companyRegistry);
    }

    /**
     * @notice Add an employee to a company
     * @param companyId The company ID
     * @param wallet Employee wallet address
     * @param basePay Salary amount in token's smallest unit
     * @param token USDC or EURC address
     * @param cycle Pay cycle (0=Monthly, 1=Weekly, 2=BiWeekly, 3=Quarterly)
     */
    function addEmployee(
        uint256 companyId,
        address wallet,
        uint256 basePay,
        address token,
        PayCycle cycle
    ) external onlyCompanyOwner(companyId) validToken(token) {
        require(wallet != address(0), "Invalid wallet address");
        require(basePay > 0, "Base pay must be greater than 0");

        companyEmployees[companyId].push(Employee({
            wallet: wallet,
            basePay: basePay,
            payToken: token,
            payCycle: cycle,
            active: true,
            addedAt: block.timestamp
        }));

        emit EmployeeAdded(companyId, wallet, basePay, token, cycle);
    }

    /**
     * @notice Update employee information
     * @param companyId The company ID
     * @param employeeIndex Index of employee in company's employee array
     * @param basePay New base pay amount
     * @param token New token address
     * @param cycle New pay cycle
     */
    function updateEmployee(
        uint256 companyId,
        uint256 employeeIndex,
        uint256 basePay,
        address token,
        PayCycle cycle
    ) external onlyCompanyOwner(companyId) validToken(token) {
        require(employeeIndex < companyEmployees[companyId].length, "Invalid employee index");
        require(basePay > 0, "Base pay must be greater than 0");

        Employee storage emp = companyEmployees[companyId][employeeIndex];
        emp.basePay = basePay;
        emp.payToken = token;
        emp.payCycle = cycle;

        emit EmployeeUpdated(companyId, emp.wallet, basePay, token, cycle);
    }

    /**
     * @notice Deactivate an employee
     * @param companyId The company ID
     * @param employeeIndex Index of employee in company's employee array
     */
    function deactivateEmployee(uint256 companyId, uint256 employeeIndex) 
        external 
        onlyCompanyOwner(companyId) 
    {
        require(employeeIndex < companyEmployees[companyId].length, "Invalid employee index");
        
        Employee storage emp = companyEmployees[companyId][employeeIndex];
        emp.active = false;

        emit EmployeeDeactivated(companyId, emp.wallet);
    }

    /**
     * @notice Create a payroll batch for a company
     * @param companyId The company ID
     * @param period Period identifier (e.g., timestamp or yyyymm format)
     * @param token Token to use for payment (USDC or EURC)
     * @return batchId The created batch ID
     */
    function createPayrollBatch(
        uint256 companyId,
        uint256 period,
        address token
    ) external onlyCompanyOwner(companyId) validToken(token) returns (uint256) {
        Employee[] memory employees = companyEmployees[companyId];
        require(employees.length > 0, "No employees found");

        uint256 totalAmount = 0;
        uint256 activeCount = 0;

        // Calculate total amount for active employees
        for (uint256 i = 0; i < employees.length; i++) {
            if (employees[i].active && employees[i].payToken == token) {
                totalAmount += employees[i].basePay;
                activeCount++;
            }
        }

        require(totalAmount > 0, "No active employees for this token");
        require(activeCount > 0, "No active employees");

        payrollBatchCount++;
        uint256 batchId = payrollBatchCount;

        payrollBatches[batchId] = PayrollBatch({
            companyId: companyId,
            period: period,
            token: token,
            totalAmount: totalAmount,
            executed: false,
            executedAt: 0,
            employeeCount: activeCount
        });

        // Create payment records for each active employee
        for (uint256 i = 0; i < employees.length; i++) {
            if (employees[i].active && employees[i].payToken == token) {
                PaymentRecord memory payment = PaymentRecord({
                    batchId: batchId,
                    employee: employees[i].wallet,
                    amount: employees[i].basePay,
                    token: token,
                    paid: false,
                    paidAt: 0
                });
                batchPayments[batchId].push(payment);
                employeePayments[employees[i].wallet].push(payment);
            }
        }

        emit PayrollBatchCreated(batchId, companyId, period, token, totalAmount, activeCount);
        return batchId;
    }

    /**
     * @notice Execute payroll batch - transfer tokens to employees
     * @param batchId The batch ID to execute
     */
    function executePayroll(uint256 batchId) external {
        PayrollBatch storage batch = payrollBatches[batchId];
        require(batch.totalAmount > 0, "Batch does not exist");
        require(!batch.executed, "Batch already executed");

        // Verify caller is company owner
        (address owner, , ) = companyRegistry.getCompany(batch.companyId);
        require(owner == msg.sender, "Not company owner");

        // Check company has sufficient balance and allowance
        IERC20 token = IERC20(batch.token);
        require(
            token.balanceOf(msg.sender) >= batch.totalAmount,
            "Insufficient token balance"
        );
        require(
            token.allowance(msg.sender, address(this)) >= batch.totalAmount,
            "Insufficient token allowance. Please approve first."
        );

        // Execute payments
        PaymentRecord[] storage payments = batchPayments[batchId];
        uint256 successCount = 0;

        for (uint256 i = 0; i < payments.length; i++) {
            PaymentRecord storage payment = payments[i];
            
            if (!payment.paid) {
                bool success = token.transferFrom(
                    msg.sender,
                    payment.employee,
                    payment.amount
                );
                
                if (success) {
                    payment.paid = true;
                    payment.paidAt = block.timestamp;
                    successCount++;
                    emit PaymentMade(batchId, payment.employee, payment.amount, payment.token);
                }
            }
        }

        require(successCount > 0, "No payments succeeded");

        // Mark batch as executed
        batch.executed = true;
        batch.executedAt = block.timestamp;

        emit PayrollExecuted(batchId, batch.companyId, batch.token, batch.totalAmount, successCount);
    }

    /**
     * @notice Get employee count for a company
     * @param companyId The company ID
     * @return count Total employee count
     * @return activeCount Active employee count
     */
    function getEmployeeCount(uint256 companyId) 
        external 
        view 
        returns (uint256 count, uint256 activeCount) 
    {
        Employee[] memory employees = companyEmployees[companyId];
        count = employees.length;
        
        for (uint256 i = 0; i < employees.length; i++) {
            if (employees[i].active) {
                activeCount++;
            }
        }
    }

    /**
     * @notice Get all employees for a company
     * @param companyId The company ID
     * @return employees Array of Employee structs
     */
    function getCompanyEmployees(uint256 companyId) 
        external 
        view 
        returns (Employee[] memory) 
    {
        return companyEmployees[companyId];
    }

    /**
     * @notice Get payment records for an employee
     * @param employeeAddress Employee wallet address
     * @return payments Array of PaymentRecord structs
     */
    function getEmployeePayments(address employeeAddress) 
        external 
        view 
        returns (PaymentRecord[] memory) 
    {
        return employeePayments[employeeAddress];
    }

    /**
     * @notice Get payment records for a batch
     * @param batchId The batch ID
     * @return payments Array of PaymentRecord structs
     */
    function getBatchPayments(uint256 batchId) 
        external 
        view 
        returns (PaymentRecord[] memory) 
    {
        return batchPayments[batchId];
    }
}


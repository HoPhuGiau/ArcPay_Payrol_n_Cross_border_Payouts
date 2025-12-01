// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Script.sol";
import "../CompanyRegistry.sol";
import "../PayrollManager.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy CompanyRegistry
        CompanyRegistry registry = new CompanyRegistry();
        console.log("CompanyRegistry deployed at:", address(registry));

        // Deploy PayrollManager
        PayrollManager payroll = new PayrollManager(address(registry));
        console.log("PayrollManager deployed at:", address(payroll));

        vm.stopBroadcast();
    }
}


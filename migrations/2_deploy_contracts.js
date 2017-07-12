var ServiceCustomer = artifacts.require("./ServiceCustomer.sol");

module.exports = function(deployer) {
  deployer.deploy(ServiceCustomer);
};

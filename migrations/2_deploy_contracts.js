//whenever you deploy new contracts to blockchain you change its state
//number 2 as it runs second after the intial migration

//create abstractions all contracts that truffle understands to put on the blockchain
const Doctor = artifacts.require("./Doctor.sol");
const HealthCare = artifacts.require("./HealthCare.sol");
const Manager = artifacts.require("./Manager.sol");
const Patient = artifacts.require("./Patient.sol");

//deploy to blockchain - uses ether (gas) truffle by default uses the first account
module.exports = function(deployer) {
  deployer.deploy(Doctor);
  deployer.deploy(HealthCare);
  deployer.deploy(Manager);
  deployer.deploy(Patient);
};

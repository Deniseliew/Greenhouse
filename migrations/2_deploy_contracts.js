const GreenHouseContract = artifacts.require("GreenHouseContract");

module.exports = function (deployer) {
  deployer.deploy(GreenHouseContract);
};

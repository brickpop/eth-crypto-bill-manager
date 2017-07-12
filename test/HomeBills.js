var ServiceCustomer = artifacts.require("./ServiceCustomer.sol");

// accounts[0 - 4] => Customers
// accounts[5 - 9] => Providers

contract('ServiceCustomer', function(accounts) {
  
  it("should start with inactive subscriptions", function() {
    var instance;
    return ServiceCustomer.deployed().then(function(inst) {
      instance = inst;
      return Promise.all([
        instance.getDebt.call(accounts[0], accounts[5]),
        instance.getDebt.call(accounts[0], accounts[6]),
        instance.getDebt.call(accounts[0], accounts[7]),
        instance.getDebt.call(accounts[0], accounts[8]),
        instance.getDebt.call(accounts[0], accounts[9]),
        instance.getDebt.call(accounts[1], accounts[5]),
        instance.getDebt.call(accounts[1], accounts[6]),
        instance.getDebt.call(accounts[1], accounts[7]),
        instance.getDebt.call(accounts[1], accounts[8]),
        instance.getDebt.call(accounts[1], accounts[9]),
        instance.getDebt.call(accounts[2], accounts[5]),
        instance.getDebt.call(accounts[2], accounts[6]),
        instance.getDebt.call(accounts[2], accounts[7]),
        instance.getDebt.call(accounts[2], accounts[8]),
        instance.getDebt.call(accounts[2], accounts[9]),
        instance.getDebt.call(accounts[3], accounts[5]),
        instance.getDebt.call(accounts[3], accounts[6]),
        instance.getDebt.call(accounts[3], accounts[7]),
        instance.getDebt.call(accounts[3], accounts[8]),
        instance.getDebt.call(accounts[3], accounts[9]),
        instance.getDebt.call(accounts[4], accounts[5]),
        instance.getDebt.call(accounts[4], accounts[6]),
        instance.getDebt.call(accounts[4], accounts[7]),
        instance.getDebt.call(accounts[4], accounts[8]),
        instance.getDebt.call(accounts[4], accounts[9]),
      ]);
    }).then(function(debts) {
      debts.forEach(function(debt){
        assert.equal(debt.valueOf(), 0, "0 wasn't the initial debt")
      });
    });
  });

  it("should subscribe a user to a provider", function() {
    var instance;
    return ServiceCustomer.deployed().then(function(inst) {
      instance = inst;
      return instance.signUp(accounts[5], {from: accounts[0]});
    }).then(function() {
      return instance.getDebt.call(accounts[0], accounts[5]);
    }).then(function(debt) {
      assert.equal(debt.valueOf(), 0, "0 wasn't the initial debt")
    });
  });

  it("should let a provider charge a customer", function() {
    var instance;
    return ServiceCustomer.deployed().then(function(inst) {
      instance = inst;
      return instance.charge(accounts[0], 1000000000000000000, {from: accounts[5]});
    }).then(function() {
      return instance.getDebt.call(accounts[0], accounts[5], {from: accounts[0]});
    }).then(function(debt) {
      assert.equal(debt.valueOf(), 1000000000000000000, "1000000000000000000 wasn't the debt")
      return instance.getDebt.call(accounts[0], accounts[5], {from: accounts[5]});
    }).then(function(debt) {
      assert.equal(debt.valueOf(), 1000000000000000000, "1000000000000000000 wasn't the debt")
    });
  });

  it("should not allow to subscribe to oneself", function() {
    var instance;
    return ServiceCustomer.deployed().then(function(inst) {
      instance = inst;
      return instance.signUp(accounts[0], {from: accounts[0]});
    }).then(function(returnValue) {
      assert(false, "signUp was supposed to fail but didn't.");
    }).catch(function(error) {
      assert(error.toString().indexOf("invalid opcode") > 0, error.toString());
    });
  });

  it("should let a provider increase the debt of a customer", function() {
    var instance;
    return ServiceCustomer.deployed().then(function(inst) {
      instance = inst;
      return instance.charge(accounts[0], 1000000000000000000, {from: accounts[5]});
    }).then(function() {
      return instance.getDebt.call(accounts[0], accounts[5], {from: accounts[0]});
    }).then(function(debt) {
      assert.equal(debt.valueOf(), 2000000000000000000, "2000000000000000000 wasn't the debt")
    });
  });

  it("should not operate if a customer is not subscribed to a provider", function() {
    var instance;
    return ServiceCustomer.deployed().then(function(inst) {
      instance = inst;
      return instance.charge(accounts[4], 1000000000000000000, {from: accounts[8]});
    }).then(function(returnValue) {
      assert(false, "charge was supposed to fail but didn't.");
    }).catch(function(error) {
      assert(error.toString().indexOf("invalid opcode") > 0, error.toString());
    });
  });

  it("should fail if not enough money is transfered to pay a debt", function() {
    var instance;
    return ServiceCustomer.deployed().then(function(inst) {
      instance = inst;
      return instance.payDebt(accounts[5], {from: accounts[0], value: 0});
    }).then(function(returnValue) {
      assert(false, "payDebt was supposed to fail but didn't.");
    }).catch(function(error) {
      assert(error.toString().indexOf("invalid opcode") > 0, error.toString());
    });
  });

  it("should allow to pay a debt", function() {
    var instance;
    return ServiceCustomer.deployed().then(function(inst) {
      instance = inst;
      return instance.getDebt.call(accounts[0], accounts[5], {from: accounts[0]});
    }).then(function(debt) {
      assert.equal(debt.valueOf(), 2000000000000000000, "2000000000000000000 wasn't the debt")
      
      return instance.payDebt(accounts[5], {from: accounts[0], value: debt.valueOf()});
    }).then(function(debt) {
      return instance.getDebt.call(accounts[0], accounts[5], {from: accounts[0]});
    }).then(function(debt) {
      assert.equal(debt.valueOf(), 0, "0 wasn't the debt")
    });
  });

  it("should not allow to unsubscribe if there is still debt", function() {
    var instance;
    return ServiceCustomer.deployed().then(function(inst) {
      instance = inst;
      return instance.charge(accounts[0], 1000000000000000000, {from: accounts[5]});
    }).then(function() {
      return instance.getDebt.call(accounts[0], accounts[5], {from: accounts[0]});
    }).then(function(debt) {
      assert.equal(debt.valueOf(), 1000000000000000000, "1000000000000000000 wasn't the debt")
      return instance.unsubscribe(accounts[5], {from: accounts[0]});
    }).then(function(returnValue) {
      assert(false, "unsubscribe was supposed to fail but didn't.");
    }).catch(function(error) {
      assert(error.toString().indexOf("invalid opcode") > 0, error.toString());
    });
  });

  it("should not allow to subscribe to an already active service", function() {
    var instance;
    return ServiceCustomer.deployed().then(function(inst) {
      instance = inst;
      return instance.signUp(accounts[5], {from: accounts[0]});
    }).then(function(){
      return instance.charge(accounts[0], 1000000000000000000, {from: accounts[5]});
    }).then(function() {
      return instance.getDebt.call(accounts[0], accounts[5], {from: accounts[0]});
    }).then(function(debt) {
      assert.equal(debt.valueOf(), 1000000000000000000, "1000000000000000000 wasn't the debt")
      return instance.signUp(accounts[5], {from: accounts[0]});
    }).then(function(returnValue) {
      assert(false, "signUp was supposed to fail but didn't.");
    }).catch(function(error) {
      assert(error.toString().indexOf("invalid opcode") > 0, error.toString());
    }).then(function() {
      return instance.getDebt.call(accounts[0], accounts[5], {from: accounts[0]});
    }).then(function(debt) {
      assert.equal(debt.valueOf(), 1000000000000000000, "1000000000000000000 wasn't the debt")
    });
  });

  it("only the owner should be able to kill the contract", function() {
    var instance;
    return ServiceCustomer.deployed().then(function(inst) {
      instance = inst;
      return Promise.all([
        instance.kill({from: accounts[1]}),
        instance.kill({from: accounts[2]}),
        instance.kill({from: accounts[3]}),
        instance.kill({from: accounts[4]}),
      ]);
    }).then(function(returnValue) {
      assert(false, "kill was supposed to fail but didn't.");
    }).catch(function(error) {
      assert(error.toString().indexOf("invalid opcode") > 0, error.toString());
    }).then(function() {
      return instance.getDebt.call(accounts[0], accounts[5], {from: accounts[0]});
    }).then(function(debt) {
      assert.equal(debt.valueOf(), 1000000000000000000, "The contract should still be alive")
      
      return instance.kill({from: accounts[0]});
    }).then(function() {
      return instance.getDebt.call(accounts[0], accounts[5], {from: accounts[0]});
    }).then(function(debt) {
      assert.equal(debt.valueOf(), 0, "The contract should have been killed")
    });
  });

});

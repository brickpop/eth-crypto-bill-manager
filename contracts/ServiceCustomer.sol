pragma solidity ^0.4.11;

contract owned {
  address owner;
  function owned() {
		owner = msg.sender;
	}

  modifier ownerOnly {
		if (msg.sender == owner) _ ;
		else throw;
	}
}

contract mortal is owned {
  function kill() ownerOnly {
    suicide(owner);
  }
}

contract priced {
  modifier costs(uint price) {
		if (msg.value >= price) _ ;
		else throw;
	}
}


contract ServiceCustomer is owned, mortal, priced {
	struct Service {
		bool active;
		uint256 debt;
	}

	// @customer => @svcProvider => subscription info
	mapping(address => mapping(address => Service)) private customers;

	function ServiceCustomer() {
	}

	// A customer subscribes to a provider
	function signUp(address _provider) {
		address _customer = msg.sender;
		if(customers[_customer][_provider].active) throw;
		else if(_provider == msg.sender) throw;
		
		customers[_customer][_provider] = Service({
			active: true,
			debt: 0
		});
	}

	// A provider with an active customer subscription registers a new debt
	function charge(address _customer, uint256 _amount) {
		address _provider = msg.sender;
		if(!customers[_customer][_provider].active) throw;

		customers[_customer][_provider].debt += _amount;
	}

	// Either the customer or the provider retrieve a corresponding debt
	function getDebt(address _customer, address _provider) constant returns (uint256 _debt) {
		if(msg.sender != _customer && msg.sender != _provider) _debt = 0;
		else _debt = customers[_customer][_provider].debt;
	}

	// The customer sends ether to pay the debt for a service
	function payDebt(address _provider) payable costs(customers[msg.sender][_provider].debt) {
		address _customer = msg.sender;
		if(customers[_customer][_provider].debt == 0) return;

		_provider.transfer(msg.value); // forward the money to the provider
		customers[_customer][_provider].debt = 0;
	}

	// If there is no debt, a customer unsubscribes from a service
	function unsubscribe(address _provider){
		address _customer = msg.sender;
		if(customers[_customer][_provider].debt > 0) throw;
		
		customers[_customer][_provider].active = false;
	}
}

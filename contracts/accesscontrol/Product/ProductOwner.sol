pragma solidity ^0.5.0;

import "../Roles.sol";

contract ProductOwner {
    using Roles for Roles.Role;

    event ProductOwnerAdded(address _address);
    event ProductOwnerRemoved(address _address);

    Roles.Role private productOwners;

    constructor() public {
        _addProductOwner(msg.sender);
    }

    modifier onlyProductOwner() {
        require(isProductOwner(msg.sender));
        _;
    }

    function isProductOwner(address _address) public view returns (bool) {
        return productOwners.has(_address);
    }

    function addProductOwner(address _address) public onlyProductOwner {
        _addProductOwner(_address);
    }

    function renounceProductOwner() public {
        _removeProductOwner(msg.sender);
    }

    function _addProductOwner(address _address) internal {
        productOwners.add(_address);
        emit ProductOwnerAdded(_address);
    }

    function _removeProductOwner(address _address) internal {
        productOwners.remove(_address);
        emit ProductOwnerRemoved(_address);
    }
}
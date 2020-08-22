pragma solidity ^0.5.0;

import "../Roles.sol";

contract RawprodctOwner {
    using Roles for Roles.Role;

    event RawprodctOwnerAdded(address _address);
    event RawprodctOwnerRemoved(address _address);

    Roles.Role private rawprodctOwners;

    constructor() public {
        _addRawprodctOwner(msg.sender);
    }

    modifier onlyRawprodctOwner() {
        require(isRawprodctOwner(msg.sender));
        _;
    }

    function isRawprodctOwner(address _address) public view returns (bool) {
        return rawprodctOwners.has(_address);
    }

    function addRawprodctOwner(address _address) public onlyRawprodctOwner {
        _addRawprodctOwner(_address);
    }

    function renounceRawprodctOwner() public {
        _removeRawprodctOwner(msg.sender);
    }

    function _addRawprodctOwner(address _address) internal {
        rawprodctOwners.add(_address);
        emit RawprodctOwnerAdded(_address);
    }

    function _removeRawprodctOwner(address _address) internal {
        rawprodctOwners.remove(_address);
        emit RawprodctOwnerRemoved(_address);
    }
}
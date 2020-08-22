pragma solidity ^0.5.0;


import "../Roles.sol";

contract ProductBuyer {
    using Roles for Roles.Role;

    event ProductBuyerAdded(address _address);
    event ProductBuyerRemoved(address _address);

    Roles.Role private productBuyers;

    constructor() public {
        _addProductBuyer(msg.sender);
    }

    modifier onlyProductBuyer() {
        require(isProductBuyer(msg.sender));
        _;
    }

    function isProductBuyer(address _address) public view returns (bool) {
        return productBuyers.has(_address);
    }

    function addProductBuyer(address _address) public onlyProductBuyer {
        _addProductBuyer(_address);
    }

    function renounceProductBuyer() public {
        _removeProductBuyer(msg.sender);
    }

    function _addProductBuyer(address _address) internal {
        productBuyers.add(_address);
        emit ProductBuyerAdded(_address);
    }

    function _removeProductBuyer(address _address) internal {
        productBuyers.remove(_address);
        emit ProductBuyerRemoved(_address);
    }
}
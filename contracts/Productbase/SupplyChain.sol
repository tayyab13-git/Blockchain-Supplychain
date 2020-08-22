pragma solidity ^0.5.0;

contract SupplyChain {
    address contractOwner;
    uint lastrawprodctId;
    uint lastProductUpc;
    uint lastProductSku;
    uint lastFarmId;

    struct Location {
        string longitude;
        string latitude;
        string name;
    }

    struct Farm {
        uint farmId;
        string name;
        address payable owner;
        string description;
        Location location;
    }
    mapping (uint => Farm) farms;
    event FarmRegistered(uint farmId);

    enum RawprodctState {Harvested, Packed, forsaled}
    struct Rawprodct {
        uint rawprodctId;
        string name;
        uint vintageYear;
        address payable owner;
        string notes;
        RawprodctState state;
        Farm farm;
    }
    mapping (uint => Rawprodct) rawprodcts;
    event RawprodctHarvested(uint rawprodctId);
    event RawprodctPacked(uint rawprodctId);
        event RawprodctforSaled(uint rawprodctId);

    enum ProductState {Owned, ForSale, Sold, Shipped, Consumed}
    struct Product {
        uint upc;
        uint sku;
        uint productId;
        Rawprodct rawprodct;
        uint price;
        ProductState state;
        address payable buyer;
        address payable owner;
    }
    mapping (uint => Product) products;
    event ProductOwned(uint upc);
    event ProductForSale(uint upc);
    event ProductSold(uint upc);
    event ProductShipped(uint upc);
    event ProductConsumed(uint upc);

    modifier verifyCallerIs(address _address){
        require(msg.sender == _address, "Current caller can not invoke this operation.");
        _;
    }

    modifier verifyCallerIsNot(address _address) {
        require(msg.sender != _address, "Current caller can not invoke this operation.");
        _;
    }

    modifier farmExists(uint _farmId) {
        require(farms[_farmId].farmId > 0, "Farm with this id does not exist.");
        _;
    }

    modifier rawprodctExists(uint _rawprodctId) {
        require(rawprodcts[_rawprodctId].rawprodctId > 0, "RawProduct with this id does not exist.");
        _;
    }

    modifier verifyRawprodctState(uint _rawprodctId, RawprodctState _state) {
        require(rawprodcts[_rawprodctId].state == _state, "Current rawProducts state forbids this operation.");
        _;
    }

    modifier productExists(uint _upc) {
        require(products[_upc].upc > 0, "Product with given UPC does not exist.");
        _;
    }

    modifier verifyProductState(uint _upc, ProductState _state) {
        require(products[_upc].state == _state, "Current product state forbids this operation");
        _;
    }

    modifier priceNotZero(uint _price) {
        require(_price > 0, "Price can not be zero.");
        _;
    }

    modifier isPaidEnough(uint _price) {
        require(msg.value >= _price, "Bid price must be more or equal to product's price");
        _;
    }

    modifier returnChangeForExcess(uint _upc) {
        _;
        uint _price = products[_upc].price;
        uint change = msg.value - _price;
        products[_upc].buyer.transfer(change);
    }

    constructor() public {
        contractOwner = msg.sender;
        lastrawprodctId = 0;
        lastProductUpc = 0;
        lastFarmId = 0;
    }

    function registerFarm(string memory _farmName, string memory _locationName, string memory _locationLong, string memory _locationLat, string memory _farmDescription) public
    {
        lastFarmId = lastFarmId + 1;
        Location memory location = Location({name: _locationName, longitude: _locationLong, latitude: _locationLat});
        farms[lastFarmId] = Farm(
            {farmId: lastFarmId,
            name: _farmName,
            location: location,
            owner: msg.sender,
            description: _farmDescription});
        emit FarmRegistered(lastFarmId);
    }
    function getFarm(uint _farmId) public view
    farmExists(_farmId)
    returns (uint farmId, string memory name, string memory locationName, string memory longitude, string memory latitude, address owner, string memory description)
    {
        farmId = farms[_farmId].farmId;
        name = farms[_farmId].name;
        locationName = farms[_farmId].location.name;
        longitude = farms[_farmId].location.longitude;
        latitude = farms[_farmId].location.latitude;
        owner = farms[_farmId].owner;
        description = farms[_farmId].description;
    }


    function harvestRawprodct(string memory _name, uint _vintageYear, string memory _notes, uint _farmId) public
    verifyCallerIs(farms[_farmId].owner) {
        lastrawprodctId = lastrawprodctId + 1;
        rawprodcts[lastrawprodctId] = Rawprodct(
            {rawprodctId: lastrawprodctId,
            name: _name,
            vintageYear: _vintageYear,
            owner: msg.sender,
            notes: _notes,
            state: RawprodctState.Harvested,
            farm: farms[_farmId]});
        emit RawprodctHarvested(lastrawprodctId);
    }

    function packRawprodct(uint _rawprodctId) public
    rawprodctExists(_rawprodctId)
    verifyRawprodctState(_rawprodctId, RawprodctState.Harvested)
    verifyCallerIs(rawprodcts[_rawprodctId].owner) {
        rawprodcts[_rawprodctId].state = RawprodctState.Packed;
        emit RawprodctPacked(_rawprodctId);
    }

    function forsaleRawprodct(uint _rawprodctId) public
    rawprodctExists(_rawprodctId)
    verifyRawprodctState(_rawprodctId, RawprodctState.Packed)
    verifyCallerIs(rawprodcts[_rawprodctId].owner) {
        rawprodcts[_rawprodctId].state = RawprodctState.forsaled;
        emit RawprodctforSaled(_rawprodctId);
    }

    function getRawprodct(uint _rawprodctId) public view
    rawprodctExists(_rawprodctId)
    returns (uint rawprodctId, string memory name, uint vintageYear, string memory state, string memory notes, uint farmId, address owner){
        rawprodctId = _rawprodctId;
        name = rawprodcts[_rawprodctId].name;
        vintageYear = rawprodcts[_rawprodctId].vintageYear;
        farmId = rawprodcts[_rawprodctId].farm.farmId;
        notes = rawprodcts[_rawprodctId].notes;
        owner = rawprodcts[_rawprodctId].owner;

        if(uint(rawprodcts[_rawprodctId].state) == 0) {
            state = "Harvested";
        }
        if(uint(rawprodcts[_rawprodctId].state) == 1) {
            state = "Packed";
        }
        if(uint(rawprodcts[_rawprodctId].state) == 2) {
            state = "forsale";
        }
    }


    function createProduct(uint _rawprodctId) public
    rawprodctExists(_rawprodctId)
    verifyRawprodctState(_rawprodctId, RawprodctState.forsaled)
    verifyCallerIs(rawprodcts[_rawprodctId].owner)   {
        lastProductUpc = lastProductUpc + 1;
        lastProductSku = lastProductSku + 1;
        products[lastProductUpc] = Product(
            {rawprodct: rawprodcts[_rawprodctId],
            upc: lastProductUpc,
            sku: lastProductSku,
            productId: lastProductSku + lastProductUpc,
            price: 0,
            state: ProductState.Owned,
            owner: msg.sender,
            buyer: address(0)}
        );
        emit ProductOwned(products[lastProductUpc].upc);
    }

    function addProductForSale(uint _upc, uint _price) public
    productExists(_upc)
    verifyProductState(_upc, ProductState.Owned)
    priceNotZero(_price)
    verifyCallerIs(products[_upc].owner)  {
        products[_upc].price = _price;
        products[_upc].state = ProductState.ForSale;
        emit ProductForSale(_upc);
    }

    function buyProduct(uint _upc) public payable
    productExists(_upc)
    verifyProductState(_upc, ProductState.ForSale)
    verifyCallerIsNot(products[_upc].owner)
    isPaidEnough(products[_upc].price)
    returnChangeForExcess(_upc) {
        products[_upc].buyer = msg.sender;
        products[_upc].state = ProductState.Sold;
        products[_upc].owner.transfer(products[_upc].price);
        emit ProductSold(_upc);
    }

    function shipProduct(uint _upc) public
    productExists(_upc)
    verifyProductState(_upc, ProductState.Sold)
    verifyCallerIs(products[_upc].owner) {
        products[_upc].state = ProductState.Shipped;
        emit ProductShipped(_upc);
    }

    function receiveProduct(uint _upc) public
    productExists(_upc)
    verifyProductState(_upc, ProductState.Shipped)
    verifyCallerIs(products[_upc].buyer) {
        products[_upc].owner = products[_upc].buyer;
        products[_upc].buyer = address(0);
        products[_upc].state = ProductState.Owned;
        emit ProductOwned(_upc);
    }

    function consumeProduct(uint _upc) public
    productExists(_upc)
    verifyProductState(_upc, ProductState.Owned)
    verifyCallerIs(products[_upc].owner) {
        products[_upc].state = ProductState.Consumed;
        emit ProductConsumed(_upc);
    }

    function getProduct(uint _upc) public view
    productExists(_upc)
    returns (uint upc, uint sku, uint productId, uint price, address owner, address buyer, string memory state, uint rawprodctId) {
        upc = _upc;
        sku = products[_upc].sku;
        productId = products[_upc].productId;
        price = products[_upc].price;
        owner = products[_upc].owner;
        buyer = products[_upc].buyer;
        rawprodctId = products[_upc].rawprodct.rawprodctId;

        if(uint(products[_upc].state) == 0) {
            state = "Owned";
        }
        if(uint(products[_upc].state) == 1) {
            state = "For Sale";
        }
        if(uint(products[_upc].state) == 2) {
            state = "Sold";
        }
        if(uint(products[_upc].state) == 3) {
            state = "Shipped";
        }
        if(uint(products[_upc].state) == 4) {
            state = "Consumed";
        }
    }
}
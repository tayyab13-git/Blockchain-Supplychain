var App = {
    web3Provider: null,
    contracts: {},
    rawprodct: {
        name: "",
        vintageYear: 0,
        notes: "",
        owner: "0x0000000000000000000000000000000000000000",
        farmId: 0
    },
    product: {
        sku: 0,
        upc: 0,
        rawprodctId: 0,
        owner: "0x0000000000000000000000000000000000000000",
        buyer: "0x0000000000000000000000000000000000000000",
        price: 0

    },
    metamaskAccountID: "0x0000000000000000000000000000000000000000",
    contractAddressAtRinkeby: "0xBA4624e4eaeCBa37F6625e5718d7db8aD27c6E67",
    contractAddressAtLocalNetwork: "0x354b554dd3481169471f2762Dba66416522520e3",

    init: async function () {
        /// Setup access to blockchain
        return await App.initWeb3();
    },

    readFarmForm: function () {
        return {
            name: $("#farm-name").val(),
            owner: $("#farm-owner").val(),
            description: $("#farm-description").val(),
            location: {
                name: $("#farm-location-name").val(),
                longitude: $("#farm-location-longitude").val(),
                latitude: $("#farm-location-latitude").val()
            }
        };
    },

    readGetFarmForm: function(){
        return $("#farm-id").val();
    },

    readRawprodctForm: function () {
        return {
            name: $("#rawprodct-name").val(),
            vintageYear: $("#rawprodct-vintageYear").val(),
            notes: $("#rawprodct-notes").val(),
            farmId: $("#rawprodct-farmId").val()
        };
    },

    readGetRawprodctForm: function(){
        return $("#rawprodct-id").val();
    },

    readCreateProductForm: function () {
        return {
            rawprodctId: $("#product-rawprodctId").val(),
        };
    },

    readGetProductForOwnerForm: function(){
        return $("#owner-search-product-upc").val();
    },

    readGetProductForBuyerForm: function(){
        return $("#buyer-search-product-upc").val();
    },

    readSellProductForm: function(){
        return {
            upc: $("#owner-sell-product-upc").val(),
            price: $("#owner-sell-product-price").val()
        }
    },

    readBuyProductForm: function(){
        return {
            upc: $("#buyer-buy-product-upc").val(),
            bid: $("#buyer-bid").val()
        }
    },

    readReceiveProductForm: function(){
        return{
            upc: $("#buyer-receive-product-upc").val()
        }
    },

    readManageProductForm: function(){
        return {
            upc: $("#owner-manage-product-upc").val()
        }
    },

    initWeb3: async function () {
        
        
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
                
                await window.ethereum.enable();
            } catch (error) {
                
                console.error("User denied account access")
            }
        }
        
        else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
        }
        
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
        }
        App.web3 = new Web3(App.web3Provider);
        App.getMetaskAccountID();

        return App.initSupplyChain();
    },

    getMetaskAccountID: function () {
        App.web3.eth.getAccounts(function(err, res) {
            if (err) {
                console.log('Error:',err);
                return;
            }
            console.log('getMetaskID:',res);
            App.metamaskAccountID = res[0];
        })
    },

    initSupplyChain: function () {
        
        var jsonSupplyChain='./build/contracts/SupplyChain.json';

        
        $.getJSON(jsonSupplyChain, function(data) {
            // console.log('data',data);
            var SupplyChainArtifact = data;
            App.contracts.SupplyChain = TruffleContract(SupplyChainArtifact);
            App.contracts.SupplyChain.setProvider(App.web3Provider);
            console.log(App.web3.version);
            if(App.web3.version.network === "4") {
                console.log("Rinkeby network detected");
                App.contracts.SupplyChain.at(App.contractAddressAtRinkeby);
            } else {
                console.log("Local network detected");
                App.contracts.SupplyChain.at(App.contractAddressAtLocalNetwork);
            }
            App.fetchEvents();
        });
        return App.bindEvents();
    },

    bindEvents: function() {
        $(document).on('click', App.handleButtonClick);
    },

    handleButtonClick: async function(event) {
        event.preventDefault();

        App.getMetaskAccountID();

        var processId = parseInt($(event.target).data('id'));
        console.log('processId',processId);

        switch(processId) {
            case 1:
                return await App.registerFarm(event);
                break;
            case 2:
                return await App.getFarm(event);
                break;
            case 3:
                return await App.harvestRawprodct(event);
                break;
            case 4:
                return await App.packRawprodct(event);
                break;
            case 5:
                return await App.forsaleRawprodct(event);
                break;
            case 6:
                return await App.getRawprodct(event);
                break;
            case 7:
                return await App.createProduct(event);
                break;
            case 8:
                return await App.addProductForSale(event);
                break;
            case 9:
                return await App.buyProduct(event);
                break;
            case 10:
                return await App.shipProduct(event);
                break;
            case 11:
                return await App.receiveProduct(event);
                break;
            case 12:
                return await App.consumeProduct(event);
                break;
            case 13:
                return await App.getProductForOwner(event);
                break;
            case 14:
                return await App.getProductForBuyer(event);
                break;
        }
    },

    showStatusMessage: function(elementId, messageType, messageText, secondsToShow) {
        let statusClass;
        switch (messageType) {
            case "success":
                statusClass = "success";
                break;
            case "warning":
                statusClass = "warning";
                break;
            case "error":
                statusClass = "error";
                break;
            default:
                statusClass = "";
        }
        $(elementId).show();
        $(elementId).addClass(statusClass);
        $(elementId).text(messageText);
        setTimeout(()=>{
            $(elementId).text("");
            $(elementId).removeClass(statusClass);
            $(elementId).hide();
        }, secondsToShow * 1000);

    },

    clearElement: function(elementId) {
        $(elementId).empty();
    },

    displayObjectDetails: function(elementId, objectType, objValues) {
        let objLabels;
        switch (objectType) {
            case "farm":
                objLabels = [
                    "Id",
                    "Name",
                    "Location Name",
                    "Location Latitude",
                    "Location Longitude",
                    "Owner Address",
                    "Description"];
                break;
            case "rawprodct":
                objLabels = [
                    "Id",
                    "Name",
                    "Vintage Year",
                    "Status",
                    "Notes",
                    "Farm Id",
                    "Owner Address",
                ];
                break;
            case "product":
                objLabels = [
                    "UPC",
                    "SKU",
                    "Product Id",
                    "Price",
                    "Owner Address",
                    "Buyer Address",
                    "State",
                    "rawprodct Id"
                ];
                break;
            default:
                throw new Error(`Can not display: Unsupported object type - ${objectType}`);
        }
        App.clearElement(elementId);
        let iter = objValues.values();
        let i = 0;
        let currentObjectValue = iter.next();
        let value;
        while(!currentObjectValue.done) {
        
            if(currentObjectValue.value.c) {
                value = currentObjectValue.value.toNumber();
            } else {
                value = currentObjectValue.value;
            }
            $(elementId).append(App.createPropertyDisplay(objectType, objLabels[i], value));
            i++;
            currentObjectValue = iter.next();
        }
    },

    createPropertyDisplay: function(objType, objLabel, objValue) {
        let elementId = `${objType}-${objLabel.toLowerCase().replace(" ", "-")}`;
        let propertyDisplayLabel = $(`<div class="label">${objLabel}</div>`);
        let propertyDisplayValue = $(`<div class="value" id="${elementId}">${objValue}</div>`);

        switch (objType) {
            case "product":
                switch (objLabel) {
                    case "Owner Address":
                        if(objValue === App.metamaskAccountID){
                            let isOwnerTag = $(`<span class="tag">Yours</span>`);
                            propertyDisplayValue.append(isOwnerTag);
                        }
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }
        return propertyDisplayLabel.add(propertyDisplayValue);
    },

    registerFarm: function(event){
        event.preventDefault();

        let farm = App.readFarmForm();
        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.registerFarm(
                farm.name,
                farm.location.name,
                farm.location.longitude,
                farm.location.latitude,
                farm.description,
                {from: App.metamaskAccountID}
            );
        }).then(function(result) {
            App.showStatusMessage(
                "#farm-register-status",
                "success",
                `Success. Id of new farm is ${result.logs[0].args.farmId.toNumber()}`,
                5
            );
            console.log('registerFarm',result);
        }).catch(function(err) {
            App.showStatusMessage(
                "#farm-register-status",
                "error",
                `Failure. ${err.message}`,
                5
            );
            console.log(err);
        });
    },

    getFarm: async function(event){
        event.preventDefault();
        let farmId = App.readGetFarmForm();
        try {
            let deploied = await App.contracts.SupplyChain.deployed();
            let farm = await deploied.getFarm(farmId);
            App.displayObjectDetails("#farm-details", "farm", farm);
        } catch(e){
            App.clearElement("#farm-details");
            App.showStatusMessage("#farm-search-status", "error", `Failure. ${e.message}`, 5);
        }
    },

    harvestRawprodct: async function(event) {
        event.preventDefault();
        let rawprodct = App.readRawprodctForm();
        try {
            let deploied = await App.contracts.SupplyChain.deployed();
            let result = await deploied.harvestRawprodct(
                rawprodct.name,
                rawprodct.vintageYear,
                rawprodct.notes,
                rawprodct.farmId
            );
            App.showStatusMessage(
                "#rawprodct-register-status",
                "success",
                `Success. Id of new rawprodct is ${result.logs[0].args.rawprodctId.toNumber()}`,
                5
            );
        } catch (e) {
            App.showStatusMessage(
                "#rawprodct-register-status",
                "error",
                `Failure. ${e.message}`,
                5
            );
            console.log(e);
        }
    },

    packRawprodct: async function(event) {
        event.preventDefault();
        let rawprodctId = App.readGetRawprodctForm();
        try {
            let deploied = await App.contracts.SupplyChain.deployed();
            await deploied.packRawprodct(rawprodctId);
            App.showStatusMessage(
                "#rawprodct-update-status",
                "success",
                `Success. rawprodct with id = ${rawprodctId} is now Packed`,
                5
            );
        } catch (e) {
            App.showStatusMessage(
                "#rawprodct-update-status",
                "error",
                `Failure. ${e.message}`,
                5
            );
            console.log(e);
        }
    },

    forsaleRawprodct: async function(event){
        event.preventDefault();
        let rawprodctId = App.readGetRawprodctForm();
        try {
            let deploied = await App.contracts.SupplyChain.deployed();
            await deploied.forsaleRawprodct(rawprodctId);
            App.showStatusMessage(
                "#rawprodct-update-status",
                "success",
                `Success. rawprodct with id = ${rawprodctId} is now forsale`,
                5
            );
        } catch (e) {
            App.showStatusMessage(
                "#rawprodct-update-status",
                "error",
                `Failure. ${e.message}`,
                5
            );
            console.log(e);
        }
    },

    getRawprodct: async function(event){
        if(event) event.preventDefault();
        let rawprodctId = App.readGetRawprodctForm();
        try {
            let deploied = await App.contracts.SupplyChain.deployed();
            let rawprodct = await deploied.getRawprodct(rawprodctId);
            let farm = await deploied.getFarm(rawprodct[5].toNumber());
            console.log(rawprodct);
            App.displayObjectDetails("#rawprodct-details", "rawprodct", rawprodct);
            App.displayObjectDetails("#rawprodct-farm-details", "farm", farm);
        } catch(e) {
            App.clearElement("#rawprodct-details");
            App.clearElement("#rawprodct-farm-details");
            App.showStatusMessage("#rawprodct-search-status", "error", `Failure. ${e.message}`, 5);
            console.log(e);
        }
    },


    createProduct: async function(event){
        event.preventDefault();
        let product = App.readCreateProductForm();
        try {
            let deploied = await App.contracts.SupplyChain.deployed();
            let result = await deploied.createProduct(
                product.rawprodctId
            );
            App.showStatusMessage(
                "#create-product-status",
                "success",
                `Success. Id of new product is ${result.logs[0].args.upc.toNumber()}`,
                5
            );
        } catch (e) {
            App.showStatusMessage(
                "#create-product-status",
                "error",
                `Failure. ${e.message}`,
                5
            );
            console.log(e);
        }
    },

    addProductForSale: async function(event){
        event.preventDefault();
        let prdct = App.readSellProductForm();
        try {
            let deploied = await App.contracts.SupplyChain.deployed();
            await deploied.addProductForSale(prdct.upc, prdct.price);
            App.showStatusMessage(
                "#owner-sell-product-status",
                "success",
                `Success. Product with UPC = ${prdct.upc} is now For Sale`,
                5
            );
        } catch (e) {
            App.showStatusMessage(
                "#owner-sell-product-status",
                "error",
                `Failure. ${e.message}`,
                5
            );
            console.log(e);
        }
    },

    buyProduct: async function(event) {
        event.preventDefault();
        let product = App.readBuyProductForm();
        console.log(product);
        try{
            let deploied = await App.contracts.SupplyChain.deployed();
            await deploied.buyProduct(product.upc, {from: App.metamaskAccountID, value: product.bid});
            App.showStatusMessage(
                "#buy-product-status",
                "success",
                `Success. Product with UPC = ${product.upc} is now Sold`,
                5
            );
        } catch (e) {
            App.showStatusMessage(
                "#buy-product-status",
                "error",
                `Failure. ${e.message}`,
                5
            );
            console.log(e);
        }
    },

    shipProduct: async function(event){
        event.preventDefault();
        let product = App.readManageProductForm();
        console.log(product);
        try{
            let deploied = await App.contracts.SupplyChain.deployed();
            await deploied.shipProduct(product.upc);
            App.showStatusMessage(
                "#owner-manage-product-status",
                "success",
                `Success. Product with UPC = ${product.upc} is now Shipped to Buyer`,
                5
            );
        } catch (e) {
            App.showStatusMessage(
                "#owner-manage-product-status",
                "error",
                `Failure. ${e.message}`,
                5
            );
            console.log(e);
        }
    },

    receiveProduct: async function(event){
        event.preventDefault();
        let product = App.readReceiveProductForm();
        console.log(product);
        try{
            let deploied = await App.contracts.SupplyChain.deployed();
            await deploied.receiveProduct(product.upc);
            App.showStatusMessage(
                "#buyer-receive-product-status",
                "success",
                `Success. Product with UPC = ${product.upc} is now Owned by You`,
                5
            );
        } catch (e) {
            App.showStatusMessage(
                "#buyer-receive-product-status",
                "error",
                `Failure. ${e.message}`,
                5
            );
            console.log(e);
        }
    },

    consumeProduct: async function(event){
        event.preventDefault();
        let product = App.readManageProductForm();
        console.log(product);
        try{
            let deploied = await App.contracts.SupplyChain.deployed();
            await deploied.consumeProduct(product.upc);
            App.showStatusMessage(
                "#owner-manage-product-status",
                "success",
                `Success. Product with UPC = ${product.upc} is now Consumed`,
                5
            );
        } catch (e) {
            App.showStatusMessage(
                "#owner-manage-product-status",
                "error",
                `Failure. ${e.message}`,
                5
            );
            console.log(e);
        }
    },

    getProductForOwner: async function(event){
        if(event) event.preventDefault();
        let productUpc = App.readGetProductForOwnerForm();
        try {
            let deploied = await App.contracts.SupplyChain.deployed();
            let product = await deploied.getProduct(productUpc);
            let rawprodct = await deploied.getRawprodct(product[7].toNumber());
            let farm = await deploied.getFarm(rawprodct[5].toNumber());
            console.log(product);
            App.displayObjectDetails("#owner-product-details", "product", product);
            App.displayObjectDetails("#owner-product-rawprodct-details", "rawprodct", rawprodct);
            App.displayObjectDetails("#owner-product-farm-details", "farm", farm);
        } catch(e) {
            App.clearElement("#owner-product-details");
            App.clearElement("#owner-product-rawprodct-details");
            App.clearElement("#owner-product-farm-details");
            App.showStatusMessage("#owner-search-product-status", "error", `Failure. ${e.message}`, 5);
            console.log(e);
        }
    },

    getProductForBuyer: async function(event){
        if(event) event.preventDefault();
        let productUpc = App.readGetProductForBuyerForm();
        try {
            let deploied = await App.contracts.SupplyChain.deployed();
            let product = await deploied.getProduct(productUpc);
            let rawprodct = await deploied.getRawprodct(product[7].toNumber());
            let farm = await deploied.getFarm(rawprodct[5].toNumber());
            console.log(product);
            App.displayObjectDetails("#buyer-product-details", "product", product);
            App.displayObjectDetails("#buyer-product-rawprodct-details", "rawprodct", rawprodct);
            App.displayObjectDetails("#buyer-product-farm-details", "farm", farm);
        } catch(e) {
            App.clearElement("#buyer-product-details");
            App.clearElement("#buyer-product-rawprodct-details");
            App.clearElement("#buyer-product-farm-details");
            App.showStatusMessage("#buyer-search-product-status", "error", `Failure. ${e.message}`, 5);
            console.log(e);
        }
    },

    fetchEvents: function () {
        if (typeof App.contracts.SupplyChain.currentProvider.sendAsync !== "function") {
            App.contracts.SupplyChain.currentProvider.sendAsync = function () {
                return App.contracts.SupplyChain.currentProvider.send.apply(
                    App.contracts.SupplyChain.currentProvider,
                    arguments
                );
            };
        }

        App.contracts.SupplyChain.deployed().then(function(instance) {
            var events = instance.allEvents(function(err, log){
                if (!err)
                    $("#ftc-events").append('<li>' + log.event + ' - ' + log.transactionHash + '</li>');
            });
        }).catch(function(err) {
            console.log(err.message);
        });

    }
};

$(function () {
    $(window).load(async function () {
        await App.init();
    });
});

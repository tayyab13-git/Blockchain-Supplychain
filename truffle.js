
const HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "toward mass iron agent cute admit same join move destroy oppose indoor";

module.exports = {
   
    networks: {
        development_cli: {
            host: "127.0.0.1",
            port: 8545,
            network_id: "*",
            websockets: true
        },
        development_ui: {
            host: "127.0.0.1",
            port: 7545,
            network_id: 5777
        },
        rinkeby: {
            provider: function() {
                return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/v3/1bcd9a3392c54c6eb26187a02a742438");
            },
            network_id: 4,
            gas: 7000000,
            gasPrice: 10000000000
        }
    }
};
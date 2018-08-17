// Use EOS Asia for Mainnet
export const eosOptions = {
    "eosasia": {
        "httpEndpoint": "https://api1.eosasia.one",
        "verbose": true,
        "chainId": "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906"
    },
    "kylin": {
        "httpEndpoint": "https://api-kylin.eosasia.one",
        "verbose": true,
        "chainId": "5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191"
    },

}
// Use CryptoKylin for Testnet
export const networks = {
    "kylin": {
        "protocol": "https",
        "blockchain": "eos",
        "host": "api-kylin.eosasia.one",
        "port": 443,
        "chainId": "5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191"
    },
    "eosasia": {
        "protocol": "https",
        "blockchain": "eos",
        "host": "api1.eosasia.one",
        "port": 443,
        "chainId": "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906"
    }
}
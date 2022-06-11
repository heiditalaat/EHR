module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      //port ganache is running on
      port: 7545,
      //match any network id
      network_id: "*" 
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
}
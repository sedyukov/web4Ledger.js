const HDWalletProvider = require('@truffle/hdwallet-provider');
let contract = require("@truffle/contract");
const ProviderEngine = require('web3-provider-engine')
const RpcSubprovider = require('web3-provider-engine/subproviders/rpc')
const createLedgerSubprovider = require('@ledgerhq/web3-subprovider')
const LedgerWalletProvider = require('./ledger');


function Web4Ledger() {
  let provider;
  let defaultAddress = "";
  let privateKey = "";

  this.setProvider = function (_provider, _address = "") {
    provider = _provider;
    defaultAddress = _address;    
  }
  
  // add private key to current web3 provider
  this.privateKeyToAccount = function (_privateKey) {
    privateKey = _privateKey;    
  }

  this.setHDWalletProvider = function (
    mnemonic,
    providerOrUrl,
    addressIndex = 0,
    numberOfAddresses = 1,
    shareNonce = true,
    derivationPath = "m/44'/60'/0'/0/",
    pollingInterval = 600000
  ) {
    provider = new HDWalletProvider({
      providerOrUrl,
      addressIndex,
      numberOfAddresses,
      shareNonce,
      derivationPath,
      pollingInterval,
      mnemonic,
    });

    defaultAddress = provider.addresses[0];

    // stop polling for blocks
    provider.engine.stop();
  }
  // this.setLedgerWalletProvider = function (
  //   transport,
  //   providerOrUrl,
  //   addressIndex = 0,
  //   numberOfAddresses = 1,
  //   networkId,
  //   shareNonce = true,
  //   derivationPath = "m/44'/60'/0'/0/",
  //   pollingInterval = 600000
  // ) {
  //   const engine = new ProviderEngine()
  //   const ledger = createLedgerSubprovider(transport, {
  //     networkId,
  //     accountsLength: numberOfAddresses
  //   })
  //   engine.addProvider(ledger)
  //   engine.addProvider(new RpcSubprovider({ rpcUrl: providerOrUrl }))]
  //   provider = engine;
  // }

  this.setLedgerWalletProvider = function (
    transportType,
    url,
    emvAddress,
    addressIndex = 0,
    numberOfAddresses = 1,
    networkId,
    derivationPath = "m/44'/60'/0'/0/",
  ) {

    const ledgerOptions = {
      networkId,
      path: derivationPath, // ledger default derivation path
      askConfirm: false,
      accountsLength: numberOfAddresses,
      accountsOffset: 0
    };
    provider = new LedgerWalletProvider(ledgerOptions, url, transportType);
    provider.stop();
    provider.getAddress();
    defaultAddress = emvAddress;
  }

  // create smart contract abstraction object by ABI
  this.getContractAbstraction = function (abi) {
    // create abstraction
    let abstraction = contract({ abi });

    // set current provider
    abstraction.setProvider(provider);

    // add account to current provider if defined
    if (privateKey.trim()) {      
      let account = abstraction.web3.eth.accounts.privateKeyToAccount(privateKey);
      abstraction.web3.eth.accounts.wallet.add(account);
      // set address as default
      defaultAddress = account.address;      
    }
    
    // set default account if defined
    if (defaultAddress.trim()) {
      abstraction.defaults({ from: defaultAddress });
    }

    // use this function instead of this.at(...) to get instance
    abstraction.getInstance = async function (address) {

      let instance = await this.at(address);

      instance.encodeABI = function (method, ...theArgs) {
        return this.contract.methods[method].apply(this, theArgs).encodeABI();
      }

      instance.sendTransactionWithETH = function (method, value, ...theArgs) {
        theArgs.unshift(method);
        let data = this.encodeABI.apply(this, theArgs);
        return this.sendTransaction({ value, data });
      }

      return instance;
    };

    return abstraction;
  }

};

module.exports = Web4Ledger;


'use strict'

/**
 * Module dependencies.
 */

const FiltersSubprovider = require('web3-provider-engine/subproviders/filters.js')
const ProviderEngine = require('web3-provider-engine')
const ProviderSubprovider = require('web3-provider-engine/subproviders/provider.js')
const TransportU2F = require('@ledgerhq/hw-transport-node-hid').default
const TransportWebUSB = require('@ledgerhq/hw-transport-webusb').default
const Web3 = require('web3')
const createLedgerSubprovider = require('@ledgerhq/web3-subprovider').default

/**
 * Exports.
 */

module.exports = class LedgerProvider extends ProviderEngine {
  constructor(options, url, debug) {
    super()

    this.addProvider(createLedgerSubprovider(async () => {
      const transport = await TransportU2F.create()

      transport.setDebugMode(!!debug)

      return transport
    }, options))
    this.addProvider(new FiltersSubprovider())
    this.addProvider(new ProviderSubprovider(new Web3.providers.HttpProvider(url)))
    this.start()
  }
}
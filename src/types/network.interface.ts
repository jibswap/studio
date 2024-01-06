export enum Network {
  ETHEREUM_MAINNET = 'ethereum',
  POLYGON_MAINNET = 'polygon',
  OPTIMISM_MAINNET = 'optimism',
  GNOSIS_MAINNET = 'gnosis',
  BINANCE_SMART_CHAIN_MAINNET = 'binance-smart-chain',
  FANTOM_OPERA_MAINNET = 'fantom',
  AVALANCHE_MAINNET = 'avalanche',
  ARBITRUM_MAINNET = 'arbitrum',
  CELO_MAINNET = 'celo',
  HARMONY_MAINNET = 'harmony',
  MOONRIVER_MAINNET = 'moonriver',
  BITCOIN_MAINNET = 'bitcoin',
  CRONOS_MAINNET = 'cronos',
  AURORA_MAINNET = 'aurora',
  EVMOS_MAINNET = 'evmos',
  BASE_MAINNET = 'base',
  JBC_MAINNET = 'jbc',
}

export const NETWORK_IDS: Record<Network, number | null> = {
  [Network.ETHEREUM_MAINNET]: 1,
  [Network.BINANCE_SMART_CHAIN_MAINNET]: 56,
  [Network.GNOSIS_MAINNET]: 100,
  [Network.POLYGON_MAINNET]: 137,
  [Network.OPTIMISM_MAINNET]: 10,
  [Network.FANTOM_OPERA_MAINNET]: 250,
  [Network.AVALANCHE_MAINNET]: 43114,
  [Network.ARBITRUM_MAINNET]: 42161,
  [Network.CELO_MAINNET]: 42220,
  [Network.HARMONY_MAINNET]: 1666600000,
  [Network.MOONRIVER_MAINNET]: 1285,
  [Network.CRONOS_MAINNET]: 25,
  [Network.AURORA_MAINNET]: 1313161554,
  [Network.BITCOIN_MAINNET]: 1285,
  [Network.EVMOS_MAINNET]: 9001,
  [Network.BASE_MAINNET]: 8453,
  [Network.JBC_MAINNET]: 8899,
};

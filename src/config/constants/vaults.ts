import { serializeTokens } from './tokens'
import { SerializedVaultConfig } from './types'

const serializedTokens = serializeTokens()


export const oldVaults: SerializedVaultConfig[] = [
    {
        pid: 0,
        lpSymbol: 'SPY-BUSD',
        symbol: 'BUSD',
        lpAddresses: {
            97: '0xe9412a9809FadBbaCd8D1bd024E6280f05Bd2437',
            56: '0x0e587eaeFC234965ef5b2219983E7Df06b42dAE3',
        },
        contractAddresses: {
            97: '0xdf075e54Fc6E7F114399c511E621EA2fe999C451',
            56: '0x44425C94Df7cF5916E8B9497C99a4584bE9a912e',
        },
        isETH: false,
        token: serializedTokens.busd,
    },
    {
        pid: 1,
        symbol: 'BNB',
        lpSymbol: 'SPY-BNB LP',
        lpAddresses: {
            97: '0xe890519b297700BB69a62F18AaA50cAc201A300C',
            56: '0xfcB07994C68d986D4d534709314A021e56bBBFf0',
        },
        contractAddresses: {
            97: '0x17e2Ef101b2A0f71e11eFa2B353B1D67a1546222',
            56: '0x1BAf386a4305f2Cb4aFF27456efCcbC21fcc6c38',
        },
        isETH: true,
        token: serializedTokens.wbnb,
    },
    {
        pid: 4,
        symbol: 'USDC',
        lpSymbol: 'SPY-USDC LP',
        lpAddresses: {
            97: '0x1aec329c825fA6dE8be4f0CB5410C0D4650dACE9',
            56: '0xc115f337130aaaE97F4Ab34751ee2854D2795958',
        },
        contractAddresses: {
            97: '0x54580DD184BF9201fB0e2ACf0Ce801dd3CA045e7',
            56: '0xcb1E24339d157695468072c1452BFb79bCae45b9',
        },
        isETH: false,
        token: serializedTokens.usdc,
    },
]


const vaults: SerializedVaultConfig[] = [
    {
        pid: 0,
        lpSymbol: 'SPY-BUSD',
        symbol: 'BUSD',
        lpAddresses: {
            97: '0xe9412a9809FadBbaCd8D1bd024E6280f05Bd2437',
            56: '0x0e587eaeFC234965ef5b2219983E7Df06b42dAE3',
        },
        contractAddresses: {
            97: '0xB5A8A0C09aD88BA1179f525f302F48c04288F28B',
            56: '0x30754cF864903232bf5eBC12af929b168Ea1E6DC',
        },
        isETH: false,
        token: serializedTokens.busd,
    },
    {
        pid: 1,
        symbol: 'BNB',
        lpSymbol: 'SPY-BNB LP',
        lpAddresses: {
            97: '0xe890519b297700BB69a62F18AaA50cAc201A300C',
            56: '0xfcB07994C68d986D4d534709314A021e56bBBFf0',
        },
        contractAddresses: {
            97: '0x1e235CD954CbD467b3C23864B162353dD608795f',
            56: '0x42F8479fCe1053cefe8d95441F61DD5C2942F1E4',
        },
        isETH: true,
        token: serializedTokens.wbnb,
    },
    {
        pid: 4,
        symbol: 'USDC',
        lpSymbol: 'SPY-USDC LP',
        lpAddresses: {
            97: '0x1aec329c825fA6dE8be4f0CB5410C0D4650dACE9',
            56: '0xc115f337130aaaE97F4Ab34751ee2854D2795958',
        },
        contractAddresses: {
            97: '0xE33B0b36CE14dE9e41C330B9A532101b98c78427',
            56: '0x4E24bE6d7234d2e82F7C0F623AC69B434190006D',
        },
        isETH: false,
        token: serializedTokens.usdc,
    },
]

export default vaults
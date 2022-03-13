import { serializeTokens } from './tokens'
import { SerializedVaultConfig } from './types'

const serializedTokens = serializeTokens()

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
            97: '0x95A512012988aa43205C0521CAFa2E37f27b5c8b',
            56: '0x0e587eaeFC234965ef5b2219983E7Df06b42dAE3',
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
            97: '0xC4a008e9A3a8DF4a553C769D6D84c92dc01dADd6',
            56: '0x0e587eaeFC234965ef5b2219983E7Df06b42dAE3',
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
            56: '0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16',
        },
        contractAddresses: {
            97: '0xA7f0e587b8225640F41a21287CAa4D62d9D36eEA',
            56: '0x0e587eaeFC234965ef5b2219983E7Df06b42dAE3',
        },
        isETH: false,
        token: serializedTokens.usdc,
    },
]

export default vaults
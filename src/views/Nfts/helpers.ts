import tokens from "config/constants/tokens"

export const isSpyNFT = (address?: string) => {
    return address?.toLowerCase() !== tokens.signature.address.toLowerCase()
}
import BigNumber from 'bignumber.js'
import getGasPrice from 'utils/getGasPrice'
import { callWithEstimateGas } from 'utils/calls/estimateGas'
import tokens from 'config/constants/tokens'
import { getSpyNFTContract } from 'utils/contractHelpers'


export type CastedNFTData = {
  id: string,
  amount: BigNumber,
  blockNum: BigNumber,
  grade: number,
  createdTime: number,
  lockedDays: number,
  quality: number
  resBaseId?: BigNumber
  expiring?: BigNumber
}

export const castNFTSignature = async (nftFactory, spyAmount, resId): Promise<CastedNFTData|null> => {

    const gasPrice = getGasPrice()
    const value = new BigNumber(spyAmount).toString()
    const resBaseId = new BigNumber(resId).toString()

    const tx = await callWithEstimateGas(nftFactory, 'mint', [[value, resBaseId, 0, 0, 0]], {
      gasPrice,
    })
    const receipt = await tx.wait()

    if (receipt.status === 1) {
      /* eslint-disable dot-notation */
      const ev = Array.from(receipt["events"]).filter((v) =>  {
        return v["event"] === "GegoAdded"
      });

      if (ev.length > 0) {
        const args = ev[0]["args"];

        return {
          id: new BigNumber(args["id"]._hex).toJSON(),
          amount: new BigNumber(args["amount"]._hex),
          blockNum: new BigNumber(args["blockNum"]._hex),
          grade: new BigNumber(args["grade"]._hex).toNumber(),
          createdTime: new BigNumber(args["createdTime"]._hex).toNumber(),
          lockedDays: 0,
          resBaseId: new BigNumber(args["amount"]._hex),
          expiring: new BigNumber(args["expiringTime"]._hex),
          quality: new BigNumber(args["quality"]._hex).toNumber(),
        }
      }
      /* eslint-enable dot-notation */
    }
    return null;
}


export const purchaseNFTSignature = async (nftFactory, ruleId, amount) => {

  const gasPrice = getGasPrice()
  const amountNumber = new BigNumber(amount).toString()
  const ruleIdNumber = new BigNumber(ruleId).toString()
  const resBaseIds = [];
  for (let i = 0; i < amount; i ++) {
    resBaseIds.push(new BigNumber(Math.floor(Math.random() * 5)).toString())
  }

  const tx = await callWithEstimateGas(nftFactory, 'buy', [new BigNumber(0).toString(), ruleIdNumber, amountNumber, resBaseIds], {
    gasPrice,
  })
  const receipt = await tx.wait()
  return receipt.status
}

export const castNFT = async (nftFactory, spyAmount): Promise<CastedNFTData|null> => {

    const gasPrice = getGasPrice()
    const value = new BigNumber(spyAmount).toString()
  
    const tx = await callWithEstimateGas(nftFactory, 'mint', [[value, 0, 0, 0, 0]], {
      gasPrice,
    })
    const receipt = await tx.wait()

    if (receipt.status === 1) {
      /* eslint-disable dot-notation */
      const ev = Array.from(receipt["events"]).filter((v) =>  {
        return v["event"] === "GegoAdded"
      });

      if (ev.length > 0) {
        const args = ev[0]["args"];

        return {
          id: new BigNumber(args["id"]._hex).toJSON(),
          amount: new BigNumber(args["amount"]._hex),
          blockNum: new BigNumber(args["blockNum"]._hex),
          grade: new BigNumber(args["grade"]._hex).toNumber(),
          createdTime: new BigNumber(args["createdTime"]._hex).toNumber(),
          lockedDays: new BigNumber(args["lockedDays"]._hex).toNumber(),
          quality: new BigNumber(args["quality"]._hex).toNumber(),
          resBaseId: new BigNumber(args["amount"]._hex),
        }
      }
      /* eslint-enable dot-notation */
    }
    return null;
}

export const burnNFT = async (nftFactory, tokenId) => {

  const gasPrice = getGasPrice()

  const tx = await callWithEstimateGas(nftFactory, 'burn', [tokenId], {
    gasPrice,
  })
  const receipt = await tx.wait()
  return receipt.status
}

export const stakeNFT = async (nftReward, tokenId) => {

  const gasPrice = getGasPrice()

  const tx = await callWithEstimateGas(nftReward, 'stake', [tokenId], {
    gasPrice,
  })
  const receipt = await tx.wait()
  return receipt.status
}

export const stakeNFTMulti = async (nftReward, tokenIds) => {

  const gasPrice = getGasPrice()

  const tx = await callWithEstimateGas(nftReward, 'stakeMulti', [tokenIds], {
    gasPrice,
  })
  const receipt = await tx.wait()
  return receipt.status
}

export const unstakeNFT = async (nftReward, tokenId) => {

  const gasPrice = getGasPrice()

  const tx = await callWithEstimateGas(nftReward, 'unstake', [tokenId], {
    gasPrice,
  })
  const receipt = await tx.wait()
  return receipt.status
}

export const exitNFT = async (nftReward) => {

  const gasPrice = getGasPrice()

  const tx = await callWithEstimateGas(nftReward, 'exit', [], {
    gasPrice,
  })
  const receipt = await tx.wait()
  return receipt.status
}

export const harvestNFT = async (nftReward) => {

  const gasPrice = getGasPrice()

  const tx = await callWithEstimateGas(nftReward, 'harvest', [], {
    gasPrice,
  })
  const receipt = await tx.wait()
  return receipt.status
}

export const injectNFTSignature = async (nftFactory, gegoId, spyAmount) => {

  const gasPrice = getGasPrice()
  const value = new BigNumber(spyAmount).toString()

  const tx = await callWithEstimateGas(nftFactory, 'inject', [gegoId, spyAmount], {
    gasPrice,
  })
  const receipt = await tx.wait()
  return receipt.status
}
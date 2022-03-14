import BigNumber from 'bignumber.js'
import { DEFAULT_GAS_LIMIT, DEFAULT_TOKEN_DECIMAL } from 'config'
import getGasPrice from 'utils/getGasPrice'
import { AddressZero } from '@ethersproject/constants'
import {callWithEstimateGas} from './estimateGas'

const options = {
  gasLimit: DEFAULT_GAS_LIMIT,
}

export const stakeVault = async (vaultContract, amount, userRefferer) => {
  const gasPrice = getGasPrice()

  let referrer = userRefferer
  if (!userRefferer || !userRefferer.startsWith('0x')) {
    referrer = AddressZero
  }

  const tx = await callWithEstimateGas(vaultContract, 'deposit', [amount, referrer], {
    gasPrice,
  })
  const receipt = await tx.wait()
  return receipt.status
}

export const stakeLPVault = async (vaultContract, lpAmount, userRefferer) => {
  const gasPrice = getGasPrice()

  let referrer = userRefferer
  if (!userRefferer || !userRefferer.startsWith('0x')) {
    referrer = AddressZero
  }

  const tx = await callWithEstimateGas(vaultContract, 'depositLP', [lpAmount, referrer], {
    gasPrice,
  })
  const receipt = await tx.wait()
  return receipt.status
}

export const stakeBNBVault = async (vaultContract, amount, userRefferer) => {
  const gasPrice = getGasPrice()

  let referrer = userRefferer
  if (!userRefferer || !userRefferer.startsWith('0x')) {
    referrer = AddressZero
  }

  const tx = await callWithEstimateGas(vaultContract, 'deposit', [referrer], {
    gasPrice,
  },1000, amount.toString())
  const receipt = await tx.wait()
  return receipt.status
}

export const stakeLPBNBVault = async (vaultContract, lpAmount, userRefferer) => {
  const gasPrice = getGasPrice()

  let referrer = userRefferer
  if (!userRefferer || !userRefferer.startsWith('0x')) {
    referrer = AddressZero
  }

  const tx = await callWithEstimateGas(vaultContract, 'depositLP', [lpAmount, referrer], {
    gasPrice,
  })
  const receipt = await tx.wait()
  return receipt.status
}

export const unstakeVault = async (vaultContract, amount, receiveToken) => {
  const gasPrice = getGasPrice()

  const tx = await callWithEstimateGas(vaultContract, 'withdraw', [amount, receiveToken], {
    gasPrice,
  })
  const receipt = await tx.wait()
  return receipt.status
}

export const unstakeLPVault = async (vaultContract, lpAmount) => {
  const gasPrice = getGasPrice()

  const tx = await callWithEstimateGas(vaultContract, 'withdrawLP', [lpAmount], {
    gasPrice,
  })
  const receipt = await tx.wait()
  return receipt.status
}

export const harvestVault = async (vaultContract, receiveToken) => {
  const gasPrice = getGasPrice()

  const tx = await callWithEstimateGas(vaultContract, 'harvest', [receiveToken], {
    gasPrice,
  })
  const receipt = await tx.wait()
  return receipt.status
}

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { getContractAddresses } from '../contracts/addresses'
import { CrediNetCoreABI } from '../contracts/abis'
import { useState, useEffect } from 'react'
import { zeroAddress } from 'viem'
import type { CreditScore } from '../types'

/**
 * CrediNet 核心合约交互 Hook
 * 用于查询和更新用户信用数据
 */
export function useCrediNet() {
  const { address, chainId } = useAccount()
  const [contractAddress, setContractAddress] = useState<string>('')

  useEffect(() => {
    if (!chainId) {
      setContractAddress('')
      return
    }

    const addresses = getContractAddresses(chainId)
    const candidate = addresses.CrediNetCore

    if (!candidate || candidate === zeroAddress) {
      setContractAddress('')
      return
    }

    setContractAddress(candidate)
  }, [chainId])

  // 查询用户 C-Score
  const { data: creditScore, refetch: refetchScore } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: CrediNetCoreABI,
    functionName: 'getCreditScore',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!contractAddress,
    },
  })

  // 查询用户 DID
  const { data: userDID } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: CrediNetCoreABI,
    functionName: 'getUserDID',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!contractAddress,
    },
  })

  // 查询五维信用数据
  const { data: dimensions, refetch: refetchDimensions } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: CrediNetCoreABI,
    functionName: 'getCreditDimensions',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!contractAddress,
    },
  })

  // 授权应用
  const { writeContract: authorizeApp, data: authorizeHash } = useWriteContract()
  const { isLoading: isAuthorizing, isSuccess: isAuthorizeSuccess } = useWaitForTransactionReceipt({
    hash: authorizeHash,
  })

  // 撤销授权
  const { writeContract: revokeApp, data: revokeHash } = useWriteContract()
  const { isLoading: isRevoking, isSuccess: isRevokeSuccess } = useWaitForTransactionReceipt({
    hash: revokeHash,
  })

  // 授权应用访问数据
  const handleAuthorizeApp = async (appAddress: string, dimensionIds: number[]) => {
    if (!contractAddress) return

    authorizeApp({
      address: contractAddress as `0x${string}`,
      abi: CrediNetCoreABI,
      functionName: 'authorizeApp',
      args: [appAddress as `0x${string}`, dimensionIds.map(id => BigInt(id))],
    })
  }

  // 撤销应用授权
  const handleRevokeApp = async (appAddress: string) => {
    if (!contractAddress) return

    revokeApp({
      address: contractAddress as `0x${string}`,
      abi: CrediNetCoreABI,
      functionName: 'revokeAppAuthorization',
      args: [appAddress as `0x${string}`],
    })
  }

  // 格式化信用数据
  const formattedCreditScore: CreditScore | null = dimensions
    ? {
        total: Number(creditScore || 0),
        change: 0, // 需要从历史数据计算
        dimensions: {
          keystone: Number((dimensions as any).keystone || 0),
          ability: Number((dimensions as any).ability || 0),
          finance: Number((dimensions as any).finance || 0),
          health: Number((dimensions as any).health || 0),
          behavior: Number((dimensions as any).behavior || 0),
        },
        lastUpdated: new Date().toISOString(),
      }
    : null

  return {
    // 数据
    address,
    chainId,
    userDID,
    creditScore: formattedCreditScore,
    
    // 授权操作
    authorizeApp: handleAuthorizeApp,
    revokeApp: handleRevokeApp,
    isAuthorizing,
    isAuthorizeSuccess,
    isRevoking,
    isRevokeSuccess,
    
    // 刷新数据
    refetchScore,
    refetchDimensions,
  }
}


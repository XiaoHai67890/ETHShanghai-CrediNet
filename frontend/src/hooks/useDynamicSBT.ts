import { useEffect, useRef, useState } from 'react'
import { useReadContract, useWatchContractEvent, useAccount } from 'wagmi'
import type { Address } from 'viem'
import { zeroAddress } from 'viem'
import { getContractAddresses } from '../contracts/addresses'
import { DynamicSBTAgentABI } from '../contracts/abis'

/**
 * 五维信用评分类型
 */
export interface CreditScore {
  keystone: number
  ability: number
  wealth: number
  health: number
  behavior: number
  lastUpdate: number
  updateCount: number
}

/**
 * 稀有度类型
 */
export type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'

/**
 * 完整的信用信息类型
 */
export interface CreditInfo {
  score: CreditScore
  totalScore: number
  rarity: Rarity
  tokenId: bigint
}

/**
 * 动态SBT Hook
 * 用于读取和监听用户的动态SBT数据
 */
export function useDynamicSBT(userAddress?: Address) {
  const { address: connectedAddress, chainId } = useAccount()
  const targetAddress = userAddress || connectedAddress
  const [previousRarity, setPreviousRarity] = useState<Rarity | null>(null)
  const [showUpgradeAnimation, setShowUpgradeAnimation] = useState(false)
  const [contractAddress, setContractAddress] = useState<Address | undefined>(undefined)
  const upgradeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!chainId) {
      setContractAddress(undefined)
      return
    }

    const candidate = getContractAddresses(chainId).DynamicSBTAgent

    if (!candidate || candidate === zeroAddress) {
      setContractAddress(undefined)
      return
    }

    setContractAddress(candidate as Address)
  }, [chainId])

  // 读取用户完整的信用信息
  const { 
    data: creditInfo, 
    isLoading, 
    isError,
    refetch 
  } = useReadContract({
    address: contractAddress as Address,
    abi: DynamicSBTAgentABI,
    functionName: 'getUserCreditInfo',
    args: targetAddress ? [targetAddress] : undefined,
    query: {
      enabled: !!targetAddress && !!contractAddress,
      refetchInterval: 30000, // 每30秒自动刷新
    }
  })

  // 监听评分更新事件
  useWatchContractEvent({
    address: contractAddress as Address,
    abi: DynamicSBTAgentABI,
    eventName: 'ScoreUpdated',
    enabled: !!contractAddress && !!targetAddress,
    onLogs(logs: ReadonlyArray<{ args?: { user?: string } }>) {
  const log = logs[0]
  const user = log?.args?.user

  if (user?.toLowerCase() === targetAddress?.toLowerCase()) {
        console.log('🎯 评分已更新:', log.args)
        
        // 刷新数据
        refetch().then((result) => {
          if (result.data) {
            const [, , newRarity] = result.data
            const rarityName = getRarityName(newRarity)
            
            // 检查稀有度是否升级
            if (previousRarity && rarityName !== previousRarity) {
              console.log(`🎉 稀有度升级: ${previousRarity} → ${rarityName}`)
              setShowUpgradeAnimation(true)
              if (upgradeTimeoutRef.current) {
                clearTimeout(upgradeTimeoutRef.current)
              }
              upgradeTimeoutRef.current = setTimeout(() => {
                setShowUpgradeAnimation(false)
                upgradeTimeoutRef.current = null
              }, 3000)
            }
            
            setPreviousRarity(rarityName)
          }
        })
      }
    },
  })

  // 解析信用信息
  const parsedCreditInfo: CreditInfo | null = creditInfo ? {
    score: {
      keystone: creditInfo[0].keystone,
      ability: creditInfo[0].ability,
      wealth: creditInfo[0].wealth,
      health: creditInfo[0].health,
      behavior: creditInfo[0].behavior,
      lastUpdate: Number(creditInfo[0].lastUpdate),
      updateCount: Number(creditInfo[0].updateCount),
    },
    totalScore: creditInfo[1],
    rarity: getRarityName(creditInfo[2]),
    tokenId: creditInfo[3],
  } : null

  // 初始化 previousRarity
  useEffect(() => {
    if (parsedCreditInfo && !previousRarity) {
      setPreviousRarity(parsedCreditInfo.rarity)
    }
  }, [parsedCreditInfo, previousRarity])

  useEffect(() => () => {
    if (upgradeTimeoutRef.current) {
      clearTimeout(upgradeTimeoutRef.current)
    }
  }, [])

  return {
    creditInfo: parsedCreditInfo,
    isLoading,
    isError,
    refetch,
    showUpgradeAnimation,
    setShowUpgradeAnimation,
  }
}

/**
 * 将链上的稀有度枚举转换为字符串
 */
function getRarityName(rarity: number): Rarity {
  switch (rarity) {
    case 0:
      return 'COMMON'
    case 1:
      return 'RARE'
    case 2:
      return 'EPIC'
    case 3:
      return 'LEGENDARY'
    default:
      return 'COMMON'
  }
}

/**
 * 获取稀有度对应的颜色
 */
export function getRarityColor(rarity: Rarity): string {
  switch (rarity) {
    case 'LEGENDARY':
      return 'from-yellow-400 to-orange-600'
    case 'EPIC':
      return 'from-purple-400 to-purple-600'
    case 'RARE':
      return 'from-blue-400 to-blue-600'
    case 'COMMON':
    default:
      return 'from-gray-400 to-gray-600'
  }
}

/**
 * 获取稀有度对应的图标
 */
export function getRarityIcon(rarity: Rarity): string {
  switch (rarity) {
    case 'LEGENDARY':
      return '👑'
    case 'EPIC':
      return '💎'
    case 'RARE':
      return '⭐'
    case 'COMMON':
    default:
      return '🎖️'
  }
}


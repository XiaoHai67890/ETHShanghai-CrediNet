import { useState, useEffect, useRef } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useAccount, usePublicClient } from 'wagmi'
import { getContractAddresses } from '../contracts/addresses'
import { SBTRegistryABI, DynamicSBTAgentABI } from '../contracts/abis'
import { parseEventLogs } from 'viem'
import type { Address } from 'viem'

/**
 * SBT数据类型
 */
export interface SBTData {
  name: string
  image: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  totalScore: number
  scores: {
    keystone: number
    ability: number
    wealth: number
    health: number
    behavior: number
  }
}

/**
 * SBT 铸造 Hook
 * 处理 SBT 铸造的完整流程，包括动画触发
 */
export function useSBTMint() {
  const { address, chainId } = useAccount()
  const publicClient = usePublicClient()
  const [isMinting, setIsMinting] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)
  const [mintedTokenId, setMintedTokenId] = useState<bigint | null>(null)
  const [mintedSBTData, setMintedSBTData] = useState<SBTData | null>(null)
  const [contractOwner, setContractOwner] = useState<Address | null>(null)
  const timeoutRef = useRef<number | null>(null)

  // 获取合约地址
  const contractAddress = chainId 
    ? getContractAddresses(chainId).SBTRegistry 
    : undefined

  // 写入合约
  const { writeContractAsync, data: hash, error } = useWriteContract()

  // 等待交易确认
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    if (!publicClient || !contractAddress) return

    let cancelled = false

    const loadOwner = async () => {
      try {
        const owner = await publicClient.readContract({
          address: contractAddress as Address,
          abi: SBTRegistryABI,
          functionName: 'owner',
        }) as Address
        if (!cancelled) {
          setContractOwner(owner)
        }
      } catch (err) {
        console.error('获取 SBT 合约 owner 失败:', err)
      }
    }

    loadOwner()

    return () => {
      cancelled = true
    }
  }, [publicClient, contractAddress])

  // ✅ 优化：交易成功后自动解析事件并触发动画
  useEffect(() => {
    const handleMintSuccess = async () => {
      if (isSuccess && receipt && publicClient && contractAddress) {
        try {
          console.log('✅ 铸造交易成功，解析事件...')
          
          // 解析 BadgeMinted 事件
          const logs = parseEventLogs({
            abi: SBTRegistryABI,
            logs: receipt.logs,
            eventName: 'BadgeMinted'
          })

          if (logs.length > 0) {
            const { to, tokenId, badgeType } = logs[0].args
            console.log('📝 解析到的事件:', { to, tokenId, badgeType })
            
            setMintedTokenId(tokenId as bigint)
            
            // 从 DynamicSBTAgent 读取SBT数据
            const agentAddress = chainId ? getContractAddresses(chainId).DynamicSBTAgent : undefined
            if (agentAddress && to) {
              const sbtData = await fetchSBTData(publicClient, agentAddress as Address, to as Address, tokenId as bigint)
              setMintedSBTData(sbtData)
            }
            
            // 触发动画
            setShowAnimation(true)
            setIsMinting(false)
            
            // 5秒后关闭动画
            if (timeoutRef.current !== null) {
              window.clearTimeout(timeoutRef.current)
            }
            timeoutRef.current = window.setTimeout(() => {
              setShowAnimation(false)
              timeoutRef.current = null
            }, 5000)
          }
        } catch (err) {
          console.error('解析铸造事件失败:', err)
          setIsMinting(false)
        }
      }
    }

    handleMintSuccess()
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [isSuccess, receipt, publicClient, contractAddress, chainId])

  /**
   * 铸造 SBT
   * @param badgeType - 徽章类型
   * @param tokenURI - SBT 元数据 URI (可选，如果使用动态元数据可以传空)
   */
  const mintSBT = async (
    badgeType: number = 1,
    tokenURI: string = ''
  ) => {
    if (!address || !contractAddress) {
      console.error('钱包未连接或合约地址未配置')
      return
    }

    const canDirectMint = contractOwner && address
      ? address.toLowerCase() === contractOwner.toLowerCase()
      : false

    if (!canDirectMint) {
      const err = new Error('当前钱包没有铸造权限，请联系管理员或通过后台发起申请')
      console.error(err.message)
      throw err
    }

    try {
      setIsMinting(true)

      // 使用 async 版本以便捕获和抛出错误
      const txHash = await writeContractAsync({
        address: contractAddress as Address,
        abi: SBTRegistryABI,
        functionName: 'mintBadge',
        args: [address, badgeType, tokenURI],
      })

      return txHash
    } catch (err) {
      console.error('铸造 SBT 失败:', err)
      setShowAnimation(false)
      throw err
    } finally {
      setIsMinting(false)
    }
  }

  /**
   * 根据信用分数生成 SBT 元数据
   * @param creditScore - 五维信用分数
   * @returns SBT 元数据对象
   */
  const generateSBTMetadata = (creditScore: {
    keystone: number
    ability: number
    wealth: number
    health: number
    behavior: number
    total: number
  }) => {
    // 根据总分判断稀有度
    const getRarity = (score: number): 'common' | 'rare' | 'epic' | 'legendary' => {
      if (score >= 900) return 'legendary'
      if (score >= 800) return 'epic'
      if (score >= 700) return 'rare'
      return 'common'
    }

    const rarity = getRarity(creditScore.total)

    // ERC721 标准元数据格式
    return {
      name: `CrediNet Badge #${Date.now()}`,
      description: `五维信用体系 Soulbound Token - ${rarity.toUpperCase()}`,
      image: `/planets/badge-${rarity}.svg`, // 需要准备不同稀有度的徽章图片
      attributes: [
        { trait_type: 'C-Score', value: creditScore.total },
        { trait_type: 'Keystone (基石)', value: creditScore.keystone },
        { trait_type: 'Ability (能力)', value: creditScore.ability },
        { trait_type: 'Wealth (财富)', value: creditScore.wealth },
        { trait_type: 'Health (健康)', value: creditScore.health },
        { trait_type: 'Behavior (行为)', value: creditScore.behavior },
        { trait_type: 'Rarity', value: rarity },
        { trait_type: 'Minted At', value: new Date().toISOString() },
      ],
      // 自定义扩展字段
      external_url: 'https://credinet.xyz',
      animation_url: null, // 可以添加动画 URL
      background_color: rarity === 'legendary' ? 'FFD700' : undefined,
    }
  }

  return {
    // 状态
    isMinting,
    isConfirming,
    isSuccess,
    showAnimation,
    mintedTokenId,
    mintedSBTData,
    error,
    
    // 方法
    mintSBT,
    generateSBTMetadata,
    setShowAnimation,
  }
}

/**
 * 从 DynamicSBTAgent 读取 SBT 数据
 */
async function fetchSBTData(
  publicClient: any,
  agentAddress: Address,
  userAddress: Address,
  tokenId: bigint
): Promise<SBTData> {
  try {
    // 调用 getUserCreditInfo
    const result = await publicClient.readContract({
      address: agentAddress,
      abi: DynamicSBTAgentABI,
      functionName: 'getUserCreditInfo',
      args: [userAddress]
    })

    const [score, totalScore, rarity] = result
    
    return {
      name: `CrediNet Badge #${tokenId}`,
      image: getRarityImage(rarity),
      rarity: getRarityName(rarity),
      totalScore: Number(totalScore),
      scores: {
        keystone: Number(score.keystone),
        ability: Number(score.ability),
        wealth: Number(score.wealth),
        health: Number(score.health),
        behavior: Number(score.behavior),
      }
    }
  } catch (error) {
    console.error('获取SBT数据失败:', error)
    // 返回默认数据
    return {
      name: `CrediNet Badge #${tokenId}`,
      image: '/planets/badge-common.svg',
      rarity: 'common',
      totalScore: 500,
      scores: {
        keystone: 500,
        ability: 500,
        wealth: 500,
        health: 500,
        behavior: 500,
      }
    }
  }
}

function getRarityName(rarity: number): 'common' | 'rare' | 'epic' | 'legendary' {
  switch (rarity) {
    case 0: return 'common'
    case 1: return 'rare'
    case 2: return 'epic'
    case 3: return 'legendary'
    default: return 'common'
  }
}

function getRarityImage(rarity: number): string {
  switch (rarity) {
    case 3: return '/planets/badge-legendary.svg'
    case 2: return '/planets/badge-epic.svg'
    case 1: return '/planets/badge-rare.svg'
    case 0:
    default: return '/planets/badge-common.svg'
  }
}

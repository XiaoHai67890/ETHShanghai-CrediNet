import { useAccount, useReadContract } from 'wagmi'
import { useEffect, useMemo, useState } from 'react'
import { readContract } from 'wagmi/actions'
import { zeroAddress } from 'viem'
import { getContractAddresses } from '../contracts/addresses'
import { SBTRegistryABI } from '../contracts/abis'
import { config as wagmiConfig } from '../config/wagmi'
import type { SBTBadge } from '../types'

/**
 * SBT Registry 合约交互 Hook
 * 用于查询用户的 Soulbound Tokens
 */
export function useSBTRegistry() {
  const { address, chainId } = useAccount()
  const [contractAddress, setContractAddress] = useState<string>('')
  const [badges, setBadges] = useState<SBTBadge[]>([])

  useEffect(() => {
    if (!chainId) {
      setContractAddress('')
      return
    }

    const addresses = getContractAddresses(chainId)
    const candidate = addresses.SBTRegistry

    if (!candidate || candidate === zeroAddress) {
      setContractAddress('')
      return
    }

    setContractAddress(candidate)
  }, [chainId])

  const hasContract = useMemo(() => !!contractAddress && contractAddress !== zeroAddress, [contractAddress])

  // 查询用户的所有 SBT Token IDs
  const { data: tokenIds, refetch: refetchTokenIds } = useReadContract({
    address: hasContract ? (contractAddress as `0x${string}`) : undefined,
    abi: SBTRegistryABI,
    functionName: 'getUserSBTs',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && hasContract,
    },
  })

  // 当获取到 tokenIds 后，查询每个 token 的元数据
  useEffect(() => {
    if (!hasContract || !tokenIds || !Array.isArray(tokenIds)) {
      setBadges([])
      return
    }

    const ids = tokenIds as bigint[]

    if (ids.length === 0) {
      setBadges([])
      return
    }

    let cancelled = false

    const fetchMetadata = async () => {
      try {
        const results = await Promise.all(
          ids.map(async (id) => {
            try {
              const uri = await readContract(wagmiConfig, {
                address: contractAddress as `0x${string}`,
                abi: SBTRegistryABI,
                functionName: 'tokenURI',
                args: [id],
              })

              if (typeof uri !== 'string') {
                return createPlaceholderBadge(id)
              }

              const metadata = parseTokenMetadata(uri)

              if (!metadata) {
                return createPlaceholderBadge(id)
              }

              return {
                id: id.toString(),
                name: metadata.name ?? `Badge #${id.toString()}`,
                description: metadata.description ?? 'Soulbound Token Badge',
                earnedDate: metadata.attributes?.find(attr => attr.trait_type === 'Earned At')?.value ?? new Date().toISOString(),
                imageUrl: metadata.image,
                rarity: normalizeRarity(metadata.attributes?.find(attr => attr.trait_type === 'Rarity')?.value),
              } satisfies SBTBadge
            } catch (error) {
              console.error('读取 SBT 元数据失败', error)
              return createPlaceholderBadge(id)
            }
          })
        )

        if (!cancelled) {
          setBadges(results)
        }
      } catch (error) {
        console.error('批量读取 SBT 元数据失败', error)
        if (!cancelled) {
          setBadges([])
        }
      }
    }

    void fetchMetadata()

    return () => {
      cancelled = true
    }
  }, [contractAddress, hasContract, tokenIds])

  return {
    // 数据
    tokenIds: tokenIds as bigint[] | undefined,
    badges,
    
    // 刷新
    refetchTokenIds,
  }
}

function createPlaceholderBadge(id: bigint): SBTBadge {
  return {
    id: id.toString(),
    name: `Badge #${id.toString()}`,
    description: 'Soulbound Token Badge',
    earnedDate: new Date().toISOString(),
  }
}

type TokenMetadata = {
  name?: string
  description?: string
  image?: string
  attributes?: Array<{ trait_type?: string; value?: string }>
}

function parseTokenMetadata(uri: string): TokenMetadata | null {
  try {
    if (!uri) return null

    if (uri.startsWith('data:')) {
      const [, payload] = uri.split(',')
      if (!payload) return null
      const decoded = typeof atob === 'function' ? atob(payload) : ''
      return JSON.parse(decoded) as TokenMetadata
    }

    try {
      return JSON.parse(uri) as TokenMetadata
    } catch (innerError) {
      console.warn('无法直接解析 tokenURI，返回原始 URI', innerError)
      return {
        image: uri,
      }
    }
  } catch (error) {
    console.error('解析 tokenURI 失败', error)
    return null
  }
}

function normalizeRarity(value?: string): SBTBadge['rarity'] {
  if (!value) return undefined

  switch (value.toLowerCase()) {
    case 'legendary':
      return 'legendary'
    case 'epic':
      return 'epic'
    case 'rare':
      return 'rare'
    case 'common':
      return 'common'
    default:
      return undefined
  }
}


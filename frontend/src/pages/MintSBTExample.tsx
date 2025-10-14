import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSBTMint } from '@/hooks/useSBTMint'
import { useCrediNet } from '@/hooks/useCrediNet'
import SBTMintAnimation from '@/components/animations/SBTMintAnimation'

/**
 * SBT 铸造示例页面
 * 展示如何在铸造 SBT 时触发动画
 */
const MintSBTExample = () => {
  const { creditScore } = useCrediNet()
  const { 
    mintSBT, 
    generateSBTMetadata, 
    showAnimation, 
    setShowAnimation,
    isMinting,
    isConfirming,
    isSuccess 
  } = useSBTMint()

  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'uploaded'>('idle')

  /**
   * 处理铸造流程
   * 1. 生成元数据
   * 2. 上传到 IPFS
   * 3. 调用合约铸造
   * 4. 显示动画
   */
  const handleMint = async () => {
    try {
      setUploadStatus('uploading')
      
      // 使用动态 Agent 模式
      // tokenURI 传空字符串，让合约使用 DynamicSBTAgent 生成动态元数据
      const tokenURI = '' // 空字符串表示使用动态元数据
      
      setUploadStatus('uploaded')

      // 铸造 SBT（会自动注册到 Agent 并初始化评分）
      await mintSBT(1, tokenURI) // badgeType=1, tokenURI=''
      
      console.log('✅ SBT 铸造完成！元数据将由 DynamicSBTAgent 动态生成')
    } catch (error) {
      console.error('❌ 铸造失败:', error)
      setUploadStatus('idle')
    }
  }

  // 获取稀有度
  const getRarity = (score: number): 'common' | 'rare' | 'epic' | 'legendary' => {
    if (score >= 900) return 'legendary'
    if (score >= 800) return 'epic'
    if (score >= 700) return 'rare'
    return 'common'
  }

  const rarity = creditScore ? getRarity(creditScore.total) : 'common'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          铸造您的信用 SBT
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 左侧：当前信用数据 */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-4">当前信用数据</h2>
            
            {creditScore ? (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-purple-400 mb-2">
                    {creditScore.total}
                  </div>
                  <div className="text-gray-400">C-Score</div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">基石 K</span>
                    <span className="text-white font-semibold">{creditScore.keystone}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">能力 A</span>
                    <span className="text-white font-semibold">{creditScore.ability}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">财富 F</span>
                    <span className="text-white font-semibold">{creditScore.wealth}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">健康 H</span>
                    <span className="text-white font-semibold">{creditScore.health}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">行为 B</span>
                    <span className="text-white font-semibold">{creditScore.behavior}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-purple-500/20 rounded-lg border border-purple-500/30">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">稀有度</span>
                    <span className="text-purple-400 font-bold uppercase">{rarity}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                请先连接钱包
              </div>
            )}
          </motion.div>

          {/* 右侧：铸造操作 */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-4">铸造 SBT</h2>
            
            <div className="space-y-6">
              <div className="text-gray-300 text-sm">
                <p className="mb-2">🎯 Soulbound Token (SBT) 是不可转移的身份凭证</p>
                <p className="mb-2">✨ 根据您的五维信用评分动态生成</p>
                <p>🔒 永久绑定到您的钱包地址</p>
              </div>

              {/* 铸造按钮 */}
              <button
                onClick={handleMint}
                disabled={!creditScore || isMinting || isConfirming}
                className={`
                  w-full py-4 px-6 rounded-xl font-bold text-lg
                  transition-all duration-300 transform
                  ${!creditScore || isMinting || isConfirming
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-105 hover:shadow-2xl'
                  }
                  text-white
                `}
              >
                {isMinting ? '铸造中...' : isConfirming ? '确认中...' : '铸造 SBT'}
              </button>

              {/* 状态提示 */}
              {uploadStatus === 'uploading' && (
                <div className="text-center text-yellow-400 text-sm">
                  ⏳ 正在上传元数据到 IPFS...
                </div>
              )}
              
              {uploadStatus === 'uploaded' && (
                <div className="text-center text-green-400 text-sm">
                  ✅ 元数据上传完成
                </div>
              )}

              {isSuccess && (
                <div className="text-center text-green-400 text-sm">
                  🎉 SBT 铸造成功！
                </div>
              )}

              {/* 说明文档 */}
              <div className="mt-8 p-4 bg-slate-800/50 rounded-lg text-sm text-gray-400">
                <h3 className="font-bold text-white mb-2">🤖 DynamicSBTAgent 技术</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>✅ 铸造时自动注册到 Agent</li>
                  <li>✅ 初始化默认评分（500分）</li>
                  <li>✅ 链上动态生成 Base64 元数据</li>
                  <li>✅ 评分更新后自动刷新形象</li>
                  <li>✅ 根据总分自动升级稀有度</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* SBT 铸造动画 */}
      <SBTMintAnimation
        isVisible={showAnimation}
        onComplete={() => setShowAnimation(false)}
        sbtData={creditScore ? {
          name: `CrediNet Badge - ${rarity.toUpperCase()}`,
          image: `/planets/badge-${rarity}.svg`,
          rarity: rarity
        } : undefined}
      />
    </div>
  )
}

export default MintSBTExample

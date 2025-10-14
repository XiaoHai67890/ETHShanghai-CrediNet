import { motion } from 'framer-motion'
import CountUp from '@/components/ui/CountUp'
import { mockCRNBalance } from '@/mock/data'
import { TrendingUp } from 'lucide-react'

const CRNBalanceCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="gradient-border-card relative overflow-hidden"
    >
      {/* 背景装饰 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />

      <div className="relative">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-emerald-400" />
          我的 CRN 余额
        </h2>

        <div className="mb-4">
          <div className="text-5xl font-bold text-gradient mb-2">
            <CountUp end={mockCRNBalance.balance} decimals={2} /> CRN
          </div>
          <p className="text-sm text-gray-400">
            数据贡献者奖励与被动收益
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4 pt-4 border-t border-dark-border/50">
          <div>
            <div className="text-xs text-gray-500 mb-1">近30天变化</div>
            <div className="text-lg font-semibold text-emerald-400">
              +{mockCRNBalance.change30d}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">累计赚取</div>
            <div className="text-lg font-semibold text-gray-300">
              {mockCRNBalance.earned}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">已提取</div>
            <div className="text-lg font-semibold text-gray-400">
              {mockCRNBalance.withdrawn}
            </div>
          </div>
        </div>

        <button className="w-full px-6 py-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold transition-all duration-200">提取收益</button>
      </div>
    </motion.div>
  )
}

export default CRNBalanceCard


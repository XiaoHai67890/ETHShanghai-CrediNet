import { motion } from 'framer-motion'
import { mockCreditScore } from '@/mock/data'

const SBTBadgePreview = () => {
  // 五个星球的配置（对应五维）
  const planets = [
    { key: 'keystone', name: '基石 K', icon: '/planets/keystone.svg', angle: 0 },
    { key: 'ability', name: '能力 A', icon: '/planets/ability.svg', angle: 72 },
    { key: 'wealth', name: '财富 F', icon: '/planets/wealth.svg', angle: 144 },
    { key: 'health', name: '健康 H', icon: '/planets/health.svg', angle: 216 },
    { key: 'behavior', name: '行为 B', icon: '/planets/behavior.svg', angle: 288 }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card h-full flex flex-col"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">动态 SBT 勋章</h2>
        <p className="text-sm text-gray-400">五维信用星系</p>
      </div>

      <div className="flex-1 flex items-center justify-center relative">
        <div className="relative w-72 h-72 flex items-center justify-center">
          {/* 轨道线 */}
          <div className="absolute w-56 h-56 rounded-full border border-dashed border-slate-700/30" />

          {/* 中心C-Score */}
          <motion.div
            className="absolute z-10"
            whileHover={{ scale: 1.1 }}
          >
            <div className="w-24 h-24 rounded-full bg-slate-800/90 backdrop-blur-xl border-2 border-slate-600 flex items-center justify-center shadow-xl">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">
                  {mockCreditScore.total}
                </div>
                <div className="text-[10px] text-gray-400 font-medium">C-Score</div>
              </div>
            </div>
          </motion.div>

          {/* 环绕的五个星球 */}
          {planets.map((planet, index) => {
            const radius = 110
            const angle = (planet.angle * Math.PI) / 180
            const x = Math.cos(angle) * radius
            const y = Math.sin(angle) * radius
            
            return (
              <motion.div
                key={planet.key}
                className="absolute w-16 h-16"
                style={{
                  left: `calc(50% + ${x}px - 32px)`,
                  top: `calc(50% + ${y}px - 32px)`,
                }}
                animate={{
                  top: [`calc(50% + ${y}px - 32px)`, `calc(50% + ${y - 5}px - 32px)`, `calc(50% + ${y}px - 32px)`],
                }}
                transition={{
                  duration: 3 + index * 0.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                whileHover={{ scale: 1.2 }}
              >
                <div className="relative group">
                  <img 
                    src={planet.icon} 
                    alt={planet.name}
                    className="w-16 h-16 drop-shadow-lg"
                  />
                  {/* Tooltip */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {planet.name}: {mockCreditScore.dimensions[planet.key as keyof typeof mockCreditScore.dimensions]}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <div className="text-center mt-4">
        <p className="text-xs text-gray-500">
          五维星球随信用数据动态变化
        </p>
      </div>
    </motion.div>
  )
}

export default SBTBadgePreview


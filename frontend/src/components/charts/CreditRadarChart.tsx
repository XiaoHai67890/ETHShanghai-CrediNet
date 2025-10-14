import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'
import { motion } from 'framer-motion'
import { mockCreditScore, creditDimensions } from '@/mock/data'

const CreditRadarChart = () => {
  const data = creditDimensions.map((dim) => ({
    dimension: dim.name,
    value: mockCreditScore.dimensions[dim.key as keyof typeof mockCreditScore.dimensions],
    fullMark: 100,
    color: dim.color
  }))

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card"
    >
      {/* 标题部分 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">信用光谱</h2>
          <p className="text-sm text-gray-400">五维信用模型</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-gradient">
            {mockCreditScore.total}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            <span className="text-emerald-400">▲ {mockCreditScore.change}</span>
          </div>
        </div>
      </div>

      {/* 雷达图 */}
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid stroke="#2d3250" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: '#9ca3af', fontSize: 13, fontWeight: 500 }}
          />
          <Radar
            dataKey="value"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.6}
            animationDuration={1000}
            animationBegin={0}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(26, 30, 61, 0.95)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '12px',
              color: '#fff'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* 维度详情 */}
      <div className="grid grid-cols-5 gap-4 mt-6">
        {data.map((dim, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="text-center"
          >
            <div
              className="w-14 h-14 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg shadow-lg"
              style={{
                backgroundColor: dim.color,
                boxShadow: `0 4px 20px ${dim.color}40`
              }}
            >
              {dim.value}
            </div>
            <div className="text-xs text-gray-400 font-medium">{dim.dimension}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default CreditRadarChart


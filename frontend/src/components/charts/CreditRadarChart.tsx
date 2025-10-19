import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'
import { motion } from 'framer-motion'
import { mockCreditScore, creditDimensions } from '@/mock/data'
import { Shield, Zap, DollarSign, Heart, Activity } from 'lucide-react'

type RadarDataInput = {
  keystone: number
  ability: number
  finance: number
  health: number
  behavior: number
}

interface Props {
  data?: RadarDataInput
}

const CreditRadarChart = ({ data: external }: Props) => {
  const source = external
    ? {
        total: 0,
        change: 0,
        dimensions: external,
      }
    : mockCreditScore

  // 图标映射
  const iconMap = {
    keystone: Shield,
    ability: Zap,
    finance: DollarSign,
    health: Heart,
    behavior: Activity
  }

  const data = creditDimensions.map((dim) => ({
    dimension: dim.name,
    value: source.dimensions[dim.key as keyof typeof source.dimensions],
    fullMark: 100,
    color: dim.color,
    icon: iconMap[dim.key as keyof typeof iconMap]
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
            {source.total}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            <span className="text-emerald-400">▲ {source.change}</span>
          </div>
        </div>
      </div>

      {/* 雷达图 */}
      <ResponsiveContainer width="100%" height={350}>
        <RadarChart data={data}>
          <PolarGrid 
            stroke="#3d4566" 
            strokeWidth={1.5}
            gridType="polygon"
          />
          <PolarAngleAxis
            dataKey="dimension"
            tick={(props) => {
              const { x, y, payload } = props
              const dim = data.find(d => d.dimension === payload.value)
              const IconComponent = dim?.icon
              
              // 计算标签位置（向外推移）
              const cx = 200 // 中心 x
              const cy = 175 // 中心 y
              const angle = Math.atan2(y - cy, x - cx)
              const distance = 35 // 向外推移的距离
              const labelX = x + Math.cos(angle) * distance
              const labelY = y + Math.sin(angle) * distance
              
              return (
                <g transform={`translate(${labelX},${labelY})`}>
                  {/* 背景 */}
                  <rect
                    x={-40}
                    y={-20}
                    width={80}
                    height={40}
                    fill="rgba(30, 41, 59, 0.9)"
                    stroke={dim?.color || '#9ca3af'}
                    strokeWidth={2}
                    rx={8}
                  />
                  {/* 图标 */}
                  {IconComponent && (
                    <foreignObject x={-35} y={-15} width={30} height={30}>
                      <div className="flex items-center justify-center h-full">
                        <IconComponent 
                          size={18} 
                          style={{ color: dim?.color || '#9ca3af' }}
                        />
                      </div>
                    </foreignObject>
                  )}
                  {/* 文字标签 */}
                  <text
                    x={5}
                    y={0}
                    fill="#fff"
                    fontSize="13"
                    fontWeight="600"
                    textAnchor="start"
                    dominantBaseline="middle"
                  >
                    {payload.value}
                  </text>
                  {/* 数值 */}
                  <text
                    x={0}
                    y={15}
                    fill={dim?.color || '#9ca3af'}
                    fontSize="14"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {dim?.value || 0}
                  </text>
                </g>
              )
            }}
          />
          <Radar
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={3}
            fill="url(#colorGradient)"
            fillOpacity={0.65}
            animationDuration={1500}
            animationBegin={0}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
          />
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(26, 30, 61, 0.98)',
              border: '2px solid rgba(59, 130, 246, 0.5)',
              borderRadius: '12px',
              color: '#fff',
              padding: '12px 16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
            }}
            formatter={(value: any) => [`${value} 分`, '得分']}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* 维度详情 */}
      <div className="grid grid-cols-5 gap-4 mt-6">
        {data.map((dim, index) => {
          const IconComponent = dim.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="text-center"
            >
              <div
                className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white shadow-lg relative group hover:scale-110 transition-transform duration-200"
                style={{
                  backgroundColor: dim.color,
                  boxShadow: `0 4px 20px ${dim.color}40`
                }}
              >
                <IconComponent size={28} className="group-hover:scale-110 transition-transform duration-200" />
                <div className="absolute -top-1 -right-1 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center border-2 border-gray-800">
                  <span className="text-xs font-bold text-gray-800">{dim.value}</span>
                </div>
              </div>
              <div className="text-xs text-gray-400 font-medium">{dim.dimension}</div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

export default CreditRadarChart


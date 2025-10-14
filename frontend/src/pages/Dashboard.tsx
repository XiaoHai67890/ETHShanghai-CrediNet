import { motion } from 'framer-motion'
import { mockUser, mockCreditScore } from '@/mock/data'
import CreditRadarChart from '@/components/charts/CreditRadarChart'
import SBTBadgePreview from '@/components/dashboard/SBTBadgePreview'
import DataSourcesPanel from '@/components/dashboard/DataSourcesPanel'
import CRNBalanceCard from '@/components/dashboard/CRNBalanceCard'
import EcoAppsGrid from '@/components/dashboard/EcoAppsGrid'
import UsageRecordsTable from '@/components/dashboard/UsageRecordsTable'
import { Copy } from 'lucide-react'

const Dashboard = () => {
  const handleCopyDID = () => {
    navigator.clipboard.writeText(mockUser.did)
    // TODO: 添加Toast提示
    alert('DID已复制到剪贴板')
  }

  return (
    <div className="space-y-6">
      {/* 用户DID卡片 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="gradient-border-card"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="text-blue-400">🔷</span>
                DID: {mockUser.did}
              </h1>
              <button
                onClick={handleCopyDID}
                className="p-2 rounded-lg bg-dark-card hover:bg-dark-hover transition-colors"
                title="复制DID"
              >
                <Copy size={16} className="text-gray-400" />
              </button>
            </div>
            <div className="text-sm text-gray-400">
              <span>Address: {mockUser.address}</span>
              <span className="mx-2">•</span>
              <span>Last update: {mockUser.lastSync}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400 mb-1">C-Score</div>
            <div className="text-5xl font-bold text-gradient">
              {mockCreditScore.total}
            </div>
            <div className="text-sm text-emerald-400 mt-1">
              ▲ {mockCreditScore.change}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 信用光谱和SBT勋章 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CreditRadarChart />
        <SBTBadgePreview />
      </div>

      {/* CRN余额 */}
      <CRNBalanceCard />

      {/* 数据接入状态 */}
      <DataSourcesPanel />

      {/* 生态应用入口 */}
      <EcoAppsGrid />

      {/* 使用与收益记录 */}
      <UsageRecordsTable />
    </div>
  )
}

export default Dashboard


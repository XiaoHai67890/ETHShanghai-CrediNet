import { useState } from 'react'
import { motion } from 'framer-motion'
import ToggleSwitch from '@/components/ui/ToggleSwitch'
import { mockDataSources } from '@/mock/data'
import type { DataSource } from '@/types'

const DataSourcesPanel = () => {
  const [dataSources, setDataSources] = useState<DataSource[]>(mockDataSources)

  const handleToggle = (id: string, checked: boolean) => {
    setDataSources((prev) =>
      prev.map((ds) =>
        ds.id === id
          ? {
              ...ds,
              connected: checked,
              connectedAt: checked ? new Date().toISOString() : undefined
            }
          : ds
      )
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="glass-card"
    >
      <h2 className="text-2xl font-bold text-white mb-6">数据接入</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {dataSources.map((source, index) => (
          <motion.div
            key={source.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="flex flex-col items-center p-4 rounded-xl bg-dark-card/50 border border-dark-border hover:border-primary-500/50 transition-all duration-300"
          >
            <div className="text-sm font-semibold text-white mb-3">
              {source.name}
            </div>
            <ToggleSwitch
              checked={source.connected}
              onChange={(checked) => handleToggle(source.id, checked)}
            />
            {source.connected && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 text-xs text-emerald-400"
              >
                ✓ 已连接
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default DataSourcesPanel


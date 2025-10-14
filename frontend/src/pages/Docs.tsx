import { motion } from 'framer-motion'
import { BookOpen, Github, FileText, ExternalLink } from 'lucide-react'

const Docs = () => {
  const docLinks = [
    {
      title: 'CrediNet 白皮书',
      description: '了解CrediNet的核心理念、技术架构和经济模型',
      icon: <FileText size={24} />,
      link: '/doc/CrediNet白皮书（中文版）.md',
      external: false
    },
    {
      title: 'PRD 产品文档',
      description: '查看完整的产品需求文档和技术规格',
      icon: <BookOpen size={24} />,
      link: '/docs/PRD.md',
      external: false
    },
    {
      title: 'World ID 文档',
      description: 'World ID集成指南和API文档',
      icon: <ExternalLink size={24} />,
      link: 'https://docs.worldcoin.org/',
      external: true
    },
    {
      title: 'self.xyz 文档',
      description: 'self.xyz SDK使用指南',
      icon: <ExternalLink size={24} />,
      link: 'https://docs.self.xyz/',
      external: true
    },
    {
      title: 'GitHub 仓库',
      description: '查看源代码和贡献指南',
      icon: <Github size={24} />,
      link: 'https://github.com/your-repo/credinet',
      external: true
    }
  ]

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-4xl font-bold text-gradient mb-3 italic">Docs</h1>
        <p className="text-gray-400 text-lg">
          探索 CrediNet 的技术文档和资源
        </p>
      </motion.div>

      {/* 文档卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {docLinks.map((doc, index) => (
          <motion.a
            key={index}
            href={doc.link}
            target={doc.external ? '_blank' : '_self'}
            rel={doc.external ? 'noopener noreferrer' : undefined}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="glass-card hover:shadow-glow transition-all duration-300 group cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                {doc.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  {doc.title}
                  {doc.external && (
                    <ExternalLink size={14} className="text-gray-500 group-hover:text-cyan-400 transition-colors" />
                  )}
                </h3>
                <p className="text-sm text-gray-400">{doc.description}</p>
              </div>
            </div>
          </motion.a>
        ))}
      </div>

      {/* 快速链接 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="glass-card"
      >
        <h2 className="text-2xl font-bold text-white mb-4">快速开始</h2>
        <div className="space-y-3 text-gray-300">
          <div className="flex items-start gap-3">
            <span className="text-cyan-400">1.</span>
            <p>阅读白皮书了解CrediNet的愿景和技术架构</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-cyan-400">2.</span>
            <p>查看PRD文档了解产品功能和开发计划</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-cyan-400">3.</span>
            <p>参考World ID和self.xyz文档集成身份验证</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-cyan-400">4.</span>
            <p>访问GitHub仓库查看源代码和贡献指南</p>
          </div>
        </div>
      </motion.div>

      {/* 技术栈 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="glass-card"
      >
        <h2 className="text-2xl font-bold text-white mb-4">技术栈</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'React', version: '18.3' },
            { name: 'TypeScript', version: '5.6' },
            { name: 'TailwindCSS', version: '3.4' },
            { name: 'Vite', version: '5.4' },
            { name: 'ethers.js', version: '6.13' },
            { name: 'Recharts', version: '2.12' },
            { name: 'Framer Motion', version: '11.5' },
            { name: 'RainbowKit', version: '2.1' }
          ].map((tech, index) => (
            <div
              key={index}
              className="p-3 rounded-lg bg-dark-card/50 border border-dark-border text-center"
            >
              <div className="text-sm font-semibold text-white">{tech.name}</div>
              <div className="text-xs text-gray-400 mt-1">v{tech.version}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default Docs


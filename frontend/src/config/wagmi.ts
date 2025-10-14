import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, sepolia, polygon, polygonMumbai, arbitrum, optimism } from 'wagmi/chains'

// 配置支持的链
export const config = getDefaultConfig({
  appName: 'CrediNet',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID', // 从 WalletConnect Cloud 获取
  chains: [
    mainnet,
    sepolia, // 测试网
    polygon,
    polygonMumbai, // Polygon 测试网
    arbitrum,
    optimism,
  ],
  ssr: false, // 如果使用 SSR，设置为 true
})

// 导出链配置
export { mainnet, sepolia, polygon, polygonMumbai, arbitrum, optimism }


import type { 
  User, 
  CreditScore, 
  CRNBalance, 
  DataSource, 
  UsageRecord, 
  SBTBadge, 
  EcoApp,
  DataAuthorization 
} from '@/types'

// Mock用户信息
export const mockUser: User = {
  did: 'did:cred:0x12...9a4',
  address: '0xA1B2...C3D4',
  joinedDate: '2025-01-13',
  lastSync: '2025-10-10',
  displayName: 'CrediNet User'
}

// Mock信用分数
export const mockCreditScore: CreditScore = {
  total: 782,
  change: 12,
  dimensions: {
    keystone: 85,
    ability: 78,
    finance: 72,
    health: 68,
    behavior: 81
  },
  lastUpdated: '2025-10-10 14:20'
}

// Mock CRN余额
export const mockCRNBalance: CRNBalance = {
  balance: 1234.56,
  change30d: 182.4,
  earned: 1500.00,
  withdrawn: 265.44
}

// Mock数据源
export const mockDataSources: DataSource[] = [
  {
    id: 'worldid',
    name: 'World ID',
    description: '通过 World ID 验证您的人类身份',
    connected: true,
    connectedAt: '2025-10-08 10:30'
  },
  {
    id: 'self',
    name: 'self.xyz',
    description: '连接 self.xyz 获取链下凭证',
    connected: true,
    connectedAt: '2025-10-09 15:20'
  },
  {
    id: 'wallet',
    name: 'Wallet',
    description: '连接钱包获取链上活动数据',
    connected: false
  },
  {
    id: 'offchain',
    name: 'Off-chain VC',
    description: '上传链下可验证凭证',
    connected: true,
    connectedAt: '2025-10-07 09:15'
  }
]

// Mock使用记录
export const mockUsageRecords: UsageRecord[] = [
  {
    id: '1',
    timestamp: '10-10 14:20',
    appName: 'DeFi 协议 A',
    queryContent: '查询 C-Score',
    scope: '额度评估',
    reward: 3.2,
    status: 'authorized'
  },
  {
    id: '2',
    timestamp: '10-09 21:02',
    appName: '招聘平台 B',
    queryContent: '教育 VC',
    scope: '简历验证',
    reward: 1.1,
    status: 'authorized'
  },
  {
    id: '3',
    timestamp: '10-08 11:36',
    appName: '保险平台 C',
    queryContent: '行为数据',
    scope: '风险定价',
    reward: 0.8,
    status: 'authorized'
  },
  {
    id: '4',
    timestamp: '10-07 16:45',
    appName: 'Social Graph',
    queryContent: 'Off-chain VC',
    scope: '社交网络构建',
    reward: 2.5,
    status: 'authorized'
  },
  {
    id: '5',
    timestamp: '10-06 09:12',
    appName: 'DAO Platform',
    queryContent: '链上贡献记录',
    scope: '治理权重计算',
    reward: 4.0,
    status: 'authorized'
  }
]

// Mock SBT勋章
export const mockSBTBadges: SBTBadge[] = [
  {
    id: '1',
    name: 'Early Adopter',
    description: '首批加入 CrediNet 的用户',
    earnedDate: '2025-03-02',
    rarity: 'epic'
  },
  {
    id: '2',
    name: 'KYC-lite Verified',
    description: '通过 World ID 验证',
    earnedDate: '2025-03-05',
    rarity: 'rare'
  },
  {
    id: '3',
    name: 'Builder',
    description: '链上贡献者，参与了 12 个项目',
    earnedDate: '2025-04-15',
    rarity: 'legendary'
  }
]

// Mock生态应用
export const mockEcoApps: EcoApp[] = [
  {
    id: '1',
    name: 'C-Score Oracle',
    description: '即时查询用户 C-Score（只读）',
    category: 'defi',
    requiredDimensions: ['行为 B', '能力 A'],
    status: 'active'
  },
  {
    id: '2',
    name: 'DeFi Credit Line',
    description: '基于信誉的信贷额度',
    category: 'defi',
    requiredDimensions: ['C-Score 快照'],
    status: 'active'
  },
  {
    id: '3',
    name: 'Talent Passport',
    description: '教育/技能 VC 一键验证',
    category: 'talent',
    requiredDimensions: ['可雇佣授权'],
    status: 'active'
  },
  {
    id: '4',
    name: 'Insurance Quote',
    description: '基于信誉的保险折扣',
    category: 'insurance',
    requiredDimensions: ['行为类类'],
    status: 'active'
  },
  {
    id: '5',
    name: 'Social Graph',
    description: '隐私保护的关系度量',
    category: 'social',
    requiredDimensions: ['整合 Off-chain VC'],
    status: 'active'
  },
  {
    id: '6',
    name: 'KYC-lite',
    description: '零知识证明快速入场',
    category: 'kyc',
    requiredDimensions: ['World ID'],
    status: 'active'
  },
  {
    id: '7',
    name: 'DAO Governance',
    description: '基于信用的治理权重',
    category: 'dao',
    requiredDimensions: ['链上贡献记录'],
    status: 'coming-soon'
  },
  {
    id: '8',
    name: 'Cross-border Credit',
    description: '跨境信用验证服务',
    category: 'defi',
    requiredDimensions: ['全维度授权'],
    status: 'coming-soon'
  }
]

// Mock数据授权
export const mockDataAuthorizations: DataAuthorization[] = [
  {
    appId: '1',
    appName: 'DeFi_DApp',
    authorizedDimensions: ['行为 B', '能力 A', '基石 K'],
    authorizedAt: '2025-10-05 14:30',
    status: 'active'
  },
  {
    appId: '2',
    appName: '招聘_DApp',
    authorizedDimensions: ['财富 VC（引微信）'],
    authorizedAt: '2025-10-06 09:15',
    status: 'active'
  },
  {
    appId: '3',
    appName: '保险_DApp',
    authorizedDimensions: ['C-Score（只读快照）'],
    authorizedAt: '2025-10-07 16:45',
    status: 'active'
  }
]

// 信用维度配置
export const creditDimensions = [
  { key: 'keystone', name: '基石 K', color: '#8b5cf6', weight: '25%' },
  { key: 'ability', name: '能力 A', color: '#3b82f6', weight: '30%' },
  { key: 'finance', name: '财富 F', color: '#f59e0b', weight: '20%' },
  { key: 'health', name: '健康 H', color: '#10b981', weight: '15%' },
  { key: 'behavior', name: '行为 B', color: '#ef4444', weight: '10%' }
]

// 应用分类
export const appCategories = [
  { id: 'all', name: '全部', icon: '🌐' },
  { id: 'defi', name: 'DeFi', icon: '💰' },
  { id: 'talent', name: '招聘', icon: '💼' },
  { id: 'insurance', name: '保险', icon: '🛡️' },
  { id: 'social', name: '社交', icon: '👥' },
  { id: 'dao', name: 'DAO', icon: '🏛️' },
  { id: 'kyc', name: 'KYC', icon: '🔐' }
]


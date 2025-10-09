# CrediNet-MVP
# CrediNet 前端开发框架设计方案

## 页面结构与路由架构（React Router）

我们将采用 React Router v6 来管理单页应用（SPA）的路由。根据 CrediNet 项目的需求，划分如下主要页面，并为每个页面定义清晰的路由路径：

- **登录 / 注册页** – 提供邮箱或手机号登录注册功能，对应路由如 `/login`（可在此页面内切换登录和注册模式）。
- **DID 用户主页** – 显示用户的去中心化身份（DID）及概要信息，对应路由如 `/dashboard` 或 `/did`。
- **身份绑定页** – 供用户绑定各种身份凭证（邮箱、手机号、微信、Twitter、Facebook、GitHub、World ID 活体证明、区块链钱包地址等），对应路由如 `/settings/bind` 或 `/profile/bindings`。
- **数据授权页** – 列出所有数据源选项，允许用户勾选授权共享的数据，路由可设为 `/settings/consent` 或 `/data/authorize`。
- **信用分可视化页** – 显示用户的信用分（0–1000）及各维度解释说明，对应路由 `/credit-score`。
- **欢迎引导页** – 新用户首次登录后的欢迎动画和引导界面，展示用户 DID、绑定状态和评分生成进度等，可设为 `/welcome`。老用户访问根路径 `/` 时也可跳转到此页面或 Dashboard。

上述路由可以进一步分为公开路由和需登录的私有路由。公开路由包括登录 / 注册页和欢迎页，私有路由包括 DID 主页、绑定、授权、信用分等页面。在路由配置上，我们会设置路由守卫：未登录用户若访问受保护路由，则自动重定向到登录页并在登录后返回原请求页面。例如实现一个 `ProtectedRoute` 组件，在渲染受保护页面前检查认证状态，未登录则 `<Navigate>` 重定向到 `/login?from=原路径`。

路由架构将采用扁平化配置：使用 `<BrowserRouter>` 包裹主应用，在应用入口处定义 `AppRoutes` 集中管理路由。我们会运用 React Router 的 `useRoutes` 或 `<Routes>` 配置路由表：可以按照模块将路由拆分为多个配置文件（如 `publicRoutes.ts`, `privateRoutes.ts` 等），然后在主路由文件中合并。这样有利于路由结构清晰、分离公开 / 私有页面。同时配置一个通配符路由用于 404 页面处理。示例：

```tsx
// 示例：使用 useRoutes
const routes = [
  // 公共路由
  { path: '/login', element: <LoginPage /> },
  { path: '/welcome', element: <WelcomePage /> },
  // 私有路由（受保护）
  { path: '/did', element: <ProtectedRoute><DidPage/></ProtectedRoute> },
  { path: '/settings/bind', element: <ProtectedRoute><BindPage/></ProtectedRoute> },
  { path: '/settings/consent', element: <ProtectedRoute><ConsentPage/></ProtectedRoute> },
  { path: '/credit-score', element: <ProtectedRoute><ScorePage/></ProtectedRoute> },
  // Fallback 404
  { path: '*', element: <NotFoundPage /> }
];
```

此外，我们会设计布局组件来复用页面框架。比如主应用的 `<App>` 组件包含通用的导航栏、页脚等，对于需要登录的内部页面使用统一布局，登录 / 注册等页面则可以使用简化布局。React Router v6 支持嵌套路由或在路由表中指定 `element` 包裹，这里简化处理，在 `<App>` 中根据当前路径条件渲染不同布局。

## 状态管理方式与模块划分（Redux Toolkit 等）

全局状态管理将优先采用 Redux Toolkit 来管理应用的核心状态，并按模块切分 slice。Redux Toolkit 能简化 Redux 样板代码，提供模块化的 slice 和异步 thunk 方案，使状态更新可预测且高效。针对 CrediNet 的功能，我们规划以下 Redux 模块：

- **Auth 模块**：管理用户的认证信息（如登录状态、JWT token 等）以及基本个人信息。提供登录、注销的 action；在全局 state 中用于判断 `isLoggedIn` 以及存储当前用户 ID / DID 等。
- **Identity 模块**：管理用户各类身份绑定数据（邮箱、社交账号、钱包地址等）。使用 Redux 存储绑定状态列表，便于在绑定页和其他页面（如欢迎页）共享状态。
- **Consent 模块**：管理用户对数据源的授权选择。可维护一个授权项列表的状态，在用户勾选 / 取消授权时更新，用于后续调用接口提交以及在前端控制 UI 显示已授权项。
- **Score 模块**：管理用户信用评分及其维度数据。可存储当前信用分值、各维度得分，更新时间等，以便在信用分可视化页展示，并可能在欢迎页显示评分生成的进度。
- **UI 全局状态（可选）**：一些全局的 UI 状态如主题（暗色 / 亮色）、多语言设置或通用的加载状态等。如果需要全局控制，可用一个 slice 或使用 React Context 简单管理。

采用 Redux Toolkit 可以方便地将以上每个模块实现为独立的 slice，分别定义初始状态和 reducer。最终使用 `configureStore` 将这些 slice 合并。这样各模块既独立又可组合，代码清晰模块化。

除了 Redux，全局状态很少且简单的情况下也可考虑 React Context。但 Context 不便于复杂更新和调试。本项目涉及用户认证和多模块数据，更适合 Redux 集中管理。我们仅将小范围的局部状态（如某个组件的临时 UI 状态）留在组件内部或使用 Context，关键全局状态使用 Redux 托管，以确保可预测性和可维护性。

为了配合 Redux，我们会使用 Redux Toolkit 的 `createSlice` 创建上述模块，并使用 Redux Provider 在应用入口提供 store。每个 slice 放置在对应模块目录（如 `src/features/auth/authSlice.ts`）。组件通过 `useSelector` 获取状态，`useDispatch` 分发异步 thunk（例如登录请求）或普通 action。这样状态流清晰单向，方便在复杂交互下保持状态一致。

## 组件划分策略（原子化组件）

组件层次将遵循 Atomic Design（原子设计）方法论进行划分。Atomic Design 将界面分解为不同层级的组件，从最小的原子组件逐步组合形成页面，有助于提高复用性和维护性。具体划分如下：

- **原子（Atoms）**：最基础的不可再分的组件单位，例如按钮、输入框、图标、文本标签等，这些通常对应原生 HTML 元素或简单封装。设计上，每个原子组件只负责一种 UI 元素的渲染和基本交互，例如一个独立的按钮组件就是一个原子。
- **分子（Molecules）**：由一个或多个原子组合而成的简单功能块。例如带标签的输入框、包含图标和文字的按钮等。分子组件实现局部的小型功能，比如表单项由“标签 + 输入框”组成就是一个分子组件。
- **有机体（Organisms）**：更复杂的组件结构，由多个原子和分子组成，完成独立的较大功能模块。例如导航栏（包含 Logo、菜单项、搜索框等原子 / 分子）、用户信息卡片（包含头像、用户名、简介等）都属于有机体。有机体组件通常可以独立存在并完成一定业务功能。
- **模板（Templates）**：页面模板，由多个有机体和其他组件构成页面的布局骨架。模板关注布局本身，不填充具体数据。例如通用的页面框架模板包含头部、侧边栏、主内容区等区域划分。
- **页面（Pages）**：具体页面，即在模板的结构上填充真实内容和数据，形成最终呈现给用户的界面。页面组件通常对应路由，一个页面组件内部会组合调用多个原子 / 分子 / 有机体组件，并在加载时通过接口获取真实数据。例如用户的个人资料页就是一个 Page 级组件，它基于模板布局，填入了某用户的真实信息。

按照上述体系，我们将搭建组件目录结构。例如：

```
src/components/
├── atoms/        # 原子组件，如 Button, Input, Icon 等
├── molecules/    # 分子组件，如 FormItem(标签+输入框), AvatarName 等
├── organisms/    # 有机体组件，如 Navbar, UserCard, Footer 等
├── templates/    # 模板组件，如 MainLayout, DashboardLayout 等
└── pages/        # 页面组件，对应路由页面，如 LoginPage, DidPage 等
```

采用原子化组件策略，可确保 UI 的一致性和高复用性。例如，我们创建统一风格的 Button 原子组件，各处按钮都调用它，从而样式一致且修改方便。一处修改 Button 组件即可反映到全局。此外，小粒度组件组合出复杂界面，提高了开发效率和可维护性。注意避免过度细分组件层级，以防组件数量过多增加维护难度。保持原子设计层级的适度颗粒度即可满足需求。

组件开发时遵循自下而上原则：先开发设计规范内的原子组件，再组合成更高级组件，最后组装成页面。每个组件都有清晰的职责边界，尽量避免巨石组件。

## Mock 数据支持与开发联调（MSW 模拟接口）

为了在前后端并行开发或无后端服务时顺利进行前端开发，我们将引入 Mock Service Worker (MSW) 作为模拟后端 API 的方案。MSW 是一个基于 Service Worker 的前端 API Mock 库，能够在浏览器拦截网络请求并返回模拟数据。它的作用是在开发阶段模拟真实接口的响应，使前端无需等待后端完成即可自主联调。

MSW 的使用方式：在项目中安装 `msw`，并初始化一个 Service Worker 脚本。我们会创建例如 `src/mocks/handlers.ts` 定义所有接口的模拟响应规则。每个规则使用 `rest.get` / `rest.post` 等方法匹配特定 URL 和 HTTP 方法，然后提供返回的数据。例如：

```ts
// handlers.ts
import { rest } from 'msw';

export const handlers = [
  // 模拟 GET /api/user 返回用户信息
  rest.get('/api/user', (req, res, ctx) => {
    return res(ctx.json({ id: 1, name: 'Alice', email: 'alice@example.com' }));
  }),
  // 模拟其他接口...
];
```

在应用初始化时（如 `src/main.tsx`）启动 MSW 拦截服务：

```ts
if (import.meta.env.DEV) {
  const { worker } = require('./mocks/browser');
  worker.start();
}
```

这样，当前端代码调用 `/api/user` 时，MSW 会拦截该请求并返回预定义的模拟数据，而不会真的发往后端。我们将仅在开发环境启用 MSW，在生产环境禁用以免拦截真实请求。

Mock 数据管理：为了生成逼真的测试数据，我们可以借助例如 Faker.js 或 `@mswjs/data` 等工具库来动态创建假数据。Faker.js 可以随机生成姓名、地址、数字等各种类型的数据，非常适合模拟信用分和各维度说明等内容。使用 `@mswjs/data` 则可以在前端建立一个模拟数据库，定义模型后插入假数据，用代码方式提供给 MSW 响应。根据需要，我们会选择合适的假数据方案，使前端在脱离真实后端时也有丰富的数据可用。

通过 MSW 的引入，前端工程师在开发和联调阶段可以独立于后端进行工作，提高效率。接口联调时，先使用 MSW 模拟各种状态（成功 / 失败 / 空数据），待后端就绪后再切换到真实接口进行集成测试。整个过程对前端代码无侵入，既方便开发，也确保最终对接真实后端时逻辑稳定。

## 接口调用组织方式（数据获取与 SWR）

在数据请求层面，我们将采用基于 Hooks 的请求封装方案，以提升代码可读性并简化数据管理。主要有两种思路：

1. **使用 SWR 库**：SWR 是由 Vercel 团队推出的 React Hooks 数据请求库，其名称源于 HTTP 的 “stale-while-revalidate” 缓存策略。SWR 的核心优势是开箱即用的缓存、自动重新验证数据、错误重试等功能，使组件能够持续获得最新数据而界面保持高速响应。使用 SWR 非常简单：只需提供请求的 Key（通常是 URL）和一个 fetcher 函数，SWR hook 会返回 `data` 和 `error` 等状态。例如：

   ```tsx
   import useSWR from 'swr';
   import axios from 'axios';

   const fetcher = (url: string) => axios.get(url).then(res => res.data);

   function CreditScorePage() {
     const { data, error, isLoading } = useSWR('/api/credit-score', fetcher);
     // ...
   }
   ```

   在上述示例中，我们定义了使用 Axios 的 `fetcher`，然后通过 `useSWR('/api/credit-score', fetcher)` 发起请求。SWR 自动处理请求缓存，并根据键值确保对相同接口的组件只请求一次数据而重复利用缓存结果。获取到的数据在 `data` 中，错误信息在 `error`，还有 `isLoading` 等状态可以使用。这种方式免除了手动管理 `useEffect` 中请求和 loading 状态的繁琐逻辑。

   SWR 应用：对于用户 DID 信息、信用分详情等读取类接口非常适用。我们可为每种数据封装一个自定义 Hook（如 `useCreditScore()` 内部调用 `useSWR('/api/credit-score', fetcher)`），组件使用自定义 Hook 来获取数据，更语义化。SWR 还支持增量更新和主动刷新（通过 `mutate`），可在用户完成某操作后手动触发数据刷新，保持界面同步。

2. **自定义 Axios Hooks**：对于某些需要精细控制或不适合全局缓存的接口调用，我们可以自己封装 React Hook 搭配 Axios。通过自定义 Hook（如 `useFetchData(url, options)`）管理请求的发送、loading 和 error 状态。这种方式需要我们在 Hook 内部使用 `useEffect` 发请求，并用 `useState` 管理数据和错误，比直接用 SWR 稍显繁琐。不过它适用于一些一次性提交 / 确认类操作（如表单提交接口）或者我们想将结果直接存入 Redux 的情况。

为了更好的代码组织，我们会将各 API 请求封装在服务模块中。例如创建 `src/api/userApi.ts` 定义诸如 `login(data)`, `fetchCreditScore()` 等函数，这些函数内部用 Axios 调用后端，然后在组件中通过上述 SWR 或自定义 Hook 使用这些服务函数。这样接口调用集中管理，方便统一处理错误、设置请求拦截器（如添加认证 token）等。我们也会配置 Axios 的全局实例，设定 `baseURL`、超时和拦截器，实现请求和响应的统一处理（如未登录跳转登录、错误日志等）。

综上，对于大部分需缓存的 GET 数据，我们倾向使用 `useSWR` 方案，高效获取和更新数据；对于不需要缓存或交互性的操作（POST / PUT 等），可直接用 Axios 调用或封装成 Redux 异步 thunk。这样组合实现“读取用 SWR，变更用 Axios / Redux”，各取所长，让应用的数据管理既性能优秀又易于维护。

## Tailwind CSS 样式规范与设计指导

本项目采用 Tailwind CSS 作为 UI 样式方案，将充分利用其原子类实用工具和设计系统来实现快速、美观的一致性设计。为确保团队协作中样式风格统一，我们制定以下 Tailwind 使用规范：

- **定制主题与设计系统**：在 Tailwind 配置文件（如 `tailwind.config.js`）中自定义项目的主题颜色、字体和间距刻度等。比如设置品牌色、次要色的色值映射，定义统一的圆角尺寸、阴影样式等。通过 Tailwind 的主题扩展机制，所有组件都使用这些预设变量，保证设计的一致性和可维护性。例如，定义 `colors: { brand: { DEFAULT: '#123456', dark: '#0F2233', ... } }` 供全局使用，然后在类名中使用 `text-brand` 等调用。
- **原子类规范使用**：Tailwind 提供的大量原子类应当充分利用，避免随意写内联样式或额外 CSS。开发中，我们鼓励用组合原子类实现设计，例如用 `p-4 text-center bg-gray-100 rounded` 这类类名直接描述样式。Tailwind 的预设设计体系专业且易用，即使缺乏设计经验也能快速实现美观界面。切忌过度覆盖 Tailwind 的样式或使用 `!important`，尽量在其规范内定制，以免破坏一致性。
- **组件样式封装**：对于经常复用的样式组合，提倡封装为组件或使用 `@apply` 提取。在原子设计体系下，很多 atoms 组件本身就封装了一组 Tailwind 类。例如我们实现一个 Button 原子组件，在其内部固定使用一组类（如 `px-4 py-2 font-semibold rounded bg-brand text-white hover:bg-brand-dark`），那么项目中所有按钮直接使用该组件即可，无需每次写类名，保证风格统一。此外，对于多处重复的样式组合，也可以在全局 CSS 中利用 Tailwind 的 `@apply` 指令创建一个工具类，但需谨慎使用，避免滥用导致样式变更困难。
- **响应式和暗色模式**：Tailwind 内置了响应式和暗色模式支持。我们将遵循移动优先设计，编写样式时默认为移动端样式，然后利用 Tailwind 提供的断点前缀（如 `sm:`, `md:`, `lg:` 等）实现更大屏幕的布局优化。例如：`<div class="p-4 sm:p-6 md:p-8">` 在不同屏宽下有不同内边距。这样确保各页面在手机、平板、桌面设备上都能良好展示。在需要支持暗色模式的情况下，可在配置中开启 `darkMode: 'class'`，通过在 HTML 根节点切换类名实现暗色样式，如使用 `dark:bg-gray-800` 等类名定义夜间样式方案。
- **设计指导**：我们将遵循统一的设计规范，包括字号层次（例如 Tailwind 的 `text-sm`, `text-base`, `text-lg` 等），间距使用统一的刻度（如只能用 Tailwind 预设的 `m-2` / `m-4` / ...），颜色选择限定在主题色和中性色调范围，不随意使用未定义的颜色。借助 Tailwind 的约束，我们避免使用非设计系统内的值，从而保持视觉一致性。对于特殊设计稿要求的 UI，我们在 Tailwind 无法直接支持时，再考虑写自定义 CSS 或引入少量组件库补充。
- **类名约定**：由于 Tailwind 类名即样式，无需自定义命名，但在 JSX 中我们会注意可读性和简洁。可以将较长的类名字符串拆成多行书写，或利用模板字符串。对于条件样式，可借助 `clsx` 等库管理类名。总之，确保 HTML 结构清晰、类名不过度冗长，易于团队理解和调整。

通过以上规范，Tailwind CSS 将成为我们团队高效构建 UI 的有力工具：它提供的响应式实用类使布局适配移动端非常容易；其预设设计体系让我们即使缺少专职设计师也能保持专业、美观的一致视觉效果。

## 响应式设计建议

CrediNet 前端将采用响应式网页设计，确保不同设备上都有良好的用户体验。具体策略如下：

1. **移动优先**：按照移动优先原则进行开发，即默认样式针对移动端屏幕，然后通过媒体查询（Tailwind 的断点类）适配到更大屏幕。这意味着先确保在小屏手机上各模块纵向排列、内容可阅读，再针对平板、桌面增加横向布局、边距调整等。Tailwind CSS 提供了丰富的响应式工具类，使我们可以在不同屏幕尺寸下应用不同样式，只需使用如 `sm:`, `md:`, `lg:`, `xl:` 前缀设置样式即可。例如一个三栏布局组件，可以在移动端通过 `flex flex-col` 让栏目垂直堆叠，到中等屏幕时用 `md:flex-row` 切换为水平布局。
2. **断点规划**：Tailwind 默认断点 `sm` (≥640px), `md` (≥768px), `lg` (≥1024px), `xl` (≥1280px) 基本覆盖常见设备。我们将根据设计稿和用户群设备情况，合理利用这些断点。比如登录页在手机上表单全宽单列，`md` 以上设备则居中显示一个面板；导航栏在 `lg` 以上显示完整菜单，在 `md` 以下折叠为汉堡菜单；信用分可视化页面在移动端各图表纵向堆叠，`lg` 桌面端则可以网格布局等。必要时可在 Tailwind 配置中调整断点数值或添加自定义断点，但尽量使用内置值以降低复杂度。
3. **弹性与网格布局**：充分利用 CSS Flexbox 和 Grid 的弹性特性来适应不同屏幕。Tailwind 提供了简洁的类名封装 Flex 和 Grid，例如 `flex-wrap` 实现自动换行，`grid-cols-2 md:grid-cols-4` 动态控制列数等，使布局在各种尺寸下自动调整。我们将为主要页面设计弹性布局方案，例如 Dashboard 页面采用 grid 布局，定义各卡片在小屏下一列、多屏多列的排列方式，确保不论宽度多少都能合理填充且不留空白或溢出。
4. **文字与可读性**：注意不同屏幕上的文字大小和留白。Tailwind 的排版工具类（如 `text-sm`, `text-lg`, `leading-*` 行高类等）将用于调整文字在小屏时的可读性。在小屏幕上避免过小字体和过长行宽，`md` 以上再提升字体尺寸或增加栏数。比如我们可能设置 `.score-number { @apply text-4xl md:text-6xl font-bold; }` 来在手机上适中显示信用分，在桌面上更大显示以增强视觉层次。
5. **测试与调优**：我们将在开发过程中使用浏览器的设备模拟和实际设备测试不同页面，及时调整断点样式。例如确保欢迎动画页在窄屏不出现裁剪、文字不溢出；数据授权页的多选项列表在小屏可滚动查看。Tailwind 使我们可以快速试验不同布局，通过添加 / 移除实用类验证效果，从而高效地完成响应式调优。

总之，通过合理的断点规划和 Tailwind 响应类的运用，再结合弹性布局，我们能实现界面从手机到桌面的流畅过渡。开发团队应始终考虑移动端体验，逐步增强到桌面，确保关键功能在各尺寸下均可访问和操作。

## 开发目录结构

为了提高项目可维护性和团队协作效率，我们将采用清晰的分层目录结构来组织前端代码。主要按照功能模块（features）和通用组件层次相结合的方式划分，使得目录层次既体现业务模块，又方便共享通用组件。建议的项目目录结构如下：

```
src/
├── components/         # 原子 / UI 组件库（可进一步按 atoms, molecules 等子目录）
│   ├── atoms/          # 原子组件：Button.tsx, Input.tsx, Icon.tsx 等
│   ├── molecules/      # 分子组件：FormItem.tsx, AvatarName.tsx 等
│   ├── organisms/      # 有机体组件：Navbar.tsx, UserCard.tsx 等
│   └── ...（如有需要还可按模板 / 布局等分类）
│
├── features/           # 业务功能模块代码
│   ├── auth/           # Auth 模块：登录 / 注册相关组件、hooks、redux slice 等
│   │   ├── LoginPage.tsx
│   │   ├── authSlice.ts
│   │   └── hooks.ts    # 例如 useLogin / useLogout hooks
│   ├── identity/       # 身份绑定模块：绑定页面组件、slice、hooks 等
│   ├── consent/        # 数据授权模块
│   ├── score/          # 信用分模块
│   └── ...（其他模块按需）
│
├── pages/              # 路由页面组件（如果不放入 features，可以单独维护）
│   ├── WelcomePage.tsx
│   ├── DidDashboard.tsx
│   ├── BindingsPage.tsx
│   ├── ConsentPage.tsx
│   └── CreditScorePage.tsx
│
├── api/                # API 接口封装
│   ├── http.ts         # Axios 实例配置（baseURL, 拦截器）
│   ├── authApi.ts      # 认证相关请求（login, logout 等）
│   ├── userApi.ts      # 用户 / DID 相关请求
│   ├── scoreApi.ts     # 分数相关请求
│   └── ...
│
├── store/              # 全局状态管理
│   ├── index.ts        # Redux store 配置（combine 各 slice 并导出 store）
│   └── slices/         # （可选）将各 feature 的 slice 汇总存放
│
├── hooks/              # 通用自定义 Hooks
│   └── useDarkMode.ts  # 示例：检测或切换暗色模式的 Hook 等
│
├── styles/             # 全局样式和 Tailwind 配置
│   ├── index.css       # Tailwind 引入及全局自定义样式
│   └── tailwind.config.js
│
├── mocks/              # Mock 数据与 MSW
│   ├── handlers.ts     # MSW 接口拦截定义
│   ├── browser.ts      # MSW browser 端启动脚本
│   └── ... 
│
├── App.tsx             # 应用根组件，路由和全局 Layout 入口
├── main.tsx            # 应用入口，ReactDOM.render，注入 Provider 等
└── index.html          # 静态模版
```

上述结构中，`components/` 放置纯展示型的通用组件（遵循原子设计分类）供各处使用；`features/` 依据业务领域划分模块，每个模块下可以有自己的页面组件、Redux slice、业务逻辑代码等，实现按领域垂直划分，使团队可以各自专注于某模块开发而互不影响。`pages/` 列出路由级组件，可以作为简单的路由入口组件，内部再组合各 feature 提供的组件。如果我们选择将页面组件直接放在 features 对应模块下，也可以省略独立的 `pages` 目录，这取决于团队喜好。在本方案中，为直观起见列出了 `pages` 目录，但实际实现时可以融合 `pages` 和 `features`。

`api/` 目录集中管理接口调用，实现前后端隔离和易维护。`store/` 则集中 Redux 配置，虽然每个 feature 可以有自己的 slice 文件，但最终汇总在此。`styles/` 用于 Tailwind 的全局样式引入和配置文件，避免散落在各处。`mocks/` 则是 MSW 模拟数据相关配置，确保仅在开发时启用。除此之外，还可能有 `utils/` 工具函数库，`assets/` 静态资源等目录，根据需要增添。

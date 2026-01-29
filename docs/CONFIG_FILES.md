# 配置文件说明

## 根目录配置文件

### Next.js 配置
- **`next.config.js`** - Next.js 主配置文件，定义构建选项、环境变量、重定向规则等
- **`next-env.d.ts`** - Next.js TypeScript 类型定义文件，自动生成，不应手动修改

### TypeScript 配置
- **`tsconfig.json`** - TypeScript 编译器配置，定义编译选项、路径映射、类型检查规则

### 样式配置
- **`tailwind.config.ts`** - Tailwind CSS 配置文件，定义主题、颜色、字体、响应式断点等
- **`postcss.config.js`** - PostCSS 配置文件，处理 CSS 预处理和后处理

### 包管理
- **`package.json`** - 项目依赖和脚本配置，定义项目元信息、依赖包、构建脚本
- **`package-lock.json`** - 依赖版本锁定文件，确保依赖版本一致性

### 环境配置
- **`.env.local`** - 本地环境变量文件，包含 API 密钥、代理配置等敏感信息

### 应用初始化
- **`instrumentation.ts`** - Next.js 应用初始化文件，在应用启动时执行代理配置和全局设置

## 详细配置说明

### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 实验性功能
  experimental: {
    serverComponentsExternalPackages: ['undici']
  },
  // 环境变量
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  }
}
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### tailwind.config.ts
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 自定义颜色
      },
      fontFamily: {
        // 自定义字体
      }
    },
  },
  plugins: [],
}
```

### package.json 脚本说明
```json
{
  "scripts": {
    "dev": "启动开发服务器，包含 IPv4 DNS 优化",
    "build": "构建生产版本",
    "start": "启动生产服务器",
    "lint": "运行 ESLint 代码检查"
  }
}
```

## 开发环境设置

### 1. 环境变量配置
创建 `.env.local` 文件：
```env
# 必需的 API 密钥
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key

# 可选的代理配置
HTTP_PROXY=http://127.0.0.1:7890
HTTPS_PROXY=http://127.0.0.1:7890
```

### 2. IDE 配置
`.vscode/` 目录包含 VS Code 的项目配置：
- 推荐扩展
- 调试配置
- 工作区设置

### 3. 构建配置
- **开发模式**: 热重载、源码映射、详细错误信息
- **生产模式**: 代码压缩、优化、静态生成

## 最佳实践

### 1. 配置文件管理
- 不要提交 `.env.local` 到版本控制
- 定期更新依赖包版本
- 保持配置文件简洁明了

### 2. TypeScript 配置
- 启用严格模式
- 配置路径映射简化导入
- 使用适当的编译目标

### 3. 样式配置
- 使用 Tailwind CSS 的设计系统
- 定义一致的颜色和字体
- 配置响应式断点

### 4. 构建优化
- 启用代码分割
- 配置静态资源优化
- 使用适当的缓存策略
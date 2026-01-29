# 项目文档索引

欢迎查看智能旅行规划助手的完整文档。

## 📚 文档结构

### 🏗️ 架构文档
- **[系统架构](./ARCHITECTURE.md)** - 整体架构设计和技术决策
- **[代理配置指南](./PROXY_SETUP.md)** - 网络代理配置和故障排除
- **[配置文件说明](./CONFIG_FILES.md)** - 各种配置文件的详细说明

### 📁 目录结构说明
- **[App 目录](../app/README.md)** - Next.js App Router 页面和 API
- **[Components 目录](../components/README.md)** - React 组件库
- **[Lib 目录](../lib/README.md)** - 核心业务逻辑和工具
- **[VS Code 配置](../.vscode/README.md)** - 开发环境配置

## 🚀 快速开始

### 1. 环境准备
```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 添加你的 API 密钥
```

### 2. 启动开发
```bash
# 启动开发服务器
npm run dev

# 访问应用
open http://localhost:3000
```

### 3. 代理配置（如需要）
如果需要通过代理访问 Google API，请参考 [代理配置指南](./PROXY_SETUP.md)。

## 🔧 开发指南

### 代码结构
```
src/
├── app/           # 页面和 API 路由
├── components/    # 可复用组件
├── lib/          # 业务逻辑和工具
└── docs/         # 项目文档
```

### 开发流程
1. **功能开发** - 在对应目录创建新文件
2. **组件开发** - 遵循组件设计原则
3. **测试验证** - 确保功能正常工作
4. **文档更新** - 更新相关文档

### 代码规范
- 使用 TypeScript 进行类型安全
- 遵循 ESLint 代码规范
- 使用 Prettier 格式化代码
- 编写清晰的注释和文档

## 🛠️ 技术栈

### 前端技术
- **Next.js 16** - React 全栈框架
- **TypeScript** - 类型安全的 JavaScript
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Zustand** - 轻量级状态管理

### AI 集成
- **AI SDK** - AI 应用开发工具包
- **Google Gemini API** - 大语言模型服务
- **Streaming UI** - 实时 UI 生成

### 开发工具
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **VS Code** - 推荐的开发环境

## 📖 学习资源

### 官方文档
- [Next.js 文档](https://nextjs.org/docs)
- [React 文档](https://react.dev)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [AI SDK 文档](https://sdk.vercel.ai/docs)

### 相关教程
- [Next.js App Router 教程](https://nextjs.org/learn)
- [TypeScript 手册](https://www.typescriptlang.org/docs)
- [Tailwind CSS 教程](https://tailwindcss.com/docs/installation)

## 🤝 贡献指南

### 提交代码
1. Fork 项目仓库
2. 创建功能分支
3. 提交代码更改
4. 创建 Pull Request

### 报告问题
- 使用 GitHub Issues 报告 Bug
- 提供详细的复现步骤
- 包含相关的错误信息

### 功能建议
- 在 Issues 中提出功能建议
- 描述使用场景和预期效果
- 讨论实现方案

## 📞 支持

如果你在使用过程中遇到问题：

1. **查看文档** - 首先查看相关文档
2. **搜索 Issues** - 查看是否有类似问题
3. **创建 Issue** - 描述问题并提供详细信息
4. **社区讨论** - 参与社区讨论获取帮助

## 📄 许可证

本项目采用 MIT 许可证，详见 [LICENSE](../LICENSE) 文件。
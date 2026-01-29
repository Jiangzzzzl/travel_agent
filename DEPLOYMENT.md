# Vercel 部署指南

## 🚀 部署步骤

### 1. 准备工作
确保你有：
- Gemini API Key
- Vercel 账号

### 2. 环境变量设置

在 Vercel Dashboard 中设置以下环境变量：

```
GOOGLE_GENERATIVE_AI_API_KEY=你的_gemini_api_key
```

### 3. 部署命令

#### 方法 A: 通过 Vercel CLI
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

#### 方法 B: 通过 GitHub 集成
1. 将代码推送到 GitHub
2. 在 Vercel Dashboard 中连接 GitHub 仓库
3. 设置环境变量
4. 自动部署

### 4. 验证部署

部署成功后，访问你的 Vercel URL，检查：
- ✅ 页面正常加载
- ✅ 搜索功能正常工作
- ✅ Gemini API 调用成功

## 🔧 关键修改说明

### 已修复的 Vercel 兼容性问题：

1. **移除 Windows 专用命令**
   - ❌ `set NODE_OPTIONS=...`
   - ✅ 标准的 `next dev/build/start`

2. **禁用代理相关功能**
   - 在 `process.env.VERCEL` 环境中自动禁用
   - 移除 `global-agent` 和 `https-proxy-agent` 依赖

3. **锁定依赖版本**
   - ❌ `"next": "latest"`
   - ✅ `"next": "^15.1.6"`

4. **环境变量配置**
   - 使用 `GOOGLE_GENERATIVE_AI_API_KEY`
   - 本地开发使用 `.env.local`

## 🐛 常见问题

### Q: 部署失败，提示 "set: command not found"
A: 确保 package.json 中的 scripts 不包含 Windows 专用的 `set` 命令

### Q: Gemini API 调用失败
A: 检查 Vercel Dashboard 中的环境变量设置

### Q: 代理相关错误
A: 确保代理相关代码在 Vercel 环境中被禁用

## 📝 本地开发 vs Vercel 环境

| 功能 | 本地开发 | Vercel |
|------|----------|--------|
| 代理设置 | ✅ 启用 | ❌ 禁用 |
| IPv4 优先 | ✅ 启用 | ❌ 禁用 |
| 环境变量 | `.env.local` | Vercel Dashboard |
| 构建命令 | `npm run dev` | `npm run build` |

## 🎯 部署检查清单

- [ ] package.json 中移除了 Windows 专用命令
- [ ] 代理相关代码在 Vercel 环境中被禁用
- [ ] 依赖版本已锁定
- [ ] 环境变量已在 Vercel Dashboard 中设置
- [ ] 本地测试通过
- [ ] 部署成功且功能正常
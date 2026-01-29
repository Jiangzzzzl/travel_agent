# 代理配置指南

## 概述

由于 Google Gemini API 在某些地区需要通过代理访问，本应用内置了完整的代理配置系统。

## 配置方法

### 1. 环境变量配置

在 `.env.local` 文件中添加：

```env
# HTTP 代理
HTTP_PROXY=http://127.0.0.1:7890
HTTPS_PROXY=http://127.0.0.1:7890

# SOCKS5 代理（可选）
ALL_PROXY=socks5://127.0.0.1:7890
```

### 2. 支持的代理类型

- **HTTP 代理**: `http://host:port`
- **HTTPS 代理**: `https://host:port`
- **SOCKS5 代理**: `socks5://host:port`

### 3. 常见代理软件配置

#### Clash
```yaml
# 默认端口
http-port: 7890
socks-port: 7891
```

#### V2Ray
```json
{
  "inbounds": [
    {
      "port": 7890,
      "protocol": "http"
    }
  ]
}
```

## 技术实现

### 1. 多层代理配置

应用使用多种方法确保代理生效：

```typescript
// 1. 环境变量设置
process.env.HTTP_PROXY = 'http://127.0.0.1:7890';

// 2. global-agent 配置
bootstrap();

// 3. undici ProxyAgent
const proxyAgent = new ProxyAgent(proxyUrl);

// 4. fetch 函数重写
globalThis.fetch = customFetch;
```

### 2. 智能代理应用

只对 Google API 请求使用代理：

```typescript
if (urlString.includes('generativelanguage.googleapis.com')) {
  // 使用代理
  return undiciFetch(url, { dispatcher: proxyAgent });
}
// 其他请求直连
return originalFetch(url, options);
```

### 3. DNS 优化

强制使用 IPv4 避免 IPv6 超时：

```typescript
dns.setDefaultResultOrder('ipv4first');
```

## 故障排除

### 1. 连接超时

**症状**: `Connect Timeout Error`

**解决方案**:
- 检查代理服务器是否运行
- 验证端口号是否正确
- 确认防火墙设置

### 2. 代理拒绝连接

**症状**: `ECONNREFUSED`

**解决方案**:
- 重启代理软件
- 检查代理配置
- 验证网络连接

### 3. DNS 解析失败

**症状**: `ENOTFOUND`

**解决方案**:
- 检查 DNS 设置
- 尝试使用不同的 DNS 服务器
- 清除 DNS 缓存

## 测试代理配置

### 1. 基础连接测试

```bash
curl -x http://127.0.0.1:7890 https://www.google.com
```

### 2. Gemini API 测试

```bash
curl -x http://127.0.0.1:7890 \
  -H "x-goog-api-key: YOUR_API_KEY" \
  https://generativelanguage.googleapis.com/v1beta/models
```

### 3. 应用内测试

访问 `/api/test-gemini` 端点进行测试。

## 最佳实践

### 1. 代理选择
- 优先使用本地代理（127.0.0.1）
- 选择稳定的代理服务
- 定期检查代理状态

### 2. 性能优化
- 使用高速代理节点
- 配置连接池
- 设置合理的超时时间

### 3. 安全考虑
- 使用加密代理协议
- 定期更换代理密码
- 监控代理使用情况

## 常见问题

### Q: 为什么使用 undici 而不是 axios？
A: Next.js 内部使用 undici 作为 fetch 实现，使用 undici ProxyAgent 兼容性更好。

### Q: 代理配置后仍然超时怎么办？
A: 检查代理服务器状态，尝试不同的代理节点，或增加超时时间。

### Q: 如何验证代理是否生效？
A: 查看控制台日志，应该看到 "Using proxy for Google API request" 消息。
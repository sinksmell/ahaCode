---
title: MCP 服务
description: "使用 ahaCode MCP 服务，从任何兼容 MCP 的 AI 客户端搜索和创建代码片段，支持本地 RAG 语义搜索。"
---

# MCP 服务

ahaCode 内置了 [Model Context Protocol](https://modelcontextprotocol.io/)（MCP）服务。它将你的代码片段库暴露给任何兼容 MCP 的客户端，让你可以在 AI 工作流中直接搜索和创建代码片段。

## 工作原理

- ahaCode 在 `http://127.0.0.1:4322/` 上运行 JSON-RPC 服务（仅本地）。
- 本地嵌入模型（`bge-small-en-v1.5`，约 30 MB）在设备上生成向量嵌入。
- 嵌入存储在 `sqlite-vec` 向量数据库中，用于余弦相似度搜索。
- RAG 索引在你创建、更新或删除代码片段时自动同步。
- **无需 API 密钥。** 一切在本地运行——没有数据离开你的机器。

## 工具

MCP 服务暴露两个工具：

### `rag_query`

使用自然语言搜索你的代码片段库。

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `query` | string | 必填 | 自然语言搜索查询 |
| `limit` | number | 8 | 最大返回结果数 |

返回按语义相似度排序的代码片段。

### `ingest_snippet`

创建新代码片段并自动添加到 RAG 索引。

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `name` | string | 必填 | 代码片段名称 |
| `contents` | array | 必填 | `{ label, language, value }` 对象数组 |
| `folderId` | number \| null | null | 目标文件夹 ID |

返回新代码片段的 ID。

## 配置

MCP 服务端口可在 **偏好设置 → API → MCP 端口** 中配置（默认：`4322`，有效范围：1024–65535）。ahaCode 必须处于运行状态，客户端才能连接。

### Claude Desktop

编辑 `~/Library/Application Support/Claude/claude_desktop_config.json`（macOS）：

```json
{
  "mcpServers": {
    "ahaCode": {
      "url": "http://127.0.0.1:4322/"
    }
  }
}
```

### Cursor

在 Settings → MCP 中添加，或编辑 `~/.cursor/mcp.json`：

```json
{
  "mcpServers": {
    "ahaCode": {
      "url": "http://127.0.0.1:4322/"
    }
  }
}
```

### Claude Code

添加到项目或全局配置的 `.mcp.json` 中：

```json
{
  "mcpServers": {
    "ahaCode": {
      "type": "http",
      "url": "http://127.0.0.1:4322/"
    }
  }
}
```

### Zed

添加到 `settings.json`：

```json
{
  "context_servers": {
    "ahaCode": {
      "source": "custom",
      "url": "http://127.0.0.1:4322/"
    }
  }
}
```

## 验证连接

运行以下命令检查 MCP 服务是否正在运行：

```bash
curl -s http://127.0.0.1:4322/ \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

成功响应会列出 `rag_query` 和 `ingest_snippet` 两个工具。

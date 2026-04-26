---
title: 文档概览
description: "浏览 ahaCode 文档，了解代码片段、存储、同步、主题和 AI MCP 服务。"
---

# 概览

ahaCode 是一个免费开源的代码片段管理器。它在一个本地优先的桌面应用中，通过文件夹、标签、片段和基于 MCP 的 AI 语义搜索来管理你的可复用代码。

<img :src="withBase('/preview.png')">

## 代码

使用 Code 空间来跨项目、跨语言构建可复用的代码片段库。三栏布局将组织管理、搜索和编辑集于一处：左侧是资料库，中间是片段列表，右侧是编辑器。

## AI / MCP 服务

ahaCode 内置了 MCP 服务，将你的代码片段库暴露给任何兼容 MCP 的客户端——Claude Desktop、Cursor、Claude Code、Zed 等。本地嵌入模型驱动语义搜索，无需任何 API 密钥。

## 通用设置

### 切换侧边栏

隐藏或显示资料库侧边栏：

- 在菜单栏选择 **"视图"** > **"切换侧边栏"**，或按 <kbd>Alt+Cmd+B</kbd>（macOS）/ <kbd>Alt+Ctrl+B</kbd>（Windows/Linux）。

### 字号

调整编辑器字号：

- <kbd>Cmd+=</kbd> / <kbd>Ctrl+=</kbd> 放大
- <kbd>Cmd+-</kbd> / <kbd>Ctrl+-</kbd> 缩小
- <kbd>Cmd+0</kbd> / <kbd>Ctrl+0</kbd> 恢复默认

### 偏好设置

打开偏好设置窗口：

- 按 <kbd>Cmd+,</kbd>（macOS）或 <kbd>Ctrl+,</kbd>（Windows/Linux）。

### 紧凑列表模式

Code 空间支持紧凑列表模式，可减小列表项高度，一次查看更多文件夹和代码片段。

<script setup>
import { withBase } from 'vitepress'
</script>

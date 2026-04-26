---
title: 代码片段
description: "在 ahaCode 中保存、组织和编辑可复用的代码片段。"
---

# 代码片段

代码片段是 Code 空间的核心构建块。使用它们来保存跨项目复用的代码，保留参考示例，并逐步构建你自己的可搜索代码库。

## 添加代码片段

使用以下方法之一：

- 在菜单栏选择 **"文件"** > **"新建代码片段"**。
- 点击第二列中搜索框旁边的 **"+"** 按钮。
- 按 <kbd>Cmd+N</kbd>（macOS）或 <kbd>Ctrl+N</kbd>（Windows/Linux）。

::: info
新代码片段会在当前选中的文件夹中创建，如果未选择文件夹则创建在 **"收件箱"** 中。
:::

## 语言选择

点击编辑器底部的语言标签，然后从下拉列表中选择语言。默认语言为 **"纯文本"**。

## 移动代码片段

拖放代码片段到目标文件夹。

## 删除代码片段

右键点击代码片段，选择 **"删除"**。

::: info
代码片段会被移至 **"回收站"**。你可以之后将其拖回文件夹来恢复。
:::

## 复制代码片段

使用以下方法之一：

- 在菜单栏选择 **"编辑器"** > **"复制代码片段到剪贴板"**。
- 按 <kbd>Shift+Cmd+C</kbd>（macOS）或 <kbd>Shift+Ctrl+C</kbd>（Windows/Linux）。

## 格式化代码片段

使用 Prettier 格式化支持的代码片段语言，无需离开 ahaCode。

使用以下方法之一：

- 在菜单栏选择 **"编辑器"** > **"格式化"**。
- 按 <kbd>Shift+Cmd+F</kbd>（macOS）或 <kbd>Shift+Ctrl+F</kbd>（Windows/Linux）。

### 支持的语言：

- Bash / Dockerfile / Gitignore / INI / Properties
- CSS / Sass / SCSS / Less
- GraphQL
- HTML
- Jade / Pug
- Java
- JavaScript / TypeScript
- JSON / JSON5
- Markdown
- PHP
- TOML
- XML
- YAML

## 实时渲染 HTML & CSS

在 ahaCode 中直接测试小型 HTML/CSS 想法。

- 添加新[代码片段](#添加代码片段)或选择已有的。
- 添加第二个[片段](/zh/documentation/code/fragments)。
- 将片段语言设置为 HTML 和 CSS。
- 在菜单栏选择 **"编辑器"** > **"预览代码"**，或按 <kbd>Alt+Cmd+P</kbd>（macOS）/ <kbd>Ctrl+Alt+P</kbd>（Windows/Linux）。

## JSON 可视化

当嵌套 JSON 以原始文本形式阅读太密集时，使用 JSON 可视化。ahaCode 将当前 JSON 代码片段转换为可视化图形，使对象、数组和关系更易于浏览。

- 添加新[代码片段](#添加代码片段)或选择已有的。
- 点击编辑器底部的语言选择器，选择 **"JSON"**。
- 在菜单栏选择 **"编辑器"** > **"预览 JSON"**，或按 <kbd>Alt+Cmd+J</kbd>（macOS）/ <kbd>Ctrl+Alt+J</kbd>（Windows/Linux）。
- 使用缩放控件和 **适应** 按钮浏览较大的数据。
- 点击节点查看其内容。
- 需要分享时，导出为 **PNG** 或 **SVG** 格式。

<img :src="withBase('/json-visually.png')">

<script setup>
import { withBase } from 'vitepress'
</script>

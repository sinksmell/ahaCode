---
title: 同步你的 Markdown 仓库
description: "通过 iCloud、Dropbox、Google Drive、Syncthing 或 Git 在多台设备间同步 ahaCode 数据。"
---

# 同步

ahaCode 不需要内置的云账户或专有同步服务。要在多台设备间同步数据，只需使用你信任的文件同步服务来同步 **Markdown 仓库** 文件夹。

由于 ahaCode 使用 [Markdown 仓库](/zh/documentation/storage#markdown-仓库)，同步非常简单：你的数据就是磁盘上的纯文件。将任何文件同步服务指向你的仓库目录：

- iCloud Drive
- Dropbox
- Google Drive
- Syncthing
- Git 仓库

这种方式适合以下场景：

- 在多台电脑上使用相同的代码片段
- 通过 Git 保留版本历史
- 完全控制数据存放位置

ahaCode 实时监控仓库目录，应用外部的变更会被自动检测到。

---
title: Markdown Vault Storage
description: "Learn how ahaCode stores snippets locally in a Markdown Vault with plain files, frontmatter metadata, and Git-friendly structure."
---

# Storage

ahaCode stores your data locally on your computer. Snippets live in a **Markdown Vault**, so your content stays as plain Markdown files on disk instead of being locked into a cloud service or a private database format.

## Markdown Vault

### Why it matters

- **Your data is just files.** Each snippet is a `.md` file with frontmatter metadata. You can read, edit, move, and back up everything with any text editor or file manager.
- **No vendor lock-in.** If you stop using ahaCode, your content still remains readable as plain files.
- **Git-friendly.** Put the vault in a Git repository, track changes, and sync it through your normal workflow.
- **Cloud-sync friendly.** iCloud, Dropbox, Google Drive, or Syncthing all work because the vault is just a folder on disk.
- **Live updates.** ahaCode watches the vault in real time, so external file changes appear in the app automatically.

### How it works

The vault mirrors your folder structure. Each folder becomes a directory on disk, and each snippet becomes a `.md` file inside it. Metadata such as language, tags, and ordering is stored in frontmatter, while `.state.json` stores UI state like expanded folders and sort order.

You can change the vault location in **Settings → Storage**.

### File Name Restrictions

Because Markdown Vault maps folders and snippets directly to files and directories on disk, ahaCode applies a small set of cross-platform naming rules.

Names cannot contain `< > : " / \ | ? * # [ ] ^`, cannot start or end with `.`, and cannot use Windows reserved names such as `CON`, `PRN`, `AUX`, `NUL`, `COM1`, or `LPT1`. These rules keep filenames portable across Windows, macOS, and Linux.

## Migration from SQLite

If you are upgrading from an older version that used SQLite storage, you can import your existing data into Markdown Vault.

- Open **Settings → Storage**
- Choose the import option
- Select your old `.db` file

ahaCode converts your folders and snippets to Markdown Vault format.

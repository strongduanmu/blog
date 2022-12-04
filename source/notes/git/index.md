---
robots: noindex,nofollow
sitemap: false
menu_id: notes
layout: wiki
seo_title: Git
order: 20
---

## 常用 Git 命令

```bash
# 添加远程仓库
git remote add upstream https://github.com/apache/shardingsphere.git

# 查看远程仓库信息
git remote -v
# origin	https://github.com/strongduanmu/shardingsphere.git (fetch)
# origin	https://github.com/strongduanmu/shardingsphere.git (push)
# upstream	https://github.com/apache/shardingsphere.git (fetch)
# upstream	https://github.com/apache/shardingsphere.git (push)

# 拉取远程库 PR 代码到 dev-0705 分支
git fetch upstream pull/11150/head:dev-0705
# From https://github.com/apache/shardingsphere
# * [new ref]               refs/pull/11150/head -> dev-0705

# 根据指定 commitId 创建新分支
git checkout commitId -b branchName

# 批量删除 dev* 分支
git branch -a | grep "^  dev*" | xargs git branch -D

# 恢复误删除分支
## 查看被删除分支对应的 commit id
git log -g
## 根据 commit id 创建 recover_branch 分支
git branch recover_branch 34fd566205a34a2842111331449b47c39ef7fa6e
```


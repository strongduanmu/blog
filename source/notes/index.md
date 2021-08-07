---
robots: noindex,nofollow
sitemap: false
menu_id: notes
layout: wiki
wiki: Notes
---

{% navbar [IDAE](idea) %}

## 常用 Git 命令

```bash
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
```

## 常用 Docker 命令

```bash
docker exec -it mysql mysql -u sharding -h host.docker.internal -P 3307 -p
docker exec -it postgres psql -U postgres -d sharding_db -h host.docker.internal -p 3307
```


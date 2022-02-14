---
robots: noindex,nofollow
sitemap: false
menu_id: notes
layout: wiki
seo_title: Docker
order: 30
---

## 常用 Docker 命令

```bash
docker exec -it mysql mysql -u sharding -h host.docker.internal -P 3307 -p
docker exec -it postgres psql -U postgres -d sharding_db -h host.docker.internal -p 3307
```


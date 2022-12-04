---
robots: noindex,nofollow
sitemap: false
menu_id: notes
layout: wiki
seo_title: Docker
order: 10
---

## 常用数据库 Docker 命令

### MySQL

```bash
# 查找 MySQL 镜像
docker search mysql
# 拉取最新版 MySQL 镜像，可以指定其他版本
docker pull mysql:latest
# 查看本地镜像
docker images
# 运行容器
# -i：以交互模式运行，通常配合 -t
# -t：为容器重新分配一个伪输入终端，通常配合 -i
# -d：后台运行容器
# -p：端口映射，格式为主机端口:容器端口
# -e：设置环境变量，此处设置 root 密码
# --name：设置容器别名
docker run -itd -p 3306:3306 -e MYSQL_ROOT_PASSWORD=123456 --name mysql mysql
# 查看容器运行状态
docker ps
# 在容器中执行命令
docker exec -it mysql /bin/bash
# 在容器中执行命令，连接本机 ShardingSphere-Proxy，后端为 MySQL
docker exec -it mysql mysql -u sharding -h host.docker.internal -P 3307 -p
```

### PostgreSQL

```bash
# 查找 PostgreSQL 镜像
docker search postgres
# 拉取最新版 PostgreSQL 镜像，默认拉取最新版
docker pull postgres
# 运行容器
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=123456 --name postgres postgres
# 在容器中执行命令，连接本机 ShardingSphere-Proxy，后端为 PostgreSQL
docker exec -it postgres psql -U sharding -d sharding_db -h host.docker.internal -p 3307
```

### openGauss

```bash
# 官方文档：https://hub.docker.com/r/enmotech/opengauss
# 查找 openGauss 镜像
docker search opengauss
# 拉取 openGauss 镜像
docker pull enmotech/opengauss
# 运行容器
docker run --privileged=true -d -e GS_PASSWORD=Sphere@123 -p 5432:5432 --name opengauss enmotech/opengauss
# 在容器中执行命令，连接本机 ShardingSphere-Proxy，后端为 openGauss
docker run --rm -it enmotech/opengauss gsql -U sharding -d sharding_db -W'sharding' -h host.docker.internal -p 3307
```


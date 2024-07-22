---
menu_id: notes
wiki: notes
layout: wiki
order: 10
title: Docker
banner: /assets/banner/banner_5.jpg
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
# 挂载本地 my.cnf 运行容器，避免中文乱码
docker run -itd -p 3306:3306 -e MYSQL_ROOT_PASSWORD=123456 --name mysql mysql -v /Users/strongduanmu/Softs/MySQL/my.cnf:/etc/mysql/mysql.conf.d/mysqld.cnf
# 查看容器运行状态
docker ps
# 在容器中执行命令
docker exec -it mysql /bin/bash
# 在容器中执行命令，连接本机 ShardingSphere-Proxy，后端为 MySQL
docker exec -it mysql mysql -u sharding -h host.docker.internal -P 3307 -p
```

解决 MySQL 中文乱码的 `my.cnf` 参考配置：

```properties
[client]
default-character-set=utf8mb4
[mysql]
default-character-set=utf8mb4
[mysqld]
port=3306
# character-set-client-handshake=FALSE
character-set-server=utf8mb4
character-set-filesystem=utf8mb4
collation-server=utf8mb4_general_ci
init-connect='SET NAMES utf8mb4'
# 解决数据库读取区分大小写问题
lower-case-table-names=1
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

### Oracle

```bash
# 查找 Oracle 镜像
docker search oracle-19c
# 拉取 Oracle 镜像
docker pull doctorkirk/oracle-19c
# 创建数据文件目录
mkdir -p /Users/strongduanmu/softs/oracle/oracle_19c_data
# 授权
chmod 777 /Users/strongduanmu/softs/oracle/oracle_19c_data
# 运行容器
docker run -d  \
-p 1521:1521 -p 5500:5500 \
-e ORACLE_SID=ORCLSID \
-e ORACLE_PDB=ORCLPDB \
-e ORACLE_PWD=123456 \
-e ORACLE_EDITION=standard \
-e ORACLE_CHARACTERSET=AL32UTF8 \
-v /Users/strongduanmu/softs/oracle/oracle_19c_data \
--name oracle_19c doctorkirk/oracle-19c
# 查看运行日志
docker logs -ft oracle_19c
# 在容器中执行命令，连接 Oracle
docker exec -it oracle_19c /bin/bash
sqlplus / as sysdba
show pdbs;

# GUI 连接账号
# username：sys as sysdba
# password：123456
# sid：ORCLSID
```

### StarRocks

```bash
# 拉取镜像
docker pull starrocks/allin1-ubuntu:2.5.8

docker run --name starrocks -p 9030:9030 -p 8030:8030 -p 8040:8040 -itd starrocks/allin1-ubuntu:2.5.8

mysql -P9030 -h127.0.0.1 -uroot --prompt="StarRocks > "
```

### Zookeeper

```bash
docker pull zookeeper

docker run -d --name zookeeper --privileged=true -p 2181:2181  zookeeper
```

## Jenkins

```bash
docker pull jenkinsci/blueocean

docker run --name jenkins -u root -d -p 8080:8080 -p 50000:50000 -v /Users/duanzhengqiang/.m2:/root/.m2 -v /var/run/docker.sock:/var/run/docker.sock jenkinsci/blueocean

# 浏览器访问管理界面
localhost:8080

# 日志中查看密码
docker logs jenkins
```

### ShardingSphere

```bash
# 安装 socat
brew install socat
socat TCP-LISTEN:2375,reuseaddr,fork UNIX-CLIENT:/var/run/docker.sock

# 在创建镜像的窗口中执行
export DOCKER_HOST=tcp://127.0.0.1:2375
# 然后执行 ShardingSphere Proxy 镜像打包命令
./mvnw -B clean install -am -pl test/e2e/sql -Pit.env.docker -DskipTests -Dspotless.apply.skip=true -T 1C 
```

​	

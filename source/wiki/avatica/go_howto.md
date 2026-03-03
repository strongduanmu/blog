---
layout: wiki
wiki: avatica
order: 014
title: Go 客户端使用指南
date: 2025-01-30 17:00:00
banner: /assets/banner/banner_4.jpg
---

> 原文链接：https://calcite.apache.org/avatica/docs/go_howto.html

这里是一些关于使用 Avatica 的其他文档。

* TOC
{:toc}

## 发布

### 准备发布
1. 您需要安装 [docker](https://docs.docker.com/install/) 和 [Docker Compose](https://docs.docker.com/compose/install/)。

2. 如果您尚未设置 GPG 签名密钥，请按照这些[说明](https://www.apache.org/dev/openpgp.html#generate-key)设置一个。

3. 如果此版本是一个新的主要版本（我们要发布 4.0.0，而当前版本是 3.0.0），请更新 `go.mod` 中导入路径的版本。各种示例代码片段中的导入路径也应该更新。

4. 由于我们需要支持 Go modules，标签必须以 `v` 为前缀。例如，标记为 `v3.1.0` 而不是 `3.1.0`。

5. 检查 `NOTICE` 是否具有当前的版权年份。

### 执行试运行
* 该脚本期望您将 `~/.gnupg` 目录挂载到容器中的 `/.gnupg` 目录。一旦挂载到容器中，脚本将复制内容并将其移动到不同的位置，这样它就不会在构建过程中修改原始 `~/.gnupg` 目录的内容。

```bash
# 在 Linux 上：
docker compose run -v ~/.gnupg:/.gnupg dry-run

# 在 Windows 上
docker compose run -v /c/Users/username/AppData/Roaming/gnupg:/.gnupg dry-run
```

### 构建发布版本
```bash
# 在 Linux 上：
docker compose run -v ~/.gnupg:/.gnupg release

# 在 Windows 上
docker compose run -v /c/Users/username/AppData/Roaming/gnupg:/.gnupg release
```

如果构建失败，请执行清理：
1. 在本地和远程删除 git 标签：
```bash
git tag -d vX.Y.Z-rcA
git push origin :refs/tags/vX.Y.Z-rcA
```

2. 清理本地仓库
```bash
docker compose run clean
```

### 在上传之前检查发布版本
发布文件夹的名称必须采用以下格式：`apache-calcite-avatica-go-X.Y.Z-rcN`。如果存在候选发布标识符（如 `-rc0`），则版本必须包含这些标识符。

发布文件夹内的文件必须删除任何候选发布标识符（如 `-rc1`），即使该版本是候选发布版本。还必须在文件名中添加 `src`。

例如，如果我们要上传 `apache-calcite-avatica-go-3.0.0-rc1` 文件夹，文件必须命名为 `apache-calcite-avatica-go-3.0.0-src.tar.gz`。注意文件名中包含了 `src`。

tar.gz 必须命名为 `apache-calcite-avatica-go-X.Y.Z-src.tar.gz`。

必须有一个名为 `apache-calcite-avatica-go-X.Y.Z-src.tar.gz.asc` 的 tar.gz 的 GPG 签名

必须有一个名为 `apache-calcite-avatica-go-X.Y.Z-src.tar.gz.sha512` 的 tar.gz 的 SHA512 哈希值

### 将发布构件上传到 dev 进行投票
#### 手动
必须安装 `svn` 才能上传发布构件。

1. 检出 Calcite dev 发布子目录：`svn co "https://dist.apache.org/repos/dist/dev/calcite/" calcite-dev`。

2. 将发布文件夹从 `dist/` 下移动到 `calcite-dev` 文件夹。

3. 将新版本添加到 svn 仓库：`svn add apache-calcite-avatica-go-X.Y.Z-rcN`。记得在命令中将文件夹名称更改为正确的版本。

4. 提交以上传构件：`svn commit -m "apache-calcite-avatica-go-X.Y.Z-rcN" --username yourapacheusername --force-log`
注意使用 `--force-log` 来抑制 svn 警告，因为提交消息与目录名称相同。

#### 使用 docker
这假设已经构建了一个发布版本，并且构件位于 `dist/` 文件夹中。

```bash
docker compose run publish-release-for-voting
```

该脚本还将生成一封投票邮件发送到 dev 列表。您可以使用此邮件，但请务必检查所有详细信息是否正确。

### 向 Dev 列表发送电子邮件进行投票：

发送投票电子邮件：
```text 
To: dev@calcite.apache.org
Subject: [VOTE] Release apache-calcite-avatica-go-X.Y.Z (release candidate N)

Hi all,

I have created a build for Apache Calcite Avatica Go X.Y.Z, release candidate N.

Thanks to everyone who has contributed to this release. The release notes are available here:
https://github.com/apache/calcite-avatica-go/blob/XXXX/site/_docs/go_history.md

The commit to be voted upon:
https://gitbox.apache.org/repos/asf?p=calcite-avatica-go.git;a=commit;h=NNNNNN

The hash is XXXX.

The artifacts to be voted on are located here:
https://dist.apache.org/repos/dist/dev/calcite/apache-calcite-avatica-go-X.Y.Z-rcN/

The hashes of the artifacts are as follows:
src.tar.gz.sha512 XXXX

Release artifacts are signed with the following key:
https://people.apache.org/keys/committer/francischuang.asc

Instructions for running the test suite is located here:
https://github.com/apache/calcite-avatica-go/blob/$COMMIT/site/develop/avatica-go.md#testing

Please vote on releasing this package as Apache Calcite Avatica Go X.Y.Z.

To run the tests without a Go environment, install docker and docker compose. Then, in the root of the release's directory, run:
docker compose run test

When the test suite completes, run \"docker compose down\" to remove and shutdown all the containers.

The vote is open for the next 72 hours and passes if a majority of
at least three +1 PMC votes are cast.

[ ] +1 Release this package as Apache Calcite Go X.Y.Z
[ ]  0 I don't feel strongly about it, but I'm okay with the release
[ ] -1 Do not release this package because...


Here is my vote:

+1 (binding)

Francis
```

投票结束后，发送结果：
```text 
Subject: [RESULT] [VOTE] Release apache-calcite-avatica-go-X.Y.Z (release candidate N)
To: dev@calcite.apache.org

Thanks to everyone who has tested the release candidate and given
their comments and votes.

The tally is as follows.

N binding +1s:
<names>

N non-binding +1s:
<names>

No 0s or -1s.

Therefore I am delighted to announce that the proposal to release
Apache Calcite Avatica Go X.Y.Z has passed.

Thanks everyone. We'll now roll the release out to the mirrors.

Francis
```

### 投票后提升发布版本
#### 手动
必须安装 `svn` 才能上传发布构件。

注意：只有通过投票的正式版本才能上传到发布目录。

1. 检出 Calcite 发布目录：`svn co "https://dist.apache.org/repos/dist/release/calcite/" calcite-release`。

2. 将发布版本复制到 `calcite-release` 文件夹。记得检查发布版本的文件夹名称以确保其格式正确。

3. 将发布版本添加到 svn 仓库：`svn add apache-calcite-avatica-go-X.Y.Z`。记得在命令中将文件夹名称更改为正确的版本。

4. 提交以上传构件：`svn commit -m "Release apache-calcite-avatica-go-X.Y.Z" --username yourapacheusername`。

5. 在 git 中标记最终版本并推送：

```bash
git tag vX.Y.Z X.Y.Z-rcN
git push origin vX.Y.Z
```

#### 使用 docker
这假设已经标记了一个 rc 版本并将其推送到 git 仓库。

```bash
docker compose run promote-release
```

### 在 JIRA 中关闭问题并将版本标记为已发布
在 JIRA 中，搜索[此版本中解决的所有问题](https://issues.apache.org/jira/issues/?jql=project%20%3D%20CALCITE%20AND%20status%20%3D%20Resolved%20AND%20resolution%20%3D%20Fixed%20AND%20fixVersion%20in%20(1.5.0%2C%20avatica-go-5.2.0))，
并进行批量更新，将其状态更改为"Closed"，并附带更改注释"Resolved in release X.Y.Z (YYYY-MM-DD)"
（适当填写版本号和日期）。取消选中"Send mail for this update"。

最后，转到 [JIRA 中的发布页面](https://issues.apache.org/jira/projects/CALCITE?selectedItem=com.atlassian.jira.jira-projects-plugin%3Arelease-page&status=released-unreleased)，
点击版本旁边的 3 个点，选择发布日期并发布。

### 宣布发布版本
24 小时后，通过向 [dev 列表](https://mail-archives.apache.org/mod_mbox/calcite-dev/)和 [announce@apache.org](https://mail-archives.apache.org/mod_mbox/www-announce/) 发送公告来宣布发布版本。

公告的示例如下：
```text
Subject: [ANNOUNCE] Apache Calcite Avatica Go X.Y.Z released
To: dev@calcite.apache.org

The Apache Calcite team is pleased to announce the release of Apache Calcite Avatica Go X.Y.Z.

Avatica is a framework for building database drivers. Avatica
defines a wire API and serialization mechanism for clients to
communicate with a server as a proxy to a database. The reference
Avatica client and server are implemented in Java and communicate
over HTTP. Avatica is a sub-project of Apache Calcite.

The Avatica Go client is a Go database/sql driver that enables Go
programs to communicate with the Avatica server.

Apache Calcite Avatica Go X.Y.Z is a minor release of Avatica Go
with fixes to the import paths after enabling support for Go modules.

This release includes updated dependencies, testing against more
targets and support for Go Modules as described in the release notes:

    https://calcite.apache.org/avatica/docs/go_history.html#vX-Y-Z

The release is available here:

    https://calcite.apache.org/avatica/downloads/avatica-go.html

We welcome your help and feedback. For more information on how to
report problems, and to get involved, visit the project website at

    https://calcite.apache.org/avatica

Francis Chuang, on behalf of the Apache Calcite Team
```

{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/xingqiu/calcite_xingqiu.png)

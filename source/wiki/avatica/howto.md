---
layout: wiki
wiki: avatica
order: 006
title: 使用指南
date: 2025-01-30 16:00:00
banner: /assets/banner/banner_4.jpg
---

> 原文链接：https://calcite.apache.org/avatica/docs/howto.html

本文档包含了一些关于使用 Avatica 的杂项说明。

* TOC
{:toc}

## 从源码分发包构建

前提条件是 Java（JDK 8 或更高版本）和 Gradle（版本 8.14.3）已配置在您的 PATH 中。

（源码分发包[不包含 Gradle wrapper](https://issues.apache.org/jira/browse/CALCITE-4575)；因此您需要[手动安装 Gradle](https://gradle.org/releases/)。）

解压源码分发包的 `.tar.gz` 文件，`cd` 进入解压后的源码根目录，然后使用 Gradle 构建：

```bash
$ tar xvfz apache-calcite-avatica-1.27.0-src.tar.gz
$ cd apache-calcite-avatica-1.27.0-src
$ gradle build
```

[运行测试](#running-tests) 描述了如何运行更多或更少的测试（但您应该使用 `gradle` 命令而不是 `./gradlew`）。

## 从 Git 构建

前提条件是 Git 和 Java（JDK 8 或更高版本）已配置在您的 PATH 中。

创建 GitHub 仓库的本地副本，`cd` 进入其根目录，然后使用 Gradle 构建：

```bash
$ git clone git@github.com:apache/calcite-avatica.git
$ cd avatica
$ ./gradlew build
```

[运行测试](#running-tests) 描述了如何运行更多或更少的测试。

## 运行测试

构建时测试套件会默认运行，除非您指定 `-x test`：

```bash
$ ./gradlew assemble # 构建构件
$ ./gradlew build -x test # 构建构件，验证代码风格，跳过测试
$ ./gradlew check # 验证代码风格，执行测试
$ ./gradlew test # 执行测试
$ ./gradlew checkstyleMain checkstyleTest # 验证代码风格
```

您可以使用 `./gradlew assemble` 来构建构件并跳过所有测试和验证。

### 在 Docker 中运行测试

前提条件是安装了 [Docker](https://docs.docker.com/install/) 和 [Docker Compose](https://docs.docker.com/compose/install/)。

```bash
docker compose run test
```

## 贡献代码

请参阅[开发者指南]({{ site.baseurl }}/develop/#contributing)。

## 快速入门

请参阅[开发者指南]({{ site.baseurl }}/develop/#getting-started)。

# 开发者进阶主题

如果您正在为代码库的特定部分添加功能，以下章节可能会对您有所帮助。如果您只是从源码构建和运行测试，则不需要了解这些主题。

# 提交者进阶主题

以下章节对 Calcite 提交者，特别是发布经理有帮助。

## 设置 PGP 签名密钥（针对 Calcite 提交者）

按照[这里](http://www.apache.org/dev/release-signing)的说明创建密钥对。（在 Mac OS X 上，我执行了 `brew install gpg` 和 `gpg --gen-key`。）

按照 `KEYS` 文件中的说明，将您的公钥添加到 [`KEYS`](https://dist.apache.org/repos/dist/release/calcite/KEYS) 文件中。（`KEYS` 文件不存在于 git 仓库或发布 tar 包中，因为那样会[冗余](https://issues.apache.org/jira/browse/CALCITE-1746)。）

## 运行 GPG 代理

默认情况下，需要您解锁 GPG 私钥的 Gradle 插件会在终端中提示您。为了避免多次输入密码，强烈建议安装并运行 `gpg-agent`。

这可以通过 Linux 上的 `~/.xsession` 或您选择的 shell 配置脚本（例如 `~/.bashrc` 或 `~/.zshrc`）中的某些脚本自动启动：

```bash
GPG_AGENT=$(which gpg-agent)
GPG_TTY=`tty`
export GPG_TTY
if [[ -f "$GPG_AGENT" ]]; then
  envfile="${HOME}/.gnupg/gpg-agent.env"

  if test -f "$envfile" && kill -0 $(grep GPG_AGENT_INFO "$envfile" | cut -d: -f 2) 2>/dev/null; then
      source "$envfile"
  else
      eval "$(gpg-agent --daemon --log-file=~/.gpg/gpg.log --write-env-file "$envfile")"
  fi
  export GPG_AGENT_INFO  # env 文件不包含 export 语句
fi
```

此外，确保在 `~/.gnupg/gpg-agent.conf` 中设置 `default-cache-ttl 6000`，以保证您的凭据在构建期间会被缓存。

## 设置 Nexus 仓库凭据（针对 Calcite 提交者）

Gradle 提供了多种[配置项目属性](https://docs.gradle.org/current/userguide/build_environment.html#sec:gradle_configuration_properties)的方法。例如，您可以更新 `$HOME/.gradle/gradle.properties`。

注意：构建脚本会打印缺失的属性，因此您可以尝试运行它，让它提示缺失的属性。

使用以下选项：

```properties
asfCommitterId=
asfNexusUsername=
asfNexusPassword=
asfSvnUsername=
asfSvnPassword=
```

当使用 [asflike-release-environment](https://github.com/vlsi/asflike-release-environment) 时，凭据取自 `asfTest...`（例如 `asfTestNexusUsername=test`）。

注意：如果您想使用 `gpg-agent`，需要传递 `useGpgCmd` 属性，并通过 `signing.gnupg.keyName` 指定密钥 ID。

## 制作快照（针对 Calcite 提交者）

开始之前：

* 按上述说明设置签名密钥。
* 确保您使用的是 JDK 8（不是 9 或 10）。

```bash
# 确保沙箱中没有垃圾文件
git clean -xn

./gradlew -Pasf publish
```

## 制作发布候选版本（针对 Calcite 提交者）

开始之前：

* 按上述说明设置签名密钥。
* 确保您使用的是 JDK 8（不是 9 或 10）。
* 检查 `README`、`site/_docs/howto.md`、`site/_docs/docker_images.md` 中的版本号是否正确。
* 检查 `site/_docs/howto.md` 中的 Gradle 版本是否正确。
* 检查 `NOTICE` 中的版权年份是否为当前年份。
* 检查 `/gradle.properties` 中的 `calcite.avatica.version` 是否具有正确的值。
* 将发布说明添加到 `site/_docs/history.md`。如果要发布的版本已存在发布说明但被注释掉，请删除注释（`{% raw %}{% comment %}{% endraw %}` 和 `{% raw %}{% endcomment %}{% endraw %}`）。包含提交历史、为发布做出贡献的人员名单，以及说明测试所使用的 Java、Guava 和操作系统版本。
* 使用 `./gradlew dependencyCheckUpdate dependencyCheckAggregate` 生成依赖项中存在的漏洞报告。
* 确保<a href="https://issues.apache.org/jira/issues/?jql=project%20%3D%20CALCITE%20AND%20status%20%3D%20Resolved%20and%20fixVersion%20is%20null">每个"已解决"的 JIRA 案例</a>（包括重复的）都分配了修复版本（最可能是我们即将发布的版本）。

发布候选过程不会添加提交，因此即使失败也不会造成损害。它可能会留下 `-rc` 标签，如果需要可以删除。

您可以在 [vlsi/asflike-release-environment](https://github.com/vlsi/asflike-release-environment) 的帮助下进行试运行发布。这会执行相同的步骤，但将更改推送到模拟的 Nexus、Git 和 SVN 服务器。

如果任何步骤失败，请修复问题，然后从头开始。

### 直接在您的环境中准备发布候选版本

选择一个发布候选索引（从 0 开始），并确保它不会与该版本的先前候选版本冲突。

```bash
# 确保沙箱中没有垃圾文件
git clean -xn

# 试运行发布候选（推送到 asf-like-environment）
./gradlew prepareVote -Prc=0

# 将发布候选推送到 ASF 服务器
./gradlew prepareVote -Prc=0 -Pasf
```

### 在 Docker 中准备发布候选版本

* 您需要安装 [Docker](https://docs.docker.com/install/) 和 [Docker Compose](https://docs.docker.com/compose/install/)。

* 脚本期望您将 `~/.gnupg` 目录挂载到容器中的 `/.gnupg` 目录。一旦挂载到容器中，脚本会复制其内容并将其移动到不同的位置，以便在构建过程中不会修改原始 `~/.gnupg` 目录的内容。

* 启动 [asflike-release-environment](https://github.com/vlsi/asflike-release-environment) 为试运行准备暂存环境。

```bash
# 在 Linux 上（试运行）：
docker compose run -v ~/.gnupg:/.gnupg dry-run

# 在 Windows 上（试运行）：
docker compose run -v /c/Users/username/AppData/Roaming/gnupg:/.gnupg dry-run

# 在 Linux 上（推送到 ASF 服务器）：
docker compose run -v ~/.gnupg:/.gnupg publish-release-for-voting

# 在 Windows 上（推送到 ASF 服务器）：
docker compose run -v /c/Users/username/AppData/Roaming/gnupg:/.gnupg publish-release-for-voting
```

## 检查构件

* 在 `release/build/distributions` 目录中应该有以下 3 个文件（以及其他文件）：
  * apache-calcite-avatica-X.Y.Z-src.tar.gz
  * apache-calcite-avatica-X.Y.Z-src.tar.gz.asc
  * apache-calcite-avatica-X.Y.Z-src.tar.gz.sha512
* 请注意，文件名以 `apache-calcite-avatica-` 开头。
* 在源码分发包 `.tar.gz` 中（目前没有二进制分发包），检查所有文件都属于一个名为 `apache-calcite-avatica-X.Y.Z-src` 的目录。
* 该目录必须包含文件 `NOTICE`、`LICENSE`、`README`、`README.md`
  * 检查 `README` 中的版本是否正确
  * 检查 `LICENSE` 是否与提交到 git 的文件相同
* 确保以下文件不会出现在源码分发包中：`KEYS`、`gradlew`、`gradlew.bat`、`gradle-wrapper.jar`、`gradle-wrapper.properties`
* 对于每个 .jar 文件（例如 `core/build/libs/avatica-core-X.Y.Z.jar` 和 `server/build/libs/avatica-server-X.Y.Z-sources.jar`），验证 `META-INF` 目录包含根据所含源码/类的正确 `LICENSE` 和 `NOTICE` 内容。请参阅 ASF 许可文档了解具体要求。
* 按照[此说明](https://httpd.apache.org/dev/verification.html)检查 PGP

验证 Nexus 仓库中的暂存构件：

* 访问 [https://repository.apache.org/](https://repository.apache.org/) 并登录
* 在 `Build Promotion` 下，点击 `Staging Repositories`
* 在 `Staging Repositories` 标签页中，应该有一行配置文件为 `org.apache.calcite`
* 浏览构件树并确保 .jar、.pom、.asc 文件都存在

## 发布尝试失败后清理（针对 Calcite 提交者）

如果有什么不正确，您可以修复它，提交它，并准备下一个候选版本。发布候选标签可以保留一段时间。

## 验证发布

```bash
# 检查签名密钥（例如 2AD3FAE3）是否已推送
gpg --recv-keys key

# 检查密钥
curl -O https://dist.apache.org/repos/dist/release/calcite/KEYS

# 签名/检查 sha512 哈希值
# （假设您的操作系统有 'shasum' 命令。）
function checkHash() {
  cd "$1"
  for i in *.{pom,gz}; do
    if [ ! -f $i ]; then
      continue
    fi
    if [ -f $i.sha512 ]; then
      if [ "$(cat $i.sha512)" = "$(shasum -a 512 $i)" ]; then
        echo $i.sha512 present and correct
      else
        echo $i.sha512 does not match
      fi
    else
      shasum -a 512 $i > $i.sha512
      echo $i.sha512 created
    fi
  done
}
checkHash apache-calcite-avatica-X.Y.Z-rcN
```

## 通过 Apache 投票流程获得发布批准（针对 Calcite 提交者）

在开发邮件列表上进行发布投票。
注意：投票邮件草稿会作为 `prepareVote` 任务的最后一步打印出来，您可以在 `/build/prepareVote/mail.txt` 中找到草稿。

```text
To: dev@calcite.apache.org
Subject: [VOTE] Release apache-calcite-avatica-X.Y.Z (release candidate N)

Hi all,

I have created a build for Apache Calcite Avatica X.Y.Z, release candidate N.

Thanks to everyone who has contributed to this release.
<Further details about release.> You can read the release notes here:
https://github.com/apache/calcite-avatica/blob/XXXX/site/_docs/history.md

The commit to be voted upon:
https://gitbox.apache.org/repos/asf/calcite-avatica/commit/NNNNNN

Its hash is XXXX.

The artifacts to be voted on are located here:
https://dist.apache.org/repos/dist/dev/calcite/apache-calcite-avatica-X.Y.Z-rcN/

The hashes of the artifacts are as follows:
src.tar.gz.sha512 XXXX

A staged Maven repository is available for review at:
https://repository.apache.org/content/repositories/orgapachecalcite-NNNN

Release artifacts are signed with the following key:
https://people.apache.org/keys/committer/jhyde.asc

Please vote on releasing this package as Apache Calcite Avatica X.Y.Z.

The vote is open for the next 72 hours and passes if a majority of
at least three +1 PMC votes are cast.

[ ] +1 Release this package as Apache Calcite Avatica X.Y.Z
[ ]  0 I don't feel strongly about it, but I'm okay with the release
[ ] -1 Do not release this package because...


Here is my vote:

+1 (binding)

Julian
```

投票结束后，发送结果：

```text
Subject: [RESULT] [VOTE] Release apache-calcite-avatica-X.Y.Z (release candidate N)
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
Apache Calcite Avatica X.Y.Z has passed.

Thanks everyone. We'll now roll the release out to the mirrors.

There was some feedback during voting. I shall open a separate
thread to discuss.


Julian
```

使用 [Apache URL 缩短器](http://s.apache.org) 为投票提案和结果邮件生成缩短的 URL。示例：[s.apache.org/calcite-1.2-vote](http://s.apache.org/calcite-1.2-vote) 和 [s.apache.org/calcite-1.2-result](http://s.apache.org/calcite-1.2-result)。

## 发布版本（针对 Calcite 提交者）

发布投票成功后，我们需要将发布推送到镜像，以及执行其他任务。

选择发布日期。这基于您预期发布公告的时间。通常在投票结束后的一天。请记住，UTC 日期在太平洋时间下午 4 点变化。

在 JIRA 中，搜索[在此版本中解决的所有问题](https://issues.apache.org/jira/issues/?jql=project%20%3D%20CALCITE%20and%20fixVersion%20%3D%201.5.0%20and%20status%20%3D%20Resolved%20and%20resolution%20%3D%20Fixed)，并批量更新将其状态更改为"Closed"，更改注释为"Resolved in release X.Y.Z (YYYY-MM-DD)"（适当填写版本号和日期）。取消勾选"Send mail for this update"。

提示：仅在暂存的 nexus 构件在仓库中提升后才推送 git 标签。这是因为推送标签会触发 Docker Hub 立即开始构建 docker 镜像，而构建将拉入提升的构件。如果构件尚不可用，Docker Hub 上的构建将失败。在确认 nexus 构件已正确提升后，最好继续以下步骤。

### 直接在您的环境中发布

```bash
# 试运行发布（推送到 asf-like-environment）
./gradlew publishDist -Prc=0

# 将发布推送到 ASF 服务器
./gradlew publishDist -Prc=0 -Pasf
```

如果 SVN 中有超过 2 个发布版本（参见 https://dist.apache.org/repos/dist/release/calcite），清除最旧的版本：

```bash
svn rm https://dist.apache.org/repos/dist/release/calcite/apache-calcite-avatica-X.Y.Z
```

旧版本仍将在[发布归档](http://archive.apache.org/dist/calcite/)中可用。

### 使用 Docker 发布版本

这假设 rc 发布已被标记并推送到 git 仓库。

```bash
docker compose run promote-release
```

## 添加发布说明并发布公告

通过复制 [site/_posts/2016-11-01-release-1.9.0.md]({{ site.sourceRoot }}/site/_posts/2016-11-01-release-1.9.0.md) 添加发布说明，更新 `gradle.properties` 中的版本号，生成 javadoc 并复制到 `site/target/avatica/javadocAggregate`，[发布网站](#publish-the-web-site)，并检查它是否出现在[新闻](http://localhost:4000/news/)目录中。

24 小时后，通过向 [announce@apache.org](https://mail-archives.apache.org/mod_mbox/www-announce/) 发送邮件来发布公告。您可以使用 [1.8.0 公告](https://mail-archives.apache.org/mod_mbox/www-announce/201606.mbox/%3C57559CC7.1000402@apache.org%3E)作为模板。务必包含项目的简要描述。

## 发布网站（针对 Calcite 提交者）
{: #publish-the-web-site}

请参阅 [site/README.md]({{ site.sourceRoot }}/site/README.md) 中的说明。



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/xingqiu/calcite_xingqiu.png)

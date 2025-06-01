---
menu_id: notes
wiki: notes
layout: wiki
order: 20
title: Git
banner: /assets/banner/banner_1.jpg
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

# 拉取远程库 TAG 代码到 5.3.0-test 分支
git fetch upstream refs/tags/5.3.0:5.3.0-test

# 和上游 master 分支同步（先拉取 upstream）
git fetch upstream
git rebase upstream/master

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

## Git 合并本地多次提交

本地开发时，可能会存在多次提交的情况，为了保证 Git log 的整洁，需要对多次提交进行合并，通过 `git rebase` 命令可以快速完成这个目标。参考 [Git 合并多个 commit](https://segmentfault.com/a/1190000007748862) 文章，可以执行如下命令进行合并：

```bash
# 从 HEAD 版本开始，合并过去的 3 个版本
git rebase -i HEAD~3
# 合并 3a4226b 之前的版本，3a4226b 不参与合并
git rebase -i 3a4226b
```

执行 `rebase` 后，会出现如下的窗口，展示了需要合并的 commit 记录，根据下面的命令提示，我们可以将 `pick` 修改为 `squash` 或 `s`，`squash` 命令会将当前提交合并到前一次提交，并允许修改提交信息。

```
pick c144c143930 Add DatabaseConnector interface, and move execute logic to StandardDatabaseConnector
pick 26eb5180e88 fix unit test

# Rebase 8e684ae6bdf..26eb5180e88 onto 8e684ae6bdf (2 commands)
#
# Commands:
# p, pick <commit> = use commit
# r, reword <commit> = use commit, but edit the commit message
# e, edit <commit> = use commit, but stop for amending
# s, squash <commit> = use commit, but meld into previous commit
# f, fixup [-C | -c] <commit> = like "squash" but keep only the previous
#                    commit's log message, unless -C is used, in which case
#                    keep only this commit's message; -c is same as -C but
#                    opens the editor
# x, exec <command> = run command (the rest of the line) using shell
# b, break = stop here (continue rebase later with 'git rebase --continue')
# d, drop <commit> = remove commit
# l, label <label> = label current HEAD with a name
# t, reset <label> = reset HEAD to a label
# m, merge [-C <commit> | -c <commit>] <label> [# <oneline>]
#         create a merge commit using the original merge commit's
#         message (or the oneline, if no original merge commit was
#         specified); use -c <commit> to reword the commit message
# u, update-ref <ref> = track a placeholder for the <ref> to be updated
#                       to this position in the new commits. The <ref> is
#                       updated at the end of the rebase
#
# These lines can be re-ordered; they are executed from top to bottom.
```

修改后交互式信息显示如下，然后保存退出，此时如果有冲突则需要修改，修改的时候需要注意，保留最新的历史，否则我们的修改就会丢失。

```
pick c144c143930 Add DatabaseConnector interface, and move execute logic to StandardDatabaseConnector
s 26eb5180e88 fix unit test
s 967ddd22efb fix unit test
```

修改完成后，需要执行以下命令，将修改添加进来，并继续 `rebase` 流程，如果处理不了冲突，则可以中断 `rebase` 流程。

```bash
git add .
# 继续 rebase
git rebase --continue
# 中断 rebase
git rebase --abort
```

如果没有冲突，或者已经解决了冲突，则会显示如下的内容，内容中包含了合并提交的 commit 信息，不需要的信息可以使用 `#` 注释，也可以修改最终保留的 commit 信息。

```
# This is a combination of 3 commits.
# This is the 1st commit message:

Add DatabaseConnector interface, and move execute logic to StandardDatabaseConnector

# This is the commit message #2:

fix unit test

# This is the commit message #3:

fix unit test

# Please enter the commit message for your changes. Lines starting
# with '#' will be ignored, and an empty message aborts the commit.
#
# Date:      Wed Nov 13 10:57:57 2024 +0800
#
# interactive rebase in progress; onto 8e684ae6bdf
# Last commands done (3 commands done):
#    squash 26eb5180e88 fix unit test
#    squash 967ddd22efb fix unit test
# No commands remaining.
# You are currently rebasing branch 'dev-1113' on '8e684ae6bdf'.
#
# Changes to be committed:
#       modified:   proxy/backend/core/src/main/java/org/apache/shardingsphere/proxy/backend/connector/DatabaseConnector.java
```

此处我们将 `fix unit test` 都注释掉，并修改第一个 commit 信息，增加 `modify test`，修改完成后退出保存。

```
# This is a combination of 3 commits.
# This is the 1st commit message:

Add DatabaseConnector interface, and move execute logic to StandardDatabaseConnector modify test

# This is the commit message #2:

# fix unit test

# This is the commit message #3:

# fix unit test
```

此时会提示 `rebase` 成功，并显示了新的 HEAD commit 信息。

```
[detached HEAD 552f1459fd4] Add DatabaseConnector interface, and move execute logic to StandardDatabaseConnector modify test
 Date: Wed Nov 13 10:57:57 2024 +0800
 6 files changed, 433 insertions(+), 392 deletions(-)
 create mode 100644 proxy/backend/core/src/main/java/org/apache/shardingsphere/proxy/backend/connector/StandardDatabaseConnector.java
 rename proxy/backend/core/src/test/java/org/apache/shardingsphere/proxy/backend/connector/{DatabaseConnectorTest.java => StandardDatabaseConnectorTest.java} (91%)
Successfully rebased and updated refs/heads/dev-1113.
```

## Github 配置 HTTPS

最近使用 SSH 访问 Github 仓库，经常出现 `push` 卡顿的情况，使用 `ssh -T -p 443 git@ssh.github.com` 测试可用性时，无法正常获取响应结果，ssh 服务可用时，应当返回如下结果。

```bash
duanzhengqiang@duanzhengqiang-ubuntu:~/blog$ ssh -T -p 443 git@ssh.github.com
The authenticity of host '[ssh.github.com]:443 ([20.205.243.160]:443)' can't be established.
ED25519 key fingerprint is SHA256:+DiY3wvvV6TuJJhbpZisF/zLDA0zPMSvHdkr4UvCOqU.
This host key is known by the following other names/addresses:
    ~/.ssh/known_hosts:1: [hashed name]
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '[ssh.github.com]:443' (ED25519) to the list of known hosts.
Hi strongduanmu! You've successfully authenticated, but GitHub does not provide shell access.
```

为了不影响工作效率，尝试将 SSH 替换为 HTTPS，参考 [Managing your personal access tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)，点击个人头像下的 **Settings**，然后选择 `Developer settings -> Personal access tokens -> Fine-grained personal access tokens Beta -> Generate new token`，生成 token 如下图所示。

![生成 token](/assets/blog/blog/202309151042092.png)

生成完成后，执行 `git fetch` 等命令时，输入用户名和密码（生成的 token）。

```bash
Username for 'https://github.com': strongduanmu
Password for 'https://strongduanmu@github.com': {token}
```

此外，为了避免频繁输入用户名和密码，可以执行 `git config --global credential.helper store `，将认证信息存储下来，这样后续执行就无需重复输入了。

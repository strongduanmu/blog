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

---
menu_id: notes
wiki: notes
layout: wiki
title: IDEA
order: 30
---

## IDEA File size exceeds configured limit

IDEA 为了保护内存，对关联的文件大小做了限制，默认值为 `2500kb`。文件过大时，选择 `Help -> Edit Custom Properties...`，然后设置如下参数即可。

```properties
idea.max.intellisense.filesize=999999
```

## IDEA Maven pom 文件变灰如何处理

正常情况下，`pom` 文件是蓝色图标和黑色文字。当 `pom` 文件变为灰色图标和文字，并且文字上出现删除线时，我们该如何处理呢？

{% image /assets/blog/2022/03/23/1648001474.png width:500px padding:10px bg:white %}

查阅资料发现 `pom` 文件变灰，是由于 IDEA 将该 `pom` 文件添加到了忽略文件清单中，我们可以通过 `Preferences -> Build, Execution, Deployment -> Build Tools -> Maven -> Ignored Files` 去除该忽略文件，然后保存并重新导入 Maven 即可。

![1648001974](/assets/blog/2022/03/23/1648001974.png)

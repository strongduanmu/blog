---
robots: noindex,nofollow
sitemap: false
menu_id: notes
layout: wiki
seo_title: IDEA
order: 30
---

## IDEA File size exceeds configured limit

IDEA 为了保护内存，对关联的文件大小做了限制，默认值为 `2500kb`。文件过大时，选择 `Help -> Edit Custom Properties...`，然后设置如下参数即可。

```properties
idea.max.intellisense.filesize=999999
```


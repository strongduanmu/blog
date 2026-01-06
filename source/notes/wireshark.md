---
menu_id: notes
wiki: notes
layout: wiki
title: WireShark
order: 60
banner: /assets/banner/banner_9.jpg
---

## Mac Wireshark 无法抓包，出现无权限异常

{% image /notes/wireshark/image-20250709174005916.png Mac Wireshark 权限异常 width:300px padding:10px bg:transparent %}

```bash
sudo chmod 777 /dev/bpf*
```


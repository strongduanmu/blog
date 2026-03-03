---
layout: wiki
wiki: avatica
order: 011
title: 协议测试
date: 2025-01-30 16:00:00
banner: /assets/banner/banner_9.jpg
---

> 原文链接：https://calcite.apache.org/avatica/docs/protocol_testing.html

使用各种语言构建 Avatica 客户端是 Avatica 的主要目标之一。有各种工具可以帮助完成此过程，但最有用的工具之一是客户端如何与 Avatica 服务器交互的参考。

## 使用 cURL 进行测试

与 Avatica 服务器交互的一种简单方法是使用 cURL 和 JSON 序列化。以下内容已测试可在 Avatica 1.10.0 中工作：

```bash
#!/usr/bin/env bash

set -u

AVATICA=$1
SQL=$2

CONNECTION_ID="conn-$(whoami)-$(date +%s)"
MAX_ROW_COUNT=100
NUM_ROWS=2
OFFSET=0

echo "Open connection"
openConnectionReq="{\"request\": \"openConnection\",\"connectionId\": \"${CONNECTION_ID}\"}"
# 如何使用 info 键设置连接属性的示例
# openConnectionReqWithProperties="{\"request\": \"openConnection\",\"connectionId\": \"${CONNECTION_ID}\",\"info\": {\"user\": \"SCOTT\",\"password\": \"TIGER\"}}"
curl -i -w "\n" "$AVATICA" -H "Content-Type: application/json" --data "$openConnectionReq"
echo

echo "Create statement"
STATEMENTRSP=$(curl -s "$AVATICA" -H "Content-Type: application/json" --data "{\"request\": \"createStatement\",\"connectionId\": \"${CONNECTION_ID}\"}")
STATEMENTID=$(echo "$STATEMENTRSP" | jq .statementId)
echo

echo "PrepareAndExecuteRequest"
curl -i -w "\n" "$AVATICA" -H "Content-Type: application/json" --data "{\"request\": \"prepareAndExecute\",\"connectionId\": \"${CONNECTION_ID}\",\"statementId\": $STATEMENTID,\"sql\": \"$SQL\",\"maxRowCount\": ${MAX_ROW_COUNT}, \"maxRowsInFirstFrame\": ${NUM_ROWS}}"
echo

# 循环遍历所有结果
ISDONE=false
while ! $ISDONE; do
  OFFSET=$((OFFSET + NUM_ROWS))
  echo "FetchRequest - Offset=$OFFSET"
  FETCHRSP=$(curl -s "$AVATICA" -H "Content-Type: application/json" --data "{\"request\": \"fetch\",\"connectionId\": \"${CONNECTION_ID}\",\"statementId\": $STATEMENTID,\"offset\": ${OFFSET},\"fetchMaxRowCount\": ${NUM_ROWS}}")
  echo "$FETCHRSP"
  ISDONE=$(echo "$FETCHRSP" | jq .frame.done)
  echo
done

echo "Close statement"
curl -i -w "\n" "$AVATICA" -H "Content-Type: application/json" --data "{\"request\": \"closeStatement\",\"connectionId\": \"${CONNECTION_ID}\",\"statementId\": $STATEMENTID}"
echo

echo "Close connection"
curl -i -w "\n" "$AVATICA" -H "Content-Type: application/json" --data "{\"request\": \"closeConnection\",\"connectionId\": \"${CONNECTION_ID}\"}"
echo
```



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/xingqiu/calcite_xingqiu.png)

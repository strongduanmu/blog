---
layout: wiki
wiki: calcite
order: 207
title: Kafka 适配器
date: 2026-01-28 08:00:00
banner: /assets/banner/banner_5.jpg
---

> 原文链接：https://calcite.apache.org/docs/kafka_adapter.html

**注意：**

KafkaAdapter 是一个实验性功能，预计公共 API 和使用方式会发生变化。

有关下载和构建 Calcite 的说明，请从[教程](/wiki/calcite/tutorial.html)开始。

Kafka 适配器将 Apache Kafka 主题公开为 STREAM 表，因此可以使用 Calcite Stream SQL 进行查询。请注意，适配器不会尝试扫描所有主题，而是需要用户手动配置表，一个 Kafka 流表映射到一个 Kafka 主题。

下面给出一个模型文件的基本示例：

```json
{
  "version": "1.0",
  "defaultSchema": "KAFKA",
  "schemas": [
    {
      "name": "KAFKA",
      "tables": [
        {
          "name": "TABLE_NAME",
          "type": "custom",
          "factory": "org.apache.calcite.adapter.kafka.KafkaTableFactory",
          "row.converter": "com.example.CustKafkaRowConverter",
          "operand": {
            "bootstrap.servers": "host1:port,host2:port",
            "topic.name": "kafka.topic.name",
            "consumer.params": {
              "key.deserializer": "org.apache.kafka.common.serialization.ByteArrayDeserializer",
              "value.deserializer": "org.apache.kafka.common.serialization.ByteArrayDeserializer"
            }
          }
        }
      ]
    }
  ]
}
```

请注意：

1. 由于 Kafka 消息是无模式的，因此需要 KafkaRowConverter 来显式指定行模式（使用参数 `row.converter`），以及如何将 Kafka 消息解码为 Calcite 行。如果未提供，则使用 KafkaRowConverterImpl；
2. 可以在参数 `consumer.params` 中添加更多消费者设置；

假设此文件存储为 `kafka.model.json`，你可以通过 `sqlline` 连接到 Kafka，如下所示：

```bash
$ ./sqlline
sqlline> !connect jdbc:calcite:model=kafka.model.json admin admin
```

现在 `sqlline` 将接受访问你的 Kafka 主题的 SQL 查询。

使用上面模型中配置的 Kafka 表。我们可以运行一个简单查询来获取消息：

```bash
sqlline> SELECT STREAM *
         FROM KAFKA.TABLE_NAME;
+---------------+---------------------+---------------------+---------------+-----------------+
| MSG_PARTITION |    MSG_TIMESTAMP    |     MSG_OFFSET      | MSG_KEY_BYTES | MSG_VALUE_BYTES |
+---------------+---------------------+---------------------+---------------+-----------------+
| 0             | -1                  | 0                   | mykey0        | myvalue0        |
| 0             | -1                  | 1                   | mykey1        | myvalue1        |
+---------------+---------------------+---------------------+---------------+-----------------+
```

Kafka 表是一个流表，它连续运行。

如果你希望查询快速结束，请添加 `LIMIT`，如下所示：

```bash
sqlline> SELECT STREAM *
         FROM KAFKA.TABLE_NAME
         LIMIT 5;
```

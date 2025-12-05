#!/usr/bin/env python3

import os
from openai import OpenAI

client = OpenAI(
	# 若没有配置环境变量，请用百炼API Key将下行替换为：api_key="sk-xxx",
	api_key= "sk-35f98222ca2d402b9a7b81a7c43179a2",
	base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
)
completion = client.chat.completions.create(
	model="qwen3-max",
	messages=[
		{"role": "system", "content": "You are a helpful assistant."},
		{"role": "user", "content": "你是谁？"},
	],
	stream=True
)
for chunk in completion:
	print(chunk.choices[0].delta.content, end="", flush=True)
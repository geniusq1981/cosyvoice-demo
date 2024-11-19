# Cosyvoice 语音克隆系统

## 项目简介
Cosyvoice 是一个基于 Web 的语音克隆系统，可以通过上传示例音频来克隆语音，并生成新的语音内容。系统使用 Whisper API 进行语音识别，使用 Cosyvoice API 进行语音克隆和合成。

## 功能特点
- 音频文件上传
- 语音文本转写（Speech-to-Text）
- 语音克隆合成
- 音频文件下载
- 响应式界面设计

## 技术实现
- 前端：HTML5 + CSS3 + JavaScript
- API 集成：
  - Whisper API：用于语音识别
  - Cosyvoice API：用于语音克隆
- 文件处理：
  - 支持 WAV、MP3 等常见音频格式
  - Base64 编码处理
  - 文件流下载

## 使用方法

### 1. 环境准备
- 现代浏览器（Chrome、Firefox、Safari 等）
- Whisper API 密钥
- Cosyvoice API 密钥

### 2. 配置步骤
1. 获取 Whisper API 和 Cosyvoice API 的访问凭证
2. 在页面中填入对应的 ID 和 Key

### 3. 使用流程
1. 填写 API 凭证信息
2. 上传示例音频文件
3. 点击"转写文字"按钮获取音频文本
4. 在"被克隆文案"输入框中输入要生成的新文本
5. 点击"执行"按钮进行语音克隆
6. 等待处理完成后自动下载生成的音频文件

## 项目结构 
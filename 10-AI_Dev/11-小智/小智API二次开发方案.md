# 小智AI二次开发API集成方案

> 基于ESP32的AI语音助手外部API集成完整指南

---

## 📋 目录

- [项目概述](#项目概述)
- [技术架构分析](#技术架构分析)
- [集成方案](#集成方案)
- [具体实现](#具体实现)
- [开发清单](#开发清单)
- [部署指南](#部署指南)

---

## 🎯 项目概述

小智是基于ESP32-S3的AI语音聊天机器人，采用模块化设计，支持多种AI服务和外部扩展。

### 核心特性

- **硬件平台**: ESP32/ESP32-S3
- **开发框架**: ESP-IDF 5.3+
- **编程语言**: C++17
- **通信协议**: WebSocket、MQTT
- **AI服务**: Qwen、DeepSeek、Doubao
- **语音识别**: SenseVoice（支持5种语言）
- **语音合成**: 火山引擎/CosyVoice

### 项目结构

```
xiaozhi-esp32/
├── main/                          # 主程序代码
│   ├── application.cc/.h         # 应用程序核心（单例模式）
│   ├── protocols/                # 通信协议实现
│   │   ├── protocol.h/cc            # 基础协议接口
│   │   ├── websocket_protocol.h/cc  # WebSocket协议
│   │   └── mqtt_protocol.h/cc        # MQTT协议
│   ├── iot/                      # 物联网控制模块
│   │   ├── thing_manager.cc/h       # 设备管理器
│   │   ├── thing.cc/h              # 设备基类
│   │   └── things/                  # 具体设备实现
│   ├── display/                   # 显示模块
│   ├── audio_codecs/              # 音频编解码
│   ├── audio_processing/          # 音频处理
│   ├── led/                       # LED控制
│   └── boards/                    # 开发板适配
├── managed_components/            # ESP-IDF组件管理
└── docs/                         # 项目文档
```

---

## 🏗️ 技术架构分析

### 通信协议

#### WebSocket消息类型

**1. 握手消息**
```json
{
  "type": "hello",
  "version": 1,
  "transport": "websocket",
  "audio_params": {
    "format": "opus",
    "sample_rate": 16000,
    "channels": 1,
    "frame_duration": 60
  }
}
```

**2. 监听控制**
```json
{
  "session_id": "xxx",
  "type": "listen",
  "state": "start|stop|detect",
  "mode": "auto|manual|realtime"
}
```

**3. 语音相关**
```json
{
  "type": "stt|tts",
  "text": "识别文本",
  "state": "start|stop"
}
```

**4. IoT控制**
```json
{
  "type": "iot",
  "commands": [...]
}
```

### 设备状态机

```
kDeviceStateUnknown     → 未知状态
kDeviceStateStarting    → 启动中
kDeviceStateConfiguring → 配置中
kDeviceStateIdle        → 空闲
kDeviceStateConnecting  → 连接中
kDeviceStateListening   → 监听中
kDeviceStateSpeaking    → 说话中
kDeviceStateUpgrading   → 升级中
kDeviceStateActivating  → 激活中
kDeviceStateFatalError  → 致命错误
```

---

## 💡 集成方案

### 方案一：自建服务器（推荐）

**优势**：
- ✅ 完全控制数据流
- ✅ 灵活集成任何API
- ✅ 可扩展性强
- ✅ 数据隐私可控

**架构图**：

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   小智设备   │ ◄─────► │  你的服务器   │ ◄─────► │  外部服务   │
│  (ESP32)    │         │  (Node.js)   │         │   API集合   │
└─────────────┘         └──────────────┘         └─────────────┘
                              │
                              ▼
                        ┌──────────────┐
                        │  API网关层   │
                        └──────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐    ┌──────────┐    ┌──────────┐
        │ 天气API  │    │ 音乐API  │    │ 日历API  │
        └──────────┘    └──────────┘    └──────────┘
```

### 方案二：修改固件添加新协议

**适用场景**：
- 需要本地处理
- 减少云端依赖
- 特殊协议需求

**修改文件**：
- `main/protocols/` - 添加新协议实现
- `main/application.cc` - 协议选择逻辑

### 方案三：扩展IoT控制模块

**适用场景**：
- 智能家居控制
- 设备联动
- 本地自动化

**相关文件**：
- `main/iot/thing_manager.cc`
- `main/iot/things/` - 添加新设备类型

---

## 🔧 具体实现

### 1. 服务器端基础框架（Node.js）

#### 安装依赖

```bash
npm init -y
npm install ws axios express lowdb dotenv
```

#### 主服务器代码

```javascript
// server.js
const WebSocket = require('ws');
const express = require('express');
const axios = require('axios');
const APIManager = require('./api-manager');
const IntentRouter = require('./intent-router');

const app = express();
const PORT = 8080;

// 初始化模块
const apiManager = new APIManager();
const intentRouter = new IntentRouter();

// HTTP服务
app.use(express.json());
app.use(express.static('public'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', connected: xiaozhiClients.size });
});

// WebSocket服务器
const wss = new WebSocket.Server({ port: 8080 });
const xiaozhiClients = new Set();

wss.on('connection', (ws, req) => {
  console.log('🔗 新设备连接:', req.socket.remoteAddress);
  xiaozhiClients.add(ws);

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      await handleMessage(ws, data);
    } catch (error) {
      console.error('消息处理错误:', error);
    }
  });

  ws.on('close', () => {
    console.log('❌ 设备断开连接');
    xiaozhiClients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket错误:', error);
  });
});

// 消息处理核心逻辑
async function handleMessage(ws, data) {
  console.log('📨 收到消息:', data.type);

  switch (data.type) {
    case 'hello':
      handleHello(ws, data);
      break;

    case 'stt':
      if (data.text) {
        await handleUserSpeech(ws, data.text);
      }
      break;

    case 'listen':
      handleListenState(ws, data);
      break;

    default:
      console.log('未知消息类型:', data.type);
  }
}

// 处理握手
function handleHello(ws, data) {
  console.log('🤝 设备握手成功');
  ws.send(JSON.stringify({
    type: 'hello',
    version: 1,
    server: 'xiaozhi-custom-server'
  }));
}

// 处理用户语音输入
async function handleUserSpeech(ws, userText) {
  console.log('🎤 用户说:', userText);

  // 1. 意图识别
  const intent = intentRouter.route(userText);
  console.log('🎯 意图:', intent.intent);

  // 2. 调用外部API或LLM
  let response;
  if (intent.handler !== 'llm') {
    // 调用外部API
    response = await apiManager.call(intent.handler, userText);
  } else {
    // 调用LLM
    response = await callLLM(userText);
  }

  console.log('💬 回复:', response);

  // 3. 发送TTS消息
  sendToXiaozhi(ws, response);
}

// 发送消息给小智
function sendToXiaozhi(ws, text) {
  ws.send(JSON.stringify({
    type: 'tts',
    text: text,
    state: 'start'
  }));
}

// 调用大语言模型
async function callLLM(text) {
  // 这里可以调用任何LLM API
  // 例如：Qwen、DeepSeek、OpenAI等
  try {
    const response = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      {
        model: 'qwen-turbo',
        input: {
          messages: [{ role: 'user', content: text }]
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.QWEN_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.output.text;
  } catch (error) {
    console.error('LLM调用失败:', error);
    return '抱歉，我暂时无法回答这个问题。';
  }
}

// 处理监听状态
function handleListenState(ws, data) {
  console.log('🎧 监听状态:', data.state);
}

// 启动服务
app.listen(3000, () => {
  console.log('🚀 HTTP服务器运行在 http://localhost:3000');
  console.log('🌐 WebSocket服务器运行在 ws://localhost:8080');
});
```

### 2. 外部API管理器

```javascript
// api-manager.js
const axios = require('axios');

class APIManager {
  constructor() {
    this.apis = new Map();
    this.cache = new Map();
    this.loadAPIs();
  }

  loadAPIs() {
    // 注册所有外部API
    this.registerAPI('weatherAPI', {
      name: '天气查询',
      handler: this.getWeather.bind(this),
      timeout: 5000,
      cache: 600 // 缓存10分钟
    });

    this.registerAPI('musicAPI', {
      name: '音乐播放',
      handler: this.playMusic.bind(this),
      timeout: 10000
    });

    this.registerAPI('newsAPI', {
      name: '新闻获取',
      handler: this.getNews.bind(this),
      timeout: 5000,
      cache: 1800 // 缓存30分钟
    });

    this.registerAPI('calendarAPI', {
      name: '日历查询',
      handler: this.getCalendar.bind(this),
      timeout: 5000
    });

    this.registerAPI('translateAPI', {
      name: '翻译服务',
      handler: this.translate.bind(this),
      timeout: 5000
    });

    this.registerAPI('homeAutomationAPI', {
      name: '智能家居',
      handler: this.controlHome.bind(this),
      timeout: 3000
    });
  }

  registerAPI(id, config) {
    this.apis.set(id, config);
  }

  async call(apiId, params) {
    const api = this.apis.get(apiId);

    if (!api) {
      throw new Error(`未找到API: ${apiId}`);
    }

    // 检查缓存
    if (api.cache) {
      const cacheKey = `${apiId}:${JSON.stringify(params)}`;
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < api.cache * 1000) {
        console.log('✅ 使用缓存:', apiId);
        return cached.data;
      }
    }

    try {
      // 设置超时
      const result = await Promise.race([
        api.handler(params),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('API调用超时')), api.timeout)
        )
      ]);

      // 更新缓存
      if (api.cache) {
        const cacheKey = `${apiId}:${JSON.stringify(params)}`;
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }

      return result;
    } catch (error) {
      console.error(`❌ API调用失败 [${api.name}]:`, error.message);
      return `抱歉，${api.name}暂时无法使用。`;
    }
  }

  // ==================== 具体API实现 ====================

  // 天气API
  async getWeather(params) {
    const city = this.extractCity(params) || '北京';

    // 和风天气API示例
    try {
      const response = await axios.get(
        `https://devapi.qweather.com/v7/weather/now`,
        {
          params: {
            location: this.getCityCode(city),
            key: process.env.QWEATHER_API_KEY
          }
        }
      );

      const weather = response.data.now;
      return `今天${city}的天气是${weather.text}，温度${weather.temp}度，体感温度${weather.feelsLike}度。`;
    } catch (error) {
      throw new Error('天气服务暂时不可用');
    }
  }

  // 音乐API
  async playMusic(params) {
    const songName = this.extractSongName(params) || '流行歌曲';

    // 网易云音乐API示例
    try {
      const response = await axios.get(
        'https://api.injahow.cn/meting/',
        {
          params: {
            type: 'song',
            name: songName
          }
        }
      );

      if (response.data && response.data.length > 0) {
        const song = response.data[0];
        return `正在为你播放《${song.name}》，演唱者${song.artist}。`;
      }

      return `抱歉，找不到歌曲《${songName}》。`;
    } catch (error) {
      throw new Error('音乐服务暂时不可用');
    }
  }

  // 新闻API
  async getNews(params) {
    try {
      // 每60秒头条新闻API
      const response = await axios.get(
        'https://v2.alapi.cn/api/new/touTiao',
        {
          params: {
            token: process.env.ALAPI_TOKEN,
            num: 5
          }
        }
      );

      const news = response.data.data.news_list;
      const headlines = news.slice(0, 3).map(n => n.title).join('；');

      return `今天的重要新闻有：${headlines}`;
    } catch (error) {
      throw new Error('新闻服务暂时不可用');
    }
  }

  // 日历API
  async getCalendar(params) {
    try {
      const today = new Date();
      const response = await axios.get(
        `https://v2.alapi.cn/api/holiday/event`,
        {
          params: {
            token: process.env.ALAPI_TOKEN,
            year: today.getFullYear(),
            month: today.getMonth() + 1,
            day: today.getDate()
          }
        }
      );

      if (response.data.data && response.data.data.length > 0) {
        const events = response.data.data.map(e => e.name).join('、');
        return `今天的重要日子有：${events}`;
      }

      return '今天没有什么特殊安排。';
    } catch (error) {
      throw new Error('日历服务暂时不可用');
    }
  }

  // 翻译API
  async translate(params) {
    const text = this.extractTranslateText(params);
    const targetLang = this.extractTargetLang(params) || 'en';

    try {
      const response = await axios.post(
        'https://api.translate.googleapis.com/translate_a/single',
        null,
        {
          params: {
            client: 'gtx',
            sl: 'auto',
            tl: targetLang,
            dt: 't',
            q: text
          }
        }
      );

      const translated = response.data[0].map(r => r[0]).join('');
      return `${text}的翻译是：${translated}`;
    } catch (error) {
      throw new Error('翻译服务暂时不可用');
    }
  }

  // 智能家居控制
  async controlHome(params) {
    const device = this.extractDevice(params);
    const action = this.extractAction(params);

    // 这里可以接入米家、Home Assistant等
    try {
      // 示例：调用米家API
      await axios.post(
        'https://api.io.mi.com/app/control',
        {
          device: device,
          action: action
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.MIJA_TOKEN}`
          }
        }
      );

      return `已${action}${device}。`;
    } catch (error) {
      throw new Error('智能家居控制失败');
    }
  }

  // ==================== 辅助方法 ====================

  extractCity(text) {
    const cityMap = {
      '北京': 'beijing',
      '上海': 'shanghai',
      '广州': 'guangzhou',
      '深圳': 'shenzhen'
    };

    for (const [cn, en] of Object.entries(cityMap)) {
      if (text.includes(cn)) return cn;
    }
    return null;
  }

  getCityCode(city) {
    const codes = {
      '北京': '101010100',
      '上海': '101020100',
      '广州': '101280101',
      '深圳': '101280601'
    };
    return codes[city] || '101010100';
  }

  extractSongName(text) {
    // 简单提取歌曲名
    const match = text.match(/播放《?(.+?)》?/);
    return match ? match[1] : null;
  }

  extractTranslateText(text) {
    const match = text.match(/翻译["'](.+?)["']/);
    return match ? match[1] : null;
  }

  extractTargetLang(text) {
    if (text.includes('英文') || text.includes('英语')) return 'en';
    if (text.includes('日文') || text.includes('日语')) return 'ja';
    if (text.includes('韩文') || text.includes('韩语')) return 'ko';
    return 'en';
  }

  extractDevice(text) {
    const devices = ['灯', '空调', '电视', '窗帘'];
    for (const device of devices) {
      if (text.includes(device)) return device;
    }
    return null;
  }

  extractAction(text) {
    if (text.includes('打开') || text.includes('开启')) return '打开';
    if (text.includes('关闭') || text.includes('关掉')) return '关闭';
    return '控制';
  }
}

module.exports = APIManager;
```

### 3. 意图识别路由器

```javascript
// intent-router.js
class IntentRouter {
  constructor() {
    this.rules = [
      // 天气类
      {
        intent: 'weather',
        patterns: [
          /天气怎么样|今天天气|明天天气|会下雨吗|气温多少|几度/,
          /weather|temperature/i
        ],
        handler: 'weatherAPI',
        priority: 1
      },

      // 音乐类
      {
        intent: 'music',
        patterns: [
          /播放.*歌曲|来首.*音乐|听歌|放音乐/,
          /play music|play song/i
        ],
        handler: 'musicAPI',
        priority: 1
      },

      // 日历类
      {
        intent: 'calendar',
        patterns: [
          /今天日程|有什么安排|日历|提醒|纪念日|生日/,
          /calendar|schedule|reminder/i
        ],
        handler: 'calendarAPI',
        priority: 1
      },

      // 新闻类
      {
        intent: 'news',
        patterns: [
          /新闻|头条|最新消息|有什么新闻/,
          /news|headlines/i
        ],
        handler: 'newsAPI',
        priority: 1
      },

      // 翻译类
      {
        intent: 'translate',
        patterns: [
          /翻译["'](.+?)["']|把.*翻译成|用.*说/,
          /translate|interpret/i
        ],
        handler: 'translateAPI',
        priority: 1
      },

      // 智能家居类
      {
        intent: 'smart_home',
        patterns: [
          /打开.*|关闭.*|控制.*/],
          /turn on|turn off|control/i
        ],
        handler: 'homeAutomationAPI',
        priority: 1
      },

      // 时间类
      {
        intent: 'time',
        patterns: [
          /现在几点|几点了|当前时间|现在时间/,
          /what time|current time/i
        ],
        handler: 'timeAPI',
        priority: 1
      }
    ];
  }

  route(userText) {
    let bestMatch = { intent: 'chat', handler: 'llm', confidence: 0 };

    for (const rule of this.rules) {
      for (const pattern of rule.patterns) {
        if (pattern.test(userText)) {
          // 返回匹配的规则
          return {
            intent: rule.intent,
            handler: rule.handler,
            confidence: 0.95,
            matched: true
          };
        }
      }
    }

    return bestMatch;
  }

  // 添加自定义规则
  addRule(intent, patterns, handler, priority = 1) {
    this.rules.push({
      intent,
      patterns,
      handler,
      priority
    });
    this.rules.sort((a, b) => b.priority - a.priority);
  }
}

module.exports = IntentRouter;
```

### 4. 对话记忆管理

```javascript
// memory-store.js
const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('data/db.json');
const db = lowdb(adapter);

// 初始化数据库结构
db.defaults({
  conversations: [],
  userPreferences: {},
  apiCache: {},
  statistics: {
    totalMessages: 0,
    apiCalls: {},
    intents: {}
  }
}).write();

class MemoryStore {
  constructor() {
    this.maxHistory = 50; // 保留最近50条对话
  }

  // 保存对话
  async saveConversation(userId, text, response, intent) {
    db.get('conversations')
      .push({
        userId,
        text,
        response,
        intent,
        timestamp: Date.now()
      })
      .write();

    // 更新统计
    db.update('statistics.totalMessages', n => n + 1).write();

    if (intent) {
      const key = `statistics.intents.${intent}`;
      db.update(key, n => (n || 0) + 1).write();
    }

    // 清理旧对话
    this.cleanup();
  }

  // 获取用户对话历史
  async getHistory(userId, limit = 10) {
    return db.get('conversations')
      .filter({ userId })
      .orderBy('timestamp', 'desc')
      .take(limit)
      .value();
  }

  // 获取上下文
  async getContext(userId) {
    const history = await this.getHistory(userId, 5);
    return history.reverse().map(h => ({
      role: 'user',
      content: h.text
    })).concat(history.map(h => ({
      role: 'assistant',
      content: h.response
    })));
  }

  // 保存用户偏好
  async savePreference(userId, key, value) {
    db.set(`userPreferences.${userId}.${key}`, value).write();
  }

  // 获取用户偏好
  async getPreference(userId, key) {
    return db.get(`userPreferences.${userId}.${key}`).value();
  }

  // 清理旧数据
  cleanup() {
    const count = db.get('conversations').size().value();
    if (count > this.maxHistory) {
      const toRemove = count - this.maxHistory;
      const conversations = db.get('conversations').value();
      const removed = conversations.slice(0, toRemove);

      db.get('conversations')
        .remove(item => removed.some(r => r.timestamp === item.timestamp))
        .write();
    }
  }

  // 获取统计数据
  getStatistics() {
    return db.get('statistics').value();
  }
}

module.exports = MemoryStore;
```

### 5. 配置文件

```javascript
// .env.example
# 服务器配置
PORT=8080
HTTP_PORT=3000

# Qwen大模型API
QWEN_API_KEY=your_qwen_api_key

# 和风天气API
QWEATHER_API_KEY=your_qweather_api_key

 ALAPI令牌
ALAPI_TOKEN=your_alapi_token

# 米家API
MIJA_TOKEN=your_mija_token

# 数据库
DB_PATH=./data/db.json
```

```javascript
// package.json
{
  "name": "xiaozhi-server",
  "version": "1.0.0",
  "description": "小智AI自定义服务器",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  },
  "dependencies": {
    "ws": "^8.14.2",
    "express": "^4.18.2",
    "axios": "^1.6.0",
    "lowdb": "^1.1.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.7.0"
  }
}
```

---

## 📦 开发清单

### ✅ 必需功能

- [ ] WebSocket服务器
  - [ ] 接收小智连接
  - [ ] 处理音频流
  - [ ] 双向消息传输
  - [ ] 心跳保持

- [ ] 语音识别（STT）
  - [ ] 集成SenseVoice
  - [ ] 音频解码
  - [ ] 文本输出

- [ ] 语音合成（TTS）
  - [ ] 集成火山引擎/CosyVoice
  - [ ] 音频编码
  - [ ] 流式播放

- [ ] 大模型对话
  - [ ] LLM API集成
  - [ ] 上下文管理
  - [ ] 流式输出

- [ ] 外部API调用模块
  - [ ] API管理器
  - [ ] 意图识别
  - [ ] 参数提取
  - [ ] 错误处理
  - [ ] 缓存机制

### 🎯 推荐功能

- [ ] 用户管理系统
  - [ ] 用户注册/登录
  - [ ] 设备绑定
  - [ ] 权限管理

- [ ] 技能商店
  - [ ] API插件管理
  - [ ] 动态加载
  - [ ] 配置界面

- [ ] 数据统计
  - [ ] 使用记录
  - [ ] API调用统计
  - [ ] 性能监控

- [ ] Web管理后台
  - [ ] 设备管理
  - [ ] API配置
  - [ ] 日志查看
  - [ ] 数据可视化

---

## 🚀 部署指南

### 开发环境

```bash
# 1. 克隆或创建项目
mkdir xiaozhi-server && cd xiaozhi-server

# 2. 初始化项目
npm init -y

# 3. 安装依赖
npm install ws axios express lowdb dotenv

# 4. 创建配置文件
cp .env.example .env
# 编辑 .env 填写API密钥

# 5. 创建目录结构
mkdir -p data public logs

# 6. 启动服务
npm start
```

### 生产环境

#### 使用PM2守护进程

```bash
# 安装PM2
npm install -g pm2

# 启动服务
pm2 start server.js --name xiaozhi-server

# 查看状态
pm2 status

# 查看日志
pm2 logs xiaozhi-server

# 设置开机自启
pm2 startup
pm2 save
```

#### Nginx反向代理

```nginx
# /etc/nginx/sites-available/xiaozhi-server
server {
    listen 80;
    server_name your-domain.com;

    # HTTP重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL证书配置
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # WebSocket代理
    location /ws {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 86400;
    }

    # HTTP API代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Docker部署

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000 8080

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  xiaozhi-server:
    build: .
    ports:
      - "3000:3000"
      - "8080:8080"
    environment:
      - NODE_ENV=production
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
    restart: unless-stopped
```

### 云服务推荐

- **阿里云**: ECS + SLB + OSS
- **腾讯云**: CVM + CLB + COS
- **AWS**: EC2 + ELB + S3

---

## 🔌 扩展示例

### 微信公众号集成

```javascript
// wechat.js
const crypto = require('crypto');

app.post('/wechat', (req, res) => {
  const { signature, timestamp, nonce, echostr } = req.query;

  // 验证签名
  const token = 'your_token';
  const hash = crypto.createHash('sha1')
    .update([token, timestamp, nonce].sort().join(''))
    .digest('hex');

  if (hash === signature) {
    // 处理消息
    const message = req.body;
    if (message.MsgType === 'text') {
      // 发送给小智
      xiaozhiClients.forEach(ws => {
        sendToXiaozhi(ws, message.Content);
      });
    }
    res.send('success');
  } else {
    res.status(403).send('Forbidden');
  }
});
```

### 钉钉机器人集成

```javascript
// dingtalk.js
async function sendToDingTalk(text) {
  const webhook = 'https://oapi.dingtalk.com/robot/send?access_token=xxx';
  const secret = 'your_secret';

  // 签名
  const timestamp = Date.now();
  const sign = crypto.createHmac('sha256', secret)
    .update(`${timestamp}\n${secret}`)
    .digest('base64');

  await axios.post(webhook, {
    msgtype: 'text',
    text: { content: text }
  }, {
    params: { timestamp, sign }
  });
}
```

### Telegram Bot集成

```javascript
// telegram.js
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // 发送给小智
  xiaozhiClients.forEach(ws => {
    sendToXiaozhi(ws, text);
  });

  // 监听小智的回复
  bot.sendMessage(chatId, '小智正在处理...');
});
```

---

## 📚 参考资料

### 相关API文档

- [和风天气API](https://dev.qweather.com/)
- [网易云音乐API](https://github.com/Binaryify/NeteaseCloudMusicApi)
- [每60秒API](https://www.alapi.cn/)
- [米家开放平台](https://developer.mi.com/home/)
- [Telegram Bot API](https://core.telegram.org/bots/api)

### 小智相关资源

- [小智GitHub仓库](https://github.com/yady-xiaozhi/xiaozhi-esp32)
- [ESP-IDF文档](https://docs.espressif.com/projects/esp-idf/)
- [WebSocket协议](https://tools.ietf.org/html/rfc6455)

---

## 🤝 贡献

欢迎提交Issue和Pull Request！

---

## 📄 许可证

MIT License

---

**最后更新**: 2026-01-17

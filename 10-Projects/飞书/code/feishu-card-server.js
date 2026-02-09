// 飞书卡片回调服务 - 纯 Node.js 实现（零依赖）
const http = require('http');
const https = require('https');

// ==================== 配置 ====================
const CONFIG = {
  PORT: 5000,
  APP_ID: 'cli_a90c7c4c29f8dbd2',           // 你的 App ID
  APP_SECRET: 'HWUCUR0GFObAsEUOXxwDnhOH8PSctoYv',   // 你的 App Secret
  BASE_ID: '',      // 多维表格 ID（需要填写）
  TABLE_ID: ''      // 表格 ID（需要填写）
};

// Token 缓存
let tokenCache = {
  token: null,
  expireTime: 0
};

// ==================== 工具函数 ====================

// 发送 HTTPS 请求
function request(url, options = {}, data = null) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          resolve(body);
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// 获取 tenant_access_token
async function getTenantToken() {
  const now = Date.now();
  if (tokenCache.token && now < tokenCache.expireTime) {
    return tokenCache.token;
  }

  const result = await request(
    'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal/',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    JSON.stringify({
      app_id: CONFIG.APP_ID,
      app_secret: CONFIG.APP_SECRET
    })
  );

  if (result.tenant_access_token) {
    tokenCache.token = result.tenant_access_token;
    tokenCache.expireTime = now + (result.expire - 300) * 1000;
    console.log('[Token] 获取成功，有效期:', result.expire, '秒');
  }
  return tokenCache.token;
}

// 更新多维表格
async function updateBitable(recordId, fields) {
  const token = await getTenantToken();
  const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${CONFIG.BASE_ID}/tables/${CONFIG.TABLE_ID}/records/${recordId}`;
  
  return request(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, JSON.stringify({ fields }));
}

// 发送飞书消息
async function sendFeishuMessage(chatId, card) {
  const token = await getTenantToken();
  const url = 'https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=chat_id';
  
  return request(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, JSON.stringify({
    receive_id: chatId,
    msg_type: 'interactive',
    content: JSON.stringify(card)
  }));
}

// ==================== 路由处理 ====================

// 处理卡片回调
async function handleCardCallback(body, res) {
  const event = body.event || {};
  const operator = event.operator || {};
  const clickerName = operator.name || '未知用户';
  
  const value = (event.action && event.action.value) || {};
  const action = value.action;
  const recordId = value.record_id;
  
  console.log(`[点击] ${clickerName} 点击了 ${action}, record_id=${recordId}`);

  // 第一步：显示状态选择
  if (action === 'update_status') {
    const now = new Date();
    const timeStr = `${now.getMonth()+1}-${now.getDate()} ${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`;
    
    const response = {
      toast: { type: 'info', content: '请选择新状态' },
      card: {
        schema: '2.0',
        header: {
          template: 'blue',
          title: { tag: 'plain_text', content: '📝 选择新状态' }
        },
        body: {
          direction: 'vertical',
          elements: [
            { tag: 'markdown', content: `**操作人：**${clickerName}\n**时间：**${timeStr}` },
            { tag: 'hr' },
            {
              tag: 'column_set',
              columns: [
                {
                  tag: 'column',
                  width: 'weighted',
                  weight: 1,
                  elements: [{
                    tag: 'button',
                    text: { tag: 'plain_text', content: '📞 跟进中' },
                    type: 'primary',
                    behaviors: [{
                      type: 'callback',
                      value: { action: 'set_status', record_id: recordId, status: '跟进中' }
                    }]
                  }]
                },
                {
                  tag: 'column',
                  width: 'weighted',
                  weight: 1,
                  elements: [{
                    tag: 'button',
                    text: { tag: 'plain_text', content: '✅ 已成交' },
                    type: 'primary',
                    behaviors: [{
                      type: 'callback',
                      value: { action: 'set_status', record_id: recordId, status: '已成交' }
                    }]
                  }]
                },
                {
                  tag: 'column',
                  width: 'weighted',
                  weight: 1,
                  elements: [{
                    tag: 'button',
                    text: { tag: 'plain_text', content: '❌ 已放弃' },
                    type: 'danger',
                    behaviors: [{
                      type: 'callback',
                      value: { action: 'set_status', record_id: recordId, status: '已放弃' }
                    }]
                  }]
                }
              ]
            }
          ]
        }
      }
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
    return;
  }

  // 第二步：设置状态并更新表格
  if (action === 'set_status') {
    const status = value.status;
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}T${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    
    // 更新多维表格
    let updateResult = { code: 0 };
    if (CONFIG.BASE_ID && CONFIG.TABLE_ID) {
      updateResult = await updateBitable(recordId, {
        '当前状态': status,
        '最后更新时间': timeStr
      });
    } else {
      console.log('[提示] 未配置 BASE_ID 和 TABLE_ID，跳过表格更新');
    }
    
    console.log('[更新] 状态=', status, '结果=', JSON.stringify(updateResult));
    
    const response = {
      toast: { type: 'success', content: `✅ 状态已更新为：${status}` },
      card: {
        schema: '2.0',
        header: {
          template: 'green',
          title: { tag: 'plain_text', content: '✅ 状态更新成功' }
        },
        body: {
          direction: 'vertical',
          elements: [
            { tag: 'markdown', content: `**操作人：**${clickerName}\n**新状态：**${status}\n**时间：**${timeStr}` }
          ]
        }
      }
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
    return;
  }

  // 默认响应
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ toast: { type: 'info', content: '已收到' } }));
}

// 发送卡片接口
async function handleSendCard(body, res) {
  const { chat_id, customer_name, phone, record_id } = body;
  
  const card = {
    schema: '2.0',
    header: {
      template: 'blue',
      title: { tag: 'plain_text', content: `📝 客户：${customer_name || '未命名'}` }
    },
    body: {
      direction: 'vertical',
      elements: [
        { tag: 'markdown', content: `**电话：**${phone || '无'}\n**记录ID：**${record_id || '无'}` },
        {
          tag: 'button',
          text: { tag: 'plain_text', content: '📝 更新状态' },
          type: 'primary',
          behaviors: [{
            type: 'callback',
            value: { action: 'update_status', record_id: record_id }
          }]
        }
      ]
    }
  };
  
  const result = await sendFeishuMessage(chat_id, card);
  console.log('[发送卡片] 结果:', JSON.stringify(result));
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(result));
}

// ==================== 创建 HTTP 服务器 ====================

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // 解析请求体
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    let jsonBody = {};
    try {
      jsonBody = JSON.parse(body);
    } catch {}
    
    console.log(`[${req.method}] ${req.url}`);
    
    try {
      // 卡片回调
      if (req.url === '/webhook/feishu-card' && req.method === 'POST') {
        await handleCardCallback(jsonBody, res);
        return;
      }
      
      // 发送卡片
      if (req.url === '/send-card' && req.method === 'POST') {
        await handleSendCard(jsonBody, res);
        return;
      }
      
      // 健康检查
      if (req.url === '/' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          status: 'ok', 
          time: new Date().toISOString(),
          endpoints: ['/webhook/feishu-card', '/send-card']
        }));
        return;
      }
      
      // 404
      res.writeHead(404);
      res.end('Not Found');
      
    } catch (err) {
      console.error('[错误]', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  });
});

// 启动服务器
server.listen(CONFIG.PORT, () => {
  console.log('========================================');
  console.log('🚀 飞书卡片服务已启动');
  console.log(`📍 地址: http://localhost:${CONFIG.PORT}`);
  console.log('');
  console.log('📋 可用接口:');
  console.log(`   GET  http://localhost:${CONFIG.PORT}/`);
  console.log(`   POST http://localhost:${CONFIG.PORT}/webhook/feishu-card  (飞书回调)`);
  console.log(`   POST http://localhost:${CONFIG.PORT}/send-card           (发送卡片)`);
  console.log('');
  console.log('⚠️  请填写 CONFIG 中的 BASE_ID 和 TABLE_ID');
  console.log('========================================');
});

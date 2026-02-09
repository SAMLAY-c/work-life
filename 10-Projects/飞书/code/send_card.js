const https = require('https');

const TOKEN = 't-g10429nDV2C63SPQ2AH52VHRGESVQFRAC2LW5F43';

const card = {
  schema: '2.0',
  config: {
    streaming_mode: false,
    summary: { content: '🎯 SDR转交通知：新客户待跟进' },
    enable_forward: true,
    update_multi: true,
    width_mode: 'fill'
  },
  header: {
    template: 'blue',
    title: { tag: 'plain_text', content: '🎯 SDR 客户转交通知' },
    subtitle: { tag: 'plain_text', content: '来自 SDR 机器人 · 2026-02-09' }
  },
  body: {
    direction: 'vertical',
    elements: [
      { tag: 'markdown', content: '**👤 客户信息**' },
      {
        tag: 'column_set',
        columns: [
          {
            tag: 'column',
            width: 'weighted',
            weight: 1,
            elements: [
              { tag: 'markdown', content: '**客户姓名**\n<font color="grey">张三</font>' }
            ]
          },
          {
            tag: 'column',
            width: 'weighted',
            weight: 1,
            elements: [
              { tag: 'markdown', content: '**联系电话**\n<font color="grey">138****7890</font>' }
            ]
          }
        ]
      },
      { tag: 'hr' },
      { tag: 'markdown', content: '**📋 需求详情**\n\n> 🏷️ 产品需求：软件订购\n> 💰 预算范围：面议\n> ⏰ 跟进优先级：高' },
      { tag: 'hr' },
      { tag: 'markdown', content: '**💡 SDR 备注**\n\n客户通过官网表单提交，对产品功能已有初步了解，建议优先电话沟通演示。' },
      { tag: 'hr' },
      { tag: 'markdown', content: '**👇 分配销售**\n\n<at id="ou_f7ac292fc42a3cdfc0fc17852daf951e">李文慧</at> 这是你的新客户，请尽快跟进！' },
      { tag: 'hr' },
      {
        tag: 'column_set',
        columns: [
          {
            tag: 'column',
            width: 'weighted',
            weight: 1,
            elements: [
              {
                tag: 'button',
                text: { tag: 'plain_text', content: '📞 一键拨打' },
                type: 'primary',
                behaviors: [
                  { type: 'open_url', default_url: 'tel:13800137890' }
                ]
              }
            ]
          },
          {
            tag: 'column',
            width: 'weighted',
            weight: 1,
            elements: [
              {
                tag: 'button',
                text: { tag: 'plain_text', content: '📝 更新状态' },
                type: 'default',
                behaviors: [
                  {
                    type: 'callback',
                    value: {
                      action: 'show_status_options',
                      record_id: 'test001',
                      assigned_user: 'ou_f7ac292fc42a3cdfc0fc17852daf951e'
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
};

const payload = JSON.stringify({
  receive_id: 'oc_a8246d964960b1dd3fc2697ce6d000b4',
  msg_type: 'interactive',
  content: JSON.stringify(card)
});

const options = {
  hostname: 'open.feishu.cn',
  path: '/open-apis/im/v1/messages?receive_id_type=chat_id',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const result = JSON.parse(data);
    if (result.code === 0) {
      console.log('✅ 发送成功！');
      console.log('message_id:', result.data?.message_id);
    } else {
      console.log('❌ 失败:', result);
    }
  });
});

req.on('error', console.error);
req.write(payload);
req.end();

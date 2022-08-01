const {WechatyBuilder} = require('wechaty')
const WechatyFaceCartonPlugin = require('../src/index')
const name = 'wechat-carton'
const bot = WechatyBuilder.build({
  name, // generate xxxx.memory-card.json and save login data for the next login
  puppet: 'wechaty-puppet-wechat',
  puppetOptions: {
    uos: true
  }
})

async function onMessage(msg) {
  console.log('msgid', msg.id)
}

bot.on('message', onMessage)

bot
  .use(
    WechatyFaceCartonPlugin({
      maxuser: 20, // 支持最多多少人进行对话，建议不要设置太多，否则占用内存会增加
      secretId: '腾讯secretId', // 腾讯secretId
      secretKey: '腾讯secretKey', // 腾讯secretKey
      allowUser: ['Leo_chen'], // 允许哪些好友使用人像漫画化功能，为空[]代表所有人开启
      allowRoom: ['测试1', '微信每日说'], // 允许哪些群使用人像漫画化功能，为空[]代表不开启任何一个群
      quickModel: true, // 快速体验模式 默认关闭 开启后可直接生成二维码扫描体验，如果自己代码有登录逻辑可以不配置此项
      tipsword: '卡通', // 私聊发送消息，触发照片卡通化提示 如果直接发送图片，默认进入图片卡通化功能，不填则当用户初次发送文字消息时不做任何处理
    })
  )
bot.start()
  .catch((e) => console.error(e))

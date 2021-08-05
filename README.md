# wechaty-face-carton

Wechaty 人像漫画化插件，让你的 Wechaty 机器人也可以很高级。之前有看到过一些机器学习视频，可以把照片漫画化，感觉很有意思，就想着能不能结合 Wechaty 做一个可以自动返回动漫化照片的机器人。经过一番资料查找，发现腾讯有个人脸变换的功能，经过测试后，发现就是我想要的功能，那就燥起来，开干。

本项目实现功能：

- 人脸照片动漫化
- 人脸年龄变化
- 人脸性别转换

![](docs/images/weixin.png)

## 准备腾讯云账号

## 实现微信机器人

机器人是基于 [wechaty](https://wechaty.js.org/v/zh/quick-start) 来实现，官方文档已经有了非常的详细的教程，所以这里不做赘述。

## 使用步骤

### 安装插件和 wechaty

```angular2html
npm install wechaty wechaty-fanli wechaty-puppet-padlocal --save
```

### 主要代码

index.js

```javascript
const { Wechaty } = require('wechaty')
const { PuppetPadlocal } = require('wechaty-puppet-padlocal')
const Qrterminal = require('qrcode-terminal')
const WechatyFanliPlugin = require('wechaty-fanli')
const token = '申请的ipadlocal token'
const name = 'wechat-fanli'
const puppet = new PuppetPadlocal({
  token,
})
const bot = new Wechaty({
  name, // generate xxxx.memory-card.json and save login data for the next login
  puppet,
  // puppet: 'wechaty-puppet-puppeteer',
})

async function onLogin(user) {
  console.log(`返利小助手${user}登录了`)
}

async function onLogout(user) {
  console.log(`返利小助手${user}已登出`)
}

/**
 * 扫描登录，显示二维码
 */
async function onScan(qrcode, status) {
  Qrterminal.generate(qrcode)
  console.log('扫描状态', status)
  const qrImgUrl = ['https://api.qrserver.com/v1/create-qr-code/?data=', encodeURIComponent(qrcode)].join('')
  console.log(qrImgUrl)
}

bot.on('scan', onScan)
bot.on('login', onLogin)
bot.on('logout', onLogout)

bot
  .use(
    WechatyFanliPlugin({
      keyword: '?', // 触发关键词 例： ?淘宝粘贴的链接 不填则对所有对话进行返利转化
      apiKey: '', // 淘口令网的apikey
      siteId: '', // 参见https://www.taokouling.com/html/8.html
      adzoneId: '', // 参见https://www.taokouling.com/html/8.html
      uid: '', // 淘口令网-高佣授权信息-淘宝用户id
      appKey: '', // 淘宝联盟 - 媒体备案管理- 媒体中的appkey
      appSecret: 'appSecret', // 淘宝联盟 - 媒体备案管理- 媒体中的appkey - 查看 - appSecret
    })
  )
  .start()
  .catch((e) => console.error(e))
```

### 运行

```angular2html
node index.js
```

扫码登录，即可

## 问题

如有使用问题可以直接加小助手，回复`返利`，进微信群交流

![](https://user-gold-cdn.xitu.io/2019/2/28/1693401c6c3e6b02?w=430&h=430&f=png&s=53609)

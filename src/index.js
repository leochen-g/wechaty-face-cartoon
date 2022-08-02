import { contactSay, roomSay, delay } from './util/index.js'
import { BotManage } from './service/multiReply.js'
import Qrterminal from 'qrcode-terminal'
let config = {}
let BotRes = ''

/**
 * 根据消息类型过滤私聊消息事件
 * @param {*} that bot实例
 * @param {*} msg 消息主体
 */
async function dispatchFriendFilterByMsgType(that, msg) {
  try {
    const type = msg.type()
    const contact = msg.talker() // 发消息人
    const name = await contact.name()
    const isOfficial = contact.type() === that.Contact.Type.Official
    const id = await contact.id
    switch (type) {
      case that.Message.Type.Text:
        const content = msg.text()
        if (!isOfficial) {
          console.log(`发消息人${name}:${content}`)
          if (content.trim()) {
            const multiReply = await BotRes.run(id, { type: 1, content })
            let replys = multiReply.replys
            let replyIndex = multiReply.replys_index
            await delay(1000)
            await contactSay(that, contact, replys[replyIndex])
          }
        }
        break
      case that.Message.Type.Image:
        console.log(`发消息人${name}:发了一张图片`)
        if (!config.allowUser.length || config.allowUser.includes(name)) {
          const file = await msg.toFileBox()
          const base = await file.toDataURL()
          const multiReply = await BotRes.run(id, { type: 3, url: base })
          let replys = multiReply.replys
          let replyIndex = multiReply.replys_index
          await delay(1000)
          await contactSay(that, contact, replys[replyIndex])
        } else {
          console.log(`没有开启 ${name} 的人脸漫画化功能, 或者检查是否已经配置此人微信昵称`)
        }
        break
      default:
        break
    }
  } catch (error) {
    console.log('监听消息错误', error)
  }
}

/**
 * 根据消息类型过滤群消息事件
 * @param {*} that bot实例
 * @param {*} room room对象
 * @param {*} msg 消息主体
 */
async function dispatchRoomFilterByMsgType(that, room, msg) {
  const contact = msg.talker() // 发消息人
  const contactName = contact.name()
  const roomName = await room.topic()
  const type = msg.type()
  const userName = await contact.name()
  const userSelfName = that.currentUser?.name() || that.userSelf()?.name()
  const id = await contact.id
  switch (type) {
    case that.Message.Type.Text:
      let content = msg.text()
      console.log(`群名: ${roomName} 发消息人: ${contactName} 内容: ${content}`)
      if (config.allowRoom.includes(roomName)) {
        const mentionSelf = content.includes(`@${userSelfName}`)
        if (mentionSelf) {
          content = content.replace(/@[^,，：:\s@]+/g, '').trim()
          if (content) {
            const multiReply = await BotRes.run(id, { type: 1, content })
            let replys = multiReply.replys
            let replyIndex = multiReply.replys_index
            await delay(1000)
            await roomSay(that.room, contact, replys[replyIndex])
          }
        }
      }
      break
    case that.Message.Type.Image:
      console.log(`群名: ${roomName} 发消息人: ${contactName} 发了一张图片`)
      if (config.allowRoom.includes(roomName)) {
        console.log(`匹配到群：${roomName}的人脸漫画化功能已开启，正在生成中...`)
        const file = await msg.toFileBox()
        const base = await file.toDataURL()
        const multiReply = await BotRes.run(id, { type: 3, url: base })
        let replys = multiReply.replys
        let replyIndex = multiReply.replys_index
        await delay(1000)
        await roomSay(that, room, contact, replys[replyIndex])
      } else {
        console.log('没有开通此群人脸漫画化功能')
      }
      break
    default:
      break
  }
}

/**
 * 消息事件监听
 * @param {*} msg
 * @returns
 */
async function onMessage(msg) {
  try {
    if (!BotRes) {
      BotRes = new BotManage(config.maxuser, this, config)
    }
    const room = msg.room() // 是否为群消息
    const msgSelf = msg.self() // 是否自己发给自己的消息
    if (msgSelf) return
    if (room) {
      dispatchRoomFilterByMsgType(this, room, msg)
    } else {
      dispatchFriendFilterByMsgType(this, msg)
    }
  } catch (e) {
    console.log('reply error', e)
  }
}

async function onLogin(user) {
  console.log(`漫画人像小助手${user}登录了`)
}

async function onLogout(user) {
  console.log(`漫画人像小助手${user}已登出`)
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

export function WechatyFaceCartonPlugin({ secretId = '', secretKey = '', allowUser = [], allowRoom = [], quickModel = false, maxuser = 20, tipsword = '' }) {
  config = {
    maxuser,
    secretId,
    secretKey,
    allowUser,
    allowRoom,
    tipsword,
  }
  return function (bot) {
    bot.on('message', onMessage)
    // 如果用户开启快速体验模式，帮助用户监听扫码事件，直接把二维码显示在控制台
    if (quickModel) {
      bot.on('scan', onScan)
      bot.on('login', onLogin)
      bot.on('logout', onLogout)
    }
  }
}

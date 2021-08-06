const { generateCarton } = require('./tencent')

class MultiReply {
  constructor() {
    this.userName = ''
    this.startTime = 0 // 开始时间
    this.queryList = [] // 用户说的话
    this.replys = [] // 每次回复，回复用户的内容（列表）
    this.reply_index = 0 // 回复用户的话回复到第几部分
    this.step = 0 // 当前step
    this.stepRecord = [] // 经历过的step
    this.lastReply = {} // 最后回复的内容
    this.imageData = '' // 用户发送的图片
    this.model = 1 // 默认选择漫画模式
    this.age = 60 // 用户选择的年龄
    this.gender = 0 // 用户性别转换的模式
  }
  paramsInit() {
    this.startTime = 0 // 开始时间
    this.queryList = [] // 用户说的话
    this.replys = [] // 每次回复，回复用户的内容（列表）
    this.reply_index = 0 // 回复用户的话回复到第几部分
    this.step = 0 // 当前step
    this.stepRecord = [] // 经历过的step
    this.lastReply = {} // 最后回复的内容
    this.imageData = '' // 用户发送的图片
    this.model = 1 // 默认选择漫画模式
    this.age = 60 // 用户选择的年龄
    this.gender = 0 // 用户性别转换的模式
  }
}

class BotManage {
  constructor(maxuser, that, config) {
    this.Bot = that
    this.config = config
    this.userBotDict = {} // 存放所有对话的用户
    this.userTimeDict = {}
    this.maxuser = maxuser // 最大同时处理的用户数
    this.loopLimit = 4
    this.replyList = [
      { type: 1, content: '请选择你要转换的模式(发送序号)：\n\n[1]、卡通化照片\n\n[2]、变换年龄\n\n[3]、变换性别\n\n' },
      { type: 1, content: '请输入你想要转换的年龄：请输入10~80的任意数字' },
      { type: 1, content: '请输入你想转换的性别(发送序号)：\n\n[0]、男变女\n\n[1]、女变男\n\n' },
      { type: 1, content: '你输入的序号有误，请输入正确的序号' },
      { type: 1, content: '你输入的年龄有误，请输入10~80的任意数字' },
      { type: 1, content: '你选择的序号有误，请输入你想转换的性别(发送序号)：\n\n[0]、男变女\n\n[1]、女变男\n\n' },
    ]
  }
  async creatBot(username, content) {
    console.log('bot process create')
    this.userBotDict[username] = new MultiReply()
    this.userBotDict[username].userName = username
    this.userBotDict[username].imageData = content.url
    return await this.updateBot(username, content)
  }
  // 更新对话
  async updateBot(username, content) {
    console.log(`更新{${username}}对话`)
    this.userTimeDict[username] = new Date().getTime()
    this.userBotDict[username].queryList.push(content)
    return await this.talk(username, content)
  }
  async talk(username, content) {
    // 防止进入死循环
    if (this.userBotDict[username].stepRecord.length >= this.loopLimit) {
      const arr = this.userBotDict[username].stepRecord.slice(-1 * this.loopLimit)
      console.log('ini', arr, this.userBotDict[username].stepRecord)
      console.log(
        'arr.reduce((x, y) => x * y) ',
        arr.reduce((x, y) => x * y)
      )
      console.log(
        'arr.reduce((x, y) => x * y) ',
        arr.reduce((x, y) => x * y)
      )
      const lastIndex = this.userBotDict[username].stepRecord.length - 1
      console.log('limit last', this.userBotDict[username].stepRecord.length, this.loopLimit)
      console.log('limit', this.userBotDict[username].stepRecord[this.userBotDict[username].stepRecord.length - 1] ** this.loopLimit)
      if (arr.reduce((x, y) => x * y) === this.userBotDict[username].stepRecord[this.userBotDict[username].stepRecord.length - 1] ** this.loopLimit) {
        this.userBotDict[username].step = 100
      }
    }
    // 对话结束
    if (this.userBotDict[username].step == 100) {
      this.userBotDict[username].paramsInit()
      this.userBotDict[username] = this.addReply(username, { type: 1, content: '你已经输入太多错误指令了，小图已经不知道怎么回答了，还是重新发送照片吧' })
      return this.userBotDict[username]
    }
    // 图片处理完毕后
    if (this.userBotDict[username].step == 101) {
      this.userBotDict[username].paramsInit()
      this.userBotDict[username] = this.addReply(username, { type: 1, content: '你的图片已经生成了，如果还想体验的话，请重新发送照片' })
      return this.userBotDict[username]
    }
    if (this.userBotDict[username].step == 0) {
      console.log('第一轮对话,让用户选择转换的内容')
      this.userBotDict[username].stepRecord.push(0)
      if (content.type === 3) {
        this.userBotDict[username].step += 1
        this.userBotDict[username] = this.addReply(username, this.replyList[0])
        return this.userBotDict[username]
      } else {
        if (this.config.tipsword && content.content.includes(this.config.tipsword)) {
          // 如果没有发图片，直接发文字，触发关键词
          return {
            replys: [{ type: 1, content: '想要体验人脸卡通化功能，请先发送带人脸的照片给我' }],
            replys_index: 0,
          }
        } else {
          // 如果没有发图片，直接发文字，没有触发关键词
          this.removeBot(username)
          return {
            replys: [{ type: 1, content: '' }],
            replys_index: 0,
          }
        }
      }
    } else if (this.userBotDict[username].step == 1) {
      console.log('第二轮对话，用户选择需要转换的模式')
      this.userBotDict[username].stepRecord.push(1)
      if (content.type === 1) {
        if (parseInt(content.content) === 1) {
          // 用户选择了漫画模式
          this.userBotDict[username].step = 101
          this.userBotDict[username].model = 1
          return await this.generateImage(username)
        } else if (parseInt(content.content) === 2) {
          // 用户选择了变换年龄模式
          this.userBotDict[username].step += 1
          this.userBotDict[username].model = 2
          this.userBotDict[username] = this.addReply(username, this.replyList[1])
          return this.userBotDict[username]
        } else if (parseInt(content.content) === 3) {
          // 用户选择了变换性别模式
          this.userBotDict[username].step += 1
          this.userBotDict[username].model = 3
          this.userBotDict[username] = this.addReply(username, this.replyList[2])
          return this.userBotDict[username]
        } else {
          // 输入模式错误提示
          this.userBotDict[username].step = 1
          this.userBotDict[username] = this.addReply(username, this.replyList[3])
          return this.userBotDict[username]
        }
      }
    } else if (this.userBotDict[username].step == 2) {
      console.log('第三轮对话，用户输入指定模式所需要的配置')
      this.userBotDict[username].stepRecord.push(2)
      if (content.type === 1) {
        if (this.userBotDict[username].model === 2) {
          // 用户选择了年龄变换模式
          if (parseInt(content.content) >= 10 && parseInt(content.content) <= 80) {
            this.userBotDict[username].step = 101
            this.userBotDict[username].age = content.content
            return await this.generateImage(username)
          } else {
            this.userBotDict[username].step = 2
            this.userBotDict[username] = this.addReply(username, this.replyList[4])
            return this.userBotDict[username]
          }
        } else if (this.userBotDict[username].model === 3) {
          // 用户选择了性别变换模式
          if (parseInt(content.content) === 0 || parseInt(content.content) === 1) {
            this.userBotDict[username].step = 101
            this.userBotDict[username].gender = parseInt(content.content)
            return await this.generateImage(username)
          } else {
            this.userBotDict[username].step = 2
            this.userBotDict[username] = this.addReply(username, this.replyList[5])
            return this.userBotDict[username]
          }
        }
      }
    }
  }
  addReply(username, replys) {
    this.userBotDict[username].replys.push(replys)
    this.userBotDict[username].replys_index = this.userBotDict[username].replys.length - 1
    return this.userBotDict[username]
  }
  removeBot(dictKey) {
    console.log('bot process remove', dictKey)
    delete this.userTimeDict[dictKey]
    delete this.userBotDict[dictKey]
  }
  getBotList() {
    return this.userBotDict
  }
  /**
   * 生成图片
   * @param {*} username 用户名
   * @returns
   */
  async generateImage(username) {
    const image = await generateCarton(this.config, this.userBotDict[username].imageData, { model: this.userBotDict[username].model, gender: this.userBotDict[username].gender, age: this.userBotDict[username].age })
    this.userBotDict[username] = this.addReply(username, image)
    return this.userBotDict[username]
  }
  getImage(username, content, step) {
    this.userBotDict[username].paramsInit()
    this.userBotDict[username].step = step
    if (content.type === 3) {
      this.userBotDict[username].imageData = content.url
    }
    let replys = { type: 1, content: '请选择你要转换的模式(发送序号)：\n\n [1]、卡通化照片\n\n[2]、变换年龄\n\n[3]、变换性别\n\n' }
    this.userBotDict[username] = this.addReply(username, replys)
    return this.userBotDict[username]
  }
  // 对话入口
  async run(username, content) {
    if (content.type === 1) {
      if (!Object.keys(this.userTimeDict).includes(username)) {
        if (this.config.tipsword && content.content.includes(this.config.tipsword)) {
          // 如果没有发图片，直接发文字，触发关键词
          return {
            replys: [{ type: 1, content: '想要体验人脸卡通化功能，请先发送带人脸的照片给我' }],
            replys_index: 0,
          }
        } else {
          // 如果没有发图片，直接发文字，没有触发关键词
          return {
            replys: [{ type: 1, content: '' }],
            replys_index: 0,
          }
        }
      } else {
        // 如果对话环境中已存在，则更新对话内容
        console.log(`${username}用户正在对话环境中`)
        return this.updateBot(username, content)
      }
    } else if (content.type === 3) {
      if (Object.keys(this.userTimeDict).includes(username)) {
        console.log(`${username}用户正在对话环境中`)
        return this.getImage(username, content, 1)
      } else {
        if (this.userBotDict.length > this.maxuser) {
          const minNum = Math.min(...Object.values(this.userTimeDict))
          const earlyIndex = arr.indexOf(minNum)
          const earlyKey = Object.keys(this.userTimeDict)[earlyIndex]
          this.removeBot(earlyKey)
        }
        return await this.creatBot(username, content)
      }
    }
  }
}

module.exports = {
  BotManage,
}

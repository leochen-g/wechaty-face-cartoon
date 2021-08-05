const tencentcloud = require('tencentcloud-sdk-nodejs')
const FtClient = tencentcloud.ft.v20200304.Client
let fcClient = ''
/**
 * 实例化
 * @param {*} config 腾讯的基础配置
 */
async function initFcClient(config) {
  //初始化腾讯人脸动漫化实例
  const clientConfig = {
    credential: {
      secretId: config.secretId,
      secretKey: config.secretKey,
    },
    region: 'ap-shanghai',
    profile: {
      httpProfile: {
        endpoint: 'ft.tencentcloudapi.com',
      },
    },
  }
  fcClient = new FtClient(clientConfig)
}

async function generateCarton(config, img, { model = 1, age = 60, gender = 0 }) {
  try {
    const params = {
      Image: img,
      RspImgType: 'base64',
    }
    if (!fcClient) {
      await initFcClient(config)
    }
    let res
    if (model === 1) {
      // 人像卡通画
      res = await fcClient.FaceCartoonPic(params)
    } else if (model === 2) {
      // 人像年龄变化
      console.log('age', age)
      res = await fcClient.ChangeAgePic({
        ...params,
        AgeInfos: [
          {
            Age: parseInt(age),
          },
        ],
      })
    } else if (model === 3) {
      // 人像性别变化
      res = await fcClient.SwapGenderPic({
        ...params,
        GenderInfos: [
          {
            Gender: gender, // 0：男变女，1：女变男。
          },
        ],
      })
    }
    return { type: 3, url: res.ResultImage }
  } catch (e) {
    const errorMap = {
      'FailedOperation.DetectNoFace': '未检测到人脸。',
      'FailedOperation.ImageDecodeFailed': '图片解码失败。',
      'FailedOperation.ImageDownloadError': '图片下载错误。',
      'FailedOperation.ImagePixelExceed': '素材尺寸超过2000*2000像素。',
      'FailedOperation.ImageResolutionTooSmall': '图片短边分辨率太小，小于64。',
      'FailedOperation.InnerError': '服务内部错误，请重试。',
      'FailedOperation.RequestEntityTooLarge': '整个请求体太大（通常主要是图片）。',
      'FailedOperation.RequestTimeout': '后端服务超时。',
      'InvalidParameterValue.FaceRectInvalidFirst': '第1个人脸框参数不合法。',
      'InvalidParameterValue.ImageSizeExceed': '图片数据太大。',
      'InvalidParameterValue.NoFaceInPhoto': '图片中没有人脸。',
      'InvalidParameterValue.ParameterValueError': '参数不合法。',
      'InvalidParameterValue.UrlIllegal': 'URL格式不合法。',
      'ResourceUnavailable.InArrears': '帐号已欠费。',
      'ResourceUnavailable.NotReady': '服务未开通。',
      'FailedOperation.FaceExceedBorder': '	人脸出框，无法使用。',
      'FailedOperation.FaceSizeTooSmall': '	人脸因太小被过滤，建议人脸分辨率不小于34*34。',
      'FailedOperation.FreqCtrl': '	操作太频繁，触发频控，请稍后重试。',
      'InvalidParameterValue.FaceRectInvalidSecond': '	第2个人脸框参数不合法。',
      'InvalidParameterValue.FaceRectInvalidThrid': '	第3个人脸框参数不合法。',
      'ResourceUnavailable.Delivering': '	资源正在发货中。',
      'ResourceUnavailable.Freeze': '	帐号已被冻结。',
      'ResourceUnavailable.GetAuthInfoError': '	获取认证信息失败。',
      'ResourceUnavailable.LowBalance': '	余额不足。',
      'ResourceUnavailable.StopUsing': '	帐号已停服。',
      'ResourceUnavailable.UnknownStatus': '	计费状态未知。',
      'ResourcesSoldOut.ChargeStatusException': '	帐号已欠费。',
    }
    console.log('生成失败', e.code, errorMap[e.code])
    return { type: 1, content: errorMap[e.code] || '网络错误' }
  }
}

module.exports = {
  generateCarton,
}

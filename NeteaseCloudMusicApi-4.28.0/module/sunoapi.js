const axios = require('axios')
const { SunoAPI } = require('../util/config.json')

module.exports = async (query) => {
  // 获取API Key，优先使用query中的apiKey，其次是环境变量，最后是配置文件
  const apiKey = query.apiKey || process.env.SUNO_API_KEY || SunoAPI.apiKey
  
  if (!apiKey) {
    return {
      status: 400,
      body: {
        code: 400,
        msg: '缺少API Key，请通过apiKey参数、SUNO_API_KEY环境变量或配置文件提供',
      },
    }
  }
  
  // 获取操作类型，默认为generate
  const action = query.action || 'generate'
  
  // 构建请求头
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }
  
  try {
    // 根据操作类型处理请求
  switch (action) {
    case 'generate':
      return await generateMusic(query, headers)
    case 'get':
      return await getMusicStatus(query, headers)
    case 'history':
      // 获取所有taskId历史记录
      const fs = require('fs')
      const path = require('path')
      const taskHistoryPath = path.join(__dirname, '../data/task_history.json')
      
      let taskHistory = []
      if (fs.existsSync(taskHistoryPath)) {
        taskHistory = JSON.parse(fs.readFileSync(taskHistoryPath, 'utf-8'))
      }
      
      return {
        status: 200,
        body: {
          code: 200,
          msg: 'success',
          data: taskHistory,
        },
      }
    default:
      return {
        status: 400,
        body: {
          code: 400,
          msg: `不支持的操作类型: ${action}，支持的操作类型: generate, get, history`,
        },
      }
  }
  } catch (error) {
    console.error('[Suno API 错误]', error)
    return {
      status: error.response?.status || 500,
      body: {
        code: error.response?.status || 500,
        msg: error.response?.data?.msg || error.response?.data?.error || '请求失败',
        data: error.response?.data || {},
      },
    }
  }
}

// 生成音乐
async function generateMusic(query, headers) {
  // 构建请求数据
  const data = {
    prompt: query.prompt,
    style: query.style,
    title: query.title,
    customMode: query.customMode === 'true' || query.customMode === true,
    instrumental: query.instrumental === 'true' || query.instrumental === true,
    personaId: query.personaId,
    model: query.model || 'V5', // 
    negativeTags: query.negativeTags,
    vocalGender: query.vocalGender,
    styleWeight: query.styleWeight ? parseFloat(query.styleWeight) : undefined,
    weirdnessConstraint: query.weirdnessConstraint ? parseFloat(query.weirdnessConstraint) : undefined,
    audioWeight: query.audioWeight ? parseFloat(query.audioWeight) : undefined,
    callBackUrl: query.callBackUrl || SunoAPI.callBackUrl,
  }
  
  // 根据customMode和instrumental的组合验证必填参数
  if (data.customMode) {
    if (data.instrumental) {
      // 自定义模式且为纯音乐，需要style、title和callBackUrl
      if (!data.style || !data.title || !data.callBackUrl) {
        return {
          status: 400,
          body: {
            code: 400,
            msg: '自定义模式且为纯音乐时，style、title和callBackUrl为必填参数',
          },
        }
      }
    } else {
      // 自定义模式且带 vocals，需要style、title、prompt和callBackUrl
      if (!data.style || !data.title || !data.prompt || !data.callBackUrl) {
        return {
          status: 400,
          body: {
            code: 400,
            msg: '自定义模式且带 vocals时，style、title、prompt和callBackUrl为必填参数',
          },
        }
      }
    }
  } else {
    // 非自定义模式，需要prompt和callBackUrl
    if (!data.prompt || !data.callBackUrl) {
      return {
        status: 400,
        body: {
          code: 400,
          msg: '非自定义模式时，prompt和callBackUrl为必填参数',
        },
      }
    }
  }
  
  // 过滤掉undefined值
  const filteredData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  )
  
  // 发送请求到Suno API
  const response = await axios.post(
    `${SunoAPI.baseUrl}/api/v1/generate`,
    filteredData,
    { headers }
  )
  
  // 处理API响应
  if (response.data && response.data.code === 200) {
    // 保存taskId到历史记录
    const taskId = response.data.data?.taskId
    if (taskId) {
      try {
        const fs = require('fs')
        const path = require('path')
        const dataDir = path.join(__dirname, '../data')
        const taskHistoryPath = path.join(dataDir, 'task_history.json')
        
        console.log('[DEBUG] 保存taskId到历史记录：', taskId)
        console.log('[DEBUG] 数据目录：', dataDir)
        console.log('[DEBUG] 历史记录文件路径：', taskHistoryPath)
        
        // 确保data目录存在
        if (!fs.existsSync(dataDir)) {
          console.log('[DEBUG] 创建数据目录')
          fs.mkdirSync(dataDir, { recursive: true })
        }
        
        // 读取现有历史记录
        let taskHistory = []
        if (fs.existsSync(taskHistoryPath)) {
          console.log('[DEBUG] 读取现有历史记录')
          taskHistory = JSON.parse(fs.readFileSync(taskHistoryPath, 'utf-8'))
        } else {
          console.log('[DEBUG] 历史记录文件不存在，创建新文件')
        }
        
        // 添加新的taskId记录，状态为PENDING
        const newTask = {
          taskId: taskId,
          status: 'PENDING',
          prompt: query.prompt,
          createTime: new Date().getTime()
        }
        console.log('[DEBUG] 添加新的task记录：', newTask)
        taskHistory.push(newTask)
        
        // 保存到文件
        console.log('[DEBUG] 保存task历史记录到文件')
        fs.writeFileSync(taskHistoryPath, JSON.stringify(taskHistory, null, 2), 'utf-8')
        console.log('[DEBUG] 保存成功，当前历史记录数量：', taskHistory.length)
      } catch (error) {
        console.error('[DEBUG] 保存taskId历史记录失败：', error)
      }
    }
    
    return {
      status: 200,
      body: {
        code: 200,
        msg: 'success',
        data: {
          taskId: taskId || null,
        },
      },
    }
  } else {
    // API返回了错误响应
    return {
      status: response.status || 500,
      body: {
        code: response.data?.code || response.status || 500,
        msg: response.data?.msg || 'API请求失败',
        data: response.data || {},
      },
    }
  }
}

// 获取音乐生成状态
async function getMusicStatus(query, headers) {
  // 验证必填参数
  if (!query.taskId) {
    return {
      status: 400,
      body: {
        code: 400,
        msg: '缺少必填参数: taskId',
      },
    }
  }
  
  // 发送请求到Suno API获取状态
  const response = await axios.get(
    `${SunoAPI.baseUrl}/api/v1/generate/record-info?taskId=${query.taskId}`,
    { headers }
  )
  
  // 处理API响应
  if (response.data && response.data.code === 200) {
    // 更新taskId历史记录的状态
    const taskId = query.taskId
    if (taskId) {
      const fs = require('fs')
      const path = require('path')
      const taskHistoryPath = path.join(__dirname, '../data/task_history.json')
      
      if (fs.existsSync(taskHistoryPath)) {
        let taskHistory = JSON.parse(fs.readFileSync(taskHistoryPath, 'utf-8'))
        
        // 查找并更新taskId的状态
        const taskIndex = taskHistory.findIndex(task => task.taskId === taskId)
        if (taskIndex !== -1) {
          taskHistory[taskIndex].status = response.data.data?.status || 'UNKNOWN'
          taskHistory[taskIndex].lastUpdateTime = new Date().getTime()
          
          // 如果音乐生成成功，保存音乐信息
          if (response.data.data?.status === 'SUCCESS' && response.data.data?.response?.sunoData) {
            taskHistory[taskIndex].music = response.data.data.response.sunoData[0]
          }
          
          // 保存更新后的历史记录
          fs.writeFileSync(taskHistoryPath, JSON.stringify(taskHistory, null, 2), 'utf-8')
        }
      }
    }
    
    return {
      status: 200,
      body: {
        code: 200,
        msg: 'success',
        data: response.data.data || {},
      },
    }
  } else {
    // API返回了错误响应
    return {
      status: response.status || 500,
      body: {
        code: response.data?.code || response.status || 500,
        msg: response.data?.msg || response.data?.error || 'API请求失败',
        data: response.data || {},
      },
    }
  }
}

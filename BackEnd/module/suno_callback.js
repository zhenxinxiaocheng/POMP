// module/suno_callback.js
const fs = require('fs')
const path = require('path')

// 保存音乐信息的文件路径
const musicDataPath = path.join(__dirname, '../data/generated_music.json')
// 保存taskId历史记录的文件路径
const taskHistoryPath = path.join(__dirname, '../data/task_history.json')

module.exports = async (query, getRequest) => {
  try {
    // 检查是否是获取音乐列表的请求
    // 对于GET请求，req.body为空，所以我们可以通过检查是否有cookie以外的属性来判断
    // 或者直接检查是否有action=get参数
    const isGetRequest = (Object.keys(query).length === 1 && query.cookie) || 
                       (query.action && query.action === 'get') ||
                       // 或者检查是否没有task_id，因为回调请求会包含task_id
                       !query.task_id
    
    if (isGetRequest) {
      // 确保 data 目录存在
      const dataDir = path.dirname(musicDataPath)
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
      }
      
      // 检查是否是通过taskId查询历史记录
      if (query.taskId) {
        // 读取task历史记录
        let taskHistory = []
        if (fs.existsSync(taskHistoryPath)) {
          taskHistory = JSON.parse(fs.readFileSync(taskHistoryPath, 'utf-8'))
        }
        
        // 根据taskId查找对应的音乐
        const taskMusic = taskHistory.find(task => task.taskId === query.taskId)
        if (taskMusic) {
          console.log('返回taskId对应的音乐：', query.taskId)
          return {
            status: 200,
            body: {
              code: 200,
              msg: 'success',
              data: [taskMusic.music] // 返回数组格式，保持一致性
            }
          }
        } else {
          // taskId不存在
          return {
            status: 200,
            body: {
              code: 200,
              msg: 'success',
              data: []
            }
          }
        }
      }
      
      // 否则返回所有保存的音乐
      let existingMusic = []
      if (fs.existsSync(musicDataPath)) {
        existingMusic = JSON.parse(fs.readFileSync(musicDataPath, 'utf-8'))
      }
      
      console.log('返回保存的音乐列表，数量：', existingMusic.length)
      
      return {
        status: 200,
        body: {
          code: 200,
          msg: 'success',
          data: existingMusic
        }
      }
    }
    
    // 否则处理回调数据
    // 直接使用query作为回调数据，无需额外解析
    const callbackData = query
    console.log('收到Suno回调，数据：', callbackData)
    
    // 直接从query中获取回调数据，而不是从query.body中获取
    // 因为在server.js中，req.body已经被合并到query对象中
    let musicData
    if (callbackData && callbackData.code === 200 && callbackData.data) {
      musicData = callbackData.data
    } else if (callbackData && callbackData.data && callbackData.data.code === 200) {
      musicData = callbackData
    } else {
      // 尝试从callbackData中提取数据
      musicData = callbackData
    }
    
    console.log('提取的音乐数据：', musicData)
    
    if (musicData && musicData.task_id && musicData.data) {
      const taskId = musicData.task_id
      const generatedMusic = musicData.data
      
      // 确保 data 目录存在
      const dataDir = path.dirname(musicDataPath)
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
      }
      
      // 读取现有数据
      let existingMusic = []
      if (fs.existsSync(musicDataPath)) {
        existingMusic = JSON.parse(fs.readFileSync(musicDataPath, 'utf-8'))
      }
      
      // 添加新生成的音乐（去重处理）
      const updatedMusic = [...existingMusic, ...generatedMusic.filter(newMusic => 
        !existingMusic.some(existing => existing.id === newMusic.id)
      )]
      
      // 保存到文件
      fs.writeFileSync(musicDataPath, JSON.stringify(updatedMusic, null, 2), 'utf-8')
      
      // 保存taskId历史记录
      let taskHistory = []
      if (fs.existsSync(taskHistoryPath)) {
        taskHistory = JSON.parse(fs.readFileSync(taskHistoryPath, 'utf-8'))
      }
      
      // 为每个生成的音乐保存taskId关联
      generatedMusic.forEach(music => {
        // 检查是否已存在该taskId的记录
        const existingTask = taskHistory.find(task => task.taskId === taskId)
        if (!existingTask) {
          // 添加新的taskId记录
          taskHistory.push({
            taskId: taskId,
            music: music,
            createTime: new Date().getTime()
          })
        }
      })
      
      // 保存task历史记录到文件
      fs.writeFileSync(taskHistoryPath, JSON.stringify(taskHistory, null, 2), 'utf-8')
      
      console.log(`任务 ${taskId} 生成完成，音乐数量：${generatedMusic.length}`)
      console.log(`已保存的音乐总数：${updatedMusic.length}`)
      console.log(`已保存的task历史记录数量：${taskHistory.length}`)
    }
    
    return {
      status: 200,
      body: {
        code: 200,
        msg: 'success'
      }
    }
  } catch (error) {
    console.error('处理Suno回调失败：', error)
    return {
      status: 200,
      body: {
        code: 200,
        msg: 'success'
      }
    }
  }
}
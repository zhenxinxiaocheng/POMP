// module/suno_callback.js
const fs = require('fs')
const path = require('path')

// 保存音乐信息的文件路径
const musicDataPath = path.join(__dirname, '../data/generated_music.json')

module.exports = async (req, res) => {
  try {
    const callbackData = req.body
    console.log('收到Suno回调：', callbackData)
    
    if (callbackData.code === 200 && callbackData.data) {
      const taskId = callbackData.data.task_id
      const generatedMusic = callbackData.data.data
      
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
      
      console.log(`任务 ${taskId} 生成完成，音乐数量：${generatedMusic.length}`)
      console.log(`已保存的音乐总数：${updatedMusic.length}`)
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
      status: 500,
      body: {
        code: 500,
        msg: 'internal server error'
      }
    }
  }
}
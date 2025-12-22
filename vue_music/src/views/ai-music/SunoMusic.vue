<template>
  <div class="suno-music-container">
    <h2 class="suno-title">🎵 AI音乐生成</h2>
    
    <!-- 生成音乐表单 -->
    <div class="suno-form" v-if="!taskId">
      <div class="form-group">
        <label for="prompt">音乐描述 <span class="required">*</span></label>
        <textarea
          id="prompt"
          v-model="form.prompt"
          placeholder="请描述你想要生成的音乐，例如：一首轻松愉快的流行歌曲，适合在咖啡馆播放"
          rows="3"
          required
        ></textarea>
      </div>
      
      <!-- <div class="form-group">
        <label for="callBackUrl">回调URL <span class="required">*</span></label>
        <input
          id="callBackUrl"
          v-model="form.callBackUrl"
          placeholder="https://your-server.com/api/suno/callback"
          required
        />
        <small class="help-text">用于接收音乐生成完成的回调通知</small>
      </div> -->
      
      <div class="form-group">
        <label for="model">模型版本</label>
        <select id="model" v-model="form.model">
          <option value="V4">V4 改进的人声质量</option>
          <option value="V4_5">V4_5 更智能的提示词，更快的生成速度</option>
          <option value="V4_5PLUS">V4_5PLUS 音色更丰富，新的创作方式</option>
          <option value="V4_5ALL" selected>V4_5ALL 更好的歌曲结构</option>
          <option value="V5">V5 更卓越的音乐表现力，生成速度更快</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="checkbox-label">
          <input type="checkbox" v-model="form.customMode" />
          <span>使用自定义模式</span>
        </label>
      </div>
      
      <!-- 自定义模式参数 -->
      <div class="custom-mode-section" v-if="form.customMode">
        <h3>自定义参数</h3>
        
        <div class="form-group">
          <label for="style">音乐风格 <span class="required">*</span></label>
          <input
            id="style"
            v-model="form.style"
            placeholder="例如：流行、摇滚、古典、电子"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="title">音乐标题 <span class="required">*</span></label>
          <input
            id="title"
            v-model="form.title"
            placeholder="给你的音乐起个名字"
            required
          />
        </div>
        
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.instrumental" />
            <span>纯音乐（无 vocals）</span>
          </label>
        </div>
        
        <div class="form-group" v-if="!form.instrumental">
          <label for="vocalGender"> vocals性别</label>
          <select id="vocalGender" v-model="form.vocalGender">
            <option value="m">男</option>
            <option value="f">女</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="negativeTags">负面标签</label>
          <input
            id="negativeTags"
            v-model="form.negativeTags"
            placeholder="例如：嘈杂, 刺耳, 悲伤（用逗号分隔）"
          />
        </div>
        
        <div class="form-row">
          <div class="form-group form-half">
            <label for="styleWeight">风格权重 (0-1)</label>
            <input
              id="styleWeight"
              type="number"
              v-model.number="form.styleWeight"
              min="0"
              max="1"
              step="0.01"
            />
          </div>
          
          <div class="form-group form-half">
            <label for="weirdnessConstraint">怪异度 (0-1)</label>
            <input
              id="weirdnessConstraint"
              type="number"
              v-model.number="form.weirdnessConstraint"
              min="0"
              max="1"
              step="0.01"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label for="audioWeight">音频权重 (0-1)</label>
          <input
            id="audioWeight"
            type="number"
            v-model.number="form.audioWeight"
            min="0"
            max="1"
            step="0.01"
          />
        </div>
        
        <div class="form-group">
          <label for="personaId">角色ID</label>
          <input
            id="personaId"
            v-model="form.personaId"
            placeholder="例如：persona_123（可选）"
          />
        </div>
      </div>
      
      <button
        class="generate-btn"
        @click="generateMusic"
        :disabled="loading"
      >
        <span v-if="loading">生成中...</span>
        <span v-else>生成音乐</span>
      </button>
    </div>
    
    <!-- 生成中状态 -->
    <div class="generating-section" v-else-if="!generatedMusic.length">
      <div class="generating-content">
        <div class="loading-spinner"></div>
        <h3>音乐生成中...</h3>
        <p>任务ID：{{ taskId }}</p>
        <p class="generating-tip">音乐生成可能需要几分钟时间，请耐心等待</p>
        <div class="generating-actions">
          <button class="check-btn" @click="checkStatus" :disabled="checking">
            <span v-if="checking">查询中...</span>
            <span v-else>手动查询状态</span>
          </button>
          <button class="cancel-btn" @click="resetForm">取消</button>
        </div>
      </div>
    </div>
    
    <!-- 生成结果 -->
    <div class="result-section" v-else>
      <h3 class="result-title">🎉 音乐生成完成！</h3>
      <p class="task-info">任务ID：{{ taskId }}</p>
      
      <div class="music-list">
        <div
          class="music-item"
          v-for="music in generatedMusic"
          :key="music.id"
        >
          <div class="music-header">
            <h4 class="music-title">{{ music.title || '未命名音乐' }}</h4>
            <span class="music-model">{{ music.model_name }}</span>
          </div>
          
          <div class="music-cover">
            <img
              :src="music.image_url || 'https://via.placeholder.com/300x300?text=No+Cover'"
              :alt="music.title || '音乐封面'"
              onerror="this.src='https://via.placeholder.com/300x300?text=No+Cover'"
            />
          </div>
          
          <div class="music-audio">
            <audio
              :src="music.audio_url"
              controls
              :title="music.title || '生成的音乐'"
            >
              您的浏览器不支持音频播放
            </audio>
          </div>
          
          <div class="music-info">
            <p class="music-prompt"><strong>描述：</strong>{{ music.prompt }}</p>
            <p class="music-tags" v-if="music.tags"><strong>标签：</strong>{{ music.tags }}</p>
            <p class="music-duration"><strong>时长：</strong>{{ formatDuration(music.duration) }}</p>
            <p class="music-time"><strong>生成时间：</strong>{{ new Date(music.createTime).toLocaleString() }}</p>
          </div>
          
          <div class="music-actions">
            <a
              :href="music.audio_url"
              target="_blank"
              rel="noopener noreferrer"
              class="action-btn download-btn"
              download
            >
              💾 下载
            </a>
            <a
              :href="music.audio_url"
              target="_blank"
              rel="noopener noreferrer"
              class="action-btn source-btn"
            >
              📥 原始文件
            </a>
          </div>
        </div>
      </div>
      
      <div class="result-actions">
        <button class="generate-again-btn" @click="resetForm">
          生成另一首音乐
        </button>
      </div>
    </div>
    
    <!-- 历史记录查询 -->
    <div class="history-section">
      <h3 class="history-title">📜 历史记录</h3>
      
      <div class="history-form">
        <div class="history-search">
          <input
            type="text"
            v-model="historyQuery.taskId"
            placeholder="输入任务ID查询特定记录"
            class="history-input"
          />
          <div class="history-buttons">
            <button class="query-btn" @click="queryHistory" :disabled="querying">
              <span v-if="querying">查询中...</span>
              <span v-else>查询记录</span>
            </button>
            <button class="query-all-btn" @click="queryAllHistory" :disabled="querying">
              <span v-if="querying">查询中...</span>
              <span v-else>查询全部</span>
            </button>
            <button class="reset-btn" @click="resetHistory">重置</button>
          </div>
        </div>
      </div>
      
      <!-- 历史记录列表 -->
      <div class="history-list" v-if="historyRecords.length > 0">
        <div
          class="history-item"
          v-for="record in historyRecords"
          :key="record.taskId"
          @click="showHistoryMusic(record.taskId)"
        >
          <div class="history-item-header">
            <div class="history-task-id">
              <strong>任务ID：</strong>{{ record.taskId }}
            </div>
            <div class="history-status" :class="`status-${record.status.toLowerCase()}`">
              {{ record.status }}
            </div>
          </div>
          <div class="history-item-body">
            <div class="history-time">{{ new Date(record.createTime).toLocaleString() }}</div>
            <div class="history-prompt">{{ record.prompt }}</div>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div class="history-empty" v-else-if="!querying">
        <p>{{ historyQuery.taskId ? '未找到该任务ID的记录' : '暂无历史记录' }}</p>
      </div>
      
      <!-- 历史记录详情 -->
      <div class="history-detail" v-if="showingHistoryMusic && historyDetail.length > 0">
        <h4 class="detail-title">历史记录详情</h4>
        <div class="music-list">
          <div
            class="music-item"
            v-for="music in historyDetail"
            :key="music.id"
          >
            <div class="music-header">
              <h4 class="music-title">{{ music.title || '未命名音乐' }}</h4>
              <span class="music-model">{{ music.model_name }}</span>
            </div>
            
            <div class="music-cover">
              <img
                :src="music.image_url || 'https://via.placeholder.com/300x300?text=No+Cover'"
                :alt="music.title || '音乐封面'"
                onerror="this.src='https://via.placeholder.com/300x300?text=No+Cover'"
              />
            </div>
            
            <div class="music-audio">
              <audio
                :src="music.audio_url"
                controls
                :title="music.title || '生成的音乐'"
              >
                您的浏览器不支持音频播放
              </audio>
            </div>
            
            <div class="music-info">
              <p class="music-prompt"><strong>描述：</strong>{{ music.prompt }}</p>
              <p class="music-tags" v-if="music.tags"><strong>标签：</strong>{{ music.tags }}</p>
              <p class="music-duration"><strong>时长：</strong>{{ formatDuration(music.duration) }}</p>
              <p class="music-time"><strong>生成时间：</strong>{{ new Date(music.createTime).toLocaleString() }}</p>
            </div>
            
            <div class="music-actions">
              <a
                :href="music.audio_url"
                target="_blank"
                rel="noopener noreferrer"
                class="action-btn download-btn"
                download
              >
                💾 下载
              </a>
              <a
                :href="music.audio_url"
                target="_blank"
                rel="noopener noreferrer"
                class="action-btn source-btn"
              >
                📥 原始文件
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 错误提示 -->
    <div class="error-message" v-if="error">
      <p>{{ error }}</p>
      <button class="close-error" @click="error = ''">×</button>
    </div>
  </div>
</template>

<script>
// 导入项目中已有的request工具
import { request } from '@/network/request'

export default {
  name: 'SunoMusic',
  data() {
    return {
      form: {
        prompt: '',
        callBackUrl: 'https://47.120.34.167:3000/suno_callback',
        customMode: false,
        instrumental: false,
        style: '',
        title: '',
        model: 'V5',
        negativeTags: '',
        vocalGender: 'm',
        styleWeight: 0.65,
        weirdnessConstraint: 0.65,
        audioWeight: 0.65,
        personaId: ''
      },
      loading: false,
      checking: false,
      querying: false,
      error: '',
      taskId: '',
      generatedMusic: [],
      pollingInterval: null,
      // 历史记录相关
      historyQuery: {
        taskId: ''
      },
      historyRecords: [],
      historyDetail: [],
      showingHistoryMusic: false
    }
  },
  created() {
    // 从localStorage恢复状态
    this.restoreStateFromStorage()
  },
  updated() {
    // 数据更新时保存状态到localStorage
    this.saveStateToStorage()
  },
  watch: {
    taskId(newVal) {
      // 当任务ID生成后，开始轮询查询状态
      if (newVal) {
        this.startPolling()
      } else {
        this.stopPolling()
      }
    }
  },
  beforeDestroy() {
    // 组件销毁时停止轮询
    this.stopPolling()
    // 确保最后一次状态保存
    this.saveStateToStorage()
  },
  methods: {
    // 保存状态到localStorage
    saveStateToStorage() {
      try {
        const state = {
          form: this.form,
          taskId: this.taskId,
          generatedMusic: this.generatedMusic
        }
        localStorage.setItem('sunoMusicState', JSON.stringify(state))
      } catch (err) {
        console.error('保存状态失败：', err)
      }
    },
    
    // 从localStorage恢复状态
    restoreStateFromStorage() {
      try {
        const savedState = localStorage.getItem('sunoMusicState')
        if (savedState) {
          const state = JSON.parse(savedState)
          // 恢复表单数据
          if (state.form) {
            this.form = { ...state.form }
          }
          // 恢复任务ID
          if (state.taskId) {
            this.taskId = state.taskId
          }
          // 恢复生成的音乐列表
          if (Array.isArray(state.generatedMusic)) {
            this.generatedMusic = [...state.generatedMusic]
          }
        }
      } catch (err) {
        console.error('恢复状态失败：', err)
      }
    },
    
    async generateMusic() {
      try {
        this.loading = true
        this.error = ''
        
        // 表单验证
        if (!this.form.prompt) {
          this.error = '请填写必填字段'
          this.loading = false
          return
        }
        
        if (this.form.customMode) {
          if (!this.form.style || !this.form.title) {
            this.error = '自定义模式时，音乐风格和标题为必填字段'
            this.loading = false
            return
          }
        }
        
        // 使用项目中已有的request工具发送请求
        const response = await request({
          url: '/sunoapi',
          method: 'post',
          data: this.form
        })
        
        if (response.data.code === 200) {
          this.taskId = response.data.data?.taskId
          // 使用alert代替$message，避免依赖Element UI
          alert('音乐生成请求已提交，任务ID：' + this.taskId)
        } else {
          this.error = response.data.msg || '音乐生成请求失败'
        }
      } catch (err) {
        console.error('生成音乐失败：', err)
        this.error = '网络错误，请稍后重试'
      } finally {
        this.loading = false
      }
    },
    
    async checkStatus() {
      if (!this.taskId || this.checking) return
      
      try {
        this.checking = true
        
        // 使用项目中已有的request工具发送请求
        const response = await request({
          url: '/sunoapi',
          method: 'get',
          params: {
            action: 'get',
            taskId: this.taskId
          }
        })
        
        if (response.data.code === 200 && response.data.data) {
          const apiData = response.data.data
          
          // 检查音乐生成状态
          if (apiData.status && apiData.status === 'SUCCESS') {
            // 音乐生成成功，提取音乐信息
            if (apiData.response && apiData.response.sunoData && Array.isArray(apiData.response.sunoData)) {
              // 处理音乐数据，转换为前端需要的格式
              this.generatedMusic = apiData.response.sunoData.map(music => ({
                id: music.id || music.audioId,
                audio_url: music.audioUrl || music.audio_url || '',
                image_url: music.imageUrl || music.image_url || '',
                title: music.title || '未命名音乐',
                model_name: music.modelName || music.model_name || '',
                duration: music.duration || 0,
                prompt: music.prompt || '',
                tags: music.tags || '',
                createTime: new Date().getTime()
              })).filter(music => music.audio_url) // 只保留有音频URL的音乐
              
              if (this.generatedMusic.length > 0) {
                this.stopPolling()
                alert('音乐生成完成！')
              } else {
                // 状态显示成功，但没有音频URL，继续轮询
                console.log('音乐状态显示成功，但没有音频URL，继续轮询')
              }
            } else {
              // 没有找到sunoData，继续轮询
              console.log('没有找到生成的音乐数据，继续轮询')
            }
          } else if (apiData.status === 'FAILED' || apiData.status === 'GENERATE_AUDIO_FAILED') {
            // 音乐生成失败
            this.stopPolling()
            this.error = '音乐生成失败，请重试'
            alert('音乐生成失败，请重试')
          } else {
            // 任务还在处理中，继续轮询
            console.log('音乐正在生成中，当前状态：', apiData.status)
          }
        } else {
          // 任务还在处理中，继续轮询
          console.log('任务还在处理中，继续轮询')
        }
      } catch (err) {
        console.error('查询状态失败：', err)
        this.error = '查询状态失败，请稍后重试'
      } finally {
        this.checking = false
      }
    },
    
    startPolling() {
      // 每隔5秒查询一次状态
      this.pollingInterval = setInterval(() => {
        this.checkStatus()
      }, 5000)
    },
    
    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval)
        this.pollingInterval = null
      }
    },
    
    resetForm() {
      this.form = {
        prompt: '',
        callBackUrl: '',
        customMode: false,
        instrumental: false,
        style: '',
        title: '',
        model: 'V5',
        negativeTags: '',
        vocalGender: 'm',
        styleWeight: 0.65,
        weirdnessConstraint: 0.65,
        audioWeight: 0.65,
        personaId: ''
      }
      this.taskId = ''
      this.generatedMusic = []
      this.error = ''
      this.loading = false
      this.checking = false
    },
    
    formatDuration(seconds) {
      if (!seconds) return '0:00'
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs.toString().padStart(2, '0')}`
    },
    
    // 历史记录查询方法
    async queryHistory() {
      if (!this.historyQuery.taskId) {
        this.error = '请输入任务ID'
        return
      }
      
      try {
        this.querying = true
        this.error = ''
        
        const response = await request({
          url: '/sunoapi',
          method: 'get',
          params: {
            action: 'history'
          }
        })
        
        if (response.data.code === 200 && response.data.data) {
          // 过滤出匹配的taskId记录
          this.historyRecords = response.data.data.filter(record => 
            record.taskId === this.historyQuery.taskId
          )
        } else {
          this.error = response.data.msg || '查询历史记录失败'
        }
      } catch (err) {
        console.error('查询历史记录失败：', err)
        this.error = '网络错误，请稍后重试'
      } finally {
        this.querying = false
      }
    },
    
    async queryAllHistory() {
      try {
        this.querying = true
        this.error = ''
        
        const response = await request({
          url: '/sunoapi',
          method: 'get',
          params: {
            action: 'history'
          }
        })
        
        if (response.data.code === 200 && response.data.data) {
          this.historyRecords = response.data.data
        } else {
          this.error = response.data.msg || '查询全部历史记录失败'
        }
      } catch (err) {
        console.error('查询全部历史记录失败：', err)
        this.error = '网络错误，请稍后重试'
      } finally {
        this.querying = false
      }
    },
    
    async showHistoryMusic(taskId) {
      try {
        this.querying = true
        this.error = ''
        this.showingHistoryMusic = false
        
        const response = await request({
          url: '/sunoapi',
          method: 'get',
          params: {
            action: 'get',
            taskId: taskId
          }
        })
        
        if (response.data.code === 200 && response.data.data) {
          const apiData = response.data.data
          
          // 检查音乐生成状态
          if (apiData.status && apiData.status === 'SUCCESS') {
            // 音乐生成成功，提取音乐信息
            if (apiData.response && apiData.response.sunoData && Array.isArray(apiData.response.sunoData)) {
              // 处理音乐数据，转换为前端需要的格式
              this.historyDetail = apiData.response.sunoData.map(music => ({
                id: music.id || music.audioId,
                audio_url: music.audioUrl || music.audio_url || '',
                image_url: music.imageUrl || music.image_url || '',
                title: music.title || '未命名音乐',
                model_name: music.modelName || music.model_name || '',
                duration: music.duration || 0,
                prompt: music.prompt || '',
                tags: music.tags || '',
                createTime: music.createTime || new Date().getTime()
              })).filter(music => music.audio_url) // 只保留有音频URL的音乐
              
              this.showingHistoryMusic = true
            }
          } else {
            this.error = '该记录的音乐生成未成功或正在生成中'
          }
        } else {
          this.error = response.data.msg || '查询历史音乐详情失败'
        }
      } catch (err) {
        console.error('查询历史音乐详情失败：', err)
        this.error = '网络错误，请稍后重试'
      } finally {
        this.querying = false
      }
    },
    
    resetHistory() {
      this.historyQuery.taskId = ''
      this.historyRecords = []
      this.historyDetail = []
      this.showingHistoryMusic = false
    }
  }
}
</script>

<style scoped>
.suno-music-container {
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.suno-title {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 28px;
  font-weight: 700;
}

.suno-form {
  width: 100%;
  max-width: 900px;
  background-color: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 15px;
}

.form-half {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
  font-size: 14px;
}

.required {
  color: #ff4d4f;
}

input,
textarea,
select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s;
  box-sizing: border-box;
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

textarea {
  resize: vertical;
  min-height: 80px;
}

.help-text {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: #999;
}

.custom-mode-section {
  margin-top: 25px;
  padding-top: 25px;
  border-top: 1px solid #e8e8e8;
}

.custom-mode-section h3 {
  margin-bottom: 20px;
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: normal;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  margin-right: 8px;
}

.generate-btn {
  width: 100%;
  padding: 12px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 20px;
}

.generate-btn:hover {
  background-color: #40a9ff;
}

.generate-btn:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
}

.generating-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.generating-content {
  text-align: center;
  background-color: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto 20px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.generating-content h3 {
  color: #333;
  margin-bottom: 15px;
  font-size: 20px;
}

.generating-content p {
  color: #666;
  margin-bottom: 25px;
}

.generating-tip {
  font-size: 14px;
  color: #999;
}

.generating-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.check-btn,
.cancel-btn {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.check-btn {
  background-color: #1890ff;
  color: white;
  border-color: #1890ff;
}

.check-btn:hover {
  background-color: #40a9ff;
}

.check-btn:disabled {
  background-color: #d9d9d9;
  border-color: #d9d9d9;
  cursor: not-allowed;
}

.cancel-btn {
  background-color: white;
  color: #666;
}

.cancel-btn:hover {
  color: #1890ff;
  border-color: #1890ff;
}

.result-section {
  width: 100%;
  max-width: 100%;
  background-color: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  align-self: stretch;
}

.result-title {
  color: #52c41a;
  margin-bottom: 15px;
  font-size: 22px;
}

.task-info {
  color: #666;
  margin-bottom: 25px;
  font-size: 14px;
}

.music-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 0px;
  margin: 0px auto 23px;
  justify-items: center;
  max-width: 100%;
  padding: 0 10px;
}

.music-item {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  transition: all 0.3s;
  max-width: 350px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.music-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.music-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  width: 100%;
  max-width: 100%;
}

.music-title {
  margin: 0;
  font-size: 16px;
  color: #333;
  font-weight: 600;
}

.music-model {
  font-size: 12px;
  color: #1890ff;
  background-color: rgba(24, 144, 255, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
}

.music-cover {
  margin-bottom: 15px;
  text-align: center;
}

.music-cover img {
  width: 100%;
  max-width: 250px;
  height: auto;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.music-audio {
  margin-bottom: 15px;
  width: 100%;
}

.music-audio audio {
  width: 100%;
  height: 40px;
}

.music-info {
  margin-bottom: 15px;
  font-size: 14px;
}

.music-info p {
  margin: 8px 0;
  color: #666;
}

.music-info strong {
  color: #333;
  font-weight: 600;
}

.music-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.download-btn {
  background-color: #52c41a;
  color: white;
  border-color: #52c41a;
}

.download-btn:hover {
  background-color: #73d13d;
}

.source-btn {
  background-color: white;
  color: #666;
}

.source-btn:hover {
  color: #1890ff;
  border-color: #1890ff;
}

.result-actions {
  text-align: center;
  margin-top: 30px;
}

.generate-again-btn {
  padding: 10px 24px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.generate-again-btn:hover {
  background-color: #40a9ff;
}

.error-message {
  background-color: #fff1f0;
  border: 1px solid #ffccc7;
  border-radius: 6px;
  padding: 12px 16px;
  margin-top: 20px;
  color: #ff4d4f;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.close-error {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #ff4d4f;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.close-error:hover {
  color: #ff7875;
}

/* 历史记录样式 */
.history-section {
  width: 100%;
  max-width: 1200px;
  background-color: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-top: 30px;
}

.history-title {
  color: #1890ff;
  margin-bottom: 20px;
  font-size: 20px;
}

.history-form {
  margin-bottom: 25px;
}

.history-search {
  display: flex;
  gap: 15px;
  align-items: center;
}

.history-input {
  flex: 1;
  max-width: 400px;
}

.history-buttons {
  display: flex;
  gap: 10px;
}

.query-btn,
.query-all-btn,
.reset-btn {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.query-btn {
  background-color: #1890ff;
  color: white;
  border-color: #1890ff;
}

.query-btn:hover {
  background-color: #40a9ff;
}

.query-all-btn {
  background-color: #52c41a;
  color: white;
  border-color: #52c41a;
}

.query-all-btn:hover {
  background-color: #73d13d;
}

.reset-btn {
  background-color: white;
  color: #666;
}

.reset-btn:hover {
  color: #1890ff;
  border-color: #1890ff;
}

.history-list {
  margin-top: 25px;
  max-height: 400px;
  overflow-y: auto;
}

.history-item {
  background-color: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.history-item:hover {
  background-color: #f0f5ff;
  border-color: #1890ff;
}

.history-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.history-task-id {
  font-size: 14px;
  color: #333;
}

.history-status {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
}

.status-success {
  background-color: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.status-failed {
  background-color: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
}

.status-pending {
  background-color: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}

.status-first_success {
  background-color: rgba(250, 204, 21, 0.1);
  color: #faad14;
}

.history-item-body {
  font-size: 12px;
  color: #666;
}

.history-time {
  margin-bottom: 5px;
}

.history-prompt {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-empty {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 14px;
}

.history-detail {
  margin-top: 25px;
  padding-top: 25px;
  border-top: 1px solid #e8e8e8;
}

.detail-title {
  color: #333;
  margin-bottom: 20px;
  font-size: 18px;
}
</style>

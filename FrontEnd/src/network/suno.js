import { request } from './request'

/**
 * 生成音乐
 * @param {Object} params 生成音乐的参数
 * @param {string} params.prompt 音乐描述
 * @param {string} params.callBackUrl 回调URL
 * @param {boolean} [params.customMode=false] 是否使用自定义模式
 * @param {boolean} [params.instrumental=false] 是否为纯音乐
 * @param {string} [params.style] 音乐风格（自定义模式时必填）
 * @param {string} [params.title] 音乐标题（自定义模式时必填）
 * @param {string} [params.model=V4_5ALL] 模型版本
 * @param {string} [params.negativeTags] 负面标签
 * @param {string} [params.vocalGender]  vocals性别（m/f）
 * @param {number} [params.styleWeight] 风格权重（0-1）
 * @param {number} [params.weirdnessConstraint] 怪异度约束（0-1）
 * @param {number} [params.audioWeight] 音频权重（0-1）
 * @param {string} [params.personaId] 角色ID
 * @returns {Promise<Object>} 包含taskId的响应
 */
export function generateMusic(params) {
  return request({
    url: '/sunoapi',
    method: 'post',
    data: params
  })
}
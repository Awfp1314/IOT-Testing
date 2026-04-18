// API客户端 - GitHub Pages版本（无登录系统）

import { QUESTION_BANK } from './questionBank.js';
import {
  saveUserProgress as saveProgressLocal,
  getUserProgress as getProgressLocal,
  getAllUserProgress as getAllProgressLocal,
  getAnonymousUserId,
  getLearningStats,
  exportProgress as exportProgressLocal,
  importProgress as importProgressLocal,
  clearUserProgress as clearProgressLocal
} from './localStorageUtils.js';

// ==================== 模拟API配置 ====================
const SIMULATE_DELAY = 100; // 模拟网络延迟（毫秒）

// 模拟网络请求延迟
const simulateRequest = async (data) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(data), SIMULATE_DELAY);
  });
};

// 模拟API响应
const createSuccessResponse = (data = null) => ({
  success: true,
  ...(data && typeof data === 'object' ? data : { data })
});

const createErrorResponse = (message = '请求失败') => ({
  success: false,
  message
});

// ==================== WebSocket模拟（空实现） ====================

// WebSocket连接（空实现，GitHub Pages不支持WebSocket）
export function connectWebSocket(onConnected) {
  console.log('⚠️ GitHub Pages版本：WebSocket功能已禁用');
  if (onConnected) {
    // 模拟连接成功
    setTimeout(() => onConnected(), 300);
  }
}

export function sendWebSocketMessage(type, data) {
  console.log(`⚠️ GitHub Pages版本：WebSocket消息已忽略 [${type}]`, data);
}

export function subscribeWebSocket(type, callback) {
  console.log(`⚠️ GitHub Pages版本：WebSocket订阅已忽略 [${type}]`);
  // 返回一个空取消函数
  return () => {};
}

// ==================== 进度管理API ====================

export async function saveUserProgress(userId, answeredIds, wrongIds) {
  await simulateRequest();
  
  // 忽略userId参数，使用匿名用户
  const result = saveProgressLocal(answeredIds, wrongIds);
  return result.success 
    ? createSuccessResponse({ message: '进度已保存到本地存储' })
    : createErrorResponse(result.message);
}

export async function getUserProgress(userId) {
  await simulateRequest();
  
  // 忽略userId参数，总是返回当前匿名用户的进度
  const result = getProgressLocal(null);
  return result.success
    ? createSuccessResponse({ progress: result.progress })
    : createErrorResponse(result.message);
}

export async function getAllUserProgress() {
  await simulateRequest();
  
  const result = getAllProgressLocal();
  return result.success
    ? createSuccessResponse({ progresses: result.progresses })
    : createErrorResponse(result.message);
}

// ==================== 题库管理API ====================

// 获取所有题目（从本地题库）
export async function getAllQuestions() {
  await simulateRequest();
  return createSuccessResponse({ questions: QUESTION_BANK });
}

// 根据ID获取题目
export async function getQuestionById(questionId) {
  await simulateRequest();
  
  const question = QUESTION_BANK.find(q => q.id === questionId);
  if (!question) {
    return createErrorResponse('题目不存在');
  }
  
  return createSuccessResponse({ question });
}

// 添加题目（本地模式：添加到内存，刷新会丢失）
let localQuestions = [...QUESTION_BANK];
export async function addQuestion(question) {
  await simulateRequest();
  
  // 生成新ID
  const newId = Math.max(...localQuestions.map(q => q.id), 0) + 1;
  const newQuestion = {
    ...question,
    id: newId
  };
  
  localQuestions.push(newQuestion);
  console.log('题目已添加（本地模式）:', newQuestion);
  
  return createSuccessResponse({ 
    question: newQuestion,
    message: '题目已添加（本地模式，刷新页面会丢失）'
  });
}

// 更新题目
export async function updateQuestion(questionId, updates) {
  await simulateRequest();
  
  const index = localQuestions.findIndex(q => q.id === questionId);
  if (index === -1) {
    return createErrorResponse('题目不存在');
  }
  
  localQuestions[index] = { ...localQuestions[index], ...updates };
  console.log('题目已更新（本地模式）:', questionId);
  
  return createSuccessResponse({ 
    question: localQuestions[index],
    message: '题目已更新（本地模式，刷新页面会丢失）'
  });
}

// 删除题目
export async function deleteQuestion(questionId) {
  await simulateRequest();
  
  const index = localQuestions.findIndex(q => q.id === questionId);
  if (index === -1) {
    return createErrorResponse('题目不存在');
  }
  
  localQuestions.splice(index, 1);
  console.log('题目已删除（本地模式）:', questionId);
  
  return createSuccessResponse({ 
    message: '题目已删除（本地模式，刷新页面会丢失）'
  });
}

// 导入题库
export async function importQuestions(questions) {
  await simulateRequest();
  
  // 合并题目，避免重复ID
  const existingIds = new Set(localQuestions.map(q => q.id));
  const newQuestions = questions.filter(q => !existingIds.has(q.id));
  
  localQuestions = [...localQuestions, ...newQuestions];
  console.log(`导入了 ${newQuestions.length} 道题目（本地模式）`);
  
  return createSuccessResponse({
    importedCount: newQuestions.length,
    message: `成功导入 ${newQuestions.length} 道题目（本地模式，刷新页面会丢失）`
  });
}

// ==================== 反馈系统API（模拟） ====================

let localFeedbacks = [];

export async function submitFeedback(feedback) {
  await simulateRequest();
  
  const newFeedback = {
    ...feedback,
    id: `feedback_${Date.now()}`,
    createdAt: new Date().toISOString(),
    read: false
  };
  
  localFeedbacks.push(newFeedback);
  console.log('反馈已提交（本地模式）:', newFeedback);
  
  return createSuccessResponse({
    feedback: newFeedback,
    message: '反馈已提交（本地模式）'
  });
}

export async function getAllFeedbacks() {
  await simulateRequest();
  return createSuccessResponse({ feedbacks: localFeedbacks });
}

export async function markFeedbackAsRead(id) {
  await simulateRequest();
  
  const feedback = localFeedbacks.find(f => f.id === id);
  if (feedback) {
    feedback.read = true;
  }
  
  return createSuccessResponse({ message: '反馈已标记为已读（本地模式）' });
}

export async function deleteFeedback(id) {
  await simulateRequest();
  
  localFeedbacks = localFeedbacks.filter(f => f.id !== id);
  return createSuccessResponse({ message: '反馈已删除（本地模式）' });
}

// ==================== 纠错报告API（模拟） ====================

let localErrorReports = [];

export async function submitErrorReport(report) {
  await simulateRequest();
  
  const newReport = {
    ...report,
    id: `error_${Date.now()}`,
    createdAt: new Date().toISOString(),
    read: false
  };
  
  localErrorReports.push(newReport);
  console.log('纠错报告已提交（本地模式）:', newReport);
  
  return createSuccessResponse({
    report: newReport,
    message: '纠错报告已提交（本地模式）'
  });
}

export async function getAllErrorReports() {
  await simulateRequest();
  return createSuccessResponse({ reports: localErrorReports });
}

export async function markErrorReportAsRead(id) {
  await simulateRequest();
  
  const report = localErrorReports.find(r => r.id === id);
  if (report) {
    report.read = true;
  }
  
  return createSuccessResponse({ message: '纠错报告已标记为已读（本地模式）' });
}

export async function deleteErrorReport(id) {
  await simulateRequest();
  
  localErrorReports = localErrorReports.filter(r => r.id !== id);
  return createSuccessResponse({ message: '纠错报告已删除（本地模式）' });
}

// ==================== 通知系统API（模拟） ====================

let localNotifications = [];

export async function sendNotification(notification) {
  await simulateRequest();
  
  const newNotification = {
    ...notification,
    id: `notify_${Date.now()}`,
    createdAt: new Date().toISOString(),
    read: false
  };
  
  localNotifications.push(newNotification);
  console.log('通知已发送（本地模式）:', newNotification);
  
  return createSuccessResponse({
    notification: newNotification,
    message: '通知已发送（本地模式）'
  });
}

export async function getAllNotifications() {
  await simulateRequest();
  return createSuccessResponse({ notifications: localNotifications });
}

export async function markNotificationAsRead(id) {
  await simulateRequest();
  
  const notification = localNotifications.find(n => n.id === id);
  if (notification) {
    notification.read = true;
  }
  
  return createSuccessResponse({ message: '通知已标记为已读（本地模式）' });
}

export async function deleteNotification(id) {
  await simulateRequest();
  
  localNotifications = localNotifications.filter(n => n.id !== id);
  return createSuccessResponse({ message: '通知已删除（本地模式）' });
}

// ==================== 公告系统API（模拟） ====================

const DEFAULT_ANNOUNCEMENT = {
  id: 'default',
  title: '欢迎使用物联网刷题系统',
  content: '这是一个本地版本的刷题系统，您的进度会保存在浏览器本地存储中。',
  updatedAt: new Date().toISOString(),
  active: true
};

export async function getAnnouncement() {
  await simulateRequest();
  
  const announcementJson = localStorage.getItem('iot_announcement');
  let announcement = DEFAULT_ANNOUNCEMENT;
  
  if (announcementJson) {
    try {
      announcement = JSON.parse(announcementJson);
    } catch (e) {
      console.error('解析公告数据失败:', e);
    }
  }
  
  return createSuccessResponse({ announcement });
}

export async function updateAnnouncement(announcement) {
  await simulateRequest();
  
  const updatedAnnouncement = {
    ...announcement,
    id: 'current',
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem('iot_announcement', JSON.stringify(updatedAnnouncement));
  
  return createSuccessResponse({
    announcement: updatedAnnouncement,
    message: '公告已更新（本地模式）'
  });
}

// ==================== 工具函数 ====================

export async function checkHealth() {
  await simulateRequest();
  return createSuccessResponse({
    status: 'healthy',
    mode: 'github-pages-no-login',
    timestamp: new Date().toISOString(),
    message: 'GitHub Pages版本（无登录系统）运行正常'
  });
}

// 导出进度
export async function exportProgress() {
  const dataUri = exportProgressLocal();
  if (!dataUri) {
    return createErrorResponse('没有可导出的进度数据');
  }
  
  return createSuccessResponse({ dataUri });
}

// 导入进度
export async function importProgress(jsonData) {
  const result = importProgressLocal(jsonData);
  return result.success
    ? createSuccessResponse({ message: '进度导入成功' })
    : createErrorResponse(result.message);
}

// 清除进度
export async function clearProgress() {
  const result = clearProgressLocal();
  return result.success
    ? createSuccessResponse({ message: '进度已清除' })
    : createErrorResponse(result.message);
}

// 获取学习统计
export async function getLearningStatistics() {
  const stats = getLearningStats();
  return createSuccessResponse({ stats });
}

// 获取当前用户ID（匿名模式）
export function getCurrentUserIdentifier() {
  return getAnonymousUserId();
}

// ==================== 兼容性函数（空实现） ====================

// 用户登录（空实现，无登录系统）
export async function loginUser(phone, password) {
  await simulateRequest();
  return createErrorResponse('登录系统已禁用，请使用匿名模式');
}

// 用户注册（空实现，无登录系统）
export async function registerUser(phone, password, username, avatar) {
  await simulateRequest();
  return createErrorResponse('注册系统已禁用，请使用匿名模式');
}

// 获取所有用户（空实现，无登录系统）
export async function getAllUsers() {
  await simulateRequest();
  return createSuccessResponse({ users: [] });
}

// 更新用户（空实现，无登录系统）
export async function updateUser(id, updates) {
  await simulateRequest();
  return createErrorResponse('用户系统已禁用');
}
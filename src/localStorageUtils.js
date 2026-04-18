// 本地存储工具函数 - 用于GitHub Pages部署版本

// 生成匿名用户ID
export const getAnonymousUserId = () => {
  let userId = localStorage.getItem('iot_anonymous_user_id');
  if (!userId) {
    // 生成唯一ID：anonymous-时间戳-随机字符串
    userId = `anonymous-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('iot_anonymous_user_id', userId);
  }
  return userId;
};

// 获取当前用户ID（匿名或已登录）
export const getCurrentUserId = () => {
  // 检查是否有已登录用户
  const userJson = localStorage.getItem('iot_current_user');
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      return user.phone || user.id || getAnonymousUserId();
    } catch (e) {
      console.error('解析用户数据失败:', e);
    }
  }
  return getAnonymousUserId();
};

// 进度数据结构
export const createProgressData = (answeredIds = [], wrongIds = [], stats = {}) => {
  return {
    userId: getCurrentUserId(),
    lastUpdated: new Date().toISOString(),
    answeredIds: Array.from(answeredIds),
    wrongIds: Array.from(wrongIds),
    stats: {
      totalAnswered: answeredIds.length,
      correctAnswers: answeredIds.length - wrongIds.length,
      accuracy: answeredIds.length > 0 ? (answeredIds.length - wrongIds.length) / answeredIds.length : 0,
      ...stats
    }
  };
};

// 保存用户进度
export const saveUserProgress = (answeredIds, wrongIds, additionalStats = {}) => {
  try {
    const userId = getCurrentUserId();
    const progress = createProgressData(answeredIds, wrongIds, additionalStats);
    
    // 保存到localStorage
    localStorage.setItem(`iot_progress_${userId}`, JSON.stringify(progress));
    
    // 同时保存一份到通用键名，便于快速访问
    localStorage.setItem('iot_latest_progress', JSON.stringify(progress));
    
    console.log('✅ 进度已保存到本地存储:', {
      userId,
      answered: answeredIds.length,
      wrong: wrongIds.length
    });
    
    return { success: true, progress };
  } catch (error) {
    console.error('保存进度失败:', error);
    return { success: false, message: '保存进度失败' };
  }
};

// 加载用户进度
export const getUserProgress = (userId = null) => {
  try {
    const targetUserId = userId || getCurrentUserId();
    const progressJson = localStorage.getItem(`iot_progress_${targetUserId}`);
    
    if (!progressJson) {
      return { success: true, progress: null };
    }
    
    const progress = JSON.parse(progressJson);
    return { success: true, progress };
  } catch (error) {
    console.error('加载进度失败:', error);
    return { success: false, message: '加载进度失败' };
  }
};

// 获取所有进度数据（用于统计）
export const getAllUserProgress = () => {
  try {
    const progresses = [];
    
    // 收集所有以iot_progress_开头的键
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('iot_progress_')) {
        try {
          const progress = JSON.parse(localStorage.getItem(key));
          progresses.push(progress);
        } catch (e) {
          console.warn(`解析进度数据失败 (${key}):`, e);
        }
      }
    }
    
    return { success: true, progresses };
  } catch (error) {
    console.error('获取所有进度失败:', error);
    return { success: false, message: '获取所有进度失败' };
  }
};

// 导出进度数据
export const exportProgress = () => {
  try {
    const progress = getUserProgress();
    if (!progress.success || !progress.progress) {
      return null;
    }
    
    const dataStr = JSON.stringify(progress.progress, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    return dataUri;
  } catch (error) {
    console.error('导出进度失败:', error);
    return null;
  }
};

// 导入进度数据
export const importProgress = (jsonData) => {
  try {
    const progress = JSON.parse(jsonData);
    
    if (!progress.userId) {
      return { success: false, message: '无效的进度数据：缺少userId' };
    }
    
    // 验证数据结构
    if (!Array.isArray(progress.answeredIds) || !Array.isArray(progress.wrongIds)) {
      return { success: false, message: '无效的进度数据格式' };
    }
    
    // 保存进度
    localStorage.setItem(`iot_progress_${progress.userId}`, JSON.stringify(progress));
    
    // 如果导入的是当前用户的进度，更新当前用户ID
    const currentUserId = getCurrentUserId();
    if (progress.userId !== currentUserId) {
      console.log(`导入进度来自用户: ${progress.userId}, 当前用户: ${currentUserId}`);
    }
    
    return { success: true, progress };
  } catch (error) {
    console.error('导入进度失败:', error);
    return { success: false, message: '导入进度失败：数据格式错误' };
  }
};

// 清除当前用户进度
export const clearUserProgress = () => {
  try {
    const userId = getCurrentUserId();
    localStorage.removeItem(`iot_progress_${userId}`);
    localStorage.removeItem('iot_latest_progress');
    
    return { success: true, message: '进度已清除' };
  } catch (error) {
    console.error('清除进度失败:', error);
    return { success: false, message: '清除进度失败' };
  }
};

// 获取学习统计
export const getLearningStats = () => {
  try {
    const progress = getUserProgress();
    if (!progress.success || !progress.progress) {
      return {
        totalAnswered: 0,
        correctAnswers: 0,
        accuracy: 0,
        wrongCount: 0,
        lastUpdated: null
      };
    }
    
    const { stats, lastUpdated } = progress.progress;
    return {
      totalAnswered: stats.totalAnswered || 0,
      correctAnswers: stats.correctAnswers || 0,
      accuracy: stats.accuracy || 0,
      wrongCount: stats.totalAnswered - stats.correctAnswers || 0,
      lastUpdated
    };
  } catch (error) {
    console.error('获取学习统计失败:', error);
    return {
      totalAnswered: 0,
      correctAnswers: 0,
      accuracy: 0,
      wrongCount: 0,
      lastUpdated: null
    };
  }
};

// 检查本地存储是否可用
export const isLocalStorageAvailable = () => {
  try {
    const testKey = '__test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.warn('localStorage不可用:', e);
    return false;
  }
};
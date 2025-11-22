import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, Users, TrendingUp, MessageSquare, Send, Award, Clock, CheckCircle, XCircle, MessageCircle, Eye, Trash2, AlertTriangle, Reply, BookOpen, Megaphone, Search } from 'lucide-react';
import { ReplyModal } from './ReplyModal.jsx';
import { QuestionManager } from './QuestionManager.jsx';
import * as api from './apiClient.js';

export const AdminPanel = ({ setAppState, MOCK_QUESTION_BANK, answeredIds, wrongQuestionIds }) => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, messages, feedbacks, errors, progress, questions, announcement
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [isSending, setIsSending] = useState(false);

  // 回复弹窗状态
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyItem, setReplyItem] = useState(null);
  const [replyType, setReplyType] = useState(''); // 'feedback' or 'error'

  // 公告管理状态
  const [announcement, setAnnouncement] = useState({
    title: '',
    content: '',
    enabled: true
  });

  // 获取所有用户数据
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const result = await api.getAllUsers();
    if (result.success) {
      setUsers(result.users);
    }
  };

  // 订阅用户状态变化
  useEffect(() => {
    const unsubscribe = api.subscribeWebSocket('USER_STATUS_CHANGED', (data) => {
      console.log('👤 用户状态变化:', data);
      setUsers(prev => prev.map(user => 
        user.phone === data.userId 
          ? { ...user, onlineStatus: data.status }
          : user
      ));
    });
    return unsubscribe;
  }, []);

  // 定期刷新用户列表（每30秒）
  useEffect(() => {
    const interval = setInterval(() => {
      loadUsers();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // 获取所有用户反馈
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    const result = await api.getAllFeedbacks();
    if (result.success) {
      setFeedbacks(result.feedbacks);
    }
  };

  // 订阅实时反馈更新
  useEffect(() => {
    const unsubscribe = api.subscribeWebSocket('NEW_FEEDBACK', (feedback) => {
      setFeedbacks(prev => {
        // 防止重复添加
        if (prev.some(f => f.id === feedback.id)) {
          return prev;
        }
        return [feedback, ...prev];
      });
    });
    return unsubscribe;
  }, []);

  // 删除反馈
  const deleteFeedback = async (id) => {
    if (confirm('确定要删除这条反馈吗？')) {
      const result = await api.deleteFeedback(id);
      if (result.success) {
        setFeedbacks(prev => prev.filter(f => f.id !== id));
      }
    }
  };

  // 标记反馈为已读
  const markFeedbackAsRead = async (id) => {
    const result = await api.markFeedbackAsRead(id);
    if (result.success) {
      setFeedbacks(prev => prev.map(f => 
        f.id === id ? { ...f, read: true } : f
      ));
    }
  };

  // 统计未读反馈数
  const unreadFeedbackCount = feedbacks.filter(f => !f.read).length;

  // 获取所有纠错报告
  const [errorReports, setErrorReports] = useState([]);

  useEffect(() => {
    loadErrorReports();
  }, []);

  const loadErrorReports = async () => {
    const result = await api.getAllErrorReports();
    if (result.success) {
      setErrorReports(result.reports);
    }
  };

  // 订阅实时纠错更新
  useEffect(() => {
    const unsubscribe = api.subscribeWebSocket('NEW_ERROR_REPORT', (report) => {
      setErrorReports(prev => {
        // 防止重复添加
        if (prev.some(r => r.id === report.id)) {
          return prev;
        }
        return [report, ...prev];
      });
    });
    return unsubscribe;
  }, []);

  // 删除纠错报告
  const deleteErrorReport = async (id) => {
    if (confirm('确定要删除这条纠错报告吗？')) {
      const result = await api.deleteErrorReport(id);
      if (result.success) {
        setErrorReports(prev => prev.filter(r => r.id !== id));
      }
    }
  };

  // 标记纠错报告为已读
  const markErrorAsRead = async (id) => {
    const result = await api.markErrorReportAsRead(id);
    if (result.success) {
      setErrorReports(prev => prev.map(r => 
        r.id === id ? { ...r, read: true } : r
      ));
    }
  };

  // 统计未读纠错报告数
  const unreadErrorCount = errorReports.filter(r => !r.read).length;

  // 获取所有用户答题进度
  const [userProgressList, setUserProgressList] = useState([]);

  const loadAllUserProgress = async () => {
    try {
      const result = await api.getAllUserProgress();
      if (result.success) {
        setUserProgressList(result.progressList || []);
      }
    } catch (error) {
      console.error('加载答题进度失败:', error);
      setUserProgressList([]);
    }
  };

  useEffect(() => {
    loadAllUserProgress();
    loadAnnouncement();
  }, []);

  // 加载公告
  const loadAnnouncement = async () => {
    const result = await api.getAnnouncement();
    if (result.success && result.announcement) {
      setAnnouncement(result.announcement);
    }
  };

  // 保存公告
  const handleSaveAnnouncement = async () => {
    const result = await api.updateAnnouncement(announcement);
    if (result.success) {
      alert('公告已更新！所有用户将看到新公告。');
    } else {
      alert(result.message || '更新失败');
    }
  };

  // 用户答题进度数据
  const [userProgressData, setUserProgressData] = useState({});

  // 加载所有用户的答题进度
  useEffect(() => {
    const loadAllProgress = async () => {
      const progressMap = {};
      for (const user of users) {
        const result = await api.getUserProgress(user.phone);
        if (result.success && result.progress) {
          progressMap[user.phone] = {
            answeredIds: new Set(result.progress.answeredIds || []),
            wrongIds: new Set(result.progress.wrongIds || [])
          };
        }
      }
      setUserProgressData(progressMap);
    };

    if (users.length > 0) {
      loadAllProgress();
    }
  }, [users]);

  // 统计数据
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const totalQuestions = MOCK_QUESTION_BANK.length;
    
    // 计算所有用户的平均完成率和正确率
    let totalAnswered = 0;
    let totalCorrect = 0;
    let userCount = 0;
    
    Object.values(userProgressData).forEach(progress => {
      const answered = progress.answeredIds.size;
      const wrong = progress.wrongIds.size;
      const correct = answered - wrong;
      
      totalAnswered += answered;
      totalCorrect += correct;
      userCount++;
    });

    const avgCompletion = userCount > 0 ? Math.round(totalAnswered / userCount) : 0;
    const avgAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    return {
      totalUsers,
      totalQuestions,
      avgCompletion,
      avgAccuracy
    };
  }, [users, MOCK_QUESTION_BANK.length, userProgressData]);

  // 清理重复消息
  const cleanupDuplicates = () => {
    try {
      const globalMessages = JSON.parse(localStorage.getItem('iot_global_messages') || '[]');
      
      // 使用Map去重（基于标题+内容）
      const uniqueMessages = [];
      const seen = new Set();
      
      globalMessages.forEach(msg => {
        const key = `${msg.title}-${msg.message}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueMessages.push(msg);
        }
      });
      
      localStorage.setItem('iot_global_messages', JSON.stringify(uniqueMessages));
      const removed = globalMessages.length - uniqueMessages.length;
      
      if (removed > 0) {
        alert(`已清理 ${removed} 条重复消息`);
      } else {
        alert('没有发现重复消息');
      }
    } catch (error) {
      alert('清理失败');
      console.error(error);
    }
  };

  // 发送全局消息
  const sendGlobalMessage = async () => {
    if (isSending) return; // 防止重复点击
    
    if (!messageTitle.trim() || !messageContent.trim()) {
      alert('请填写完整的消息标题和内容');
      return;
    }

    setIsSending(true); // 禁用按钮

    try {
      // 创建新消息
      const newMessage = {
        type: messageType,
        title: messageTitle,
        message: messageContent,
        isGlobal: true,
        fromAdmin: true
      };

      // 通过API发送
      const result = await api.sendNotification(newMessage);

      if (!result.success) {
        alert(result.message || '发送失败，请重试');
        return;
      }

      alert('消息已成功发送给所有用户！');
      
      // 清空表单
      setMessageTitle('');
      setMessageContent('');
      setMessageType('info');
    } catch (error) {
      alert('消息发送失败，请重试');
      console.error(error);
    } finally {
      setIsSending(false); // 恢复按钮
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* 返回按钮 */}
      <button
        onClick={() => setAppState('welcome')}
        className="mb-4 flex items-center text-slate-600 hover:text-indigo-600 font-medium transition-colors"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        返回首页
      </button>

      {/* 标题 */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white mb-8">
        <div className="flex items-center space-x-4">
          <div className="text-5xl">👑</div>
          <div>
            <h1 className="text-3xl font-bold mb-2">管理员控制台</h1>
            <p className="text-indigo-200">系统管理与数据统计</p>
          </div>
        </div>
      </div>

      {/* Tab导航 */}
      <div className="bg-white rounded-xl shadow-md mb-6 p-2 flex space-x-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <TrendingUp className="w-5 h-5 inline mr-2" />
          数据概览
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'users'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Users className="w-5 h-5 inline mr-2" />
          用户管理
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'messages'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <MessageSquare className="w-5 h-5 inline mr-2" />
          消息推送
        </button>
        <button
          onClick={() => setActiveTab('feedbacks')}
          className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all relative ${
            activeTab === 'feedbacks'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <MessageCircle className="w-5 h-5 inline mr-2" />
          用户反馈
          {unreadFeedbackCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unreadFeedbackCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('errors')}
          className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all relative ${
            activeTab === 'errors'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className="w-5 h-5 inline mr-2" />
          纠错报告
          {unreadErrorCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unreadErrorCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('progress')}
          className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'progress'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <TrendingUp className="w-5 h-5 inline mr-2" />
          答题概览
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'questions'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-5 h-5 inline mr-2" />
          题库管理
        </button>
        <button
          onClick={() => setActiveTab('announcement')}
          className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'announcement'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Megaphone className="w-5 h-5 inline mr-2" />
          公告管理
        </button>
      </div>

      {/* 数据概览 */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm mb-1">注册用户</p>
                  <p className="text-3xl font-bold text-slate-800">{stats.totalUsers}</p>
                </div>
                <Users className="w-12 h-12 text-blue-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm mb-1">题库总数</p>
                  <p className="text-3xl font-bold text-slate-800">{stats.totalQuestions}</p>
                </div>
                <Award className="w-12 h-12 text-green-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm mb-1">平均完成数</p>
                  <p className="text-3xl font-bold text-slate-800">{stats.avgCompletion}</p>
                </div>
                <Clock className="w-12 h-12 text-purple-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm mb-1">平均正确率</p>
                  <p className="text-3xl font-bold text-slate-800">{stats.avgAccuracy}%</p>
                </div>
                <TrendingUp className="w-12 h-12 text-orange-500 opacity-20" />
              </div>
            </div>
          </div>

          {/* 系统状态 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">系统状态</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-slate-700">数据库连接</span>
                <span className="text-green-600 font-semibold flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" /> 正常
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-slate-700">题库状态</span>
                <span className="text-green-600 font-semibold flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" /> 正常
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-slate-700">用户系统</span>
                <span className="text-green-600 font-semibold flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" /> 正常
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 用户管理 */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">注册用户列表</h3>
          
          {users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">暂无注册用户</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">用户名</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">手机号</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">密码</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">头像</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">注册时间</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium text-slate-800">{user.username}</td>
                      <td className="py-3 px-4 text-slate-600">{user.phone}</td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded font-mono text-sm">
                          {user.password}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-2xl">{user.avatar}</td>
                      <td className="py-3 px-4 text-slate-600 text-sm">
                        {user.registerTime ? new Date(user.registerTime).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3 px-4">
                        {user.onlineStatus === 'online' ? (
                          <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded flex items-center gap-1 inline-flex">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            在线
                          </span>
                        ) : user.onlineStatus === 'answering' ? (
                          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded flex items-center gap-1 inline-flex">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            做题中
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-1 rounded">
                            离线
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 消息推送 */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">向所有用户推送消息</h3>
            <button
              onClick={cleanupDuplicates}
              className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              🧹 清理重复消息
            </button>
          </div>
          
          <div className="space-y-4">
            {/* 消息类型 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">消息类型</label>
              <div className="flex space-x-3">
                <button
                  onClick={() => setMessageType('info')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    messageType === 'info'
                      ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ℹ️ 信息
                </button>
                <button
                  onClick={() => setMessageType('success')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    messageType === 'success'
                      ? 'bg-green-100 text-green-700 ring-2 ring-green-500'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ✅ 成功
                </button>
                <button
                  onClick={() => setMessageType('alert')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    messageType === 'alert'
                      ? 'bg-red-100 text-red-700 ring-2 ring-red-500'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ⚠️ 警告
                </button>
              </div>
            </div>

            {/* 消息标题 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">消息标题</label>
              <input
                type="text"
                value={messageTitle}
                onChange={(e) => setMessageTitle(e.target.value)}
                placeholder="请输入消息标题..."
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* 消息内容 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">消息内容</label>
              <textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="请输入消息内容..."
                rows={5}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
              />
            </div>

            {/* 预览 */}
            {(messageTitle || messageContent) && (
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="text-xs text-slate-500 mb-2">消息预览</p>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-bold text-slate-800 mb-2">{messageTitle || '标题'}</h4>
                  <p className="text-sm text-slate-600">{messageContent || '内容'}</p>
                </div>
              </div>
            )}

            {/* 发送按钮 */}
            <button
              onClick={sendGlobalMessage}
              disabled={isSending}
              className={`w-full font-bold py-3 rounded-lg transition-all flex items-center justify-center ${
                isSending 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 transform hover:scale-105'
              } text-white`}
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  发送中...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  发送给所有用户
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 用户反馈 */}
      {activeTab === 'feedbacks' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800">用户反馈列表</h3>
              <p className="text-sm text-slate-500 mt-1">共 {feedbacks.length} 条反馈，{unreadFeedbackCount} 条未读</p>
            </div>
            {feedbacks.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('确定要清空所有反馈吗？')) {
                    setFeedbacks([]);
                    localStorage.setItem('iot_feedbacks', '[]');
                  }
                }}
                className="text-sm bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                清空全部
              </button>
            )}
          </div>

          {feedbacks.length === 0 ? (
            <div className="text-center py-16">
              <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">暂无用户反馈</p>
              <p className="text-slate-400 text-sm mt-2">用户提交的反馈会在这里显示</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbacks.sort((a, b) => new Date(b.time) - new Date(a.time)).map(feedback => {
                const typeConfig = {
                  suggestion: { label: '💡 建议', color: 'blue' },
                  bug: { label: '🐛 Bug反馈', color: 'red' },
                  other: { label: '💬 其他', color: 'gray' }
                };
                
                const config = typeConfig[feedback.type] || typeConfig.other;
                
                return (
                  <div
                    key={feedback.id}
                    className={`border-2 rounded-xl p-5 transition-all ${
                      feedback.read 
                        ? 'border-slate-200 bg-white' 
                        : 'border-indigo-300 bg-indigo-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{feedback.userAvatar}</span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-800">{feedback.username}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              config.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                              config.color === 'red' ? 'bg-red-100 text-red-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {config.label}
                            </span>
                            {!feedback.read && (
                              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded font-bold">
                                未读
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {feedback.userId} · {new Date(feedback.time).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setReplyItem(feedback);
                            setReplyType('feedback');
                            setShowReplyModal(true);
                          }}
                          className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg font-medium transition-colors flex items-center"
                        >
                          <Reply className="w-3 h-3 mr-1" />
                          回复
                        </button>
                        {!feedback.read && (
                          <button
                            onClick={() => markFeedbackAsRead(feedback.id)}
                            className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-lg font-medium transition-colors flex items-center"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            标为已读
                          </button>
                        )}
                        <button
                          onClick={() => deleteFeedback(feedback.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="ml-14">
                      <h4 className="font-bold text-slate-800 mb-2 text-lg">{feedback.title}</h4>
                      <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{feedback.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 纠错报告 */}
      {activeTab === 'errors' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800">题目纠错报告</h3>
              <p className="text-sm text-slate-500 mt-1">共 {errorReports.length} 条报告，{unreadErrorCount} 条未读</p>
            </div>
            {errorReports.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('确定要清空所有纠错报告吗？')) {
                    setErrorReports([]);
                    localStorage.setItem('iot_error_reports', '[]');
                  }
                }}
                className="text-sm bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                清空全部
              </button>
            )}
          </div>

          {errorReports.length === 0 ? (
            <div className="text-center py-16">
              <AlertTriangle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">暂无纠错报告</p>
              <p className="text-slate-400 text-sm mt-2">用户提交的题目纠错会在这里显示</p>
            </div>
          ) : (
            <div className="space-y-4">
              {errorReports.sort((a, b) => new Date(b.time) - new Date(a.time)).map(report => (
                <div
                  key={report.id}
                  className={`border-2 rounded-xl p-5 transition-all ${
                    report.read 
                      ? 'border-slate-200 bg-white' 
                      : 'border-orange-300 bg-orange-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{report.userAvatar}</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-800">{report.username}</span>
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                            题目 #{report.questionId}
                          </span>
                          {!report.read && (
                            <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded font-bold">
                              未读
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {report.userId} · {new Date(report.time).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setReplyItem(report);
                          setReplyType('error');
                          setShowReplyModal(true);
                        }}
                        className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg font-medium transition-colors flex items-center"
                      >
                        <Reply className="w-3 h-3 mr-1" />
                        回复
                      </button>
                      {!report.read && (
                        <button
                          onClick={() => markErrorAsRead(report.id)}
                          className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-lg font-medium transition-colors flex items-center"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          标为已读
                        </button>
                      )}
                      <button
                        onClick={() => deleteErrorReport(report.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('questions');
                        }}
                        className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg font-medium transition-colors flex items-center"
                      >
                        <BookOpen className="w-3 h-3 mr-1" />
                        查看题库
                      </button>
                    </div>
                  </div>
                  
                  {/* 题目信息 */}
                  <div className="bg-slate-50 rounded-lg p-4 mb-4">
                    <h4 className="font-bold text-slate-800 mb-2">{report.question}</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <p className="text-red-600 font-semibold mb-1">当前答案</p>
                        <p className="text-red-700 text-lg font-bold">{report.currentAnswer}</p>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded p-3">
                        <p className="text-green-600 font-semibold mb-1">建议答案</p>
                        <p className="text-green-700 text-lg font-bold">{report.suggestedAnswer}</p>
                      </div>
                    </div>
                  </div>

                  {/* 问题描述 */}
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <p className="text-xs text-slate-500 mb-2">问题描述：</p>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{report.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 答题概览 */}
      {activeTab === 'progress' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-800">用户答题统计</h3>
            <p className="text-sm text-slate-500 mt-1">查看所有用户的答题进度和正确率</p>
          </div>

          {userProgressList.length === 0 ? (
            <div className="text-center py-16">
              <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">暂无答题数据</p>
              <p className="text-slate-400 text-sm mt-2">用户开始答题后会显示统计数据</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">用户</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-600">总答题数</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-600">错题数</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-600">正确率</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-600">进度</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-600">最近更新</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {userProgressList
                    .sort((a, b) => (b.totalAnswered || 0) - (a.totalAnswered || 0))
                    .map((progress) => {
                      const user = users.find(u => u.phone === progress.userId);
                      const totalQuestions = MOCK_QUESTION_BANK?.length || 568;
                      const progressPercent = totalQuestions > 0 
                        ? ((progress.totalAnswered / totalQuestions) * 100).toFixed(1)
                        : '0.0';
                      
                      return (
                        <tr key={progress.userId} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl">{user?.avatar || '👤'}</span>
                              <div>
                                <p className="font-medium text-slate-800">{user?.username || '未知用户'}</p>
                                <p className="text-xs text-slate-500">{progress.userId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="text-center py-3 px-4">
                            <span className="text-lg font-bold text-blue-600">{progress.totalAnswered || 0}</span>
                            <span className="text-sm text-slate-400"> 题</span>
                          </td>
                          <td className="text-center py-3 px-4">
                            <span className="text-lg font-bold text-red-600">{progress.totalWrong || 0}</span>
                            <span className="text-sm text-slate-400"> 题</span>
                          </td>
                          <td className="text-center py-3 px-4">
                            <div className="inline-flex items-center">
                              <span className={`text-lg font-bold ${
                                parseFloat(progress.accuracy || 0) >= 80 ? 'text-green-600' :
                                parseFloat(progress.accuracy || 0) >= 60 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {progress.accuracy || '0'}%
                              </span>
                            </div>
                          </td>
                          <td className="text-center py-3 px-4">
                            <div className="flex flex-col items-center">
                              <span className="text-sm text-slate-600 mb-1">{progressPercent}%</span>
                              <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all"
                                  style={{ width: `${progressPercent}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="text-center py-3 px-4">
                            <span className="text-xs text-slate-500">
                              {progress.lastUpdated ? new Date(progress.lastUpdated).toLocaleString('zh-CN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : '-'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 题库管理 */}
      {activeTab === 'questions' && (
        <QuestionManager MOCK_QUESTION_BANK={MOCK_QUESTION_BANK} />
      )}

      {/* 公告管理 */}
      {activeTab === 'announcement' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">全局公告管理</h2>
            <p className="text-sm text-slate-500">设置全站公告，所有用户都能在首页顶部看到</p>
          </div>

          <div className="space-y-6">
            {/* 启用/禁用开关 */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <div className="font-medium text-slate-800">启用公告</div>
                <div className="text-sm text-slate-500">关闭后公告将不会显示</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={announcement.enabled}
                  onChange={(e) => setAnnouncement({ ...announcement, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* 公告标题 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                公告标题 <span className="text-slate-400">(选填)</span>
              </label>
              <input
                type="text"
                value={announcement.title}
                onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                placeholder="例如：系统维护通知"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* 公告内容 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                公告内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={announcement.content}
                onChange={(e) => setAnnouncement({ ...announcement, content: e.target.value })}
                placeholder="输入公告内容，将显示在所有页面顶部..."
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 transition resize-none"
              />
              <div className="text-sm text-slate-500 mt-1">
                {announcement.content.length} 字符
              </div>
            </div>

            {/* 预览 */}
            {announcement.enabled && announcement.content && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">预览效果</label>
                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-lg p-4">
                  <div className="flex items-center">
                    <Megaphone className="w-5 h-5 mr-3 flex-shrink-0" />
                    <div className="flex-1">
                      {announcement.title && (
                        <div className="font-bold text-sm mb-1">{announcement.title}</div>
                      )}
                      <div className="text-sm opacity-95">{announcement.content}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 保存按钮 */}
            <div className="flex gap-4 pt-4 border-t">
              <button
                onClick={handleSaveAnnouncement}
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                <CheckCircle className="w-5 h-5" />
                保存公告
              </button>
              <button
                onClick={loadAnnouncement}
                className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition font-medium"
              >
                重置
              </button>
            </div>

            {/* 提示信息 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <div className="font-medium mb-1">提示</div>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>公告会显示在所有页面顶部</li>
                    <li>保存后会立即推送给所有在线用户</li>
                    <li>用户可以手动关闭公告横幅</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 回复弹窗 */}
      {showReplyModal && replyItem && (
        <ReplyModal
          item={replyItem}
          type={replyType}
          onClose={(success) => {
            setShowReplyModal(false);
            setReplyItem(null);
            setReplyType('');
            if (success) {
              // 回复成功后，可以自动标记为已读
              if (replyType === 'feedback') {
                markFeedbackAsRead(replyItem.id);
              } else if (replyType === 'error') {
                markErrorAsRead(replyItem.id);
              }
            }
          }}
        />
      )}
    </div>
  );
};

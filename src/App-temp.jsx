import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Clock, CheckCircle, XCircle, ChevronRight, ChevronLeft, RotateCcw, Cpu, Zap, Layers, BarChart3, AlertTriangle, CalendarClock, Github, Flag, Mail, X, Sparkles, Shuffle, User, BookOpen } from 'lucide-react';
import { QUESTION_BANK } from './questionBank.js';
// 绉婚櫎鐧诲綍绯荤粺锛氫笉鍐嶉渶瑕丩oginView鍜孭rofileView
import { ExportMenu } from './MenuComponents.jsx';
import { NotificationMenu } from './NotificationComponent.jsx';
import { AdminPanel } from './AdminPanel.jsx';
import { FeedbackButton } from './FeedbackComponent.jsx';
import { ErrorReportModal } from './ErrorReportModal.jsx';
import { AnnouncementBanner } from './AnnouncementBanner.jsx';
import * as api from './apiClient.js';

// 榛樿棰樺簱锛堜綔涓哄鐢級
const DEFAULT_QUESTION_BANK = QUESTION_BANK.length > 0 ? QUESTION_BANK : [
  {
    id: 1,
    type: 'single',
    category: '浼犳劅鍣ㄦ妧鏈?,
    question: '鍦ㄧ墿鑱旂綉鐜鐩戞祴绯荤粺涓紝鐢ㄤ簬妫€娴嬬┖姘旀箍搴︾殑浼犳劅鍣ㄩ€氬父閲囩敤浠€涔堝師鐞嗭紵',
    options: [
      { id: 'A', text: '鐑晱鐢甸樆鏁堝簲' },
      { id: 'B', text: '婀挎晱鐢靛鎴栫數闃诲彉鍖? },
      { id: 'C', text: '闇嶅皵鏁堝簲' },
      { id: 'D', text: '鍏夌數鏁堝簲' }
    ],
    correctAnswer: 'B',
    explanation: '婀垮害浼犳劅鍣ㄤ富瑕佸埄鐢ㄦ箍鏁忓厓浠讹紙鐢靛鎴栫數闃伙級闅忕幆澧冩箍搴﹀彉鍖栬€屾敼鍙樼數瀛︽€ц川鐨勫師鐞嗚繘琛屾祴閲忋€?
  },
  {
    id: 2,
    type: 'single',
    category: '閫氫俊鍗忚',
    question: 'ZigBee 缃戠粶鐨勫崗璋冨櫒锛圕oordinator锛夌殑涓昏鍔熻兘涓嶅寘鎷互涓嬪摢椤癸紵',
    options: [
      { id: 'A', text: '寤虹珛缃戠粶' },
      { id: 'B', text: '瀛樺偍缃戠粶瀹夊叏瀵嗛挜' },
      { id: 'C', text: '绠＄悊缃戠粶鑺傜偣' },
      { id: 'D', text: '璐熻矗楂樺甫瀹借棰戜紶杈? }
    ],
    correctAnswer: 'D',
    explanation: 'ZigBee 鏄綆鍔熻€椼€佷綆閫熺巼鐨勭煭璺濈鏃犵嚎閫氫俊鎶€鏈紝涓嶉€傚悎浼犺緭楂樺甫瀹界殑瑙嗛鏁版嵁銆傚崗璋冨櫒涓昏璐熻矗缁勭綉鍜岀鐞嗐€?
  },
  {
    id: 3,
    type: 'single',
    category: '纭欢鎺ュ彛',
    question: 'RS-485 閫氫俊鎺ュ彛鍦ㄥ伐涓氱墿鑱旂綉涓箍娉涘簲鐢紝鍏朵富瑕佺壒鐐规槸锛?,
    options: [
      { id: 'A', text: '鍏ㄥ弻宸ラ€氫俊锛屾姉骞叉壈鑳藉姏宸? },
      { id: 'B', text: '宸垎淇″彿浼犺緭锛屾姉鍏辨ā骞叉壈鑳藉姏寮? },
      { id: 'C', text: '鍙兘鐐瑰鐐归€氫俊' },
      { id: 'D', text: '浼犺緭璺濈鐭紝閫氬父涓嶈秴杩?绫? }
    ],
    correctAnswer: 'B',
    explanation: 'RS-485 閲囩敤宸垎淇″彿锛堜袱绾垮埗锛夛紝鑳芥湁鏁堟姂鍒跺叡妯″共鎵帮紝浼犺緭璺濈鍙揪 1200 绫筹紝鏀寔澶氱偣缁勭綉銆?
  },
  {
    id: 4,
    type: 'single',
    category: '缃戠粶灞?,
    question: 'NB-IoT锛堢獎甯︾墿鑱旂綉锛夌殑涓昏浼樺娍鍦烘櫙鏄紵',
    options: [
      { id: 'A', text: '楂橀€熺巼銆佷綆寤惰繜鐨勮嚜鍔ㄩ┚椹? },
      { id: 'B', text: '澶ф祦閲忕殑瑙嗛鐩戞帶' },
      { id: 'C', text: '骞胯鐩栥€佷綆鍔熻€椼€佸ぇ杩炴帴鐨勬櫤鑳芥妱琛? },
      { id: 'D', text: '棰戠箒浜や簰鐨勮闊抽€氳瘽' }
    ],
    correctAnswer: 'C',
    explanation: 'NB-IoT 涓撲负浣庡姛鑰楀箍鍩熺綉璁捐锛岀壒鍒€傚悎鏁版嵁閲忓皬銆佸垎甯冨箍銆佸寤惰繜涓嶆晱鎰熺殑鍦烘櫙锛屽鏅鸿兘姘磋〃銆佹皵琛ㄣ€?
  },
  {
    id: 5,
    type: 'single',
    category: '瀹夎皟瀹炲姟',
    question: '鍦ㄥ畨瑁呯孩澶栧灏勬帰娴嬪櫒鏃讹紝鍙戝皠绔拰鎺ユ敹绔繀椤讳繚鎸侊紵',
    options: [
      { id: 'A', text: '鍨傜洿瑙掑害' },
      { id: 'B', text: '鍏夎酱瀵瑰噯锛屾棤閬尅' },
      { id: 'C', text: '闅忔剰鎽嗘斁' },
      { id: 'D', text: '鑳屽鑳屽畨瑁? }
    ],
    correctAnswer: 'B',
    explanation: '绾㈠瀵瑰皠鎺㈡祴鍣ㄤ緷闈犲彂灏勭鍙戝嚭鐨勭孩澶栧厜鏉熻鎺ユ敹绔帴鏀舵潵宸ヤ綔锛屽繀椤讳繚璇佸厜杞村鍑嗕笖涓棿鏃犻殰纰嶇墿銆?
  },
  {
    id: 6,
    type: 'single',
    category: '缃戠粶閰嶇疆',
    question: '缃戝叧锛圙ateway锛夊湪鐗╄仈缃戞灦鏋勪腑鐨勬牳蹇冧綔鐢ㄦ槸锛?,
    options: [
      { id: 'A', text: '浠呮彁渚涚數婧? },
      { id: 'B', text: '鍗忚杞崲涓庢暟鎹浆鍙? },
      { id: 'C', text: '鐢熸垚鍘熷鏁版嵁' },
      { id: 'D', text: '鏇夸唬浜戠鏈嶅姟鍣? }
    ],
    correctAnswer: 'B',
    explanation: '缃戝叧涓昏璐熻矗涓嶅悓鎰熺煡灞傚崗璁紙濡俍igBee, Bluetooth锛変笌缃戠粶灞傚崗璁紙濡俆CP/IP, MQTT锛変箣闂寸殑杞崲鍜屾暟鎹笂浼犮€?
  },
  {
    id: 7,
    type: 'single',
    category: 'RFID鎶€鏈?,
    question: '楂橀锛圚F锛塕FID 鏍囩鐨勫伐浣滈鐜囬€氬父鏄紵',
    options: [
      { id: 'A', text: '125 KHz' },
      { id: 'B', text: '13.56 MHz' },
      { id: 'C', text: '915 MHz' },
      { id: 'D', text: '2.4 GHz' }
    ],
    correctAnswer: 'B',
    explanation: '13.56 MHz 鏄珮棰?RFID 鐨勫叏鐞冩爣鍑嗛鐜囷紝甯哥敤浜庨棬绂佸崱銆佽韩浠借瘉璇嗗埆绛夈€?
  }
];

// 鐙珛鐨勫€掕鏃剁粍浠讹紝閬垮厤瑙﹀彂鏁翠釜App閲嶆覆鏌?const ExamCountdown = React.memo(() => {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      let targetDate = new Date(currentYear, 10, 22, 8, 0, 0);
      const difference = targetDate - now;
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setCountdown(calculateTimeLeft());
    const timer = setInterval(() => {
      setCountdown(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hidden md:flex items-center text-xs font-mono bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-md border border-indigo-100 shadow-sm">
      <CalendarClock className="w-3.5 h-3.5 mr-2 text-indigo-500" />
      <span className="mr-2 font-bold text-slate-600">鐞嗚鑰冭瘯鍊掕鏃?</span>
      <span className="font-bold text-indigo-700">
        {countdown.days}澶?{countdown.hours}鏃?{countdown.minutes}鍒?{countdown.seconds}绉?      </span>
    </div>
  );
});

export default function App() {
  // --- State 瀹氫箟 ---
  // 浠巐ocalStorage鎭㈠椤甸潰鐘舵€?  const [appState, setAppState] = useState(() => {
    try {
      const saved = localStorage.getItem('iot_app_state');
      return saved || 'welcome';
    } catch (e) { return 'welcome'; }
  }); // welcome, quiz, result, profile, login, admin
  const [quizMode, setQuizMode] = useState('practice'); // practice, exam, instant, mistakes
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const modalContentRef = useRef(null); // 鐢ㄤ簬闂數鍒烽寮圭獥鑷姩婊氬姩
  const saveProgressTimerRef = useRef(null); // 鐢ㄤ簬璺熻釜淇濆瓨杩涘害鐨勫畾鏃跺櫒
  
  // 鐢ㄦ埛绯荤粺鐘舵€?  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('iot_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });
  
  // 闂數鍒烽寮圭獥鐩稿叧鐘舵€?  const [showInstantModal, setShowInstantModal] = useState(false);
  const [instantQuestion, setInstantQuestion] = useState(null); // 褰撳墠闂數棰樼洰
  const [isRolling, setIsRolling] = useState(false); // 鏄惁姝ｅ湪鎾斁鎶藉彇鍔ㄧ敾
  const [instantUserAnswer, setInstantUserAnswer] = useState(null); // 闂數妯″紡涓嬬殑绛旀

  // 绾犻敊寮圭獥鐘舵€?  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorQuestion, setErrorQuestion] = useState(null);
  
  // 椤哄簭缁冧範閫夋嫨寮圭獥鐘舵€?  const [showPracticeModal, setShowPracticeModal] = useState(false);
  
  // 澶嶅埗QQ鎻愮ず鐘舵€?  const [showCopyToast, setShowCopyToast] = useState(false);
  
  // 鍏ㄥ眬璀﹀憡寮圭獥鐘舵€?  const [globalWarning, setGlobalWarning] = useState(null);

  // 棰樺簱鐘舵€侊紙浠庢暟鎹簱鍔犺浇锛?  const [MOCK_QUESTION_BANK, setMOCK_QUESTION_BANK] = useState(DEFAULT_QUESTION_BANK);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  // 鍔犺浇棰樺簱
  const loadQuestionBank = async () => {
    setIsLoadingQuestions(true);
    const result = await api.getAllQuestions();
    
    if (result.success && result.questions && result.questions.length > 0) {
      setMOCK_QUESTION_BANK(result.questions);
      console.log(`馃摎 浠庢暟鎹簱鍔犺浇浜?${result.questions.length} 閬撻鐩甡);
      
      // 妫€鏌ユ暟鎹槸鍚﹂渶瑕佹洿鏂?瀵规瘮绗竴棰樼殑type)
      const dbFirstQ = result.questions.find(q => q.id === 343);
      const localFirstQ = DEFAULT_QUESTION_BANK.find(q => q.id === 343);
      if (dbFirstQ && localFirstQ && dbFirstQ.type !== localFirstQ.type) {
        console.log(`鈿狅笍 鏁版嵁搴撻搴撶増鏈繃鏃?鍑嗗鏇存柊...`);
        console.log(`DB: ID=${dbFirstQ.id}, type=${dbFirstQ.type}`);
        console.log(`Local: ID=${localFirstQ.id}, type=${localFirstQ.type}`);
        const importResult = await api.importQuestions(DEFAULT_QUESTION_BANK);
        if (importResult.success) {
          setMOCK_QUESTION_BANK(DEFAULT_QUESTION_BANK);
          console.log(`鉁?棰樺簱宸叉洿鏂? ${importResult.message}`);
        }
      }
    } else {
      // 濡傛灉鏁版嵁搴撲负绌猴紝瀵煎叆榛樿棰樺簱
      console.log('馃摎 鏁版嵁搴撻搴撲负绌猴紝鍑嗗瀵煎叆榛樿棰樺簱...');
      const importResult = await api.importQuestions(DEFAULT_QUESTION_BANK);
      if (importResult.success) {
        setMOCK_QUESTION_BANK(DEFAULT_QUESTION_BANK);
        console.log(`鉁?${importResult.message}`);
      }
    }
    
    setIsLoadingQuestions(false);
  };

  // 淇濆瓨椤甸潰鐘舵€佸埌localStorage锛堟帓闄uiz鐘舵€侊級
  useEffect(() => {
    if (appState !== 'quiz' && appState !== 'result') {
      localStorage.setItem('iot_app_state', appState);
    }
  }, [appState]);

  // 璁㈤槄鍏ㄥ眬娑堟伅鎺ㄩ€侊紙GitHub Pages鐗堟湰锛氱┖瀹炵幇锛?  useEffect(() => {
    console.log('鈩癸笍 GitHub Pages鐗堟湰锛氬叏灞€娑堟伅鎺ㄩ€佸凡绂佺敤');
    // 杩斿洖绌烘竻鐞嗗嚱鏁?    return () => {};
  }, []);

  // 鍒濆鍖栧簲鐢紙GitHub Pages鐗堟湰锛?  useEffect(() => {
    console.log('馃殌 GitHub Pages鐗堟湰鍒濆鍖?);
    
    // 鍔犺浇棰樺簱
    loadQuestionBank();
    
    // GitHub Pages鐗堟湰锛氭€绘槸灏濊瘯鍔犺浇杩涘害锛堟敮鎸佸尶鍚嶇敤鎴凤級
    // 鍏堟鏌ユ槸鍚︽湁宸茬櫥褰曠敤鎴?    const userJson = localStorage.getItem('iot_current_user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user.phone) {
          loadUserProgress(user.phone);
          console.log('馃攳 浠庢湰鍦板瓨鍌ㄦ仮澶嶇敤鎴?', user.username);
        }
      } catch (e) {
        console.error('瑙ｆ瀽鐢ㄦ埛鏁版嵁澶辫触:', e);
      }
    } else {
      // 鍖垮悕鐢ㄦ埛锛氬皾璇曞姞杞借繘搴?      loadUserProgress(null);
      console.log('馃攳 浠ュ尶鍚嶆ā寮忓姞杞借繘搴?);
    }
  }, []);

  // 璁㈤槄棰樺簱鏇存柊浜嬩欢锛圙itHub Pages鐗堟湰锛氱┖瀹炵幇锛?  useEffect(() => {
    console.log('鈩癸笍 GitHub Pages鐗堟湰锛歐ebSocket璁㈤槄宸茬鐢?);
    // 杩斿洖绌烘竻鐞嗗嚱鏁?    return () => {};
  }, []);

  // 鐩戝惉闂數鍒烽绛旀锛岃嚜鍔ㄦ粴鍔ㄥ埌搴曢儴
  useEffect(() => {
    if (instantUserAnswer && modalContentRef.current) {
      setTimeout(() => {
        modalContentRef.current.scrollTo({ 
          top: modalContentRef.current.scrollHeight, 
          behavior: 'smooth' 
        });
      }, 100);
    }
  }, [instantUserAnswer]);

  // 1. 绱鍒烽璁板綍
  const [answeredIds, setAnsweredIds] = useState(() => {
    try {
      const saved = localStorage.getItem('iot_answered_ids');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) { return new Set(); }
  });

  // 2. 閿欓鏈褰?  const [wrongQuestionIds, setWrongQuestionIds] = useState(() => {
    try {
      const saved = localStorage.getItem('iot_wrong_ids');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) { return new Set(); }
  });

  // --- 鏍稿績淇锛氭寔涔呭寲鍚屾 Effect ---
  // 鐩戝惉 wrongQuestionIds 鍙樺寲锛岃嚜鍔ㄥ悓姝ュ埌 localStorage
  // 杩欐瘮鍦?updateMistakeNotebook 涓洿鎺?setItem 鏇村畨鍏紝纭繚鏁版嵁濮嬬粓涓€鑷?  useEffect(() => {
    localStorage.setItem('iot_wrong_ids', JSON.stringify([...wrongQuestionIds]));
  }, [wrongQuestionIds]);

  // --- 杈呭姪鍑芥暟 ---
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };
  
  const markQuestionAsPracticed = (qId) => {
    if (!answeredIds.has(qId)) {
      const newSet = new Set(answeredIds);
      newSet.add(qId);
      setAnsweredIds(newSet);
      // 淇濆瓨鍒發ocalStorage锛堟湰鍦扮紦瀛橈級
      localStorage.setItem('iot_answered_ids', JSON.stringify([...newSet]));
      // 淇濆瓨鍒版湇鍔″櫒
      saveProgressToServer(newSet, wrongQuestionIds);
    }
  };

  // --- 鏍稿績淇锛氭洿鏂伴敊棰樻湰閫昏緫 ---
  // 浣跨敤鍑芥暟寮忔洿鏂?prev => ... 纭繚鍩轰簬鏈€鏂扮姸鎬佽繘琛屽鍒?  const updateMistakeNotebook = (qId, isCorrect) => {
    setWrongQuestionIds(prev => {
      const newSet = new Set(prev); // 鍩轰簬鏈€鏂扮殑 prev 鐘舵€佸垱寤?Set
      if (isCorrect) {
        // 濡傛灉绛斿浜嗭紝灏濊瘯绉婚櫎
        if (newSet.has(qId)) {
          newSet.delete(qId);
        }
      } else {
        // 濡傛灉绛旈敊浜嗭紝娣诲姞杩涘幓
        newSet.add(qId);
      }
      // 淇濆瓨鍒版湇鍔″櫒
      saveProgressToServer(answeredIds, newSet);
      return newSet; // 杩斿洖鏂?Set锛岃Е鍙?Effect 鍚屾瀛樺偍
    });
  };

  // 澶勭悊棰樼洰鍙嶉 - 鎵撳紑绾犻敊寮圭獥
  const handleFeedback = (q) => {
    setErrorQuestion(q);
    setShowErrorModal(true);
  };

  // --- 鐢ㄦ埛绯荤粺鍔熻兘 ---
  const ADMIN_ACCOUNT = { phone: '19312985136', password: 'Wjj19312985136...' };
  
  // 鐧诲綍鍑芥暟锛圙itHub Pages鐗堟湰锛?  const handleLogin = async (phone, password) => {
    const result = await api.loginUser(phone, password);
    
    if (result.success) {
      const loginUser = { ...result.user, loginTime: new Date().toISOString() };
      delete loginUser.password; // 涓嶅湪currentUser涓瓨鍌ㄥ瘑鐮?      setCurrentUser(loginUser);
      localStorage.setItem('iot_current_user', JSON.stringify(loginUser));
      
      console.log('鉁?鐢ㄦ埛鐧诲綍鎴愬姛锛堟湰鍦版ā寮忥級:', loginUser.username);
      
      // 鍔犺浇鐢ㄦ埛绛旈杩涘害
      await loadUserProgress(loginUser.phone);
      
      setAppState('welcome');
    }
    
    return result;
  };

  // 鍔犺浇鐢ㄦ埛绛旈杩涘害锛圙itHub Pages鐗堟湰锛?  const loadUserProgress = async (userId) => {
    // GitHub Pages鐗堟湰锛氫娇鐢ㄦ湰鍦板瓨鍌紝userId鍙负绌?    const targetUserId = userId || (currentUser ? currentUser.phone : null);
    const result = await api.getUserProgress(targetUserId);
    
    if (result.success && result.progress) {
      setAnsweredIds(new Set(result.progress.answeredIds || []));
      setWrongQuestionIds(new Set(result.progress.wrongIds || []));
      console.log('鉁?浠庢湰鍦板瓨鍌ㄥ姞杞借繘搴?', {
        answered: result.progress.answeredIds?.length || 0,
        wrong: result.progress.wrongIds?.length || 0
      });
    } else {
      // 濡傛灉娌℃湁杩涘害鏁版嵁锛屽垵濮嬪寲绌洪泦鍚?      setAnsweredIds(new Set());
      setWrongQuestionIds(new Set());
      console.log('鈩癸笍 鏃犲巻鍙茶繘搴︽暟鎹紝宸插垵濮嬪寲绌洪泦鍚?);
    }
  };

  // 澶嶅埗QQ鍙峰埌鍓创鏉?  const copyQQNumber = () => {
    const qqNumber = '1849619997';
    navigator.clipboard.writeText(qqNumber).then(() => {
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 2000);
    }).catch(() => {
      // 澶囩敤鏂规硶
      const textarea = document.createElement('textarea');
      textarea.value = qqNumber;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 2000);
    });
  };

  // 淇濆瓨鐢ㄦ埛绛旈杩涘害锛圙itHub Pages鐗堟湰锛?  const saveProgressToServer = async (newAnsweredIds, newWrongIds) => {
    // GitHub Pages鐗堟湰锛氭棤璁烘槸鍚︽湁鐧诲綍鐢ㄦ埛閮戒繚瀛樺埌鏈湴瀛樺偍
    const userId = currentUser ? currentUser.phone : null;
    
    try {
      await api.saveUserProgress(
        userId,
        [...newAnsweredIds],
        [...newWrongIds]
      );
      console.log('馃捑 杩涘害宸蹭繚瀛樺埌鏈湴瀛樺偍:', {
        answered: newAnsweredIds.size,
        wrong: newWrongIds.size,
        userId: userId || 'anonymous'
      });
    } catch (error) {
      console.error('淇濆瓨杩涘害澶辫触:', error);
      // 鍗充娇淇濆瓨澶辫触涔熶笉褰卞搷鐢ㄦ埛浣撻獙
    }
  };
  
  // 娉ㄥ唽鍑芥暟
  const handleRegister = async (phone, password, username) => {
    // 妫€鏌ユ槸鍚︿负绠＄悊鍛樿处鍙?    if (phone === ADMIN_ACCOUNT.phone) {
      return { success: false, message: '璇ユ墜鏈哄彿涓虹郴缁熶繚鐣欏彿鐮? };
    }
    
    const displayName = username || `鐢ㄦ埛${phone.slice(-4)}`;
    const avatar = '馃懁';
    
    const result = await api.registerUser(phone, password, displayName, avatar);
    
    if (result.success) {
      // 鑷姩鐧诲綍
      const loginUser = { ...result.user };
      delete loginUser.password;
      setCurrentUser(loginUser);
      localStorage.setItem('iot_current_user', JSON.stringify(loginUser));
      setAppState('welcome');
    }
    
    return result;
  };
  
  // 閫€鍑虹櫥褰?  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('iot_current_user');
    setAppState('welcome');
    setShowUserMenu(false);
  };
  
  // 鏇存柊鐢ㄦ埛淇℃伅
  const handleUpdateProfile = (username, avatar) => {
    if (!currentUser) return;
    
    const updatedUser = { ...currentUser, username, avatar };
    setCurrentUser(updatedUser);
    localStorage.setItem('iot_current_user', JSON.stringify(updatedUser));
    
    // 濡傛灉涓嶆槸绠＄悊鍛橈紝鏇存柊users琛ㄤ腑鐨勬暟鎹?    if (!currentUser.isAdmin) {
      const users = JSON.parse(localStorage.getItem('iot_users') || '[]');
      const userIndex = users.findIndex(u => u.phone === currentUser.phone);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], username, avatar };
        localStorage.setItem('iot_users', JSON.stringify(users));
      }
    }
  };




  // --- 闂數鍒烽 閫昏緫 (鍔ㄧ敾鐗? ---
  const openInstantMode = () => {
    setShowInstantModal(true);
    startRolling();
  };

  const startRolling = () => {
    setIsRolling(true);
    setInstantUserAnswer(null);
    
    let rolls = 0;
    const maxRolls = 15; 
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * MOCK_QUESTION_BANK.length);
      setInstantQuestion(MOCK_QUESTION_BANK[randomIdx]);
      rolls++;
      
      if (rolls >= maxRolls) {
        clearInterval(interval);
        setIsRolling(false);
      }
    }, 60);
  };

  const handleInstantSelect = (optionId) => {
    if (isRolling || instantUserAnswer) return;
    
    setInstantUserAnswer(optionId);
    
    if (instantQuestion) {
      markQuestionAsPracticed(instantQuestion.id);
      const isCorrect = instantQuestion.correctAnswer === optionId;
      updateMistakeNotebook(instantQuestion.id, isCorrect);
    }
  };

  const closeInstantModal = () => {
    setShowInstantModal(false);
    setInstantQuestion(null);
    setInstantUserAnswer(null);
  };

  const showInstantResult = !!instantUserAnswer;

  // --- 鏅€氭ā寮忛€昏緫 ---

  const startQuiz = (mode) => {
    // 濡傛灉鐐瑰嚮鐨勬槸闂數妯″紡锛岀洿鎺ヨ蛋寮圭獥閫昏緫锛屼笉鏀瑰彉 appState
    if (mode === 'instant') {
      openInstantMode();
      return;
    }

    setQuizMode(mode);

    // 閫氱煡鏈嶅姟鍣ㄧ敤鎴峰紑濮嬬瓟棰?    if (currentUser) {
      api.sendWebSocketMessage('STATUS_UPDATE', { 
        userId: currentUser.phone, 
        status: 'answering' 
      });
    }

    if (mode === 'exam') {
      // 妯℃嫙鑰冿細姣忔浠庡ご寮€濮嬶紝娓呴櫎涔嬪墠鐨勮繘搴?      localStorage.removeItem('iot_exam_progress');
      setUserAnswers({});
      setCurrentIndex(0);
      const shuffled = shuffleArray(MOCK_QUESTION_BANK).slice(0, 100);
      setCurrentQuestions(shuffled);
      setTimeLeft(9000); // 150鍒嗛挓 = 9000绉?      setAppState('quiz');
    } else if (mode === 'mistakes') {
      const wrongQuestions = MOCK_QUESTION_BANK.filter(q => wrongQuestionIds.has(q.id));
      if (wrongQuestions.length === 0) {
        alert("澶浜嗭紒浣犲綋鍓嶆病鏈夐敊棰樿褰曘€?);
        return;
      }
      setUserAnswers({});
      setCurrentIndex(0);
      setCurrentQuestions(wrongQuestions);
      setTimeLeft(0);
      setAppState('quiz');
    } else {
      // 椤哄簭缁冧範锛氭鏌ユ槸鍚︽湁淇濆瓨鐨勮繘搴?      const savedProgress = localStorage.getItem('iot_practice_progress');
      if (savedProgress) {
        // 鏈夎繘搴︼紝鏄剧ず寮圭獥璁╃敤鎴烽€夋嫨
        setShowPracticeModal(true);
      } else {
        // 娌℃湁杩涘害锛岀洿鎺ュ紑濮?        startPracticeQuiz(false);
      }
    }
  };

  // 寮€濮嬮『搴忕粌涔狅紙閲嶆柊鎴栫户缁級
  const startPracticeQuiz = (continueFromSaved) => {
    setShowPracticeModal(false);
    
    if (continueFromSaved) {
      // 缁х画绛旈锛氫粠涓婃杩涘害缁х画
      const savedProgress = localStorage.getItem('iot_practice_progress');
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        setCurrentIndex(progress.currentIndex || 0);
        setUserAnswers(progress.userAnswers || {});
      } else {
        setCurrentIndex(0);
        setUserAnswers({});
      }
    } else {
      // 閲嶆柊绛旈锛氭竻闄ゆ湰娆＄粌涔犵殑绛旈璁板綍锛屼絾淇濈暀绱Н鍒烽缁熻
      localStorage.removeItem('iot_practice_progress');
      setCurrentIndex(0);
      setUserAnswers({});
    }
    
    setCurrentQuestions(MOCK_QUESTION_BANK);
    setTimeLeft(0);
    setAppState('quiz');
  };

  // 淇濆瓨椤哄簭缁冧範杩涘害
  const savePracticeProgress = useCallback(() => {
    if (quizMode === 'practice') {
      const progress = {
        currentIndex,
        userAnswers,
        timestamp: Date.now()
      };
      localStorage.setItem('iot_practice_progress', JSON.stringify(progress));
      console.log(`[DEBUG] 淇濆瓨杩涘害: currentIndex=${currentIndex}, 绛旈鏁?${Object.keys(userAnswers).filter(k => !k.includes('_confirmed')).length}`);
    }
  }, [quizMode, currentIndex, userAnswers]);

  // 闃叉姈淇濆瓨杩涘害锛堟竻闄や箣鍓嶇殑瀹氭椂鍣級
  const debouncedSaveProgress = useCallback(() => {
    // 娓呴櫎涔嬪墠鐨勫畾鏃跺櫒
    if (saveProgressTimerRef.current) {
      clearTimeout(saveProgressTimerRef.current);
    }
    // 璁剧疆鏂扮殑瀹氭椂鍣?    saveProgressTimerRef.current = setTimeout(() => {
      savePracticeProgress();
      saveProgressTimerRef.current = null;
    }, 300);
  }, [savePracticeProgress]);

  // 閫€鍑虹瓟棰?  const exitQuiz = () => {
    if (quizMode === 'practice') {
      // 椤哄簭缁冧範锛氫繚瀛樿繘搴?      savePracticeProgress();
    } else if (quizMode === 'exam') {
      // 妯℃嫙鑰冿細娓呴櫎杩涘害
      localStorage.removeItem('iot_exam_progress');
    }
    
    // 閫氱煡鏈嶅姟鍣ㄧ敤鎴风粨鏉熺瓟棰橈紝鎭㈠鍦ㄧ嚎鐘舵€?    if (currentUser) {
      api.sendWebSocketMessage('STATUS_UPDATE', { 
        userId: currentUser.phone, 
        status: 'online' 
      });
    }
    
    setAppState('welcome');
  };

  const handleOptionSelect = (qId, optionId) => {
    console.log(`[DEBUG] 鐐瑰嚮閫夐」: qId=${qId}, optionId=${optionId}, appState=${appState}`);
    if (appState === 'result') return;

    // 浣跨敤currentQuestions鑰屼笉鏄疢OCK_QUESTION_BANK锛岀‘淇濇暟鎹竴鑷?    const currentQ = currentQuestions.find(q => q.id === qId);
    if (!currentQ) {
      console.error(`[ERROR] 鎵句笉鍒伴鐩?qId=${qId}`);
      return;
    }
    console.log(`[DEBUG] 棰樼洰绫诲瀷=${currentQ.type}, 宸茬‘璁?${userAnswers[qId + '_confirmed']}`);
    
    if (currentQ.type === 'multiple') {
      // 澶氶€夐锛氬凡纭鍚庝笉鑳戒慨鏀?      if (userAnswers[qId + '_confirmed']) {
        console.log('[DEBUG] 澶氶€夐宸茬‘璁わ紝闃绘淇敼');
        return;
      }
      
      // 鍒囨崲閫夐」
      setUserAnswers(prev => {
        const current = prev[qId] || [];
        const isArray = Array.isArray(current);
        const currentArray = isArray ? current : [];
        
        const newAnswers = currentArray.includes(optionId)
          ? currentArray.filter(id => id !== optionId)  // 鍙栨秷閫夋嫨
          : [...currentArray, optionId];  // 娣诲姞閫夋嫨
        
        const result = { ...prev, [qId]: newAnswers };
        console.log(`[DEBUG] 澶氶€夐 qId=${qId}, 閫夐」=${optionId}, 褰撳墠宸查€?${newAnswers.join(',')}, 鎬荤瓟棰樻暟=${Object.keys(result).filter(k => !k.includes('_confirmed')).length}`);
        return result;
      });
    } else {
      // 鍗曢€夐锛氶€変簡灏变笉鑳芥敼锛堢粌涔犳ā寮忕珛鍗虫樉绀虹瓟妗堬級
      if (userAnswers[qId]) return;
      setUserAnswers(prev => {
        const newAnswers = { ...prev, [qId]: optionId };
        console.log(`[DEBUG] 鍗曢€夐 qId=${qId}, option=${optionId}, 褰撳墠鎬荤瓟棰樻暟=${Object.keys(newAnswers).filter(k => !k.includes('_confirmed')).length}`);
        return newAnswers;
      });
      
      // 鍗曢€夐绔嬪嵆鍒ゆ柇瀵归敊
      const isCorrect = currentQ.correctAnswer === optionId;
      updateMistakeNotebook(qId, isCorrect);
    }
    
    markQuestionAsPracticed(qId);
  };

  // 澶氶€夐纭绛旀
  const confirmMultipleChoice = (qId) => {
    const currentQ = currentQuestions.find(q => q.id === qId);
    if (!currentQ) {
      console.error(`[ERROR] confirmMultipleChoice: 鎵句笉鍒伴鐩?qId=${qId}`);
      return;
    }
    const userAnswer = userAnswers[qId] || [];
    
    // 鍒ゆ柇绛旀鏄惁姝ｇ‘
    const correctAnswers = currentQ.correctAnswer.split(',').map(a => a.trim()).sort();
    const userAnswersArray = Array.isArray(userAnswer) ? userAnswer.sort() : [];
    const isCorrect = JSON.stringify(correctAnswers) === JSON.stringify(userAnswersArray);
    
    updateMistakeNotebook(qId, isCorrect);
    
    // 鏍囪涓哄凡纭锛堥槻姝㈠啀娆′慨鏀癸級
    setUserAnswers(prev => ({
      ...prev,
      [qId + '_confirmed']: true
    }));
  };

  const submitQuiz = () => {
    setAppState('result');
    
    // 鎻愪氦鏃跺垽鏂墍鏈夊閫夐
    currentQuestions.forEach(q => {
      if (q.type === 'multiple' && !userAnswers[q.id + '_confirmed']) {
        const userAnswer = userAnswers[q.id] || [];
        const correctAnswers = q.correctAnswer.split(',').map(a => a.trim()).sort();
        const userAnswersArray = Array.isArray(userAnswer) ? userAnswer.sort() : [];
        const isCorrect = JSON.stringify(correctAnswers) === JSON.stringify(userAnswersArray);
        updateMistakeNotebook(q.id, isCorrect);
      }
    });
  };

  useEffect(() => {
    let timer;
    if (appState === 'quiz' && quizMode === 'exam' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            submitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [appState, quizMode]);

  const resultStats = useMemo(() => {
    if (appState !== 'result') return { score: 0 };
    let correctCount = 0;
    
    currentQuestions.forEach(q => {
      const userAnswer = userAnswers[q.id];
      let isCorrect = false;
      
      if (q.type === 'multiple') {
        // 澶氶€夐锛氭瘮杈冩暟缁?        const correctAnswers = q.correctAnswer.split(',').map(a => a.trim()).sort();
        const userAnswersArray = Array.isArray(userAnswer) ? userAnswer.sort() : [];
        isCorrect = JSON.stringify(correctAnswers) === JSON.stringify(userAnswersArray);
      } else {
        // 鍗曢€夐锛氱洿鎺ユ瘮杈?        isCorrect = userAnswer === q.correctAnswer;
      }
      
      if (isCorrect) correctCount++;
    });
    
    return {
      score: Math.round((correctCount / currentQuestions.length) * 100),
      correctCount,
      total: currentQuestions.length,
      wrongCount: currentQuestions.length - correctCount
    };
  }, [appState, currentQuestions, userAnswers]);

  // 璁＄畻鐢ㄦ埛缁熻鏁版嵁
  const userStats = useMemo(() => {
    if (!currentUser) return null;
    
    const categoryStats = {};
    MOCK_QUESTION_BANK.forEach(q => {
      if (!categoryStats[q.category]) {
        categoryStats[q.category] = { total: 0, answered: 0, correct: 0 };
      }
      categoryStats[q.category].total++;
      if (answeredIds.has(q.id)) {
        categoryStats[q.category].answered++;
        if (!wrongQuestionIds.has(q.id)) {
          categoryStats[q.category].correct++;
        }
      }
    });
    
    const totalAnswered = answeredIds.size;
    const totalCorrect = Array.from(answeredIds).filter(id => !wrongQuestionIds.has(id)).length;
    const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
    
    return {
      totalQuestions: MOCK_QUESTION_BANK.length,
      totalAnswered,
      totalCorrect,
      totalWrong: wrongQuestionIds.size,
      accuracy,
      categoryStats
    };
  }, [currentUser, answeredIds, wrongQuestionIds]);

  // --- 缁勪欢瑙嗗浘 ---

  const WelcomeView = () => (
    <div className="flex flex-col items-center mt-6 sm:mt-12 text-center space-y-6 sm:space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 px-4">鐗╄仈缃戝畨璋冨湪绾垮埛棰樼郴缁?/h1>
        <p className="text-sm sm:text-base text-slate-500">IoT Installation & Debugging Question Bank</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full max-w-4xl px-3 sm:px-4">
        <button 
          onClick={() => startQuiz('practice')}
          className="group p-4 sm:p-6 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 hover:shadow-lg transition-all text-left flex flex-col h-full active:scale-95"
        >
          <div className="flex items-center justify-between mb-3">
            <Layers className="w-8 h-8 text-indigo-500" />
            <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-2 py-1 rounded">鍩虹</span>
          </div>
          <h3 className="font-bold text-base sm:text-lg text-slate-800">鍏ㄥ簱椤哄簭缁冧範</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 opacity-80">鎸夐『搴忕粌涔犳墍鏈夐鐩紝鏃犳椂闂撮檺鍒躲€?/p>
        </button>

        <button 
          onClick={() => startQuiz('exam')}
          className="group p-4 sm:p-6 bg-white border border-slate-200 rounded-xl hover:border-purple-500 hover:shadow-lg transition-all text-left flex flex-col h-full active:scale-95"
        >
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-8 h-8 text-purple-500" />
            <span className="bg-purple-50 text-purple-600 text-xs font-bold px-2 py-1 rounded">妯¤€?/span>
          </div>
          <h3 className="font-bold text-base sm:text-lg text-slate-800">闄愭椂闅忔満妯¤€?/h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 opacity-80">闅忔満鎶藉彇 100 棰橈紝闄愭椂 150 鍒嗛挓銆?/p>
        </button>

        <button 
          onClick={() => startQuiz('instant')}
          className="group p-4 sm:p-6 bg-orange-50 border border-orange-200 rounded-xl hover:border-orange-500 hover:shadow-lg hover:bg-orange-100 transition-all text-left flex flex-col h-full relative overflow-hidden active:scale-95"
        >
          <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-orange-200 rounded-full opacity-20 group-hover:scale-150 transition-transform" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <Zap className="w-8 h-8 text-orange-500" />
            <span className="bg-orange-200 text-orange-800 text-xs font-bold px-2 py-1 rounded">鎺ㄨ崘</span>
          </div>
          <h3 className="font-bold text-base sm:text-lg text-orange-900 relative z-10">闂數鍒烽</h3>
          <p className="text-xs sm:text-sm text-orange-800 mt-2 opacity-80 relative z-10">闅忔満鎶藉彇锛屽姩鐢诲紑绠憋紝鍗冲埢寮€缁冦€?/p>
        </button>

        <button 
          onClick={() => startQuiz('mistakes')}
          disabled={wrongQuestionIds.size === 0}
          className={`group p-6 border rounded-xl transition-all text-left flex flex-col h-full relative overflow-hidden
            ${wrongQuestionIds.size > 0 
              ? 'bg-red-50 border-red-200 hover:border-red-500 hover:shadow-lg hover:bg-red-100 cursor-pointer' 
              : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'}`}
        >
          <div className="flex items-center justify-between mb-3">
            <AlertTriangle className={`w-8 h-8 ${wrongQuestionIds.size > 0 ? 'text-red-500' : 'text-slate-400'}`} />
            {wrongQuestionIds.size > 0 ? (
                <span className="bg-red-200 text-red-800 text-xs font-bold px-2 py-1 rounded flex items-center">
                    {wrongQuestionIds.size} 棰樺緟娑堢伃
                </span>
            ) : (
                <span className="bg-slate-200 text-slate-500 text-xs font-bold px-2 py-1 rounded">鏆傛棤閿欓</span>
            )}
          </div>
          <h3 className={`font-bold text-lg ${wrongQuestionIds.size > 0 ? 'text-red-900' : 'text-slate-500'}`}>鏅鸿兘閿欓鏈?/h3>
          <p className={`text-sm mt-2 opacity-80 ${wrongQuestionIds.size > 0 ? 'text-red-800' : 'text-slate-500'}`}>
            涓撴敾钖勫急鐐广€傜瓟瀵瑰悗鑷姩绉诲嚭棰樻湰銆?          </p>
        </button>
      </div>
    </div>
  );

  // 绛旈鍗＄粍浠?  const AnswerSheet = ({ questions, userAnswers, currentIndex, onJumpTo }) => {
    return (
      <div className="bg-white rounded-xl shadow-md border border-slate-100 p-4 sticky top-20">
        <h3 className="font-bold text-slate-800 mb-3 flex items-center">
          <span className="text-base">绛旈鍗?/span>
          <span className="ml-2 text-xs text-slate-500">({Object.keys(userAnswers).filter(k => !k.includes('_confirmed')).length}/{questions.length})</span>
        </h3>
        <div className="grid grid-cols-5 gap-2 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
          {questions.map((q, index) => {
            const isAnswered = userAnswers[q.id] !== undefined;
            const isCurrent = index === currentIndex;
            
            // 鍒ゆ柇绛旈鏄惁姝ｇ‘(鍙湪宸茬瓟棰樹笖闈炲綋鍓嶉鏃舵樉绀?
            let isCorrect = false;
            if (isAnswered && !isCurrent) {
              const userAns = userAnswers[q.id];
              if (q.type === 'multiple') {
                // 澶氶€夐:姣旇緝鏁扮粍
                const correctAnswers = q.correctAnswer.split(',').map(a => a.trim()).sort();
                const userAnswersArray = Array.isArray(userAns) ? userAns.sort() : [];
                isCorrect = JSON.stringify(correctAnswers) === JSON.stringify(userAnswersArray);
              } else {
                // 鍗曢€夐:鐩存帴姣旇緝
                isCorrect = userAns === q.correctAnswer;
              }
            }
            
            return (
              <button
                key={q.id}
                onClick={() => onJumpTo(index)}
                className={`w-full aspect-square rounded-lg font-medium text-sm transition-all ${
                  isCurrent
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                    : isAnswered
                    ? (isCorrect ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200')
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const QuizView = () => {
    const currentQ = currentQuestions[currentIndex];
    const progress = ((currentIndex + 1) / currentQuestions.length) * 100;
    const isLastQuestion = currentIndex === currentQuestions.length - 1;
    const userAnswer = userAnswers[currentQ.id];
    const quizContentRef = useRef(null);

    // 鍒囨崲棰樼洰鏃堕噸缃粴鍔ㄤ綅缃?    useEffect(() => {
      if (quizContentRef.current) {
        quizContentRef.current.scrollTop = 0;
      }
    }, [currentIndex]);

    // 閫夋嫨绛旀鍚庯紝鍦ㄧ粌涔犳ā寮忎笅鑷姩婊氬姩鍒拌В鏋愬尯鍩?    useEffect(() => {
      if (userAnswer && (quizMode === 'practice' || quizMode === 'mistakes') && quizContentRef.current) {
        setTimeout(() => {
          quizContentRef.current.scrollTo({
            top: quizContentRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }, 100);
      }
    }, [userAnswer, quizMode]);

    // 璺宠浆鍒版寚瀹氶鐩?    const jumpToQuestion = (index) => {
      setCurrentIndex(index);
      // 璺宠浆棰樼洰鏃朵繚瀛樿繘搴?      if (quizMode === 'practice') {
        debouncedSaveProgress();
      }
    };
    
    return (
      <div className="w-full">
        {/* 杩斿洖鎸夐挳 - 宸︿笂瑙?*/}
        <div className="mb-4">
          <button 
            onClick={exitQuiz}
            className="flex items-center space-x-2 text-slate-600 hover:text-indigo-600 transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">杩斿洖</span>
          </button>
        </div>

        {/* 涓讳綋鍖哄煙锛氶鐩?绛旈鍗?*/}
        <div className="flex gap-6">
          {/* 宸︿晶棰樼洰鍖哄煙 */}
          <div className="flex-1 min-w-0">
            <div className="bg-white shadow-sm rounded-xl p-4 mb-6 flex justify-between items-center sticky top-4 z-10 border border-slate-100">
          {quizMode === 'mistakes' ? (
             <div className="flex items-center text-red-600 font-bold">
               <AlertTriangle className="w-5 h-5 mr-2" /> 閿欓鏀诲潥 ({currentIndex + 1}/{currentQuestions.length})
             </div>
          ) : (
            <div className="flex items-center space-x-4 flex-1">
              <span className="text-slate-500 text-sm font-medium">棰樼洰 {currentIndex + 1} / {currentQuestions.length}</span>
              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }}/>
              </div>
            </div>
          )}
          
          {quizMode === 'exam' && (
            <div className={`flex items-center space-x-2 font-mono text-lg font-bold ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-slate-700'}`}>
              <Clock className="w-5 h-5" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

            <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden flex flex-col relative max-h-[calc(100vh-250px)]">
              {/* 鍙粴鍔ㄥ唴瀹瑰尯鍩?*/}
              <div ref={quizContentRef} className="overflow-y-auto p-6 md:p-8 flex-1">
            <div className="flex items-center justify-between mb-5">
               <div className="flex items-center gap-2">
                 <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                   {currentQ.category}
                 </span>
                 {wrongQuestionIds.has(currentQ.id) && (
                     <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded flex items-center">
                         <AlertTriangle className="w-3 h-3 mr-1"/> 鏇惧仛閿?                     </span>
                 )}
               </div>
               <button 
                 onClick={() => handleFeedback(currentQ)}
                 className="text-slate-400 hover:text-orange-500 transition-colors flex items-center gap-1 text-xs font-medium"
                 title="棰樼洰鏈夎锛熺偣鍑诲弽棣?
               >
                 <Flag className="w-4 h-4" /> 绾犻敊
               </button>
            </div>
            
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-relaxed mb-8">
              {currentQ.type === 'multiple' && (
                <span className="inline-block bg-blue-100 text-blue-700 text-sm font-bold px-3 py-1 rounded-lg mr-3">
                  澶氶€夐
                </span>
              )}
              {currentQ.question}
            </h2>

            <div className="space-y-3">
              {currentQ.options.map((opt) => {
                let containerClass = "border-slate-200 hover:bg-slate-50 text-slate-600";
                let iconClass = "bg-slate-100 text-slate-500";
                
                // 澶氶€夐鍜屽崟閫夐鐨勫垽鏂€昏緫
                const isMultiple = currentQ.type === 'multiple';
                const isConfirmed = userAnswers[currentQ.id + '_confirmed'];
                const correctAnswers = isMultiple ? currentQ.correctAnswer.split(',').map(a => a.trim()) : [currentQ.correctAnswer];
                
                // 鍒ゆ柇褰撳墠閫夐」鏄惁琚€変腑
                const isSelected = isMultiple 
                  ? (Array.isArray(userAnswer) && userAnswer.includes(opt.id))
                  : userAnswer === opt.id;
                
                // 鍒ゆ柇鏄惁鏄剧ず鍙嶉锛堝崟閫夐閫夋嫨鍚庯紝鎴栧閫夐纭鍚庯級
                const showFeedback = isMultiple 
                  ? (isConfirmed && (quizMode === 'practice' || quizMode === 'mistakes'))
                  : (userAnswer && (quizMode === 'practice' || quizMode === 'mistakes'));

                // 濡傛灉鍦ㄧ粌涔犳ā寮忎笅宸查€夋嫨绛旀锛屾樉绀烘纭?閿欒鏍峰紡
                if (showFeedback) {
                  if (correctAnswers.includes(opt.id)) {
                    containerClass = "border-green-500 bg-green-50 text-green-800";
                    iconClass = "bg-green-500 text-white";
                  } else if (isSelected) {
                    containerClass = "border-red-500 bg-red-50 text-red-800";
                    iconClass = "bg-red-500 text-white";
                  } else {
                    containerClass = "opacity-50 border-slate-100";
                  }
                } else if (isSelected) {
                  containerClass = "border-indigo-500 bg-indigo-50 text-indigo-700";
                  iconClass = "bg-indigo-500 text-white";
                }

                return (
                  <button
                    key={opt.id}
                    onClick={(e) => {
                      console.log(`[DEBUG] 鎸夐挳鐐瑰嚮浜嬩欢瑙﹀彂: opt.id=${opt.id}, disabled=${showFeedback}, 棰樺瀷=${currentQ.type}`);
                      e.stopPropagation();
                      handleOptionSelect(currentQ.id, opt.id);
                    }}
                    disabled={showFeedback}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group ${containerClass} ${showFeedback ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4 transition-colors ${iconClass}`}>
                        {opt.id}
                      </span>
                      <span className="font-medium">{opt.text}</span>
                    </div>
                    {/* 鏄剧ず姝ｇ‘/閿欒鍥炬爣 */}
                    {showFeedback && correctAnswers.includes(opt.id) && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {showFeedback && isSelected && !correctAnswers.includes(opt.id) && <XCircle className="w-5 h-5 text-red-600" />}
                    {!showFeedback && isSelected && <CheckCircle className="w-5 h-5 text-indigo-500" />}
                  </button>
                );
              })}
            </div>

            {/* 澶氶€夐纭鎸夐挳 */}
            {currentQ.type === 'multiple' && !userAnswers[currentQ.id + '_confirmed'] && (quizMode === 'practice' || quizMode === 'mistakes') && (
              <div className="mt-4">
                <button
                  onClick={() => confirmMultipleChoice(currentQ.id)}
                  disabled={!userAnswer || (Array.isArray(userAnswer) && userAnswer.length === 0)}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${
                    userAnswer && Array.isArray(userAnswer) && userAnswer.length > 0
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  纭绛旀锛堝凡閫夋嫨 {Array.isArray(userAnswer) ? userAnswer.length : 0} 椤癸級
                </button>
              </div>
            )}

            {/* 缁冧範妯″紡涓嬫樉绀哄嵆鏃惰В鏋?*/}
            {userAnswer && (quizMode === 'practice' || quizMode === 'mistakes') && (
              currentQ.type === 'single' || userAnswers[currentQ.id + '_confirmed']
            ) && (() => {
              // 鍒ゆ柇绛旀鏄惁姝ｇ‘
              let isAnswerCorrect = false;
              if (currentQ.type === 'multiple') {
                const correctAnswers = currentQ.correctAnswer.split(',').map(a => a.trim()).sort();
                const userAnswersArray = Array.isArray(userAnswer) ? userAnswer.sort() : [];
                isAnswerCorrect = JSON.stringify(correctAnswers) === JSON.stringify(userAnswersArray);
              } else {
                isAnswerCorrect = userAnswer === currentQ.correctAnswer;
              }
              
              return (
                <div className={`mt-6 p-4 rounded-xl border-2 animate-in slide-in-from-bottom-2 fade-in ${
                  isAnswerCorrect 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className={`font-bold text-sm mb-2 flex items-center ${
                    isAnswerCorrect ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {isAnswerCorrect ? (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        鍥炵瓟姝ｇ‘锛?                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 mr-2" />
                        鍥炵瓟閿欒锛佹纭瓟妗堟槸锛歿currentQ.correctAnswer}
                      </>
                    )}
                  </div>
                  <div className="text-sm text-slate-700">
                    <span className="font-bold">瑙ｆ瀽锛?/span>
                    {currentQ.explanation}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* 鍥哄畾搴曢儴鎸夐挳鏍?*/}

          <div className="bg-slate-50 p-4 md:p-6 flex justify-between items-center border-t border-slate-100">
              <button
              onClick={() => {
                setCurrentIndex(prev => Math.max(0, prev - 1));
                // 鍒囨崲棰樼洰鏃朵繚瀛樿繘搴?                if (quizMode === 'practice') {
                  debouncedSaveProgress();
                }
              }}
              disabled={currentIndex === 0}
              className="flex items-center px-4 py-2 text-slate-600 disabled:opacity-30 hover:text-indigo-600 font-medium transition-colors"
              >
              <ChevronLeft className="w-5 h-5 mr-1" /> 涓婁竴棰?              </button>

              {isLastQuestion ? (
              <button
                  onClick={submitQuiz}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 rounded-lg shadow-lg shadow-green-200 transition-all transform hover:-translate-y-0.5 font-bold flex items-center"
              >
                  鎻愪氦璇曞嵎 <CheckCircle className="w-5 h-5 ml-2" />
              </button>
              ) : (
              <button
                  onClick={() => {
                    setCurrentIndex(prev => Math.min(currentQuestions.length - 1, prev + 1));
                    // 鍒囨崲棰樼洰鏃朵繚瀛樿繘搴?                    if (quizMode === 'practice') {
                      debouncedSaveProgress();
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 font-bold flex items-center"
              >
                  涓嬩竴棰?<ChevronRight className="w-5 h-5 ml-1" />
              </button>
              )}
            </div>
          </div>
        </div>
        
          {/* 鍙充晶绛旈鍗?- 浠呴『搴忕粌涔犲拰妯℃嫙鑰冩樉绀?*/}
          {(quizMode === 'practice' || quizMode === 'exam') && (
            <div className="w-64 hidden lg:block shrink-0">
              <AnswerSheet 
                questions={currentQuestions}
                userAnswers={userAnswers}
                currentIndex={currentIndex}
                onJumpTo={jumpToQuestion}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const ResultView = () => {
      const { score, correctCount, total, wrongCount } = resultStats;
      return (
        <div className="max-w-4xl mx-auto w-full pb-12">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="bg-slate-800 p-8 text-center text-white">
              <h2 className="text-2xl font-bold mb-2">{quizMode === 'mistakes' ? '閿欓澶嶄範瀹屾垚' : '鑰冭瘯缁撴潫'}</h2>
              <div className="flex justify-center items-center my-6">
                  <div className="text-5xl font-bold text-indigo-400">{score}<span className="text-xl text-slate-400">鍒?/span></div>
              </div>
              {quizMode === 'mistakes' && (<p className="text-indigo-200">绛斿鐨勯鐩凡鑷姩绉诲嚭閿欓鏈?/p>)}
            </div>
            <div className="grid grid-cols-3 border-b border-slate-100 divide-x divide-slate-100">
              <div className="p-4 text-center"><span className="block text-slate-400 text-xs">鎬婚鏁?/span><span className="text-xl font-bold text-slate-800">{total}</span></div>
              <div className="p-4 text-center bg-green-50"><span className="block text-green-600 text-xs">姝ｇ‘</span><span className="text-xl font-bold text-green-700">{correctCount}</span></div>
              <div className="p-4 text-center bg-red-50"><span className="block text-red-600 text-xs">閿欒</span><span className="text-xl font-bold text-red-700">{wrongCount}</span></div>
            </div>
            <div className="p-6 bg-slate-50 flex justify-center">
               <button onClick={() => setAppState('welcome')} className="flex items-center bg-slate-800 text-white px-8 py-3 rounded-full hover:bg-slate-700 transition font-medium">
                <RotateCcw className="w-5 h-5 mr-2" /> 杩斿洖棣栭〉
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
             {currentQuestions.map((q, index) => {
                 const userAns = userAnswers[q.id];
                 
                 // 鍒ゆ柇绛旀鏄惁姝ｇ‘
                 let isCorrect = false;
                 if (q.type === 'multiple') {
                   const correctAnswers = q.correctAnswer.split(',').map(a => a.trim()).sort();
                   const userAnswersArray = Array.isArray(userAns) ? userAns.sort() : [];
                   isCorrect = JSON.stringify(correctAnswers) === JSON.stringify(userAnswersArray);
                 } else {
                   isCorrect = userAns === q.correctAnswer;
                 }
                 
                 // 鏍煎紡鍖栫敤鎴风瓟妗堟樉绀?                 const userAnsDisplay = Array.isArray(userAns) ? userAns.join(', ') : (userAns || '鏈€?);
                 
                 return (
                     <div key={q.id} className={`bg-white rounded-xl p-6 shadow-sm border-l-4 ${isCorrect ? 'border-green-500' : 'border-red-500'}`}>
                        <div className="flex justify-between mb-2">
                            <span className="font-bold text-slate-800">
                              #{index+1} 
                              {q.type === 'multiple' && <span className="text-blue-600 text-xs ml-2">[澶氶€塢</span>}
                              {' '}{q.question}
                            </span>
                            {isCorrect ? <span className="text-green-600 text-sm font-bold">鉁?姝ｇ‘</span> : <span className="text-red-600 text-sm font-bold">鉁?閿欒</span>}
                        </div>
                        <div className="text-sm text-slate-500 mb-2">
                          浣犵殑绛旀: <span className="font-medium">{userAnsDisplay}</span> | 
                          姝ｇ‘绛旀: <span className="font-medium">{q.correctAnswer}</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded text-sm text-slate-600 flex justify-between items-start">
                          <div>{q.explanation}</div>
                          <button onClick={() => handleFeedback(q)} className="ml-4 text-slate-400 hover:text-orange-500 transition-colors"><Flag className="w-4 h-4" /></button>
                        </div>
                     </div>
                 )
             })}
          </div>
        </div>
      )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-full mx-auto px-2 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
          {/* 宸︿晶鍖哄煙 */}
          <div className="flex items-center gap-4 md:gap-6">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setAppState('welcome')}>
              <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="font-bold text-base sm:text-xl tracking-tight text-slate-800 whitespace-nowrap">IoT Master</span>
            </div>
            
            {/* 鍊掕鏃?*/}
            <ExamCountdown />
          </div>
          
          {/* 鍙充晶鍖哄煙 */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:flex items-center bg-slate-100 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 border border-slate-200">
                <BarChart3 className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                <span className="whitespace-nowrap">绱鍒烽: <span className="text-indigo-600 font-bold">{answeredIds.size}</span> / {MOCK_QUESTION_BANK.length}</span>
            </div>

            {/* 瀵煎嚭鎸夐挳 */}
            <ExportMenu MOCK_QUESTION_BANK={MOCK_QUESTION_BANK} />

            {/* 鎰忚鍙嶉 */}
            <FeedbackButton currentUser={currentUser} />

            {/* 娑堟伅閫氱煡 */}
            <NotificationMenu currentUser={currentUser} />

            {/* 鐢ㄦ埛鑿滃崟 */}
            {currentUser ? (
              <UserMenu 
                currentUser={currentUser} 
                onProfile={() => setAppState('profile')}
                onAdmin={() => setAppState('admin')}
                onLogout={handleLogout}
              />
            ) : (
              <button
                onClick={() => setAppState('login')}
                className="flex items-center space-x-1 sm:space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-all"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">鐧诲綍 / 娉ㄥ唽</span>
                <span className="sm:hidden">鐧诲綍</span>
              </button>
            )}

            {appState === 'quiz' && (
                <button onClick={exitQuiz} className="text-sm text-slate-500 hover:text-red-600 font-medium transition-colors whitespace-nowrap">
                閫€鍑?                </button>
            )}
          </div>
        </div>
      </header>

      {/* 鍏ㄥ眬鍏憡 */}
      <AnnouncementBanner />

      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {appState === 'welcome' && <WelcomeView />}
        {appState === 'quiz' && <QuizView />}
        {appState === 'result' && <ResultView />}
        {appState === 'login' && <LoginView handleLogin={handleLogin} handleRegister={handleRegister} setAppState={setAppState} />}
        {appState === 'profile' && <ProfileView currentUser={currentUser} userStats={userStats} handleUpdateProfile={handleUpdateProfile} setAppState={setAppState} />}
        {appState === 'admin' && <AdminPanel setAppState={setAppState} MOCK_QUESTION_BANK={MOCK_QUESTION_BANK} answeredIds={answeredIds} wrongQuestionIds={wrongQuestionIds} />}
      </main>
      
      <a 
        href="https://github.com/Awfp1314"
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-16 sm:bottom-4 left-2 sm:left-4 z-50 flex items-center space-x-2 bg-white/90 backdrop-blur border border-slate-200 px-2 sm:px-3 py-1.5 rounded-full shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group"
      >
        <Github className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 transition-colors" />
        <span className="text-xs font-medium text-slate-500 group-hover:text-indigo-600 transition-colors hidden sm:inline">GitHub Project</span>
      </a>

      <button 
        onClick={copyQQNumber}
        className="fixed bottom-16 sm:bottom-4 right-2 sm:right-4 z-50 flex items-center space-x-2 bg-white/90 backdrop-blur border border-slate-200 px-2 sm:px-3 py-1.5 rounded-full shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group cursor-pointer"
      >
        <Mail className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 transition-colors" />
        <span className="text-xs font-medium text-slate-500 group-hover:text-indigo-600 transition-colors hidden sm:inline">鑱旂郴浣滆€?/span>
      </button>

      {/* 澶嶅埗鎴愬姛鎻愮ず */}
      {showCopyToast && (
        <div className="fixed bottom-32 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-in slide-in-from-bottom-5 fade-in">
          鉁?宸插鍒禥Q锛?849619997
        </div>
      )}

      {showInstantModal && instantQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 flex justify-between items-center text-white shrink-0">
                <div className="flex items-center space-x-2">
                <Zap className={`w-6 h-6 ${isRolling ? 'animate-pulse' : ''}`} />
                <span className="font-bold text-lg">闂數鍒烽</span>
                </div>
                <button onClick={closeInstantModal} className="text-white/80 hover:text-white transition-colors bg-white/10 rounded-full p-1">
                <X className="w-5 h-5" />
                </button>
            </div>

            <div ref={modalContentRef} className="p-6 overflow-y-auto">
                {isRolling ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
                    <div className="relative">
                    <Sparkles className="w-16 h-16 text-orange-500 animate-spin-slow" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Shuffle className="w-8 h-8 text-orange-600 animate-bounce" />
                    </div>
                    </div>
                    <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-700">姝ｅ湪鎶藉彇棰樼洰...</h3>
                    <p className="text-slate-400 text-sm font-mono">{instantQuestion.category}</p>
                    <p className="text-slate-300 text-xs">闅忔満棰樺簱缂栧彿 #{instantQuestion.id}</p>
                    </div>
                </div>
                ) : (
                <>
                    <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">{instantQuestion.category}</span>
                        {wrongQuestionIds.has(instantQuestion.id) && (
                        <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded flex items-center"><AlertTriangle className="w-3 h-3 mr-1"/> 鏇惧仛閿?/span>
                        )}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 leading-relaxed">{instantQuestion.question}</h3>
                    </div>

                    <div className="space-y-3 mb-6">
                    {instantQuestion.options.map((opt) => {
                        let containerClass = "border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer";
                        let iconClass = "bg-slate-100 text-slate-500";

                        if (showInstantResult) {
                        if (opt.id === instantQuestion.correctAnswer) {
                            containerClass = "bg-green-50 border-green-500 text-green-800";
                            iconClass = "bg-green-500 text-white";
                        } else if (instantUserAnswer === opt.id) {
                            containerClass = "bg-red-50 border-red-500 text-red-800";
                            iconClass = "bg-red-500 text-white";
                        } else {
                            containerClass = "opacity-40 border-slate-100 cursor-default";
                        }
                        } else {
                        containerClass += " hover:border-orange-400 hover:bg-orange-50";
                        }

                        return (
                        <div
                            key={opt.id}
                            onClick={() => handleInstantSelect(opt.id)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group ${containerClass}`}
                        >
                            <div className="flex items-center">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4 transition-colors ${iconClass}`}>
                                {opt.id}
                            </span>
                            <span className="font-medium">{opt.text}</span>
                            </div>
                            {showInstantResult && opt.id === instantQuestion.correctAnswer && <CheckCircle className="w-5 h-5 text-green-600" />}
                            {showInstantResult && instantUserAnswer === opt.id && instantUserAnswer !== instantQuestion.correctAnswer && <XCircle className="w-5 h-5 text-red-600" />}
                        </div>
                        );
                    })}
                    </div>

                    {showInstantResult && (
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 animate-in slide-in-from-bottom-2 fade-in">
                        <div className={`font-bold mb-1 flex items-center ${instantUserAnswer === instantQuestion.correctAnswer ? 'text-green-600' : 'text-red-600'}`}>
                            {instantUserAnswer === instantQuestion.correctAnswer ? '鍥炵瓟姝ｇ‘锛? : '鍥炵瓟閿欒'}
                        </div>
                        <div className="text-slate-600 text-sm">
                        <span className="font-bold text-slate-800">瑙ｆ瀽锛?/span>
                        {instantQuestion.explanation}
                        </div>
                    </div>
                    )}
                </>
                )}
            </div>

            {!isRolling && showInstantResult && (
                <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end shrink-0">
                <button 
                    onClick={startRolling}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg shadow-md font-bold flex items-center transition-transform transform active:scale-95"
                >
                    <RotateCcw className="w-4 h-4 mr-2" /> 鍐嶆娊涓€棰?                </button>
                </div>
            )}
            </div>
        </div>
      )}

      {/* 绾犻敊寮圭獥 */}
      {showErrorModal && errorQuestion && (
        <ErrorReportModal
          question={errorQuestion}
          currentUser={currentUser}
          onClose={() => {
            setShowErrorModal(false);
            setErrorQuestion(null);
          }}
        />
      )}

      {/* 椤哄簭缁冧範閫夋嫨寮圭獥 */}
      {showPracticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-6 rounded-t-2xl">
              <div className="flex items-center space-x-3 text-white">
                <BookOpen className="w-8 h-8" />
                <h3 className="text-2xl font-bold">椤哄簭缁冧範</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-slate-600 leading-relaxed mb-6">
                妫€娴嬪埌涓婃鏈畬鎴愮殑绛旈杩涘害锛屾槸鍚︾户缁瓟棰橈紵
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => startPracticeQuiz(true)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-lg transition-all flex items-center justify-center space-x-2"
                >
                  <span>馃摎 缁х画绛旈</span>
                </button>
                <button
                  onClick={() => startPracticeQuiz(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-3 rounded-lg transition-all flex items-center justify-center space-x-2"
                >
                  <span>馃攧 閲嶆柊寮€濮?/span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 鍏ㄥ眬璀﹀憡寮圭獥 */}
      {globalWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 rounded-t-2xl">
              <div className="flex items-center space-x-3 text-white">
                <AlertTriangle className="w-8 h-8" />
                <h3 className="text-2xl font-bold">绯荤粺璀﹀憡</h3>
              </div>
            </div>
            <div className="p-6">
              <h4 className="text-xl font-bold text-slate-800 mb-3">{globalWarning.title}</h4>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{globalWarning.message}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-b-2xl flex justify-end">
              <button
                onClick={() => setGlobalWarning(null)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-lg transition-all"
              >
                鎴戠煡閬撲簡
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FileCode(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="m10 13-2 2 2 2" />
      <path d="m14 17 2-2-2-2" />
    </svg>
  )
}

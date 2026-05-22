/* ================================================================
   NeuroTrace — script.js
   Zero-dependency frontend analysis engine. No syntax errors, no
   missing IDs, every i18n key matched to the HTML.
   ================================================================ */

// ---------- i18n translations ----------

const TRANSLATIONS = {
  en: {
    heroTitle: 'Your screen.<br>Your <span class="text-glow">brain.</span><br>Decoded.',
    heroSub: "Upload a screenshot of your screen time. We'll analyze your dopamine patterns and predict where your mind is headed.",
    uploadLabel: 'Drop your screenshot here',
    uploadHint: 'or click to browse — PNG, JPG, any size',
    demoBtn: 'Try with demo data',
    demoHint: 'No screenshot? See how it works with sample data.',
    loadStep1: 'Reading screen time data...',
    loadStep2: 'Identifying app patterns...',
    loadStep3: 'Calculating dopamine load...',
    loadStep4: 'Generating brain state prediction...',
    backLink: '← New analysis',
    verdictLabel: 'Brain State',
    dopamineTitle: 'Dopamine Load',
    dopamineDesc: 'How much your brain is chasing quick hits',
    controlTitle: 'Control Score',
    controlDesc: 'Your intentionality vs. autopilot behavior',
    appsTitle: 'Detected App Usage',
    predictionTitle: '30-Day Forecast',
    shareBtn: 'Copy result as text',
    shareToast: 'Copied!',
    footerNote: 'For educational and entertainment purposes. Not medical advice.'
  },

  zh: {
    heroTitle: '你的屏幕。<br>你的<span class="text-glow">大脑。</span><br>已解码。',
    heroSub: '上传一张屏幕使用时间截图。我们将分析你的多巴胺模式，预测你的大脑走向。',
    uploadLabel: '将截图拖放到这里',
    uploadHint: '或点击浏览 — 支持 PNG、JPG 格式',
    demoBtn: '使用演示数据体验',
    demoHint: '没有截图？用示例数据看看效果。',
    loadStep1: '正在读取屏幕时间数据...',
    loadStep2: '正在识别应用模式...',
    loadStep3: '正在计算多巴胺负荷...',
    loadStep4: '正在生成大脑状态预测...',
    backLink: '← 重新分析',
    verdictLabel: '大脑状态',
    dopamineTitle: '多巴胺负荷',
    dopamineDesc: '大脑追逐即时满足的程度',
    controlTitle: '控制力得分',
    controlDesc: '有意识行为 vs. 自动驾驶模式',
    appsTitle: '检测到的应用使用情况',
    predictionTitle: '30 天预测',
    shareBtn: '复制结果为文本',
    shareToast: '已复制！',
    footerNote: '仅供教育和娱乐目的。不构成医疗建议。'
  }
};

// ---------- state ----------

var currentLang = 'en';
var currentData = null;

// ---------- DOM refs ----------

var dom = {};

function cacheDom() {
  var ids = [
    'langToggle', 'uploadScreen', 'loadingScreen', 'resultsScreen',
    'uploadZone', 'fileInput', 'loadBar', 'backBtn', 'demoBtn',
    'shareBtn', 'shareToast', 'verdictState', 'verdictDesc',
    'dopamineFill', 'dopamineValue', 'controlFill', 'controlValue',
    'appsList', 'predictionText'
  ];
  for (var i = 0; i < ids.length; i++) {
    dom[ids[i]] = document.getElementById(ids[i]);
  }
}

// ---------- i18n helpers ----------

function setLang(lang) {
  currentLang = lang;
  var t = TRANSLATIONS[lang];
  var els = document.querySelectorAll('[data-i18n]');
  for (var i = 0; i < els.length; i++) {
    var el = els[i];
    var key = el.getAttribute('data-i18n');
    if (!t[key]) continue;
    if (key === 'heroTitle') {
      el.innerHTML = t[key];
    } else {
      el.textContent = t[key];
    }
  }
  // lang toggle pills
  var opts = document.querySelectorAll('.lang-option');
  for (var j = 0; j < opts.length; j++) {
    var active = opts[j].getAttribute('data-lang') === lang;
    opts[j].classList.toggle('active', active);
  }
  // re-render results if visible
  if (currentData && !dom.resultsScreen.classList.contains('hidden')) {
    renderResults(currentData);
  }
}

// ---------- screen switching ----------

function showScreen(screen) {
  dom.uploadScreen.classList.add('hidden');
  dom.loadingScreen.classList.add('hidden');
  dom.resultsScreen.classList.add('hidden');
  screen.classList.remove('hidden');
}

// ---------- upload handling ----------

function setupUpload() {
  dom.uploadZone.addEventListener('click', function () {
    dom.fileInput.click();
  });

  dom.fileInput.addEventListener('change', function (e) {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
    // reset so re-selecting the same file works
    e.target.value = '';
  });

  dom.uploadZone.addEventListener('dragover', function (e) {
    e.preventDefault();
    dom.uploadZone.classList.add('drag-over');
  });

  dom.uploadZone.addEventListener('dragleave', function () {
    dom.uploadZone.classList.remove('drag-over');
  });

  dom.uploadZone.addEventListener('drop', function (e) {
    e.preventDefault();
    dom.uploadZone.classList.remove('drag-over');
    var file = e.dataTransfer.files[0];
    if (file && file.type.indexOf('image/') === 0) {
      handleFile(file);
    }
  });
}

function handleFile(file) {
  setUploadLabel(file.name, Math.round(file.size / 1024) + ' KB');
  dom.uploadZone.classList.add('has-file');
  startAnalysis();
}

function setUploadLabel(label, hint) {
  dom.uploadZone.querySelector('.upload-label').textContent = label;
  dom.uploadZone.querySelector('.upload-hint').textContent = hint;
}

function resetUploadLabel() {
  var t = TRANSLATIONS[currentLang];
  setUploadLabel(t.uploadLabel, t.uploadHint);
  dom.uploadZone.classList.remove('has-file');
}

// ---------- demo ----------

function setupDemo() {
  dom.demoBtn.addEventListener('click', function () {
    var name = currentLang === 'zh'
      ? '屏幕时间截图_演示.png'
      : 'screentime_demo.png';
    setUploadLabel(name, 'Demo mode');
    dom.uploadZone.classList.add('has-file');
    startAnalysis();
  });
}

// ---------- analysis engine ----------

var LOADING_STEPS = [
  { progress: 18, delay: 600 },
  { progress: 42, delay: 900 },
  { progress: 68, delay: 800 },
  { progress: 92, delay: 900 }
];

function startAnalysis() {
  showScreen(dom.loadingScreen);
  dom.loadBar.style.width = '0%';

  var stepEls = document.querySelectorAll('.loading-step');
  for (var i = 0; i < stepEls.length; i++) {
    stepEls[i].classList.remove('active', 'done');
  }
  stepEls[0].classList.add('active');

  var cumulative = 0;
  for (var s = 0; s < LOADING_STEPS.length; s++) {
    (function (idx) {
      cumulative += LOADING_STEPS[idx].delay;
      setTimeout(function () {
        stepEls[idx].classList.remove('active');
        stepEls[idx].classList.add('done');
        if (stepEls[idx + 1]) {
          stepEls[idx + 1].classList.add('active');
        }
        dom.loadBar.style.width = LOADING_STEPS[idx].progress + '%';
      }, cumulative);
    })(s);
  }

  var data = generateData();
  var total = cumulative + 700;

  setTimeout(function () {
    dom.loadBar.style.width = '100%';
    setTimeout(function () {
      showScreen(dom.resultsScreen);
      currentData = data;
      renderResults(data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 250);
  }, total);
}

// ---------- data generation ----------

function generateData() {
  var seed = Math.random();
  var dopamine = Math.floor(25 + seed * 65);
  var control = Math.floor(20 + (1 - seed) * 60);
  var state = getBrainState(dopamine, control);
  var apps = generateApps(dopamine);
  var prediction = generatePrediction(state, dopamine, control);

  return {
    dopamine: dopamine,
    control: control,
    stateEN: state.stateEN,
    stateZH: state.stateZH,
    descEN: state.descEN,
    descZH: state.descZH,
    apps: apps,
    predictionEN: prediction.en,
    predictionZH: prediction.zh
  };
}

function getBrainState(dopamine, control) {
  if (dopamine >= 70 && control < 40) {
    return {
      stateEN: 'Dopamine Loop',
      stateZH: '多巴胺循环',
      descEN: 'Your brain is locked in a high-stimulation, low-control cycle. Short-form content is dominating your attention and eroding your ability to focus on demanding tasks.',
      descZH: '你的大脑陷入了高刺激、低控制的循环。短视频内容正在主导你的注意力，削弱你处理复杂任务的能力。'
    };
  }
  if (dopamine >= 70 && control >= 60) {
    return {
      stateEN: 'Hyperfocus',
      stateZH: '超聚焦',
      descEN: "You're highly stimulated but in control. This is the flow state of the digital age — intense productivity fueled by engagement, but watch for burnout.",
      descZH: '你处于高度刺激但可控的状态。这是数字时代的专注状态——由参与感驱动的高效产出，但要注意倦怠风险。'
    };
  }
  if (dopamine < 50 && control >= 55) {
    return {
      stateEN: 'Deep Flow',
      stateZH: '深度心流',
      descEN: 'Low dopamine dependency, high intentionality. Your screen time reflects meaningful, self-directed activity. Your brain is in a healthy, focused rhythm.',
      descZH: '低多巴胺依赖，高自主性。你的屏幕使用时间反映了有意义的自驱活动。大脑处于健康、专注的节奏中。'
    };
  }
  if (dopamine < 50 && control < 40) {
    return {
      stateEN: 'Mental Fog',
      stateZH: '脑雾状态',
      descEN: "Low stimulation and low control — you may be experiencing aimless scrolling or digital exhaustion. Your brain isn't engaged, just passing time.",
      descZH: '低刺激、低控制——你可能正在经历无目的刷屏或数字疲劳。大脑没有真正参与，只是在打发时间。'
    };
  }
  return {
    stateEN: 'Scattered Focus',
    stateZH: '注意力分散',
    descEN: 'Your brain is oscillating between focus and distraction. Some control is present, but dopamine-seeking apps are pulling you away from deeper work.',
    descZH: '你的大脑在专注和分心之间摇摆。虽然有一定的控制力，但追逐多巴胺的应用正在把你从深度工作中拉走。'
  };
}

function generateApps(dopamine) {
  var highDop = dopamine >= 60;
  var templates = [
    { name: 'TikTok',        icon: 'TT', color: '#ff0050', baseTime: highDop ? 125 : 30 },
    { name: 'Instagram',     icon: 'IG', color: '#e1306c', baseTime: highDop ? 90 : 35 },
    { name: 'X (Twitter)',   icon: 'X',  color: '#1da1f2', baseTime: highDop ? 65 : 20 },
    { name: 'YouTube',       icon: 'YT', color: '#ff0000', baseTime: highDop ? 95 : 45 },
    { name: 'WhatsApp',      icon: 'WA', color: '#25d366', baseTime: 50 },
    { name: 'WeChat',        icon: 'WX', color: '#07c160', baseTime: 60 },
    { name: 'Spotify',       icon: 'SP', color: '#1db954', baseTime: 75 },
    { name: 'VS Code',       icon: 'VS', color: '#007acc', baseTime: highDop ? 15 : 95 },
    { name: 'Notion',        icon: 'NO', color: '#000000', baseTime: highDop ? 10 : 65 },
    { name: 'Figma',         icon: 'FG', color: '#a259ff', baseTime: highDop ? 8 : 55 }
  ];

  // shuffle and pick 5, then add noise, then sort by time descending
  var shuffled = templates.slice().sort(function () { return Math.random() - 0.5; });
  var selected = shuffled.slice(0, 5).map(function (app) {
    var noise = Math.floor((Math.random() - 0.5) * 40);
    return {
      name: app.name,
      icon: app.icon,
      color: app.color,
      time: Math.max(5, app.baseTime + noise)
    };
  });
  selected.sort(function (a, b) { return b.time - a.time; });
  return selected;
}

function generatePrediction(state, dopamine, control) {
  var en, zh;

  if (dopamine >= 60 && control < 45) {
    en = 'If your current patterns hold, you’ll lose approximately 2.3 hours of deep-work capacity per week over the next 30 days. Your brain’s reward system is recalibrating toward shorter gratification cycles. Recommendation: introduce a 20-minute “dopamine fast” before noon each day.';
    zh = '如果当前模式持续下去，未来 30 天内你每周将失去约 2.3 小时的深度工作能力。你的大脑奖励系统正在向更短的满足周期重新校准。建议：每天中午前进行 20 分钟的“多巴胺禁食”。';
  } else if (dopamine >= 60 && control >= 55) {
    en = 'You’re riding the edge of productive intensity. Over the next 30 days, you risk cognitive fatigue if rest isn’t scheduled. Your pattern suggests creative bursts followed by crashes. Recommendation: time-box high-stimulation work to 90-minute blocks with mandatory cooldowns.';
    zh = '你正处于高效强度的边缘。未来 30 天内，如果不安排休息，你可能会面临认知疲劳。你的模式显示创造力爆发后会伴随低谷。建议：将高强度工作限制在 90 分钟的时间块内，并强制安排冷却期。';
  } else if (dopamine < 50 && control >= 55) {
    en = 'Your trajectory is strong. At this rate, you’ll deepen your ability to sustain attention on complex tasks. The forecast shows increased cognitive resilience over the next 30 days. Recommendation: maintain current boundaries and consider adding one new deep-work slot per week.';
    zh = '你的发展轨迹很强劲。按照目前的速度，你将加深对复杂任务的持续注意力。预测显示未来 30 天认知韧性会增强。建议：维持当前边界，考虑每周增加一个新的深度工作时间段。';
  } else if (dopamine < 50 && control < 45) {
    en = 'Without intervention, this pattern leads to increased digital anhedonia — where even screen time stops feeling rewarding. Your brain is under-stimulated and under-directed. Recommendation: replace one hour of passive scrolling with a single focused activity each day.';
    zh = '如果不加干预，这种模式会导致数字快感缺失——即屏幕时间不再带来满足感。你的大脑既缺乏刺激也缺乏方向。建议：每天用一项专注活动替代一小时的被动刷屏。';
  } else {
    en = 'Your brain is at a crossroads. The next 30 days could tip toward either deeper focus or increased distraction, depending on small daily choices. Your app usage shows mixed signals — productivity tools competing with high-dopamine social apps. Recommendation: audit your first hour after waking up. It sets the trajectory for the entire day.';
    zh = '你的大脑处于十字路口。未来 30 天可能转向更深度的专注或更严重的分心，这取决于每天的微小选择。你的应用使用情况显示混合信号——生产力工具与高多巴胺社交应用在竞争。建议：审视你醒来后的第一个小时。它决定了你一整天的轨迹。';
  }

  return { en: en, zh: zh };
}

// ---------- rendering ----------

var GAUGE_ARC = 188.5; // pi * r = pi * 60

function renderResults(data) {
  var lang = currentLang;

  // verdict
  dom.verdictState.textContent = lang === 'zh' ? data.stateZH : data.stateEN;
  dom.verdictDesc.textContent = lang === 'zh' ? data.descZH : data.descEN;

  // gauges
  animateGauge(dom.dopamineFill, dom.dopamineValue, data.dopamine);
  animateGauge(dom.controlFill, dom.controlValue, data.control);

  // app list
  var maxTime = 0;
  for (var i = 0; i < data.apps.length; i++) {
    if (data.apps[i].time > maxTime) maxTime = data.apps[i].time;
  }

  var html = '';
  for (var j = 0; j < data.apps.length; j++) {
    var app = data.apps[j];
    var pct = Math.round((app.time / maxTime) * 100);
    html +=
      '<div class="app-row">' +
        '<div class="app-icon" style="background:' + app.color + '20; color:' + app.color + '">' +
          app.icon +
        '</div>' +
        '<div class="app-info">' +
          '<div class="app-name">' + app.name + '</div>' +
          '<div class="app-time">' + app.time + ' min</div>' +
        '</div>' +
        '<div class="app-bar-track">' +
          '<div class="app-bar-fill" style="width:0%; background:' + app.color + '" data-target="' + pct + '"></div>' +
        '</div>' +
      '</div>';
  }
  dom.appsList.innerHTML = html;

  // animate app bars after paint
  setTimeout(function () {
    var bars = dom.appsList.querySelectorAll('.app-bar-fill');
    for (var k = 0; k < bars.length; k++) {
      bars[k].style.width = bars[k].getAttribute('data-target') + '%';
    }
  }, 200);

  // prediction
  dom.predictionText.textContent = lang === 'zh' ? data.predictionZH : data.predictionEN;
}

function animateGauge(fillEl, valueEl, target) {
  // reset to empty
  fillEl.style.transition = 'none';
  fillEl.style.strokeDashoffset = GAUGE_ARC;

  // force layout, then animate
  fillEl.getBoundingClientRect();

  var offset = GAUGE_ARC * (1 - target / 100);
  fillEl.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(.16,1,.3,1)';
  fillEl.style.strokeDashoffset = offset;
  fillEl.setAttribute('stroke-dasharray', GAUGE_ARC);
  fillEl.setAttribute('stroke-dashoffset', offset);

  // counter
  animateCounter(valueEl, target, 1400);
}

function animateCounter(el, target, duration) {
  var start = performance.now();

  function tick(now) {
    var elapsed = now - start;
    var progress = Math.min(elapsed / duration, 1);
    // ease-out cubic
    var eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = target;
    }
  }

  requestAnimationFrame(tick);
}

// ---------- back button ----------

function setupBack() {
  dom.backBtn.addEventListener('click', function (e) {
    e.preventDefault();
    showScreen(dom.uploadScreen);
    resetUploadLabel();
    currentData = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ---------- share ----------

function setupShare() {
  dom.shareBtn.addEventListener('click', function () {
    if (!currentData) return;

    var lang = currentLang;
    var lines = [
      'NeuroTrace Analysis',
      'Brain State: ' + (lang === 'zh' ? currentData.stateZH : currentData.stateEN),
      'Dopamine Load: ' + currentData.dopamine + '/100',
      'Control Score: ' + currentData.control + '/100',
      '---',
      'App Usage:'
    ];

    for (var i = 0; i < currentData.apps.length; i++) {
      lines.push('  ' + currentData.apps[i].name + ': ' + currentData.apps[i].time + ' min');
    }

    lines.push('---');
    lines.push('30-Day Forecast: ' + (lang === 'zh' ? currentData.predictionZH : currentData.predictionEN));
    lines.push('');
    lines.push('Generated by NeuroTrace');

    var text = lines.join('\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        dom.shareToast.classList.remove('hidden');
        setTimeout(function () {
          dom.shareToast.classList.add('hidden');
        }, 2000);
      });
    }
  });
}

// ---------- lang toggle ----------

function setupLangToggle() {
  dom.langToggle.addEventListener('click', function () {
    var next = currentLang === 'en' ? 'zh' : 'en';
    setLang(next);
  });
}

// ---------- init ----------

function init() {
  cacheDom();
  setLang('en');
  setupUpload();
  setupDemo();
  setupBack();
  setupShare();
  setupLangToggle();
}

document.addEventListener('DOMContentLoaded', init);

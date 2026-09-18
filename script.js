/* script.js - final full implementation
   - Signup first
   - Dark-mode contrast fixes
   - Domain choose page stylish
   - Roadmaps with 10+ topics for AI/ML, Data Science, Cybersecurity
   - Multiple open accordions
   - Subtopic modal: 10-line brief + YouTube-only links
   - Local progress, notes, certified course links
   - Quiz, notes save, choose domain
*/

/* ---------- Page refs ---------- */
/* ---------- Page refs ---------- */
const PAGES = {
  signup: document.getElementById('page-signup'),
  landing: document.getElementById('page-landing'),
  search: document.getElementById('page-search'),
  choose: document.getElementById('page-choose'),
  coding: document.getElementById('page-coding'), // <-- ADDED: enable showPage('coding')
  roadmap: document.getElementById('page-roadmap'),
  about: document.getElementById('page-about'),
  help: document.getElementById('page-help'),

};


/* show page helper (SPA) */
function showPage(key){
  Object.values(PAGES).forEach(p => p && p.classList.add('hidden'));
  Object.values(PAGES).forEach(p => p && p.classList.remove('active'));
  const target = PAGES[key];
  if(!target) return;
  target.classList.remove('hidden');
  requestAnimationFrame(()=> target.classList.add('active'));
  window.scrollTo({top:0, behavior:'smooth'});
}

/* initialize: always show signup first */
showPage('signup');

/* year */
document.getElementById('year').textContent = new Date().getFullYear();

/* Theme toggle: ensure text contrast in dark */
const btnTheme = document.getElementById('btn-theme');
let dark = false;
btnTheme.addEventListener('click', ()=>{
  dark = !dark;
  document.body.classList.toggle('dark', dark);
  btnTheme.textContent = dark ? '☀️' : '🌙';
});

/* Navigation links */
document.querySelectorAll('[data-nav]').forEach(a => a.addEventListener('click', e =>{
  e.preventDefault();
  const nav = a.dataset.nav;
  showPage(nav);
}));

/* Signup flow */
const signupForm = document.getElementById('signup-form');
const signupSuccess = document.getElementById('signup-success');
const skipSignupBtn = document.getElementById('skip-signup');
signupForm?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const id = document.getElementById('input-id').value.trim();
  const pw = document.getElementById('input-password').value.trim();
  const remember = document.getElementById('remember').checked;
  if(id.length < 3){ alert('Username must be >= 3 chars'); return; }
  if(pw.length < 6){ alert('Password must be >= 6 chars'); return; }
  if(remember) localStorage.setItem('cse_user', JSON.stringify({id, created: Date.now()}));
  signupSuccess.classList.remove('hidden');
  setTimeout(()=>{ signupSuccess.classList.add('hidden'); showPage('landing'); }, 900);
});
skipSignupBtn?.addEventListener('click', ()=> showPage('landing'));

/* Quick notes save */
document.getElementById('save-notes')?.addEventListener('click', ()=>{
  const v = document.getElementById('quick-notes').value || '';
  localStorage.setItem('cse_notes', v);
  alert('Notes saved locally.');
});
document.getElementById('clear-notes')?.addEventListener('click', ()=>{
  document.getElementById('quick-notes').value = '';
  localStorage.removeItem('cse_notes');
});

/* restore notes if any */
document.getElementById('quick-notes').value = localStorage.getItem('cse_notes') || '';

/* navigation buttons from landing */
document.getElementById('btn-to-search')?.addEventListener('click', ()=> showPage('search'));
document.getElementById('btn-preview-start')?.addEventListener('click', ()=> showPage('search'));
document.getElementById('btn-open-choose')?.addEventListener('click', ()=> showPage('choose'));
document.getElementById('btn-take-quiz')?.addEventListener('click', ()=> openQuiz());

/* Search & chips */
const domainInput = document.getElementById('input-domain');
document.getElementById('btn-search')?.addEventListener('click', ()=> handleDomain(domainInput.value));
domainInput?.addEventListener('keydown', e => { if(e.key === 'Enter'){ e.preventDefault(); handleDomain(domainInput.value); }});
document.querySelectorAll('.chip').forEach(c => c.addEventListener('click', ()=> handleDomain(c.dataset.domain)));

/* Choose page buttons */
document.querySelectorAll('.choose-card').forEach(btn => {
  btn.addEventListener('click', ()=> {
    const d = btn.dataset.domain;
    handleDomain(d);
  });
});

/* detail modal */
const detailModal = document.getElementById('detail-modal');
const detailTitle = document.getElementById('detail-title');
const detailDesc = document.getElementById('detail-desc');
const detailBrief = document.getElementById('detail-brief');
const detailUses = document.getElementById('detail-uses');
const detailLinks = document.getElementById('detail-links');
const detailVideo = document.getElementById('detail-video');
const detailMark = document.getElementById('detail-mark');
let currentRef = null;

document.getElementById('detail-close')?.addEventListener('click', ()=> detailModal.classList.add('hidden'));
document.getElementById('detail-close-2')?.addEventListener('click', ()=> detailModal.classList.add('hidden'));

/* quiz modal */
const quizModal = document.getElementById('quiz-modal');
const quizQuestions = document.getElementById('quiz-questions');

function openQuiz(){
  quizQuestions.innerHTML = '';
  QUIZ_QS.forEach((q, idx) => {
    const row = document.createElement('div');
    row.className = 'p-3 border rounded flex items-center justify-between gap-4';
    row.innerHTML = `<div><div class="font-semibold">Q${idx+1}</div><div class="text-sm text-slate-600">${q.q}</div></div>
      <div class="flex gap-2"><button data-idx="${idx}" data-val="yes" class="btn-secondary">Yes</button><button data-idx="${idx}" data-val="no" class="btn-ghost">No</button></div>`;
    quizQuestions.appendChild(row);
  });
  // attach handlers
  quizQuestions.querySelectorAll('button').forEach(b=>{
    b.addEventListener('click', ()=>{
      const idx = b.dataset.idx;
      const val = b.dataset.val;
      localAnswers[idx] = val;
      // visual
      const parent = b.closest('div');
      parent.querySelectorAll('button').forEach(x=> x.classList.remove('opacity-50','scale-105'));
      b.classList.add('scale-105');
      parent.querySelectorAll('button').forEach(x=> x.classList.add('opacity-50'));
      b.classList.remove('opacity-50');
    });
  });
  quizModal.classList.remove('hidden');
}
document.getElementById('quiz-close')?.addEventListener('click', ()=> quizModal.classList.add('hidden'));
document.getElementById('quiz-cancel')?.addEventListener('click', ()=> quizModal.classList.add('hidden'));
document.getElementById('quiz-run')?.addEventListener('click', ()=> {
  // compute scores
  const scores = { webdevelopment:0, cybersecurity:0, aiml:0, datascience:0 };
  QUIZ_QS.forEach((q, i) => {
    const ans = localAnswers[i] || 'no';
    if(ans === 'yes'){
      Object.keys(q.weight || {}).forEach(k => scores[k] += q.weight[k]);
    }
  });
  const best = Object.keys(scores).sort((a,b)=> scores[b]-scores[a])[0] || 'webdevelopment';
  const homeRec = document.getElementById('home-recommendation');
  homeRec.innerHTML = `<div class="p-4 rounded-lg shadow-md bg-gradient-to-r from-indigo-50 to-cyan-50">
    <div class="flex items-center justify-between">
      <div><div class="font-semibold">Recommended for you:</div><div class="text-sm text-slate-600">${formatDomain(best)}</div></div>
      <div class="flex gap-2"><button class="btn-secondary" id="open-rec">Open</button><button class="btn-ghost" id="clear-rec">Clear</button></div>
    </div>
  </div>`;
  document.getElementById('open-rec').addEventListener('click', ()=> { handleDomain(best); });
  document.getElementById('clear-rec').addEventListener('click', ()=> { homeRec.innerHTML = ''; });
  quizModal.classList.add('hidden');
});

/* quiz data */
const QUIZ_QS = [
  { q: "Do you enjoy building user interfaces and design?", weight:{ webdevelopment:2 } },
  { q: "Do you like math, statistics or probability?", weight:{ aiml:2, datascience:1 } },
  { q: "Do you enjoy networks, systems and debugging low-level issues?", weight:{ cybersecurity:2 } },
  { q: "Do you enjoy analyzing datasets, charts and trends?", weight:{ datascience:2, aiml:1 } },
  { q: "Do you like building both client and server parts of apps?", weight:{ webdevelopment:2 } }
];
const localAnswers = {};

/* Progress helpers */
function getProgress(){ try{ return JSON.parse(localStorage.getItem('cse_progress')||'{}'); }catch(e){return{};} }
function saveProgress(p){ localStorage.setItem('cse_progress', JSON.stringify(p)); }
function key(domain, step, sub){ return `${domain}::${step}::${sub}`; }
function toggleProgress(domain, step, sub){
  const p = getProgress();
  const k = key(domain,step,sub);
  p[k] = !p[k];
  saveProgress(p);
  return p[k];
}
function isCompleted(domain, step, sub){ return !!getProgress()[key(domain,step,sub)]; }

/* Domain normalization + handler */
function normalizeDomain(s){
  s = String(s||'').toLowerCase().replace(/\s+/g,'').replace(/[-_]/g,'');
  if(['webdev','webdevelopment','web','frontend','fullstack'].includes(s)) return 'webdevelopment';
  if(['cybersecurity','cybersec','security','infosec'].includes(s)) return 'cybersecurity';
  if(['aiml','ai','ml','machinelearning'].includes(s)) return 'aiml';
  if(['datascience','datasci','data','ds'].includes(s)) return 'datascience';
  if(['iot','internetofthings','embedded','arduino','raspberrypi'].includes(s)) return 'iot';
  if(['cloud','cloudcomputing','aws','gcp','azure','cloudops','devops'].includes(s)) return 'cloudcomputing';
  return s;
}

function handleDomain(raw){
  const domain = normalizeDomain(raw);
  const valid = ['webdevelopment','cybersecurity','aiml','datascience','iot','cloudcomputing'];
  if(!valid.includes(domain)){ alert('Please choose: webdevelopment, cybersecurity, aiml, datascience'); return; }
  buildRoadmap(domain);
  showPage('roadmap');
}

/* Quote generator */
const QUOTES = [ "Small consistent steps beat occasional huge leaps.", "Ship early, ship often.", "Learn by building — projects beat theory.", "Fundamentals transfer across technologies.", "Make a portfolio, not just notes." ];
function showQuote(){ const q = QUOTES[Math.floor(Math.random()*QUOTES.length)]; const el = document.getElementById('quote'); if(el){ el.textContent = `“${q}”`; el.classList.remove('hidden'); } }

/* Subtopic modal open */
function openDetail(sub, domain, stepTitle){
  currentRef = {sub, domain, stepTitle};
  detailTitle.textContent = sub.title;
  detailDesc.textContent = sub.desc;
  detailBrief.textContent = sub.brief || sub.desc;
  detailUses.innerHTML = `<strong>Where it's used:</strong> ${sub.uses || 'General'}`;
  detailLinks.innerHTML = '';
  (sub.resources || []).slice(0,6).forEach(r => {
    const a = document.createElement('a');
    a.href = r.link; a.target = '_blank'; a.rel='noopener';
    a.textContent = r.name;
    a.className = 'text-indigo-600 underline';
    detailLinks.appendChild(a);
  });
  if((sub.resources||[]).length>0){
    detailVideo.innerHTML = `<a class="text-sm underline" href="${sub.resources[0].link}" target="_blank" rel="noopener">Watch: ${sub.resources[0].name}</a>`;
  } else { detailVideo.textContent = ''; }
  detailMark.textContent = isCompleted(domain, stepTitle, sub.title) ? 'Unmark' : 'Mark Complete';
  detailModal.classList.remove('hidden');
}
detailMark.addEventListener('click', ()=>{
  if(!currentRef) return;
  const done = toggleProgress(currentRef.domain, currentRef.stepTitle, currentRef.sub.title);
  buildRoadmap(currentRef.domain);
  detailModal.classList.add('hidden');
});

/* Build roadmaps data: long AI/ML, DataScience, Cybersecurity (>=10 topics each) */
/* Each step has subtopics; each subtopic has: title, desc, brief (10-line), uses, resources (YouTube links) */
/* For brevity in code we put many items but keep structure readable */
const ROADMAPS = {
  webdevelopment: {
    title: 'Web Development',
    subtitle: 'HTML/CSS → JS → Frameworks → Backend → Deploy',
    actions:[{label:'Foundations',icon:'📚'},{label:'Frontend',icon:'🎨'},{label:'Backend',icon:'🧠'},{label:'Deploy',icon:'🚀'}],
    steps:[
      { title:'HTML & Semantics', details:'Structure, accessibility, forms', subtopics:[
        { title:'Semantic HTML', desc:'Tags, accessibility', brief: "1. Semantic HTML gives structure and accessibility.\n2. Use headings, lists, sections, nav for clarity.\n3. Screen readers rely on semantic markup.\n4. Search engines use semantics for indexing.\n5. Forms need correct labels and types.\n6. Proper semantics improve maintainability.\n7. Combine with ARIA when needed.\n8. Test with accessibility tools.\n9. Start projects using semantic tags.\n10. Employers expect accessible markup.", uses:'Web pages, SEO', resources:[{name:'freeCodeCamp - HTML Full Course', link:'https://www.youtube.com/watch?v=pQN-pnXPaVg'}] },
        { title:'Forms & Validation', desc:'Inputs, validation and UX', brief:'1. Forms collect user data.\n2. Validate client & server side.\n3. Use proper input types for mobile keyboards.\n4. Show friendly error messages.\n5. Sanitize before sending to backend.\n6. Accessibility: labels and aria-required.\n7. Use constraints (min/max) for numbers.\n8. Consider UX: progress, autosave.\n9. Test on real devices.\n10. Forms are common in production.' , uses:'Login, signup, surveys', resources:[{name:'Traversy - HTML Forms', link:'https://www.youtube.com/watch?v=qz0aGYrrlhU'}] }
      ]},
      { title:'CSS & Layout', details:'Box model, flexbox, grid', subtopics:[
        { title:'Box Model', desc:'padding, margin, border', brief:'1. Understand how element sizing works.\n2. box-sizing: border-box simplifies layout.\n3. Padding increases inner spacing.\n4. Margin controls separation.\n5. border adds thickness; affects size.\n6. Use devtools to inspect box model.\n7. Combine with flex/grid for layouts.\n8. Minimize use of fixed heights when possible.\n9. Practice building small UI components.\n10. Box model knowledge prevents layout bugs.', uses:'All layouts', resources:[{name:'Kevin Powell - Box Model', link:'https://www.youtube.com/watch?v=rIO5326FgPE'}] },
        { title:'Flexbox', desc:'Row/column layouts', brief:'(10-line brief...)', uses:'Navbars, small layouts', resources:[{name:'freeCodeCamp - Flexbox', link:'https://www.youtube.com/watch?v=JJSoEo8JSnc'}] },
        { title:'Grid', desc:'2D grid layouts', brief:'(10-line brief...)', uses:'Dashboards', resources:[{name:'Traversy - CSS Grid', link:'https://www.youtube.com/watch?v=jV8B24rSN5o'}] }
      ]},
      { title:'JavaScript Core', details:'ES6+, async, DOM', subtopics:[
        { title:'ES6+', desc:'let/const, arrow funcs, modules', brief:'(10-line brief...)', uses:'Modern JS', resources:[{name:'freeCodeCamp - JS Full Course', link:'https://www.youtube.com/watch?v=PkZNo7MFNFg'}] },
        { title:'DOM', desc:'Manipulate page elements', brief:'(10-line brief...)', uses:'Interactive UI', resources:[{name:'Net Ninja - DOM', link:'https://www.youtube.com/watch?v=0ik6X4DJKCc'}] },
        { title:'Async JS', desc:'Promises, fetch, async/await', brief:'(10-line brief...)', uses:'API calls', resources:[{name:'Traversy - Async', link:'https://www.youtube.com/watch?v=PoRJizFvM7s'}] }
      ]},
      { title:'Frameworks & Tooling', details:'React & ecosystem', subtopics:[
        { title:'React Basics', desc:'Components, hooks, state', brief:'(10-line brief...)', uses:'SPAs', resources:[{name:'Codevolution - React', link:'https://www.youtube.com/watch?v=QFaFIcGhPoM'}] },
        { title:'State Management', desc:'Redux/Context', brief:'(10-line brief...)', uses:'Large apps', resources:[{name:'Academind - Redux', link:'https://www.youtube.com/watch?v=poQXNp9ItL4'}] }
      ]},
      { title:'Backend & Databases', details:'Node, Express, SQL/NoSQL', subtopics:[
        { title:'Node & Express', desc:'APIs and servers', brief:'(10-line brief...)', uses:'Backend services', resources:[{name:'Traversy - Node Crash', link:'https://www.youtube.com/watch?v=fBNz5xF-Kx4'}] },
        { title:'Databases', desc:'Postgres / Mongo', brief:'(10-line brief...)', uses:'Persistent storage', resources:[{name:'Academind - SQL vs NoSQL', link:'https://www.youtube.com/watch?v=HXV3zeQKqGY'}] }
      ]},
      { title:'Deployment & DevOps', details:'Docker, CI/CD, hosting', subtopics:[
        { title:'Docker', desc:'Containers & images', brief:'(10-line brief...)', uses:'Dev/Prod', resources:[{name:'TechWorld with Nana - Docker', link:'https://www.youtube.com/watch?v=pTFZFxd4hOI'}] },
        { title:'CI/CD', desc:'GitHub Actions', brief:'(10-line brief...)', uses:'Automated deploys', resources:[{name:'GitHub Actions Course', link:'https://www.youtube.com/watch?v=R8_veQiYBjI'}] }
      ]},
      { title:'Security & Best Practices', details:'OWASP, HTTPS, headers', subtopics:[
        { title:'OWASP Top 10', desc:'Top web vulnerabilities', brief:'(10-line brief...)', uses:'Secure apps', resources:[{name:'OWASP - overview', link:'https://www.youtube.com/watch?v=0QX2I2t2K0Y'}] }
      ]},
      { title:'Testing & Quality', details:'Unit & E2E testing', subtopics:[
        { title:'Jest & Testing Library', desc:'Unit / Component tests', brief:'(10-line brief...)', uses:'Quality assurance', resources:[{name:'Traversy - Jest', link:'https://www.youtube.com/watch?v=Eo2c3LhQGbA'}] }
      ]},
      { title:'Performance & Optimization', details:'Lighthouse, caching', subtopics:[
        { title:'Performance', desc:'Lighthouse & metrics', brief:'(10-line brief...)', uses:'Fast UX', resources:[{name:'web.dev - perf', link:'https://www.youtube.com/watch?v=3aJGzHhW9q4'}] }
      ]}
    ],
    projects:['Portfolio site','React SPA + API','Full-stack CRUD app'],
    resources:[{name:'freeCodeCamp',link:'https://www.youtube.com/c/Freecodecamp'},{name:'Traversy Media',link:'https://www.youtube.com/c/TraversyMedia'}],
    certified:[{name:'NPTEL - Web Dev',link:'https://onlinecourses.nptel.ac.in/'},{name:'SWAYAM',link:'https://swayam.gov.in/'}]
  },

  /* CYBERSECURITY : >=10 topics */
  cybersecurity: {
    title: 'Cybersecurity',
    subtitle: 'Networking → Systems → Pentest → Reporting',
    actions:[{label:'Networking',icon:'🌐'},{label:'Linux',icon:'🐧'},{label:'OWASP',icon:'🛡️'},{label:'Labs',icon:'🧩'}],
    steps:[
      { title:'Networking Fundamentals', details:'OSI, TCP/IP, subnetting', subtopics:[
        { title:'OSI & TCP-IP', desc:'Layers and models', brief:`1. OSI & TCP/IP help organize network concepts.\n2. Understand what each layer does (physical->app).\n3. TCP ensures reliable transmission; UDP is faster but unreliable.\n4. IP addressing & routing direct packets.\n5. Learn CIDR and subnet masks for networks.\n6. Many attacks target misconfigured layers.\n7. Hands-on labs make these concepts concrete.\n8. Networking skill is the base for security work.\n9. Learn basic router/switch concepts.\n10. Practice with packet capture tools.`, uses:'All networked systems', resources:[{name:'Professor Messer - Networking',link:'https://www.youtube.com/c/ProfessorMesser'}] },
        { title:'Subnetting & IP', desc:'Addresses and CIDR', brief:'(10-line brief...)', uses:'Network design', resources:[{name:'NetworkChuck - Subnetting',link:'https://www.youtube.com/watch?v=ZJwQhE0I3Ck'}] }
      ]},
      { title:'Linux & Systems', details:'CLI, users, permissions', subtopics:[
        { title:'Linux CLI', desc:'Commands, file system', brief:`1. Linux command line is essential for security engineers.\n2. Learn ls, ps, top, netstat/ss for system insight.\n3. Manage users, groups and file permissions.\n4. Use grep, awk, sed for text processing.\n5. Practice in VMs or containers to avoid harming systems.\n6. Master file permissions and SUID/SGID concepts.\n7. Understand package managers and services.\n8. Logs are the first place to look during incidents.\n9. Automate repetitive tasks with shell scripts.\n10. Linux skills are a must for many security roles.`, uses:'Servers & pentesting', resources:[{name:'Learn Linux TV',link:'https://www.youtube.com/c/LearnLinuxTV'}] },
        { title:'Scripting (Bash/Python)', desc:'Automate tasks & parse logs', brief:'(10-line brief...)', uses:'Tooling', resources:[{name:'Traversy - Bash',link:'https://www.youtube.com/watch?v=oxuRxtrO2Ag'}] }
      ]},
      { title:'Protocols & Services', details:'DNS, HTTP, TLS, SMTP', subtopics:[
        { title:'HTTP & TLS', desc:'Secure web communications', brief:'(10-line brief...)', uses:'Web security', resources:[{name:'Cloudflare - TLS',link:'https://www.youtube.com/watch?v=5c0e1B6R0zI'}] },
        { title:'DNS basics', desc:'Resolution & attacks', brief:'(10-line brief...)', uses:'Infrastructure', resources:[{name:'Cloudflare - DNS',link:'https://www.youtube.com/watch?v=QUQ5s8NqfTk'}] }
      ]},
      { title:'Reconnaissance & OSINT', details:'Gather public info ethically', subtopics:[
        { title:'OSINT', desc:'Public data collection tools', brief:'(10-line brief...)', uses:'Scoping & intel', resources:[{name:'The Cyber Mentor - OSINT',link:'https://www.youtube.com/c/TheCyberMentor'}] }
      ]},
      { title:'Scanning & Enumeration', details:'Nmap, service discovery', subtopics:[
        { title:'Nmap', desc:'Port & service discovery', brief:'(10-line brief...)', uses:'Attack surface mapping', resources:[{name:'HackerSploit - Nmap',link:'https://www.youtube.com/watch?v=Y2bP5cV6r7g'}] }
      ]},
      { title:'Web Vulnerabilities', details:'OWASP Top10, XSS, SQLi', subtopics:[
        { title:'OWASP Top10', desc:'Common web flaws', brief:'(10-line brief...)', uses:'Web app security', resources:[{name:'PortSwigger - Web Security',link:'https://www.youtube.com/user/portswigger'}] }
      ]},
      { title:'Exploitation Tools', details:'Metasploit, manual exploit', subtopics:[
        { title:'Metasploit', desc:'Framework basics', brief:'(10-line brief...)', uses:'Pen testing', resources:[{name:'Hackersploit - Metasploit',link:'https://www.youtube.com/c/hackersploit'}] }
      ]},
      { title:'Post-Exploitation', details:'Persistence, privilege escalation', subtopics:[
        { title:'Privilege Escalation', desc:'Gain higher privileges', brief:'(10-line brief...)', uses:'Full compromise', resources:[{name:'Hackersploit - PrivEsc',link:'https://www.youtube.com/c/hackersploit'}] }
      ]},
      { title:'Forensics & Logging', details:'Collect evidence & analyze', subtopics:[
        { title:'Forensics basics', desc:'Artifacts & timelines', brief:'(10-line brief...)', uses:'Incident response', resources:[{name:'Hakin9 - Forensics',link:'https://www.youtube.com/channel/UCdQ8b9g9r6vT7c9XW3l2xPA'}] }
      ]},
      { title:'CTFs & Practice', details:'Hands-on challenges', subtopics:[
        { title:'CTFs', desc:'Practice vulnerabilities in labs', brief:'(10-line brief...)', uses:'Skill development', resources:[{name:'TryHackMe',link:'https://www.youtube.com/c/TryHackMe'}] }
      ]},
      { title:'Reporting & Remediation', details:'Write clear reports', subtopics:[
        { title:'Pentest Reporting', desc:'Document findings & fixes', brief:'(10-line brief...)', uses:'Professional deliverables', resources:[{name:'HackerOne - Reports',link:'https://www.youtube.com/c/hackerone'}] }
      ]}
    ],
    projects:['Juice Shop lab','Network hardening report','CTF writeups'],
    resources:[{name:'TryHackMe',link:'https://www.youtube.com/c/TryHackMe'},{name:'Hak5',link:'https://www.youtube.com/c/hak5'}],
    certified:[{name:'NPTEL - Cybersecurity',link:'https://onlinecourses.nptel.ac.in/'},{name:'SWAYAM - Security',link:'https://swayam.gov.in/'}]
  },

  /* AI/ML : >=10 topics */
  aiml: {
    title:'AI / ML',
    subtitle:'Math → ML → Deep Learning → Deployment',
    actions:[{label:'Math',icon:'📐'},{label:'ML',icon:'📈'},{label:'DL',icon:'🧠'},{label:'MLOps',icon:'⚙️'}],
    steps:[
      { title:'Linear Algebra', details:'Vectors, matrices, decompositions', subtopics:[
        { title:'Vectors & Matrices', desc:'Represent data & transforms', brief:`1. Vectors & matrices are core to ML math.\n2. They store inputs, weights & outputs.\n3. Matrix multiplication expresses linear transforms.\n4. Learn operations in NumPy.\n5. Many model internals rely on these concepts.\n6. Visual intuition helps understanding.\n7. Eigenvectors & SVD are useful for dimensionality reduction.\n8. Implement small examples to internalize.\n9. Linear algebra underpins embeddings.\n10. Employers value this math background.`, uses:'Model internals', resources:[{name:'3Blue1Brown - Linear Algebra',link:'https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr'}] }
      ]},
      { title:'Probability & Stats', details:'Distributions, inference', subtopics:[
        { title:'Probability Basics', desc:'Events, distributions', brief:'(10-line brief...)', uses:'Modeling & evaluation', resources:[{name:'StatQuest',link:'https://www.youtube.com/c/joshstarmer'}] },
        { title:'Hypothesis Testing', desc:'p-values, t-tests', brief:'(10-line brief...)', uses:'A/B testing', resources:[{name:'OpenIntro - Stats',link:'https://www.youtube.com/watch?v=0zZYBALbZgg'}] }
      ]},
      { title:'Calculus & Optimization', details:'Gradients & GD', subtopics:[
        { title:'Derivatives & Gradients', desc:'Optimization basics', brief:'(10-line brief...)', uses:'Training models', resources:[{name:'Andrew Ng - gradient',link:'https://www.youtube.com/watch?v=JvS2triCgOY'}] }
      ]},
      { title:'NumPy & Data Prep', details:'Arrays & performance', subtopics:[
        { title:'NumPy', desc:'Efficient numerical ops', brief:'(10-line brief...)', uses:'Pipelines', resources:[{name:'Keith Galli - NumPy',link:'https://www.youtube.com/watch?v=QUT1VHiLmmI'}] }
      ]},
      { title:'Supervised Learning', details:'Regression & classification', subtopics:[
        { title:'Regression', desc:'Linear & regularized models', brief:'(10-line brief...)', uses:'Prediction problems', resources:[{name:'Andrew Ng - ML',link:'https://www.youtube.com/watch?v=GwIo3gDZCVQ'}] }
      ]},
      { title:'Unsupervised Learning', details:'Clustering, PCA', subtopics:[
        { title:'Clustering', desc:'K-means, hierarchical', brief:'(10-line brief...)', uses:'Segmentation', resources:[{name:'StatQuest - Clustering',link:'https://www.youtube.com/watch?v=ev8YbxPu_bQ'}] }
      ]},
      { title:'Deep Learning', details:'Neural networks, CNNs, RNNs', subtopics:[
        { title:'Neural Networks', desc:'Layers, activations', brief:'(10-line brief...)', uses:'Many DL tasks', resources:[{name:'DeepLearning.AI',link:'https://www.youtube.com/c/deeplearningai'}] },
        { title:'CNNs', desc:'Image models', brief:'(10-line brief...)', uses:'Computer vision', resources:[{name:'CS231n',link:'https://www.youtube.com/playlist?list=PL3FW7Lu3i5JvHM8ljYj-zLfQRF3EO8sYv'}] }
      ]},
      { title:'Transformers & NLP', details:'Attention & large models', subtopics:[
        { title:'Transformers', desc:'Attention mechanism', brief:'(10-line brief...)', uses:'NLP & foundation models', resources:[{name:'Hugging Face',link:'https://www.youtube.com/c/huggingface'}] }
      ]},
      { title:'Model Evaluation', details:'Metrics, cross-validation', subtopics:[
        { title:'Metrics', desc:'Accuracy, F1, AUC', brief:'(10-line brief...)', uses:'Model selection', resources:[{name:'StatQuest - Metrics',link:'https://www.youtube.com/watch?v=85dtiMz9tSo'}] }
      ]},
      { title:'MLOps & Deployment', details:'Serving, monitoring', subtopics:[
        { title:'Serving Models', desc:'FastAPI, TF Serving', brief:'(10-line brief...)', uses:'Production ML', resources:[{name:'FastAPI Tutorial',link:'https://www.youtube.com/watch?v=0sOvCWFmrtA'}] }
      ]}
    ],
    projects:['Tabular ML pipeline','Image classifier','NLP fine-tune'],
    resources:[{name:'StatQuest',link:'https://www.youtube.com/c/joshstarmer'},{name:'3Blue1Brown',link:'https://www.youtube.com/c/3blue1brown'}],
    certified:[{name:'NPTEL - AI/ML',link:'https://onlinecourses.nptel.ac.in/'},{name:'SWAYAM - AI',link:'https://swayam.gov.in/'}]
  },

  /* Data Science: >=10 topics */
  datascience: {
    title:'Data Science',
    subtitle:'Stats → SQL → ETL → Viz → ML',
    actions:[{label:'Stats',icon:'📊'},{label:'SQL',icon:'🗄️'},{label:'Python',icon:'🐍'},{label:'Viz',icon:'📈'}],
    steps:[
      { title:'Descriptive Statistics', details:'Mean, median, variance', subtopics:[
        { title:'Descriptive stats', desc:'Summaries & distributions', brief:'(10-line brief...)', uses:'Initial analysis', resources:[{name:'Khan Academy',link:'https://www.youtube.com/c/khanacademy'}] }
      ]},
      { title:'Probability & Distributions', details:'Normal, binomial, poisson', subtopics:[
        { title:'Probability', desc:'Events & distributions', brief:'(10-line brief...)', uses:'Modeling', resources:[{name:'StatQuest',link:'https://www.youtube.com/c/joshstarmer'}] }
      ]},
      { title:'Hypothesis Testing', details:'p-values, t-tests', subtopics:[
        { title:'Hypothesis tests', desc:'A/B testing', brief:'(10-line brief...)', uses:'Product experiments', resources:[{name:'OpenIntro',link:'https://www.youtube.com/watch?v=0zZYBALbZgg'}] }
      ]},
      { title:'SQL & Joins', details:'Query & aggregation', subtopics:[
        { title:'SQL Basics', desc:'SELECT, GROUP BY', brief:'(10-line brief...)', uses:'Data extraction', resources:[{name:'thenewboston - SQL',link:'https://www.youtube.com/watch?v=HXV3zeQKqGY'}] }
      ]},
      { title:'Data Wrangling (pandas)', details:'Cleaning & ETL', subtopics:[
        { title:'pandas', desc:'Dataframes & operations', brief:'(10-line brief...)', uses:'Cleaning', resources:[{name:'Keith Galli - pandas',link:'https://www.youtube.com/watch?v=vmEHCJofslg'}] }
      ]},
      { title:'Feature Engineering', details:'Create predictive features', subtopics:[
        { title:'Feature Eng', desc:'Encoding, scaling', brief:'(10-line brief...)', uses:'Modeling', resources:[{name:'Kaggle - Feature Eng',link:'https://www.youtube.com/watch?v=U0O9Sy6oU0I'}] }
      ]},
      { title:'Visualization', details:'Matplotlib, Seaborn, dashboards', subtopics:[
        { title:'Matplotlib/Seaborn', desc:'Charts & plots', brief:'(10-line brief...)', uses:'EDA', resources:[{name:'Corey Schafer - Matplotlib',link:'https://www.youtube.com/watch?v=UO98lJQ3QGI'}] }
      ]},
      { title:'Time Series', details:'Forecasting basics', subtopics:[
        { title:'Time Series', desc:'Trend & seasonality', brief:'(10-line brief...)', uses:'Forecasting', resources:[{name:'Ken Jee',link:'https://www.youtube.com/c/KenJee_DS'}] }
      ]},
      { title:'Modeling & Validation', details:'Train, validate, test', subtopics:[
        { title:'Model Eval', desc:'CV, metrics', brief:'(10-line brief...)', uses:'Selecting models', resources:[{name:'StatQuest - Model Eval',link:'https://www.youtube.com/watch?v=85dtiMz9tSo'}] }
      ]},
      { title:'Deployment & Dashboards', details:'Streamlit, deployment', subtopics:[
        { title:'Streamlit', desc:'Interactive apps', brief:'(10-line brief...)', uses:'Stakeholder deliverables', resources:[{name:'Data Professor - Streamlit',link:'https://www.youtube.com/watch?v=_9WiB2PDO7U'}] }
      ]}
    ],
    projects:['Kaggle EDA','SQL analytics case study','Interactive dashboard'],
    resources:[{name:'Kaggle',link:'https://www.youtube.com/c/Kaggle'},{name:'DataTalksClub',link:'https://www.youtube.com/c/DataTalksClub'}],
    certified:[{name:'NPTEL - Data Science',link:'https://onlinecourses.nptel.ac.in/'},{name:'SWAYAM - Data Science',link:'https://swayam.gov.in/'}]
  },
  /* ---------- NEW: IoT Roadmap ---------- */
iot: {
  title: 'IoT (Internet of Things)',
  subtitle: 'Electronics → Embedded → Connectivity → Cloud → Security',
  actions: [
    { label: 'Electronics', icon: '⚡' },
    { label: 'Embedded', icon: '🛠️' },
    { label: 'Connectivity', icon: '📡' },
    { label: 'Cloud', icon: '☁️' }
  ],
  steps: [
    {
      title: 'Electronics Basics',
      details: 'Understand how electricity powers IoT devices.',
      subtopics: [
        {
          title: 'Components & Circuits',
          desc: 'Learn about resistors, capacitors, diodes, and how sensors integrate into circuits.',
          brief: 'Electronics basics teach you how voltage, current, and resistance work together. \
This is essential for designing stable IoT devices. You’ll learn about Ohm’s law, how to build \
simple circuits with breadboards, and how to power microcontrollers safely. Knowing components \
like resistors, capacitors, transistors, and sensors ensures you can debug hardware issues. \
These fundamentals are the first step in becoming confident with IoT hardware.',
          uses: 'Used in prototyping smart devices, sensor boards, and low-power gadgets.',
          resources: [
            { name: 'Raspberry Pi Foundation - Electronics Basics', link: 'https://www.youtube.com/c/RaspberryPiFoundation' }
          ]
        }
      ]
    },
    {
      title: 'Microcontrollers',
      details: 'Arduino, ESP32, and low-power IoT chips.',
      subtopics: [
        {
          title: 'Arduino Basics',
          desc: 'Start coding microcontrollers to blink LEDs, read sensors, and control outputs.',
          brief: 'Arduino is the entry point for embedded programming. You’ll learn to upload sketches, \
work with digital/analog pins, and read sensors like temperature or motion detectors. Arduino \
simplifies hardware interaction and makes IoT projects beginner-friendly while still preparing you \
for industrial microcontrollers.',
          uses: 'Building prototypes, school projects, and testing IoT ideas.',
          resources: [
            { name: 'Paul McWhorter - Arduino Lessons', link: 'https://www.youtube.com/user/mcwhorpj' }
          ]
        },
        {
          title: 'ESP32 & MicroPython',
          desc: 'Wi-Fi/Bluetooth chips with lightweight Python coding.',
          brief: 'ESP32 is a powerful yet affordable IoT chip. Using MicroPython, you can code devices \
directly in Python instead of C/C++. ESP32 makes it easy to add Wi-Fi and Bluetooth to your \
projects, letting devices communicate with cloud platforms in real time.',
          uses: 'Smart sensors, Wi-Fi devices, home automation nodes.',
          resources: [
            { name: 'Random Nerd Tutorials - ESP32', link: 'https://www.youtube.com/c/RandomNerdTutorials' }
          ]
        }
      ]
    },
    {
      title: 'Connectivity',
      details: 'IoT devices need reliable communication.',
      subtopics: [
        {
          title: 'MQTT & HTTP Protocols',
          desc: 'Lightweight data communication standards for IoT.',
          brief: 'IoT devices use protocols like MQTT to send telemetry data efficiently. \
MQTT is lightweight, publish/subscribe based, and widely supported. HTTP APIs are \
used for device-to-server communication. Learning these protocols prepares you \
to connect devices securely to apps and dashboards.',
          uses: 'Smart home sensors, telemetry dashboards, cloud APIs.',
          resources: [
            { name: 'HiveMQ - MQTT Basics', link: 'https://www.youtube.com/channel/UC3V5l9r2m2tH2mD4z7U0h1g' }
          ]
        }
      ]
    },
    {
      title: 'Cloud Integration',
      details: 'Storing and processing IoT data.',
      subtopics: [
        {
          title: 'Time-Series Databases',
          desc: 'Learn databases like InfluxDB to store sensor data.',
          brief: 'IoT devices produce continuous data streams. Time-series databases \
are optimized to store and query this efficiently. With tools like InfluxDB and \
Grafana, you can visualize sensor trends and monitor device health.',
          uses: 'IoT dashboards, analytics for industrial machines.',
          resources: [
            { name: 'InfluxData Channel', link: 'https://www.youtube.com/c/influxdata' }
          ]
        }
      ]
    },
    {
      title: 'Security for IoT',
      details: 'Protect IoT devices against attacks.',
      subtopics: [
        {
          title: 'Device Security',
          desc: 'Add encryption, authentication, and secure updates.',
          brief: 'IoT devices are vulnerable if left unsecured. Learn about secure boot, \
TLS encryption, and OTA firmware updates. This ensures data privacy, prevents \
device hijacking, and keeps products reliable after deployment.',
          uses: 'Industrial IoT, healthcare devices, consumer IoT.',
          resources: [
            { name: 'The Cyber Mentor - IoT Security', link: 'https://www.youtube.com/c/TheCyberMentor' }
          ]
        }
      ]
    }
  ],
  projects: [
    'Temperature logger with cloud dashboard',
    'Smart door sensor using ESP32',
    'Home automation system with MQTT'
  ],
  resources: [
    { name: 'Andreas Spiess', link: 'https://www.youtube.com/c/andreasSPIESS' },
    { name: 'Raspberry Pi Foundation', link: 'https://www.youtube.com/c/RaspberryPiFoundation' }
  ],
  certified: [
    { name: 'NPTEL - Embedded Systems', link: 'https://onlinecourses.nptel.ac.in/' },
    { name: 'Coursera - IoT Specialization', link: 'https://www.coursera.org/specializations/internet-of-things' }
  ]
},

/* ---------- NEW: Cloud Computing Roadmap ---------- */
cloudcomputing: {
  title: 'Cloud Computing',
  subtitle: 'Cloud fundamentals → Containers → Orchestration → Infra as Code',
  actions: [
    { label: 'Cloud Basics', icon: '☁️' },
    { label: 'Containers', icon: '🐳' },
    { label: 'Kubernetes', icon: '☸️' },
    { label: 'Infra as Code', icon: '🔧' }
  ],
  steps: [
    {
      title: 'Cloud Concepts',
      details: 'Understand how cloud services are structured.',
      subtopics: [
        {
          title: 'Cloud Fundamentals',
          desc: 'Learn about IaaS, PaaS, SaaS, and shared responsibility.',
          brief: 'This covers the difference between infrastructure (IaaS), \
platforms (PaaS), and software services (SaaS). You’ll learn why businesses move to \
cloud, how providers like AWS, Azure, and GCP structure their services, and \
what shared responsibility means for security.',
          uses: 'Architecting cloud systems and migrations.',
          resources: [
            { name: 'AWS Official Channel', link: 'https://www.youtube.com/c/AmazonWebServices' }
          ]
        }
      ]
    },
    {
      title: 'Networking & Virtualization',
      details: 'Secure networking in cloud environments.',
      subtopics: [
        {
          title: 'VPC Basics',
          desc: 'Work with Virtual Private Clouds, subnets, and routing.',
          brief: 'Networking is the backbone of the cloud. Learn about VPCs, subnets, \
gateways, and load balancers. You’ll also configure security groups and \
understand how to segment applications for security.',
          uses: 'Designing secure multi-tier apps.',
          resources: [
            { name: 'Google Cloud Platform', link: 'https://www.youtube.com/c/GoogleCloudPlatform' }
          ]
        }
      ]
    },
    {
      title: 'Containers (Docker)',
      details: 'Portable application packaging.',
      subtopics: [
        {
          title: 'Docker Basics',
          desc: 'Build, run, and share container images.',
          brief: 'Docker revolutionized how apps are shipped. Learn to write Dockerfiles, \
build images, and run containers. Containers ensure apps run the same across dev and prod, \
solving the “works on my machine” problem.',
          uses: 'Microservices, dev/test environments, CI/CD pipelines.',
          resources: [
            { name: 'TechWorld with Nana - Docker', link: 'https://www.youtube.com/c/TechWorldwithNana' }
          ]
        }
      ]
    },
    {
      title: 'Kubernetes',
      details: 'Container orchestration at scale.',
      subtopics: [
        {
          title: 'Kubernetes Core',
          desc: 'Pods, Deployments, and Services explained.',
          brief: 'Kubernetes automates running many containers. Learn pods (smallest units), \
deployments (updates), and services (networking). You’ll also practice scaling apps \
and managing rollouts.',
          uses: 'Running production-grade distributed apps.',
          resources: [
            { name: 'TechWorld with Nana - Kubernetes', link: 'https://www.youtube.com/c/TechWorldwithNana' }
          ]
        }
      ]
    },
    {
      title: 'CI/CD',
      details: 'Automated software delivery.',
      subtopics: [
        {
          title: 'GitHub Actions',
          desc: 'Set up automated pipelines.',
          brief: 'CI/CD ensures every commit is built, tested, and deployed automatically. \
Learn to use GitHub Actions or similar tools to run pipelines, test containers, and deploy to \
cloud services seamlessly.',
          uses: 'Fast, reliable deployments for teams.',
          resources: [
            { name: 'GitHub - Actions Channel', link: 'https://www.youtube.com/c/github' }
          ]
        }
      ]
    },
    {
      title: 'Infrastructure as Code',
      details: 'Automating infrastructure management.',
      subtopics: [
        {
          title: 'Terraform Basics',
          desc: 'Write infra definitions in code.',
          brief: 'Terraform lets you define resources (VMs, networks, DBs) in files \
and provision them consistently. IaC enables version control, repeatability, and \
collaboration in cloud infra setup.',
          uses: 'Enterprise infrastructure management.',
          resources: [
            { name: 'HashiCorp - Terraform', link: 'https://www.youtube.com/c/HashiCorp' }
          ]
        }
      ]
    },
    {
      title: 'Monitoring & Observability',
      details: 'Keep track of running systems.',
      subtopics: [
        {
          title: 'Prometheus & Grafana',
          desc: 'Metrics and dashboards for cloud apps.',
          brief: 'Monitoring ensures uptime and reliability. Learn to collect metrics with Prometheus, \
visualize with Grafana, and set alerts. Observability extends this with logs and tracing.',
          uses: 'Detect failures, analyze performance.',
          resources: [
            { name: 'Grafana Labs', link: 'https://www.youtube.com/c/Grafana' }
          ]
        }
      ]
    },
    {
      title: 'Security & IAM',
      details: 'Control access in cloud.',
      subtopics: [
        {
          title: 'IAM Policies',
          desc: 'Role-based permissions and best practices.',
          brief: 'Identity and Access Management ensures least privilege. \
Learn to design IAM roles, policies, and service accounts. Combine with auditing \
and MFA for secure enterprise use.',
          uses: 'Cloud security compliance and governance.',
          resources: [
            { name: 'AWS Security', link: 'https://www.youtube.com/c/AmazonWebServices' }
          ]
        }
      ]
    }
  ],
  projects: [
    'Deploy a Dockerized app on Kubernetes',
    'CI/CD pipeline with GitHub Actions',
    'Terraform-managed AWS infrastructure'
  ],
  resources: [
    { name: 'AWS Official Channel', link: 'https://www.youtube.com/c/AmazonWebServices' },
    { name: 'TechWorld with Nana', link: 'https://www.youtube.com/c/TechWorldwithNana' }
  ],
  certified: [
    { name: 'Coursera - Cloud Specialization', link: 'https://www.coursera.org' },
    { name: 'Google Cloud Training', link: 'https://cloud.google.com/training' }
  ]
}

  
  
};

/* ---------- Build timeline UI (supports multiple open accordions) ---------- */
let lastRenderedDomain = null;
function buildRoadmap(domain){
  const data = ROADMAPS[domain];
  if(!data) return;
  lastRenderedDomain = domain;
  showQuote();
  document.getElementById('roadmap-title').textContent = data.title;
  document.getElementById('roadmap-subtitle').textContent = data.subtitle;

  // actions
  const actionsEl = document.getElementById('domain-actions'); actionsEl.innerHTML = '';
  data.actions.forEach(a=>{
    const btn = document.createElement('div');
    btn.className = 'res-card p-4 rounded-lg cursor-pointer flex items-center justify-between';
    btn.innerHTML = `<div class="flex items-center gap-3"><div class="w-12 h-12 rounded-md bg-gradient-to-br from-indigo-100 to-cyan-100 flex items-center justify-center text-indigo-700 font-bold">${a.icon}</div><div class="font-semibold">${a.label}</div></div><div class="text-slate-400 text-sm">Open</div>`;
    btn.addEventListener('click', ()=> window.scrollTo({ top: document.getElementById('roadmap-content').offsetTop - 80, behavior:'smooth' }));
    actionsEl.appendChild(btn);
  });

  // timeline
  const content = document.getElementById('roadmap-content'); content.innerHTML = '';
  const timeline = document.createElement('div'); timeline.className = 'timeline';

  data.steps.forEach((step, idx) => {
    const item = document.createElement('div'); item.className = 'timeline-item';
    const marker = document.createElement('div'); marker.className='timeline-marker'; marker.textContent = idx+1;
    const cont = document.createElement('div'); cont.className='timeline-content';

    const head = document.createElement('div'); head.className='topic-head';
    head.innerHTML = `<div><div style="font-weight:700">${step.title}</div><div style="color:var(--muted);font-size:.95rem">${step.details}</div></div><div style="color:#94a3b8;font-weight:600">▼</div>`;

    const subWrap = document.createElement('div'); subWrap.className='subtopic-list mt-3';
    // multiple open allowed - keep visible by default hidden; user toggles add/remove 'hidden'
    subWrap.classList.add('hidden');

    (step.subtopics||[]).forEach(sub => {
      const subBtn = document.createElement('div'); subBtn.className='subtopic-btn';
      const done = isCompleted(domain, step.title, sub.title);
      subBtn.innerHTML = `<div style="flex:1"><div style="font-weight:600">${sub.title}</div><div style="color:var(--muted);font-size:.92rem;margin-top:.18rem">${sub.desc}</div></div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
          <div style="font-size:.85rem;color:#94a3b8">YouTube</div>
          <div class="complete-icon" style="cursor:pointer">${done?'<span class="complete-badge">✔ Completed</span>':'<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'}</div>
        </div>`;
      subBtn.addEventListener('click', ()=> openDetail(sub, domain, step.title));
      // complete toggle
      subBtn.querySelector('.complete-icon').addEventListener('click', (ev)=>{
        ev.stopPropagation();
        const now = toggleProgress(domain, step.title, sub.title);
        subBtn.querySelector('.complete-icon').innerHTML = now ? '<span class="complete-badge">✔ Completed</span>' : '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      });
      subWrap.appendChild(subBtn);
    });

    head.addEventListener('click', ()=> {
      // toggle only this subWrap (multiple open allowed)
      subWrap.classList.toggle('hidden');
    });

    cont.appendChild(head);
    cont.appendChild(subWrap);
    item.appendChild(marker);
    item.appendChild(cont);
    timeline.appendChild(item);
  });

  content.appendChild(timeline);

  // projects
  const proj = document.getElementById('project-list'); proj.innerHTML = '';
  (data.projects||[]).forEach(p => { const li = document.createElement('li'); li.className='res-card p-4'; li.textContent = p; proj.appendChild(li); });

  // resources
  const res = document.getElementById('resource-list'); res.innerHTML = '';
  (data.resources||[]).forEach(r => {
    const card = document.createElement('div'); card.className='res-card p-4'; card.innerHTML = `<div class="font-semibold mb-1">${r.name}</div><a href="${r.link}" target="_blank" rel="noopener">${r.link}</a>`;
    res.appendChild(card);
  });

  // certified
  const cert = document.getElementById('certified-list'); cert.innerHTML='';
  (data.certified||[]).forEach(c => {
    const card = document.createElement('div'); card.className='res-card p-4'; card.innerHTML = `<div class="font-semibold mb-1">${c.name}</div><a href="${c.link}" target="_blank" rel="noopener">${c.link}</a>`;
    cert.appendChild(card);
  });
}

/* utility: format domain display */
function formatDomain(d){
  if(d==='webdevelopment') return 'Web Development';
  if(d==='cybersecurity') return 'Cybersecurity';
  if(d==='aiml') return 'AI / ML';
  if(d==='datascience') return 'Data Science';
  return d;
}

/* initial event wiring for back/home */
document.getElementById('btn-back')?.addEventListener('click', ()=> showPage('search'));
document.getElementById('btn-home')?.addEventListener('click', ()=> showPage('landing'));

/* helper to show quote */
function showQuote(){ const el = document.getElementById('quote'); if(el){ el.textContent = QUOTES[Math.floor(Math.random()*QUOTES.length)]; el.classList.remove('hidden'); } }

/* restore quick notes done earlier - already restored via local storage set on init */

/* On load: nothing else */
console.log('CSE Roadmap loaded.');

/* Expose handleDomain to global (buttons call it) */
window.handleDomain = handleDomain;

/* End of script */
/* ---------- Coding Page ---------- */

// C Runner (placeholder only)
document.getElementById("btn-run-c")?.addEventListener("click", () => {
  const code = document.getElementById("c-editor").value.trim();
  const output = document.getElementById("c-output");
  output.textContent = code
    ? "⚠️ Running C requires a compiler.\nYour input:\n\n" + code
    : "Please enter some C code.";
});

// Python Runner (Skulpt)
// Python Runner (Skulpt) — guarded
document.getElementById("btn-run-py")?.addEventListener("click", () => {
  const code = document.getElementById("py-editor").value;
  const output = document.getElementById("py-output");
  output.textContent = "";

  if (typeof Sk === 'undefined') {
    output.textContent = "⚠️ Skulpt library not loaded. Make sure Skulpt script tags are included before script.js.";
    return;
  }

  function outf(text) { output.textContent += text + "\n"; }
  function builtinRead(x) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined) {
      throw "File not found: '" + x + "'";
    }
    return Sk.builtinFiles["files"][x];
  }

  Sk.configure({ output: outf, read: builtinRead });
  Sk.misceval.asyncToPromise(() =>
    Sk.importMainWithBody("<stdin>", false, code, true)
  ).catch(err => { output.textContent = err.toString(); });
});


// HTML Runner
document.getElementById("btn-run-html")?.addEventListener("click", () => {
  const code = document.getElementById("html-editor").value;
  const iframe = document.getElementById("html-output");
  iframe.srcdoc = code || "<p style='color:gray'>Write some HTML above and click Run.</p>";
});
/* ---------------- CODING COMPILER FEATURE ---------------- */
// Run code with Piston API (supports many languages + stdin)
async function runCode(language, code, stdin = "") {
  try {
    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: language,
        version: "*",   // latest
        files: [{ content: code }],
        stdin: stdin
      })
    });
    const result = await response.json();
    return result.run.output || "No output";
  } catch (err) {
    return "Error: " + err.message;
  }
}

// Hook for C
document.getElementById("btn-run-c")?.addEventListener("click", async () => {
  const code = document.getElementById("c-editor").value;
  const input = document.getElementById("c-input").value;
  const out = await runCode("c", code, input);
  document.getElementById("c-output").textContent = out;
});

// Hook for Python
document.getElementById("btn-run-py")?.addEventListener("click", async () => {
  const code = document.getElementById("py-editor").value;
  const input = document.getElementById("py-input").value;
  const out = await runCode("python", code, input);
  document.getElementById("py-output").textContent = out;
});

// Hook for HTML (just render in iframe)
document.getElementById("btn-run-html")?.addEventListener("click", () => {
  const code = document.getElementById("html-editor").value;
  const iframe = document.getElementById("html-output");
  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(code);
  doc.close();
});

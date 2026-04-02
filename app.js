// SaasLok app.js — Commerce SaaS Discovery for India
let PRODUCTS = [];
const CATEGORIES = [
  {id:"all",name:"All Products",icon:"fa-layer-group",color:"#6366f1",count:0},
  {id:"pos",name:"POS Systems",icon:"fa-cash-register",color:"#f59e0b",count:0},
  {id:"ecommerce",name:"Ecommerce",icon:"fa-cart-shopping",color:"#10b981",count:0},
  {id:"crm",name:"CRM",icon:"fa-users",color:"#3b82f6",count:0},
  {id:"oms",name:"Order Management",icon:"fa-clipboard-list",color:"#8b5cf6",count:0},
  {id:"warehouse",name:"Warehousing / WMS",icon:"fa-warehouse",color:"#ef4444",count:0},
  {id:"scm",name:"Supply Chain",icon:"fa-truck-fast",color:"#06b6d4",count:0},
  {id:"logistics",name:"Logistics",icon:"fa-route",color:"#ec4899",count:0},
  {id:"payments",name:"Payments",icon:"fa-credit-card",color:"#14b8a6",count:0},
  {id:"retail",name:"Retail Tech",icon:"fa-store",color:"#f97316",count:0},
  {id:"erp",name:"ERP / Accounting",icon:"fa-calculator",color:"#a855f7",count:0},
  {id:"analytics",name:"Analytics / BI",icon:"fa-chart-bar",color:"#06b6d4",count:0}
];
window.currentCategory='all';window.currentSearch='';window.currentSort='popular';window.currentPrice='all';window.currentRating=0;

async function loadData(){
  try{
    const res=await fetch('products.json');
    PRODUCTS=await res.json();
    CATEGORIES.forEach(c=>{c.count=c.id==='all'?PRODUCTS.length:PRODUCTS.filter(p=>p.category===c.id).length;});
    document.getElementById('heroCount').textContent=PRODUCTS.length+'+';
    document.getElementById('loadingState').style.display='none';
    renderCategories();showDiscoverPage();setupNav();
    document.getElementById('searchInput').addEventListener('input',e=>{window.currentSearch=e.target.value;renderProducts();});
  }catch(e){
    document.getElementById('loadingState').innerHTML='<i class="fas fa-exclamation-circle" style="color:var(--danger);font-size:2rem;display:block;margin-bottom:1rem"></i>Failed to load. Please refresh.';
  }
}

function setupNav(){
  document.querySelectorAll('.nav-links a').forEach(a=>{
    a.addEventListener('click',ev=>{
      ev.preventDefault();
      const page=a.getAttribute('data-page');
      setActiveNav(page);
      if(page==='discover')showDiscoverPage();
      else if(page==='trending')showTrendingPage();
      else if(page==='compare')showComparePage();
      else if(page==='insights')showInsightsPage();
    });
  });
}
function setActiveNav(page){
  document.querySelectorAll('.nav-links a').forEach(a=>a.classList.remove('active'));
  const el=document.querySelector('.nav-links a[data-page="'+page+'"]');
  if(el)el.classList.add('active');
}
function setPrice(el,val){document.querySelectorAll('[onclick*="setPrice"]').forEach(e=>e.classList.remove('active'));el.classList.add('active');window.currentPrice=val;renderProducts();}
function setRating(el,val){document.querySelectorAll('[onclick*="setRating"]').forEach(e=>e.classList.remove('active'));el.classList.add('active');window.currentRating=parseFloat(val)||0;renderProducts();}
function showSubmitModal(){alert('Submit Tool coming soon! Email: hello@saaslok.com');}
function closeModal(){document.getElementById('modalOverlay').classList.remove('active');}

function getFilteredProducts(){
  let f=[...PRODUCTS];
  if(window.currentCategory!=='all')f=f.filter(p=>p.category===window.currentCategory);
  if(window.currentSearch){const q=window.currentSearch.toLowerCase();f=f.filter(p=>p.name.toLowerCase().includes(q)||p.tagline.toLowerCase().includes(q)||p.tags.some(t=>t.toLowerCase().includes(q)));}
  if(window.currentRating>0)f=f.filter(p=>parseFloat(p.overallRating)>=window.currentRating);
  switch(window.currentSort){
    case 'rating':f.sort((a,b)=>parseFloat(b.overallRating)-parseFloat(a.overallRating));break;
    case 'trending':f.sort((a,b)=>(b.trend[7]-b.trend[5])-(a.trend[7]-a.trend[5]));break;
    case 'newest':f.sort((a,b)=>parseInt(b.founded)-parseInt(a.founded));break;
    case 'az':f.sort((a,b)=>a.name.localeCompare(b.name));break;
    default:f.sort((a,b)=>{'Popular':0,'trending':1,'new':2,'':3}[a.badge||'']- {'Popular':0,'trending':1,'new':2,'':3}[b.badge||'']);
  }
  return f;
}

function renderCategories(){
  document.getElementById('categoryList').innerHTML=CATEGORIES.map(c=>`<div class="category-item ${c.id==='all'?'active':''}" data-cat="${c.id}" onclick="setCat(this,'${c.id}')"><div class="cat-icon" style="background:${c.color}22;color:${c.color}"><i class="fas ${c.icon}"></i></div><span>${c.name}</span><span class="cat-count">${c.count}</span></div>`).join('');
}
function setCat(el,val){document.querySelectorAll('.category-item').forEach(i=>i.classList.remove('active'));el.classList.add('active');window.currentCategory=val;renderProducts();}

function renderStats(){
  const avgGT=Math.round(PRODUCTS.reduce((a,p)=>a+(p.googleTrends?p.googleTrends.avgInterest:0),0)/PRODUCTS.length);
  const totalNews=PRODUCTS.reduce((a,p)=>a+(p.googleNews?p.googleNews.totalMentions:0),0);
  const avgRating=(PRODUCTS.reduce((a,p)=>a+parseFloat(p.overallRating||0),0)/PRODUCTS.length).toFixed(1);
  document.getElementById('statsRow').innerHTML=[
    {icon:'fa-box',color:'#6366f1',bg:'rgba(99,102,241,.15)',value:PRODUCTS.length+'+',label:'Products Listed',change:'+23 this quarter'},
    {icon:'fa-star',color:'#f59e0b',bg:'rgba(245,158,11,.15)',value:avgRating,label:'Avg Rating (6 platforms)',change:'+0.3 vs last quarter'},
    {icon:'fa-chart-line',color:'#4285f4',bg:'rgba(66,133,244,.15)',value:avgGT+'/100',label:'Avg Google Trends',change:'India search interest'},
    {icon:'fa-newspaper',color:'#ea4335',bg:'rgba(234,67,53,.15)',value:totalNews.toLocaleString(),label:'News Mentions',change:'Across all products'}
  ].map(s=>`<div class="stat-card"><div class="stat-icon" style="background:${s.bg};color:${s.color}"><i class="fas ${s.icon}"></i></div><div class="stat-value">${s.value}</div><div class="stat-label">${s.label}</div><div class="stat-change" style="color:#10b981">${s.change}</div></div>`).join('');
}

function renderTrending(){
  const t=PRODUCTS.filter(p=>p.badge==='trending'||p.badge==='Popular').sort((a,b)=>b.trend[7]-a.trend[7]).slice(0,8);
  document.getElementById('trendingScroll').innerHTML=t.map((p,i)=>`<div class="trending-card" onclick="openModal(${p.id})"><div class="trending-rank">#${i+1}</div><div class="trending-name">${p.name}</div><div style="font-size:.75rem;color:var(--text-muted);margin-bottom:6px">${p.tags[0]}</div><div class="trending-change up"><i class="fas fa-arrow-up"></i> +${p.trend[7]-p.trend[6]} pts this month</div></div>`).join('');
}

function renderProductCard(p){
  const bl=p.badge==='trending'?'trending':p.badge==='new'?'new':'';
  const blab=p.badge==='Popular'?'⭐ Popular':p.badge==='trending'?'🔥 Trending':p.badge==='new'?'✨ New':'';
  const gt=p.googleTrends||{};const gn=p.googleNews||{};const s=p.social||{};const sent=s.sentiment||{positive:60,neutral:25,negative:15};
  const td=gt.trendDirection||'stable';const ta=td==='rising'?'↑':td==='declining'?'↓':'→';const tc=td==='rising'?'up':td==='declining'?'down':'stable';
  return `<div class="product-card animate-in" onclick="openModal(${p.id})">
    <div class="card-header">
      <div class="card-logo" style="background:${p.color}">${p.logo}</div>
      <div class="card-info"><h3>${p.name}</h3><div class="tagline">${p.tagline}</div></div>
      ${blab?`<span class="card-badge ${bl}">${blab}</span>`:''}
    </div>
    <div class="card-tags">${p.tags.map(t=>`<span class="card-tag">${t}</span>`).join('')}</div>
    <div class="card-ratings">
      <div class="rating-item">🔴 ${s.reddit?.score||'—'}</div>
      <div class="rating-item">G2 ${s.g2?.score||'—'}</div>
      <div class="rating-item"><span class="g-trends-icon"></span> ${gt.avgInterest||'—'}</div>
      <div class="rating-item">⭐ ${p.overallRating}</div>
    </div>
    <div class="card-status">
      <div class="trend-badge ${tc}"><i class="fas fa-arrow-${tc==='up'?'up':tc==='down'?'down':'right'}"></i> ${ta} ${td}</div>
      <div class="news-count">📰 ${gn.last30Days||0} news</div>
    </div>
    <div class="card-sentiment">
      <div style="flex:${sent.positive||50};height:6px;background:var(--success);border-radius:3px 0 0 3px"></div>
      <div style="flex:${sent.neutral||30};height:6px;background:var(--warning)"></div>
      <div style="flex:${sent.negative||20};height:6px;background:var(--danger);border-radius:0 3px 3px 0"></div>
    </div>
    <div class="card-footer">
      <div class="card-price ${p.pricing==='Free'?'free':''}">${p.pricing==='Custom'?'Custom Pricing':p.pricing||'—'}</div>
      <div style="display:flex;gap:8px;font-size:.8rem;color:var(--text-muted)">
        <i class="fab fa-reddit"></i><i class="fab fa-linkedin"></i><i class="fab fa-google"></i>
      </div>
    </div>
  </div>`;
}

function renderProducts(){
  const f=getFilteredProducts();const grid=document.getElementById('productsGrid');
  if(!grid)return;
  grid.innerHTML=f.length?f.map(p=>renderProductCard(p)).join(''):'<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-muted)"><i class="fas fa-search" style="font-size:2rem;display:block;margin-bottom:1rem"></i>No products found.</div>';
}

function showDiscoverPage(){
  document.getElementById('heroSection').style.display='';
  document.getElementById('sidebar').style.display='';
  const c=document.getElementById('contentArea');c.style.padding='1.5rem 2rem';
  c.innerHTML=`<div class="stats-row" id="statsRow"></div><div id="trendingSection"><div class="section-header"><h2><i class="fas fa-fire" style="color:var(--accent)"></i> Trending This Month</h2></div><div class="trending-scroll" id="trendingScroll"></div></div><div class="filters-bar"><div class="filter-chips" id="sortChips"><div class="filter-chip active" onclick="setSort(this,'popular')">🔥 Popular</div><div class="filter-chip" onclick="setSort(this,'rating')">⭐ Top Rated</div><div class="filter-chip" onclick="setSort(this,'trending')">📈 Trending</div><div class="filter-chip" onclick="setSort(this,'newest')">✨ Newest</div><div class="filter-chip" onclick="setSort(this,'az')">🔤 A-Z</div></div></div><div class="products-grid" id="productsGrid"></div>`;
  renderStats();renderTrending();renderProducts();
}
function setSort(el,val){document.querySelectorAll('#sortChips .filter-chip').forEach(e=>e.classList.remove('active'));el.classList.add('active');window.currentSort=val;renderProducts();}

function showTrendingPage(){
  document.getElementById('heroSection').style.display='none';
  document.getElementById('sidebar').style.display='none';
  const c=document.getElementById('contentArea');c.style.padding='2rem';
  const byGrowth=[...PRODUCTS].sort((a,b)=>(b.trend[7]-b.trend[0])-(a.trend[7]-a.trend[0]));
  const risers=byGrowth.slice(0,15);
  c.innerHTML=`<div style="margin-bottom:2rem"><h1 style="font-size:1.8rem;font-weight:900;margin-bottom:.5rem">🚀 Trending in India</h1><p style="color:var(--text-dim)">See what's hot in India's commerce tech ecosystem right now</p></div>
  <div class="stats-row" style="grid-template-columns:repeat(4,1fr)">
    ${[{icon:'fa-arrow-trend-up',color:'#10b981',bg:'rgba(16,185,129,.15)',value:risers.length,label:'Rising Products'},
      {icon:'fa-plus-circle',color:'#6366f1',bg:'rgba(99,102,241,.15)',value:PRODUCTS.filter(p=>p.badge==='new').length,label:'New Entries'},
      {icon:'fa-fire',color:'#f59e0b',bg:'rgba(245,158,11,.15)',value:PRODUCTS.filter(p=>p.badge==='trending').length,label:'Hot & Trending'},
      {icon:'fa-chart-line',color:'#0ea5e9',bg:'rgba(14,165,233,.15)',value:'+'+Math.round(risers.slice(0,10).reduce((a,p)=>a+(p.trend[7]-p.trend[0]),0)/10),label:'Avg Top-10 Growth'}
    ].map(s=>`<div class="stat-card"><div class="stat-icon" style="background:${s.bg};color:${s.color}"><i class="fas ${s.icon}"></i></div><div class="stat-value">${s.value}</div><div class="stat-label">${s.label}</div></div>`).join('')}
  </div>
  <h2 style="margin:1.5rem 0 1rem;font-size:1.1rem;font-weight:700">🚀 Top Risers</h2>
  <div class="products-grid">${risers.map(p=>renderProductCard(p)).join('')}</div>`;
}

function showComparePage(){
  document.getElementById('heroSection').style.display='none';
  document.getElementById('sidebar').style.display='none';
  const c=document.getElementById('contentArea');c.style.padding='2rem';
  const top=[...PRODUCTS].sort((a,b)=>parseFloat(b.overallRating)-parseFloat(a.overallRating)).slice(0,10);
  const opts=top.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
  c.innerHTML=`<div style="margin-bottom:2rem"><h1 style="font-size:1.8rem;font-weight:900;margin-bottom:.5rem">⚖️ Compare Products</h1><p style="color:var(--text-dim)">Side-by-side comparison of top commerce tools</p></div>
  <div style="display:flex;gap:12px;margin-bottom:2rem;align-items:center;flex-wrap:wrap">
    <select id="compare1" style="background:var(--bg-card);color:var(--text);border:1px solid var(--border);padding:10px 14px;border-radius:10px;font-size:.9rem;flex:1;min-width:200px">${opts}</select>
    <div style="font-weight:900;font-size:1.2rem;color:var(--primary)">VS</div>
    <select id="compare2" style="background:var(--bg-card);color:var(--text);border:1px solid var(--border);padding:10px 14px;border-radius:10px;font-size:.9rem;flex:1;min-width:200px">${top.length>1?top.map((p,i)=>`<option value="${p.id}" ${i===1?'selected':''}>${p.name}</option>`).join(''):opts}</select>
    <button class="btn btn-primary" onclick="runCompare()"><i class="fas fa-code-compare"></i> Compare</button>
  </div>
  <div id="compareResult"></div>`;
  runCompare();
}

function runCompare(){
  const id1=parseInt(document.getElementById('compare1').value);
  const id2=parseInt(document.getElementById('compare2').value);
  const p1=PRODUCTS.find(p=>p.id===id1);const p2=PRODUCTS.find(p=>p.id===id2);
  if(!p1||!p2)return;
  const metrics=[
    {label:'Overall Rating',v1:p1.overallRating,v2:p2.overallRating},
    {label:'Reddit Score',v1:p1.social?.reddit?.score,v2:p2.social?.reddit?.score},
    {label:'ProductHunt Score',v1:p1.social?.producthunt?.score,v2:p2.social?.producthunt?.score},
    {label:'G2 Score',v1:p1.social?.g2?.score,v2:p2.social?.g2?.score},
    {label:'Capterra Score',v1:p1.social?.capterra?.score,v2:p2.social?.capterra?.score},
    {label:'Google Trends',v1:p1.googleTrends?.avgInterest,v2:p2.googleTrends?.avgInterest},
    {label:'News Mentions',v1:p1.googleNews?.totalMentions,v2:p2.googleNews?.totalMentions},
  ];
  const rows=metrics.map(m=>{
    const v1=parseFloat(m.v1||0);const v2=parseFloat(m.v2||0);
    const w1=v1>v2?'color:var(--success);font-weight:700':'';const w2=v2>v1?'color:var(--success);font-weight:700':'';
    return `<tr style="border-bottom:1px solid var(--border)">
      <td style="${w1};padding:12px;text-align:right">${m.v1||'—'} ${v1>v2?'✓':''}</td>
      <td style="padding:12px;text-align:center;font-size:.78rem;color:var(--text-muted)">${m.label}</td>
      <td style="${w2};padding:12px;text-align:left">${v2>v1?'✓':''} ${m.v2||'—'}</td>
    </tr>`;
  }).join('');
  document.getElementById('compareResult').innerHTML=`
  <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:1rem;margin-bottom:1rem">
    <div style="text-align:center;padding:1.5rem;background:var(--bg-card);border-radius:var(--radius);border:1px solid var(--border)"><div style="width:48px;height:48px;background:${p1.color};border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;margin:0 auto 8px">${p1.logo}</div><div style="font-weight:700">${p1.name}</div><div style="font-size:.75rem;color:var(--text-muted)">${p1.pricing}</div></div>
    <div style="display:flex;align-items:center;font-weight:900;font-size:1.5rem;color:var(--primary)">VS</div>
    <div style="text-align:center;padding:1.5rem;background:var(--bg-card);border-radius:var(--radius);border:1px solid var(--border)"><div style="width:48px;height:48px;background:${p2.color};border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;margin:0 auto 8px">${p2.logo}</div><div style="font-weight:700">${p2.name}</div><div style="font-size:.75rem;color:var(--text-muted)">${p2.pricing}</div></div>
  </div>
  <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden">
    <table style="width:100%;border-collapse:collapse">${rows}</table>
  </div>`;
}

function showInsightsPage(){
  document.getElementById('heroSection').style.display='none';
  document.getElementById('sidebar').style.display='none';
  const c=document.getElementById('contentArea');c.style.padding='2rem';
  const avgGT=Math.round(PRODUCTS.reduce((a,p)=>a+(p.googleTrends?p.googleTrends.avgInterest:0),0)/PRODUCTS.length);
  const totalNews=PRODUCTS.reduce((a,p)=>a+(p.googleNews?p.googleNews.totalMentions:0),0);
  const rising=PRODUCTS.filter(p=>p.googleTrends&&p.googleTrends.trendDirection==='rising').length;
  c.innerHTML=`<div style="margin-bottom:2rem"><h1 style="font-size:1.8rem;font-weight:900;margin-bottom:.5rem">📊 Market Insights</h1><p style="color:var(--text-dim)">Deep-dive analytics across 8 data sources</p></div>
  <div class="stats-row">
    ${[{icon:'fa-box',color:'#6366f1',bg:'rgba(99,102,241,.15)',value:PRODUCTS.length+'+',label:'Products Tracked'},
      {icon:'fa-arrow-trend-up',color:'#10b981',bg:'rgba(16,185,129,.15)',value:rising,label:'Rising on Google Trends'},
      {icon:'fa-chart-line',color:'#4285f4',bg:'rgba(66,133,244,.15)',value:avgGT,label:'Avg Trends Score'},
      {icon:'fa-newspaper',color:'#ea4335',bg:'rgba(234,67,53,.15)',value:totalNews.toLocaleString(),label:'News Mentions'}
    ].map(s=>`<div class="stat-card"><div class="stat-icon" style="background:${s.bg};color:${s.color}"><i class="fas ${s.icon}"></i></div><div class="stat-value">${s.value}</div><div class="stat-label">${s.label}</div></div>`).join('')}
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-top:1.5rem">
    <div class="detail-section"><h4><i class="fas fa-chart-bar"></i> Products by Category</h4><div class="chart-container"><canvas id="catChart"></canvas></div></div>
    <div class="detail-section"><h4><i class="fas fa-face-smile"></i> Overall Sentiment</h4><div class="chart-container"><canvas id="sentChart"></canvas></div></div>
  </div>
  <div class="detail-section" style="margin-top:1.5rem"><h4><i class="fas fa-trophy"></i> Top 10 by Rating</h4>
    ${[...PRODUCTS].sort((a,b)=>parseFloat(b.overallRating)-parseFloat(a.overallRating)).slice(0,10).map((p,i)=>`<div onclick="openModal(${p.id})" style="display:flex;align-items:center;gap:12px;padding:10px;border-radius:8px;cursor:pointer;transition:background .2s" onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background=''"><span style="font-size:.9rem;font-weight:900;color:var(--primary);min-width:24px">#${i+1}</span><div style="width:32px;height:32px;background:${p.color};border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:.7rem;font-weight:800">${p.logo}</div><div style="flex:1;font-size:.85rem;font-weight:600">${p.name}</div><div style="font-weight:700;color:var(--accent)">⭐ ${p.overallRating}</div></div>`).join('')}
  </div>`;
  setTimeout(()=>{
    const cats=CATEGORIES.filter(c=>c.id!=='all');
    const catCtx=document.getElementById('catChart');
    if(catCtx)new Chart(catCtx,{type:'bar',data:{labels:cats.map(c=>c.name.replace(' / ','/')),datasets:[{data:cats.map(c=>c.count),backgroundColor:cats.map(c=>c.color+'cc'),borderRadius:6,barThickness:20}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{grid:{color:'rgba(51,65,85,.5)'},ticks:{color:'#64748b'}},x:{grid:{display:false},ticks:{color:'#64748b',font:{size:10}}}}}});
    const allPos=PRODUCTS.reduce((a,p)=>a+(p.social?.sentiment?.positive||0),0);
    const allNeu=PRODUCTS.reduce((a,p)=>a+(p.social?.sentiment?.neutral||0),0);
    const allNeg=PRODUCTS.reduce((a,p)=>a+(p.social?.sentiment?.negative||0),0);
    const sentCtx=document.getElementById('sentChart');
    if(sentCtx)new Chart(sentCtx,{type:'doughnut',data:{labels:['Positive','Neutral','Negative'],datasets:[{data:[allPos,allNeu,allNeg],backgroundColor:['#10b981','#f59e0b','#ef4444'],borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{color:'#94a3b8',padding:16}}}}});
  },100);
}

function openModal(id){
  const p=PRODUCTS.find(x=>x.id===id);if(!p)return;
  const catName=CATEGORIES.find(c=>c.id===p.category)?.name||p.category;
  const links=p.links||{};const gt=p.googleTrends||{};const gn=p.googleNews||{};
  const s=p.social||{};const sent=s.sentiment||{positive:60,neutral:25,negative:15};
  const trendDir=gt.trendDirection||'stable';
  const linksHTML=Object.entries(links).filter(([k,v])=>v).map(([k,v])=>`<a href="${v}" target="_blank" class="link-card"><div class="link-icon" style="background:rgba(99,102,241,.15);color:var(--primary)"><i class="fas fa-${k==='website'?'globe':k==='pricing'?'tag':k==='features'?'list':k==='docs'?'book':'link'}"></i></div><div class="link-text"><div class="link-title">${k.charAt(0).toUpperCase()+k.slice(1)}</div><div class="link-url">${v.replace('https://','').substring(0,30)}</div></div><i class="fas fa-arrow-right link-arrow"></i></a>`).join('');
  const articlesHTML=(gn.articles||[]).map(a=>`<div style="padding:10px;background:var(--bg-card);border-radius:8px;margin-bottom:8px;border-left:3px solid #ea4335"><div style="font-size:.78rem;font-weight:600;margin-bottom:4px;color:var(--text)">${a.title}</div><div style="font-size:.68rem;color:var(--text-muted)">${a.source} · ${a.time} · <span style="color:${a.sentiment==='positive'?'var(--success)':'var(--text-muted)'}">${a.sentiment}</span></div></div>`).join('');
  const reviewsHTML=['reddit','producthunt','x','linkedin'].map(src=>{const d=s[src];if(!d)return '';const icons={reddit:'fab fa-reddit',producthunt:'fab fa-product-hunt',x:'fab fa-x-twitter',linkedin:'fab fa-linkedin'};const cols={reddit:'#ff4500',producthunt:'#da552f',x:'#000',linkedin:'#0077b5'};return `<div class="social-review"><div class="source"><i class="${icons[src]}" style="color:${cols[src]}"></i><span>${src.charAt(0).toUpperCase()+src.slice(1)}</span><span class="time">recent</span></div><p>"${d.sample||''}"</p></div>`;}).join('');
  document.getElementById('modalContent').innerHTML=`
  <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
  <div class="modal-header">
    <div class="modal-logo" style="background:${p.color}">${p.logo}</div>
    <div><h2 style="font-size:1.3rem;font-weight:800;margin-bottom:2px">${p.name}</h2><div style="font-size:.78rem;color:var(--text-muted)">${catName} · Est. ${p.founded} · ${p.hq}</div></div>
  </div>
  <div style="display:flex;gap:20px;margin-bottom:1.5rem;flex-wrap:wrap">
    <div style="flex:1;min-width:250px">
      <p style="color:var(--text-dim);margin-bottom:12px;line-height:1.6;font-size:.9rem">${p.tagline}. Serving the Indian market with solutions designed for local compliance, GST, UPI and modern commerce needs.</p>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">${p.tags.map(t=>`<span class="card-tag">${t}</span>`).join('')}<span class="card-tag" style="background:rgba(16,185,129,.15);color:#10b981">${p.pricing}</span></div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">${(p.features||[]).map(f=>`<span class="quick-link">${f}</span>`).join('')}</div>
    </div>
    <div style="text-align:center;padding:1rem;background:var(--bg-card);border-radius:12px;border:1px solid var(--border);min-width:110px">
      <div style="font-size:2rem;font-weight:900;background:var(--gradient-1);-webkit-background-clip:text;-webkit-text-fill-color:transparent">${p.overallRating}</div>
      <div style="color:#f59e0b;font-size:.85rem">★★★★☆</div>
      <div style="font-size:.7rem;color:var(--text-muted);margin-top:2px">Overall Score</div>
      <div style="font-size:.62rem;color:var(--text-muted)">8 sources</div>
    </div>
  </div>
  ${linksHTML?'<div class="detail-section" style="margin-bottom:1.5rem"><h4><i class="fas fa-link"></i> Official Links</h4><div class="links-grid">'+linksHTML+'</div></div>':''}
  <div class="detail-grid">
    <div class="detail-section"><h4><i class="fas fa-chart-bar"></i> Platform Ratings</h4><div class="platform-ratings">
      ${[['🔴','Reddit',s.reddit?.score,s.reddit?.reviews+' reviews'],['📦','ProductHunt',s.producthunt?.score,s.producthunt?.upvotes+' upvotes'],['G2','G2',s.g2?.score,s.g2?.reviews+' reviews'],['Cap','Capterra',s.capterra?.score,s.capterra?.reviews+' reviews'],['G','Trends',gt.avgInterest,gt.trendDirection],['📰','News',gn.totalMentions,gn.last30Days+' (30d)']].map(([ic,name,score,sub])=>`<div class="platform-rating-item"><div class="platform-name">${name}</div><div class="platform-score" style="color:var(--primary)">${score||'—'}</div><div style="font-size:.6rem;color:var(--text-muted)">${sub||''}</div></div>`).join('')}
    </div></div>
    <div class="detail-section"><h4><i class="fas fa-face-smile"></i> Sentiment Analysis</h4>
      <div style="font-size:.7rem;color:var(--text-muted);margin-bottom:10px">Aggregated from Reddit, X, LinkedIn, ProductHunt, Google News</div>
      ${[['Positive','#10b981',sent.positive],['Neutral','#f59e0b',sent.neutral],['Negative','#ef4444',sent.negative]].map(([l,c,v])=>`<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:.78rem;color:${c}">${l}</span><span style="font-size:.78rem;font-weight:700">${v}%</span></div><div style="height:8px;background:var(--bg);border-radius:4px;overflow:hidden"><div style="height:100%;width:${v}%;background:${c};border-radius:4px"></div></div></div>`).join('')}
    </div>
  </div>
  <div class="detail-section" style="margin-bottom:1.5rem"><h4><i class="fas fa-comments"></i> Community Feedback</h4>${reviewsHTML}</div>
  ${articlesHTML?'<div class="detail-section"><h4><i class="far fa-newspaper" style="color:#ea4335"></i> Google News</h4>'+articlesHTML+'</div>':''}
  `;
  document.getElementById('modalOverlay').classList.add('active');
}

document.addEventListener('DOMContentLoaded', loadData);

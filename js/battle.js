/* ==================================================================
   액팅 소울 : 0 — 신들의 종언 (시즌 2 체험판)  v0.5.0
   js/battle.js — 전투 (3인칭 백뷰)

   게임 판정은 평면 좌표(px)로 계산하고, 그릴 때 S(=1/30)를 곱해 미터로 바꾼다.
   - CH       : 이든 · 네시스 능력치와 스킬
   - ET       : 적 능력치 (av = assets/avatars.js 아이디)
   - BATTLES  : 전투 구성 (arena = assets/backgrounds.js 아이디)
   - AI       : 적 행동 패턴
   ================================================================== */
'use strict';
const S=1/30;
const CH={
  eden:{name:'이든',title:'대행자',maxhp:520,spd:255,col:'#b49bff',weapons:['sentia','sensus'],
    q:{n:'공허',full:'태초의 공허',cd:9},e:{n:'뇌격',full:'센티아 뇌격',cd:7},heavy:'센수스 회전베기'},
  nesis:{name:'네시스',title:'집행자',maxhp:600,spd:238,col:'#9fdcff',weapons:['eruptio','klausroom'],
    q:{n:'흡융',full:'흡융',cd:10},e:{n:'폭염',full:'이럽디오 폭염',cd:7},heavy:'대검 내려찍기'},
};
/* 무기별 기본 공격(3연격)과 호출 스킬. 손에 든 무기에 따라 공격이 바뀌고, 등에 멘 무기는 Z(호출)로 불러낸다.
   fin = 3타째 추가 효과: chain(연쇄 번개) · gust(폭풍 파동) · wave(불꽃 파동) · pierce(관통 찌르기) */
const KIT={
  sentia:{col:'#59c8ff',combo:[{d:.18,r:84,a:1.8,dmg:9},{d:.18,r:84,a:1.8,dmg:9},{d:.3,r:100,a:2.4,dmg:15,fin:'chain'}],
    call:{n:'뇌전 일섬',cd:12,bark:['센티아','사각 확보. 일직선으로 꿰뚫는다!']}},
  sensus:{col:'#c77dff',combo:[{d:.24,r:96,a:2.5,dmg:12},{d:.24,r:96,a:2.5,dmg:12},{d:.36,r:112,a:3.2,dmg:19,fin:'gust'}],
    call:{n:'폭풍 난무',cd:12,bark:['센수스','나왔다아! 다 날려버릴 거야!']}},
  eruptio:{col:'#5aa9ff',combo:[{d:.3,r:108,a:2.6,dmg:15},{d:.3,r:108,a:2.6,dmg:15},{d:.45,r:122,a:3.4,dmg:24,fin:'wave'}],
    call:{n:'염화 강타',cd:12,bark:['이럽디오','길을 막는 것은 전부 녹여주마!']}},
  klausroom:{col:'#f2f6ff',combo:[{d:.2,r:92,a:1.7,dmg:11},{d:.2,r:92,a:1.7,dmg:11},{d:.32,r:100,a:1.2,dmg:16,fin:'pierce'}],
    call:{n:'백야 일섬',cd:12,bark:['클라우스룸','정지된 궤적을 베겠습니다.']}},
};
const heldOf=k=>P.held[k],backOf=k=>CH[k].weapons.find(w=>w!==P.held[k]);
const ET={
  dummy:{name:'훈련용 홀로그램',hp:30,r:16,spd:0,ai:'dummy',dmg:0,col:'#58d6ff',holo:1,hgt:2},
  holo:{name:'강화 공허체 (시뮬)',hp:44,r:16,spd:115,ai:'chaser',dmg:12,col:'#58d6ff',holo:1,hgt:2},
  holobrute:{name:'강화 공허체 · 거구 (시뮬)',hp:220,r:28,spd:70,ai:'brute',dmg:26,col:'#58d6ff',holo:1,armor:.75,heavy:1,hgt:2.9},
  claw:{name:'침식체 · 금속 발톱',hp:62,r:16,spd:150,ai:'chaser',dmg:15,col:'#9aa3b5',lunge:1,hgt:1.4},
  spitter:{name:'침식 폴른',hp:50,r:15,spd:95,ai:'spitter',dmg:15,col:'#a17bd6',hgt:1.8},
  brute:{name:'침식체 · 금속 외피',hp:260,r:30,spd:72,ai:'brute',dmg:34,col:'#7d8597',armor:.65,heavy:1,hgt:2.9},
  minion:{name:'금속 사도',hp:58,r:13,spd:170,ai:'chaser',dmg:12,col:'#c9b6ff',lunge:1,hgt:1.5},
  abi:{name:'아비',sub:'강림의 초석 부하 · 심연',hp:1400,r:22,spd:205,ai:'abi',boss:1,col:'#b46cff',heavy:1,hgt:2.1},
  mor:{name:'모르',sub:'강림의 초석 부하 · 종말',hp:1850,r:32,spd:115,ai:'mor',boss:1,col:'#77788f',armor:.8,heavy:1,hgt:2.6},
  phasis:{name:'파시스',sub:'제 5 초석 · 강림의 초석',hp:3600,r:34,spd:80,ai:'phasis',boss:1,col:'#c084fc',heavy:1,hgt:3.3},
};
const ALLY_DEF={'렉소르':{av:'rexor',c:'#ff6b5b',hp:360,r:17},'콘투수스':{av:'contusus',c:'#ff8f6b',hp:280,r:14},'투몰투스':{av:'tumultus',c:'#ffa07a',hp:280,r:14}};
const BATTLES={
  tut:{arena:'chamber',w:1200,h:900,allies:[],obj:'에테르 챔버 — 전투 시뮬레이션'},
  outpost:{arena:'outpost',w:1500,h:1100,allies:['렉소르','콘투수스','투몰투스'],core:true,
    waves:[[['claw',7]],[['claw',6],['spitter',4]],[['claw',6],['spitter',3],['brute',2]]],obj:'방어막 발생기를 지켜라'},
  abimor:{arena:'waste',w:1500,h:1100,allies:['렉소르','콘투수스','투몰투스'],bosses:['abi','mor'],obj:'강림의 초석의 사자를 처치하라'},
  phasis:{arena:'phasis',w:1500,h:1100,allies:['렉소르','콘투수스','투몰투스'],bosses:['phasis'],obj:'제 5 초석 파시스를 처치하라'},
};

let B=null,P=null;
function newPlayer(x,y){
  return{x,y,face:-PI/2,active:'eden',hp:{eden:CH.eden.maxhp,nesis:CH.nesis.maxhp},atkT:0,combo:0,comboWin:0,sw:1,
    dashT:0,dashI:0,dashCd:0,dvx:0,dvy:0,iT:0,perfectUsed:false,cdQ:{eden:0,nesis:0},cdE:{eden:0,nesis:0},tagCd:0,link:0,r:14,
    held:{eden:'sentia',nesis:'eruptio'},cdZ:{eden:0,nesis:0},swCd:0,
    holdT:-1,atkBuf:0,pend:[],pose:null,poseT:0,poseD:1,mvx:0,mvy:0,moving:0,hz:0,vz:0,airPress:false,airAtkUsed:false,plunge:false,landShock:false,
    rig:{eden:makeAvatar('eden'),nesis:makeAvatar('nesis')}};
}
function startBattle(id){
  const def=BATTLES[id];
  B={id,def,w:def.w,h:def.h,t:0,en:[],haz:[],eb:[],pb:[],fields:[],allies:[],ghosts:[],items:[],egos:[],egoRig:{},egoW:{},nearItem:null,core:null,
     wave:-1,spawnQ:[],spawnT:0,shake:0,hitstop:0,slow:0,slowS:1,
     combo:0,comboT:0,stats:{time:0,taken:0,maxCombo:0,perfect:0},barked:{},tut:null,over:false,winT:-1,cine:null,linkInv:0,bossIds:[],
     camYaw:-PI/2,camPitch:.3,camDist:6.2,cp:null};
  B.envDef=BACKGROUNDS[def.arena];B.env=B.envDef.build({w:def.w*S,h:def.h*S,arena:true});B.cfg=B.envDef.cfg;
  FX.clear();
  P=newPlayer(def.w/2,def.h*0.62);
  def.allies.forEach((n,i)=>{const a=ALLY_DEF[n];B.allies.push({name:n,c:a.c,r:a.r,maxhp:a.hp,hp:a.hp,x:def.w/2+(i-1)*70,y:def.h*0.7,atkCd:rand(0,1),down:0,face:-PI/2,swing:0,rig:makeAvatar(a.av),px:0,py:0,mv:0});});
  if(def.core){B.core={x:def.w/2,y:def.h*0.76,r:38,hp:1000,maxhp:1000,flash:0};P.y=def.h*0.45;B.gen=PROPS.generator.build();}
  if(def.bosses)def.bosses.forEach((b,i)=>{const e=spawn(b,def.w/2+(def.bosses.length>1?(i?160:-160):0),def.h*0.28);B.bossIds.push(e);});
  if(id==='tut')tutInit();
  if(def.waves)nextWave();
  hideDialog();['card','title','chap','fin','result','over','pause'].forEach(i=>show(i,false));GS.map=false;show('map',false);
  GS.mode='battle';GS.paused=false;masterRefresh();
  show('hud',true);show('ctrl',true);show('pauseB',true);
  $('banner').classList.remove('on');$('barks').innerHTML='';
  if(id==='abimor')setTimeout(()=>B&&bark('이든','...온다! 전원, 전투 배치!'),400);
  if(id==='phasis'){SFX.boss();setTimeout(()=>B&&bark('파시스','가소롭구나. 창조의 숨결이 닿은 금속을 감히 인간의 손으로 붙잡으려 들다니.'),500);}
  if(id==='outpost')setTimeout(()=>B&&bark('렉소르','분노의 우니타스, 대행자님의 뒤를 받쳐라!'),400);
  if(!inp.touch)banner('<b>조작</b> · 화면을 클릭하면 마우스로 시점을 돌립니다 · <b>M</b> 지도 · <b>Esc</b> 설정',3500);
  updateHudStatic();
}
function spawn(type,x,y){
  const d=ET[type];
  const e={type,d,x,y,r:d.r,hp:d.hp,maxhp:d.hp,state:'move',st:0,cd:rand(.6,1.4),face:PI/2,flash:0,kx:0,ky:0,tgt:null,tgtT:0,q:[],busy:0,inv:false,alive:true,
    t:Math.random()*10,spawnT:0.4,stun:0,windT:0,swing:0,swingD:.3,swingBig:false,rig:makeAvatar(d.av||type),px:x,py:y,mv:0};
  B.en.push(e);FX.burst(x*S,1,y*S,12,d.col,4,.5,.09);
  return e;
}
function edgePos(){
  const side=(Math.random()*3)|0,w=B.w,h=B.h;let x,y;
  if(side===0){x=rand(80,w-80);y=60;}else if(side===1){x=60;y=rand(60,h*.6);}else{x=w-60;y=rand(60,h*.6);}
  if(Math.hypot(x-P.x,y-P.y)<260)x=w-x;return{x,y};
}
function nextWave(){
  B.wave++;for(const [t,n] of B.def.waves[B.wave])for(let i=0;i<n;i++)B.spawnQ.push(t);
  B.spawnQ.sort(()=>Math.random()-.5);B.spawnT=0.6;
  banner(`<b>WAVE ${B.wave+1} / ${B.def.waves.length}</b>`,1800);
  if(B.wave===1)setTimeout(()=>B&&bark('투몰투스','폴른도 변이했습니다! 원거리 산성탄 주의!'),1500);
  if(B.wave===2)setTimeout(()=>B&&bark('콘투수스','저 덩치 큰 놈들, 외피가 완전 강철이에요!'),1500);
}

/* ---------- 메시지 ---------- */
let bannerTimer=null;
function banner(html,ms){const b=$('banner');b.innerHTML=html;b.classList.add('on');clearTimeout(bannerTimer);if(ms)bannerTimer=setTimeout(()=>b.classList.remove('on'),ms);}
function bark(n,x){
  const s=SPK[n]||{c:'#ddd',full:n};const el=document.createElement('div');el.className='bk';el.style.color=s.c;
  el.innerHTML=`<b>${n}</b><span></span>`;el.querySelector('span').textContent=x;
  const box=$('barks');box.appendChild(el);while(box.children.length>2)box.removeChild(box.firstChild);
  setTimeout(()=>{el.style.transition='opacity .4s';el.style.opacity=0;setTimeout(()=>el.remove(),450);},3600);
}
function barkOnce(key,n,x){if(B.barked[key])return;B.barked[key]=1;bark(n,x);}
function ftxt(x,y,s,col,big,h){FX.text(x*S+rand(-.2,.2),h||2.1,y*S,s,col,big);}

/* ---------- 튜토리얼 ---------- */
const TUT=[
  {p:'<b>에토스</b> · 왼쪽 화면 드래그(PC는 WASD)로 이동하십시오. 오른쪽 화면 드래그(PC는 마우스)로 시점을 돌립니다.',init(){},done:()=>B.tut.moved>260},
  {p:'<b>에토스</b> · 공격(좌클릭)으로 홀로그램을 베십시오. 연달아 누르면 3연격, <b>0.5초 누르고 있으면 강공격</b>입니다.',init(){ring('dummy',3,170);},done:()=>alive()===0},
  {p:'<b>에토스</b> · 붉은 표식은 공격 범위입니다. <b>회피(Shift)</b>로 빠져나가십시오. 닿기 직전에 피하면 완벽 회피. 우클릭은 빠른 <b>대쉬</b>입니다.',init(){B.tut.dodges=0;B.tut.zt=0.6;},done:()=>B.tut.dodges>=2,
    tick(dt){B.tut.zt-=dt;if(B.tut.zt<=0){B.tut.zt=1.7;addHaz({k:'circle',x:P.x,y:P.y,r:62,t:.95,dmg:6});}}},
  {p:'<b>에토스</b> · <b>Space</b>로 점프합니다. 공중에서 <b>좌클릭</b>은 점프 공격, <b>Ctrl+좌클릭</b>은 내리꽂는 점프 강공격입니다. (휴대폰: 점프 후 공격 / 길게 누르기)',init(){B.tut.ja=0;ring('dummy',4,120);},done:()=>B.tut.ja>0&&alive()===0},
  {p:'<b>에토스</b> · 쓰러진 적은 아이템을 떨어뜨립니다. 가까이 가서 <b>F</b>(휴대폰: 줍기 버튼)로 주우십시오.',init(){B.tut.pick=0;dropItem('etherCrystal',P.x+Math.cos(B.camYaw)*140,P.y+Math.sin(B.camYaw)*140);},done:()=>B.tut.pick>0},
  {p:'<b>에토스</b> · 스킬 <b>Q</b> — 이든의 [태초의 공허]는 적을 끌어당겨 삼킵니다.',init(){P.cdQ.eden=0;B.tut.sk=0;ring('dummy',5,150,true);},done:()=>B.tut.sk>0&&alive()===0},
  {p:'<b>에토스</b> · 스킬 <b>E</b> — [센티아 뇌격]은 번개가 적을 연쇄로 꿰뚫고 잠시 멈춰 세웁니다.',init(){P.cdE.eden=0;B.tut.sk=0;ring('dummy',5,160);},done:()=>B.tut.sk>0&&alive()===0},
  {p:'<b>에토스</b> · <b>X</b>(마우스 휠)로 손의 무기와 등의 무기를 바꿔 쥐고, <b>Z</b>로 등 뒤의 무기를 <b>호출</b>해 공격시키십시오. 무기마다 공격이 다릅니다.',init(){P.cdZ.eden=0;B.tut.sw=0;B.tut.call=0;ring('dummy',5,150);},done:()=>B.tut.sw>0&&B.tut.call>0&&alive()===0},
  {p:'<b>에토스</b> · <b>교대(Tab)</b>로 네시스와 자리를 바꾸십시오. 교대하는 순간 등장 공격이 나갑니다.',init(){},done:()=>P.active==='nesis'},
  {p:'<b>에토스</b> · 네시스의 <b>Q [흡융]</b>은 사념을 흡수해 회복하고, <b>E [이럽디오 폭염]</b>은 푸른 불꽃 파동을 날립니다.',init(){P.cdQ.nesis=0;P.cdE.nesis=0;B.tut.sk=0;P.hp.nesis=Math.round(CH.nesis.maxhp*.6);ring('dummy',6,130);},done:()=>B.tut.sk>0&&alive()===0},
  {p:'<b>에토스</b> · 링크 게이지가 가득 찼습니다. <b>R</b> — [링크 0 : 공허 & 흡융]을 발동하십시오.',init(){P.link=100;B.tut.lk=0;ring('dummy',7,190);},done:()=>B.tut.lk>0&&alive()===0},
  {p:'<b>에토스</b> · 실전 시뮬레이션. 강화 공허체를 전멸시키십시오.',init(){B.tut.fw=0;for(let i=0;i<6;i++){const p=edgePos();spawn('holo',p.x,p.y);}},done:()=>false,
    tick(){if(alive()===0){if(B.tut.fw===0){B.tut.fw=1;for(let i=0;i<4;i++){const p=edgePos();spawn('holo',p.x,p.y);}const p=edgePos();spawn('holobrute',p.x,p.y);banner('<b>에토스</b> · 마지막 개체군입니다. 거구는 장갑이 두껍습니다 — 강공격과 스킬, 링크를 활용하십시오.',3500);}else if(B.tut.fw===1){B.tut.fw=2;win();}}}},
];
const TUT_LAST=TUT.length-1;
function alive(){let n=0;for(const e of B.en)if(e.alive)n++;return n;}
function ring(type,n,r,cluster){
  const f=B.camYaw,cx=cluster?P.x+Math.cos(f)*180:P.x,cy=cluster?P.y+Math.sin(f)*180:P.y;
  for(let i=0;i<n;i++){const a=i/n*TAU;spawn(type,clamp(cx+Math.cos(a)*(cluster?60:r),60,B.w-60),clamp(cy+Math.sin(a)*(cluster?60:r),60,B.h-60));}
}
function tutInit(){B.tut={i:-1,moved:0,dodges:0,sk:0,lk:0,ja:0,pick:0,sw:0,call:0};tutNext();}
function tutNext(){
  B.tut.i++;const s=TUT[B.tut.i];if(!s)return;
  banner(s.p+(B.tut.i<TUT_LAST?'<br><button class="sbtn skp" id="tutSkip">튜토리얼 건너뛰기</button>':''),0);
  const sk=$('tutSkip');if(sk)sk.onclick=e=>{e.stopPropagation();B.en.forEach(x=>x.alive=false);B.haz=[];B.tut.i=TUT_LAST-1;P.active='eden';updateHudStatic();tutNext();};
  s.init();
}
function tutUpdate(dt){const s=TUT[B.tut.i];if(!s)return;if(s.tick)s.tick(dt);
  if(s.done()){SFX.perfect();ftxt(P.x,P.y,'OK!','#8fd8ff',1,2.6);B.en=B.en.filter(e=>e.alive);tutNext();}}

/* ---------- 공격 예고(위험 구역) ---------- */
function addHaz(h){h.t0=h.t;h.life=h.life||0;B.haz.push(h);if(h.t>0.3)SFX.warn();if(h.owner)h.owner.windT=Math.max(h.owner.windT,h.t);return h;}
function inHaz(h,o,pad){
  pad=pad||0;const dx=o.x-h.x,dy=o.y-h.y,d=Math.hypot(dx,dy);
  switch(h.k){
    case 'circle':return d<=h.r+pad;
    case 'ring':return d<=h.r+pad&&d>=h.r2-pad;
    case 'cone':return d<=h.r+pad&&Math.abs(angDiff(h.ang,Math.atan2(dy,dx)))<=h.arc/2;
    case 'line':{const c=Math.cos(h.ang),s=Math.sin(h.ang);const al=dx*c+dy*s,pe=Math.abs(-dx*s+dy*c);return al>=-pad&&al<=h.len+pad&&pe<=h.w/2+pad;}
  }return false;
}
function hazHit(h){
  if(!h.hitP&&inHaz(h,P,P.r*.6)){h.hitP=1;if(h.k==='ring'&&P.hz>25){ftxt(P.x,P.y,'점프 회피!','#bfe9ff',1,2.8);addLink(6);B.stats.perfect++;}else hurtPlayer(h.dmg,h);}
  for(const a of B.allies)if(a.hp>0&&!(h.hitA&&h.hitA.has(a))&&inHaz(h,a,a.r*.5)){(h.hitA||(h.hitA=new Set())).add(a);hurtAlly(a,h.dmg*.6);}
  if(B.core&&!h.hitC&&inHaz(h,B.core,B.core.r*.6)){h.hitC=1;hurtCore(h.dmg*(h.coreMul||1));}
}
function updateHaz(dt){
  for(const h of B.haz){
    if(h.owner&&!h.owner.alive&&!h.fired){h.dead=1;continue;}
    if(h.t>0){h.t-=dt;if(h.t<=0){h.fired=1;h.ft=.25;hazHit(h);if(h.onFire)h.onFire(h);fxHaz(h);
        if(h.owner){h.owner.swing=h.owner.swingD=.3;h.owner.swingBig=!!h.big;h.owner.windT=0;}}}
    else{h.ft-=dt;h.life-=dt;if(h.life>0)hazHit(h);}
    if(h.fired&&h.life<=0&&h.ft<=0)h.dead=1;
  }
  B.haz=B.haz.filter(h=>!h.dead);
}
function fxHaz(h){
  const col=h.fxc||'#ff5a7a',x=h.x*S,z=h.y*S;
  if(h.k==='circle'||h.k==='ring'){FX.ring(x,z,h.r*S*.4,h.r*S*1.05,col,.35);FX.burst(x,.2,z,10,col,4,.45,.08);}
  else if(h.k==='line'){for(let i=0;i<6;i++){const t=Math.random()*h.len;FX.burst((h.x+Math.cos(h.ang)*t)*S,.3,(h.y+Math.sin(h.ang)*t)*S,2,col,3,.35,.07);}}
  else FX.burst((h.x+Math.cos(h.ang)*h.r*.6)*S,.4,(h.y+Math.sin(h.ang)*h.r*.6)*S,10,col,4,.4,.08);
  if(h.big){B.shake=Math.max(B.shake,.35);SFX.boom();}
}

/* ---------- 플레이어 ---------- */
function other(){return P.active==='eden'?'nesis':'eden';}
function nearestEnemy(x,y,maxd,filter){let best=null,bd=maxd||1e9;for(const e of B.en){if(!e.alive||e.inv||e.spawnT>0)continue;if(filter&&!filter(e))continue;const d=Math.hypot(e.x-x,e.y-y)-e.r;if(d<bd){bd=d;best=e;}}return best;}
function setPose(p,d){P.pose=p;P.poseT=0;P.poseD=d;}
function updatePlayer(dt){
  const c=CH[P.active];
  readMove();
  const sens=[.55,1,1.6][SAVE.sens]||1;
  B.camYaw+=inp.lookX*.0032*sens;B.camPitch=clamp(B.camPitch+inp.lookY*.0024*sens,.12,1.05);inp.lookT+=dt;
  const fx=Math.cos(B.camYaw),fy=Math.sin(B.camYaw);
  let mx=fx*(-inp.my)+(-fy)*inp.mx,my=fy*(-inp.my)+fx*inp.mx;
  const ml=Math.hypot(mx,my);if(ml>1){mx/=ml;my/=ml;}
  P.mvx=mx;P.mvy=my;P.moving=Math.min(1,ml);
  if(inp.touch&&inp.lookT>1.2&&ml>.3&&!B.cine){const d=angDiff(B.camYaw,Math.atan2(my,mx));if(Math.abs(d)<2.3)B.camYaw+=d*dt*.8;}
  if(B.tut&&ml)B.tut.moved+=c.spd*ml*dt;
  if(P.dashT>0){P.x+=P.dvx*dt;P.y+=P.dvy*dt;P.dashT-=dt;if(Math.random()<.6)B.ghosts.push({x:P.x,y:P.y,face:P.face,who:P.active,life:.22,max:.22});}
  else{const sp=c.spd*(P.atkT>0?0.28:1);P.x+=mx*sp*dt;P.y+=my*sp*dt;if(ml>.05&&P.atkT<=0)P.face=Math.atan2(my,mx);}
  P.x=clamp(P.x,24,B.w-24);P.y=clamp(P.y,24,B.h-24);
  if(P.dashT<=0)for(const e of B.en){if(!e.alive||e.spawnT>0)continue;const d=dist(P,e),m=P.r+e.r;if(d<m&&d>0){const k=(m-d)/d;P.x+=(P.x-e.x)*k*.5;P.y+=(P.y-e.y)*k*.5;}}
  if(B.core){const d=dist(P,B.core),m=P.r+B.core.r;if(d<m&&d>0){const k=(m-d)/d;P.x+=(P.x-B.core.x)*k;P.y+=(P.y-B.core.y)*k;}}
  if(M('nocd')){P.cdQ.eden=P.cdQ.nesis=P.cdE.eden=P.cdE.nesis=P.cdZ.eden=P.cdZ.nesis=0;P.swCd=Math.min(P.swCd,0);P.tagCd=Math.min(P.tagCd,0);P.dashCd=Math.min(P.dashCd,0);}
  if(M('link'))P.link=100;
  P.atkT-=dt;P.comboWin-=dt;P.dashI-=dt;P.dashCd-=dt;P.iT-=dt;P.tagCd-=dt;P.atkBuf-=dt;P.poseT+=dt;
  for(const k of ['eden','nesis']){P.cdQ[k]-=dt;P.cdE[k]-=dt;P.cdZ[k]-=dt;}P.swCd-=dt;
  if(P.pose&&P.poseT>=P.poseD)P.pose=null;
  for(const q of P.pend){q.t-=dt;if(q.t<=0&&!q.done){q.done=1;q.fn();}}P.pend=P.pend.filter(q=>!q.done);
  const o=other();if(P.hp[o]>0)P.hp[o]=Math.min(CH[o].maxhp,P.hp[o]+CH[o].maxhp*0.012*dt);
  if(B.cine)return;
  /* 점프 (Space) — 공중: 좌클릭 = 점프 공격, Ctrl+좌클릭(휴대폰은 0.5초 홀딩) = 점프 강공격 */
  if(inp.jumpP&&P.hz<=0&&P.dashT<=0){P.vz=390;P.hz=.1;P.airAtkUsed=false;P.plunge=false;P.landShock=false;SFX.dash();FX.ring(P.x*S,P.y*S,.2,.9,CH[P.active].col,.25);}
  if(P.hz>0||P.vz>0){P.vz-=1250*dt;P.hz+=P.vz*dt;
    if(P.hz<=0){P.hz=0;P.vz=0;
      if(P.plunge){P.plunge=false;plungeLand();}
      else if(P.landShock){P.landShock=false;meleeHit(75,7,10,{kb:120,col:CH[P.active].col});FX.ring(P.x*S,P.y*S,.2,75*S,CH[P.active].col,.3);}
      else FX.burst(P.x*S,.1,P.y*S,5,'#bbb',2,.3,.05);}}
  const air=P.hz>8;
  /* 좌클릭: 짧게 = 공격, 0.5초 홀딩 = 강공격 */
  if(inp.atkPress){P.holdT=0;P.airPress=air;
    if(air&&inp.atkCtrl){P.holdT=-1;doJumpHeavy();}}
  if(inp.atkDown&&P.holdT>=0){P.holdT+=dt;
    if(P.holdT>=0.5){if(P.airPress){if(air){P.holdT=-1;doJumpHeavy();}}else if(P.atkT<=0&&P.dashT<=0&&!air){P.holdT=-1;doHeavy();}}}
  if(inp.atkRel){inp.atkRel=false;if(P.holdT>=0&&P.holdT<0.5){if(P.airPress&&air)doJumpAttack();else P.atkBuf=0.35;}P.holdT=-1;}
  if(P.atkBuf>0&&P.atkT<=0&&P.dashT<=0){P.atkBuf=0;if(air)doJumpAttack();else doAttack();}
  /* F 줍기 */
  if(inp.fP&&B.nearItem)pickItem(B.nearItem);
  if(inp.dodgeP&&P.dashCd<=0)doDodge();
  if(inp.dashP&&P.dashCd<=0)doDash();
  if(inp.qP&&P.cdQ[P.active]<=0&&P.dashT<=0)doSkillQ();
  if(inp.eP&&P.cdE[P.active]<=0&&P.dashT<=0)doSkillE();
  if(inp.tagP&&P.tagCd<=0&&P.hp[o]>0)doTag(false);
  if(inp.swapP&&P.swCd<=0&&P.atkT<=0&&!B.egos.some(g=>g.owner===P.active))doSwap();
  if(inp.callP&&P.cdZ[P.active]<=0&&!B.egos.some(g=>g.owner===P.active))doCall();
  if(inp.rP&&P.link>=100)doLink();
}
function aimFace(range){const tg=nearestEnemy(P.x,P.y,range||230);if(tg)P.face=angTo(P,tg);else if(P.moving<.1)P.face=B.camYaw;return tg;}
/* 범위 공격 공통: (x,y) 중심 반지름 r. arc(라디안)를 주면 face 방향 부채꼴만, o.kb는 바깥쪽 넉백 */
function hitArea(x,y,r,dmg,o,arc,face){
  let n=0;
  for(const e of B.en){
    if(!e.alive||e.inv||e.spawnT>0)continue;
    const dx=e.x-x,dy=e.y-y,d=Math.hypot(dx,dy);if(d>r+e.r)continue;
    const ang=Math.atan2(dy,dx);
    if(arc&&arc<6&&d>e.r+8&&Math.abs(angDiff(face,ang))>arc/2)continue;
    hitEnemy(e,dmg,{...o,ang});n++;
  }
  return n;
}
function meleeHit(r,a,dmg,o){return hitArea(P.x,P.y,r,dmg,o,a,P.face);}
/* 적 돌진: 지금 위치에서 ang 방향으로 len 만큼, d초 동안 */
function dashTo(e,ang,len,d,pad){pad=pad||0;e.dash={x0:e.x,y0:e.y,x1:clamp(e.x+Math.cos(ang)*len,pad,B.w-pad),y1:clamp(e.y+Math.sin(ang)*len,pad,B.h-pad),t:0,d};}
function doAttack(){
  const K=KIT[heldOf(P.active)],col=K.col;if(P.comboWin<=0)P.combo=0;
  const k=K.combo[P.combo];aimFace(230);
  P.atkT=k.d;P.comboWin=k.d+0.45;P.sw=-P.sw;setPose('atk',k.d);
  P.x+=Math.cos(P.face)*10;P.y+=Math.sin(P.face)*10;
  meleeHit(k.r,k.a,k.dmg,{kb:P.combo===2?190:90,col});
  FX.slash(P.x*S,P.y*S,P.face,k.r*S,k.a,col,P.sw,1.05,heldOf(P.active)==='eruptio'?.5:.38);
  if(k.fin==='chain'){let src=P;const done=new Set();
    for(let j=0;j<3;j++){const n=nearestEnemy(src.x,src.y,170,e=>!done.has(e));if(!n)break;done.add(n);
      FX.bolt(src.x*S,1.2,src.y*S,n.x*S,1.1,n.y*S,'#7fdcff');hitEnemy(n,6,{kb:30,ang:angTo(src,n),col:'#7fdcff'});src=n;}}
  if(k.fin==='wave'||k.fin==='gust')B.pb.push({x:P.x,y:P.y,vx:Math.cos(P.face)*520,vy:Math.sin(P.face)*520,r:26,dmg:14,life:.55,pierce:1,hit:new Set(),col,k:'wave',ang:P.face,purple:k.fin==='gust'});
  if(k.fin==='pierce'){lineHit(P.x,P.y,P.face,220,46,14,{kb:80,col});FX.beam([P.x*S,1.1,P.y*S],[(P.x+Math.cos(P.face)*220)*S,1.1,(P.y+Math.sin(P.face)*220)*S],.12,'#ffffff',.9);}
  P.active==='eden'?SFX.slashE():SFX.slashN();
  P.combo=(P.combo+1)%3;
}
/* 직선 범위 공격 */
function lineHit(x,y,ang,len,w,dmg,o){
  const c=Math.cos(ang),sn=Math.sin(ang);let n=0;
  for(const e of B.en){if(!e.alive||e.inv||e.spawnT>0)continue;const dx=e.x-x,dy=e.y-y,al=dx*c+dy*sn,pe=Math.abs(-dx*sn+dy*c);
    if(al>=-e.r&&al<=len+e.r&&pe<=w/2+e.r){hitEnemy(e,dmg,{...o,ang});n++;}}return n;
}
/* ---------- 무기 전환 (X · 마우스 휠) ---------- */
function doSwap(){
  const k=P.active,nw=backOf(k);P.held[k]=nw;P.swCd=.5;P.combo=0;
  setHeld(P.rig[k],nw);updateHudStatic();if(B.tut)B.tut.sw++;
  const c=KIT[nw].col;FX.ring(P.x*S,P.y*S,.2,1.4,c,.3);FX.burst(P.x*S,1.2,P.y*S,14,c,4,.4,.08);SFX.tag();
  ftxt(P.x,P.y,WEAPONS[nw].name,c,1,2.7);
}
/* ---------- 호출 (Z): 등 뒤의 무기가 에고로 변해 한 번 공격하고 돌아온다 ---------- */
const EGO_T={out:.25,form:.18,atk:.6,back:.3};
function doCall(){
  const k=P.active,id=backOf(k),K=KIT[id];P.cdZ[k]=K.call.cd;setPose('cast',.3);
  const tg=nearestEnemy(P.x,P.y,420);const ang=tg?angTo(P,tg):P.face;
  const tx=tg?tg.x-Math.cos(ang)*(tg.r+40):P.x+Math.cos(ang)*150,ty=tg?tg.y-Math.sin(ang)*(tg.r+40):P.y+Math.sin(ang)*150;
  const eg={id,owner:k,t:0,ang,x:P.x,y:P.y,tx:clamp(tx,30,B.w-30),ty:clamp(ty,30,B.h-30),tg,fired:false};
  if(id==='sentia'||id==='klausroom'){eg.tx=P.x+Math.cos(ang+1.4)*50;eg.ty=P.y+Math.sin(ang+1.4)*50;}
  B.egos.push(eg);P.rig[k].wpn[id].vis=false;
  if(!B.egoRig[id]){B.egoRig[id]=makeAvatar('ego_'+id);B.egoW[id]=WEAPONS[id].build();}
  bark(K.call.bark[0],K.call.bark[1]);SFX.tag();if(B.tut)B.tut.call++;
}
function egoFire(eg){
  const K=KIT[eg.id],c=K.col,x=eg.x,y=eg.y;let a=eg.tg&&eg.tg.alive?angTo(eg,eg.tg):eg.ang;eg.ang=a;
  if(eg.id==='sentia'){lineHit(x,y,a,400,70,38,{kb:120,col:c});for(const e of B.en)if(e.alive&&!e.d.boss&&lineHitTest(e,x,y,a,400,70))e.stun=Math.max(e.stun,.6);
    FX.bolt(x*S,1.2,y*S,(x+Math.cos(a)*400)*S,1.1,(y+Math.sin(a)*400)*S,'#bff0ff',.3);eg.dash={x0:x,y0:y,x1:clamp(x+Math.cos(a)*400,30,B.w-30),y1:clamp(y+Math.sin(a)*400,30,B.h-30)};SFX.zap();}
  else if(eg.id==='sensus'){eg.spin=3;}
  else if(eg.id==='klausroom'){lineHit(x,y,a,460,60,42,{kb:150,col:c});FX.beam([x*S,1.2,y*S],[(x+Math.cos(a)*460)*S,1.2,(y+Math.sin(a)*460)*S],.3,'#ffffff',1);FX.pillar(x*S,y*S,.5,4,'#ffffff',.4);
    const h=CH.nesis.maxhp*.05;if(P.hp.nesis>0)P.hp.nesis=Math.min(CH.nesis.maxhp,P.hp.nesis+h);SFX.perfect();}
  else{hitArea(x+Math.cos(a)*40,y+Math.sin(a)*40,140,50,{kb:260,col:c,big:1});const fx=(x+Math.cos(a)*40)*S,fz=(y+Math.sin(a)*40)*S;
    FX.ring(fx,fz,.3,140*S,c,.45);FX.pillar(fx,fz,1,5,c,.5);FX.burst(fx,.3,fz,30,c,7,.6,.12);B.shake=Math.max(B.shake,.4);SFX.boom();}
}
function lineHitTest(e,x,y,a,len,w){const dx=e.x-x,dy=e.y-y,c=Math.cos(a),sn=Math.sin(a),al=dx*c+dy*sn;return al>=-e.r&&al<=len+e.r&&Math.abs(-dx*sn+dy*c)<=w/2+e.r;}
function updateEgos(dt){
  const T=EGO_T,tot=T.out+T.form+T.atk+T.back;
  for(const eg of B.egos){
    eg.t+=dt;const t=eg.t;
    if(t<T.out){const k=t/T.out;eg.x=lerp(P.x,eg.tx,k);eg.y=lerp(P.y,eg.ty,k);}
    else if(t<T.out+T.form){eg.x=eg.tx;eg.y=eg.ty;}
    else if(t<T.out+T.form+T.atk){
      if(!eg.fired){eg.fired=true;egoFire(eg);}
      const k=(t-T.out-T.form)/T.atk;
      if(eg.dash){const q=Math.min(1,k*3);eg.x=lerp(eg.dash.x0,eg.dash.x1,q);eg.y=lerp(eg.dash.y0,eg.dash.y1,q);}
      if(eg.spin>0&&k>=(3-eg.spin)/3){eg.spin--;hitArea(eg.x,eg.y,125,14,{kb:-80,col:KIT.sensus.col});FX.ring(eg.x*S,eg.y*S,.3,125*S,'#c77dff',.3);FX.burst(eg.x*S,1,eg.y*S,12,'#c77dff',5,.4,.09);SFX.slashE();}
    }else{const k=(t-T.out-T.form-T.atk)/T.back;eg.rx=lerp(eg.x,P.x,k);eg.ry=lerp(eg.y,P.y,k);}
    if(t>=tot){eg.done=true;P.rig[eg.owner].wpn[eg.id].vis=true;FX.burst(P.x*S,1.4,P.y*S,8,KIT[eg.id].col,3,.3,.07);}
  }
  B.egos=B.egos.filter(g=>!g.done);
}
function drawEgos(t){
  const T=EGO_T;
  for(const eg of B.egos){
    const c=KIT[eg.id].col,et=eg.t;
    if(et<T.out||et>=T.out+T.form+T.atk){ // 무기 모습으로 날아감 / 돌아옴
      const back=et>=T.out+T.form+T.atk,x=back?eg.rx:eg.x,y=back?eg.ry:eg.y,w=B.egoW[eg.id];
      w.p[0]=x*S;w.p[1]=1.4;w.p[2]=y*S;w.r[0]=t*14;w.r[1]=0;w.r[2]=PI/2;w.s[0]=w.s[1]=w.s[2]=1.3;R3.node(w,null,{emis:hex(c)});
      FX.trail(x*S,1.4,y*S,c,.1);
    }else{ // 에고 모습
      const k=et<T.out+T.form?(et-T.out)/T.form:1,p=et<T.out+T.form?0:(et-T.out-T.form)/T.atk;
      const fade=p>.8?(1-p)/.2:1;
      FX.shadow(eg.x*S,eg.y*S,.4,.25*k*fade);
      rigPose(B.egoRig[eg.id],{t,move:0,pose:p>0?(eg.id==='sensus'?'heavy':eg.id==='eruptio'?'heavy':'atk'):'cast',p:eg.id==='eruptio'?.45+.55*p:p,sw:1},eg.x,eg.y,eg.ang,{a:.7*k*fade,emis:hex(c).map(v=>v*.35)});
      if(k<1)FX.ring(eg.x*S,eg.y*S,.2,1.2,c,.2);
    }
  }
}
function doHeavy(){
  aimFace(260);SFX.heavy();
  if(P.active==='eden'){
    P.atkT=.55;setPose('heavy',.55);
    const c=KIT[heldOf('eden')].col,go=(dmg,kb)=>{meleeHit(128,7,dmg,{kb,col:c});FX.slash(P.x*S,P.y*S,0,128*S,6.2,c,1,1.0,.3);FX.slash(P.x*S,P.y*S,PI,120*S,6.2,c,-1,1.2,.3);FX.ring(P.x*S,P.y*S,.5,128*S,c,.3);};
    go(24,200);P.pend.push({t:.28,fn:()=>go(16,120)});
    if(Math.random()<.5)bark('센수스',pick(['빙글빙글~ 다 날려버려!','폭풍이다아!']));
  }else{
    P.atkT=.75;setPose('heavy',.75);
    P.pend.push({t:.4,fn:()=>{const x=P.x+Math.cos(P.face)*60,y=P.y+Math.sin(P.face)*60;
      hitArea(x,y,130,46,{kb:240,col:'#7cc4ff',big:1});
      FX.ring(x*S,y*S,.3,130*S,'#7cc4ff',.4);FX.ring(x*S,y*S,.2,90*S,'#ffffff',.3);FX.pillar(x*S,y*S,.8,4,'#5aa9ff',.4);FX.burst(x*S,.3,y*S,26,'#6cb8ff',6,.6,.12);
      B.shake=Math.max(B.shake,.4);SFX.boom();}});
  }
}
function doJumpAttack(){
  if(P.airAtkUsed||P.plunge)return;P.airAtkUsed=true;aimFace(230);
  P.atkT=.3;setPose('atk',.3);P.sw=-P.sw;P.vz=Math.min(P.vz,0)-180;P.landShock=true;
  meleeHit(104,2.8,16,{kb:120,col:CH[P.active].col});
  FX.slash(P.x*S,P.y*S,P.face,104*S,2.8,CH[P.active].col,P.sw,1.0+P.hz*S,.4);
  P.active==='eden'?SFX.slashE():SFX.slashN();if(B.tut)B.tut.ja++;
}
function doJumpHeavy(){
  if(P.plunge)return;aimFace(260);P.plunge=true;P.vz=-1150;P.atkT=.5;setPose('plunge',.6);SFX.heavy();if(B.tut)B.tut.ja++;
}
function plungeLand(){
  const col=P.active==='eden'?'#c77dff':'#6cb8ff',x=P.x+Math.cos(P.face)*20,y=P.y+Math.sin(P.face)*20;
  hitArea(x,y,140,42,{kb:260,col,big:1});
  FX.ring(x*S,y*S,.3,140*S,col,.45);FX.ring(x*S,y*S,.2,100*S,'#ffffff',.3);FX.pillar(x*S,y*S,.9,5,col,.45);FX.burst(x*S,.3,y*S,30,col,7,.6,.12);
  B.shake=Math.max(B.shake,.45);SFX.boom();setPose('heavy',.25);
}
/* ---------- 아이템 ---------- */
function dropItem(id,x,y){B.items.push({id,x:clamp(x,40,B.w-40),y:clamp(y,40,B.h-40),t:0,life:25,seed:Math.random()*9});}
function rollDrops(e){
  if(e.type==='dummy')return;
  if(e.d.boss){dropItem('etherCrystal',e.x-30,e.y);dropItem('etherCrystal',e.x+30,e.y);dropItem('linkShard',e.x,e.y+30);return;}
  for(const id in ITEMS)if(Math.random()<ITEMS[id].drop){dropItem(id,e.x+rand(-20,20),e.y+rand(-20,20));break;}
}
function updateItems(dt){
  let near=null,nd=75;
  for(const it of B.items){it.t+=dt;it.life-=dt;const d=Math.hypot(it.x-P.x,it.y-P.y);if(d<nd){nd=d;near=it;}}
  B.items=B.items.filter(it=>it.life>0);B.nearItem=near;
  const pr=U('interact');
  if(near)setH(pr,inp.touch?`${ITEMS[near.id].name} — 눌러서 줍기`:`<span class="key">F</span> ${ITEMS[near.id].name} 줍기`);
  setC(pr,'hide',!near);setC(U('bF'),'hide',!near);
}
function pickItem(it){
  const d=ITEMS[it.id];B.items=B.items.filter(x=>x!==it);B.nearItem=null;
  const msg=d.use();ftxt(P.x,P.y,d.name+' · '+msg,d.col,1,2.8);FX.pillar(it.x*S,it.y*S,.4,3,d.col,.4);SFX.perfect();
  if(B.tut)B.tut.pick++;
}
function moveDir(){return P.moving>.1?Math.atan2(P.mvy,P.mvx):null;}
function doDodge(){
  const m=moveDir();const a=m!=null?m:P.face+PI;
  P.dvx=Math.cos(a)*640;P.dvy=Math.sin(a)*640;P.dashT=0.17;P.dashI=0.3;P.dashCd=0.55;P.perfectUsed=false;P.atkT=0;setPose('dash',.2);
  if(m!=null)P.face=a;
  SFX.dash();if(B.tut&&B.tut.i===2)B.tut.dodges++;
}
function doDash(){
  const m=moveDir();const a=m!=null?m:B.camYaw;P.face=a;
  P.dvx=Math.cos(a)*980;P.dvy=Math.sin(a)*980;P.dashT=0.22;P.dashI=0.08;P.dashCd=0.7;P.perfectUsed=true;P.atkT=0;setPose('dash',.25);
  SFX.dash();FX.ring(P.x*S,P.y*S,.2,1.2,CH[P.active].col,.25);
}
function doSkillQ(){
  const who=P.active;P.cdQ[who]=CH[who].q.cd;if(B.tut)B.tut.sk++;setPose('cast',.4);
  if(who==='eden'){
    const tg=aimFace(300);
    const x=tg?tg.x:P.x+Math.cos(P.face)*130,y=tg?tg.y:P.y+Math.sin(P.face)*130;
    B.fields.push({x:clamp(x,40,B.w-40),y:clamp(y,40,B.h-40),r:130,t:0,dur:2.6,tick:0});
    SFX.void();B.shake=Math.max(B.shake,.2);
    bark('센수스',pick(['공허다! 다 빨려 들어가라~!','이든, 저 녀석들 다 삼켜버려!','헤헤, 맛있겠다!']));
  }else{
    let n=0;
    for(const e of B.en){if(!e.alive||e.spawnT>0)continue;if(dist(P,e)<=175+e.r){hitEnemy(e,30,{kb:-120,ang:angTo(P,e),col:'#dff2ff'});n++;
      FX.bolt(e.x*S,1.1,e.y*S,P.x*S,1.2,P.y*S,'#e8f6ff',.35);}}
    let conv=0;B.eb=B.eb.filter(b=>{if(Math.hypot(b.x-P.x,b.y-P.y)<200){conv++;return false;}return true;});
    for(let i=0;i<Math.min(conv,10);i++){const a=rand(0,TAU);B.pb.push({x:P.x,y:P.y,vx:Math.cos(a)*200,vy:Math.sin(a)*200,r:8,dmg:9,life:2.2,pierce:0,hit:new Set(),col:'#ffffff',k:'orb',homing:1});}
    const heal=Math.min(.28,.05+n*.045)*CH.nesis.maxhp;
    P.hp.nesis=Math.min(CH.nesis.maxhp,P.hp.nesis+heal);ftxt(P.x,P.y,'+'+Math.round(heal),'#9dffb5',1,2.4);
    addLink(6*n+4);FX.ring(P.x*S,P.y*S,200*S,.3,'#cfe9ff',.45);FX.pillar(P.x*S,P.y*S,.6,3,'#e8f6ff',.5);
    SFX.drain();bark('클라우스룸',pick(['흡융 — 사념을 회수합니다.','적의 힘은 곧 주인의 힘입니다.','정지된 사념을 거두겠습니다.']));
  }
}
function doSkillE(){
  const who=P.active;P.cdE[who]=CH[who].e.cd;if(B.tut)B.tut.sk++;setPose('cast',.35);
  if(who==='eden'){
    const first=aimFace(320);let src=P;const done=new Set();let n=0;
    if(first){let cur=first;while(cur&&n<5){done.add(cur);FX.bolt(src.x*S,1.3,src.y*S,cur.x*S,1.1,cur.y*S,'#7fdcff',.3);
      hitEnemy(cur,18,{kb:40,ang:angTo(src,cur),col:'#7fdcff'});if(cur.alive)cur.stun=Math.max(cur.stun,cur.d.boss?.35:.9);n++;src=cur;cur=nearestEnemy(src.x,src.y,190,e=>!done.has(e));}}
    else FX.bolt(P.x*S,1.3,P.y*S,(P.x+Math.cos(P.face)*150)*S,.2,(P.y+Math.sin(P.face)*150)*S,'#7fdcff',.3);
    SFX.zap();if(Math.random()<.6)bark('센티아',pick(['뇌격, 연쇄 경로 계산 끝!','움직이지 마. 아니, 못 움직일걸?']));
  }else{
    aimFace(300);
    for(const o of [-.28,0,.28]){const a=P.face+o;B.pb.push({x:P.x,y:P.y,vx:Math.cos(a)*560,vy:Math.sin(a)*560,r:28,dmg:16,life:.62,pierce:1,hit:new Set(),col:'#6cb8ff',k:'wave',ang:a});}
    SFX.flame();if(Math.random()<.6)bark('이럽디오',pick(['타올라라!','푸른 불꽃이다, 피할 수 있으면 피해봐라!']));
  }
}
function doTag(forced){
  const from=P.active;P.active=other();P.tagCd=forced?0.5:1.2;P.atkT=0;P.combo=0;P.iT=Math.max(P.iT,forced?1.2:0.35);
  B.ghosts.push({x:P.x-Math.cos(P.face)*24,y:P.y-Math.sin(P.face)*24,face:P.face,who:from,life:.5,max:.5});
  const col=CH[P.active].col;
  for(const e of B.en){if(e.alive&&e.spawnT<=0&&dist(P,e)<95+e.r)hitEnemy(e,forced?6:14,{kb:140,ang:angTo(P,e),col});}
  FX.ring(P.x*S,P.y*S,.2,100*S,col,.3);FX.pillar(P.x*S,P.y*S,.5,3,col,.35);
  SFX.tag();updateHudStatic();
  if(!forced&&Math.random()<.5)bark(P.active==='eden'?'센티아':'이럽디오',P.active==='eden'?pick(['교대 확인. 사각은 내가 읽을게.','이든, 손목 조심해!']):pick(['…맡겨라, 네시스.','길은 내가 연다.']));
}
function addLink(v){P.link=Math.min(100,P.link+v);}
function doLink(){
  P.link=0;if(B.tut)B.tut.lk++;
  B.cine={t:0,dur:1.6,x:P.x,y:P.y,yaw:B.camYaw};
  SFX.link();flash('#c9b6ff',.35);
  B.haz=B.haz.filter(h=>h.fired);B.eb=[];B.stats.links=(B.stats.links||0)+1;
}
function linkImpact(){
  const x=P.x,y=P.y;
  for(const e of B.en)if(e.alive&&e.spawnT<=0&&Math.hypot(e.x-x,e.y-y)<=360+e.r)hitEnemy(e,e.d.boss?190:240,{kb:300,ang:Math.atan2(e.y-y,e.x-x),col:'#ffe6a0',nolink:true,big:true});
  FX.ring(x*S,y*S,1,380*S,'#c9b6ff',.7);FX.ring(x*S,y*S,.5,340*S,'#9fe2ff',.9);FX.pillar(x*S,y*S,2.4,20,'#c9b6ff',.8);
  FX.burst(x*S,1,y*S,60,'#c9b6ff',12,.9,.12);FX.burst(x*S,1,y*S,40,'#bfeaff',10,.9,.1);
  B.shake=.7;SFX.boom();flash('#fff',.7);B.linkInv=2.2;P.iT=2.2;
  bark('네시스','이든, 지금이야!');
}
function hurtPlayer(dmg){
  if(B.over||B.winT>=0)return;
  if(P.dashI>0){if(!P.perfectUsed){P.perfectUsed=true;perfectDodge();}return;}
  if(P.iT>0||B.linkInv>0||B.cine)return;
  if(M('god')){ftxt(P.x,P.y,'0','#ffd27a',0,2.2);return;}
  dmg=Math.round(dmg*rand(.92,1.08));P.hp[P.active]-=dmg;P.iT=0.45;B.stats.taken+=dmg;
  ftxt(P.x,P.y,'-'+dmg,'#ff6b8a',0,2.2);B.shake=Math.max(B.shake,.25);SFX.hurt();addLink(3);
  if(P.atkT<=0)setPose('hurt',.2);
  if(P.hp[P.active]<=0){P.hp[P.active]=0;
    if(P.hp[other()]>0){bark(other()==='eden'?'이든':'네시스',other()==='eden'?'네시스! ...물러나 있어, 내가 간다.':'이든! 내가 이어받을게!');doTag(true);}
    else lose();}
}
function perfectDodge(){
  B.stats.perfect++;B.slow=0.55;B.slowS=0.3;addLink(12);ftxt(P.x,P.y,'완벽 회피!','#bfe9ff',1,2.6);SFX.perfect();
  if(B.tut&&B.tut.i===2)B.tut.dodges++;
  if(Math.random()<.4)bark('센티아',pick(['좋아, 그 타이밍이야!','흥, 그 정도는 해야지.','5번 루트, 정확해!']));
}
function hurtAlly(a,dmg){if(M('god'))return;a.hp-=dmg;ftxt(a.x,a.y,'-'+Math.round(dmg),'#ffb0a0',0,2.2);if(a.hp<=0){a.hp=0;a.down=7;bark(a.name,'크윽... 잠시만 버텨주십시오!');}}
function hurtCore(dmg){if(!B.core||M('god'))return;B.core.hp-=dmg;B.core.flash=.15;if(B.core.hp<=0){B.core.hp=0;lose('방어막 발생기가 파괴되었습니다.');}}
function hitEnemy(e,dmg,o){
  if(!e.alive||e.inv)return;o=o||{};
  const crit=!o.ally&&Math.random()<.12;
  let d=Math.max(1,Math.round(dmg*(M('dmg')&&!o.ally?10:1)*(crit?1.6:1)*(e.d.armor||1)*rand(.92,1.08)));
  e.hp-=d;e.flash=.1;
  if(o.kb){const k=e.d.heavy?.08:1;e.kx+=Math.cos(o.ang)*o.kb*k;e.ky+=Math.sin(o.ang)*o.kb*k;}
  ftxt(e.x,e.y,(crit?'✦':'')+d,crit?'#ffe08a':(o.ally?'#ffc2b3':'#ffffff'),crit||o.big,e.d.hgt*.8);
  FX.burst(e.x*S,1.1,e.y*S,o.ally?2:5,o.col||'#ffffff',3.5,.3,.06);
  if(!o.ally){B.hitstop=Math.max(B.hitstop,o.big?0.09:0.035);SFX.hit();if(!o.nolink)addLink(e.d.boss?2.2:1.5);
    B.combo++;B.comboT=2.2;if(B.combo>B.stats.maxCombo)B.stats.maxCombo=B.combo;}
  if(e.hp<=0)killEnemy(e);
}
function killEnemy(e){
  e.alive=false;e.hp=0;rollDrops(e);
  FX.burst(e.x*S,1,e.y*S,e.d.boss?50:16,e.d.col,e.d.boss?9:5,e.d.boss?1.1:.55,e.d.boss?.14:.09);
  FX.burst(e.x*S,1,e.y*S,e.d.boss?20:6,'#ffffff',e.d.boss?7:4,.6,.08);
  B.haz=B.haz.filter(h=>h.owner!==e||h.fired);
  if(e.d.boss){B.slow=1.2;B.slowS=0.25;B.shake=.6;SFX.boom();flash('#fff',.5);FX.pillar(e.x*S,e.y*S,1.4,16,e.d.col,1.2);
    if(e.type==='abi')bark('아비','아하... 아하하... 파시스 님... 제가, 먼저... 돌아갑...');
    if(e.type==='mor')bark('모르','...오류. 파시스 님... 죄송... 합니...다.');
    if(e.type==='phasis')bark('파시스','이렇게 강한 인간이 존재한다는 이야기는... 듣지 못하였다...');}
}

/* ---------- 아군 ---------- */
function updateAllies(dt){
  for(const a of B.allies){
    a.px=a.x;a.py=a.y;
    if(a.hp<=0){a.down-=dt;if(a.down<=0){a.hp=a.maxhp*.5;bark(a.name,'다시 전열에 합류합니다!');}continue;}
    a.atkCd-=dt;a.swing=Math.max(0,a.swing-dt);
    let tg=null,bd=1e9;
    for(const e of B.en){if(!e.alive||e.inv||e.spawnT>0)continue;let d=Math.hypot(e.x-a.x,e.y-a.y);if(e.type==='mor')d*=.4;if(d<bd){bd=d;tg=e;}}
    let tx,ty,want;
    if(tg){tx=tg.x;ty=tg.y;want=tg.r+a.r+12;}else{const i=B.allies.indexOf(a);tx=P.x+Math.cos(i*2.1+1)*70;ty=P.y+Math.sin(i*2.1+1)*70;want=10;}
    const d=Math.hypot(tx-a.x,ty-a.y);
    if(d>want){const s=165*dt;a.x+=(tx-a.x)/d*s;a.y+=(ty-a.y)/d*s;a.face=Math.atan2(ty-a.y,tx-a.x);}
    else if(tg&&a.atkCd<=0){a.atkCd=rand(.8,1.1);a.swing=.35;a.face=Math.atan2(ty-a.y,tx-a.x);hitEnemy(tg,a.name==='렉소르'?9:7,{ally:1,kb:60,ang:a.face,col:a.c});}
    a.x=clamp(a.x,20,B.w-20);a.y=clamp(a.y,20,B.h-20);
  }
}

/* ---------- 적 ---------- */
function targets(){const L=[{o:P,w:1}];for(const a of B.allies)if(a.hp>0)L.push({o:a,w:1.35});if(B.core&&B.core.hp>0)L.push({o:B.core,w:.5});return L;}
function pickTarget(e,allyBias){let best=P,bd=1e9;for(const c of targets()){let w=c.w;if(allyBias&&c.o!==P&&c.o!==B.core)w*=allyBias;const d=Math.hypot(c.o.x-e.x,c.o.y-e.y)*w;if(d<bd){bd=d;best=c.o;}}return best;}
function sched(e,t,fn){e.q.push({t,fn});}
function moveTo(e,x,y,sp,dt,stop){const d=Math.hypot(x-e.x,y-e.y);if(d>(stop||0)){const s=Math.min(d-(stop||0),sp*dt);e.x+=(x-e.x)/d*s;e.y+=(y-e.y)/d*s;}return d;}
function updateEnemies(dt){
  for(const e of B.en){
    if(!e.alive)continue;
    e.px=e.x;e.py=e.y;e.t+=dt;e.flash-=dt;e.windT-=dt;e.swing-=dt;
    if(e.spawnT>0){e.spawnT-=dt;continue;}
    e.x+=e.kx*dt;e.y+=e.ky*dt;e.kx*=Math.pow(.002,dt);e.ky*=Math.pow(.002,dt);
    if(e.stun>0){e.stun-=dt;if(Math.random()<.3)FX.trail(e.x*S,1.2,e.y*S,'#7fdcff',.06);continue;}
    if(e.q.length){for(const q of e.q){q.t-=dt;if(q.t<=0&&!q.done){q.done=1;q.fn();}}e.q=e.q.filter(q=>!q.done);}
    if(e.dash){const D_=e.dash;D_.t+=dt;const k=Math.min(1,D_.t/D_.d);e.x=lerp(D_.x0,D_.x1,k);e.y=lerp(D_.y0,D_.y1,k);
      if(Math.random()<.7)FX.trail(e.x*S,1,e.y*S,e.d.col,.1);if(k>=1)e.dash=null;}
    e.busy-=dt;AI[e.d.ai](e,dt);
    e.x=clamp(e.x,e.r,B.w-e.r);e.y=clamp(e.y,e.r,B.h-e.r);
  }
  for(let i=0;i<B.en.length;i++){const a=B.en[i];if(!a.alive||a.dash)continue;
    for(let j=i+1;j<B.en.length;j++){const b=B.en[j];if(!b.alive||b.dash)continue;const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),m=a.r+b.r;
      if(d<m&&d>0){const k=(m-d)/d*.5;const wa=a.d.boss?.1:1,wb=b.d.boss?.1:1;a.x-=dx*k*wa;a.y-=dy*k*wa;b.x+=dx*k*wb;b.y+=dy*k*wb;}}}
}
const AI={
  dummy(){},
  chaser(e,dt){
    e.tgtT-=dt;if(e.tgtT<=0||!e.tgt||(e.tgt!==P&&e.tgt.hp<=0)){e.tgt=pickTarget(e);e.tgtT=.6;}
    const t=e.tgt,tr=t===P?P.r:(t.r||14);
    if(e.state==='move'){
      const d=moveTo(e,t.x,t.y,e.d.spd*(B.id==='tut'?.85:1),dt,e.r+tr+(e.d.lunge?50:16));
      e.face=Math.atan2(t.y-e.y,t.x-e.x);e.cd-=dt;
      if(d<=e.r+tr+(e.d.lunge?58:24)&&e.cd<=0){
        e.state='wind';
        if(e.d.lunge){const ang=e.face,len=150;e.st=.55;
          addHaz({k:'line',x:e.x,y:e.y,ang,len,w:34,t:.55,dmg:e.d.dmg,owner:e,coreMul:1.4,fxc:e.d.col,
            onFire:()=>dashTo(e,ang,len,.12)});}
        else{e.st=.5;addHaz({k:'cone',x:e.x,y:e.y,ang:e.face,r:e.r+52,arc:1.7,t:.5,dmg:e.d.dmg,owner:e,coreMul:1.4,fxc:e.d.col});}
      }
    }else if(e.state==='wind'){e.st-=dt;if(e.st<=0){e.state='rec';e.st=.55;}}
    else if(e.state==='rec'){e.st-=dt;if(e.st<=0){e.state='move';e.cd=rand(.6,1.3);}}
  },
  spitter(e,dt){
    e.tgtT-=dt;if(e.tgtT<=0||!e.tgt){e.tgt=pickTarget(e);e.tgtT=1;}
    const t=e.tgt,d=Math.hypot(t.x-e.x,t.y-e.y);e.face=Math.atan2(t.y-e.y,t.x-e.x);
    if(d<210){e.x-=Math.cos(e.face)*e.d.spd*dt;e.y-=Math.sin(e.face)*e.d.spd*dt;}
    else if(d>320){e.x+=Math.cos(e.face)*e.d.spd*dt;e.y+=Math.sin(e.face)*e.d.spd*dt;}
    else{e.x+=Math.cos(e.face+PI/2)*40*dt;e.y+=Math.sin(e.face+PI/2)*40*dt;}
    e.cd-=dt;if(e.cd<=0){e.cd=rand(2,2.8);e.charge=.4;e.windT=.4;}
    if(e.charge>0){e.charge-=dt;if(e.charge<=0){const a=e.face;B.eb.push({x:e.x,y:e.y,vx:Math.cos(a)*240,vy:Math.sin(a)*240,r:8,dmg:e.d.dmg,life:2.6,col:'#b37bff'});SFX.shoot();e.swing=e.swingD=.25;}}
  },
  brute(e,dt){
    e.tgtT-=dt;if(e.tgtT<=0||!e.tgt){e.tgt=pickTarget(e);e.tgtT=1;}
    const t=e.tgt;
    if(e.busy<=0){const d=moveTo(e,t.x,t.y,e.d.spd,dt,e.r+40);e.face=Math.atan2(t.y-e.y,t.x-e.x);e.cd-=dt;
      if(d<e.r+70&&e.cd<=0){e.busy=1.5;e.cd=rand(1.2,2);
        addHaz({k:'circle',x:e.x+Math.cos(e.face)*30,y:e.y+Math.sin(e.face)*30,r:100,t:.95,dmg:e.d.dmg,owner:e,big:1,coreMul:1.5,fxc:'#ffb36b'});}}
  },
  abi(e,dt){
    if(e.busy>0)return;
    const d=dist(e,P);e.face=angTo(e,P);const s=e.d.spd*dt,want=175;
    if(d>want+40){e.x+=Math.cos(e.face)*s;e.y+=Math.sin(e.face)*s;}else if(d<want-40){e.x-=Math.cos(e.face)*s;e.y-=Math.sin(e.face)*s;}
    e.x+=Math.cos(e.face+PI/2)*s*.5;e.y+=Math.sin(e.face+PI/2)*s*.5;
    e.cd-=dt;if(e.cd>0)return;
    const fast=e.hp<e.maxhp*.5?.75:1,p=pick(['blink','blink','triple','rift']);
    if(p==='blink'){
      e.busy=1.55*fast;e.inv=true;FX.burst(e.x*S,1,e.y*S,14,'#b46cff',5,.4,.08);
      sched(e,.38*fast,()=>{const a=rand(0,TAU);e.x=clamp(P.x+Math.cos(a)*240,40,B.w-40);e.y=clamp(P.y+Math.sin(a)*240,40,B.h-40);e.inv=false;FX.burst(e.x*S,1,e.y*S,14,'#b46cff',5,.4,.08);
        const ang=angTo(e,P);e.face=ang;const len=440;
        addHaz({k:'line',x:e.x,y:e.y,ang,len,w:44,t:.62*fast,dmg:34,owner:e,fxc:'#c98cff',
          onFire:()=>dashTo(e,ang,len,.14,30)});});
    }else if(p==='triple'){
      e.busy=1.25*fast;const base=angTo(e,P);
      [-.38,0,.38].forEach((o,i)=>sched(e,i*.13,()=>addHaz({k:'line',x:e.x,y:e.y,ang:base+o,len:290,w:34,t:.6*fast,dmg:24,owner:e,fxc:'#c98cff'})));
    }else{
      e.busy=1.4*fast;barkOnce('rift','센티아','네시스! 뒤야! 창의 잔상이 공간을 왜곡하고 있어! 5번 루트로 회피!');
      const vx=P.mvx*120,vy=P.mvy*120,bk=P.face+PI;
      [[P.x,P.y],[P.x+vx*1.2,P.y+vy*1.2],[P.x+Math.cos(bk)*70,P.y+Math.sin(bk)*70]].forEach(([x,y],i)=>sched(e,i*.18,()=>addHaz({k:'circle',x,y,r:58,t:.85*fast,dmg:26,owner:e,fxc:'#c98cff'})));
    }
    e.cd=rand(.7,1.3)*fast;
  },
  mor(e,dt){
    if(e.busy>0)return;
    e.tgtT-=dt;if(e.tgtT<=0||!e.tgt||(e.tgt!==P&&e.tgt.hp<=0)){e.tgt=pickTarget(e,.45);e.tgtT=2;}
    const t=e.tgt,d=Math.hypot(t.x-e.x,t.y-e.y);e.face=Math.atan2(t.y-e.y,t.x-e.x);
    if(d>140)moveTo(e,t.x,t.y,e.d.spd,dt,120);
    e.cd-=dt;if(e.cd>0)return;
    if(e.hp<e.maxhp*.6)barkOnce('morhp','렉소르','크윽... 이 여자, 힘이 장난이 아니군! 방패가 버티질 못해!');
    if(e.hp<e.maxhp*.35)barkOnce('morhp2','투몰투스','지형을 이용해야 합니다! 콘투수스, 우측 잔해 뒤로 유인하세요!');
    const p=d>240?'charge':pick(['slam','slam','sweep']);
    if(p==='slam'){e.busy=1.8;const tx=e.x+Math.cos(e.face)*Math.min(d,130),ty=e.y+Math.sin(e.face)*Math.min(d,130);
      addHaz({k:'circle',x:tx,y:ty,r:115,t:1,dmg:44,owner:e,big:1,fxc:'#ffb36b',onFire:()=>addHaz({k:'ring',x:tx,y:ty,r:240,r2:125,t:.38,dmg:20,owner:e,fxc:'#ff9f5a'})});}
    else if(p==='sweep'){e.busy=1.3;addHaz({k:'cone',x:e.x,y:e.y,ang:e.face,r:180,arc:2.6,t:.8,dmg:36,owner:e,fxc:'#ffb36b'});}
    else{e.busy=1.6;const ang=e.face,len=Math.min(400,d+80);
      addHaz({k:'line',x:e.x,y:e.y,ang,len,w:72,t:.85,dmg:40,owner:e,fxc:'#ffb36b',big:1,
        onFire:()=>dashTo(e,ang,len,.2,40)});}
    e.cd=rand(.8,1.4);
  },
  phasis(e,dt){
    const rage=e.hp<e.maxhp*.5;
    if(rage&&!e.rage){e.rage=1;bark('파시스','멈춰라! 그 비천한 구멍을 내 몸에 들이대지 마라! 어째서 내 \'강림\'의 위계가 필멸자의 심연 앞에 떨고 있는 거냐!');B.shake=.4;SFX.boss();}
    if(e.hp<e.maxhp*.2)barkOnce('ph20','파시스','이렇게 강하다는 인간이 존재한다는 이야기는 듣지 못하였다! 너희들의 정체가 대체 무엇이냐!!');
    if(e.busy>0)return;
    const d=dist(e,P);e.face=angTo(e,P);
    if(d>300)moveTo(e,P.x,P.y,e.d.spd,dt);else if(d<200){e.x-=Math.cos(e.face)*e.d.spd*dt;e.y-=Math.sin(e.face)*e.d.spd*dt;}
    e.x+=Math.cos(e.t*.5)*30*dt;
    e.cd-=dt;if(e.cd>0)return;
    const k=rage?.7:1,mins=B.en.filter(x=>x.alive&&x.type==='minion').length;
    const opts=['rain','burst','threads'];if(mins<3)opts.push('summon');if(d<190)opts.push('wing','wing');
    const p=pick(opts);
    if(p==='rain'){e.busy=1.6*k;const n=rage?13:9;
      for(let i=0;i<n;i++)sched(e,i*.07,()=>{const a=rand(0,TAU),r=i===0?0:rand(40,260);addHaz({k:'circle',x:clamp(P.x+Math.cos(a)*r,30,B.w-30),y:clamp(P.y+Math.sin(a)*r,30,B.h-30),r:46,t:.95*k+.1,dmg:24,owner:e,fxc:'#e3b8ff'});});
      barkOnce('rain','센티아','바늘비가 내린다! 붉은 원 밖으로!');}
    else if(p==='burst'){e.busy=1.5*k;const rings=rage?4:3;e.windT=.35;
      for(let r=0;r<rings;r++)sched(e,.35+r*.32*k,()=>{const n=rage?26:22,off=r*.12;for(let i=0;i<n;i++){const a=i/n*TAU+off;B.eb.push({x:e.x,y:e.y,vx:Math.cos(a)*230,vy:Math.sin(a)*230,r:6,dmg:15,life:3,col:'#e9d2ff',needle:1});}SFX.shoot();e.swing=e.swingD=.3;});}
    else if(p==='threads'){e.busy=2*k;const base=rand(0,TAU),n=rage?6:4;
      for(let i=0;i<n;i++)addHaz({k:'line',x:e.x,y:e.y,ang:base+i/n*TAU,len:900,w:26,t:1.05*k,dmg:28,owner:e,life:.35,fxc:'#f0d8ff'});
      sched(e,.9*k,()=>{for(let i=0;i<n;i++)addHaz({k:'line',x:e.x,y:e.y,ang:base+(i+.5)/n*TAU,len:900,w:26,t:1.05*k,dmg:28,owner:e,life:.35,fxc:'#f0d8ff'});});
      barkOnce('thr','클라우스룸','금속 실입니다! 존재의 좌표를 지우는 소멸의 궤적 — 선 위에 서지 마십시오!');}
    else if(p==='summon'){e.busy=1.2;e.windT=.5;for(let i=0;i<3;i++){const a=rand(0,TAU);spawn('minion',clamp(e.x+Math.cos(a)*90,40,B.w-40),clamp(e.y+Math.sin(a)*90,40,B.h-40));}
      barkOnce('sum','센수스','고철이 움직여! 저것도 다 혼내줄게!');}
    else{e.busy=1.4*k;addHaz({k:'cone',x:e.x,y:e.y,ang:e.face,r:215,arc:3.8,t:.85*k,dmg:38,owner:e,big:1,fxc:'#e3b8ff'});}
    e.cd=rand(.6,1.1)*k;
  },
};

/* ---------- 투사체 / 장판 ---------- */
function updateProj(dt){
  for(const b of B.eb){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
    if(P.hz<40&&Math.hypot(b.x-P.x,b.y-P.y)<b.r+P.r*.8){if(P.dashI>0){if(!P.perfectUsed){P.perfectUsed=true;perfectDodge();}}else if(!(P.iT>0||B.linkInv>0)){hurtPlayer(b.dmg);b.life=0;}}
    if(B.core&&Math.hypot(b.x-B.core.x,b.y-B.core.y)<b.r+B.core.r){hurtCore(b.dmg*1.2);b.life=0;}
    for(const a of B.allies)if(a.hp>0&&Math.hypot(b.x-a.x,b.y-a.y)<b.r+a.r){hurtAlly(a,b.dmg*.5);b.life=0;break;}
    if(b.x<0||b.y<0||b.x>B.w||b.y>B.h)b.life=0;}
  B.eb=B.eb.filter(b=>b.life>0);
  for(const b of B.pb){
    if(b.homing){const n=nearestEnemy(b.x,b.y,600);if(n){const a=Math.atan2(n.y-b.y,n.x-b.x);b.vx+=Math.cos(a)*1400*dt;b.vy+=Math.sin(a)*1400*dt;const s=Math.hypot(b.vx,b.vy);if(s>520){b.vx*=520/s;b.vy*=520/s;}}}
    b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
    for(const e of B.en){if(!e.alive||e.spawnT>0||b.hit.has(e))continue;if(Math.hypot(e.x-b.x,e.y-b.y)<e.r+b.r){b.hit.add(e);hitEnemy(e,b.dmg,{kb:80,ang:Math.atan2(b.vy,b.vx),col:b.col});if(!b.pierce){b.life=0;break;}}}
  }
  B.pb=B.pb.filter(b=>b.life>0);
  for(const f of B.fields){
    f.t+=dt;f.tick-=dt;
    for(const e of B.en){if(!e.alive||e.spawnT>0)continue;const d=Math.hypot(f.x-e.x,f.y-e.y);if(d<f.r+60&&d>4){const s=(e.d.boss?28:190)*dt;e.x+=(f.x-e.x)/d*Math.min(s,d);e.y+=(f.y-e.y)/d*Math.min(s,d);}}
    if(f.tick<=0){f.tick=.25;for(const e of B.en)if(e.alive&&e.spawnT<=0&&Math.hypot(f.x-e.x,f.y-e.y)<f.r+e.r)hitEnemy(e,8,{col:'#9b6bff'});}
    B.eb=B.eb.filter(b=>Math.hypot(b.x-f.x,b.y-f.y)>f.r);
    if(f.t>=f.dur){f.dead=1;hitArea(f.x,f.y,f.r+40,34,{kb:200,col:'#c9b6ff',big:1});
      FX.ring(f.x*S,f.y*S,.3,(f.r+60)*S,'#b49bff',.4);FX.burst(f.x*S,1.1,f.y*S,24,'#c9b6ff',6,.5,.1);B.shake=Math.max(B.shake,.3);SFX.boom();}
  }
  B.fields=B.fields.filter(f=>!f.dead);
}

/* ---------- 진행 ---------- */
function battleUpdate(rdt){
  if(!B)return;
  if(B.cine){B.cine.t+=rdt;if(B.cine.t>=B.cine.dur){B.cine=null;linkImpact();}}
  let dt=rdt;
  if(B.hitstop>0){B.hitstop-=rdt;dt=rdt*.08;}
  if(B.slow>0){B.slow-=rdt;dt*=B.slowS;}
  if(B.cine)dt*=.08;
  B.linkInv-=rdt;B.shake=Math.max(0,B.shake-rdt*1.4);B.comboT-=rdt;if(B.comboT<=0)B.combo=0;B.t+=dt;
  if(B.winT>=0){B.winT-=rdt;dt*=.35;if(B.winT<0){showResult();return;}}
  if(!B.over&&B.winT<0)B.stats.time+=rdt;
  updatePlayer(dt);clearPresses();
  updateAllies(dt);updateEnemies(dt);updateHaz(dt);updateProj(dt);
  for(const g of B.ghosts)g.life-=dt;B.ghosts=B.ghosts.filter(g=>g.life>0);
  updateItems(dt);updateEgos(dt);
  FX.update(dt);
  if(B.core&&B.core.flash>0)B.core.flash-=dt;
  if(B.over||B.winT>=0)return;
  if(B.tut)tutUpdate(dt);
  if(B.def.waves){
    if(B.spawnQ.length){B.spawnT-=dt;if(B.spawnT<=0){B.spawnT=.45;const p=edgePos();spawn(B.spawnQ.shift(),p.x,p.y);}}
    else if(alive()===0){if(B.wave<B.def.waves.length-1){healAll(.15);nextWave();}else win();}
  }
  if(B.def.bosses&&B.bossIds.every(e=>!e.alive)){B.en.forEach(e=>{if(e.alive)killEnemy(e);});win();}
}
function healAll(f){for(const k of ['eden','nesis'])if(P.hp[k]>0)P.hp[k]=Math.min(CH[k].maxhp,P.hp[k]+CH[k].maxhp*f);}
function win(){if(B.winT>=0||B.over)return;B.winT=1.6;B.haz=[];B.eb=[];SFX.win();$('banner').classList.remove('on');}
function lose(msg){if(B.over)return;B.over=true;show('bWin',false);SFX.lose();setTimeout(()=>{if(!B)return;releaseLock();toggleMap(false);$('interact').classList.add('hide');$('oMsg').textContent=msg||'두 사람 모두 쓰러졌습니다.';show('over',true);GS.mode='over';},900);}
function showResult(){
  GS.mode='result';show('bWin',false);releaseLock();toggleMap(false);$('interact').classList.add('hide');
  const s=B.stats,t=s.time;
  const score=100-s.taken/12+s.maxCombo/3+s.perfect*2-Math.max(0,t-(B.id==='tut'||B.id==='outpost'?150:120))/3;
  $('rRank').textContent=score>=95?'S':score>=75?'A':score>=55?'B':'C';
  $('rStats').innerHTML=`<span>전투 시간</span><b>${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}</b><span>받은 피해</span><b>${Math.round(s.taken)}</b><span>최대 콤보</span><b>${s.maxCombo}</b><span>완벽 회피</span><b>${s.perfect}</b>`;
  show('hud',false);show('ctrl',false);show('pauseB',false);show('result',true);
}
$('rNext').onclick=()=>{SFX.ui();show('result',false);B=null;FX.clear();nextStep();};
$('oRetry').onclick=()=>{SFX.ui();show('over',false);startBattle(B.id);};
$('oTitle').onclick=()=>{SFX.ui();toTitle();};
const SENS_N=['낮음','보통','높음'],UI_N={auto:'자동',pc:'PC',touch:'모바일'},GFX_N={auto:'자동',high:'높음',low:'낮음'};
function togglePause(force){
  if(GS.mode!=='battle'&&!GS.paused)return;
  GS.paused=force!==undefined?force:!GS.paused;show('pause',GS.paused);
  if(GS.paused)releaseLock();
  $('pSnd').textContent='효과음: '+(SAVE.snd?'켜짐':'꺼짐');$('pSens').textContent='카메라 감도: '+SENS_N[SAVE.sens];$('pUI').textContent='조작 UI: '+UI_N[SAVE.ui];$('pGfx').textContent='그래픽: '+GFX_N[SAVE.gfx];
}
$('pauseB').onclick=()=>{audioInit();togglePause();};
$('pRes').onclick=()=>togglePause(false);
$('pRetry').onclick=()=>{togglePause(false);startBattle(B.id);};
$('pTitle').onclick=()=>{togglePause(false);toTitle();};
$('pMaster').onclick=()=>{SFX.ui();openMaster();};
/* 마스터 모드: 전투 즉시 승리 */
function battleSkip(){
  if(!B||B.over||B.winT>=0)return;
  if(B.tut){B.tut.i=TUT.length;$('banner').classList.remove('on');}
  B.spawnQ=[];if(B.def.waves)B.wave=B.def.waves.length-1;
  for(const e of B.en)if(e.alive){e.alive=false;e.hp=0;}
  win();
}
$('bWin').addEventListener('click',e=>{e.stopPropagation();SFX.ui();battleSkip();});
$('pSnd').onclick=()=>{SAVE.snd=!SAVE.snd;persist();$('pSnd').textContent='효과음: '+(SAVE.snd?'켜짐':'꺼짐');};
$('pUI').onclick=()=>{const o=['auto','pc','touch'];SAVE.ui=o[(o.indexOf(SAVE.ui)+1)%3];persist();applyUISetting();$('pUI').textContent='조작 UI: '+UI_N[SAVE.ui];};
$('pGfx').onclick=()=>{const o=['auto','high','low'];SAVE.gfx=o[(o.indexOf(SAVE.gfx)+1)%3];persist();resize();$('pGfx').textContent='그래픽: '+GFX_N[SAVE.gfx];};
$('pSens').onclick=()=>{SAVE.sens=(SAVE.sens+1)%3;persist();$('pSens').textContent='카메라 감도: '+SENS_N[SAVE.sens];};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&GS.mode==='battle'&&!GS.paused)togglePause(true);});

/* ---------- HUD ---------- */
const hudCache={};
function setW(id,v){v=Math.max(0,Math.min(1,v));const k=Math.round(v*400);if(hudCache[id]===k)return;hudCache[id]=k;(UIC[id+'_i']||(UIC[id+'_i']=document.querySelector('#'+id+' i'))).style.width=(v*100)+'%';}
function setT(el,s){if(el._t===s)return;el._t=s;el.textContent=s;}
function setH(el,s){if(el._h===s)return;el._h=s;el.innerHTML=s;}
function setC(el,c,on){if(el['_c'+c]===on)return;el['_c'+c]=on;el.classList.toggle(c,on);}
const UIC={};const U=id=>UIC[id]||(UIC[id]=$(id)); // 화면 요소 캐시 (매 프레임 검색하지 않음)
const GRAD={eden:'linear-gradient(90deg,#6b5cff,#b49bff)',nesis:'linear-gradient(90deg,#7cc4ff,#ffffff)'};
function updateHudStatic(){
  if(!P)return;const a=P.active,o=other();
  U('hpA').querySelector('i').style.background=GRAD[a];U('hpB').querySelector('i').style.background=GRAD[o];
  U('skQ').textContent=CH[a].q.n;U('skE').textContent=CH[a].e.n;U('tgN').textContent=CH[o].name;
  U('swN').textContent=WEAPONS[heldOf(a)].name;U('clN').textContent=WEAPONS[backOf(a)].name;
  U('ksXn').textContent=WEAPONS[heldOf(a)].name;U('ksZn').textContent=WEAPONS[backOf(a)].name+' 호출';
  U('pnA').innerHTML=`<b style="color:${CH[a].col}">${CH[a].title} ${CH[a].name}</b><span></span>`;
  U('pnB').innerHTML=`<b style="color:#aaa">${CH[o].title} ${CH[o].name}</b><span></span>`;
  B.hud=null; // 보스·목표 막대는 다음 갱신 때 다시 만든다
}
function cdShow(id,v){const el=U(id);setC(el,'hide',v<=0);if(v>0)setT(el,Math.ceil(v)+'');}
/* 보스 체력 · 목표 막대: 구조는 한 번만 만들고 이후엔 너비만 바꾼다 */
function buildBattleHud(){
  const bosses=B.en.filter(e=>e.d.boss);
  U('boss').innerHTML=bosses.map(e=>`<div class="bn">${e.d.name}<small>${e.d.sub}</small></div><div class="bar" style="margin-bottom:6px"><i></i></div>`).join('');
  U('obj').innerHTML=bosses.length?'':B.core?`<span class="ot"></span><div id="core"><div class="bar"><i></i></div></div><span class="cp" style="font-size:11px;color:#ffcf9f"></span>`:B.def.obj;
  B.hud={bosses,key:bosses.length,bars:[...U('boss').querySelectorAll('i')],ot:U('obj').querySelector('.ot'),cbar:U('obj').querySelector('#core i'),cp:U('obj').querySelector('.cp')};
}
function updateHud(){
  if(!B||!P)return;const a=P.active,o=other();
  setT(U('pnA').lastChild,`${Math.ceil(P.hp[a])} / ${CH[a].maxhp}`);
  setT(U('pnB').lastChild,P.hp[o]>0?Math.ceil(P.hp[o])+'':'전투 불능');
  setW('hpA',P.hp[a]/CH[a].maxhp);setW('hpB',P.hp[o]/CH[o].maxhp);setW('lk',P.link/100);
  setT(U('lkT'),Math.floor(P.link)+'%');setC(U('lk'),'full',P.link>=100);setC(U('bR'),'full',P.link>=100);
  cdShow('cdQ',P.cdQ[a]);cdShow('cdE',P.cdE[a]);cdShow('cdZ',P.cdZ[a]);
  const tc=U('cdT'),blocked=P.hp[o]<=0;setC(tc,'hide',P.tagCd<=0&&!blocked);if(blocked)setT(tc,'✕');else if(P.tagCd>0)setT(tc,Math.ceil(P.tagCd)+'');
  setC(U('bAtk'),'charge',P.holdT>=0.15);setC(U('bJump'),'air',P.hz>8);
  if(!B.hud||B.hud.key!==B.en.filter(e=>e.d.boss).length)buildBattleHud();
  const h=B.hud;
  h.bosses.forEach((e,i)=>{const w=Math.max(0,e.hp/e.maxhp*100)|0;if(h.bars[i]._w!==w){h.bars[i]._w=w;h.bars[i].style.width=w+'%';}});
  if(h.ot){setT(h.ot,`${B.def.obj} · WAVE ${B.wave+1}/${B.def.waves.length}`);const k=Math.ceil(B.core.hp/B.core.maxhp*100);if(h.cbar._w!==k){h.cbar._w=k;h.cbar.style.width=k+'%';}setT(h.cp,`방어막 발생기 ${k}%`);}
  const cb=U('combo'),showC=B.combo>=3;if(showC)setH(cb,`${B.combo}<small>COMBO</small>`);if(cb._on!==showC){cb._on=showC;cb.style.opacity=showC?1:0;}
  updatePcHud();drawMini();if(GS.map)drawFullMap();
}

/* ---------- 3D 렌더링 ---------- */
function rigPose(R,s,x,y,face,inh,yOff){
  animateAvatar(R,s);const p=R.root.p,r=R.root.r;p[0]=x*S;p[1]=yOff||0;p[2]=y*S;r[0]=r[2]=0;r[1]=PI/2-face;R3.node(R.root,null,inh);
}
function playerAnimState(){
  const air=P.hz>8;
  if(P.plunge)return{pose:'plunge',p:1,move:0,air:true};
  const p=P.pose?{pose:P.pose,p:Math.min(1,P.poseT/P.poseD),sw:P.sw}:{pose:air?'jump':null};
  if(P.holdT>=0.15&&!P.pose&&!air)return{pose:'cast',p:0,move:P.moving};
  return Object.assign({move:air?0:P.moving,air},p);
}
function enemyAnimState(e){
  const mv=Math.min(1,Math.hypot(e.x-e.px,e.y-e.py)/Math.max(1e-4,1/60)/Math.max(60,e.d.spd||80));
  if(e.stun>0)return{pose:'hurt',move:0};
  if(e.swing>0){const big=e.swingBig&&e.rig.def.heavy;return{pose:big?'heavy':'atk',p:big?.45+.55*(1-e.swing/e.swingD):1-e.swing/e.swingD,sw:1,move:0};}
  if(e.windT>0){const big=e.rig.def.heavy;return{pose:big?'heavy':(e.d.ai==='spitter'||e.d.ai==='phasis'?'cast':'atk'),p:big?.3:0,sw:1,move:0};}
  if(e.flash>0)return{pose:'hurt',move:mv};
  return{pose:e.d.ai==='phasis'?'cast':null,p:0,move:mv};
}
function render3D(rdt){
  const t=GS.t;
  // 카메라
  let yaw=B.camYaw,pitch=B.camPitch,dst=B.camDist,cxp=P.x*S,czp=P.y*S;
  if(B.cine){const k=B.cine.t/B.cine.dur;yaw=B.cine.yaw+PI+k*1.6;pitch=.25;dst=4.2;}
  const cp=[cxp-Math.cos(yaw)*dst*Math.cos(pitch),1.5+dst*Math.sin(pitch),czp-Math.sin(yaw)*dst*Math.cos(pitch)];
  const tg=[cxp+Math.cos(yaw)*(B.cine?0:.6),B.cine?1.3:1.55,czp+Math.sin(yaw)*(B.cine?0:.6)];
  if(!B.cp||B.cine)B.cp={p:cp,t:tg};else{const k=Math.min(1,rdt*12);for(let i=0;i<3;i++){B.cp.p[i]=lerp(B.cp.p[i],cp[i],k);B.cp.t[i]=lerp(B.cp.t[i],tg[i],k);}}
  const sh=B.shake;const j=()=>(Math.random()-.5)*sh;
  R3.cam.pos=[B.cp.p[0]+j(),B.cp.p[1]+j(),B.cp.p[2]+j()];R3.cam.tgt=[B.cp.t[0],B.cp.t[1],B.cp.t[2]];R3.cam.fov=B.cine?.8:1.0;
  R3.begin(B.cfg);
  drawSky(B.def.arena,B.cfg);
  B.env.draw(t);
  if(B.core)B.gen.draw(B.core.x*S,B.core.y*S,t,B.core.hp/B.core.maxhp,B.core.flash>0);
  for(const h of B.haz){const o={r:(h.r||0)*S,r2:(h.r2||0)*S,arc:h.arc,ang:h.ang,len:(h.len||0)*S,w:(h.w||0)*S};
    FX.decal(h.k,h.x*S,h.y*S,o,h.t>0?1-h.t/h.t0:1,'#ff3c5a',h.t<=0);}
  for(const f of B.fields)FX.voidField(f.x*S,f.y*S,f.r*S,f.t,1);
  for(const it of B.items)drawItem(it,it.x*S,it.y*S,t,it.life<5);
  // 아군
  for(const a of B.allies){const mv=Math.min(1,Math.hypot(a.x-a.px,a.y-a.py)*60/165);
    FX.shadow(a.x*S,a.y*S,a.rig.def.shadow);
    rigPose(a.rig,{t,move:mv,pose:a.swing>0?'atk':null,p:1-a.swing/.35,sw:1},a.x,a.y,a.face,a.hp<=0?{a:.35}:null);
    if(a.hp<=0)FX.marker(a.x*S,a.y*S,.8,'#ff6b5b',t);}
  // 적
  for(const e of B.en){if(!e.alive)continue;
    const st=enemyAnimState(e);st.t=e.t;
    const inh={};if(e.d.holo){inh.a=.55;inh.emis=[.05,.25,.4];}if(e.inv)inh.a=.15;if(e.spawnT>0)inh.a=Math.min(inh.a||1,1-e.spawnT/.4);if(e.flash>0)inh.fl=.65;
    FX.shadow(e.x*S,e.y*S,e.rig.def.shadow||.5);
    rigPose(e.rig,st,e.x,e.y,e.face,inh);
    if(e.d.ai==='phasis'&&e.rage)FX.ring(e.x*S,e.y*S,1.4,1.6,'#ff5aa0',.05,1.4);}
  // 플레이어
  const R=P.rig[P.active];
  for(const g of B.ghosts){const r=P.rig[g.who];rigPose(r,{t,move:0,pose:'dash',p:.5},g.x,g.y,g.face,{a:g.life/g.max*.45,emis:hex(CH[g.who].col)});}
  FX.shadow(P.x*S,P.y*S,.45*Math.max(.4,1-P.hz*S*.3),.38*Math.max(.3,1-P.hz*S*.3));
  const blink=P.iT>0&&P.dashI<=0&&B.linkInv<=0&&Math.floor(t*20)%2;
  rigPose(R,Object.assign({t},playerAnimState()),P.x,P.y,P.face,blink?{a:.5}:null,P.hz*S);
  if(B.linkInv>0)R3.draw(FX.m.torus,mat(P.x*S,1.1,P.y*S,t*3,.7,1,.7),{mode:2,tint:'#e0d0ff',a:.7});
  if(B.cine){const o=other();const ox=P.x+Math.cos(P.face+PI/2)*36,oy=P.y+Math.sin(P.face+PI/2)*36;
    rigPose(P.rig[o],{t,move:0,pose:'cast',p:0},ox,oy,P.face,null);FX.linkHalo(P.x*S,P.y*S,t,Math.min(1,B.cine.t/B.cine.dur*1.5));}
  drawEgos(t);
  // 투사체
  for(const b of B.eb){if(b.needle)FX.needle(b.x*S,1.3,b.y*S,Math.atan2(b.vy,b.vx));else FX.orb(b.x*S,1.0,b.y*S,.16,b.col);}
  for(const b of B.pb){if(b.k==='wave')FX.flameWave(b.x*S,b.y*S,b.ang,b.r*S*1.2,t,b.purple);else FX.orb(b.x*S,1.1,b.y*S,.12,'#ffffff');}
  FX.draw();
  R3.end();
  drawOverlay();
}
function drawOverlay(){
  const c=ov;c.setTransform(DPR,0,0,DPR,0,0);c.clearRect(0,0,W,H);
  for(const e of B.en){if(!e.alive||e.d.boss||e.hp>=e.maxhp||e.spawnT>0)continue;const s=R3.project(e.x*S,e.d.hgt+.25,e.y*S);if(!s)continue;
    c.fillStyle='rgba(0,0,0,.6)';c.fillRect(s[0]-18,s[1],36,4);c.fillStyle='#ff5a7a';c.fillRect(s[0]-18,s[1],36*e.hp/e.maxhp,4);}
  c.font='bold 11px system-ui,sans-serif';c.textAlign='center';
  for(const a of B.allies){const s=R3.project(a.x*S,2.35,a.y*S);if(!s)continue;c.fillStyle=a.c;c.fillText(a.name,s[0],s[1]);
    c.fillStyle='rgba(0,0,0,.6)';c.fillRect(s[0]-16,s[1]+3,32,3);c.fillStyle=a.c;c.fillRect(s[0]-16,s[1]+3,32*a.hp/a.maxhp,3);}
  FX.drawTexts(c);
  const hpk=P.hp[P.active]/CH[P.active].maxhp;
  if(hpk<.3){const g=c.createRadialGradient(W/2,H/2,Math.min(W,H)*.3,W/2,H/2,Math.max(W,H)*.7);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(200,0,40,${.25+.15*Math.sin(GS.t*6)})`);c.fillStyle=g;c.fillRect(0,0,W,H);}
  if(B.slow>0){c.fillStyle='rgba(120,180,255,.08)';c.fillRect(0,0,W,H);}
  if(B.cine){const k=B.cine.t/B.cine.dur,m=Math.min(W,H);c.globalAlpha=Math.min(1,k*3);c.fillStyle='rgba(4,2,12,.35)';c.fillRect(0,0,W,m*.12);c.fillRect(0,H-m*.12,W,m*.12);
    c.fillStyle='#fff';c.font=`900 ${Math.max(18,m*.06)}px system-ui,sans-serif`;c.shadowColor='#b49bff';c.shadowBlur=18;c.fillText('링크 0 : 공허 & 흡융',W/2,H*.78);c.shadowBlur=0;
    c.font=`600 ${Math.max(11,m*.025)}px system-ui,sans-serif`;c.fillStyle='#cfc6ff';c.fillText('LINK 0 — VOID × FUSION',W/2,H*.78+m*.05);c.globalAlpha=1;}
}

/* ---------- 지도 (M) · 미니맵 ---------- */
function toggleMap(force){
  if(!B||(GS.mode!=='battle'&&!GS.map))return;
  GS.map=force!==undefined?force:!GS.map;show('map',GS.map);
  if(GS.map){releaseLock();$('mapT').textContent=(B.envDef.name||'')+' — '+B.def.obj;}
}
$('map').addEventListener('click',()=>toggleMap(false));
$('interact').addEventListener('pointerdown',e=>{e.preventDefault();inp.fP=true;});
$('bMap').addEventListener('click',e=>{e.stopPropagation();toggleMap();});
function drawMap(c,w,h,full){
  c.clearRect(0,0,w,h);
  const pad=full?30:6,sc=Math.min((w-pad*2)/B.w,(h-pad*2)/B.h),ox=(w-B.w*sc)/2,oy=(h-B.h*sc)/2;
  const X=x=>ox+x*sc,Y=y=>oy+y*sc;
  c.fillStyle=full?'rgba(12,10,26,.92)':'rgba(8,6,18,.72)';c.fillRect(0,0,w,h);
  c.strokeStyle='rgba(160,140,255,.25)';c.lineWidth=1;
  if(full){for(let x=0;x<=B.w;x+=100){c.beginPath();c.moveTo(X(x),Y(0));c.lineTo(X(x),Y(B.h));c.stroke();}for(let y=0;y<=B.h;y+=100){c.beginPath();c.moveTo(X(0),Y(y));c.lineTo(X(B.w),Y(y));c.stroke();}}
  c.strokeStyle='rgba(180,160,255,.8)';c.lineWidth=full?2:1.5;c.strokeRect(X(0),Y(0),B.w*sc,B.h*sc);
  const dot=(x,y,r,col)=>{c.fillStyle=col;c.beginPath();c.arc(X(x),Y(y),r,0,TAU);c.fill();};
  if(B.core){dot(B.core.x,B.core.y,full?9:5,'#ffb36b');if(full){c.fillStyle='#ffcf9f';c.font='12px system-ui';c.textAlign='center';c.fillText('방어막 발생기',X(B.core.x),Y(B.core.y)+22);}}
  for(const f of B.fields)dot(f.x,f.y,f.r*sc,'rgba(150,100,255,.35)');
  for(const it of B.items)dot(it.x,it.y,full?5:3,ITEMS[it.id].col);
  for(const a of B.allies)dot(a.x,a.y,full?5:3,a.hp>0?a.c:'#666');
  for(const e of B.en){if(!e.alive)continue;if(e.d.boss){dot(e.x,e.y,full?9:5,'#d77cff');if(full){c.fillStyle='#e8c8ff';c.font='bold 12px system-ui';c.textAlign='center';c.fillText(e.d.name,X(e.x),Y(e.y)-14);}}else dot(e.x,e.y,full?4:2.5,'#ff5a7a');}
  // 플레이어 + 시야
  const px=X(P.x),py=Y(P.y),L=full?60:22;
  c.fillStyle='rgba(180,160,255,.18)';c.beginPath();c.moveTo(px,py);c.arc(px,py,L,B.camYaw-.5,B.camYaw+.5);c.closePath();c.fill();
  c.save();c.translate(px,py);c.rotate(P.face);c.fillStyle='#ffffff';c.beginPath();c.moveTo(full?11:7,0);c.lineTo(full?-7:-4,full?-6:-4);c.lineTo(full?-7:-4,full?6:4);c.closePath();c.fill();c.restore();
  if(full){c.textAlign='left';c.font='12px system-ui';let ly=h-18;
    let lx=pad;for(const [col,t] of [['#ffffff','나'],['#ff8f6b','아군'],['#ff5a7a','적'],['#d77cff','보스'],['#7fffb5','아이템'],['#ffb36b','발생기']]){c.fillStyle=col;c.beginPath();c.arc(lx+5,ly-4,5,0,TAU);c.fill();c.fillStyle='#cfc6ee';c.fillText(t,lx+14,ly);lx+=c.measureText(t).width+34;}}
}
let miniTick=0;
function drawMini(){
  if(++miniTick%3)return;const cv=$('mini');const w=cv.clientWidth,h=cv.clientHeight;if(!w)return;
  if(cv.width!==Math.round(w*DPR)){cv.width=Math.round(w*DPR);cv.height=Math.round(h*DPR);}
  const c=cv.getContext('2d');c.setTransform(DPR,0,0,DPR,0,0);drawMap(c,w,h,false);
}
function drawFullMap(){
  const cv=$('mapC');const w=cv.clientWidth,h=cv.clientHeight;if(!w)return;
  if(cv.width!==Math.round(w*DPR)){cv.width=Math.round(w*DPR);cv.height=Math.round(h*DPR);}
  const c=cv.getContext('2d');c.setTransform(DPR,0,0,DPR,0,0);drawMap(c,w,h,true);
}
/* ---------- PC 전용 HUD (파티 · 스킬바) ---------- */
function updatePcHud(){
  if(inp.touch)return;
  for(const k of ['eden','nesis']){
    const el=U('pt_'+k);setC(el,'on',P.active===k);setC(el,'down',P.hp[k]<=0);
    const w=(P.hp[k]/CH[k].maxhp*100)|0,bar=UIC['ptb_'+k]||(UIC['ptb_'+k]=el.querySelector('i'));if(bar._w!==w){bar._w=w;bar.style.width=w+'%';}
  }
  const a=P.active,lk=Math.floor(P.link);
  setT(U('ksQn'),CH[a].q.full);setT(U('ksEn'),CH[a].e.full);
  cdShow('ksQc',P.cdQ[a]);cdShow('ksEc',P.cdE[a]);cdShow('ksZc',P.cdZ[a]);
  setC(U('ksR'),'full',lk>=100);if(U('ksRg')._p!==lk){U('ksRg')._p=lk;U('ksRg').style.setProperty('--p',lk+'%');}
  setT(U('ksRp'),lk+'%');setT(U('ksH'),P.hz>8?'공중':'');
}

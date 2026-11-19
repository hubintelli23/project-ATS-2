/* =================== BATTLE =================== */
const CH={
  eden:{name:'이든',title:'대행자',maxhp:520,spd:255,neon:'#5fd0ff',hair:'#15151d',tip:'#c9ccd8',
    combo:[{d:.2,r:82,a:1.9,dmg:9,col:'#59c8ff'},{d:.2,r:82,a:1.9,dmg:9,col:'#c77dff'},{d:.32,r:100,a:2.6,dmg:15,col:'#b49bff',fin:'chain'}],
    skill:{n:'공허',full:'태초의 공허',cd:9}},
  nesis:{name:'네시스',title:'집행자',maxhp:600,spd:238,neon:'#9fdcff',hair:'#eef2f8',tip:'#3b9dff',
    combo:[{d:.3,r:106,a:2.6,dmg:15,col:'#f2f6ff'},{d:.3,r:106,a:2.6,dmg:15,col:'#5aa9ff'},{d:.45,r:120,a:3.4,dmg:24,col:'#7cc4ff',fin:'wave'}],
    skill:{n:'흡융',full:'흡융',cd:10}},
};
const ET={
  dummy:{name:'훈련용 홀로그램',hp:30,r:16,spd:0,ai:'dummy',dmg:0,col:'#58d6ff',holo:1},
  holo:{name:'강화 공허체 (시뮬)',hp:44,r:16,spd:115,ai:'chaser',dmg:12,col:'#58d6ff',holo:1},
  holobrute:{name:'강화 공허체 · 거구 (시뮬)',hp:220,r:28,spd:70,ai:'brute',dmg:26,col:'#58d6ff',holo:1,armor:.75,heavy:1},
  claw:{name:'침식체 · 금속 발톱',hp:62,r:16,spd:150,ai:'chaser',dmg:15,col:'#9aa3b5',lunge:1},
  spitter:{name:'침식 폴른',hp:50,r:15,spd:95,ai:'spitter',dmg:15,col:'#a17bd6'},
  brute:{name:'침식체 · 금속 외피',hp:260,r:30,spd:72,ai:'brute',dmg:34,col:'#7d8597',armor:.65,heavy:1},
  minion:{name:'금속 사도',hp:58,r:13,spd:170,ai:'chaser',dmg:12,col:'#c9b6ff',lunge:1},
  abi:{name:'아비',sub:'강림의 초석 부하 · 심연',hp:1400,r:22,spd:205,ai:'abi',boss:1,col:'#b46cff',heavy:1},
  mor:{name:'모르',sub:'강림의 초석 부하 · 종말',hp:1850,r:32,spd:115,ai:'mor',boss:1,col:'#77788f',armor:.8,heavy:1},
  phasis:{name:'파시스',sub:'제 5 초석 · 강림의 초석',hp:3600,r:34,spd:80,ai:'phasis',boss:1,col:'#c084fc',heavy:1},
};
const ALLY_DEF={
  '렉소르':{c:'#ff6b5b',hp:360,wpn:'axe',r:17},
  '콘투수스':{c:'#ff8f6b',hp:280,wpn:'sword',r:14},
  '투몰투스':{c:'#ffa07a',hp:280,wpn:'spear',r:14},
};
const BATTLES={
  tut:{arena:'chamber',w:1200,h:900,allies:[],obj:'에테르 챔버 — 전투 시뮬레이션'},
  outpost:{arena:'outpost',w:1500,h:1100,allies:['렉소르','콘투수스','투몰투스'],core:true,
    waves:[[['claw',7]],[['claw',6],['spitter',4]],[['claw',6],['spitter',3],['brute',2]]],obj:'방어막 발생기를 지켜라'},
  abimor:{arena:'waste',w:1500,h:1100,allies:['렉소르','콘투수스','투몰투스'],bosses:['abi','mor'],obj:'강림의 초석의 사자를 처치하라'},
  phasis:{arena:'phasis',w:1500,h:1100,allies:['렉소르','콘투수스','투몰투스'],bosses:['phasis'],obj:'제 5 초석 파시스를 처치하라'},
};

let B=null,P=null;
function newPlayer(x,y,keep){
  return{x,y,face:-PI/2,active:'eden',hp:{eden:CH.eden.maxhp,nesis:CH.nesis.maxhp},atkT:0,atkD:0,combo:0,comboWin:0,swing:1,
    dashT:0,dashI:0,dashCd:0,dvx:0,dvy:0,iT:0,perfectUsed:false,skillCd:{eden:0,nesis:0},tagCd:0,link:0,r:14,walk:0,tagGhost:null,lastHurt:0};
}
function startBattle(id){
  const def=BATTLES[id];
  B={id,def,w:def.w,h:def.h,t:0,en:[],haz:[],eb:[],pb:[],fields:[],fx:[],txt:[],allies:[],core:null,
     wave:-1,spawnQ:[],spawnT:0,cam:{x:def.w/2,y:def.h/2},shake:0,hitstop:0,slow:0,slowS:1,
     combo:0,comboT:0,stats:{time:0,taken:0,maxCombo:0,perfect:0},barked:{},tut:null,over:false,winT:-1,cine:null,linkInv:0,
     bossIds:[]};
  P=newPlayer(def.w/2,def.h*0.62);
  def.allies.forEach((n,i)=>{const a=ALLY_DEF[n];B.allies.push({name:n,c:a.c,wpn:a.wpn,r:a.r,maxhp:a.hp,hp:a.hp,x:def.w/2+(i-1)*70,y:def.h*0.7,atkCd:rand(0,1),down:0,face:-PI/2,swing:0});});
  if(def.core){B.core={x:def.w/2,y:def.h*0.62,r:38,hp:1000,maxhp:1000};P.y=def.h*0.5;}
  if(def.bosses){
    def.bosses.forEach((b,i)=>{const e=spawn(b,def.w/2+(def.bosses.length>1?(i?160:-160):0),def.h*0.28);B.bossIds.push(e);});
  }
  if(id==='tut')tutInit();
  if(def.waves)nextWave();
  hideDialog();show('card',false);
  GS.mode='battle';GS.paused=false;
  show('hud',true);show('ctrl',true);show('pauseB',true);
  $('banner').classList.remove('on');$('barks').innerHTML='';
  if(id==='abimor')setTimeout(()=>bark('이든','...온다! 전원, 전투 배치!'),400);
  if(id==='phasis'){SFX.boss();setTimeout(()=>bark('파시스','가소롭구나. 창조의 숨결이 닿은 금속을 감히 인간의 손으로 붙잡으려 들다니.'),500);}
  if(id==='outpost')setTimeout(()=>bark('렉소르','분노의 우니타스, 대행자님의 뒤를 받쳐라!'),400);
  updateHudStatic();
}
function spawn(type,x,y){
  const d=ET[type];
  const e={type,d,x,y,r:d.r,hp:d.hp,maxhp:d.hp,state:'move',st:0,cd:rand(.6,1.4),face:PI/2,flash:0,kx:0,ky:0,tgt:null,tgtT:0,q:[],busy:0,inv:false,alpha:1,born:0.4,spawnT:0.4,alive:true,t:Math.random()*10};
  B.en.push(e);
  for(let i=0;i<10;i++)B.fx.push({k:'p',x,y,vx:rand(-120,120),vy:rand(-120,120),life:.5,max:.5,col:d.col,s:3});
  return e;
}
function edgePos(){
  const side=(Math.random()*3)|0;const w=B.w,h=B.h;
  let x,y;
  if(side===0){x=rand(80,w-80);y=60;}else if(side===1){x=60;y=rand(60,h*.6);}else{x=w-60;y=rand(60,h*.6);}
  if(Math.hypot(x-P.x,y-P.y)<260){x=w-x;}
  return{x,y};
}
function nextWave(){
  B.wave++;const W_=B.def.waves[B.wave];
  for(const [t,n] of W_)for(let i=0;i<n;i++)B.spawnQ.push(t);
  B.spawnQ.sort(()=>Math.random()-.5);B.spawnT=0.6;
  banner(`<b>WAVE ${B.wave+1} / ${B.def.waves.length}</b>`,1800);
  if(B.wave===1)setTimeout(()=>B&&bark('투몰투스','폴른도 변이했습니다! 원거리 산성탄 주의!'),1500);
  if(B.wave===2)setTimeout(()=>B&&bark('콘투수스','저 덩치 큰 놈들, 외피가 완전 강철이에요!'),1500);
}

/* ---------- messaging ---------- */
let bannerTimer=null;
function banner(html,ms){const b=$('banner');b.innerHTML=html;b.classList.add('on');clearTimeout(bannerTimer);if(ms)bannerTimer=setTimeout(()=>b.classList.remove('on'),ms);}
function bark(n,x){
  const s=SPK[n]||{c:'#ddd',full:n};const el=document.createElement('div');el.className='bk';el.style.color=s.c;
  el.innerHTML=`<b>${n}</b><span></span>`;el.querySelector('span').textContent=x;
  const box=$('barks');box.appendChild(el);while(box.children.length>2)box.removeChild(box.firstChild);
  setTimeout(()=>{el.style.transition='opacity .4s';el.style.opacity=0;setTimeout(()=>el.remove(),450);},3600);
}
function barkOnce(key,n,x){if(B.barked[key])return;B.barked[key]=1;bark(n,x);}
function ftxt(x,y,s,col,big){B.txt.push({x,y,s,col,life:.8,max:.8,big});}

/* ---------- tutorial ---------- */
const TUT=[
  {p:'<b>에토스</b> · 왼쪽 화면을 드래그(또는 WASD)해서 이동해 보십시오.',init(){},done:()=>B.tut.moved>260},
  {p:'<b>에토스</b> · 공격 버튼(J)으로 홀로그램을 베어 보십시오. 누르고 있으면 3연격이 이어집니다.',init(){ring('dummy',3,170);},done:()=>alive()===0},
  {p:'<b>에토스</b> · 붉은 표식은 적의 공격 범위입니다. 회피(K)로 빠져나가십시오. 닿기 직전에 피하면 <b>완벽 회피</b>.',init(){B.tut.dodges=0;B.tut.zt=0.6;},done:()=>B.tut.dodges>=2,tick(dt){B.tut.zt-=dt;if(B.tut.zt<=0){B.tut.zt=1.7;addHaz({k:'circle',x:P.x,y:P.y,r:62,t:.95,dmg:6});}}},
  {p:'<b>에토스</b> · 스킬(L) — 이든의 <b>[태초의 공허]</b>는 적을 끌어당겨 삼킵니다.',init(){P.skillCd.eden=0;B.tut.sk=0;ring('dummy',5,150,true);},done:()=>B.tut.sk>0&&alive()===0},
  {p:'<b>에토스</b> · 교대(Q)로 네시스와 자리를 바꾸십시오. 교대하는 순간 등장 공격이 나갑니다.',init(){},done:()=>P.active==='nesis'},
  {p:'<b>에토스</b> · 네시스의 <b>[흡융]</b>은 주변 적의 사념을 흡수해 체력을 회복하고 링크 게이지를 채웁니다.',init(){P.skillCd.nesis=0;B.tut.sk=0;P.hp.nesis=Math.round(CH.nesis.maxhp*.6);ring('dummy',5,110);},done:()=>B.tut.sk>0&&alive()===0},
  {p:'<b>에토스</b> · 링크 게이지가 가득 찼습니다. 링크(E) — <b>[링크 0 : 공허 & 흡융]</b>을 발동하십시오.',init(){P.link=100;B.tut.lk=0;ring('dummy',7,190);},done:()=>B.tut.lk>0&&alive()===0},
  {p:'<b>에토스</b> · 실전 시뮬레이션. 강화 공허체를 전멸시키십시오.',init(){B.tut.fw=0;for(let i=0;i<6;i++){const p=edgePos();spawn('holo',p.x,p.y);}},done:()=>false,
    tick(){if(alive()===0){if(B.tut.fw===0){B.tut.fw=1;for(let i=0;i<4;i++){const p=edgePos();spawn('holo',p.x,p.y);}const p=edgePos();spawn('holobrute',p.x,p.y);banner('<b>에토스</b> · 마지막 개체군입니다. 거구는 장갑이 두껍습니다 — 스킬과 링크를 활용하십시오.',3500);}else if(B.tut.fw===1){B.tut.fw=2;win();}}}},
];
function alive(){let n=0;for(const e of B.en)if(e.alive)n++;return n;}
function ring(type,n,r,cluster){
  const cx=cluster?P.x+Math.cos(P.face)*180:P.x,cy=cluster?P.y+Math.sin(P.face)*180:P.y;
  for(let i=0;i<n;i++){const a=i/n*TAU;spawn(type,clamp(cx+Math.cos(a)*(cluster?60:r),60,B.w-60),clamp(cy+Math.sin(a)*(cluster?60:r),60,B.h-60));}
}
function tutInit(){B.tut={i:-1,moved:0,dodges:0,sk:0,lk:0};tutNext();}
function tutNext(){
  B.tut.i++;const s=TUT[B.tut.i];if(!s)return;
  banner(s.p+(B.tut.i<7?'<br><button class="sbtn skp" id="tutSkip">튜토리얼 건너뛰기</button>':''),0);
  const sk=$('tutSkip');if(sk)sk.onclick=e=>{e.stopPropagation();B.en.forEach(x=>x.alive=false);B.haz=[];B.tut.i=6;P.active='eden';tutNext();};
  s.init();
}
function tutUpdate(dt){
  const s=TUT[B.tut.i];if(!s)return;
  if(s.tick)s.tick(dt);
  if(s.done()){SFX.perfect();ftxt(P.x,P.y-50,'OK!','#8fd8ff',1);B.en=B.en.filter(e=>e.alive);tutNext();}
}

/* ---------- hazards ---------- */
function addHaz(h){h.t0=h.t;h.life=h.life||0;h.col=h.col||'255,60,90';B.haz.push(h);if(h.t>0.3)SFX.warn();return h;}
function inHaz(h,o,pad){
  pad=pad||0;
  const dx=o.x-h.x,dy=o.y-h.y,d=Math.hypot(dx,dy);
  switch(h.k){
    case 'circle':return d<=h.r+pad;
    case 'ring':return d<=h.r+pad&&d>=h.r2-pad;
    case 'cone':return d<=h.r+pad&&Math.abs(angDiff(h.ang,Math.atan2(dy,dx)))<=h.arc/2;
    case 'line':{const c=Math.cos(h.ang),s=Math.sin(h.ang);const al=dx*c+dy*s,pe=Math.abs(-dx*s+dy*c);return al>=-pad&&al<=h.len+pad&&pe<=h.w/2+pad;}
  }
  return false;
}
function hazHit(h){
  if(!h.hitP&&inHaz(h,P,P.r*.6)){h.hitP=1;hurtPlayer(h.dmg,h);}
  for(const a of B.allies)if(a.hp>0&&!(h.hitA&&h.hitA.has(a))&&inHaz(h,a,a.r*.5)){(h.hitA||(h.hitA=new Set())).add(a);hurtAlly(a,h.dmg*.6);}
  if(B.core&&!h.hitC&&inHaz(h,B.core,B.core.r*.6)){h.hitC=1;hurtCore(h.dmg*(h.coreMul||1));}
}
function updateHaz(dt){
  for(const h of B.haz){
    if(h.owner&&!h.owner.alive&&!h.fired){h.dead=1;continue;}
    if(h.t>0){h.t-=dt;if(h.t<=0){h.fired=1;hazHit(h);if(h.onFire)h.onFire(h);fxHaz(h);}}
    else{h.life-=dt;if(h.life>0)hazHit(h);else h.dead=1;}
    if(h.fired&&h.life<=0)h.dead=1;
  }
  B.haz=B.haz.filter(h=>!h.dead);
}
function fxHaz(h){
  const col=h.fxc||'#ff5a7a';
  if(h.k==='circle'||h.k==='ring'){B.fx.push({k:'ring',x:h.x,y:h.y,r:h.r*.4,r2:h.r*1.05,life:.3,max:.3,col});}
  for(let i=0;i<8;i++){let x=h.x,y=h.y;if(h.k==='line'){const t=Math.random()*h.len;x+=Math.cos(h.ang)*t;y+=Math.sin(h.ang)*t;}else if(h.k==='cone'){const a=h.ang+rand(-h.arc/2,h.arc/2),rr=rand(0,h.r);x+=Math.cos(a)*rr;y+=Math.sin(a)*rr;}else{const a=rand(0,TAU),rr=rand(h.r2||0,h.r);x+=Math.cos(a)*rr;y+=Math.sin(a)*rr;}
    B.fx.push({k:'p',x,y,vx:rand(-60,60),vy:rand(-90,-10),life:.4,max:.4,col,s:3});}
  if(h.big){B.shake=Math.max(B.shake,8);SFX.boom();}
}

/* ---------- player ---------- */
function other(){return P.active==='eden'?'nesis':'eden';}
function nearestEnemy(x,y,maxd,filter){let best=null,bd=maxd||1e9;for(const e of B.en){if(!e.alive||e.inv||e.spawnT>0)continue;if(filter&&!filter(e))continue;const d=Math.hypot(e.x-x,e.y-y)-e.r;if(d<bd){bd=d;best=e;}}return best;}
function updatePlayer(dt){
  const c=CH[P.active];
  readMove();
  const mx=inp.mx,my=inp.my;
  if(B.tut&&(mx||my))B.tut.moved+=c.spd*dt;
  P.walk+=dt*(mx||my?1:0);
  if(P.dashT>0){P.x+=P.dvx*dt;P.y+=P.dvy*dt;P.dashT-=dt;
    if(Math.random()<.8)B.fx.push({k:'ghost',x:P.x,y:P.y,who:P.active,face:P.face,life:.22,max:.22});}
  else{
    const sp=c.spd*(P.atkT>0?0.3:1);
    P.x+=mx*sp*dt;P.y+=my*sp*dt;
    if((mx||my)&&P.atkT<=0)P.face=Math.atan2(my,mx);
  }
  P.x=clamp(P.x,24,B.w-24);P.y=clamp(P.y,24,B.h-24);
  if(P.dashT<=0)for(const e of B.en){if(!e.alive||e.spawnT>0)continue;const d=dist(P,e),m=P.r+e.r;if(d<m&&d>0){const k=(m-d)/d;P.x+=(P.x-e.x)*k*.5;P.y+=(P.y-e.y)*k*.5;}}
  if(B.core){const d=dist(P,B.core),m=P.r+B.core.r;if(d<m&&d>0){const k=(m-d)/d;P.x+=(P.x-B.core.x)*k;P.y+=(P.y-B.core.y)*k;}}
  P.atkT-=dt;P.comboWin-=dt;P.dashI-=dt;P.dashCd-=dt;P.iT-=dt;P.tagCd-=dt;
  P.skillCd.eden-=dt;P.skillCd.nesis-=dt;
  const o=other();if(P.hp[o]>0)P.hp[o]=Math.min(CH[o].maxhp,P.hp[o]+CH[o].maxhp*0.012*dt);
  if(B.cine)return;
  if(inp.dashP&&P.dashCd<=0)doDash();
  else if(inp.atk&&P.atkT<=0&&P.dashT<=0)doAttack();
  if(inp.skillP&&P.skillCd[P.active]<=0&&P.dashT<=0)doSkill();
  if(inp.tagP&&P.tagCd<=0&&P.hp[o]>0)doTag(false);
  if(inp.linkP&&P.link>=100)doLink();
}
function doAttack(){
  const c=CH[P.active];
  if(P.comboWin<=0)P.combo=0;
  const k=c.combo[P.combo];
  const tg=nearestEnemy(P.x,P.y,230);
  if(tg)P.face=angTo(P,tg);
  P.atkT=k.d;P.atkD=k.d;P.comboWin=k.d+0.45;P.swing=-P.swing;
  P.x+=Math.cos(P.face)*10;P.y+=Math.sin(P.face)*10;
  let hits=0;
  for(const e of B.en){
    if(!e.alive||e.inv||e.spawnT>0)continue;
    const d=dist(P,e);if(d>k.r+e.r)continue;
    if(d>e.r+8&&Math.abs(angDiff(P.face,angTo(P,e)))>k.a/2)continue;
    hitEnemy(e,k.dmg,{kb:P.combo===2?190:90,ang:P.face,col:k.col});hits++;
  }
  B.fx.push({k:'slash',x:P.x,y:P.y,ang:P.face,r:k.r,a:k.a,col:k.col,life:.18,max:.18,dir:P.swing,w:P.active==='nesis'?16:9});
  if(k.fin==='chain'){
    let src=P,done=new Set();
    for(let j=0;j<3;j++){const n=nearestEnemy(src.x,src.y,170,e=>!done.has(e));if(!n)break;done.add(n);
      B.fx.push({k:'bolt',x1:src.x,y1:src.y,x2:n.x,y2:n.y,life:.18,max:.18,col:'#7fdcff'});hitEnemy(n,6,{kb:30,ang:angTo(src,n),col:'#7fdcff',nolink:false});src=n;}
  }
  if(k.fin==='wave'){B.pb.push({x:P.x,y:P.y,vx:Math.cos(P.face)*520,vy:Math.sin(P.face)*520,r:26,dmg:14,life:.55,pierce:1,hit:new Set(),col:'#6cb8ff',k:'wave',ang:P.face});}
  P.active==='eden'?SFX.slashE():SFX.slashN();
  P.combo=(P.combo+1)%3;
}
function doDash(){
  let a=(inp.mx||inp.my)?Math.atan2(inp.my,inp.mx):P.face;
  P.face=a;P.dvx=Math.cos(a)*640;P.dvy=Math.sin(a)*640;P.dashT=0.17;P.dashI=0.3;P.dashCd=0.55;P.perfectUsed=false;P.atkT=0;
  SFX.dash();if(B.tut&&B.tut.i===2)B.tut.dodges++;
}
function doSkill(){
  const who=P.active;P.skillCd[who]=CH[who].skill.cd;
  if(B.tut)B.tut.sk++;
  if(who==='eden'){
    const tg=nearestEnemy(P.x,P.y,300);
    const x=tg?tg.x:P.x+Math.cos(P.face)*130,y=tg?tg.y:P.y+Math.sin(P.face)*130;
    B.fields.push({x:clamp(x,40,B.w-40),y:clamp(y,40,B.h-40),r:130,t:0,dur:2.6,tick:0});
    SFX.void();B.shake=Math.max(B.shake,5);
    bark('센수스',pick(['공허다! 다 빨려 들어가라~!','이든, 저 녀석들 다 삼켜버려!','헤헤, 맛있겠다!']));
  }else{
    let n=0;
    for(const e of B.en){if(!e.alive||e.spawnT>0)continue;if(dist(P,e)<=175+e.r){hitEnemy(e,30,{kb:-120,ang:angTo(P,e),col:'#dff2ff'});n++;
      B.fx.push({k:'bolt',x1:e.x,y1:e.y,x2:P.x,y2:P.y,life:.35,max:.35,col:'#e8f6ff'});}}
    let conv=0;
    B.eb=B.eb.filter(b=>{if(Math.hypot(b.x-P.x,b.y-P.y)<200){conv++;return false;}return true;});
    for(let i=0;i<Math.min(conv,10);i++){const a=rand(0,TAU);B.pb.push({x:P.x,y:P.y,vx:Math.cos(a)*200,vy:Math.sin(a)*200,r:8,dmg:9,life:2.2,pierce:0,hit:new Set(),col:'#ffffff',k:'orb',homing:1});}
    const heal=Math.min(.28,.05+n*.045)*CH.nesis.maxhp;
    P.hp.nesis=Math.min(CH.nesis.maxhp,P.hp.nesis+heal);ftxt(P.x,P.y-40,'+'+Math.round(heal),'#9dffb5',1);
    addLink(6*n+4);
    B.fx.push({k:'ring',x:P.x,y:P.y,r:200,r2:20,life:.45,max:.45,col:'#cfe9ff',inward:1});
    SFX.drain();
    bark('클라우스룸',pick(['흡융 — 사념을 회수합니다.','적의 힘은 곧 주인의 힘입니다.','정지된 사념을 거두겠습니다.']));
  }
}
function doTag(forced){
  const from=P.active;P.active=other();P.tagCd=forced?0.5:1.2;P.atkT=0;P.combo=0;P.iT=Math.max(P.iT,forced?1.2:0.35);
  B.fx.push({k:'ghost',x:P.x-Math.cos(P.face)*24,y:P.y-Math.sin(P.face)*24,who:from,face:P.face,life:.5,max:.5});
  const col=P.active==='eden'?'#b49bff':'#cfe9ff';
  for(const e of B.en){if(e.alive&&e.spawnT<=0&&dist(P,e)<95+e.r)hitEnemy(e,forced?6:14,{kb:140,ang:angTo(P,e),col});}
  B.fx.push({k:'ring',x:P.x,y:P.y,r:100,r2:10,life:.3,max:.3,col});
  SFX.tag();updateHudStatic();
  if(!forced&&Math.random()<.5)bark(P.active==='eden'?'센티아':'이럽디오',P.active==='eden'?pick(['교대 확인. 사각은 내가 읽을게.','이든, 손목 조심해!']):pick(['…맡겨라, 네시스.','길은 내가 연다.']));
}
function addLink(v){P.link=Math.min(100,P.link+v);}
function doLink(){
  P.link=0;if(B.tut)B.tut.lk++;
  B.cine={t:0,dur:1.5,x:P.x,y:P.y};
  SFX.link();flash('#c9b6ff',.35);
  B.haz=B.haz.filter(h=>h.fired);B.eb=[];
  B.stats.links=(B.stats.links||0)+1;
}
function linkImpact(){
  const x=P.x,y=P.y;
  for(const e of B.en){if(!e.alive||e.spawnT>0)continue;if(Math.hypot(e.x-x,e.y-y)<=360+e.r)hitEnemy(e,e.d.boss?190:240,{kb:300,ang:Math.atan2(e.y-y,e.x-x),col:'#ffe6a0',nolink:true,big:true});}
  B.fx.push({k:'ring',x,y,r:380,r2:30,life:.7,max:.7,col:'#c9b6ff'});
  B.fx.push({k:'ring',x,y,r:340,r2:20,life:.9,max:.9,col:'#9fe2ff'});
  for(let i=0;i<60;i++){const a=rand(0,TAU),s=rand(150,600);B.fx.push({k:'p',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.8,max:.8,col:i%2?'#c9b6ff':'#bfeaff',s:4});}
  B.shake=16;SFX.boom();flash('#fff',.7);B.linkInv=2.2;P.iT=2.2;
  bark('네시스','이든, 지금이야!');
}
function hurtPlayer(dmg,src){
  if(B.over||B.winT>=0)return;
  if(P.dashI>0){if(!P.perfectUsed){P.perfectUsed=true;perfectDodge();}return;}
  if(P.iT>0||B.linkInv>0||B.cine)return;
  dmg=Math.round(dmg*rand(.92,1.08));
  P.hp[P.active]-=dmg;P.iT=0.45;B.stats.taken+=dmg;
  ftxt(P.x,P.y-30,'-'+dmg,'#ff6b8a');B.shake=Math.max(B.shake,6);SFX.hurt();addLink(3);
  if(P.hp[P.active]<=0){P.hp[P.active]=0;
    if(P.hp[other()]>0){bark(other()==='eden'?'이든':'네시스',other()==='eden'?'네시스! ...물러나 있어, 내가 간다.':'이든! 내가 이어받을게!');doTag(true);}
    else lose();}
}
function perfectDodge(){
  B.stats.perfect++;B.slow=0.55;B.slowS=0.3;addLink(12);ftxt(P.x,P.y-46,'완벽 회피!','#bfe9ff',1);SFX.perfect();
  if(B.tut&&B.tut.i===2)B.tut.dodges++;
  if(Math.random()<.4)bark('센티아',pick(['좋아, 그 타이밍이야!','흥, 그 정도는 해야지.','5번 루트, 정확해!']));
}
function hurtAlly(a,dmg){a.hp-=dmg;ftxt(a.x,a.y-26,'-'+Math.round(dmg),'#ffb0a0');if(a.hp<=0){a.hp=0;a.down=7;bark(a.name,'크윽... 잠시만 버텨주십시오!');}}
function hurtCore(dmg){if(!B.core)return;B.core.hp-=dmg;B.core.flash=.15;if(B.core.hp<=0){B.core.hp=0;lose('방어막 발생기가 파괴되었습니다.');}}
function hitEnemy(e,dmg,o){
  if(!e.alive||e.inv)return;
  o=o||{};
  let crit=!o.ally&&Math.random()<.12;
  let d=dmg*(crit?1.6:1)*(e.d.armor||1)*rand(.92,1.08);
  if(e.d.boss&&e.armorBreak)d*=1.3;
  d=Math.max(1,Math.round(d));
  e.hp-=d;e.flash=.1;
  if(!e.d.heavy&&o.kb){e.kx+=Math.cos(o.ang)*o.kb;e.ky+=Math.sin(o.ang)*o.kb;}
  else if(o.kb){e.kx+=Math.cos(o.ang)*o.kb*.08;e.ky+=Math.sin(o.ang)*o.kb*.08;}
  ftxt(e.x+rand(-8,8),e.y-e.r-6,(crit?'✦':'')+d,crit?'#ffe08a':(o.ally?'#ffc2b3':'#ffffff'),crit||o.big);
  for(let i=0;i<(o.ally?2:5);i++)B.fx.push({k:'p',x:e.x,y:e.y,vx:rand(-160,160),vy:rand(-160,160),life:.3,max:.3,col:o.col||'#fff',s:2.5});
  if(!o.ally){B.hitstop=Math.max(B.hitstop,o.big?0.09:0.035);SFX.hit();
    if(!o.nolink)addLink(e.d.boss?2.2:1.5);
    B.combo++;B.comboT=2.2;if(B.combo>B.stats.maxCombo)B.stats.maxCombo=B.combo;}
  if(e.hp<=0)killEnemy(e);
}
function killEnemy(e){
  e.alive=false;e.hp=0;
  const n=e.d.boss?40:14;
  for(let i=0;i<n;i++){const a=rand(0,TAU),s=rand(60,e.d.boss?420:220);B.fx.push({k:'p',x:e.x,y:e.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:e.d.boss?1:.5,max:e.d.boss?1:.5,col:i%3?e.d.col:'#ffffff',s:e.d.boss?4:3});}
  B.haz=B.haz.filter(h=>h.owner!==e||h.fired);
  if(e.d.boss){
    B.slow=1.2;B.slowS=0.25;B.shake=14;SFX.boom();flash('#fff',.5);
    if(e.type==='abi')bark('아비','아하... 아하하... 파시스 님... 제가, 먼저... 돌아갑...');
    if(e.type==='mor')bark('모르','...오류. 파시스 님... 죄송... 합니...다.');
    if(e.type==='phasis')bark('파시스','이렇게 강한 인간이 존재한다는 이야기는... 듣지 못하였다...');
  }
}

/* ---------- allies ---------- */
function updateAllies(dt){
  for(const a of B.allies){
    if(a.hp<=0){a.down-=dt;if(a.down<=0){a.hp=a.maxhp*.5;bark(a.name,'다시 전열에 합류합니다!');}continue;}
    a.atkCd-=dt;a.swing=Math.max(0,a.swing-dt*4);
    let tg=null,bd=1e9;
    for(const e of B.en){if(!e.alive||e.inv||e.spawnT>0)continue;let d=Math.hypot(e.x-a.x,e.y-a.y);if(e.type==='mor')d*=.4;if(d<bd){bd=d;tg=e;}}
    let tx,ty,want;
    if(tg){tx=tg.x;ty=tg.y;want=tg.r+a.r+12;}else{const i=B.allies.indexOf(a);tx=P.x+Math.cos(i*2.1+1)*70;ty=P.y+Math.sin(i*2.1+1)*70;want=10;}
    const d=Math.hypot(tx-a.x,ty-a.y);
    if(d>want){const s=165*dt;a.x+=(tx-a.x)/d*s;a.y+=(ty-a.y)/d*s;a.face=Math.atan2(ty-a.y,tx-a.x);}
    else if(tg&&a.atkCd<=0){a.atkCd=rand(.8,1.1);a.swing=1;a.face=Math.atan2(ty-a.y,tx-a.x);hitEnemy(tg,a.name==='렉소르'?9:7,{ally:1,kb:60,ang:a.face,col:a.c});}
    a.x=clamp(a.x,20,B.w-20);a.y=clamp(a.y,20,B.h-20);
  }
}

/* ---------- enemies ---------- */
function targets(){
  const L=[{o:P,w:1}];
  for(const a of B.allies)if(a.hp>0)L.push({o:a,w:1.35});
  if(B.core&&B.core.hp>0)L.push({o:B.core,w:.5});
  return L;
}
function pickTarget(e,allyBias){
  let best=P,bd=1e9;
  for(const c of targets()){let w=c.w;if(allyBias&&c.o!==P&&c.o!==B.core)w*=allyBias;const d=Math.hypot(c.o.x-e.x,c.o.y-e.y)*w;if(d<bd){bd=d;best=c.o;}}
  return best;
}
function sched(e,t,fn){e.q.push({t,fn});}
function moveTo(e,x,y,sp,dt,stop){const d=Math.hypot(x-e.x,y-e.y);if(d>(stop||0)){const s=Math.min(d-(stop||0),sp*dt);e.x+=(x-e.x)/d*s;e.y+=(y-e.y)/d*s;}return d;}
function updateEnemies(dt){
  for(const e of B.en){
    if(!e.alive)continue;
    e.t+=dt;e.flash-=dt;
    if(e.spawnT>0){e.spawnT-=dt;continue;}
    e.x+=e.kx*dt;e.y+=e.ky*dt;e.kx*=Math.pow(.002,dt);e.ky*=Math.pow(.002,dt);
    if(e.q.length){for(const q of e.q){q.t-=dt;if(q.t<=0&&!q.done){q.done=1;q.fn();}}e.q=e.q.filter(q=>!q.done);}
    if(e.dash){const D_=e.dash;D_.t+=dt;const k=Math.min(1,D_.t/D_.d);e.x=lerp(D_.x0,D_.x1,k);e.y=lerp(D_.y0,D_.y1,k);
      if(Math.random()<.7)B.fx.push({k:'p',x:e.x,y:e.y,vx:0,vy:0,life:.25,max:.25,col:e.d.col,s:5});if(k>=1)e.dash=null;}
    e.busy-=dt;
    AI[e.d.ai](e,dt);
    e.x=clamp(e.x,e.r,B.w-e.r);e.y=clamp(e.y,e.r,B.h-e.r);
  }
  for(let i=0;i<B.en.length;i++){const a=B.en[i];if(!a.alive||a.dash)continue;
    for(let j=i+1;j<B.en.length;j++){const b=B.en[j];if(!b.alive||b.dash)continue;const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),m=a.r+b.r;
      if(d<m&&d>0){const k=(m-d)/d*.5;const wa=a.d.boss?.1:1,wb=b.d.boss?.1:1;a.x-=dx*k*wa;a.y-=dy*k*wa;b.x+=dx*k*wb;b.y+=dy*k*wb;}}}
}
const AI={
  dummy(e,dt){},
  chaser(e,dt){
    e.tgtT-=dt;if(e.tgtT<=0||!e.tgt||(e.tgt.hp!==undefined&&e.tgt!==P&&e.tgt.hp<=0)){e.tgt=pickTarget(e);e.tgtT=.6;}
    const t=e.tgt;const tr=t===P?P.r:(t.r||14);
    if(e.state==='move'){
      const d=moveTo(e,t.x,t.y,e.d.spd*(B.id==='tut'?.85:1),dt,e.r+tr+(e.d.lunge?50:16));
      e.face=Math.atan2(t.y-e.y,t.x-e.x);
      e.cd-=dt;
      if(d<=e.r+tr+(e.d.lunge?58:24)&&e.cd<=0){
        e.state='wind';
        if(e.d.lunge){const ang=e.face,len=150;e.st=.55;
          addHaz({k:'line',x:e.x,y:e.y,ang,len,w:34,t:.55,dmg:e.d.dmg,owner:e,coreMul:1.4,fxc:e.d.col,
            onFire:()=>{e.dash={x0:e.x,y0:e.y,x1:clamp(e.x+Math.cos(ang)*len,0,B.w),y1:clamp(e.y+Math.sin(ang)*len,0,B.h),t:0,d:.12};}});}
        else{e.st=.5;addHaz({k:'cone',x:e.x,y:e.y,ang:e.face,r:e.r+52,arc:1.7,t:.5,dmg:e.d.dmg,owner:e,coreMul:1.4,fxc:e.d.col});}
      }
    }else if(e.state==='wind'){e.st-=dt;if(e.st<=0){e.state='rec';e.st=.55;}}
    else if(e.state==='rec'){e.st-=dt;if(e.st<=0){e.state='move';e.cd=rand(.6,1.3);}}
  },
  spitter(e,dt){
    e.tgtT-=dt;if(e.tgtT<=0||!e.tgt){e.tgt=pickTarget(e);e.tgtT=1;}
    const t=e.tgt;const d=Math.hypot(t.x-e.x,t.y-e.y);e.face=Math.atan2(t.y-e.y,t.x-e.x);
    if(d<210){e.x-=Math.cos(e.face)*e.d.spd*dt;e.y-=Math.sin(e.face)*e.d.spd*dt;}
    else if(d>320){e.x+=Math.cos(e.face)*e.d.spd*dt;e.y+=Math.sin(e.face)*e.d.spd*dt;}
    else{e.x+=Math.cos(e.face+PI/2)*40*dt;e.y+=Math.sin(e.face+PI/2)*40*dt;}
    e.cd-=dt;
    if(e.cd<=0){e.cd=rand(2,2.8);e.charge=.4;}
    if(e.charge>0){e.charge-=dt;if(e.charge<=0){const a=e.face;B.eb.push({x:e.x,y:e.y,vx:Math.cos(a)*240,vy:Math.sin(a)*240,r:8,dmg:e.d.dmg,life:2.6,col:'#b37bff'});SFX.shoot();}}
  },
  brute(e,dt){
    e.tgtT-=dt;if(e.tgtT<=0||!e.tgt){e.tgt=pickTarget(e);e.tgtT=1;}
    const t=e.tgt;
    if(e.busy<=0){
      const d=moveTo(e,t.x,t.y,e.d.spd,dt,e.r+40);e.face=Math.atan2(t.y-e.y,t.x-e.x);e.cd-=dt;
      if(d<e.r+70&&e.cd<=0){e.busy=1.5;e.cd=rand(1.2,2);
        addHaz({k:'circle',x:e.x+Math.cos(e.face)*30,y:e.y+Math.sin(e.face)*30,r:100,t:.95,dmg:e.d.dmg,owner:e,big:1,coreMul:1.5,fxc:'#ffb36b'});}
    }
  },
  abi(e,dt){
    if(e.busy>0)return;
    const d=dist(e,P);e.face=angTo(e,P);
    const s=e.d.spd*dt;const want=175;
    if(d>want+40){e.x+=Math.cos(e.face)*s;e.y+=Math.sin(e.face)*s;}else if(d<want-40){e.x-=Math.cos(e.face)*s;e.y-=Math.sin(e.face)*s;}
    e.x+=Math.cos(e.face+PI/2)*s*.5;e.y+=Math.sin(e.face+PI/2)*s*.5;
    e.cd-=dt;if(e.cd>0)return;
    const fast=e.hp<e.maxhp*.5?.75:1;
    const p=pick(['blink','blink','triple','rift']);
    if(p==='blink'){
      e.busy=1.55*fast;e.inv=true;e.fade=1;
      sched(e,.38*fast,()=>{const a=rand(0,TAU);e.x=clamp(P.x+Math.cos(a)*240,40,B.w-40);e.y=clamp(P.y+Math.sin(a)*240,40,B.h-40);e.inv=false;e.fade=0;
        const ang=angTo(e,P);e.face=ang;const len=440;
        addHaz({k:'line',x:e.x,y:e.y,ang,len,w:44,t:.62*fast,dmg:34,owner:e,fxc:'#c98cff',
          onFire:()=>{e.dash={x0:e.x,y0:e.y,x1:clamp(e.x+Math.cos(ang)*len,30,B.w-30),y1:clamp(e.y+Math.sin(ang)*len,30,B.h-30),t:0,d:.14};}});});
    }else if(p==='triple'){
      e.busy=1.25*fast;const base=angTo(e,P);
      [-.38,0,.38].forEach((o,i)=>sched(e,i*.13,()=>addHaz({k:'line',x:e.x,y:e.y,ang:base+o,len:290,w:34,t:.6*fast,dmg:24,owner:e,fxc:'#c98cff'})));
    }else{
      e.busy=1.4*fast;
      barkOnce('rift','센티아','네시스! 뒤야! 창의 잔상이 공간을 왜곡하고 있어! 5번 루트로 회피!');
      const vx=inp.mx*120,vy=inp.my*120,bk=P.face+PI;
      [[P.x,P.y],[P.x+vx*1.2,P.y+vy*1.2],[P.x+Math.cos(bk)*70,P.y+Math.sin(bk)*70]].forEach(([x,y],i)=>sched(e,i*.18,()=>addHaz({k:'circle',x,y,r:58,t:.85*fast,dmg:26,owner:e,fxc:'#c98cff'})));
    }
    e.cd=rand(.7,1.3)*fast;
  },
  mor(e,dt){
    if(e.busy>0)return;
    e.tgtT-=dt;if(e.tgtT<=0||!e.tgt||(e.tgt!==P&&e.tgt.hp<=0)){e.tgt=pickTarget(e,.45);e.tgtT=2;}
    const t=e.tgt;const d=Math.hypot(t.x-e.x,t.y-e.y);e.face=Math.atan2(t.y-e.y,t.x-e.x);
    if(d>140)moveTo(e,t.x,t.y,e.d.spd,dt,120);
    e.cd-=dt;if(e.cd>0)return;
    if(e.hp<e.maxhp*.6)barkOnce('morhp','렉소르','크윽... 이 여자, 힘이 장난이 아니군! 방패가 버티질 못해!');
    if(e.hp<e.maxhp*.35)barkOnce('morhp2','투몰투스','지형을 이용해야 합니다! 콘투수스, 우측 잔해 뒤로 유인하세요!');
    let p=d>240?'charge':pick(['slam','slam','sweep']);
    if(p==='slam'){e.busy=1.8;const tx=e.x+Math.cos(e.face)*Math.min(d,130),ty=e.y+Math.sin(e.face)*Math.min(d,130);
      addHaz({k:'circle',x:tx,y:ty,r:115,t:1,dmg:44,owner:e,big:1,fxc:'#ffb36b',
        onFire:()=>addHaz({k:'ring',x:tx,y:ty,r:240,r2:125,t:.38,dmg:20,owner:e,fxc:'#ff9f5a'})});}
    else if(p==='sweep'){e.busy=1.3;addHaz({k:'cone',x:e.x,y:e.y,ang:e.face,r:180,arc:2.6,t:.8,dmg:36,owner:e,fxc:'#ffb36b'});}
    else{e.busy=1.6;const ang=e.face,len=Math.min(400,d+80);
      addHaz({k:'line',x:e.x,y:e.y,ang,len,w:72,t:.85,dmg:40,owner:e,fxc:'#ffb36b',big:1,
        onFire:()=>{e.dash={x0:e.x,y0:e.y,x1:clamp(e.x+Math.cos(ang)*len,40,B.w-40),y1:clamp(e.y+Math.sin(ang)*len,40,B.h-40),t:0,d:.2};}});}
    e.cd=rand(.8,1.4);
  },
  phasis(e,dt){
    e.wing=(e.wing||0)+dt;
    const rage=e.hp<e.maxhp*.5;
    if(rage&&!e.rage){e.rage=1;bark('파시스','멈춰라! 그 비천한 구멍을 내 몸에 들이대지 마라! 어째서 내 \'강림\'의 위계가 필멸자의 심연 앞에 떨고 있는 거냐!');B.shake=10;SFX.boss();}
    if(e.hp<e.maxhp*.2)barkOnce('ph20','파시스','이렇게 강하다는 인간이 존재한다는 이야기는 듣지 못하였다! 너희들의 정체가 대체 무엇이냐!!');
    if(e.busy>0)return;
    const d=dist(e,P);e.face=angTo(e,P);
    if(d>300)moveTo(e,P.x,P.y,e.d.spd,dt);else if(d<200){e.x-=Math.cos(e.face)*e.d.spd*dt;e.y-=Math.sin(e.face)*e.d.spd*dt;}
    e.x+=Math.cos(e.t*.5)*30*dt;
    e.cd-=dt;if(e.cd>0)return;
    const k=rage?.7:1;
    const mins=B.en.filter(x=>x.alive&&x.type==='minion').length;
    let opts=['rain','burst','threads'];if(mins<3)opts.push('summon');if(d<190)opts.push('wing','wing');
    const p=pick(opts);
    if(p==='rain'){e.busy=1.6*k;const n=rage?13:9;
      for(let i=0;i<n;i++)sched(e,i*.07,()=>{const a=rand(0,TAU),r=i===0?0:rand(40,260);addHaz({k:'circle',x:clamp(P.x+Math.cos(a)*r,30,B.w-30),y:clamp(P.y+Math.sin(a)*r,30,B.h-30),r:46,t:.95*k+.1,dmg:24,owner:e,fxc:'#e3b8ff'});});
      barkOnce('rain','센티아','바늘비가 내린다! 붉은 원 밖으로!');}
    else if(p==='burst'){e.busy=1.5*k;const rings=rage?4:3;
      for(let r=0;r<rings;r++)sched(e,.35+r*.32*k,()=>{const n=rage?26:22,off=r*.12;for(let i=0;i<n;i++){const a=i/n*TAU+off;B.eb.push({x:e.x,y:e.y,vx:Math.cos(a)*230,vy:Math.sin(a)*230,r:6,dmg:15,life:3,col:'#e9d2ff',needle:1});}SFX.shoot();});
      e.charge=.35;}
    else if(p==='threads'){e.busy=2*k;const base=rand(0,TAU),n=rage?6:4;
      for(let i=0;i<n;i++)addHaz({k:'line',x:e.x,y:e.y,ang:base+i/n*TAU,len:900,w:26,t:1.05*k,dmg:28,owner:e,life:.35,fxc:'#f0d8ff'});
      sched(e,.9*k,()=>{for(let i=0;i<n;i++)addHaz({k:'line',x:e.x,y:e.y,ang:base+(i+.5)/n*TAU,len:900,w:26,t:1.05*k,dmg:28,owner:e,life:.35,fxc:'#f0d8ff'});});
      barkOnce('thr','클라우스룸','금속 실입니다! 존재의 좌표를 지우는 소멸의 궤적 — 선 위에 서지 마십시오!');}
    else if(p==='summon'){e.busy=1.2;for(let i=0;i<3;i++){const a=rand(0,TAU);spawn('minion',clamp(e.x+Math.cos(a)*90,40,B.w-40),clamp(e.y+Math.sin(a)*90,40,B.h-40));}
      barkOnce('sum','센수스','고철이 움직여! 저것도 다 혼내줄게!');}
    else{e.busy=1.4*k;addHaz({k:'cone',x:e.x,y:e.y,ang:e.face,r:215,arc:3.8,t:.85*k,dmg:38,owner:e,big:1,fxc:'#e3b8ff'});}
    e.cd=rand(.6,1.1)*k;
  },
};

/* ---------- projectiles / fields ---------- */
function updateProj(dt){
  for(const b of B.eb){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
    if(Math.hypot(b.x-P.x,b.y-P.y)<b.r+P.r*.8){if(P.dashI>0){if(!P.perfectUsed){P.perfectUsed=true;perfectDodge();}}else if(!(P.iT>0||B.linkInv>0)){hurtPlayer(b.dmg);b.life=0;}}
    if(B.core&&Math.hypot(b.x-B.core.x,b.y-B.core.y)<b.r+B.core.r){hurtCore(b.dmg*1.2);b.life=0;}
    for(const a of B.allies)if(a.hp>0&&Math.hypot(b.x-a.x,b.y-a.y)<b.r+a.r){hurtAlly(a,b.dmg*.5);b.life=0;break;}
    if(b.x<0||b.y<0||b.x>B.w||b.y>B.h)b.life=0;}
  B.eb=B.eb.filter(b=>b.life>0);
  for(const b of B.pb){
    if(b.homing){const n=nearestEnemy(b.x,b.y,600);if(n){const a=Math.atan2(n.y-b.y,n.x-b.x);b.vx+=Math.cos(a)*1400*dt;b.vy+=Math.sin(a)*1400*dt;const s=Math.hypot(b.vx,b.vy);if(s>520){b.vx*=520/s;b.vy*=520/s;}}}
    b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
    if(b.k==='wave'&&Math.random()<.9)B.fx.push({k:'p',x:b.x+rand(-14,14),y:b.y+rand(-14,14),vx:rand(-30,30),vy:rand(-60,0),life:.35,max:.35,col:pick(['#6cb8ff','#bfe3ff','#3d7dff']),s:4});
    for(const e of B.en){if(!e.alive||e.spawnT>0||b.hit.has(e))continue;if(Math.hypot(e.x-b.x,e.y-b.y)<e.r+b.r){b.hit.add(e);hitEnemy(e,b.dmg,{kb:80,ang:Math.atan2(b.vy,b.vx),col:b.col});if(!b.pierce){b.life=0;break;}}}
  }
  B.pb=B.pb.filter(b=>b.life>0);
  for(const f of B.fields){
    f.t+=dt;f.tick-=dt;
    for(const e of B.en){if(!e.alive||e.spawnT>0)continue;const d=Math.hypot(f.x-e.x,f.y-e.y);if(d<f.r+60&&d>4){const s=(e.d.boss?28:190)*dt;e.x+=(f.x-e.x)/d*Math.min(s,d);e.y+=(f.y-e.y)/d*Math.min(s,d);}}
    if(f.tick<=0){f.tick=.25;for(const e of B.en)if(e.alive&&e.spawnT<=0&&Math.hypot(f.x-e.x,f.y-e.y)<f.r+e.r)hitEnemy(e,8,{col:'#9b6bff',nolink:false});}
    B.eb=B.eb.filter(b=>Math.hypot(b.x-f.x,b.y-f.y)>f.r);
    if(Math.random()<.9){const a=rand(0,TAU);B.fx.push({k:'p',x:f.x+Math.cos(a)*f.r,y:f.y+Math.sin(a)*f.r,vx:-Math.cos(a)*f.r*2.4,vy:-Math.sin(a)*f.r*2.4,life:.4,max:.4,col:pick(['#9b6bff','#c9b6ff','#5b2bbf']),s:3});}
    if(f.t>=f.dur){f.dead=1;for(const e of B.en)if(e.alive&&e.spawnT<=0&&Math.hypot(f.x-e.x,f.y-e.y)<f.r+40+e.r)hitEnemy(e,34,{kb:200,ang:Math.atan2(e.y-f.y,e.x-f.x),col:'#c9b6ff',big:1});
      B.fx.push({k:'ring',x:f.x,y:f.y,r:f.r+60,r2:10,life:.4,max:.4,col:'#b49bff'});B.shake=Math.max(B.shake,7);SFX.boom();}
  }
  B.fields=B.fields.filter(f=>!f.dead);
}

/* ---------- flow ---------- */
function battleUpdate(rdt){
  if(!B)return;
  if(B.cine){B.cine.t+=rdt;if(B.cine.t>=B.cine.dur){B.cine=null;linkImpact();}}
  let dt=rdt;
  if(B.hitstop>0){B.hitstop-=rdt;dt=rdt*.08;}
  if(B.slow>0){B.slow-=rdt;dt*=B.slowS;}
  if(B.cine)dt*=.08;
  B.linkInv-=rdt;
  B.shake=Math.max(0,B.shake-rdt*30);
  B.comboT-=rdt;if(B.comboT<=0)B.combo=0;
  if(B.winT>=0){B.winT-=rdt;dt*=.35;if(B.winT<0){showResult();return;}}
  if(!B.over&&B.winT<0)B.stats.time+=rdt;
  updatePlayer(dt);clearPresses();
  updateAllies(dt);updateEnemies(dt);updateHaz(dt);updateProj(dt);
  for(const f of B.fx){f.life-=dt;if(f.vx!==undefined){f.x+=f.vx*dt;f.y+=f.vy*dt;f.vx*=.92;f.vy*=.92;}}
  B.fx=B.fx.filter(f=>f.life>0);if(B.fx.length>420)B.fx.splice(0,B.fx.length-420);
  for(const t of B.txt){t.life-=rdt;t.y-=40*rdt;}B.txt=B.txt.filter(t=>t.life>0);
  if(B.core&&B.core.flash>0)B.core.flash-=dt;
  // spawning & win
  if(B.over||B.winT>=0)return;
  if(B.tut)tutUpdate(dt);
  if(B.def.waves){
    if(B.spawnQ.length){B.spawnT-=dt;if(B.spawnT<=0){B.spawnT=.45;const p=edgePos();spawn(B.spawnQ.shift(),p.x,p.y);}}
    else if(alive()===0){
      if(B.wave<B.def.waves.length-1){healAll(.15);nextWave();}else win();
    }
  }
  if(B.def.bosses&&B.bossIds.every(e=>!e.alive)){B.en.forEach(e=>{if(e.alive)killEnemy(e);});win();}
}
function healAll(f){for(const k of ['eden','nesis'])if(P.hp[k]>0)P.hp[k]=Math.min(CH[k].maxhp,P.hp[k]+CH[k].maxhp*f);}
function win(){if(B.winT>=0||B.over)return;B.winT=1.6;B.haz=[];B.eb=[];SFX.win();$('banner').classList.remove('on');}
function lose(msg){if(B.over)return;B.over=true;SFX.lose();setTimeout(()=>{if(!B)return;$('oMsg').textContent=msg||'두 사람 모두 쓰러졌습니다.';show('over',true);GS.mode='over';},900);}
function showResult(){
  GS.mode='result';
  const s=B.stats;const t=s.time;
  let score=100-s.taken/12+s.maxCombo/3+s.perfect*2-Math.max(0,t-(B.id==='tut'?150:B.id==='outpost'?150:120))/3;
  const rank=score>=95?'S':score>=75?'A':score>=55?'B':'C';
  $('rRank').textContent=rank;
  $('rStats').innerHTML=`<span>전투 시간</span><b>${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}</b><span>받은 피해</span><b>${Math.round(s.taken)}</b><span>최대 콤보</span><b>${s.maxCombo}</b><span>완벽 회피</span><b>${s.perfect}</b>`;
  show('hud',false);show('ctrl',false);show('pauseB',false);show('result',true);
}
$('rNext').onclick=()=>{SFX.ui();show('result',false);B=null;nextStep();};
$('oRetry').onclick=()=>{SFX.ui();show('over',false);startBattle(B.id);};
$('oTitle').onclick=()=>{SFX.ui();toTitle();};
function togglePause(force){
  if(GS.mode!=='battle'&&!GS.paused)return;
  GS.paused=force!==undefined?force:!GS.paused;show('pause',GS.paused);
  $('pSnd').textContent='효과음: '+(SAVE.snd?'켜짐':'꺼짐');
}
$('pauseB').onclick=()=>{audioInit();togglePause();};
$('pRes').onclick=()=>togglePause(false);
$('pRetry').onclick=()=>{togglePause(false);startBattle(B.id);};
$('pTitle').onclick=()=>{togglePause(false);toTitle();};
$('pSnd').onclick=()=>{SAVE.snd=!SAVE.snd;persist();$('pSnd').textContent='효과음: '+(SAVE.snd?'켜짐':'꺼짐');};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&GS.mode==='battle'&&!GS.paused)togglePause(true);});

/* ---------- HUD ---------- */
const hudCache={};
function setW(id,v){v=Math.max(0,Math.min(1,v));const k=Math.round(v*400);if(hudCache[id]===k)return;hudCache[id]=k;document.querySelector('#'+id+' i').style.width=(v*100)+'%';}
function setT(el,s){if(el._t===s)return;el._t=s;el.textContent=s;}
function setH(el,s){if(el._h===s)return;el._h=s;el.innerHTML=s;}
function updateHudStatic(){
  if(!P)return;const a=P.active,o=other();
  $('hpA').querySelector('i').style.background=a==='eden'?'linear-gradient(90deg,#6b5cff,#b49bff)':'linear-gradient(90deg,#7cc4ff,#ffffff)';
  $('hpB').querySelector('i').style.background=o==='eden'?'linear-gradient(90deg,#6b5cff,#b49bff)':'linear-gradient(90deg,#7cc4ff,#ffffff)';
  $('skN').textContent=CH[a].skill.n;$('tgN').textContent=CH[o].name;
}
function updateHud(){
  if(!B||!P)return;
  const a=P.active,o=other();
  setH($('pnA'),`<b style="color:${a==='eden'?'#c9b6ff':'#bfe6ff'}">${CH[a].title} ${CH[a].name}</b><span>${Math.ceil(P.hp[a])} / ${CH[a].maxhp}</span>`);
  setH($('pnB'),`<b style="color:#aaa">${CH[o].title} ${CH[o].name}</b><span>${P.hp[o]>0?Math.ceil(P.hp[o]):'전투 불능'}</span>`);
  setW('hpA',P.hp[a]/CH[a].maxhp);setW('hpB',P.hp[o]/CH[o].maxhp);setW('lk',P.link/100);
  setT($('lkT'),Math.floor(P.link)+'%');$('lk').classList.toggle('full',P.link>=100);$('bLink').classList.toggle('full',P.link>=100);
  const sc=P.skillCd[a];const skc=$('skCd');skc.classList.toggle('hide',sc<=0);if(sc>0)setT(skc,Math.ceil(sc)+'');
  const tc=$('tgCd');const tagBlocked=P.hp[o]<=0;tc.classList.toggle('hide',P.tagCd<=0&&!tagBlocked);if(tagBlocked)setT(tc,'✕');else if(P.tagCd>0)setT(tc,Math.ceil(P.tagCd)+'');
  // boss / objective
  const bosses=B.en.filter(e=>e.d.boss&&(e.alive||B.bossIds.includes(e)));
  let bh='';for(const e of bosses){bh+=`<div class="bn">${e.d.name}<small>${e.d.sub}</small></div><div class="bar" style="margin-bottom:6px"><i style="width:${Math.max(0,e.hp/e.maxhp*100)}%"></i></div>`;}
  setH($('boss'),bh);
  let ob='';
  if(!bosses.length){
    if(B.core)ob=`${B.def.obj} · WAVE ${B.wave+1}/${B.def.waves.length}<div id="core"><div class="bar"><i style="width:${B.core.hp/B.core.maxhp*100}%"></i></div></div><span style="font-size:11px;color:#ffcf9f">방어막 발생기 ${Math.ceil(B.core.hp/B.core.maxhp*100)}%</span>`;
    else ob=B.def.obj;
  }
  $('obj').style.top=bosses.length?(10+bosses.length*34)+'px':'';
  setH($('obj'),bosses.length?'':ob);
  const cb=$('combo');if(B.combo>=3){cb.style.opacity=1;setH(cb,`${B.combo}<small>COMBO</small>`);}else cb.style.opacity=0;
}

/* ---------- rendering ---------- */
function drawArena(){
  const a=B.def.arena,w=B.w,h=B.h;
  if(a==='chamber'){
    ctx.fillStyle='#05070c';ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='rgba(60,170,255,.16)';ctx.lineWidth=1;ctx.beginPath();
    for(let x=0;x<=w;x+=60){ctx.moveTo(x,0);ctx.lineTo(x,h);}for(let y=0;y<=h;y+=60){ctx.moveTo(0,y);ctx.lineTo(w,y);}ctx.stroke();
    ctx.strokeStyle='rgba(80,200,255,.35)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(w/2,h/2,Math.min(w,h)*.42,0,TAU);ctx.stroke();
    const t=GS.t;ctx.strokeStyle=`rgba(80,200,255,${.2+.15*Math.sin(t*2)})`;ctx.beginPath();ctx.arc(w/2,h/2,Math.min(w,h)*.3,0,TAU);ctx.stroke();
  }else if(a==='outpost'){
    ctx.fillStyle='#211714';ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='rgba(255,150,100,.08)';ctx.lineWidth=1;
    for(let y=0;y<h;y+=52)for(let x=(y/52%2)*30;x<w;x+=60){ctx.beginPath();for(let i=0;i<6;i++){const an=i/6*TAU;ctx.lineTo(x+Math.cos(an)*30,y+Math.sin(an)*30);}ctx.closePath();ctx.stroke();}
    ctx.fillStyle='#160f0d';for(let i=0;i<14;i++){const x=(i*271)%w,y=(i*173)%h;ctx.beginPath();ctx.ellipse(x,y,40+i%3*15,20,i,0,TAU);ctx.fill();}
  }else{
    ctx.fillStyle=a==='phasis'?'#1a1022':'#17121d';ctx.fillRect(0,0,w,h);
    ctx.fillStyle=a==='phasis'?'#241530':'#201a28';
    for(let i=0;i<26;i++){const x=(i*397)%w,y=(i*211)%h;ctx.beginPath();ctx.moveTo(x-30,y+12);ctx.lineTo(x-8,y-18);ctx.lineTo(x+26,y-6);ctx.lineTo(x+34,y+14);ctx.fill();}
    ctx.strokeStyle='rgba(180,120,255,.08)';ctx.lineWidth=2;for(let i=0;i<12;i++){ctx.beginPath();ctx.moveTo((i*331)%w,0);ctx.lineTo((i*331+200)%w,h);ctx.stroke();}
  }
  ctx.strokeStyle='rgba(160,140,255,.5)';ctx.lineWidth=4;ctx.strokeRect(0,0,w,h);
}
function drawHazard(h){
  const p=h.t>0?1-h.t/h.t0:1;const col=h.col;
  ctx.save();
  ctx.fillStyle=`rgba(${col},${h.t>0?.12+.1*p:.45})`;ctx.strokeStyle=`rgba(${col},.75)`;ctx.lineWidth=2;
  ctx.beginPath();
  if(h.k==='circle'){ctx.arc(h.x,h.y,h.r,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle=`rgba(${col},.3)`;ctx.beginPath();ctx.arc(h.x,h.y,h.r*p,0,TAU);ctx.fill();}
  else if(h.k==='ring'){ctx.arc(h.x,h.y,h.r,0,TAU);ctx.arc(h.x,h.y,h.r2,0,TAU,true);ctx.fill('evenodd');ctx.stroke();}
  else if(h.k==='cone'){ctx.moveTo(h.x,h.y);ctx.arc(h.x,h.y,h.r,h.ang-h.arc/2,h.ang+h.arc/2);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle=`rgba(${col},.3)`;ctx.beginPath();ctx.moveTo(h.x,h.y);ctx.arc(h.x,h.y,h.r*p,h.ang-h.arc/2,h.ang+h.arc/2);ctx.closePath();ctx.fill();}
  else if(h.k==='line'){ctx.translate(h.x,h.y);ctx.rotate(h.ang);ctx.rect(0,-h.w/2,h.len,h.w);ctx.fill();ctx.stroke();ctx.fillStyle=`rgba(${col},.3)`;ctx.fillRect(0,-h.w/2,h.len*p,h.w);
    if(h.t<=0){ctx.fillStyle='rgba(255,255,255,.6)';ctx.fillRect(0,-3,h.len,6);}}
  ctx.restore();
}
function ell(x,y,rx,ry){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill();}
function drawHero(x,y,who,face,o){
  o=o||{};const c=CH[who];
  ctx.save();ctx.translate(x,y);
  if(o.alpha!=null)ctx.globalAlpha=o.alpha;
  if(!o.ghost){ctx.fillStyle='rgba(0,0,0,.4)';ell(0,15,15,5);}
  const fx=Math.cos(face)>=0?1:-1;
  const bob=Math.sin((P?P.walk:0)*14)*1.5;
  let wa=face;
  if(o.atk>0){const k=1-o.atk;wa=face+(lerp(-1.3,1.3,k))*o.swing;}
  const drawW=()=>{
    ctx.save();ctx.rotate(wa);
    if(who==='eden'){
      ctx.lineCap='round';
      ctx.strokeStyle='#59c8ff';ctx.lineWidth=3.5;ctx.shadowColor='#59c8ff';ctx.shadowBlur=o.ghost?0:10;ctx.beginPath();ctx.moveTo(8,-5);ctx.lineTo(40,-9);ctx.stroke();
      ctx.strokeStyle='#c77dff';ctx.shadowColor='#c77dff';ctx.beginPath();ctx.moveTo(8,6);ctx.lineTo(38,11);ctx.stroke();
      if(Math.random()<.3&&!o.ghost){ctx.strokeStyle='#bff0ff';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(28,-8);ctx.lineTo(33,-14);ctx.lineTo(37,-7);ctx.stroke();}
    }else{
      ctx.shadowColor='#5aa9ff';ctx.shadowBlur=o.ghost?0:14;
      ctx.fillStyle='#e9f3ff';ctx.beginPath();ctx.moveTo(10,-5);ctx.lineTo(56,-4);ctx.lineTo(62,0);ctx.lineTo(56,4);ctx.lineTo(10,5);ctx.closePath();ctx.fill();
      ctx.fillStyle='#3d7dff';ctx.fillRect(14,-1.2,40,2.4);ctx.fillStyle='#222a3a';ctx.fillRect(4,-7,6,14);
    }
    ctx.restore();
  };
  if(Math.sin(wa)<0)drawW();
  ctx.translate(0,bob);
  ctx.fillStyle='#0c0c12';ctx.fillRect(-7,4,5,10);ctx.fillRect(2,4,5,10);
  ctx.fillStyle='#15151d';ctx.beginPath();ctx.roundRect?ctx.roundRect(-10,-12,20,19,5):ctx.rect(-10,-12,20,19);ctx.fill();
  ctx.strokeStyle=c.neon;ctx.lineWidth=1.4;ctx.shadowColor=c.neon;ctx.shadowBlur=o.ghost?0:8;ctx.stroke();
  ctx.beginPath();ctx.moveTo(0,-12);ctx.lineTo(0,6);ctx.stroke();ctx.shadowBlur=0;
  if(who==='nesis'){ctx.fillStyle='#f4f6fa';ctx.fillRect(-5,-11,10,8);}
  ctx.fillStyle='#f3e4dc';ctx.beginPath();ctx.arc(0,-20,8,0,TAU);ctx.fill();
  ctx.fillStyle=c.hair;ctx.beginPath();ctx.arc(0,-22,8.6,PI,TAU);ctx.fill();
  ctx.fillRect(-8.6,-22,3,8);ctx.fillRect(5.6,-22,3,8);
  ctx.fillStyle=c.tip;ctx.fillRect(fx>0?-8.6:5.6,-18,3,5);
  if(who==='nesis'){ctx.fillStyle=c.hair;ctx.beginPath();ctx.arc(-fx*7,-27,4,0,TAU);ctx.fill();ctx.fillStyle='#3b9dff';ctx.fillRect(fx>0?2:-5,-26,3,7);}
  ctx.fillStyle='#2a2a38';ctx.fillRect(fx*2-2,-21,2,2);ctx.fillRect(fx*2+3*fx-1,-21,2,2);
  ctx.translate(0,-bob);
  if(Math.sin(wa)>=0)drawW();
  ctx.restore();
}
function drawAlly(a){
  ctx.save();ctx.translate(a.x,a.y);
  if(a.hp<=0)ctx.globalAlpha=.35;
  ctx.fillStyle='rgba(0,0,0,.35)';ell(0,14,14,5);
  ctx.fillStyle='#2b2f3a';ctx.beginPath();ctx.arc(0,-2,a.r*.8,0,TAU);ctx.fill();
  ctx.strokeStyle=a.c;ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle='#e8d6cc';ctx.beginPath();ctx.arc(0,-a.r,7,0,TAU);ctx.fill();
  ctx.fillStyle=a.c;ctx.fillRect(-7,-a.r-6,14,4);
  ctx.save();ctx.rotate(a.face+(a.swing>0?(a.swing-.5)*2:0));ctx.strokeStyle='#c9ced8';ctx.lineWidth=a.wpn==='axe'?5:3;ctx.beginPath();ctx.moveTo(6,0);ctx.lineTo(a.wpn==='spear'?44:32,0);ctx.stroke();
  if(a.wpn==='axe'){ctx.fillStyle='#c9ced8';ctx.beginPath();ctx.moveTo(26,-10);ctx.lineTo(36,-4);ctx.lineTo(36,4);ctx.lineTo(26,10);ctx.fill();}ctx.restore();
  ctx.fillStyle=a.c;ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(a.name,0,-a.r-12);
  ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(-16,a.r+4,32,3);ctx.fillStyle=a.c;ctx.fillRect(-16,a.r+4,32*a.hp/a.maxhp,3);
  ctx.restore();
}
function drawEnemy(e){
  const d=e.d,t=e.t;
  ctx.save();ctx.translate(e.x,e.y);
  if(e.spawnT>0)ctx.globalAlpha=1-e.spawnT/.4;
  if(e.inv)ctx.globalAlpha=.15;
  ctx.fillStyle='rgba(0,0,0,.35)';ell(0,e.r*.8,e.r,e.r*.35);
  const f=e.face;
  if(d.holo){
    ctx.strokeStyle=d.col;ctx.lineWidth=2;ctx.globalAlpha*=.75+.25*Math.sin(t*20);
    ctx.fillStyle='rgba(60,180,255,.12)';ctx.beginPath();for(let i=0;i<6;i++){const a=i/6*TAU+t;ctx.lineTo(Math.cos(a)*e.r,Math.sin(a)*e.r*.85-4);}ctx.closePath();ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.arc(Math.cos(f)*e.r*.4,Math.sin(f)*e.r*.4-6,3,0,TAU);ctx.fillStyle='#bff0ff';ctx.fill();
  }else if(e.type==='claw'||e.type==='minion'){
    const g=ctx.createRadialGradient(-4,-6,2,0,0,e.r);g.addColorStop(0,e.type==='minion'?'#f0e6ff':'#d9dee8');g.addColorStop(1,e.type==='minion'?'#6b4fa8':'#3d4352');
    ctx.fillStyle=g;ctx.beginPath();for(let i=0;i<8;i++){const a=i/8*TAU,r=i%2?e.r*.7:e.r*1.05;ctx.lineTo(Math.cos(a+t*.5)*r,Math.sin(a+t*.5)*r);}ctx.closePath();ctx.fill();
    ctx.strokeStyle='#c8ccd6';ctx.lineWidth=2;for(const s of [-.5,.5]){ctx.beginPath();ctx.moveTo(Math.cos(f+s)*e.r*.8,Math.sin(f+s)*e.r*.8);ctx.lineTo(Math.cos(f+s*.6)*(e.r+12),Math.sin(f+s*.6)*(e.r+12));ctx.stroke();}
    ctx.fillStyle='#ff3b6b';ctx.fillRect(Math.cos(f)*5-4,Math.sin(f)*5-5,3,3);ctx.fillRect(Math.cos(f)*5+2,Math.sin(f)*5-5,3,3);
  }else if(e.type==='spitter'){
    ctx.fillStyle='#3a2c52';ell(0,0,e.r*1.1,e.r*.85);ctx.fillStyle=`rgba(190,120,255,${.5+.4*Math.sin(t*6)+(e.charge>0?.5:0)})`;ell(-Math.cos(f)*4,-6,e.r*.55,e.r*.45);
    ctx.fillStyle='#7cff9e';ctx.fillRect(Math.cos(f)*8-2,Math.sin(f)*8-2,4,4);
  }else if(e.type==='brute'){
    ctx.fillStyle='#4a505e';ctx.beginPath();for(let i=0;i<6;i++){const a=i/6*TAU+PI/6;ctx.lineTo(Math.cos(a)*e.r,Math.sin(a)*e.r*.9);}ctx.closePath();ctx.fill();
    ctx.strokeStyle='#9aa3b5';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#ff5c3b';ctx.beginPath();ctx.arc(Math.cos(f)*10,Math.sin(f)*10-4,4,0,TAU);ctx.fill();
  }else if(e.type==='abi'){
    ctx.fillStyle='rgba(180,108,255,.25)';ell(0,0,e.r*1.6,e.r*1.6);
    ctx.fillStyle='#2a1640';ctx.beginPath();ctx.moveTo(-12,14);ctx.lineTo(0,-14);ctx.lineTo(12,14);ctx.fill();
    ctx.fillStyle='#e8d2ff';ctx.beginPath();ctx.arc(0,-18,7,0,TAU);ctx.fill();ctx.fillStyle='#4b2a7a';ctx.beginPath();ctx.arc(0,-20,7.5,PI,TAU);ctx.fill();
    ctx.save();ctx.rotate(f);ctx.strokeStyle='#d9b8ff';ctx.lineWidth=2.5;ctx.shadowColor='#b46cff';ctx.shadowBlur=10;ctx.beginPath();ctx.moveTo(-18,0);ctx.lineTo(48,0);ctx.stroke();
    ctx.fillStyle='#f3e6ff';ctx.beginPath();ctx.moveTo(48,-4);ctx.lineTo(60,0);ctx.lineTo(48,4);ctx.fill();ctx.restore();
  }else if(e.type==='mor'){
    ctx.fillStyle='#14141c';ctx.beginPath();ctx.roundRect?ctx.roundRect(-20,-22,40,40,8):ctx.rect(-20,-22,40,40);ctx.fill();
    ctx.strokeStyle='#8a5cff';ctx.lineWidth=1.5;ctx.globalAlpha*=.9;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-14+i*14,-18);ctx.lineTo(-10+i*14,14);ctx.stroke();}
    ctx.fillStyle='#2a2a36';ctx.beginPath();ctx.arc(0,-30,11,0,TAU);ctx.fill();ctx.fillStyle='#b46cff';ctx.fillRect(-6,-32,12,3);
    ctx.save();ctx.rotate(f+(e.busy>0?-.8:0));ctx.fillStyle='#3a3a4a';ctx.fillRect(10,-6,64,12);ctx.fillStyle='#9a9ab8';ctx.fillRect(14,-2,56,4);ctx.restore();
  }else if(e.type==='phasis'){
    const wing=e.wing||0;ctx.translate(0,Math.sin(t*2)*4-10);
    for(let i=0;i<18;i++){const s=i<9?-1:1,k=i%9;const a=-PI/2+s*(.5+k*.2+Math.sin(wing*2+k)*.05);const L=50+k*6;
      ctx.strokeStyle=`rgba(230,205,255,${.5+.05*k})`;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(Math.cos(a)*14,Math.sin(a)*14);ctx.lineTo(Math.cos(a)*L,Math.sin(a)*L);ctx.stroke();
      ctx.fillStyle='#fff';ctx.fillRect(Math.cos(a)*L-1.5,Math.sin(a)*L-1.5,3,3);}
    ctx.fillStyle='rgba(200,130,255,.35)';ell(0,0,30,30);
    const g=ctx.createLinearGradient(0,-24,0,24);g.addColorStop(0,'#f2e6ff');g.addColorStop(1,'#6a3fa0');ctx.fillStyle=g;
    ctx.beginPath();ctx.moveTo(-10,24);ctx.lineTo(-6,-10);ctx.lineTo(6,-10);ctx.lineTo(10,24);ctx.fill();
    ctx.fillStyle='#f7efff';ctx.beginPath();ctx.arc(0,-18,8,0,TAU);ctx.fill();ctx.fillStyle='#c084fc';ctx.fillRect(-5,-20,3,2);ctx.fillRect(2,-20,3,2);
    if(e.rage){ctx.strokeStyle='rgba(255,90,160,.6)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,40+Math.sin(t*8)*4,0,TAU);ctx.stroke();}
  }
  if(e.flash>0){ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba(255,255,255,.6)';ell(0,-4,e.r,e.r);}
  ctx.restore();
  if(!d.boss&&e.hp<e.maxhp&&e.spawnT<=0){ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(e.x-16,e.y-e.r-12,32,4);ctx.fillStyle='#ff5a7a';ctx.fillRect(e.x-16,e.y-e.r-12,32*e.hp/e.maxhp,4);}
}
function drawCore(c){
  ctx.save();ctx.translate(c.x,c.y);
  ctx.fillStyle='rgba(0,0,0,.4)';ell(0,22,40,12);
  ctx.fillStyle=c.flash>0?'#fff':'#3a3f4c';ctx.beginPath();for(let i=0;i<6;i++){const a=i/6*TAU;ctx.lineTo(Math.cos(a)*c.r,Math.sin(a)*c.r*.8);}ctx.closePath();ctx.fill();
  ctx.strokeStyle='#ffb36b';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle='#ffcf7a';ctx.beginPath();ctx.arc(0,-8,10+Math.sin(GS.t*4)*2,0,TAU);ctx.fill();
  ctx.strokeStyle=`rgba(255,200,120,${.15+.1*Math.sin(GS.t*3)})`;ctx.setLineDash([6,8]);ctx.beginPath();ctx.arc(0,0,80,0,TAU);ctx.stroke();ctx.setLineDash([]);
  ctx.restore();
}
function drawFx(f){
  const k=f.life/f.max;
  if(f.k==='p'){ctx.globalAlpha=k;ctx.fillStyle=f.col;ctx.fillRect(f.x-f.s/2,f.y-f.s/2,f.s,f.s);ctx.globalAlpha=1;}
  else if(f.k==='slash'){ctx.save();ctx.translate(f.x,f.y);ctx.globalAlpha=k;ctx.strokeStyle=f.col;ctx.lineWidth=f.w*k+2;ctx.shadowColor=f.col;ctx.shadowBlur=14;
    const s=f.ang-f.a/2,e=f.ang+f.a/2,p=1-k;ctx.beginPath();if(f.dir>0)ctx.arc(0,0,f.r*.85,s,lerp(s,e,Math.min(1,p*3)));else ctx.arc(0,0,f.r*.85,lerp(e,s,Math.min(1,p*3)),e);ctx.stroke();ctx.restore();}
  else if(f.k==='ring'){ctx.save();ctx.globalAlpha=k;ctx.strokeStyle=f.col;ctx.lineWidth=4;const lo=Math.min(f.r,f.r2),hi=Math.max(f.r,f.r2),p=1-k;const r=f.inward?lerp(hi,lo,p):lerp(lo,hi,p);ctx.beginPath();ctx.arc(f.x,f.y,Math.max(1,r),0,TAU);ctx.stroke();ctx.restore();}
  else if(f.k==='bolt'){ctx.save();ctx.globalAlpha=k;ctx.strokeStyle=f.col;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(f.x1,f.y1);
    for(let i=1;i<6;i++){const t=i/6;ctx.lineTo(lerp(f.x1,f.x2,t)+rand(-8,8),lerp(f.y1,f.y2,t)+rand(-8,8));}ctx.lineTo(f.x2,f.y2);ctx.stroke();ctx.restore();}
  else if(f.k==='ghost'){drawHero(f.x,f.y,f.who,f.face,{alpha:k*.5,ghost:1});}
}
function render(){
  const cam=B.cam;
  const vw=W/ZOOM,vh=H/ZOOM;
  const tx=B.w<=vw?B.w/2:clamp(P.x,vw/2,B.w-vw/2),ty=B.h<=vh?B.h/2:clamp(P.y,vh/2,B.h-vh/2);
  cam.x=lerp(cam.x,tx,.15);cam.y=lerp(cam.y,ty,.15);
  ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle='#030207';ctx.fillRect(0,0,W,H);
  const sx=(Math.random()-.5)*B.shake,sy=(Math.random()-.5)*B.shake;
  ctx.setTransform(DPR*ZOOM,0,0,DPR*ZOOM,(W/2-cam.x*ZOOM+sx)*DPR,(H/2-cam.y*ZOOM+sy)*DPR);
  drawArena();
  for(const h of B.haz)drawHazard(h);
  for(const f of B.fields){ctx.save();const g=ctx.createRadialGradient(f.x,f.y,4,f.x,f.y,f.r);g.addColorStop(0,'rgba(0,0,0,.95)');g.addColorStop(.6,'rgba(50,10,90,.6)');g.addColorStop(1,'rgba(150,100,255,.08)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,TAU);ctx.fill();ctx.strokeStyle='rgba(190,150,255,.7)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(f.x,f.y,f.r*(.95+.05*Math.sin(f.t*12)),0,TAU);ctx.stroke();ctx.restore();}
  if(B.core)drawCore(B.core);
  const list=[];
  for(const e of B.en)if(e.alive)list.push({y:e.y,f:()=>drawEnemy(e)});
  for(const a of B.allies)list.push({y:a.y,f:()=>drawAlly(a)});
  list.push({y:P.y,f:()=>{
    if(P.iT>0&&P.dashI<=0&&B.linkInv<=0&&Math.floor(GS.t*20)%2)ctx.globalAlpha=.5;
    drawHero(P.x,P.y,P.active,P.face,{atk:P.atkT>0?P.atkT/P.atkD:0,swing:P.swing});ctx.globalAlpha=1;
    if(B.linkInv>0){ctx.strokeStyle='rgba(220,200,255,.6)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(P.x,P.y-6,26+Math.sin(GS.t*10)*2,0,TAU);ctx.stroke();}
  }});
  list.sort((a,b)=>a.y-b.y);for(const l of list)l.f();
  for(const b of B.eb){ctx.fillStyle=b.col;if(b.needle){ctx.save();ctx.translate(b.x,b.y);ctx.rotate(Math.atan2(b.vy,b.vx));ctx.fillRect(-9,-1.5,18,3);ctx.restore();}else{ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,TAU);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.stroke();}}
  for(const b of B.pb){if(b.k==='wave'){ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.ang);ctx.strokeStyle='#8fc8ff';ctx.lineWidth=6;ctx.shadowColor='#3d7dff';ctx.shadowBlur=14;ctx.beginPath();ctx.arc(-10,0,26,-1,1);ctx.stroke();ctx.restore();}
    else{ctx.fillStyle=b.col;ctx.shadowColor='#bfe3ff';ctx.shadowBlur=10;ctx.beginPath();ctx.arc(b.x,b.y,b.r*.7,0,TAU);ctx.fill();ctx.shadowBlur=0;}}
  for(const f of B.fx)drawFx(f);
  for(const t of B.txt){ctx.globalAlpha=Math.min(1,t.life/t.max*2);ctx.fillStyle=t.col;ctx.font=`900 ${t.big?18:13}px sans-serif`;ctx.textAlign='center';ctx.strokeStyle='rgba(0,0,0,.7)';ctx.lineWidth=3;ctx.strokeText(t.s,t.x,t.y);ctx.fillText(t.s,t.x,t.y);}
  ctx.globalAlpha=1;
  // screen space overlays
  ctx.setTransform(DPR,0,0,DPR,0,0);
  const hpk=P.hp[P.active]/CH[P.active].maxhp;
  if(hpk<.3){const g=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.3,W/2,H/2,Math.max(W,H)*.7);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(200,0,40,${.25+.15*Math.sin(GS.t*6)})`);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
  if(B.slow>0){ctx.fillStyle='rgba(120,180,255,.08)';ctx.fillRect(0,0,W,H);}
  if(B.cine)drawCine();
}
function drawCine(){
  const k=B.cine.t/B.cine.dur,m=Math.min(W,H);
  ctx.fillStyle=`rgba(4,2,12,${Math.min(.75,k*2)})`;ctx.fillRect(0,0,W,H);
  const cx=W/2,cy=H*.46;
  ctx.save();ctx.translate(cx,cy);
  for(let i=0;i<5;i++){ctx.save();ctx.rotate(GS.t*.8+i*TAU/5);ctx.strokeStyle=`rgba(180,140,255,${.7*k})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(m*.1,0,m*.14*k+10,m*.14*k+10,0,0,TAU);ctx.stroke();ctx.restore();}
  for(let i=0;i<12;i++){ctx.save();ctx.rotate(-GS.t*.5+i*TAU/12);ctx.fillStyle=`rgba(190,235,255,${.35*k})`;ctx.beginPath();ctx.ellipse(m*.2*k+20,0,m*.07,m*.02,0,0,TAU);ctx.fill();ctx.restore();}
  ctx.restore();
  ctx.save();ctx.translate(cx,cy);const sc=Math.min(2.2,m/250);ctx.scale(sc,sc);
  drawHero(-30,10,'eden',PI,{});drawHero(30,10,'nesis',0,{});ctx.restore();
  ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font=`900 ${Math.max(18,m*.06)}px sans-serif`;ctx.globalAlpha=Math.min(1,k*3);
  ctx.shadowColor='#b49bff';ctx.shadowBlur=18;ctx.fillText('링크 0 : 공허 & 흡융',cx,cy+m*.3);ctx.shadowBlur=0;
  ctx.font=`600 ${Math.max(11,m*.025)}px sans-serif`;ctx.fillStyle='#cfc6ff';ctx.fillText('LINK 0 — VOID × FUSION',cx,cy+m*.3+m*.05);
  ctx.globalAlpha=1;
}

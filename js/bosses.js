/* ==================================================================
   액팅 소울 : 0 — 신들의 종언 (시즌 2 체험판)  v0.8.0
   js/bosses.js — 최상위 보스(신들의 화신체) · 즉사기 시스템

   즉사기 적용 범위
     일반 보스 : 없음          상위 보스 : 기본적으로 없음
     최상위 보스(화신체 — 아누비스 · 타아마트 · 레나 · 아더) : 여러 종류의 즉사기
     최종 보스(아바돈 · 테흠 · 레테/아이테르) : 고유 즉사기 (공명 헤일로 파훼 — 추후)
   ET[아이디].tier = 'normal' | 'high' | 'top' | 'final'  (deathblow()는 top·final만 허용)

   즉사기 파훼 (최상위 보스)
     예고(warn) 동안 빨간 경고 → 파훼 창(win)이 열리는 순간 F(휴대폰: 파훼 버튼)
     지금 싸우는 캐릭터의 권능으로 파훼된다 — Tab으로 미리 바꿔 고른다
       이든  · 태초의 공허 [삼킴] : 즉사기와 모든 공격을 지우고, 보스를 긴 그로기(받는 피해 ↑)에 빠뜨린다
       네시스 · 흡융 [수용·반사]  : 즉사기를 흡수해 보스에게 되돌려 큰 피해 + 두 사람 회복 + 링크 게이지
     너무 일찍 누르면 0.5초 동안 다시 누를 수 없다. 실패하면 싸우던 캐릭터가 즉사(발악 즉사기는 전멸).
   ================================================================== */
'use strict';
/* ---------------- 적 · 전투 정의 ---------------- */
ET.tiamat={name:'카오스 - 타아마트',sub:'테흠의 화신체 · 최상위',tier:'top',hp:7200,r:30,spd:95,ai:'tiamat',boss:1,col:'#ff3a5a',heavy:1,hgt:3.4};
ET.anubis={name:'아포칼립스 - 아누비스',sub:'아바돈의 화신체 · 최상위',tier:'top',hp:7600,r:30,spd:150,ai:'anubis',boss:1,col:'#a8aec0',heavy:1,hgt:3.3};
ET.abyss={name:'심연체',hp:150,r:16,spd:185,ai:'chaser',dmg:16,col:'#ff4a6a',lunge:1,hgt:1.7};
ET.chainpost={name:'흑색 사슬 말뚝',hp:380,r:22,spd:0,ai:'dummy',col:'#6a6f80',armor:.85,hgt:2.6};
for(const k of ['abi','mor'])ET[k].tier='high';ET.phasis.tier='high';

const TOP_BOSSES={tiamat:'33막 · 카오스 - 타아마트',anubis:'34막 · 아포칼립스 - 아누비스'};

/* ================================================================
   즉사기
   ================================================================ */
const DB_POWER={eden:{k:'void',n:'태초의 공허',v:'삼킴',col:'#b48cff'},nesis:{k:'fusion',n:'흡융',v:'수용 · 반사',col:'#9fdcff'}};
/* o = {name, warn(초), win(초), fail:'one'|'all', col, final(파훼 시 보스 처치), lines:[[화자,대사]..], onStart(e), fx(e,k,t)} */
function deathblow(e,o){
  if(!B||B.db||B.over||B.winT>=0)return false;
  const tier=e.d.tier;if(tier!=='top'&&tier!=='final')return false;
  B.db={e,o,t:0,state:'warn',lock:0,res:null,resT:0};
  e.inv=true;e.busy=o.warn+o.win+1;B.haz=B.haz.filter(h=>h.fired);B.eb=[];P.tagCd=0;
  SFX.boss();B.shake=Math.max(B.shake,.35);flash(o.col||'#ff2a4a',.25);$('banner').classList.remove('on');
  (o.lines||[]).forEach(([n,x],i)=>setTimeout(()=>B&&bark(n,x),i*900));
  if(o.onStart)o.onStart(e);
  dbUI();return true;
}
function dbUI(){
  const d=B.db,el=$('db');if(!d){el.classList.add('hide');return;}
  el.classList.remove('hide','ok','bad','open');el.style.setProperty('--c',d.o.col||'#ff2a4a');
  el.querySelector('.dbn').textContent='즉사기 · '+d.o.name;
  const tot=d.o.warn+d.o.win;el.querySelector('.dbw').style.left=(d.o.warn/tot*100)+'%';el.querySelector('.dbw').style.width=(d.o.win/tot*100)+'%';
  dbHint();
}
function dbHint(){
  const d=B.db;if(!d)return;const pw=DB_POWER[P.active],k=inp.touch?'파훼':'F';
  $('db').querySelector('.dbh').innerHTML=d.state==='open'?`<b>지금! ${k}</b> — ${P.active==='eden'?'이든':'네시스'} · ${pw.n} [${pw.v}]`
    :`파훼 창이 열리면 <span class="key">${k}</span> · ${pw.n} [${pw.v}] <small>Tab: ${P.active==='eden'?'네시스 · 흡융':'이든 · 태초의 공허'}로 바꾸기</small>`;
  setT($('bF'),d.state==='open'?'파훼!':'파훼');
}
/* 매 프레임 — 반환값은 게임 속도 배율 */
function updateDB(rdt){
  const d=B.db;d.t+=rdt;d.lock-=rdt;
  if(d.res){d.resT-=rdt;if(d.resT<=0){B.db=null;$('db').classList.add('hide');setT($('bF'),'줍기');}return d.res==='ok'?.25:1;}
  const tot=d.o.warn+d.o.win,p=Math.min(1,d.t/tot);
  $('db').querySelector('.dbp').style.width=(p*100)+'%';
  if(d.state==='warn'&&d.t>=d.o.warn){d.state='open';$('db').classList.add('open');SFX.perfect();dbHint();}
  if(d._a!==P.active){d._a=P.active;dbHint();}
  if(d.o.tick)d.o.tick(d.e,d.t,rdt);
  if(d.t>=tot){dbFail();return 1;}
  return d.state==='open'?.3:1;
}
function dbPress(){
  const d=B.db;if(!d||d.res)return;
  if(d.lock>0)return;
  if(d.state!=='open'){d.lock=.5;ftxt(P.x,P.y,'너무 이릅니다','#ffb0b0',0,2.6);SFX.hurt();return;}
  dbCounter(P.active==='eden'?'void':'fusion');
}
function dbCounter(k){
  const d=B.db,e=d.e,o=d.o;d.res='ok';d.resT=1.1;$('db').classList.add('ok');
  B.stats.counters=(B.stats.counters||0)+1;e.inv=false;B.haz=[];B.eb=[];
  const isV=k==='void',col=isV?'#b48cff':'#9fdcff';
  emblemPop(k,col,1.2);const ci=IMAGES.chars[isV?'eden':'nesis'];cutIn(ci.glow||ci.file,isV?'L':'R',isV?'태초의 공허 · 삼킴':'흡융 · 수용 · 반사',col,false,1.2);
  flash(col,.45);SFX.link();B.shake=.6;B.hitstop=.15;
  FX.ring(e.x*S,e.y*S,.3,6,col,.8);FX.pillar(e.x*S,e.y*S,1.4,9,col,.8);FX.burst(e.x*S,1.4,e.y*S,50,col,8,1,.14);
  bark(isV?'이든':'네시스',isV?pick(['……삼켜라.','그 종말째로 지운다.','공허 앞에선 아무것도 남지 않는다.']):pick(['그 소멸마저, 내가 받겠어요!','돌려드릴게요.','모두… 내게로.']));
  if(o.final){ // 발악 파훼 = 결착
    e.floor=0;e.stun=9;setTimeout(()=>{if(!B||!e.alive)return;const b=IMAGES.chars;cutIn(b.eden.glow,'L','','#b48cff',false,1.4);cutIn(b.nesis.glow,'R','','#9fdcff',false,1.4);
      emblemPop('void','#b48cff',1.4);emblemPop('fusion','#9fdcff',1.4);flash('#ffffff',.6);SFX.boom();B.shake=1;
      FX.pillar(e.x*S,e.y*S,2.4,14,'#ffffff',1.2);FX.burst(e.x*S,1.4,e.y*S,80,'#ffe9a8',10,1.3,.16);
      if(o.endLines)o.endLines.forEach(([n,x],i)=>setTimeout(()=>B&&bark(n,x),i*1100));
      e.hp=0;killEnemy(e);},900);
    return;}
  if(isV){e.stun=4.2;e.dmgMul=1.6;e.mulT=5;addUltTo('eden',35);ftxt(e.x,e.y,'그로기','#d9c2ff',1,e.d.hgt+.6);}
  else{const dmg=Math.round(e.maxhp*.07);e.hp=Math.max(e.floor||1,e.hp-dmg);ftxt(e.x,e.y,'-'+dmg+' 반사','#bfe9ff',1,e.d.hgt+.6);
    e.stun=2.6;healAll(.2);addLink(35);addUltTo('nesis',25);}
}
function dbFail(){
  const d=B.db,o=d.o;d.res='bad';d.resT=1.2;$('db').classList.add('bad');d.e.inv=false;
  flash('#ff1a3a',.7);SFX.boom();B.shake=1;
  if(M('god')){ftxt(P.x,P.y,'즉사 무효 (마스터)','#ffd27a',1,2.8);return;}
  if(o.fail==='all'){P.hp.eden=P.hp.nesis=0;lose('즉사기 「'+o.name+'」를 막지 못했습니다.');return;}
  ftxt(P.x,P.y,'즉사','#ff4a6a',1,2.8);P.hp[P.active]=0;B.stats.taken+=999;
  if(P.hp[other()]>0){bark(other()==='eden'?'이든':'네시스',other()==='eden'?'네시스……! 내가 이어받는다.':'이든! 내가 갈게!');doTag(true);}
  else lose('즉사기 「'+o.name+'」를 막지 못했습니다.');
}
function addUltTo(k,v){P.ult[k]=Math.min(100,P.ult[k]+v);}
/* 3D 경고 연출 */
function drawDB(t){
  const d=B.db,e=d.e,c=d.o.col||'#ff2a4a',k=Math.min(1,d.t/(d.o.warn+d.o.win));
  if(d.res)return;
  R3.draw(FX.m.edge,mat(e.x*S,.05,e.y*S,t*2,4+k*10,1,4+k*10),{mode:2,tint:c,a:.5});
  R3.draw(FX.m.sph,mat(e.x*S,e.d.hgt*.6,e.y*S,0,.6+k*1.4),{mode:2,tint:c,a:.35+.3*Math.sin(t*20)*(d.state==='open'?1:.3)});
  if(d.o.fx)d.o.fx(e,k,t);
}
/* 보스 공통: 그로기 배율 해제, 페이즈 이름 */
function bossCommon(e,dt){if(e.mulT>0){e.mulT-=dt;if(e.mulT<=0)e.dmgMul=1;}}
function setPhase(e,n,label){e.phase=n;e.sub=e.d.sub.split(' · ')[0]+' · '+label;B.hud=null;}

/* ================================================================
   카오스 - 타아마트 (테흠의 화신체)
   1 혼돈의 해일 (100~60%) → 2 핏빛 인과의 창 · 심연체 (60~25%) → 3 광기 (25~10%) → 발악 (10%)
   ================================================================ */
AI.tiamat=function(e,dt){
  bossCommon(e,dt);
  if(!e.phase){setPhase(e,1,'1 페이즈 · 혼돈의 해일');e.floor=e.maxhp*.6;e.dbT=18;} // floor: 다음 페이즈 문턱 — 페이즈를 건너뛰지 않는다
  if(e.phase===1&&e.hp<=e.floor+1&&!B.db){setPhase(e,2,'2 페이즈 · 핏빛 인과의 창');e.busy=0;e.floor=e.maxhp*.25;
    bark('타아마트','감히 미천한 존재들이… 나에게 상처를 입히다니, 가만두지 않겠다!!');
    deathblow(e,TIA_DB.spear);e.dbT=22;return;}
  if(e.phase===2&&e.hp<=e.floor+1&&!B.db){setPhase(e,3,'3 페이즈 · 광기');e.floor=e.maxhp*.1;bark('에토스','베리언트 수치 측정 한계 돌파! 차원 붕괴 확률 67%……!');
    deathblow(e,TIA_DB.crush);e.dbT=17;return;}
  if(e.phase===3&&e.hp<=e.floor+1&&!B.db){setPhase(e,4,'발악 · 카오스 자폭');deathblow(e,TIA_DB.self);return;}
  if(e.phase===4)return;
  if(e.phase>=2){e.dbT-=dt;if(e.dbT<=0&&e.busy<=0){e.dbT=e.phase===3?17:22;deathblow(e,e.phase===3&&Math.random()<.5?TIA_DB.crush:TIA_DB.spear);return;}}
  if(e.busy>0)return;
  const d=dist(e,P);e.face=angTo(e,P);
  if(d>330)moveTo(e,P.x,P.y,e.d.spd,dt);else if(d<220){e.x-=Math.cos(e.face)*e.d.spd*dt;e.y-=Math.sin(e.face)*e.d.spd*dt;}
  e.x+=Math.cos(e.t*.6)*40*dt;
  e.cd-=dt;if(e.cd>0)return;
  const k=e.phase===3?.72:1,mins=B.en.filter(x=>x.alive&&x.type==='abyss').length;
  const opts=['tide','walls','orbs'];if(e.phase>=2){opts.push('spears','spears','hole');if(mins<4)opts.push('summon');}
  const p=pick(opts);
  if(p==='tide'){e.busy=1.7*k;const n=e.phase===1?10:14;  // 혼돈의 해일 — 파편이 수직으로 쏟아진다
    for(let i=0;i<n;i++)sched(e,i*.08,()=>{const a=rand(0,TAU),r=i<2?rand(0,40):rand(60,300);addHaz({k:'circle',x:clamp(P.x+Math.cos(a)*r,30,B.w-30),y:clamp(P.y+Math.sin(a)*r,30,B.h-30),r:52,t:.9*k+.1,dmg:26,owner:e,fxc:'#ff6a7a'});});
    barkOnce('tide','네시스','혼돈의 해일이에요! 붉은 원 밖으로!');}
  else if(p==='walls'){e.busy=1.8*k;const base=angTo(e,P),n=e.phase===1?5:7; // 혼돈의 장벽 — 부채꼴로 뻗는 선
    for(let i=0;i<n;i++)addHaz({k:'line',x:e.x,y:e.y,ang:base+(i-(n-1)/2)*.32,len:820,w:34,t:1*k,dmg:30,owner:e,life:.3,fxc:'#ff8a9a'});}
  else if(p==='orbs'){e.busy=1.4*k;e.windT=.35;
    for(let r=0;r<3;r++)sched(e,.35+r*.3*k,()=>{const n=20,off=r*.16+e.t;for(let i=0;i<n;i++){const a=i/n*TAU+off;B.eb.push({x:e.x,y:e.y,vx:Math.cos(a)*240,vy:Math.sin(a)*240,r:7,dmg:16,life:3,col:'#ff6a8a'});}SFX.shoot();e.swing=e.swingD=.3;});}
  else if(p==='spears'){e.busy=1.9*k;const n=e.phase===3?22:16; // 핏빛 인과의 창 — 플레이어를 따라 줄지어 꽂힌다
    for(let i=0;i<n;i++)sched(e,i*.06,()=>{const lead=i*.06*1.2;addHaz({k:'circle',x:clamp(P.x+P.mvx*120*lead+rand(-70,70),30,B.w-30),y:clamp(P.y+P.mvy*120*lead+rand(-70,70),30,B.h-30),r:40,t:.75*k+.1,dmg:24,owner:e,fxc:'#ff2a4a'});});
    barkOnce('spr','센티아','핏빛 창이야! 멈추지 말고 계속 움직여, 이든!');}
  else if(p==='hole'){e.busy=2.4*k;const hx=P.x,hy=P.y; // 차원 블랙홀 — 끌어당긴 뒤 폭발
    e.hole={x:hx,y:hy,t:1.5*k};addHaz({k:'circle',x:hx,y:hy,r:150,t:1.5*k,dmg:40,owner:e,big:1,fxc:'#ff3a6a'});
    barkOnce('hole','클라우스룸','공간이 찌그러집니다! 중심에서 벗어나십시오!');}
  else{e.busy=1.2;e.windT=.5;for(let i=0;i<3;i++){const a=rand(0,TAU);spawn('abyss',clamp(e.x+Math.cos(a)*110,40,B.w-40),clamp(e.y+Math.sin(a)*110,40,B.h-40));}
    barkOnce('sum','에토스','심연체들입니다! 타아마트의 혼돈에 호응해 난입하고 있습니다!');}
  e.cd=rand(.55,1)*k;
};
const TIA_DB={
  spear:{name:'핏빛 인과의 창우',warn:3.2,win:.8,fail:'one',col:'#ff2a4a',
    lines:[['타아마트','스치기만 해도 존재가 소멸한다. 받아내 보아라!'],['에토스','지금의 공격은 받아낼 수 없습니다! 회피가 아니라 파훼를――!']],
    fx(e,k,t){for(let i=0;i<14;i++){const a=i/14*TAU+t*.3,r=3+((i*37)%9);R3.draw(FX.m.needle,mat(e.x*S+Math.cos(a)*r,9-k*7,e.y*S+Math.sin(a)*r,0,1.6,1.6,1.6,Math.PI,0),{mode:2,tint:'#ff2a4a',a:.85});}}},
  crush:{name:'차원 압착 · 존재 소멸',warn:2.4,win:.55,fail:'one',col:'#ff3a8a',
    lines:[['타아마트','이 차원째로 찌그러져라!']],
    tick(e,t,rdt){const d=dist(e,P);if(d>40){P.x+=(e.x-P.x)/d*90*rdt;P.y+=(e.y-P.y)/d*90*rdt;}},
    fx(e,k,t){for(let i=0;i<4;i++)R3.draw(FX.m.torus,mat(e.x*S,1.4,e.y*S,t*(i%2?2:-2),9-k*7-i,1,9-k*7-i),{mode:2,tint:'#ff3a8a',a:.4});}},
  self:{name:'카오스 자폭 · 순서 없는 창조',warn:7,win:.45,fail:'all',col:'#ff1a2a',final:1,
    lines:[['타아마트','……인정하지 못한다. 테흠님의 권능이 이따위 피조물들에게 꺾이는 것 따위는……!!'],['타아마트','창조란 순서가 없는 법. 다시 처음부터 섞어주마!'],['에토스','자폭 시퀀스입니다! 탈출 좌표를 잡을 수 없습니다……!'],['네시스','이든, 끝까지 같이 버텨요!']],
    onStart(e){e.warp=0;},
    tick(e,t,rdt){ // 공간이 뒤집힌다 — 일정 간격으로 위치가 보스 반대편으로 뒤바뀌고, 파편이 쏟아진다
      e.warp-=rdt;if(e.warp<=0&&t<6.3){e.warp=1.6;ftxt(P.x,P.y,'공간 반전','#ff9aa8',0,2.6);P.x=clamp(2*e.x-P.x,40,B.w-40);P.y=clamp(2*e.y-P.y,40,B.h-40);flash('#ff2a4a',.18);B.cp=null;}
      if(Math.random()<rdt*5&&t<6.5)addHaz({k:'circle',x:rand(60,B.w-60),y:rand(60,B.h-60),r:44,t:.8,dmg:14,fxc:'#ff6a7a'});},
    fx(e,k,t){R3.draw(FX.m.sph,mat(e.x*S,1.6,e.y*S,0,1+k*5),{mode:2,tint:'#ff1a2a',a:.25});for(let i=0;i<6;i++)R3.draw(FX.m.torus,mat(e.x*S,1.6,e.y*S,t*(1+i*.3),2+i*1.6,1,2+i*1.6,i*.5,t),{mode:2,tint:i%2?'#ff4a6a':'#2a0010',a:.5});},
    endLines:[['이든 & 네시스','이곳은 너희가 군림할 땅이 아니다.'],['타아마트','테흠님……! 내가…… 내가 지워진다아아아!!']]},
};

/* ================================================================
   아포칼립스 - 아누비스 (아바돈의 화신체)
   1 소멸의 안개 (100~65%) → 2 소멸의 제단 (65~35%) → 3 사신 환영 (35~10%) → 발악 (10%)
   ================================================================ */
AI.anubis=function(e,dt){
  bossCommon(e,dt);
  if(!e.phase){setPhase(e,1,'1 페이즈 · 소멸의 안개');e.floor=e.maxhp*.65;e.dbT=99;
    e.onHit=(e,o)=>{ // 흑색 사슬 방어: 평타는 부식이 되어 돌아오고, 강공격·스킬(big)만 사슬을 깬다
      if(!e.guard)return true;
      if(o.big||o.ally){e.guard=0;e.stun=1.2;ftxt(e.x,e.y,'사슬 파괴','#ffffff',1,e.d.hgt+.4);SFX.boom();FX.burst(e.x*S,1.4,e.y*S,24,'#9aa0b0',6,.6,.1);return true;}
      if(!e.gT||B.t-e.gT>.35){e.gT=B.t;ftxt(P.x,P.y,'부식','#b8bccb',0,2.4);P.hp[P.active]=Math.max(1,P.hp[P.active]-8);SFX.hurt();}
      FX.burst(e.x*S,1.2,e.y*S,4,'#6a6f80',3,.3,.06);return false;};}
  if(e.phase===1&&e.hp<=e.floor+1&&!B.db){setPhase(e,2,'2 페이즈 · 소멸의 제단');e.guard=0;e.busy=1.5;e.floor=e.maxhp*.35;
    bark('아누비스','내 제단에 발을 들인 것을 환영한다. 이곳에선 영혼의 격조마저 풍화되어 먼지가 되지!');
    setTimeout(()=>B&&bark('에토스','전장이 놈의 영역으로 치환됐습니다! 사슬 말뚝을 부수면 제단이 약해집니다!'),1500);
    B.altar=1;for(const [x,y] of [[.2,.25],[.8,.25],[.2,.8],[.8,.8]])spawn('chainpost',B.w*x,B.h*y);e.dbT=7;return;}
  if(e.phase===2&&e.hp<=e.floor+1&&!B.db){setPhase(e,3,'3 페이즈 · 사신 환영');e.floor=e.maxhp*.1;bark('아누비스','필멸자 놈들이…… 용서치 않겠다. 존재의 흔적까지 짓이겨 주마!!');
    deathblow(e,ANU_DB.rain);e.dbT=16;return;}
  if(e.phase===3&&e.hp<=e.floor+1&&!B.db){setPhase(e,4,'발악 · 무(無)로의 회귀');deathblow(e,ANU_DB.end);return;}
  if(e.phase===4)return;
  if(e.phase>=2){e.dbT-=dt;if(e.dbT<=0&&e.busy<=0){e.dbT=e.phase===3?15:19;deathblow(e,e.phase===3&&Math.random()<.5?ANU_DB.rain:ANU_DB.reap);return;}}
  if(e.busy>0)return;
  const d=dist(e,P);e.face=angTo(e,P);
  if(d>170)moveTo(e,P.x,P.y,e.d.spd*(e.phase===3?1.3:1),dt,150);
  e.cd-=dt;if(e.cd>0)return;
  const k=e.phase===3?.7:1;
  const opts=['scythe','scythe','fog'];if(e.phase===1)opts.push('guard');if(e.phase>=2)opts.push('slashes','blink');if(e.phase===3)opts.push('blink','slashes');
  const p=pick(opts);
  if(p==='scythe'){e.busy=1.2*k;addHaz({k:'cone',x:e.x,y:e.y,ang:e.face,r:210,arc:2.5,t:.75*k,dmg:34,owner:e,big:1,fxc:'#c8ccda'});}
  else if(p==='fog'){e.busy=1.8*k; // 소멸의 안개 해일 — 퍼지는 고리 (점프로 넘을 수 있다)
    for(let i=0;i<3;i++)sched(e,i*.38*k,()=>addHaz({k:'ring',x:e.x,y:e.y,r:140+i*110,r2:100+i*110,t:.7*k,dmg:22,owner:e,fxc:'#9aa0b0'}));
    barkOnce('fog','센티아','회색 안개 고리야! 점프로 넘어, 이든!');}
  else if(p==='guard'){e.busy=.6;e.guard=1;e.guardT=3.5;sched(e,3.5,()=>{e.guard=0;});
    barkOnce('grd','클라우스룸','흑색 사슬입니다! 평타는 부식이 되어 돌아옵니다 — 강공격이나 스킬로 깨십시오!');}
  else if(p==='slashes'){e.busy=1.9*k;const n=e.phase===3?8:6; // 소멸의 참격 — 엇갈려 그어지는 선
    for(let i=0;i<n;i++)sched(e,i*.12,()=>{const a=rand(0,PI);addHaz({k:'line',x:P.x-Math.cos(a)*500,y:P.y-Math.sin(a)*500,ang:a,len:1000,w:30,t:.8*k,dmg:24,owner:e,life:.2,fxc:'#d8dce8'});});}
  else{e.busy=1.5*k;e.inv=true;FX.burst(e.x*S,1,e.y*S,16,'#6a6f80',5,.4,.09); // 순간 이동 낫
    sched(e,.35,()=>{const a=P.face+PI;e.x=clamp(P.x+Math.cos(a)*200,40,B.w-40);e.y=clamp(P.y+Math.sin(a)*200,40,B.h-40);e.inv=false;FX.burst(e.x*S,1,e.y*S,16,'#6a6f80',5,.4,.09);
      const ang=angTo(e,P);e.face=ang;addHaz({k:'line',x:e.x,y:e.y,ang,len:420,w:50,t:.6*k,dmg:32,owner:e,fxc:'#c8ccda',onFire:()=>dashTo(e,ang,420,.14,30)});});}
  e.cd=rand(.6,1.1)*k;
};
/* 아누비스 전장 효과: 안개(가장자리 피해) · 제단(지속 흡수) */
function anubisTick(dt){
  const e=B.bossIds[0];if(!e||!e.alive)return;
  const cx=B.w/2,cy=B.h/2;
  B.fogR=e.phase===4?Math.max(160,(B.fogR||520)-60*dt):e.phase>=2?430:440+Math.sin(B.t*.4)*80;
  if(Math.hypot(P.x-cx,P.y-cy)>B.fogR){B.fogTick=(B.fogTick||0)-dt;if(B.fogTick<=0){B.fogTick=.5;if(!M('god')){P.hp[P.active]=Math.max(1,P.hp[P.active]-10);ftxt(P.x,P.y,'소멸의 안개','#b8bccb',0,2.4);}}}
  if(B.altar&&e.phase<4){const posts=B.en.filter(x=>x.alive&&x.type==='chainpost').length;
    if(posts&&!M('god')){P.hp[P.active]=Math.max(1,P.hp[P.active]-CH[P.active].maxhp*.004*posts*dt);P.link=Math.max(0,P.link-.6*posts*dt);}
    if(!posts)barkOnce('posts','에토스','사슬 말뚝 전부 파괴! 제단의 흡수가 멈췄습니다!');}
}
function anubisDraw(t){
  const cx=B.w/2*S,cz=B.h/2*S,r=(B.fogR||520)*S;
  for(let i=0;i<3;i++)R3.draw(FX.m.edge,mat(cx,.05+i*.4,cz,t*(i%2?.2:-.2),r+i*.4,1,r+i*.4),{mode:2,tint:'#8a90a0',a:.35-i*.08});
  for(let i=0;i<24;i++){const a=i/24*TAU+t*.05;R3.pt(cx+Math.cos(a)*(r+1.5),1+Math.sin(t+i)*.5,cz+Math.sin(a)*(r+1.5),.12,[.55,.57,.62],.5);}
  if(B.altar)for(const e of B.en)if(e.alive&&e.type==='chainpost')R3.draw(FX.m.edge,mat(e.x*S,.05,e.y*S,t,1.4,1,1.4),{mode:2,tint:'#c8ccda',a:.5});
  const b=B.bossIds[0];if(b&&b.alive&&b.guard)R3.draw(FX.m.torus,mat(b.x*S,1.4,b.y*S,t*3,1.2,1,1.2,PI/2,0),{mode:2,tint:'#6a6f80',a:.8});
}
const ANU_DB={
  reap:{name:'사신의 낫',warn:1.6,win:.45,fail:'one',col:'#c8ccda',
    lines:[['아누비스','나와 닿아있는 모든 순간이…… 너에겐 종말이다!']],
    onStart(e){const a=P.face+PI;e.x=clamp(P.x+Math.cos(a)*90,40,B.w-40);e.y=clamp(P.y+Math.sin(a)*90,40,B.h-40);e.face=angTo(e,P);FX.burst(e.x*S,1,e.y*S,20,'#6a6f80',6,.5,.1);},
    fx(e,k,t){R3.draw(FX.m.edge,mat(P.x*S,.05,P.y*S,-t*4,1.6-k,1,1.6-k),{mode:2,tint:'#ffffff',a:.8});}},
  rain:{name:'종말의 참격우',warn:2.6,win:.6,fail:'one',col:'#d8dce8',
    lines:[['아누비스','으스러져라! 공간째로 쪼개주마!'],['에토스','소멸 참격이 수만 개……! 피할 공간이 없습니다!']],
    fx(e,k,t){for(let i=0;i<10;i++){const a=i/10*PI+t*.5;R3.draw(FX.m.edge,mat(P.x*S,.06,P.y*S,a,2+k*8,1,.05),{mode:2,tint:'#e8ecf6',a:.6});}}},
  end:{name:'무(無)로의 회귀',warn:6.5,win:.45,fail:'all',col:'#8a90a0',final:1,
    lines:[['아누비스','……인정 못 한다. 아바돈 님의 권능이 이딴 세계에서 끝날 리가 없다!'],['아누비스','다 함께…… 무(無)로 돌아가자!!'],['에토스','영혼 레지스트리 붕괴! 이 구역의 인과 자체가 지워집니다……!'],['이든','네시스, 내 등 뒤로.']],
    tick(e,t,rdt){const d=dist(e,P);if(d>60){P.x+=(e.x-P.x)/d*45*rdt;P.y+=(e.y-P.y)/d*45*rdt;}},
    fx(e,k,t){for(let i=0;i<5;i++)R3.draw(FX.m.torus,mat(e.x*S,1.2+i*.3,e.y*S,t*(1+i*.4)*(i%2?1:-1),3+i*2-k*2,1,3+i*2-k*2),{mode:2,tint:i%2?'#c8ccda':'#6a6e7a',a:.55});},
    endLines:[['이든','사라질 시간이다.'],['네시스','우리의 전선은, 당신의 종말 따위에 무너지지 않아요.'],['아누비스','아바돈 님――!!!']]},
};

/* ---------------- 전투 등록 ---------------- */
BATTLES.tiamat={arena:'ashcadia',w:1500,h:1100,allies:[],bosses:['tiamat'],obj:'카오스 - 타아마트를 처치하라',trial:1,par:300,
  init(){SFX.boss();setTimeout(()=>B&&bark('타아마트','나는 창조의 테흠님의 화신, 카오스의 타아마트. 그대들에게 벌을 내리러 왔다.'),500);
    setTimeout(()=>B&&banner('<b>최상위 보스</b> · 즉사기는 파훼 창이 열릴 때 <b>F</b> — 이든 = 태초의 공허(그로기), 네시스 = 흡융(반사·회복) · <b>Tab</b>으로 고르기',6500),1600);}};
BATTLES.anubis={arena:'altar',w:1500,h:1100,allies:[],bosses:['anubis'],obj:'아포칼립스 - 아누비스를 처치하라',trial:1,par:300,
  init(){B.fogR=520;B.altar=0;SFX.boss();setTimeout(()=>B&&bark('아누비스','동료들의 개죽음을 보고도 눈빛이 죽지 않는군. 재미있어!'),500);
    setTimeout(()=>B&&banner('<b>최상위 보스</b> · 즉사기는 파훼 창이 열릴 때 <b>F</b> — 이든 = 태초의 공허(그로기), 네시스 = 흡융(반사·회복) · <b>Tab</b>으로 고르기',6500),1600);},
  tick:anubisTick,draw:anubisDraw};
/* 블랙홀 끌어당김 (타아마트) */
BATTLES.tiamat.tick=function(dt){const e=B.bossIds[0];if(!e||!e.hole)return;e.hole.t-=dt;if(e.hole.t<=0){e.hole=null;return;}
  const h=e.hole,d=Math.hypot(h.x-P.x,h.y-P.y);if(d>8&&P.dashT<=0){P.x+=(h.x-P.x)/d*70*dt;P.y+=(h.y-P.y)/d*70*dt;}};
BATTLES.tiamat.draw=function(t){const e=B.bossIds[0];if(e&&e.hole)R3.draw(FX.m.torus,mat(e.hole.x*S,.3,e.hole.y*S,t*4,2.5*e.hole.t+1,1,2.5*e.hole.t+1),{mode:2,tint:'#ff3a6a',a:.6});};

/* 보스전 선택 (타이틀) */
function buildBossSel(){
  const L=$('bsList');L.innerHTML='';
  for(const id in TOP_BOSSES){const d=ET[id],b=document.createElement('button');b.className='btn';b.innerHTML=`${TOP_BOSSES[id]}<small>${d.sub}</small>`;
    b.onclick=()=>{SFX.ui();show('bossSel',false);show('title',false);startBattle(id);};L.appendChild(b);}
}
$('mBoss').onclick=()=>{audioInit();SFX.ui();buildBossSel();show('bossSel',true);};
$('bsClose').onclick=()=>{SFX.ui();show('bossSel',false);};
Object.assign(BATTLE_NAMES,TOP_BOSSES);

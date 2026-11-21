/* ==================================================================
   액팅 소울 : 0 — 신들의 종언 (시즌 2 체험판)  v0.8.0
   js/core.js — 화면 크기, 저장, 효과음, 입력(통일 조작 체계)

   통일 조작 체계 (PC)
     WASD 이동 · Shift 회피 · 우클릭 대쉬 · 좌클릭 공격 · 좌클릭 0.5초 홀딩 강공격
     Space 점프 · Space+좌클릭 점프 공격 · Space+좌클릭+Ctrl 점프 강공격
     Q·E 스킬 · R 짧게 개인 궁극기 / R 0.5초 홀딩 링크 0 · Tab 전환 · X(휠) 무기 전환 · Z 호출 · F 줍기(상호작용) · M 지도 · Esc 설정
   휴대폰은 같은 기능을 화면 버튼으로 제공한다.
   UI 모드: SAVE.ui = 'auto'(마지막 입력 기준 자동) | 'pc' | 'touch'
   마스터 모드: F2 또는 ` 키로 켜기/끄기
   ================================================================== */
'use strict';
const VERSION='v0.8.0';
const $=id=>document.getElementById(id);
const PI=Math.PI,TAU=PI*2;
const rand=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const angTo=(a,b)=>Math.atan2(b.y-a.y,b.x-a.x);
const angDiff=(a,b)=>{let d=(b-a)%TAU;if(d>PI)d-=TAU;if(d<-PI)d+=TAU;return d;};
const pick=a=>a[(Math.random()*a.length)|0];

const glc=$('gl'),ovc=$('ov'),ov=ovc.getContext('2d');
let W=0,H=0,DPR=1;
function resize(){
  DPR=Math.min(2,window.devicePixelRatio||1);W=window.innerWidth;H=window.innerHeight;
  R3.resize(W,H,renderScale());ovc.width=Math.round(W*DPR);ovc.height=Math.round(H*DPR);
  for(const c of [glc,ovc]){c.style.width=W+'px';c.style.height=H+'px';}
  const rot=$('rot');if(rot)rot.classList.toggle('hide',!(H>W&&W<700));
}

/* ---------------- 저장 ---------------- */
const SAVE={unlocked:0,snd:true,sens:1,ui:'auto',gfx:'auto',master:null};
try{const s=JSON.parse(localStorage.getItem('as0s2_save')||'{}');Object.assign(SAVE,s);}catch(e){}
/* 마스터 모드 (테스트·감상용): on 이 켜져 있을 때만 각 항목이 적용된다 */
SAVE.master=Object.assign({on:false,skip:true,nocd:true,god:false,link:false,dmg:false,unlock:true},SAVE.master||{});
const MASTER_OPTS=[['skip','스토리·전투 건너뛰기 버튼'],['nocd','쿨타임 제거 (스킬·교대·회피·대쉬)'],['god','무적 (방어막 발생기 포함)'],['link','링크·궁극기 게이지 무한'],['dmg','공격력 10배'],['unlock','모든 막 열기']];
function M(k){return SAVE.master.on&&!!SAVE.master[k];}

/* ---------------- 그래픽 해상도 (휴대폰 최적화) ----------------
   자동: 프레임이 느리면 3D 화면 해상도를 낮추고, 여유가 생기면 다시 올린다. 글자·UI는 그대로 선명하다. */
const GFX={auto:0,ema:16,acc:0,good:0};
function devScale(){return Math.min(2,window.devicePixelRatio||1);}
function renderScale(){
  if(SAVE.gfx==='high')return devScale();
  if(SAVE.gfx==='low')return Math.min(1,devScale())*.7;
  if(!GFX.auto)GFX.auto=Math.min(devScale(),window.matchMedia&&matchMedia('(pointer:coarse)').matches?1.5:2);
  return GFX.auto;
}
function gfxTick(ms){ // main.js 가 매 프레임 호출
  GFX.ema+=(ms-GFX.ema)*.05;GFX.acc+=ms;if(GFX.acc<1000||SAVE.gfx!=='auto')return;GFX.acc=0;
  const s=GFX.auto;
  if(GFX.ema>24&&s>.6){GFX.auto=Math.max(.6,s-.15);GFX.good=0;resize();}
  else if(GFX.ema<15&&s<devScale()){if(++GFX.good>=3){GFX.auto=Math.min(devScale(),s+.1);GFX.good=0;resize();}}
  else GFX.good=0;
}
function persist(){try{localStorage.setItem('as0s2_save',JSON.stringify(SAVE));}catch(e){}}

/* ---------------- 효과음 (파일 없이 합성) ---------------- */
let AC=null,NB=null;
function audioInit(){
  if(AC){if(AC.state==='suspended')AC.resume();return;}
  try{AC=new (window.AudioContext||window.webkitAudioContext)();
    const len=AC.sampleRate*0.5;NB=AC.createBuffer(1,len,AC.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
  }catch(e){AC=null;}
}
function tone(f,d,type,v,slide,delay){
  if(!AC||!SAVE.snd)return;const t=AC.currentTime+(delay||0);const o=AC.createOscillator(),g=AC.createGain();
  o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,f+slide),t+d);
  g.gain.setValueAtTime(v||0.1,t);g.gain.exponentialRampToValueAtTime(0.0008,t+d);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d+0.03);
}
function noise(d,v,freq,delay){
  if(!AC||!SAVE.snd||!NB)return;const t=AC.currentTime+(delay||0);const s=AC.createBufferSource();s.buffer=NB;
  const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=freq||1200;f.Q.value=0.8;const g=AC.createGain();
  g.gain.setValueAtTime(v||0.1,t);g.gain.exponentialRampToValueAtTime(0.0008,t+d);s.connect(f);f.connect(g);g.connect(AC.destination);s.start(t);s.stop(t+d+0.03);
}
const sfxGate={};function gate(k,ms){const n=performance.now();if(sfxGate[k]&&n-sfxGate[k]<ms)return false;sfxGate[k]=n;return true;}
const SFX={
  ui(){tone(880,0.06,'sine',0.05);},
  text(){if(gate('tx',55))tone(1200+Math.random()*200,0.025,'triangle',0.012);},
  slashE(){if(gate('sl',40)){noise(0.09,0.09,3200);tone(720,0.08,'triangle',0.04,-380);}},
  slashN(){if(gate('sl',40)){noise(0.16,0.13,900);tone(240,0.16,'sawtooth',0.04,-120);}},
  heavy(){noise(0.3,0.18,600);tone(160,0.35,'sawtooth',0.06,-90);},
  hit(){if(gate('hit',35)){noise(0.07,0.14,1400);tone(150,0.07,'square',0.04,-70);}},
  dash(){noise(0.16,0.07,4200);},
  perfect(){tone(1320,0.25,'sine',0.07);tone(1760,0.35,'sine',0.05,0,0.06);},
  void(){tone(160,0.9,'sawtooth',0.05,-110);tone(80,1.0,'sine',0.14,-40);noise(0.6,0.05,300);},
  drain(){tone(400,0.5,'triangle',0.06,500);tone(900,0.4,'sine',0.05,-500,0.1);},
  zap(){noise(0.2,0.12,5000);tone(1800,0.15,'square',0.03,-1200);},
  flame(){noise(0.4,0.12,500);tone(200,0.4,'sawtooth',0.04,200);},
  tag(){tone(660,0.08,'square',0.04);tone(990,0.12,'square',0.035,0,0.06);},
  link(){tone(110,1.6,'sawtooth',0.06,220);tone(220,1.4,'triangle',0.06,440);tone(55,1.8,'sine',0.2,0);noise(1.2,0.06,600);},
  boom(){noise(0.5,0.22,250);tone(60,0.5,'sine',0.25,-30);},
  hurt(){if(gate('hu',90)){tone(110,0.18,'square',0.07,-50);noise(0.1,0.08,700);}},
  warn(){if(gate('wn',140))tone(330,0.12,'square',0.025);},
  shoot(){if(gate('sh',60))tone(520,0.1,'triangle',0.03,-200);},
  win(){[523,659,784,1047].forEach((f,i)=>tone(f,0.5,'triangle',0.06,0,i*0.12));},
  lose(){[392,311,262].forEach((f,i)=>tone(f,0.6,'sine',0.07,0,i*0.2));},
  boss(){tone(73,1.4,'sawtooth',0.07,0);tone(110,1.4,'sawtooth',0.05,-20);noise(1.2,0.05,200);}
};

/* ---------------- 입력 ---------------- */
const keys={};
const inp={mx:0,my:0,jx:0,jy:0,atkDown:false,atkPress:false,atkRel:false,atkCtrl:false,dodgeP:false,dashP:false,qP:false,eP:false,rP:false,tagP:false,jumpP:false,fP:false,swapP:false,callP:false,
  lookX:0,lookY:0,lookT:9,touch:false};
const GS={mode:'title',t:0,bg:'title',paused:false,locked:false,map:false,view:null};
const KEYACT={ShiftLeft:'dodge',ShiftRight:'dodge',KeyQ:'q',KeyE:'e',Tab:'tag',Space:'jump',KeyF:'f',KeyX:'swap',KeyZ:'call'};
window.addEventListener('keydown',e=>{
  audioInit();
  if(e.code==='F2'||e.code==='Backquote'){e.preventDefault();if(!e.repeat)toggleMasterMode();return;}
  if(e.code==='Tab'||(e.code==='Space'&&GS.mode==='battle'))e.preventDefault();
  if(e.repeat)return;
  keys[e.code]=true;autoUI('pc');
  if(e.code==='KeyF'&&B&&B.db&&GS.mode==='battle'&&!GS.paused)dbPress(); // 즉사기 파훼는 프레임과 상관없이 바로 판정
  const a=KEYACT[e.code];
  if(a&&GS.mode==='battle'&&!GS.paused&&!GS.map){inp[a+'P']=true;e.preventDefault();}
  if(e.code==='KeyR'&&GS.mode==='battle'&&!GS.paused){inp.rDown=true;inp.rPress=true;inp.rT0=performance.now();}
  if(e.code==='KeyM'&&(GS.mode==='battle'||GS.map))toggleMap();
  if(e.code==='Escape'){if(GS.map)toggleMap(false);else if(GS.mode==='battle'||GS.paused)togglePause();}
  if((e.code==='Enter'||e.code==='Space'||e.code==='KeyF')&&GS.mode==='dialog'){dlgAdvance();e.preventDefault();}
});
window.addEventListener('keyup',e=>{keys[e.code]=false;if(e.code==='KeyR'&&inp.rDown){inp.rDown=false;inp.rRel=true;}});
let wheelT=0;window.addEventListener('wheel',e=>{if(GS.mode!=='battle'||GS.paused||GS.map)return;const n=performance.now();if(n-wheelT>350&&Math.abs(e.deltaY)>4){wheelT=n;inp.swapP=true;}},{passive:true});
window.addEventListener('blur',()=>{for(const k in keys)keys[k]=false;inp.atkDown=false;inp.rDown=false;inp.jx=inp.jy=0;});

/* 마우스: 포인터 잠금 상태에서 시점 회전 / 좌클릭 공격 / 우클릭 대쉬 */
glc.addEventListener('contextmenu',e=>e.preventDefault());
glc.addEventListener('mousedown',e=>{
  audioInit();
  if(GS.mode!=='battle'||GS.paused)return;
  autoUI('pc');
  if(!GS.locked&&glc.requestPointerLock&&!inp.touch){try{glc.requestPointerLock();}catch(_){}}
  if(e.button===0){inp.atkDown=true;inp.atkPress=true;inp.atkT0=performance.now();inp.atkCtrl=e.ctrlKey||!!keys.ControlLeft||!!keys.ControlRight;}
  if(e.button===2)inp.dashP=true;
});
window.addEventListener('mouseup',e=>{if(e.button===0&&inp.atkDown){inp.atkDown=false;inp.atkRel=true;}});
document.addEventListener('mousemove',e=>{if(GS.locked){inp.lookX+=e.movementX;inp.lookY+=e.movementY;inp.lookT=0;}});
document.addEventListener('pointerlockchange',()=>{
  const was=GS.locked;GS.locked=document.pointerLockElement===glc;
  if(was&&!GS.locked&&GS.mode==='battle'&&!GS.paused)togglePause(true);
});
function releaseLock(){if(document.exitPointerLock&&GS.locked)try{document.exitPointerLock();}catch(_){}}

/* ---------- PC / 모바일 UI 전환 ---------- */
function setUI(m){
  const t=m==='touch';inp.touch=t;
  document.body.classList.toggle('touch',t);document.body.classList.toggle('pc',!t);
  if(t)releaseLock();
}
function autoUI(m){if(SAVE.ui==='auto'&&(m==='touch')!==inp.touch)setUI(m);}
function applyUISetting(){
  if(SAVE.ui==='pc')setUI('pc');else if(SAVE.ui==='touch')setUI('touch');
  else setUI(window.matchMedia&&matchMedia('(pointer:coarse)').matches&&!matchMedia('(hover:hover)').matches?'touch':'pc');
}
function useTouch(){autoUI('touch');}
window.addEventListener('touchstart',useTouch,{passive:true});
window.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'&&(Math.abs(e.movementX)+Math.abs(e.movementY))>2)autoUI('pc');});
applyUISetting();

/* 터치: 왼쪽 조이스틱 · 오른쪽 드래그 시점 · 버튼 */
(function setupJoy(){
  const z=$('joy'),b=$('joyB'),k=$('joyK');let id=null,ox=0,oy=0;
  z.addEventListener('pointerdown',e=>{audioInit();id=e.pointerId;z.setPointerCapture(id);ox=e.clientX;oy=e.clientY;
    b.style.left=k.style.left=ox+'px';b.style.top=k.style.top=oy+'px';b.style.opacity=k.style.opacity=1;inp.jx=inp.jy=0;$('joyHint').style.opacity=0;e.preventDefault();});
  z.addEventListener('pointermove',e=>{if(e.pointerId!==id)return;let dx=e.clientX-ox,dy=e.clientY-oy;const l=Math.hypot(dx,dy),R=50;
    if(l>R){dx*=R/l;dy*=R/l;}k.style.left=ox+dx+'px';k.style.top=oy+dy+'px';inp.jx=dx/R;inp.jy=dy/R;if(l<8)inp.jx=inp.jy=0;});
  const up=e=>{if(e.pointerId!==id)return;id=null;inp.jx=inp.jy=0;b.style.opacity=k.style.opacity=0;};
  z.addEventListener('pointerup',up);z.addEventListener('pointercancel',up);
  const L=$('look');let lid=null,lx=0,ly=0;
  L.addEventListener('pointerdown',e=>{lid=e.pointerId;L.setPointerCapture(lid);lx=e.clientX;ly=e.clientY;e.preventDefault();});
  L.addEventListener('pointermove',e=>{if(e.pointerId!==lid)return;inp.lookX+=(e.clientX-lx)*1.6;inp.lookY+=(e.clientY-ly)*1.6;lx=e.clientX;ly=e.clientY;inp.lookT=0;});
  const lu=e=>{if(e.pointerId===lid)lid=null;};L.addEventListener('pointerup',lu);L.addEventListener('pointercancel',lu);
})();
document.querySelectorAll('.cb').forEach(el=>{
  const a=el.dataset.a;
  el.addEventListener('pointerdown',e=>{audioInit();useTouch();el.setPointerCapture(e.pointerId);el.classList.add('press');
    if(a==='atk'){inp.atkDown=true;inp.atkPress=true;inp.atkT0=performance.now();inp.atkCtrl=false;}else if(a==='r'){inp.rDown=true;inp.rPress=true;inp.rT0=performance.now();}else inp[a+'P']=true;if(a==='f'&&B&&B.db)dbPress();e.preventDefault();e.stopPropagation();});
  const up=()=>{if(!el.classList.contains('press'))return;el.classList.remove('press');if(a==='atk'&&inp.atkDown){inp.atkDown=false;inp.atkRel=true;}if(a==='r'&&inp.rDown){inp.rDown=false;inp.rRel=true;}};
  el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);el.addEventListener('lostpointercapture',up);
});
function readMove(){
  let x=0,y=0;
  if(keys.KeyA)x-=1;if(keys.KeyD)x+=1;if(keys.KeyW)y-=1;if(keys.KeyS)y+=1;
  if(x||y){const l=Math.hypot(x,y);x/=l;y/=l;}else{x=inp.jx;y=inp.jy;}
  inp.mx=x;inp.my=y;
  if(keys.ArrowLeft){inp.lookX-=6;inp.lookT=0;}if(keys.ArrowRight){inp.lookX+=6;inp.lookT=0;}
  if(keys.ArrowUp){inp.lookY-=4;inp.lookT=0;}if(keys.ArrowDown){inp.lookY+=4;inp.lookT=0;}
}
function clearPresses(){inp.dodgeP=inp.dashP=inp.qP=inp.eP=inp.rP=inp.tagP=inp.jumpP=inp.fP=inp.swapP=inp.callP=false;inp.atkPress=false;inp.lookX=inp.lookY=0;}

function show(id,on){$(id).classList.toggle('hide',!on);}
function flash(col,a){const f=$('flash');f.style.background=col||'#fff';f.style.transition='none';f.style.opacity=a||0.6;
  requestAnimationFrame(()=>{f.style.transition='opacity .45s';f.style.opacity=0;});}

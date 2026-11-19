/* ==================================================================
   액팅 소울 : 0 — 신들의 종언 (시즌 2 체험판)  v0.2.0
   js/core.js — 화면 크기, 저장, 효과음, 입력(통일 조작 체계)

   통일 조작 체계
     WASD 이동 · Shift 회피 · 우클릭 대쉬 · 좌클릭 공격(0.5초 홀딩 = 강공격)
     Q·E 스킬 · R 궁극기(링크 0) · Tab 교대 · Esc 설정
     (F 상호작용 · M 지도는 이 체험판에 필요 없어 뺐음)
   ================================================================== */
'use strict';
const VERSION='v0.2.0';
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
  R3.resize(W,H,DPR);ovc.width=Math.round(W*DPR);ovc.height=Math.round(H*DPR);
  for(const c of [glc,ovc]){c.style.width=W+'px';c.style.height=H+'px';}
  const rot=$('rot');if(rot)rot.classList.toggle('hide',!(H>W&&W<700));
}

/* ---------------- 저장 ---------------- */
const SAVE={unlocked:0,snd:true,sens:1};
try{const s=JSON.parse(localStorage.getItem('as0s2_save')||'{}');Object.assign(SAVE,s);}catch(e){}
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
const inp={mx:0,my:0,jx:0,jy:0,atkDown:false,atkPress:false,atkRel:false,dodgeP:false,dashP:false,qP:false,eP:false,rP:false,tagP:false,
  lookX:0,lookY:0,lookT:9,touch:false};
const GS={mode:'title',t:0,bg:'title',paused:false,locked:false};
const KEYACT={ShiftLeft:'dodge',ShiftRight:'dodge',KeyQ:'q',KeyE:'e',KeyR:'r',Tab:'tag'};
window.addEventListener('keydown',e=>{
  audioInit();
  if(e.code==='Tab')e.preventDefault();
  if(e.repeat)return;
  keys[e.code]=true;
  const a=KEYACT[e.code];
  if(a&&GS.mode==='battle'){inp[a+'P']=true;e.preventDefault();}
  if(e.code==='Escape'){if(GS.mode==='battle'||GS.paused)togglePause();}
  if((e.code==='Enter'||e.code==='Space'||e.code==='KeyF')&&GS.mode==='dialog'){dlgAdvance();e.preventDefault();}
});
window.addEventListener('keyup',e=>{keys[e.code]=false;});
window.addEventListener('blur',()=>{for(const k in keys)keys[k]=false;inp.atkDown=false;inp.jx=inp.jy=0;});

/* 마우스: 포인터 잠금 상태에서 시점 회전 / 좌클릭 공격 / 우클릭 대쉬 */
glc.addEventListener('contextmenu',e=>e.preventDefault());
glc.addEventListener('mousedown',e=>{
  audioInit();
  if(GS.mode!=='battle'||GS.paused)return;
  if(!GS.locked&&glc.requestPointerLock&&!inp.touch){try{glc.requestPointerLock();}catch(_){}}
  if(e.button===0){inp.atkDown=true;inp.atkPress=true;}
  if(e.button===2)inp.dashP=true;
});
window.addEventListener('mouseup',e=>{if(e.button===0&&inp.atkDown){inp.atkDown=false;inp.atkRel=true;}});
document.addEventListener('mousemove',e=>{if(GS.locked){inp.lookX+=e.movementX;inp.lookY+=e.movementY;inp.lookT=0;}});
document.addEventListener('pointerlockchange',()=>{
  const was=GS.locked;GS.locked=document.pointerLockElement===glc;
  if(was&&!GS.locked&&GS.mode==='battle'&&!GS.paused)togglePause(true);
});
function releaseLock(){if(document.exitPointerLock&&GS.locked)try{document.exitPointerLock();}catch(_){}}

/* 터치: 왼쪽 조이스틱 · 오른쪽 드래그 시점 · 버튼 */
function useTouch(){if(!inp.touch){inp.touch=true;document.body.classList.add('touch');}}
window.addEventListener('touchstart',useTouch,{passive:true});
if(window.matchMedia&&matchMedia('(pointer:coarse)').matches)useTouch();
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
    if(a==='atk'){inp.atkDown=true;inp.atkPress=true;}else inp[a+'P']=true;e.preventDefault();e.stopPropagation();});
  const up=()=>{if(!el.classList.contains('press'))return;el.classList.remove('press');if(a==='atk'&&inp.atkDown){inp.atkDown=false;inp.atkRel=true;}};
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
function clearPresses(){inp.dodgeP=inp.dashP=inp.qP=inp.eP=inp.rP=inp.tagP=false;inp.atkPress=false;inp.lookX=inp.lookY=0;}

function show(id,on){$(id).classList.toggle('hide',!on);}
function flash(col,a){const f=$('flash');f.style.background=col||'#fff';f.style.transition='none';f.style.opacity=a||0.6;
  requestAnimationFrame(()=>{f.style.transition='opacity .45s';f.style.opacity=0;});}

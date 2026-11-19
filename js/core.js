'use strict';
const VERSION='v0.1.0';
const $=id=>document.getElementById(id);
const cv=$('cv'),ctx=cv.getContext('2d');
let W=0,H=0,DPR=1,ZOOM=1;
const PI=Math.PI,TAU=PI*2;
const rand=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const angTo=(a,b)=>Math.atan2(b.y-a.y,b.x-a.x);
const angDiff=(a,b)=>{let d=(b-a)%TAU;if(d>PI)d-=TAU;if(d<-PI)d+=TAU;return d;};
const pick=a=>a[(Math.random()*a.length)|0];

const IMG={};
for(const k in IMG_SRC){const im=new Image();im.src=IMG_SRC[k];IMG[k]=im;}

function resize(){
  DPR=Math.min(2,window.devicePixelRatio||1);
  W=window.innerWidth;H=window.innerHeight;
  cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);
  cv.style.width=W+'px';cv.style.height=H+'px';
  ZOOM=Math.min(W,H)/450;
  if(Math.max(W,H)/ZOOM>1150)ZOOM=Math.max(W,H)/1150;
  const rot=$('rot');if(rot)rot.classList.toggle('hide',!(H>W&&W<700));
}
window.addEventListener('resize',resize);resize();

/* ---------------- storage ---------------- */
const SAVE={unlocked:0,snd:true};
try{const s=JSON.parse(localStorage.getItem('as0s2_save')||'{}');Object.assign(SAVE,s);}catch(e){}
function persist(){try{localStorage.setItem('as0s2_save',JSON.stringify(SAVE));}catch(e){}}

/* ---------------- audio ---------------- */
let AC=null,NB=null;
function audioInit(){
  if(AC)return;
  try{AC=new (window.AudioContext||window.webkitAudioContext)();
    const len=AC.sampleRate*0.5;NB=AC.createBuffer(1,len,AC.sampleRate);const d=NB.getChannelData(0);
    for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
  }catch(e){AC=null;}
}
function tone(f,d,type,v,slide,delay){
  if(!AC||!SAVE.snd)return;
  const t=AC.currentTime+(delay||0);
  const o=AC.createOscillator(),g=AC.createGain();
  o.type=type||'sine';o.frequency.setValueAtTime(f,t);
  if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,f+slide),t+d);
  g.gain.setValueAtTime(v||0.1,t);g.gain.exponentialRampToValueAtTime(0.0008,t+d);
  o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d+0.03);
}
function noise(d,v,freq,delay){
  if(!AC||!SAVE.snd||!NB)return;
  const t=AC.currentTime+(delay||0);
  const s=AC.createBufferSource();s.buffer=NB;
  const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=freq||1200;f.Q.value=0.8;
  const g=AC.createGain();g.gain.setValueAtTime(v||0.1,t);g.gain.exponentialRampToValueAtTime(0.0008,t+d);
  s.connect(f);f.connect(g);g.connect(AC.destination);s.start(t);s.stop(t+d+0.03);
}
let sfxGate={};
function gate(k,ms){const n=performance.now();if(sfxGate[k]&&n-sfxGate[k]<ms)return false;sfxGate[k]=n;return true;}
const SFX={
  ui(){tone(880,0.06,'sine',0.05);},
  text(){if(gate('tx',55))tone(1200+Math.random()*200,0.025,'triangle',0.012);},
  slashE(){if(gate('sl',40)){noise(0.09,0.09,3200);tone(720,0.08,'triangle',0.04,-380);}},
  slashN(){if(gate('sl',40)){noise(0.16,0.13,900);tone(240,0.16,'sawtooth',0.04,-120);}},
  hit(){if(gate('hit',35)){noise(0.07,0.14,1400);tone(150,0.07,'square',0.04,-70);}},
  dash(){noise(0.16,0.07,4200);},
  perfect(){tone(1320,0.25,'sine',0.07);tone(1760,0.35,'sine',0.05,0,0.06);},
  void(){tone(160,0.9,'sawtooth',0.05,-110);tone(80,1.0,'sine',0.14,-40);noise(0.6,0.05,300);},
  drain(){tone(400,0.5,'triangle',0.06,500);tone(900,0.4,'sine',0.05,-500,0.1);},
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

/* ---------------- input ---------------- */
const keys={};
const inp={mx:0,my:0,atk:false,dashP:false,skillP:false,tagP:false,linkP:false,jx:0,jy:0};
const KEYMAP={KeyJ:'atk',KeyK:'dash',Space:'dash',KeyL:'skill',KeyQ:'tag',KeyE:'link',ShiftLeft:'dash'};
window.addEventListener('keydown',e=>{
  audioInit();
  if(e.repeat){keys[e.code]=true;return;}
  keys[e.code]=true;
  const a=KEYMAP[e.code];
  if(a&&GS.mode==='battle'){if(a==='atk')inp.atk=true;else inp[a+'P']=true;e.preventDefault();}
  if(e.code==='Escape'||e.code==='KeyP'){if(GS.mode==='battle')togglePause();}
  if((e.code==='Enter'||e.code==='Space')&&GS.mode==='dialog'){dlgAdvance();e.preventDefault();}
});
window.addEventListener('keyup',e=>{keys[e.code]=false;if(KEYMAP[e.code]==='atk')inp.atk=false;});
window.addEventListener('blur',()=>{for(const k in keys)keys[k]=false;inp.atk=false;inp.jx=inp.jy=0;});

(function setupJoy(){
  const z=$('joy'),b=$('joyB'),k=$('joyK');let id=null,ox=0,oy=0;
  z.addEventListener('pointerdown',e=>{audioInit();id=e.pointerId;z.setPointerCapture(id);ox=e.clientX;oy=e.clientY;
    b.style.left=k.style.left=ox+'px';b.style.top=k.style.top=oy+'px';b.style.opacity=k.style.opacity=1;inp.jx=inp.jy=0;$('joyHint').style.opacity=0;e.preventDefault();});
  z.addEventListener('pointermove',e=>{if(e.pointerId!==id)return;let dx=e.clientX-ox,dy=e.clientY-oy;const l=Math.hypot(dx,dy),R=50;
    if(l>R){dx*=R/l;dy*=R/l;}k.style.left=ox+dx+'px';k.style.top=oy+dy+'px';inp.jx=dx/R;inp.jy=dy/R;if(l<8){inp.jx=inp.jy=0;}});
  const up=e=>{if(e.pointerId!==id)return;id=null;inp.jx=inp.jy=0;b.style.opacity=k.style.opacity=0;};
  z.addEventListener('pointerup',up);z.addEventListener('pointercancel',up);
})();
document.querySelectorAll('.cb').forEach(el=>{
  const a=el.dataset.a;
  el.addEventListener('pointerdown',e=>{audioInit();el.setPointerCapture(e.pointerId);el.classList.add('press');
    if(a==='atk')inp.atk=true;else inp[a+'P']=true;e.preventDefault();});
  const up=()=>{el.classList.remove('press');if(a==='atk')inp.atk=false;};
  el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);el.addEventListener('lostpointercapture',up);
});
function readMove(){
  let x=0,y=0;
  if(keys.KeyA||keys.ArrowLeft)x-=1;if(keys.KeyD||keys.ArrowRight)x+=1;
  if(keys.KeyW||keys.ArrowUp)y-=1;if(keys.KeyS||keys.ArrowDown)y+=1;
  if(x||y){const l=Math.hypot(x,y);x/=l;y/=l;}else{x=inp.jx;y=inp.jy;}
  inp.mx=x;inp.my=y;
}
function clearPresses(){inp.dashP=inp.skillP=inp.tagP=inp.linkP=false;}

/* ---------------- generic overlays ---------------- */
function show(id,on){$(id).classList.toggle('hide',!on);}
function flash(col,a){const f=$('flash');f.style.background=col||'#fff';f.style.transition='none';f.style.opacity=a||0.6;
  requestAnimationFrame(()=>{f.style.transition='opacity .45s';f.style.opacity=0;});}

const GS={mode:'title',t:0,bg:'title',paused:false};

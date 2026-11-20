/* ==================================================================
   액팅 소울 : 0 — 신들의 종언 (시즌 2 체험판)  v0.6.0
   js/domain.js — 신격 모습 · 헤일로 · 권능 영역(필드 배경 변화)

   설정 문서(신규 시스템 및 권능 설정) Ⅰ·Ⅵ 을 따른다.
   - 영역 전개   : 필드 전체가 권능의 공간으로 변한다 (이든 보랏빛 공허 / 네시스 플래티나 블루 / 공명 황금빛)
   - 강력한 기술 : 이미 전개된 영역 위에 추가 변화(펄스)가 겹친다  → 혼합형
   - 해제        : 기존 전투 필드로 복귀
   ※ 발동 조건·지속시간은 문서에서 미확정이라 아래 DOM_TUNE 의 임시 값이다. 이 값만 고치면 된다.
   ================================================================== */
'use strict';
const DOM_TUNE={
  open:.9, close:.9,                  // 전개 · 해제에 걸리는 시간(초)
  hold:{eden:8, nesis:8, res:12},     // 영역 유지 시간(초) — 임시
  pulse:1.0                           // 강력한 기술 추가 연출 시간(초)
};
const DOM={
  eden:{name:'태초의 공허 영역',who:'eden', hair:'#a96bff', eye:'#b98cff', col:'#b48cff', col2:'#7a3fff', ground:'#12041f',
    sky:['#07020f','#2c1360'], fog:'#1a0838', fogN:6, fogF:70, lightCol:[.55,.38,.95], ambTop:[.5,.32,.85], ambBot:[.14,.07,.3]},
  nesis:{name:'흡융 영역',who:'nesis', hair:'#b9d2ea', eye:'#a8d4ff', col:'#bfe0ff', col2:'#7fb6e8', ground:'#07142a',
    sky:['#071425','#4a79a8'], fog:'#16314f', fogN:6, fogF:70, lightCol:[.7,.85,1], ambTop:[.5,.68,.95], ambBot:[.1,.2,.34]},
  res:{name:'공명의 영역',who:'both', hair:'#ffd75e', eye:'#ffd75e', col:'#ffd45a', col2:'#fff0b0', ground:'#2a1a02',
    sky:['#1c1203','#8a6414'], fog:'#4a3208', fogN:6, fogF:75, lightCol:[1,.86,.5], ambTop:[.95,.78,.4], ambBot:[.3,.2,.06]}
};
const _ez=x=>x<=0?0:x>=1?1:x*x*(3-2*x);
function domOpen(type){
  if(!B||B.over)return;const d=DOM[type];
  if(B.dom&&B.dom.type===type){B.dom.t=Math.min(B.dom.t,DOM_TUNE.open+.01);B.dom.hold=DOM_TUNE.hold[type];B.dom.holdT=0;return;} // 같은 영역이면 유지 시간만 갱신
  const k=domK();B.dom={type,t:k*DOM_TUNE.open,hold:DOM_TUNE.hold[type],holdT:0,closing:false,pulse:0,ct:0};
  flash(d.col,.4);ftxt(P.x,P.y,d.name+' 전개',d.col,1,2.9);
  type==='eden'?SFX.void():type==='nesis'?SFX.drain():SFX.link();
}
function domClose(){if(B&&B.dom&&!B.dom.closing){B.dom.closing=true;B.dom.ct=0;}}
function domPulse(){if(B&&B.dom&&!B.dom.closing)B.dom.pulse=1;}
function domK(){const d=B&&B.dom;if(!d)return 0;return d.closing?1-_ez(d.ct/DOM_TUNE.close)*(1):_ez(d.t/DOM_TUNE.open);}
function domUpdate(dt){
  const d=B.dom;if(!d)return;
  if(d.closing){d.ct+=dt;if(d.ct>=DOM_TUNE.close){B.dom=null;}}
  else{d.t+=dt;if(d.t>=DOM_TUNE.open){d.holdT+=dt;if(d.holdT>=d.hold)domClose();}}
  if(B.dom)B.dom.pulse=Math.max(0,B.dom.pulse-dt/DOM_TUNE.pulse);
}
/* 영역 색으로 섞은 환경(안개·조명). 영역이 없으면 원래 cfg 를 그대로 쓴다 */
function domCfg(base){
  const d=B.dom;if(!d)return base;const k=domK(),c=DOM[d.type];if(k<=0)return base;
  const mixA=(a,b)=>a.map((v,i)=>lerp(v,b[i],k));
  return Object.assign({},base,{fog:mixA(base.fog,hex(c.fog)),fogN:lerp(base.fogN,c.fogN,k),fogF:lerp(base.fogF,c.fogF,k),
    lightCol:mixA(base.lightCol,c.lightCol),ambTop:mixA(base.ambTop,c.ambTop),ambBot:mixA(base.ambBot,c.ambBot)});
}
function domSky(){ // 하늘: 영역이 절반 이상 펼쳐지면 영역의 하늘로 (전개 순간 flash 로 이음새를 가린다)
  const d=B.dom;if(d&&domK()>.5)drawSky('dom_'+d.type,DOM[d.type]);else drawSky(B.def.arena,B.cfg);
}
/* 신격 모습: 머리·눈 색 + 헤일로. 영역 중에만 적용, 해제되면 원래 모습 */
function domLookFor(who){
  const d=B.dom;if(!d||domK()<.5)return null;
  const c=DOM[d.type];return (c.who==='both'||c.who===who)?c:null;
}
function domApplyLooks(){for(const w of ['eden','nesis']){const c=domLookFor(w);P.rig[w].setLook(c?c.hair:null,c?c.eye:null);}}
function halo(kind,x,z,face,t,k,pulse,col,col2){
  // 등 뒤에 세운 원형 구조물. 회전 순서(Y→X→Z): rx=π/2 로 세우고 ry 로 바라보는 방향에 맞춘다
  const bx=x-Math.cos(face)*.28,bz=z-Math.sin(face)*.28,ry=Math.PI/2-face,a=(kind==='res'?.3:.42)*k;
  if(kind==='eden'||kind==='res'){ // 보랏빛 원이 서로 교차
    for(let i=0;i<4;i++){const th=t*.35*(i%2?-1:1)+i*Math.PI/4,s=(.5+.07*i)*(1+.35*pulse);
      R3.draw(FX.m.torus,mat(bx,1.5,bz,ry,s*k*1.1,s*k*1.1,s*k*1.1,Math.PI/2,th),{mode:2,tint:kind==='res'?col:col,a});}
  }
  if(kind==='nesis'||kind==='res'){ // 얇은 판이 꽃잎처럼 바깥으로 벌어짐
    const n=7,open=(.55+.35*pulse)*k;
    for(let i=0;i<n;i++){const th=(i-(n-1)/2)*open*.42,s=.62+.06*Math.cos((i-(n-1)/2)*.6);
      R3.draw(FX.m.torus,mat(bx-Math.cos(face)*.03*i,1.5,bz-Math.sin(face)*.03*i,ry,s*k*1.1,s*k*.35,s*k*1.1,Math.PI/2,th),{mode:2,tint:kind==='res'?col2:col,a:a*.9});}
  }
}
function domDraw(t,rdt){
  const d=B.dom;if(!d)return;const k=domK(),c=DOM[d.type],pu=_ez(d.pulse),px=P.x*S,pz=P.y*S,cx=B.w*S/2,cz=B.h*S/2,R0=Math.max(B.w,B.h)*S*.62;
  // 바닥: 영역의 공간 + 원형 문양
  R3.draw(FX.m.disc,mat(cx,.03,cz,0,R0,1,R0),{mode:1,tint:c.ground,a:.6*k});
  for(let i=0;i<3;i++){const r=R0*(.35+.22*i)*(1+.06*pu);R3.draw(FX.m.glowRing,mat(cx,.05+i*.01,cz,t*(.15+.1*i)*(i%2?-1:1),r,1,r),{mode:2,tint:i===1?c.col2:c.col,a:(.3+.25*pu)*k});}
  // 공중: 떠다니는 원형 구조물
  const n=d.type==='nesis'?9:6;
  for(let i=0;i<n;i++){
    const a=i/n*TAU+t*.08,rr=R0*(.55+.2*Math.sin(i*2.1)),s=3.2+1.4*Math.sin(i*1.7+1)+pu*1.6;
    const y=5.5+Math.sin(t*.6+i)*.8+pu*1.2,x=cx+Math.cos(a)*rr,z=cz+Math.sin(a)*rr,ry=a+t*.1;
    if(d.type==='nesis'){const tilt=.5+pu*.5,ex=Math.sin(t*.3+i)*.1;
      R3.draw(FX.m.torus,mat(x,y,z,ry,s,s*.3,s,Math.PI/2-.35+ex,tilt*(i%2?1:-1)),{mode:2,tint:c.col,a:(.28+.3*pu)*k});}
    else{const sp=(1+pu*3);
      R3.draw(FX.m.torus,mat(x,y,z,ry,s,s,s,t*.2*sp+i,t*.15*sp*(i%2?1:-1)),{mode:2,tint:i%2?c.col2:c.col,a:(.3+.3*pu)*k});}
  }
  // 입자: 이든 = 생성·소멸, 네시스 = 플레이어로 모여듦, 공명 = 둘 다
  const col=hex(c.col),col2=hex(c.col2);
  for(let i=0;i<46;i++){const sd=i*12.9898,u=(Math.sin(sd)*43758.5453)%1,v=(Math.sin(sd*1.7)*24634.6345)%1,w=(Math.sin(sd*2.3)*12345.678)%1;
    const U=Math.abs(u),V=Math.abs(v),W=Math.abs(w);
    if(d.type!=='nesis'&&(i%2===0||d.type==='eden')){ // 생성되었다가 소멸하는 별빛
      const ph=(t*.35+U)%1,al=Math.sin(ph*Math.PI)*k;R3.pt(px+(V-.5)*16,.4+W*6,pz+(U-.5)*16,.07+.04*pu,i%3?col:col2,al*.9);}
    else{ // 흡수된 에너지·사념의 입자가 흘러듦
      const ph=(t*(.25+.2*pu)+U)%1,ang=V*TAU,rr=(1-ph)*9;R3.pt(px+Math.cos(ang)*rr,.6+W*2.4*(1-ph),pz+Math.sin(ang)*rr,.08,i%3?col:col2,Math.sin(ph*Math.PI)*k*.9);}
  }
  // 헤일로 (영역 중 주인공 등 뒤)
  const lo=domLookFor(P.active);if(lo)halo(d.type==='res'?'res':P.active===('eden')?'eden':'nesis',px,pz,P.face,t,k,pu,c.col,c.col2);
  if(B.cine){const o=other(),oo=domLookFor(o);if(oo){const ox=P.x+Math.cos(P.face+PI/2)*36,oy=P.y+Math.sin(P.face+PI/2)*36;halo(d.type==='res'?'res':o,ox*S,oy*S,P.face,t,k,pu,c.col,c.col2);}}
}

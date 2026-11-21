/* ==================================================================
   액팅 소울 : 0 — 신들의 종언 (시즌 2 체험판)  v0.7.1
   assets/effects.js — 이펙트 (베기 궤적, 충격파, 번개, 입자, 공격 예고 표시, 투사체, 피해 숫자)

   좌표는 모두 월드 미터(m) 기준. y = 높이.
   새 이펙트 추가 방법
     FX.spawn({ life:0.5, draw(e,k){ ... R3.draw(메시, 행렬, {mode:2, tint:'#색', a:k}) } })
     k = 남은 수명 비율 (1 → 0)
   나중에 텍스처/파티클 시스템으로 바꿀 때는 이 파일만 교체하면 된다.
   ================================================================== */
'use strict';
const FX={
  list:[],parts:[],texts:[],
  m:{},
  init(){
    const M=this.m;
    M.oct=R3.mesh(GEO.oct(1,'#ffffff'));
    M.disc=R3.mesh(GEO.disc(1,32,'#ffffff'));
    M.edge=R3.mesh(GEO.ring(.94,1,48,'#ffffff'));
    M.rect=R3.mesh(GEO.rect(0,1,-.5,.5,'#ffffff'));
    M.rectEdge=R3.mesh(GEO.merge(GEO.rect(0,1,-.5,-.44,'#fff'),GEO.rect(0,1,.44,.5,'#fff'),GEO.rect(.97,1,-.5,.5,'#fff')));
    M.box=R3.mesh(GEO.box(1,1,1,'#ffffff'));
    M.sph=R3.mesh(GEO.sph(1,14,'#ffffff'));
    M.shadow=R3.mesh(GEO.ring(0,1,24,'#000000','#000000'));
    M.glowRing=R3.mesh(GEO.ring(.82,1,48,'#ffffff','#000000'));
    M.torus=R3.mesh(GEO.torus(1,.04,40,6,'#ffffff'));
    M.pillar=R3.mesh(GEO.cyl(1,1,1,16,'#ffffff',false).tr(0,.5,0).grad('#000000','#ffffff',0,1));
    M.needle=R3.mesh(GEO.cone(.06,.7,6,'#ffffff').rx(Math.PI/2));
  },
  sectorMesh(r1,r2,arc,inner){const k='sec_'+r1.toFixed(2)+'_'+r2.toFixed(2)+'_'+arc.toFixed(2)+(inner||'');return MESH.get(k,()=>GEO.sector(r1,r2,arc,24,'#ffffff',inner||'#ffffff'));},
  ringMesh(ratio){const k='rng_'+ratio.toFixed(2);return MESH.get(k,()=>GEO.ring(ratio,1,48,'#ffffff'));},
  spawn(e){e.t=0;e.max=e.life;this.list.push(e);return e;},
  clear(){this.list.length=0;this.parts.length=0;this.texts.length=0;},

  /* ---------- 입자 ---------- */
  burst(x,y,z,n,col,spd,life,size,grav){
    for(let i=0;i<n;i++){if(this.parts.length>260)this.parts.shift();
      const a=Math.random()*Math.PI*2,b=(Math.random()-.3)*Math.PI*.6,s=spd*(.4+Math.random()*.8);
      this.parts.push({x,y,z,vx:Math.cos(a)*Math.cos(b)*s,vy:Math.sin(b)*s+spd*.3,vz:Math.sin(a)*Math.cos(b)*s,life:life*(.6+Math.random()*.6),max:life,col,size:size||.08,grav:grav==null?6:grav});}
  },
  trail(x,y,z,col,size){if(this.parts.length>260)this.parts.shift();this.parts.push({x:x+(Math.random()-.5)*.3,y:y+(Math.random()-.5)*.3,z:z+(Math.random()-.5)*.3,vx:0,vy:.6,vz:0,life:.35,max:.35,col,size:size||.07,grav:0});},
  /* ---------- 베기 궤적 ---------- */
  slash(x,z,ang,r,arc,col,dir,y,thick){
    const mesh=this.sectorMesh(r*(1-(thick||.4)),r,arc,'#000000');
    this.spawn({life:.2,draw(e,k){const turn=(1-k)*.5*dir;R3.draw(mesh,mat(x,y||1.0,z,-ang+turn-.25*dir,1,1,1,0,dir*.18),{mode:2,tint:col,a:k});}});
  },
  /* ---------- 충격파 링 ---------- */
  ring(x,z,r0,r1,col,life,y){
    this.spawn({life:life||.35,draw(e,k){const r=r0+(r1-r0)*(1-k);R3.draw(FX.m.glowRing,mat(x,y||.06,z,0,r,1,r),{mode:2,tint:col,a:k});}});
  },
  /* ---------- 빛기둥 ---------- */
  pillar(x,z,r,h,col,life){this.spawn({life:life||.5,draw(e,k){R3.draw(FX.m.pillar,mat(x,0,z,0,r*(1.4-k*.4),h,r*(1.4-k*.4)),{mode:2,tint:col,a:k});}});},
  /* ---------- 번개 ---------- */
  bolt(x1,y1,z1,x2,y2,z2,col,life){
    const pts=[[x1,y1,z1]];for(let i=1;i<6;i++){const t=i/6;pts.push([x1+(x2-x1)*t+(Math.random()-.5)*.5,y1+(y2-y1)*t+(Math.random()-.5)*.5,z1+(z2-z1)*t+(Math.random()-.5)*.5]);}pts.push([x2,y2,z2]);
    this.spawn({life:life||.2,draw(e,k){for(let i=0;i<pts.length-1;i++)FX.beam(pts[i],pts[i+1],.06,col,k);}});
  },
  beam(a,b,w,col,alpha){
    const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],L=Math.hypot(dx,dy,dz)||.001,h=Math.hypot(dx,dz);
    R3.draw(this.m.box,mat((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,Math.atan2(dx,dz),w,w,L,-Math.atan2(dy,h)),{mode:2,tint:col,a:alpha});
  },
  /* ---------- 피해 숫자 / 문구 (화면 위 2D) ---------- */
  text(x,y,z,s,col,big){this.texts.push({x,y,z,s,col,big,life:.85,max:.85});},

  update(dt){
    for(const e of this.list){e.t+=dt;if(e.upd)e.upd(e,dt);}
    this.list=this.list.filter(e=>e.t<e.max);
    for(const p of this.parts){p.life-=dt;p.vy-=p.grav*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.vx*=.95;p.vz*=.95;if(p.y<.02){p.y=.02;p.vy*=-.3;}}
    this.parts=this.parts.filter(p=>p.life>0);
    for(const t of this.texts){t.life-=dt;t.y+=1.2*dt;}
    this.texts=this.texts.filter(t=>t.life>0);
  },
  draw(){
    for(const e of this.list)e.draw(e,1-e.t/e.max);
    for(const p of this.parts){const k=p.life/p.max;R3.pt(p.x,p.y,p.z,p.size*(.4+.6*k),p.col,k);}
  },
  drawTexts(c){
    c.textAlign='center';c.lineJoin='round';
    for(const t of this.texts){const s=R3.project(t.x,t.y,t.z);if(!s)continue;const k=t.life/t.max;
      c.globalAlpha=Math.min(1,k*2);c.font=`900 ${t.big?20:14}px system-ui,sans-serif`;c.lineWidth=3.5;c.strokeStyle='rgba(0,0,0,.75)';
      c.strokeText(t.s,s[0],s[1]);c.fillStyle=t.col;c.fillText(t.s,s[0],s[1]);}
    c.globalAlpha=1;
  },

  /* ================= 매 프레임 그리는 것들 ================= */
  shadow(x,z,r,a){R3.draw(this.m.disc,mat(x,.015,z,0,r,1,r),{mode:1,tint:'#000000',a:a==null?.38:a});},
  /* 공격 예고 표시. kind: circle / ring / cone / line,  prog: 0→1 차오름, fired: 터진 직후 */
  decal(kind,x,z,o,prog,col,fired){
    const y=.03,a=fired?.6:.16+.14*prog,c=col||'#ff3c5a';
    if(kind==='circle'){
      R3.draw(this.m.disc,mat(x,y,z,0,o.r,1,o.r),{mode:1,tint:c,a});
      R3.draw(this.m.edge,mat(x,y+.005,z,0,o.r,1,o.r),{mode:1,tint:c,a:.85});
      if(!fired)R3.draw(this.m.disc,mat(x,y+.01,z,0,o.r*prog,1,o.r*prog),{mode:1,tint:c,a:.3});
    }else if(kind==='ring'){
      R3.draw(this.ringMesh(o.r2/o.r),mat(x,y,z,0,o.r,1,o.r),{mode:1,tint:c,a:a+.05});
      R3.draw(this.m.edge,mat(x,y+.005,z,0,o.r,1,o.r),{mode:1,tint:c,a:.8});
      R3.draw(this.m.edge,mat(x,y+.005,z,0,o.r2,1,o.r2),{mode:1,tint:c,a:.8});
    }else if(kind==='cone'){
      R3.draw(this.sectorMesh(0,1,o.arc),mat(x,y,z,-o.ang,o.r,1,o.r),{mode:1,tint:c,a});
      if(!fired)R3.draw(this.sectorMesh(0,1,o.arc),mat(x,y+.01,z,-o.ang,o.r*prog,1,o.r*prog),{mode:1,tint:c,a:.3});
    }else if(kind==='line'){
      R3.draw(this.m.rect,mat(x,y,z,-o.ang,o.len,1,o.w),{mode:1,tint:c,a});
      R3.draw(this.m.rectEdge,mat(x,y+.005,z,-o.ang,o.len,1,o.w),{mode:1,tint:c,a:.85});
      if(!fired)R3.draw(this.m.rect,mat(x,y+.01,z,-o.ang,o.len*prog,1,o.w),{mode:1,tint:c,a:.3});
      else R3.draw(this.m.rect,mat(x,y+.02,z,-o.ang,o.len,1,o.w*.25),{mode:2,tint:'#ffffff',a:.8});
    }
  },
  /* 이든 — 태초의 공허 */
  voidField(x,z,r,t,k){
    R3.draw(this.m.disc,mat(x,.04,z,0,r,1,r),{mode:1,tint:'#12041f',a:.75});
    R3.draw(this.m.glowRing,mat(x,.05,z,t*2,r*(1+.04*Math.sin(t*12)),1,r*(1+.04*Math.sin(t*12))),{mode:2,tint:'#b48cff',a:.9});
    R3.draw(this.m.sph,mat(x,1.1,z,0,.55+.1*Math.sin(t*9)),{mode:1,tint:'#000000'});
    for(let i=0;i<3;i++)R3.draw(this.m.torus,mat(x,1.1,z,t*(2+i),.9+i*.25,1,.9+i*.25,.6+i*.5,t*(1+i)),{mode:2,tint:i===1?'#7a3fff':'#c9b6ff',a:.7});
    if(Math.random()<.9){const a=Math.random()*6.28;const rr=r*.95;this.parts.push({x:x+Math.cos(a)*rr,y:.3+Math.random()*1.5,z:z+Math.sin(a)*rr,vx:-Math.cos(a)*rr*2.2,vy:.5,vz:-Math.sin(a)*rr*2.2,life:.4,max:.4,col:Math.random()<.5?'#9b6bff':'#e0d0ff',size:.09,grav:0});}
  },
  /* 네시스 — 이럽디오 불꽃 파동 */
  flameWave(x,z,ang,r,t,purple,green){ // purple = 센수스 폭풍 파동, green = 이럽디오 녹염
    const c1=purple?'#c77dff':green?'#7dff8a':'#6cb8ff',c2=purple?'#7a3fc0':green?'#1fbf4a':'#3d7dff';
    R3.draw(this.sectorMesh(r*.5,r,1.7,'#000000'),mat(x,.8,z,-ang,1,1,1,0,0),{mode:2,tint:c1,a:.9});
    R3.draw(this.sectorMesh(r*.5,r,1.7,'#000000'),mat(x,.4,z,-ang,1,1,1,0,0),{mode:2,tint:c2,a:.7});
    this.trail(x,.6,z,Math.random()<.5?c1:green?'#d8ffe0':'#e8dcff',.12);
  },
  orb(x,y,z,r,col){R3.draw(this.m.sph,mat(x,y,z,0,r),{mode:2,tint:col,a:.95});R3.draw(this.m.sph,mat(x,y,z,0,r*2.2),{mode:2,tint:col,a:.25});},
  needle(x,y,z,ang,col){R3.draw(this.m.needle,mat(x,y,z,Math.PI/2-ang,1.3),{mode:2,tint:col||'#efe2ff',a:1});},
  /* 아군 마커 / 보호 대상 표시 */
  marker(x,z,r,col,t){R3.draw(this.m.edge,mat(x,.03,z,t,r,1,r),{mode:2,tint:col,a:.55});},
  /* 링크 0 연출 */
  linkHalo(x,z,t,k){
    for(let i=0;i<5;i++){const a=t*.9+i*1.2566;R3.draw(this.m.torus,mat(x+Math.cos(a)*.6,1.6,z+Math.sin(a)*.6,a,1.2*k+.2,1,1.2*k+.2,1.2,0),{mode:2,tint:'#b48cff',a:.8});}
    for(let i=0;i<12;i++){const a=-t*.6+i*.5236;R3.draw(this.m.oct,mat(x+Math.cos(a)*(2.5*k+.5),1.2,z+Math.sin(a)*(2.5*k+.5),a,.35,.08,.12),{mode:2,tint:'#bfeaff',a:.8});}
    R3.draw(this.m.pillar,mat(x,0,z,0,1.2*k+.2,14,1.2*k+.2),{mode:2,tint:'#c9b6ff',a:.6*k});
  },
};

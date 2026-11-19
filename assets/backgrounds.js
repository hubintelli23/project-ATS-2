/* ==================================================================
   액팅 소울 : 0 — 신들의 종언 (시즌 2 체험판)  v0.2.0
   assets/backgrounds.js — 배경 (대화 장면 + 전투 맵)

   새 배경 추가 방법
   BACKGROUNDS['아이디'] = {
     name:'표시 이름',
     cfg:{ sky:['#위','#아래'], fog:'#안개색', fogN:시작거리, fogF:끝거리,
           light:[x,y,z], lightCol:'#햇빛', ambTop:'#하늘 반사광', ambBot:'#바닥 반사광' },
     cast:[ {id:'eden', dx:-.8, dz:0, face:각도}, ... ],   // 대화 장면에 서 있는 캐릭터 (avatars.js 아이디)
     build(o){ ... return {draw(t){}} }  // o.w, o.h = 크기(m), o.arena = 전투 맵이면 true
   };
   스크립트에서 @bg 아이디 로 부른다.
   ================================================================== */
'use strict';
const BACKGROUNDS={};
const PROPS={};
function PR(seed){let s=seed%2147483647;if(s<=0)s+=2147483646;return()=>(s=s*16807%2147483647)/2147483647;}

/* ---------- 공통 부품 ---------- */
function skyMesh(key,top,bot){return MESH.get('sky_'+key,()=>GEO.sph(320,24,'#fff').grad(top,bot,-60,200));}
function cfgOf(c){const k=(v,m,a)=>hex(v).map(x=>Math.min(1.2,x*m+a));return{sky:c.sky,fog:hex(c.fog),fogN:c.fogN,fogF:c.fogF,light:c.light||[-.4,-1,-.35],lightCol:k(c.lightCol||'#d8d0e0',1.15,0),ambTop:k(c.ambTop||'#55506a',1.6,.06),ambBot:k(c.ambBot||'#1a1622',1.5,.04)};}
function groundGeo(cx,cz,size,col){return GEO.rect(cx-size,cx+size,cz-size,cz+size,col);}
function gridGeo(x0,x1,z0,z1,step,w,col){const g=new Geo();for(let x=x0;x<=x1+.001;x+=step)g.add(GEO.box(w,.01,z1-z0,col).tr(x,.012,(z0+z1)/2));for(let z=z0;z<=z1+.001;z+=step)g.add(GEO.box(x1-x0,.01,w,col).tr((x0+x1)/2,.012,z));return g;}
function wallGeo(w,h,col){const t=.25,y=.35;return GEO.merge(GEO.box(w,.7,t,col).tr(w/2,y,0),GEO.box(w,.7,t,col).tr(w/2,y,h),GEO.box(t,.7,h,col).tr(0,y,h/2),GEO.box(t,.7,h,col).tr(w,y,h/2));}
function wallGlow(w,h,col){const t=.06,y=.72;return GEO.merge(GEO.box(w,t,t,col).tr(w/2,y,0),GEO.box(w,t,t,col).tr(w/2,y,h),GEO.box(t,t,h,col).tr(0,y,h/2),GEO.box(t,t,h,col).tr(w,y,h/2));}
/* 공허의 게이트 (하늘의 균열) */
function gateGeo(r,col){const g=GEO.torus(r,r*.06,48,8,col);for(let i=0;i<9;i++){const a=i/9*Math.PI*2;g.add(GEO.box(r*.9,r*.02,r*.02,col).tr(r*1.2,0,0).ry(a));}return g;}
function drawSky(key,c){R3.draw(skyMesh(key,c.sky[0],c.sky[1]),mat(R3.cam.pos[0],0,R3.cam.pos[2],0,1),{mode:3});}
/* 떠다니는 먼지·재 */
function motes(cx,cz,n,spread,col,dir,size){
  const P=[];const r=PR(n*77+spread);for(let i=0;i<n;i++)P.push([r(),r(),r(),r()]);
  return t=>{for(const p of P){let y=((p[1]+t*.05*dir*(.4+p[3]))%1+1)%1;R3.draw(FX.m.oct,mat(cx+(p[0]-.5)*spread+Math.sin(t*.5+p[3]*9)*.6,y*12,cz+(p[2]-.5)*spread,t+p[3]*9,size||.05),{mode:2,tint:col,a:.7});}};
}

/* ---------- 전초기지 방어막 발생기 (전투에서도 사용) ---------- */
PROPS.generator={
  build(){
    const base=MESH.get('gen_b',()=>GEO.merge(GEO.cyl(1.3,1.6,.5,6,'#3a3f4c').tr(0,.25,0),GEO.cyl(.55,.75,2.2,6,'#4a505e').tr(0,1.5,0),GEO.box(.2,2.4,.2,'#ffb36b').tr(.6,1.4,0),GEO.box(.2,2.4,.2,'#ffb36b').tr(-.6,1.4,0)));
    const core=MESH.get('gen_c',()=>GEO.sph(.45,14,'#ffcf7a'));
    return{draw(x,z,t,hpk,flash){
      R3.draw(base,mat(x,0,z,t*.1),{fl:flash?.6:0});
      R3.draw(core,mat(x,2.9+Math.sin(t*3)*.1,z,t),{mode:1,tint:hpk>.3?'#ffcf7a':'#ff5a3b'});
      R3.draw(FX.m.sph,mat(x,2.9,z,0,.9+.1*Math.sin(t*5)),{mode:2,tint:'#ffb36b',a:.25});
      R3.draw(FX.m.edge,mat(x,.05,z,t*.3,3,1,3),{mode:2,tint:'#ffb36b',a:.35});
    }};
  }
};

/* ================= 타이틀 ================= */
BACKGROUNDS.title={name:'타이틀',cfg:cfgOf({sky:['#1a0f33','#05030a'],fog:'#0a0716',fogN:20,fogF:90,ambTop:'#4a3f6a',ambBot:'#120e1c'}),cast:[],
  build(o){
    const cx=o.w/2,cz=o.h/2;
    const floor=MESH.get('t_floor',()=>GEO.merge(GEO.disc(30,48,'#0d0a18').tr(cx,0,cz),GEO.ring(5,5.3,64,'#2a1f4a').tr(cx,.01,cz),GEO.ring(9,9.2,64,'#2a1f4a').tr(cx,.01,cz)));
    const gate=MESH.get('t_gate',()=>gateGeo(6,'#c9b6ff'));
    const m=motes(cx,cz,60,30,'#b9a4ff',1);
    return{draw(t){
      R3.draw(floor,mat(0,0,0));
      R3.draw(gate,mat(cx,7,cz-6,0,1,1,1,Math.PI/2,t*.1),{mode:1});
      R3.draw(FX.m.disc,mat(cx,7,cz-6.05,0,5.4,1,5.4,Math.PI/2),{mode:1,tint:'#05030a'});
      for(let i=0;i<4;i++)R3.draw(FX.m.torus,mat(cx,7,cz-6,t*(.2+i*.07)*(i%2?1:-1),7+i*1.4,1,7+i*1.4,Math.PI/2+.2*i,t*.1),{mode:2,tint:'#8a5cff',a:.35});
      m(t);
    }};
  }};
/* ================= 흡융의 탑 (프롤로그) ================= */
BACKGROUNDS.tower={name:'흡융의 탑',cfg:cfgOf({sky:['#2a0f40','#07030c'],fog:'#12081e',fogN:15,fogF:70,lightCol:'#a890d0',ambTop:'#4a3466',ambBot:'#140a1e'}),
  cast:[{id:'eden',dx:-1,dz:0,face:-Math.PI/2+.4},{id:'nesis',dx:1,dz:-.4,face:-Math.PI/2-.4}],
  build(o){
    const cx=o.w/2,cz=o.h/2;
    const st=MESH.get('tw_st',()=>{const g=GEO.merge(GEO.cyl(12,12.5,.6,40,'#2a2433').tr(cx,-.3,cz));const r=PR(5);
      for(let i=0;i<10;i++){const a=i/10*Math.PI*2,h=6+r()*10;g.add(GEO.cyl(.7,.9,h,8,'#3a3046').tr(cx+Math.cos(a)*11,h/2,cz+Math.sin(a)*11));}return g;});
    const ch=MESH.get('tw_ch',()=>{const g=new Geo();for(let i=0;i<10;i++){const a=i/10*Math.PI*2;for(let k=0;k<14;k++){const d=1.5+k*.68;g.add(GEO.box(.32,.12,.12,k%2?'#9a9ab0':'#c8c8d8').ry(k%2?Math.PI/2:0).tr(cx+Math.cos(a)*d,4.5+Math.sin(k*.5)*.3,cz+Math.sin(a)*d));}}return g;});
    const m=motes(cx,cz,50,26,'#c9b6ff',1);
    return{draw(t){R3.draw(st,mat(0,0,0));R3.draw(ch,mat(cx,0,cz,Math.sin(t*.3)*.03,1,1,1,0,0),{});
      R3.draw(FX.m.sph,mat(cx,4.5,cz-2,0,1.2+Math.sin(t*2)*.05),{mode:1,tint:'#000000'});
      R3.draw(FX.m.torus,mat(cx,4.5,cz-2,t,1.5,1,1.5,1.2,0),{mode:2,tint:'#b48cff',a:.9});
      R3.draw(FX.m.sph,mat(cx,4.5,cz-2,0,2.2),{mode:2,tint:'#7a3fff',a:.1});m(t);}};
  }};
/* ================= 스테일 마을 대장간 ================= */
BACKGROUNDS.forge={name:'스테일 마을 대장간',cfg:cfgOf({sky:['#5a5a66','#2a2826'],fog:'#3a3838',fogN:12,fogF:70,light:[.5,-1,-.4],lightCol:'#b8b0a8',ambTop:'#6a6670',ambBot:'#2a2420'}),
  cast:[{id:'eden',dx:-.9,dz:0,face:Math.PI/2+.2},{id:'nesis',dx:.9,dz:.2,face:Math.PI/2-.2}],
  build(o){
    const cx=o.w/2,cz=o.h/2;
    const st=MESH.get('fg_st',()=>{const g=GEO.merge(groundGeo(cx,cz,90,'#4a4646'),
      GEO.box(9,4,6,'#3b302a').tr(cx,2,cz-6),GEO.cyl(.01,6.6,2.6,4,'#2a2220').ry(Math.PI/4).tr(cx,5.3,cz-6),
      GEO.box(1.2,.7,.6,'#1a1614').tr(cx+2.5,.35,cz-1.8),GEO.box(.5,.5,.4,'#1a1614').tr(cx+2.5,.95,cz-1.8),
      GEO.box(1.6,5.5,1.6,'#2e2622').tr(cx+3.5,2.75,cz-6.5));
      const r=PR(9);for(let i=0;i<12;i++){const x=cx+(r()-.5)*60,z=cz-10-r()*30;g.add(GEO.cyl(.15,.25,4+r()*3,6,'#2a2420').tr(x,2,z),GEO.box(3+r()*4,2+r()*3,3,'#3a3634').tr(x+4,1.2,z-3));}return g;});
    const glow=MESH.get('fg_gl',()=>GEO.merge(GEO.box(1.4,1,.1,'#ff8a3c').tr(cx+3.5,1.2,cz-5.65),GEO.box(1.4,1.2,.1,'#ffb36b').tr(cx-1.5,1.6,cz-2.95)));
    const gate=MESH.get('fg_gate',()=>gateGeo(20,'#d8d8e8'));
    const m=motes(cx,cz,70,30,'#c8c4cc',-1,.04);
    return{draw(t){R3.draw(st,mat(0,0,0));R3.draw(glow,mat(0,0,0),{mode:1,a:1,tint:[1,.85+.15*Math.sin(t*6),.8,1]});
      R3.draw(gate,mat(cx+10,55,cz-120,0,1,1,1,Math.PI/2-.3,t*.03),{mode:1});R3.draw(FX.m.disc,mat(cx+10,55,cz-120.5,0,17,1,17,Math.PI/2-.3),{mode:1,tint:'#1a1820'});m(t);}};
  }};
/* ================= 방주 레지스트리 ================= */
function arkCommon(cx,cz){
  return{st:MESH.get('ark_st',()=>{const g=GEO.merge(groundGeo(cx,cz,120,'#0b1626'),GEO.cyl(2.6,3.2,40,16,'#d8e6f5').tr(cx,20,cz-40),GEO.sph(14,24,'#13263f').tr(cx+28,-3,cz-30),
      GEO.box(14,6,10,'#1a2a40').tr(cx-28,3,cz-26),GEO.box(4,10,4,'#20324c').tr(cx-14,5,cz-36),GEO.box(5,14,5,'#20324c').tr(cx+14,7,cz-44));return g;}),
    gl:MESH.get('ark_gl',()=>GEO.merge(gridGeo(cx-40,cx+40,cz-40,cz+40,4,.05,'#2a7fd8'),GEO.cyl(2.7,2.7,1.5,16,'#7fd8ff',false).tr(cx,38,cz-40),GEO.box(6,1.4,.1,'#ff9a5a').tr(cx-28,2,cz-20.9)))};
}
BACKGROUNDS.ark={name:'방주 레지스트리',cfg:cfgOf({sky:['#0a2346','#02060e'],fog:'#061226',fogN:20,fogF:110,lightCol:'#b8d0ef',ambTop:'#3a5478',ambBot:'#0a1424'}),
  cast:[{id:'eden',dx:-.9,dz:0,face:Math.PI/2+.2},{id:'nesis',dx:.9,dz:.2,face:Math.PI/2-.2}],
  build(o){const cx=o.w/2,cz=o.h/2,A=arkCommon(cx,cz);const r=PR(3),cubes=[];for(let i=0;i<18;i++)cubes.push([cx+(r()-.5)*30,2+r()*8,cz-5-r()*20,r()]);
    return{draw(t){R3.draw(A.st,mat(0,0,0));R3.draw(A.gl,mat(0,0,0),{mode:1});
      R3.draw(FX.m.sph,mat(cx,40,cz-40,0,4+Math.sin(t*3)*.4),{mode:2,tint:'#59c8ff',a:.5});
      for(const c of cubes)R3.draw(FX.m.box,mat(c[0],c[1]+Math.sin(t+c[3]*9)*.4,c[2],t*.5+c[3]*6,.4,.4,.4,t*.3),{mode:2,tint:'#7fd8ff',a:.55});}};
  }};
/* ================= 에테르 시뮬레이션 챔버 ================= */
BACKGROUNDS.chamber={name:'에테르 시뮬레이션 챔버',cfg:cfgOf({sky:['#03060c','#010204'],fog:'#02050b',fogN:25,fogF:90,lightCol:'#a8c8ef',ambTop:'#2a3a58',ambBot:'#05080e'}),
  cast:[{id:'eden',dx:-.9,dz:0,face:Math.PI/2+.2},{id:'nesis',dx:.9,dz:.2,face:Math.PI/2-.2}],
  build(o){const w=o.w,h=o.h,cx=w/2,cz=h/2,a=o.arena;
    const st=MESH.get('ch_st'+w+'_'+h,()=>{const g=GEO.merge(groundGeo(cx,cz,90,'#05070c'));for(let i=0;i<16;i++){const an=i/16*Math.PI*2,R=Math.max(w,h)*.75+4;g.add(GEO.box(1.4,14,1.4,'#0c1018').tr(cx+Math.cos(an)*R,7,cz+Math.sin(an)*R));}if(a)g.add(wallGeo(w,h,'#0c1420'));return g;});
    const gl=MESH.get('ch_gl'+w+'_'+h,()=>{const g=GEO.merge(gridGeo(cx-30,cx+30,cz-30,cz+30,2,.04,'#1d5f9a'),GEO.ring(Math.min(w,h)*.42,Math.min(w,h)*.42+.12,64,'#59c8ff').tr(cx,.02,cz));
      for(let i=0;i<16;i++){const an=i/16*Math.PI*2,R=Math.max(w,h)*.75+4;g.add(GEO.box(.1,12,.1,'#59c8ff').tr(cx+Math.cos(an)*(R-.72),7,cz+Math.sin(an)*(R-.72)));}if(a)g.add(wallGlow(w,h,'#59c8ff'));return g;});
    return{draw(t){R3.draw(st,mat(0,0,0));R3.draw(gl,mat(0,0,0),{mode:1});
      R3.draw(FX.m.glowRing,mat(cx,.03,cz,t*.2,Math.min(w,h)*.3,1,Math.min(w,h)*.3),{mode:2,tint:'#59c8ff',a:.25+.15*Math.sin(t*2)});}};
  }};
/* ================= 중앙 광장 ================= */
BACKGROUNDS.plaza={name:'레지스트리 중앙 광장',cfg:cfgOf({sky:['#3a3266','#1a1424'],fog:'#221c34',fogN:15,fogF:80,lightCol:'#e8c8b0',ambTop:'#5a5070',ambBot:'#1e1824'}),
  cast:[{id:'eden',dx:-.9,dz:0,face:Math.PI/2+.2},{id:'nesis',dx:.9,dz:.2,face:Math.PI/2-.2}],
  build(o){const cx=o.w/2,cz=o.h/2;
    const st=MESH.get('pz_st',()=>{const g=GEO.merge(groundGeo(cx,cz,90,'#3a3346'),GEO.cyl(4,4.3,.4,24,'#4a4258').tr(cx,.2,cz-6));const r=PR(11);
      for(let i=0;i<14;i++){const a=Math.PI+i/13*Math.PI,R=16+r()*4,hh=5+r()*9;g.add(GEO.box(4+r()*2,hh,4,'#251f36').tr(cx+Math.cos(a)*R,hh/2,cz+Math.sin(a)*R));}
      for(let i=0;i<5;i++)g.add(GEO.box(2,1,1.2,'#5a3a2a').tr(cx-6+i*3,.5,cz-3),GEO.box(2.4,.15,1.6,['#b04a3a','#3a6ab0','#b0903a','#4ab07a','#8a4ab0'][i]).tr(cx-6+i*3,2.1,cz-3),GEO.cyl(.04,.04,1.1,4,'#2a2a2a').tr(cx-6+i*3-1,1.55,cz-3));
      for(let i=0;i<8;i++){const a=Math.PI+(i+.5)/8*Math.PI;g.add(GEO.cyl(.06,.08,3.2,6,'#1a1622').tr(cx+Math.cos(a)*11,1.6,cz+Math.sin(a)*11));}return g;});
    const gl=MESH.get('pz_gl',()=>{const g=new Geo();const r=PR(11);for(let i=0;i<14;i++){const a=Math.PI+i/13*Math.PI,R=16+r()*4,hh=5+r()*9;r();for(let k=0;k<10;k++)if(r()<.5)g.add(GEO.box(.4,.5,.05,'#ffd08a').tr(cx+Math.cos(a)*(R-2.05)+(r()-.5)*3,1+r()*(hh-2),cz+Math.sin(a)*(R-2.05)));}
      for(let i=0;i<8;i++){const a=Math.PI+(i+.5)/8*Math.PI;g.add(GEO.sph(.22,8,'#ffd08a').tr(cx+Math.cos(a)*11,3.3,cz+Math.sin(a)*11));}g.add(GEO.disc(3.8,24,'#5ab0ff').tr(cx,.42,cz-6));return g;});
    const gate=MESH.get('fg_gate',()=>gateGeo(20,'#d8d8e8'));
    return{draw(t){R3.draw(st,mat(0,0,0));R3.draw(gl,mat(0,0,0),{mode:1});R3.draw(gate,mat(cx,60,cz-140,0,1,1,1,Math.PI/2-.4,t*.03),{mode:1,tint:'#b8b8d8'});}};
  }};
/* ================= 유니티 하우스 (경보 포함) ================= */
function unityBuild(o,alert){const cx=o.w/2,cz=o.h/2;
  const st=MESH.get('un_st',()=>{const g=GEO.merge(groundGeo(cx,cz,40,'#3a2a1e'),GEO.box(30,9,.6,'#2a1d14').tr(cx,4.5,cz-9),GEO.box(.6,9,24,'#2a1d14').tr(cx-12,4.5,cz),GEO.box(.6,9,24,'#2a1d14').tr(cx+12,4.5,cz),
    GEO.box(10.4,6.4,.3,'#0a0e18').tr(cx,4.8,cz-8.6));
    for(let i=0;i<4;i++){const x=cx-7.5+i*5;g.add(GEO.box(3.5,.12,1.4,'#5a3e2a').tr(x,.9,cz-3),GEO.box(.1,.9,.1,'#3a2a1e').tr(x-1.5,.45,cz-3),GEO.box(.1,.9,.1,'#3a2a1e').tr(x+1.5,.45,cz-3));}return g;});
  const scr=MESH.get('un_scr',()=>GEO.box(10,6,.05,'#ffffff').tr(cx,4.8,cz-8.4));
  const lamps=MESH.get('un_lp',()=>{const g=new Geo();for(let i=0;i<5;i++)g.add(GEO.sph(.3,8,'#ffd08a').tr(cx-8+i*4,7,cz-2));return g;});
  return{draw(t){R3.draw(st,mat(0,0,0));R3.draw(lamps,mat(0,0,0),{mode:1});
    const k=alert?.5+.5*Math.sin(t*6):0;
    R3.draw(scr,mat(0,0,0),{mode:1,tint:alert?[1,.15+.1*k,.18,1]:[.25,.55,.9,1]});
    if(alert){R3.env.ambTop=[.45+.4*k,.18,.16];R3.env.lightCol=[.9+.3*k,.4,.35];R3.draw(FX.m.sph,mat(cx,6,cz-4,0,9),{mode:2,tint:'#ff1a2a',a:.08+.08*k});}}};
}
BACKGROUNDS.unity={name:'유니티 하우스',cfg:cfgOf({sky:['#2b1c12','#0e0906'],fog:'#1a120c',fogN:15,fogF:50,lightCol:'#ffd8b0',ambTop:'#6a4a34',ambBot:'#20160e'}),
  cast:[{id:'eden',dx:-.9,dz:0,face:Math.PI/2+.2},{id:'nesis',dx:.9,dz:.2,face:Math.PI/2-.2}],build(o){return unityBuild(o,false);}};
BACKGROUNDS.alert={name:'유니티 하우스 — 경보',cfg:cfgOf({sky:['#2b1012','#0e0606'],fog:'#1a0c0c',fogN:15,fogF:50,lightCol:'#ff8a7a',ambTop:'#6a2a24',ambBot:'#200c0c'}),
  cast:[{id:'eden',dx:-.9,dz:0,face:Math.PI/2+.2},{id:'nesis',dx:.9,dz:.2,face:Math.PI/2-.2}],build(o){return unityBuild(o,true);}};
/* ================= 제1 전초기지 ================= */
BACKGROUNDS.outpost={name:'제1 전초기지',cfg:cfgOf({sky:['#6a2a1a','#1a0c08'],fog:'#2a1410',fogN:20,fogF:100,light:[.6,-.8,-.3],lightCol:'#ffb090',ambTop:'#6a3a2c',ambBot:'#1e100c'}),
  cast:[{id:'eden',dx:-.9,dz:0,face:Math.PI/2+.2},{id:'nesis',dx:.9,dz:.2,face:Math.PI/2-.2},{id:'rexor',dx:-3,dz:-1.5,face:Math.PI/2+.5},{id:'contusus',dx:2.8,dz:-1.2,face:Math.PI/2-.5},{id:'tumultus',dx:4.2,dz:-2.2,face:Math.PI/2-.6}],
  build(o){const w=o.w,h=o.h,cx=w/2,cz=h/2,a=o.arena;
    const st=MESH.get('op_st'+w+'_'+h,()=>{const g=GEO.merge(groundGeo(cx,cz,100,'#3a2a22'));const r=PR(21);
      const R=Math.max(w,h)*.7+6;for(let i=0;i<22;i++){const an=i/22*Math.PI*2;g.add(GEO.box(4,1.4,1.2,'#5a4a3a').ry(-an).tr(cx+Math.cos(an)*R,.7,cz+Math.sin(an)*R));}
      for(let i=0;i<4;i++){const an=i/4*Math.PI*2+.4;g.add(GEO.cyl(.8,1,9,6,'#3a3036').tr(cx+Math.cos(an)*(R+4),4.5,cz+Math.sin(an)*(R+4)),GEO.box(3,1.4,3,'#4a3e3a').tr(cx+Math.cos(an)*(R+4),9.5,cz+Math.sin(an)*(R+4)));}
      for(let i=0;i<30;i++)g.add(GEO.box(1+r()*2,.15,1+r()*2,'#2e2018').ry(r()*3).tr(cx+(r()-.5)*w*.9,.02,cz+(r()-.5)*h*.9));
      if(a)g.add(wallGeo(w,h,'#4a3a30'));return g;});
    const gl=MESH.get('op_gl'+w+'_'+h,()=>{const g=GEO.torus(Math.max(w,h)*.7+6,.08,64,4,'#ffb36b').tr(cx,6,cz);if(a)g.add(wallGlow(w,h,'#ff8a5a'));return g;});
    const gen=a?null:PROPS.generator.build();const m=motes(cx,cz,50,40,'#ffb08a',1);
    return{draw(t){R3.draw(st,mat(0,0,0));R3.draw(gl,mat(0,0,0),{mode:1,a:.6+.3*Math.sin(t*4),tint:[1,1,1,.7]});if(gen)gen.draw(cx,cz-5,t,.2,false);m(t);}};
  }};
/* ================= 절벽 위 (카로 · 오사) ================= */
BACKGROUNDS.cliff={name:'전장 너머 절벽',cfg:cfgOf({sky:['#2a1240','#07040c'],fog:'#140a20',fogN:10,fogF:60,lightCol:'#a890c8',ambTop:'#3a2a52',ambBot:'#0c0812'}),
  cast:[{id:'karo',dx:-.7,dz:0,face:-Math.PI/2+.3,y:2.2},{id:'osa',dx:.8,dz:-.3,face:-Math.PI/2-.2,y:2.2}],
  build(o){const cx=o.w/2,cz=o.h/2;
    const st=MESH.get('cl_st',()=>{const g=GEO.merge(groundGeo(cx,cz,90,'#0a0710'),GEO.box(8,4.4,6,'#120d18').tr(cx,0,cz-.5),GEO.cone(4,9,6,'#100b16').tr(cx-7,4.5,cz-4),GEO.cone(5,12,6,'#0e0a14').tr(cx+8,6,cz-6));
      g.add(GEO.disc(40,24,'#1a0e10').tr(cx,-5,cz+30));return g;});
    const fire=MESH.get('cl_f',()=>{const g=new Geo();const r=PR(4);for(let i=0;i<20;i++)g.add(GEO.sph(.3+r()*.4,6,'#ff7a3b').tr(cx+(r()-.5)*40,-4.6,cz+20+r()*25));return g;});
    const m=motes(cx,cz,40,20,'#c9a4ff',1);
    return{draw(t){R3.draw(st,mat(0,0,0));R3.draw(fire,mat(0,0,0),{mode:2,a:.6+.3*Math.sin(t*5)});m(t);}};
  }};
/* ================= 우니타스 몰레스 회의실 ================= */
BACKGROUNDS.moles={name:'우니타스 몰레스',cfg:cfgOf({sky:['#1d2129','#08090c'],fog:'#101318',fogN:12,fogF:45,lightCol:'#c0d0e8',ambTop:'#3a4454',ambBot:'#0e1014'}),
  cast:[{id:'eden',dx:-1.6,dz:1.2,face:-Math.PI/2+.3},{id:'nesis',dx:-.4,dz:1.6,face:-Math.PI/2}],
  build(o){const cx=o.w/2,cz=o.h/2;
    const st=MESH.get('mo_st',()=>{const g=GEO.merge(groundGeo(cx,cz,40,'#22262e'),GEO.cyl(2.6,2.6,.9,24,'#2a2f38').tr(cx,.45,cz-1.5),GEO.box(30,10,.6,'#1a1e26').tr(cx,5,cz-10),GEO.box(.6,10,24,'#1a1e26').tr(cx-12,5,cz),GEO.box(.6,10,24,'#1a1e26').tr(cx+12,5,cz));
      for(let i=0;i<10;i++)g.add(GEO.box(.5,10,.4,'#2a2f38').tr(cx-11+i*2.4,5,cz-9.6));
      for(let i=0;i<6;i++){const a=i/6*Math.PI*2+.5;g.add(GEO.box(.6,1,.6,'#2a3040').tr(cx+Math.cos(a)*3.6,.5,cz-1.5+Math.sin(a)*3.6));}return g;});
    return{draw(t){R3.draw(st,mat(0,0,0));
      R3.draw(FX.m.disc,mat(cx,.92,cz-1.5,0,2.4,1,2.4),{mode:1,tint:'#2a6aa8'});
      for(let i=0;i<4;i++)R3.draw(FX.m.edge,mat(cx,1.1+i*.35,cz-1.5,t*(i%2?1:-1)*.5,.6+i*.45,1,.6+i*.45),{mode:2,tint:'#7fd0ff',a:.6});}};
  }};
/* ================= 제5 외곽 폐기 구역 / 파시스 강림 ================= */
function wasteBuild(o,ph){const w=o.w,h=o.h,cx=w/2,cz=h/2,a=o.arena;
  const st=MESH.get('ws_st'+w+'_'+h,()=>{const g=GEO.merge(groundGeo(cx,cz,110,ph?'#1e1426':'#211a28'));const r=PR(31);const R=Math.max(w,h)*.7+5;
    for(let i=0;i<26;i++){const an=r()*Math.PI*2,d=R+r()*20;g.add(GEO.cone(3+r()*4,3+r()*7,6,r()<.5?'#2a2232':'#1e1828').tr(cx+Math.cos(an)*d,1.5,cz+Math.sin(an)*d));}
    for(let i=0;i<40;i++)g.add(GEO.box(.4+r()*1.4,.2+r()*.6,.4+r()*1.4,r()<.5?'#3a3442':'#4a4252').ry(r()*3).tr(cx+(r()-.5)*w*.95,.15,cz+(r()-.5)*h*.95));
    if(a)g.add(wallGeo(w,h,'#2e2638'));return g;});
  const gl=MESH.get('ws_gl'+w+'_'+h,()=>a?wallGlow(w,h,'#b46cff'):GEO.ring(.1,.2,4,'#000'));
  const gate=MESH.get('ws_gate',()=>gateGeo(14,'#c9a4ff'));
  const r=PR(77),shards=[];for(let i=0;i<24;i++)shards.push([cx+(r()-.5)*40,4+r()*10,cz+(r()-.5)*40,r()]);
  const m=motes(cx,cz,60,40,'#d0a8ff',1);
  return{draw(t){R3.draw(st,mat(0,0,0));R3.draw(gl,mat(0,0,0),{mode:1});
    if(!ph){R3.draw(gate,mat(cx,18,cz-60,0,1,1,1,Math.PI/2,t*.2),{mode:1});R3.draw(FX.m.disc,mat(cx,18,cz-60.3,0,12,1,12,Math.PI/2),{mode:1,tint:'#0a0612'});}
    else{for(let i=0;i<6;i++)R3.draw(FX.m.torus,mat(cx,26+i*.6,cz,t*(.3+i*.05)*(i%2?1:-1),8+i*5,1,8+i*5,.08*i,0),{mode:2,tint:i%2?'#d08cff':'#7a3fff',a:.45});
      R3.draw(FX.m.sph,mat(cx,26,cz,0,6),{mode:2,tint:'#c084fc',a:.25});
      for(const s of shards)R3.draw(FX.m.box,mat(s[0],s[1]+Math.sin(t+s[3]*7)*.6,s[2],t*s[3]*2,.3,.08,1.2,t*s[3]),{fl:0});}
    m(t);}};
}
BACKGROUNDS.waste={name:'제5 외곽 폐기 구역',cfg:cfgOf({sky:['#2a1a3e','#0a0610'],fog:'#170f22',fogN:18,fogF:95,lightCol:'#c8b0e8',ambTop:'#4a3a66',ambBot:'#120c18'}),
  cast:[{id:'eden',dx:-.9,dz:0,face:-Math.PI/2+.2},{id:'nesis',dx:.9,dz:.2,face:-Math.PI/2-.2},{id:'rexor',dx:-3,dz:1.2,face:-Math.PI/2},{id:'abi',dx:-2.5,dz:-8,face:Math.PI/2},{id:'mor',dx:2.5,dz:-8.5,face:Math.PI/2}],
  build(o){return wasteBuild(o,false);}};
BACKGROUNDS.phasis={name:'파시스 강림',cfg:cfgOf({sky:['#4a1866','#0e0614'],fog:'#22102e',fogN:18,fogF:90,lightCol:'#e0b8ff',ambTop:'#5a3a7a',ambBot:'#160c1e'}),
  cast:[{id:'eden',dx:-.9,dz:0,face:-Math.PI/2+.2},{id:'nesis',dx:.9,dz:.2,face:-Math.PI/2-.2},{id:'phasis',dx:0,dz:-9,face:Math.PI/2}],
  build(o){return wasteBuild(o,true);}};

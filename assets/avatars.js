/* ==================================================================
   액팅 소울 : 0 — 신들의 종언 (시즌 2 체험판)  v0.5.0
   assets/avatars.js — 아바타 캐릭터 (주인공 · 아군 · 적 · 보스)

   새 캐릭터 추가 방법
   AVATARS['아이디'] = {
     name:'표시 이름',
     kind:'dual'|'great'|'spear'|'chop'|'cast'|'beast',   // 공격 동작 종류
     shadow:0.5,                                           // 발밑 그림자 반지름(m)
     build(){ return rig },   // humanoid({...}) 또는 직접 만든 노드
     anim(rig,s){}            // (선택) 기본은 animHuman
   };
   rig.root 를 게임이 움직이고, anim()이 팔다리를 움직인다.
   s = {t, move(0~1), pose:'atk'|'heavy'|'cast'|'dash'|'hurt'|'jump'|'plunge'|null, p(동작 진행 0~1), sw(±1 휘두르는 방향), air(공중이면 true)}
   나중에 3D 모델 파일로 바꿀 때는 build()와 anim()만 교체하면 된다.
   ================================================================== */
'use strict';
const AVATARS={};
const TAU_=Math.PI*2;
const ease=p=>1-Math.pow(1-Math.max(0,Math.min(1,p)),3);
const lp=(a,b,t)=>a+(b-a)*t;

/* ---------- 사람형 리그 ---------- */
function humanoid(o){
  const K='av_'+o.key+'_',m=(n,fn)=>MESH.get(K+n,fn),bw=o.bulk||1;
  const R={weapons:[]};
  R.root=Node();R.body=addTo(R.root,Node());
  R.hips=addTo(R.body,Node(m('hips',()=>GEO.box(.3*bw,.16,.2*bw,o.pants))),[0,.92,0]);
  for(const [s,nm] of [[-1,'L'],[1,'R']]){
    const leg=addTo(R.hips,Node(m('thigh',()=>GEO.cyl(.075*bw,.065*bw,.46,8,o.pants).tr(0,-.23,0))),[s*.09*bw,-.02,0]);
    const shin=addTo(leg,Node(m('shin',()=>GEO.merge(GEO.cyl(.062*bw,.05*bw,.42,8,o.pants).tr(0,-.21,0),GEO.box(.11*bw,.08,.22,o.boots||'#14141a').tr(0,-.44,.04)))),[0,-.46,0]);
    R['leg'+nm]=leg;R['shin'+nm]=shin;
  }
  if(o.tail)addTo(R.hips,Node(m('tail',()=>GEO.cyl(.18*bw,(o.skirt?.38:.26)*bw,o.skirt?.8:.56,14,o.tail,false).tr(0,o.skirt?-.34:-.24,0).sc(1,1,o.skirt?1:.8))));
  R.torso=addTo(R.hips,Node(m('torso',()=>{const g=GEO.merge(GEO.cyl(.19*bw,.15*bw,.5,12,o.coat).sc(1,1,.64).tr(0,.27,0),GEO.box(.38*bw,.09,.21*bw,o.coat2||o.coat).tr(0,.5,0));
    if(o.collar)g.add(GEO.cyl(.1,.13,.1,10,o.collar).tr(0,.56,0));if(o.plates)g.add(GEO.box(.2,.12,.26,o.plates).tr(.28*bw,.52,0),GEO.box(.2,.12,.26,o.plates).tr(-.28*bw,.52,0),GEO.box(.3*bw,.26,.05,o.plates).tr(0,.3,.13*bw));return g;})),[0,.06,0]);
  if(o.neon)addTo(R.torso,Node(m('neon',()=>GEO.merge(GEO.box(.016,.42,.01,'#fff').tr(.065,.27,.122*bw),GEO.box(.016,.42,.01,'#fff').tr(-.065,.27,.122*bw),GEO.box(.3*bw,.014,.01,'#fff').tr(0,.47,.125*bw))),{mode:1,tint:hex(o.neon).slice()}));
  if(o.core)addTo(R.torso,Node(m('core',()=>GEO.sph(.07,10,'#fff').tr(0,.32,.16*bw)),{mode:1,tint:hex(o.core).slice(),name:'core'}));
  // 목 + 얼굴 + 머리카락을 하나의 메시로 합쳐 그리기 횟수를 줄인다
  R.head=addTo(R.torso,Node(m('head',()=>{
    const g=GEO.merge(GEO.cyl(.05,.055,.1,8,o.skin).tr(0,.04,0),GEO.sph(.115,12,o.skin).sc(1,1.08,1).tr(0,.17,0),
      GEO.sph(.128,12,o.hair).sc(1.03,.96,1.06).tr(0,.205,-.018),GEO.box(.25,.07,.06,o.hair).tr(0,.27,.09),
      GEO.box(.05,.2,.08,o.hair).tr(.117,.13,.02),GEO.box(.05,.2,.08,o.hair).tr(-.117,.13,.02));
    if(o.hairLong)g.add(GEO.box(.25,o.hairLong,.07,o.hair).tr(0,.2-o.hairLong/2,-.1));
    if(o.bun)g.add(GEO.sph(.075,10,o.hair).tr(0,.3,-.13));
    if(o.hairTip)g.add(GEO.box(.054,.06,.084,o.hairTip).tr(.117,.02,.02),GEO.box(.054,.06,.084,o.hairTip).tr(-.117,.02,.02));
    if(o.streak)g.add(GEO.box(.045,.09,.066,o.streak).tr(.065,.26,.1),GEO.box(.03,.22,.075,o.streak).tr(.118,.12,.02));
    if(o.helmet)g.add(GEO.sph(.14,10,o.helmet).sc(1,.9,1.1).tr(0,.2,0),GEO.box(.2,.03,.02,'#b46cff').tr(0,.18,.14));
    return g;})),[0,.54,0]);
  addTo(R.head,Node(m('eyes',()=>GEO.merge(GEO.box(.036,.02,.01,'#fff').tr(.045,.17,.109),GEO.box(.036,.02,.01,'#fff').tr(-.045,.17,.109))),{mode:1,tint:hex(o.eye||'#6a5cff').slice()}));
  for(const [s,nm] of [[-1,'L'],[1,'R']]){
    const arm=addTo(R.torso,Node(m('upper',()=>GEO.cyl(.06*bw,.05*bw,.3,8,o.sleeve||o.coat).tr(0,-.15,0))),[s*.235*bw,.47,0]);
    const fore=addTo(arm,Node(m('fore',()=>GEO.merge(GEO.cyl(.05*bw,.043*bw,.27,8,o.sleeve||o.coat).tr(0,-.135,0),GEO.sph(.048*bw,8,o.glove||o.skin).tr(0,-.29,0)))),[0,-.3,0]);
    const hand=addTo(fore,Node(),[0,-.29,0]); // 무기를 붙이는 지점 (메시 없음)
    R['arm'+nm]=arm;R['fore'+nm]=fore;R['hand'+nm]=hand;
  }
  if(o.scale)R.root.s=[o.scale,o.scale,o.scale];
  return R;
}
/* 무기를 손(또는 등)에 붙인다 */
function equip(R,wid,where,extra){
  const d=WEAPONS[wid];if(!d)return null;
  const w=d.build();w.r=d.rest.slice();
  const host=where==='L'?R.handL:where==='back'?R.torso:R.handR;
  if(where==='back'){w.p=[.08,.62,-.16];w.r=[0,0,2.6];}
  if(extra)Object.assign(w,extra);
  host.ch.push(w);R.weapons.push({node:w,def:d,where});return w;
}

/* 두 무기를 가진 캐릭터: 하나는 손에, 하나는 등에. setHeld 로 바꿔 쥔다 */
function equipPair(R,ids,held){R.wpn={};for(const id of ids)R.wpn[id]=WEAPONS[id].build();setHeld(R,held||ids[0]);}
function setHeld(R,id){
  for(const w of R.weapons){const host=w.where==='back'?R.torso:R.handR,i=host.ch.indexOf(w.node);if(i>=0)host.ch.splice(i,1);}
  R.weapons=[];
  for(const wid in R.wpn){const n=R.wpn[wid],d=WEAPONS[wid];n.vis=true;
    if(wid===id){n.p=[0,0,0];n.r=d.rest.slice();R.handR.ch.push(n);R.weapons.push({node:n,def:d,where:'R'});}
    else{const b=d.back||{p:[.14,.7,-.17],r:[.15,0,-.5]};n.p=b.p.slice();n.r=b.r.slice();R.torso.ch.push(n);R.weapons.push({node:n,def:d,where:'back'});}}
  R.held=id;R.kind=WEAPONS[id].kind||null;
}
/* ---------- 기본 사람형 동작 ---------- */
function animHuman(R,s,kind){
  const t=s.t||0,mv=s.move||0,ph=t*10.5,sw=Math.sin(ph)*mv;
  R.body.r[0]=R.body.r[1]=R.body.r[2]=0;R.body.p[0]=R.body.p[2]=0;
  R.body.p[1]=Math.abs(Math.cos(ph))*.045*mv+(s.float||0);
  R.legL.r=[sw*.75,0,0];R.legR.r=[-sw*.75,0,0];
  R.shinL.r=[Math.max(0,-Math.sin(ph))*.9*mv+.05,0,0];R.shinR.r=[Math.max(0,Math.sin(ph))*.9*mv+.05,0,0];
  R.torso.r=[.1*mv+Math.sin(t*2)*.02,0,0];R.head.r=[0,0,0];
  R.armL.r=[-sw*.6,0,-.12];R.armR.r=[sw*.6,0,.12];R.foreL.r=[-.25,0,0];R.foreR.r=[-.25,0,0];
  let wb=0;const p=s.p||0,e=ease(p),dir=s.sw||1;
  switch(s.pose){
    case 'atk':
      wb=1;
      if(kind==='dual'){R.torso.r[1]=(1-2*e)*1.0*dir;R.armR.r=[-1.5,0,.1];R.armL.r=[-1.3,0,-.1];R.foreL.r=R.foreR.r=[0,0,0];}
      else if(kind==='great'){R.torso.r[1]=(1-2*e)*1.3*dir;R.armR.r=[-1.35,0,.25];R.armL.r=[-1.35,0,-.25];R.foreL.r=R.foreR.r=[-.15,0,0];}
      else if(kind==='spear'){R.armR.r=[-1.55,0,0];R.foreR.r=[0,0,0];R.armL.r=[-1.2,0,-.3];R.body.p[2]=Math.sin(p*Math.PI)*.35;R.torso.r[0]=.25;}
      else if(kind==='chop'){R.armR.r=[lp(-2.8,-.7,e),0,.1];R.foreR.r=[0,0,0];R.torso.r[0]=lp(-.2,.4,e);}
      else{R.armR.r=[-1.6,0,0];R.armL.r=[-1.6,0,0];R.foreL.r=R.foreR.r=[0,0,0];wb=0;}
      R.legL.r[0]=-.35;R.legR.r[0]=.25;break;
    case 'heavy':
      wb=1;
      if(kind==='dual'){R.body.r[1]=e*TAU_*1.25;R.armL.r=[-.15,0,-1.45];R.armR.r=[-.15,0,1.45];R.foreL.r=R.foreR.r=[0,0,0];}
      else{const up=Math.min(1,p/.45),dn=Math.max(0,Math.min(1,(p-.45)/.18));
        const a=dn>0?lp(-3.0,-.6,dn):lp(-.5,-3.0,up);R.armR.r=[a,0,.2];R.armL.r=[a,0,-.2];R.foreL.r=R.foreR.r=[-.1,0,0];R.torso.r[0]=dn>0?lp(-.3,.6,dn):lp(0,-.3,up);
        R.legL.r[0]=-.5;R.legR.r[0]=.4;}
      break;
    case 'cast':R.armR.r=[-1.6,0,.15];R.armL.r=[-1.6,0,-.15];R.foreL.r=R.foreR.r=[-.1,0,0];R.torso.r[0]=-.08;break;
    case 'dash':R.torso.r[0]=.6;R.armL.r=[1.0,0,-.25];R.armR.r=[1.0,0,.25];R.legL.r[0]=-.7;R.legR.r[0]=.6;R.shinR.r[0]=.9;break;
    case 'hurt':R.torso.r[0]=-.4;R.head.r[0]=-.3;R.armL.r[2]=-.5;R.armR.r[2]=.5;break;
    case 'jump':R.armL.r=[-.7,0,-.7];R.armR.r=[-.7,0,.7];R.torso.r[0]=.1;break;
    case 'plunge':wb=1;R.armR.r=[-.45,0,.12];R.armL.r=[-.45,0,-.12];R.foreL.r=R.foreR.r=[0,0,0];R.torso.r[0]=.65;R.head.r[0]=.3;break;
  }
  if(s.air){R.legL.r=[-.95,0,0];R.shinL.r=[1.5,0,0];R.legR.r=[-.35,0,0];R.shinR.r=[1.1,0,0];}
  if(s.float){R.legL.r=[.15,0,-.05];R.legR.r=[.25,0,.05];R.shinL.r=[.3,0,0];R.shinR.r=[.2,0,0];}
  for(const w of R.weapons){if(w.where==='back')continue;const r=w.def.rest;const k=1-wb;w.node.r[0]=r[0]*k;w.node.r[1]=r[1]*k;w.node.r[2]=r[2]*k;}
}
function updWeapons(R,t){for(const w of R.weapons)if(w.def.update)w.def.update(w.node,t);}

/* ================= 주인공 ================= */
AVATARS.eden={
  name:'대행자 이든',kind:'dual',heavy:'spin',shadow:.45,
  build(){const R=humanoid({key:'eden',skin:'#f2e2d8',hair:'#15151d',hairTip:'#c9ccd8',coat:'#17171f',coat2:'#23232f',pants:'#101015',tail:'#17171f',
      neon:'#5fd0ff',eye:'#a98bff',collar:'#23232f',glove:'#1a1a22'});
    equipPair(R,['sentia','sensus']);return R;},
};
AVATARS.nesis={
  name:'집행자 네시스',kind:'great',heavy:'slam',shadow:.45,
  build(){const R=humanoid({key:'nesis',skin:'#f4e6de',hair:'#eef2f8',streak:'#3b9dff',bun:1,hairLong:.36,coat:'#e9eef6',coat2:'#3b6fd8',pants:'#1d2333',
      tail:'#dfe7f2',skirt:1,neon:'#9fdcff',eye:'#5fb8ff',sleeve:'#dfe6f0',glove:'#2b3550',boots:'#2b3550'});
    equipPair(R,['eruptio','klausroom']);return R;},
};
/* ================= 아군 (분노의 우니타스) ================= */
AVATARS.rexor={name:'렉소르',kind:'chop',shadow:.5,
  build(){const R=humanoid({key:'rexor',skin:'#e8cfc0',hair:'#3a1d18',coat:'#3a1f1c',coat2:'#ff6b5b',pants:'#1c1414',tail:'#3a1f1c',neon:'#ff6b5b',eye:'#ffb0a0',bulk:1.25,scale:1.08,plates:'#4a4f5a'});equip(R,'axe','R');return R;}};
AVATARS.contusus={name:'콘투수스',kind:'chop',shadow:.42,
  build(){const R=humanoid({key:'contusus',skin:'#ecd6c8',hair:'#5a2a1c',coat:'#33201c',coat2:'#ff8f6b',pants:'#1c1414',neon:'#ff8f6b',eye:'#ffc0a0'});equip(R,'blade','R');return R;}};
AVATARS.tumultus={name:'투몰투스',kind:'spear',shadow:.42,
  build(){const R=humanoid({key:'tumultus',skin:'#ead2c2',hair:'#2a1a16',coat:'#2e1d1a',coat2:'#ffa07a',pants:'#1c1414',tail:'#2e1d1a',neon:'#ffa07a',eye:'#ffc8a0'});equip(R,'spear','R');return R;}};
/* ================= 관찰자 (컷신용) ================= */
AVATARS.karo={name:'카로',kind:'cast',shadow:.4,build(){return humanoid({key:'karo',skin:'#1a1420',hair:'#0c0910',hairLong:.4,coat:'#120d18',pants:'#0a070d',tail:'#120d18',skirt:1,eye:'#d08cff'});}};
AVATARS.osa={name:'오사',kind:'cast',shadow:.45,build(){return humanoid({key:'osa',skin:'#1a1420',hair:'#0c0910',coat:'#120d18',pants:'#0a070d',eye:'#b07cff',bulk:1.2,scale:1.1});}};

/* ================= 적 ================= */
/* 시뮬레이션 홀로그램 (게임이 반투명·발광으로 그린다) */
AVATARS.holo={name:'강화 공허체 (시뮬)',kind:'chop',shadow:.4,holo:1,
  build(){return humanoid({key:'holo',skin:'#7fe6ff',hair:'#3fb8ff',coat:'#2a9ad8',pants:'#1d6fa8',eye:'#ffffff',bulk:1.05});}};
AVATARS.dummy={...AVATARS.holo,name:'훈련용 홀로그램'};
AVATARS.holobrute={name:'강화 공허체 · 거구 (시뮬)',kind:'chop',heavy:'slam',shadow:.8,holo:1,
  build(){return humanoid({key:'holob',skin:'#7fe6ff',hair:'#3fb8ff',coat:'#2a9ad8',pants:'#1d6fa8',eye:'#ffffff',bulk:1.7,scale:1.45,plates:'#5fd0ff'});}};
AVATARS.brute={name:'침식체 · 금속 외피',kind:'chop',heavy:'slam',shadow:.85,
  build(){return humanoid({key:'brute',skin:'#5a606e',hair:'#2a2e38',coat:'#4a505e',coat2:'#7d8597',pants:'#2a2e38',eye:'#ff5c3b',bulk:1.7,scale:1.5,plates:'#9aa3b5',core:'#ff7a3b'});}};

/* 4족 변이체 (금속 발톱) */
function beast(o){
  const K='av_'+o.key+'_',m=(n,fn)=>MESH.get(K+n,fn);const R={weapons:[]};
  R.root=Node();R.body=addTo(R.root,Node());
  R.trunk=addTo(R.body,Node(m('trunk',()=>{const g=GEO.sph(.5,12,o.col).sc(.62,.5,1).tr(0,0,0);for(let i=0;i<5;i++)g.add(GEO.cone(.07,.3,6,o.spike).tr(0,.32,-.3+i*.15).rx(-.3));return g;})),[0,.62,0]);
  R.head=addTo(R.trunk,Node(m('head',()=>GEO.merge(GEO.sph(.2,10,o.col).sc(1,.8,1.25),GEO.cone(.05,.18,6,o.spike).tr(.1,.15,0),GEO.cone(.05,.18,6,o.spike).tr(-.1,.15,0)))),[0,.08,.5]);
  addTo(R.head,Node(m('eyes',()=>GEO.merge(GEO.box(.05,.03,.02,'#fff').tr(.07,.04,.22),GEO.box(.05,.03,.02,'#fff').tr(-.07,.04,.22))),{mode:1,tint:hex(o.eye).slice()}));
  R.legs=[];
  for(const [x,z,front] of [[-.26,.32,1],[.26,.32,1],[-.26,-.32,0],[.26,-.32,0]]){
    const leg=addTo(R.trunk,Node(m(front?'legF':'legB',()=>{const g=GEO.cyl(.06,.045,.6,8,o.leg).tr(0,-.3,0);if(front)g.add(GEO.cone(.04,.25,6,o.claw).rx(Math.PI/2).tr(-.04,-.6,.12),GEO.cone(.04,.25,6,o.claw).rx(Math.PI/2).tr(.04,-.6,.12));return g;})),[x,-.05,z]);
    leg.front=front;R.legs.push(leg);
  }
  if(o.scale)R.root.s=[o.scale,o.scale,o.scale];
  return R;
}
function animBeast(R,s){
  const t=s.t||0,mv=s.move||0,ph=t*13;R.body.p=[0,Math.abs(Math.sin(ph))*.05*mv,0];R.body.r=[0,0,0];
  R.legs.forEach((l,i)=>{l.r=[Math.sin(ph+(i===0||i===3?0:Math.PI))*.7*mv,0,0];});
  R.trunk.r=[0,0,0];R.head.r=[0,0,0];
  if(s.pose==='atk'){const e=Math.sin(Math.min(1,s.p||0)*Math.PI);R.body.p[2]=e*.5;R.trunk.r[0]=-.3*e;R.legs[0].r[0]=R.legs[1].r[0]=-1.4*e;R.head.r[0]=.3*e;}
  if(s.pose==='hurt')R.trunk.r[0]=.25;
}
AVATARS.claw={name:'침식체 · 금속 발톱',kind:'beast',shadow:.55,anim:animBeast,
  build(){return beast({key:'claw',col:'#8a92a4',spike:'#c8ccd6',leg:'#5a6170',claw:'#e6e9ef',eye:'#ff3b6b'});}};

/* 침식 폴른 (원거리 산성탄) */
AVATARS.spitter={name:'침식 폴른',kind:'beast',shadow:.5,
  build(){
    const R=humanoid({key:'spit',skin:'#4a3a62',hair:'#2a1f3a',coat:'#3a2c52',pants:'#2a1f3a',eye:'#7cff9e',bulk:1.1});
    R.sac=addTo(R.torso,Node(MESH.get('av_spit_sac',()=>GEO.sph(.22,12,'#c77dff')),{mode:2,tint:[1,1,1,.7],name:'sac'}),[0,.42,-.2]);
    return R;},
  anim(R,s){animHuman(R,s,'cast');R.torso.r[0]+=.55;R.head.r[0]=-.4;R.armL.r[0]+= .3;R.armR.r[0]+=.3;
    const k=1+.15*Math.sin((s.t||0)*6)+(s.pose==='cast'?.4*(s.p||0):0);R.sac.s=[k,k,k];},
};
/* 금속 사도 (파시스 소환) */
AVATARS.minion={name:'금속 사도',kind:'beast',shadow:.35,
  build(){const R={weapons:[]};R.root=Node();R.body=addTo(R.root,Node());
    R.core=addTo(R.body,Node(MESH.get('av_min',()=>{const g=GEO.sph(.26,10,'#cbbbe8');for(let i=0;i<10;i++){const a=i/10*TAU_;g.add(GEO.cone(.06,.3,5,'#efe6ff').tr(0,.32,0).rz(Math.cos(a)*1.3).rx(Math.sin(a)*1.3));}return g;})),[0,.9,0]);
    addTo(R.core,Node(MESH.get('av_min_e',()=>GEO.sph(.09,8,'#fff').tr(0,0,.22)),{mode:1,tint:hex('#c084fc').slice()}));
    return R;},
  anim(R,s){const t=s.t||0;R.core.p[1]=.9+Math.sin(t*4)*.12;R.core.r=[0,t*2,0];R.body.p=[0,0,s.pose==='atk'?Math.sin((s.p||0)*Math.PI)*.6:0];},
};

/* ================= 보스 ================= */
AVATARS.abi={name:'아비',kind:'spear',shadow:.45,
  build(){const R=humanoid({key:'abi',skin:'#efe0f5',hair:'#3a1f5c',hairLong:.55,coat:'#2a1640',coat2:'#4b2a7a',pants:'#1a0e28',tail:'#2a1640',skirt:1,eye:'#d9a8ff',neon:'#b46cff',sleeve:'#2a1640'});
    equip(R,'abiSpear','R');return R;}};
AVATARS.mor={name:'모르',kind:'great',heavy:'slam',shadow:.7,
  build(){const R=humanoid({key:'mor',skin:'#d8ccd8',hair:'#3a3a48',helmet:'#14141c',coat:'#14141c',coat2:'#2a2a36',pants:'#0e0e14',tail:'#14141c',skirt:1,eye:'#b46cff',neon:'#8a5cff',bulk:1.3,scale:1.3,plates:'#2a2a36'});
    equip(R,'morBlade','R');return R;}};
AVATARS.phasis={name:'파시스',kind:'cast',shadow:.6,
  build(){
    const R=humanoid({key:'phasis',skin:'#f7efff',hair:'#e6d2ff',hairLong:.7,coat:'#f2e6ff',coat2:'#c084fc',pants:'#6a3fa0',tail:'#e9dcff',skirt:1,eye:'#c084fc',neon:'#e3b8ff',sleeve:'#efe2ff',scale:1.25});
    R.wings=[];
    for(let i=0;i<18;i++){const s=i<9?-1:1,k=i%9;const w=WEAPONS.needle.build();
      w.p=[s*.12,.5,-.16];w.r=[0,0,s*(.55+k*.2)];w.base=w.r[2];w.k=k;w.s=[1,1+k*.12,1];R.torso.ch.push(w);R.wings.push(w);}
    R.halo=addTo(R.head,Node(MESH.get('av_ph_halo',()=>GEO.torus(.22,.015,24,6,'#ffffff')),{mode:1,tint:hex('#e3b8ff').slice()}),[0,.42,-.05],[.3,0,0]);
    return R;},
  anim(R,s){
    animHuman(R,Object.assign({},s,{float:.55+Math.sin((s.t||0)*2)*.12}),'cast');
    const t=s.t||0,open=s.pose==='cast'||s.pose==='atk'?1:0;
    for(const w of R.wings)w.r[2]=w.base*(1+.08*Math.sin(t*2+w.k)+.25*open);
    R.halo.r[1]=t*.8;
  },
};

/* ================= 에고 (호출 스킬로 나타나는 무기의 모습) =================
   설정 자료에 외형이 없어 무기 색을 입힌 반투명 인간형으로 임시 제작. 외형이 정해지면 build()만 교체. */
function egoAvatar(key,o,wid,kind){return{name:WEAPONS[wid].name,kind,shadow:.4,ego:o.glow,
  build(){const R=humanoid(Object.assign({key,skin:'#f6f4ff',pants:'#20243a',eye:'#ffffff'},o));equip(R,wid,'R');return R;}};}
AVATARS.ego_sentia=egoAvatar('ego_sentia',{hair:'#7fd8ff',hairLong:.3,coat:'#2a5f9a',coat2:'#59c8ff',neon:'#bff0ff',glow:'#59c8ff',scale:1.02},'sentia','dual');
AVATARS.ego_sensus=egoAvatar('ego_sensus',{hair:'#d8b0ff',bun:1,coat:'#5a2f8a',coat2:'#c77dff',neon:'#f0d8ff',glow:'#c77dff',scale:.85},'sensus','dual');
AVATARS.ego_klausroom=egoAvatar('ego_klausroom',{hair:'#ffffff',hairLong:.5,coat:'#d8dde6',coat2:'#f2f6ff',neon:'#ffffff',glow:'#e8f2ff',tail:'#e8ecf4',skirt:1,scale:1.08},'klausroom','dual');
AVATARS.ego_eruptio=egoAvatar('ego_eruptio',{hair:'#3d7dff',coat:'#1d2c55',coat2:'#5aa9ff',neon:'#9fd0ff',glow:'#5aa9ff',bulk:1.2,scale:1.12},'eruptio','great');

/* 공통 진입점 */
function makeAvatar(id){
  const d=AVATARS[id];const R=d.build();R.def=d;R.id=id;return R;
}
function animateAvatar(R,s){
  const d=R.def;if(d.anim)d.anim(R,s);else animHuman(R,s,s.pose==='heavy'?(d.heavy==='spin'?'dual':'great'):(R.kind||d.kind));
  updWeapons(R,s.t||0);
}

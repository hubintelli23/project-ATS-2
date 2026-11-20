/* ==================================================================
   액팅 소울 : 0 — 신들의 종언 (시즌 2 체험판)  v0.6.1
   assets/weapons.js — 무기 · 아티팩트

   새 무기 추가 방법
   WEAPONS['아이디'] = {
     name:'표시 이름', owner:'주인', desc:'설명',
     trail:'#색',            // 휘두를 때 궤적 색
     rest:[x,y,z],           // 평소 쥐는 각도 (손 기준 회전, 라디안)
     back:{p:[x,y,z],r:[x,y,z]}, // (선택) 등에 멜 때 위치·각도
     kind:'dual'|'great',    // (선택) 이 무기를 들었을 때의 공격 동작
     build(){ return 노드 } // 손잡이를 원점(0,0,0)에, 칼날은 -Y 방향으로 만든다
     update(node,t){}        // (선택) 매 프레임 반짝임 등
   };
   나중에 3D 모델 파일(GLB 등)로 바꿀 때는 build()만 교체하면 된다.
   ================================================================== */
'use strict';
const WEAPONS={};

/* 공통: 칼날 하나 (길이 L, 폭 w, 두께 d) — 손잡이 원점, -Y 방향 */
function bladeGeo(L,w,d,col,tipCol){
  const g=new Geo(),c=hex(col),t=hex(tipCol||col);
  const P=[[0,0],[w/2,-0.05],[w/2,-L*0.82],[0,-L],[-w/2,-L*0.82],[-w/2,-0.05]];
  for(const z of [d/2,-d/2]){const o=g.vc;for(const [x,y] of P)g.v(x,y,z,0,0,Math.sign(z),y<-L*0.8?t:c);g.i.push(o,o+1,o+2,o,o+2,o+3,o,o+3,o+4,o,o+4,o+5);}
  for(let k=0;k<P.length;k++){const a=P[k],b=P[(k+1)%P.length];const o=g.vc;const nx=b[1]-a[1],ny=-(b[0]-a[0]);const l=Math.hypot(nx,ny)||1;
    g.v(a[0],a[1],d/2,nx/l,ny/l,0,c);g.v(b[0],b[1],d/2,nx/l,ny/l,0,c);g.v(b[0],b[1],-d/2,nx/l,ny/l,0,c);g.v(a[0],a[1],-d/2,nx/l,ny/l,0,c);g.i.push(o,o+1,o+2,o,o+2,o+3);}
  return g;
}
function hilt(len,col,guardW,guardCol){
  return GEO.merge(GEO.cyl(.022,.022,len,8,col).tr(0,len/2,0),GEO.box(guardW,.035,.06,guardCol||'#2a2a35').tr(0,0,0),GEO.sph(.03,8,guardCol||'#2a2a35').tr(0,len,0));
}

WEAPONS.sentia={
  name:'센티아',owner:'이든',desc:'푸른 전기를 머금은 에고 웨폰. 냉철한 판단으로 적의 사각을 읽는다.',trail:'#59c8ff',rest:[-0.5,0,0.15],kind:'dual',back:{p:[.14,.7,-.17],r:[.15,0,-.5]},
  build(){
    const n=Node(MESH.get('w_sentia_h',()=>hilt(.2,'#1c2433',.16,'#3a4a66')));
    addTo(n,Node(MESH.get('w_sentia_b',()=>bladeGeo(.9,.07,.018,'#cfeeff','#ffffff')),{name:'blade'}));
    addTo(n,Node(MESH.get('w_sentia_g',()=>bladeGeo(.92,.11,.004,'#59c8ff')),{mode:2,tint:[1,1,1,.55],name:'glow'}));
    return n;
  },
  update(n,t){const g=n.ch[1];if(g)g.tint[3]=.35+.3*Math.abs(Math.sin(t*23+Math.sin(t*7)));},
};
WEAPONS.sensus={
  name:'센수스',owner:'이든',desc:'보랏빛 폭풍의 에고 웨폰. 천진난만하지만 이든을 지키는 일에는 누구보다 사납다.',trail:'#c77dff',rest:[-0.5,0,0.15],kind:'dual',back:{p:[.14,.7,-.17],r:[.15,0,-.5]},
  build(){
    const n=Node(MESH.get('w_sensus_h',()=>hilt(.2,'#251a33',.18,'#5a3a80')));
    addTo(n,Node(MESH.get('w_sensus_b',()=>GEO.merge(bladeGeo(.85,.09,.02,'#e6d2ff','#ffffff'),GEO.box(.02,.12,.025,'#7a3fc0').tr(.05,-.3,0),GEO.box(.02,.12,.025,'#7a3fc0').tr(-.05,-.55,0)))));
    addTo(n,Node(MESH.get('w_sensus_g',()=>bladeGeo(.88,.14,.004,'#c77dff')),{mode:2,tint:[1,1,1,.5],name:'glow'}));
    return n;
  },
  update(n,t){const g=n.ch[1];if(g)g.tint[3]=.3+.25*Math.sin(t*9);},
};
WEAPONS.eruptio={
  name:'이럽디오',owner:'네시스',desc:'푸른 불꽃의 대검. 켄오바에서 넘어온 콘솔라티오 중 하나.',trail:'#5aa9ff',rest:[2.55,0,0.2],kind:'great',back:{p:[.12,.74,-.2],r:[.12,0,-.38]},
  build(){
    const n=Node(MESH.get('w_eruptio_h',()=>hilt(.34,'#1d2333',.34,'#9fb7d8')));
    addTo(n,Node(MESH.get('w_eruptio_b',()=>GEO.merge(bladeGeo(1.45,.2,.035,'#eaf3ff','#ffffff'),GEO.box(.05,1.2,.04,'#3d7dff').tr(0,-.7,0)))));
    addTo(n,Node(MESH.get('w_eruptio_f',()=>GEO.cone(.2,1.5,10,'#3d7dff').rx(Math.PI).tr(0,-.8,0).sc(1,1,.5)),{mode:2,tint:[1,1,1,.4],name:'flame'}));
    return n;
  },
  update(n,t){const f=n.ch[1];if(f){f.s[0]=1+.15*Math.sin(t*17);f.s[2]=1+.2*Math.sin(t*13);f.tint[3]=.3+.15*Math.sin(t*11);}},
};
WEAPONS.klausroom={
  name:'클라우스룸',owner:'네시스',desc:'백색 에너지의 검. 냉정하고 이성적인 조언자. 켄오바에서 넘어온 콘솔라티오 중 하나.',trail:'#f2f6ff',rest:[-0.5,0,0.15],kind:'dual',back:{p:[.14,.7,-.17],r:[.15,0,-.5]},
  build(){
    const n=Node(MESH.get('w_klaus_h',()=>hilt(.22,'#d8dde6',.2,'#f2f6ff')));
    addTo(n,Node(MESH.get('w_klaus_s',()=>GEO.cyl(.06,.05,1.0,8,'#e6ebf3').tr(0,-.5,0).sc(1,1,.45))));
    addTo(n,Node(MESH.get('w_klaus_g',()=>GEO.box(.012,.9,.03,'#ffffff').tr(0,-.5,.03)),{mode:1}));
    return n;
  },
};
WEAPONS.axe={name:'분노의 전투 도끼',owner:'렉소르',desc:'분노의 우니타스 대장 렉소르의 도끼.',trail:'#ff6b5b',rest:[-0.4,0,0],
  build(){return Node(MESH.get('w_axe',()=>GEO.merge(GEO.cyl(.03,.03,1.1,8,'#4a3326').tr(0,-.45,0),GEO.box(.04,.32,.3,'#c9ced8').tr(0,-.85,.14),GEO.box(.045,.34,.03,'#ff6b5b').tr(0,-.85,.3))));}};
WEAPONS.blade={name:'분노의 장검',owner:'콘투수스',desc:'',trail:'#ff8f6b',rest:[-0.5,0,0],
  build(){return Node(MESH.get('w_blade',()=>GEO.merge(hilt(.18,'#3a2622',.16,'#ff8f6b'),bladeGeo(.85,.07,.018,'#d9dde6'))));}};
WEAPONS.spear={name:'분노의 창',owner:'투몰투스',desc:'',trail:'#ffa07a',rest:[-0.3,0,0],
  build(){return Node(MESH.get('w_spear',()=>GEO.merge(GEO.cyl(.025,.025,1.8,8,'#3a2a22').tr(0,-.6,0),GEO.cone(.05,.3,8,'#d9dde6').rx(Math.PI).tr(0,-1.65,0),GEO.box(.1,.03,.03,'#ffa07a').tr(0,-1.45,0))));}};
WEAPONS.abiSpear={name:'심연의 창',owner:'아비',desc:'공간을 왜곡해 잔상을 남기는 창. 강림의 초석: 끝없는 심연.',trail:'#c98cff',rest:[-0.2,0,0],
  build(){
    const n=Node(MESH.get('w_abi',()=>GEO.merge(GEO.cyl(.022,.022,2.1,8,'#2a1640').tr(0,-.7,0),GEO.cone(.07,.45,8,'#f3e6ff').rx(Math.PI).tr(0,-1.95,0),GEO.torus(.06,.015,10,6,'#b46cff').tr(0,-1.6,0))));
    addTo(n,Node(MESH.get('w_abi_g',()=>GEO.cone(.12,.6,8,'#b46cff').rx(Math.PI).tr(0,-1.95,0)),{mode:2,tint:[1,1,1,.5]}));
    return n;
  }};
WEAPONS.morBlade={name:'종말의 대검',owner:'모르',desc:'예정된 종말을 내려치는 칠흑의 대검.',trail:'#ffb36b',rest:[2.4,0,0.2],
  build(){
    const n=Node(MESH.get('w_mor',()=>GEO.merge(hilt(.4,'#16161e',.42,'#3a3a4a'),bladeGeo(1.75,.3,.06,'#2a2a36','#5a5a6e'))));
    addTo(n,Node(MESH.get('w_mor_r',()=>GEO.merge(GEO.box(.04,.12,.07,'#b46cff').tr(0,-.4,0),GEO.box(.04,.12,.07,'#b46cff').tr(0,-.8,0),GEO.box(.04,.12,.07,'#b46cff').tr(0,-1.2,0))),{mode:1}));
    return n;
  }};
WEAPONS.needle={name:'강림의 금속 바늘',owner:'파시스',desc:'파시스의 날개를 이루는 금속 바늘. 공간을 꿰매는 살상 무기.',trail:'#f0d8ff',rest:[0,0,0],
  build(){return Node(MESH.get('w_needle',()=>GEO.merge(GEO.cone(.035,1.2,6,'#efe6ff').rx(Math.PI).tr(0,-.6,0))),{});}};

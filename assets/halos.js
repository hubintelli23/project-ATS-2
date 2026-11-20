/* ==================================================================
   액팅 소울 : 0 — 신들의 종언 (시즌 2 체험판)  v0.6.0
   assets/halos.js — 헤일로 문양 (이든 · 네시스 · 공명)

   설정 기준
   - 이든: 분열된 궤도형 + 공허의 중심형 — 검은 공허 중심, 보라색 파편 궤도 5개 (비대칭 · 교차 · 불규칙 회전)
   - 네시스: 수렴 나선형 + 융합 고리형 — 은빛·푸른빛 융합 고리 5개 (나선형 수렴 · 조화로운 회전)
   - 공명: 공허 중심 + 수렴하는 융합 고리 + 분열된 파편 궤도 — 7개 (5원소 + 두 주인공의 특수 속성)

   고리(ring) 항목
     r: 반지름 · th: 굵기 · col: 색
     tilt:[x,y,z]: 기울기(라디안) · off:[x,y,z]: 중심에서 어긋난 정도
     spin: 회전 속도(음수 = 반대 방향) · wob: 불규칙 흔들림 세기
     arcs:[[시작각,길이],...]: 끊어진 조각 (없으면 완전한 원)
     frag: 궤도 주변 파편 개수 · conv: 중심으로 수렴하는 흐름 (네시스)
   문양을 바꾸려면 이 숫자들만 고치면 된다. 게임 화면의 "마스터 모드 → 헤일로 보기"에서 바로 확인할 수 있다.
   ================================================================== */
'use strict';
const HALOS={
  eden:{name:'이든의 헤일로',sub:'분열된 궤도형 + 공허의 중심형 · 고리 5',core:'void',
    rings:[
      {r:.46,th:.022,col:'#b07cff',tilt:[.35,0,.25],off:[.04,.03,0],spin:1.6,wob:.6,arcs:[[0,1.5],[1.8,1.2],[3.3,1.4],[5.0,.9]],frag:4},
      {r:.62,th:.02,col:'#7a3fff',tilt:[-.55,.5,.1],off:[-.05,0,.03],spin:-1.0,wob:.9,arcs:[[.4,2.0],[2.8,1.1],[4.3,1.5]],frag:5},
      {r:.78,th:.018,col:'#9b5cff',tilt:[1.05,.2,-.35],off:[0,.06,-.02],spin:.55,wob:.4,arcs:[[0,.9],[1.2,1.6],[3.2,.7],[4.2,1.6]],frag:6},
      {r:.36,th:.024,col:'#5a22d0',tilt:[-.2,0,1.05],off:[-.07,.04,0],spin:-2.2,wob:1.2,arcs:[[0,2.6],[3.2,2.2]],frag:3},
      {r:.95,th:.016,col:'#c49cff',tilt:[.12,-.7,.45],off:[.03,-.05,.02],spin:.3,wob:.7,arcs:[[.2,1.1],[1.6,.6],[2.6,1.4],[4.4,.8],[5.4,.6]],frag:8},
    ]},
  nesis:{name:'네시스의 헤일로',sub:'수렴 나선형 + 융합 고리형 · 고리 5',core:'light',
    rings:[
      {r:.95,th:.02,col:'#dfe8f4',tilt:[.25,0,0],off:[0,0,0],spin:.5,conv:1},
      {r:.8,th:.022,col:'#7fc8ff',tilt:[.55,1.26,0],off:[0,0,0],spin:.5,conv:1},
      {r:.65,th:.022,col:'#3d8bff',tilt:[.85,2.51,0],off:[0,0,0],spin:.5,conv:1},
      {r:.5,th:.024,col:'#5fb8ff',tilt:[1.1,3.77,0],off:[0,0,0],spin:.5,conv:1},
      {r:.35,th:.026,col:'#bfe0ff',tilt:[1.35,5.03,0],off:[0,0,0],spin:.5,conv:1},
    ]},
  resonance:{name:'공명 헤일로',sub:'공허의 중심 + 수렴하는 융합 고리 + 분열된 파편 궤도 · 고리 7',core:'void',
    rings:[
      {r:1.05,th:.022,col:'#e8eef8',tilt:[.25,0,0],off:[0,0,0],spin:.45,conv:1},
      {r:.88,th:.022,col:'#7fc8ff',tilt:[.6,1.57,0],off:[0,0,0],spin:.45,conv:1},
      {r:.7,th:.024,col:'#3d8bff',tilt:[.95,3.14,0],off:[0,0,0],spin:.45,conv:1},
      {r:.52,th:.026,col:'#5fb8ff',tilt:[1.25,4.71,0],off:[0,0,0],spin:.45,conv:1},
      {r:.8,th:.018,col:'#9b5cff',tilt:[-.6,.4,.3],off:[.04,.03,0],spin:-1.1,wob:.8,arcs:[[0,1.4],[1.9,1.0],[3.4,1.6],[5.2,.8]],frag:5},
      {r:.62,th:.02,col:'#7a3fff',tilt:[.2,-.5,1.0],off:[-.05,0,.02],spin:1.7,wob:1.0,arcs:[[.3,2.1],[3.0,1.2],[4.6,1.1]],frag:4},
      {r:1.0,th:.016,col:'#b07cff',tilt:[1.1,.3,-.4],off:[0,-.04,0],spin:-.4,wob:.6,arcs:[[0,.8],[1.1,1.4],[2.9,.9],[4.1,1.5]],frag:7},
    ]},
};
/* 고리 메시 (끊어진 원호 + 파편). 한 번 만들고 재사용 */
function haloRingMesh(key,i){
  return MESH.get('halo_'+key+'_'+i,()=>{
    const d=HALOS[key].rings[i],g=new Geo();
    if(d.arcs)for(const [a0,len] of d.arcs)g.add(GEO.arc(d.r,d.th,a0,len,Math.max(6,Math.round(len*10)),5,d.col));
    else g.add(GEO.torus(d.r,d.th,48,5,d.col));
    const rnd=PR(i*97+key.length*13+7);
    for(let k=0;k<(d.frag||0);k++){const a=rnd()*Math.PI*2,rr=d.r*(.9+rnd()*.25);
      g.add(GEO.box(.05+rnd()*.06,.012,.025,d.col).ry(-a).tr(Math.cos(a)*rr,(rnd()-.5)*.06,Math.sin(a)*rr));}
    return g;});
}
const _HB=M4.create(),_HT=M4.create(),_HS=M4.create();
/* 헤일로 그리기
   x,y,z: 중심 · yaw: 바라보는 방향(라디안) · sc: 크기 · t: 시간 · a: 투명도
   flat: true 면 바닥과 나란하게 납작하게 펼침(궁극기 · 전장 위), 아니면 세워서(등 뒤) */
function drawHalo(key,x,y,z,yaw,sc,t,a,flat){
  const H=HALOS[key];if(!H||a<=0.01)return;
  M4.trsN(_HB,x,y,z,flat?0:Math.PI/2,yaw,0,sc,flat?sc*.22:sc,sc);
  if(H.core==='void'){
    R3.draw(FX.m.sph,M4.mul(_HT,_HB,M4.trsN(_HS,0,0,0,0,0,0,.2,.2,.2)),{mode:1,tint:'#000000',a:Math.min(1,a*1.2)});
    R3.draw(FX.m.torus,M4.mul(_HT,_HB,M4.trsN(_HS,0,0,0,0,t*.3,0,.21,.21,.21)),{mode:2,tint:'#9b5cff',a:.8*a}); // 공허의 가장자리
  }else{
    R3.draw(FX.m.sph,M4.mul(_HT,_HB,M4.trsN(_HS,0,0,0,0,0,0,.07,.07,.07)),{mode:2,tint:'#ffffff',a});
    R3.draw(FX.m.sph,M4.mul(_HT,_HB,M4.trsN(_HS,0,0,0,0,0,0,.16+.03*Math.sin(t*3),.16,.16)),{mode:2,tint:'#7fc8ff',a:.4*a});
  }
  H.rings.forEach((d,i)=>{
    let s=1,ra=a;
    if(d.conv){const f=(t*.35+i*.2)%1;s=1-.14*f;ra=a*(f<.85?1:(1-f)/.15*.7+.3);} // 중심으로 흘러드는 수렴
    const spin=d.spin*t+(d.wob?d.wob*Math.sin(t*(.7+i*.23)+i*2):0);
    M4.trsN(_HT,d.off[0],d.off[1],d.off[2],d.tilt[0],d.tilt[1],d.tilt[2],1,1,1);
    M4.mul(_HT,_HB,_HT);
    M4.mul(_HT,_HT,M4.trsN(_HS,0,0,0,0,spin,0,s,s,s));
    R3.draw(haloRingMesh(key,i),_HT,{mode:1,a:.92*ra});           // 고리 본체 (색 그대로)
    if(sc>1.2)R3.draw(haloRingMesh(key,i),_HT,{mode:2,a:.25*ra}); // 큰 헤일로는 빛 번짐 추가
  });
}

/* ==================================================================
   액팅 소울 : 0 — 신들의 종언 (시즌 2 체험판)  v0.5.0
   assets/items.js — 아이템 (전투 중 떨어지고, F 로 줍는다)

   새 아이템 추가 방법
   ITEMS['아이디'] = {
     name:'표시 이름', desc:'설명', col:'#색',
     drop:0.1,                 // 일반 적이 쓰러질 때 떨어뜨릴 확률 (0~1)
     use(){ ... return '화면에 띄울 문구'; }   // 주웠을 때 효과. P(플레이어), B(전투) 사용 가능
     draw(x,z,t){ ... }        // (선택) 바닥에 놓인 모습. 없으면 기본 결정 모양
   };
   ================================================================== */
'use strict';
const ITEMS={
  etherCrystal:{name:'에테르 결정',desc:'두 사람의 체력을 15% 회복합니다.',col:'#7fffb5',drop:.16,
    use(){let h=0;for(const k of ['eden','nesis'])if(P.hp[k]>0){const a=CH[k].maxhp*.15;h+=Math.min(a,CH[k].maxhp-P.hp[k]);P.hp[k]=Math.min(CH[k].maxhp,P.hp[k]+a);}return '체력 +'+Math.round(h);}},
  linkShard:{name:'링크 파편',desc:'링크 게이지가 25% 차오릅니다.',col:'#c9b6ff',drop:.1,
    use(){addLink(25);return '링크 +25%';}},
  thoughtEssence:{name:'사념 정수',desc:'현재 캐릭터의 Q·E 스킬 대기 시간을 초기화합니다.',col:'#ffd27a',drop:.04,
    use(){P.cdQ[P.active]=0;P.cdE[P.active]=0;return '스킬 대기 시간 초기화';}},
};
/* 바닥에 놓인 아이템 그리기 (기본 모양) */
function drawItem(it,x,z,t,blink){
  const d=ITEMS[it.id],y=.7+Math.sin(t*3+it.seed)*.12,a=blink?(Math.sin(t*20)>0?1:.25):1;
  if(d.draw)return d.draw(x,z,t,a);
  R3.draw(FX.m.oct,mat(x,y,z,t*1.6,.2,.32,.2),{mode:1,tint:d.col,a});
  R3.draw(FX.m.oct,mat(x,y,z,t*1.6,.36,.5,.36),{mode:2,tint:d.col,a:.3*a});
  R3.draw(FX.m.glowRing,mat(x,.04,z,t,.55+.06*Math.sin(t*4),1,.55+.06*Math.sin(t*4)),{mode:2,tint:d.col,a:.7*a});
  R3.draw(FX.m.pillar,mat(x,0,z,0,.12,2.2,.12),{mode:2,tint:d.col,a:.35*a});
}

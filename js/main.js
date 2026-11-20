/* ==================================================================
   액팅 소울 : 0 — 신들의 종언 (시즌 2 체험판)  v0.6.0
   js/main.js — 시작과 메인 루프
   ================================================================== */
'use strict';
(function boot(){
  let ok=false;
  try{ok=R3.init(glc);}catch(e){console.error(e);ok=false;}
  if(!ok){$('nogl').classList.remove('hide');return;}
  FX.init();resize();window.addEventListener('resize',resize);
  let last=performance.now();
  function frame(now){
    const ms=now-last;let rdt=Math.min(.05,ms/1000);last=now;gfxTick(ms);
    if(GS.paused)rdt=0;
    GS.t+=rdt;
    try{
      if(GS.view==='halo'){STAGE.set('haloview');STAGE.draw(Math.min(.05,ms/1000));ov.setTransform(1,0,0,1,0,0);ov.clearRect(0,0,ovc.width,ovc.height);}
      else if(B&&(GS.mode==='battle'||GS.mode==='over'||GS.mode==='result')){
        if(GS.mode==='battle'&&!GS.map)battleUpdate(rdt);
        if(B){render3D(rdt);updateHud();}
      }else{
        STAGE.set(GS.bg);STAGE.draw(rdt);dlgUpdate(rdt);
        ov.setTransform(1,0,0,1,0,0);ov.clearRect(0,0,ovc.width,ovc.height);
      }
    }catch(err){console.error(err);}
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
/* 테스트·디버그용 접근점 */
window.ASDBG={GS,get B(){return B},get P(){return P},inp,startBattle,startChapter,nextStep,skipToAction,run,SAVE,R3,STAGE};

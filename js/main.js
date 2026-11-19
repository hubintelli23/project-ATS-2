/* ---------------- main loop ---------------- */
let last=performance.now();
function frame(now){
  let rdt=Math.min(.05,(now-last)/1000);last=now;
  if(GS.paused)rdt=0;
  GS.t+=rdt;
  try{
    if(GS.mode==='battle'||GS.mode==='over'||(GS.mode==='result'&&B)){
      if(B){if(GS.mode==='battle')battleUpdate(rdt);render();updateHud();}
    }else{
      drawBg(GS.bg,GS.t);
      dlgUpdate(rdt);
    }
  }catch(err){console.error(err);}
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
window.ASDBG={GS,get B(){return B},get P(){return P},inp,startBattle,startChapter,nextStep,skipToAction,run,SAVE};

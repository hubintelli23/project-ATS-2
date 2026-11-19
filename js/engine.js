/* ==================================================================
   액팅 소울 : 0 — 신들의 종언 (시즌 2 체험판)  v0.2.0
   js/engine.js — 미니 3D 엔진 (WebGL2, 외부 라이브러리 없음)

   - M4   : 4x4 행렬 계산
   - Geo  : 도형(메시) 만들기  box / cyl / sph / cone / disc / ring ...
   - Node : 장면 노드 (위치 p, 회전 r[x,y,z], 크기 s, 자식 ch)
   - R3   : 렌더러  begin → node()/draw() → end()

   좌표: y가 위쪽. 캐릭터 모델은 +Z 방향을 앞으로 만든다.
   draw 모드: 0 조명 받음 / 1 발광(조명 무시) / 2 가산 발광(이펙트) / 3 하늘(안개 없음)
   ================================================================== */
'use strict';
const M4={
  create(){const m=new Float32Array(16);m[0]=m[5]=m[10]=m[15]=1;return m;},
  copy(o,a){o.set(a);return o;},
  mul(o,a,b){
    const t=M4._t;
    for(let c=0;c<4;c++)for(let r=0;r<4;r++){
      t[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];}
    o.set(t);return o;
  },
  trs(o,p,r,s){
    const cy=Math.cos(r[1]),sy=Math.sin(r[1]),cx=Math.cos(r[0]),sx=Math.sin(r[0]),cz=Math.cos(r[2]),sz=Math.sin(r[2]);
    const R00=cy*cz+sy*sx*sz,R01=-cy*sz+sy*sx*cz,R02=sy*cx;
    const R10=cx*sz,R11=cx*cz,R12=-sx;
    const R20=-sy*cz+cy*sx*sz,R21=sy*sz+cy*sx*cz,R22=cy*cx;
    o[0]=R00*s[0];o[1]=R10*s[0];o[2]=R20*s[0];o[3]=0;
    o[4]=R01*s[1];o[5]=R11*s[1];o[6]=R21*s[1];o[7]=0;
    o[8]=R02*s[2];o[9]=R12*s[2];o[10]=R22*s[2];o[11]=0;
    o[12]=p[0];o[13]=p[1];o[14]=p[2];o[15]=1;return o;
  },
  persp(o,fovy,asp,n,f){const t=1/Math.tan(fovy/2);o.fill(0);o[0]=t/asp;o[5]=t;o[10]=(f+n)/(n-f);o[11]=-1;o[14]=2*f*n/(n-f);return o;},
  lookAt(o,e,c,u){
    let zx=e[0]-c[0],zy=e[1]-c[1],zz=e[2]-c[2];let l=Math.hypot(zx,zy,zz)||1;zx/=l;zy/=l;zz/=l;
    let xx=u[1]*zz-u[2]*zy,xy=u[2]*zx-u[0]*zz,xz=u[0]*zy-u[1]*zx;l=Math.hypot(xx,xy,xz)||1;xx/=l;xy/=l;xz/=l;
    const yx=zy*xz-zz*xy,yy=zz*xx-zx*xz,yz=zx*xy-zy*xx;
    o[0]=xx;o[1]=yx;o[2]=zx;o[3]=0;o[4]=xy;o[5]=yy;o[6]=zy;o[7]=0;o[8]=xz;o[9]=yz;o[10]=zz;o[11]=0;
    o[12]=-(xx*e[0]+xy*e[1]+xz*e[2]);o[13]=-(yx*e[0]+yy*e[1]+yz*e[2]);o[14]=-(zx*e[0]+zy*e[1]+zz*e[2]);o[15]=1;return o;
  },
};
M4._t=new Float32Array(16);

/* ---------- 색 ---------- */
const HEXC={};
function hex(c){
  if(Array.isArray(c))return c;
  if(HEXC[c])return HEXC[c];
  let h=c.replace('#','');if(h.length===3)h=h.split('').map(x=>x+x).join('');
  const v=[parseInt(h.slice(0,2),16)/255,parseInt(h.slice(2,4),16)/255,parseInt(h.slice(4,6),16)/255];
  HEXC[c]=v;return v;
}

/* ---------- 도형 ---------- */
class Geo{
  constructor(){this.p=[];this.n=[];this.c=[];this.i=[];}
  get vc(){return this.p.length/3;}
  v(x,y,z,nx,ny,nz,c){this.p.push(x,y,z);this.n.push(nx,ny,nz);this.c.push(c[0],c[1],c[2]);return this.vc-1;}
  add(...gs){for(const g of gs){const o=this.vc;this.p.push(...g.p);this.n.push(...g.n);this.c.push(...g.c);for(const k of g.i)this.i.push(k+o);}return this;}
  tr(x,y,z){for(let k=0;k<this.p.length;k+=3){this.p[k]+=x;this.p[k+1]+=y;this.p[k+2]+=z;}return this;}
  sc(x,y,z){if(y===undefined){y=z=x;}for(let k=0;k<this.p.length;k+=3){this.p[k]*=x;this.p[k+1]*=y;this.p[k+2]*=z;
      let nx=this.n[k]/x,ny=this.n[k+1]/y,nz=this.n[k+2]/z;const l=Math.hypot(nx,ny,nz)||1;this.n[k]=nx/l;this.n[k+1]=ny/l;this.n[k+2]=nz/l;}return this;}
  _rot(a,i,j){const c=Math.cos(a),s=Math.sin(a);for(const arr of [this.p,this.n])for(let k=0;k<arr.length;k+=3){const u=arr[k+i],w=arr[k+j];arr[k+i]=u*c-w*s;arr[k+j]=u*s+w*c;}return this;}
  rx(a){return this._rot(a,1,2);}   // X축 회전
  ry(a){return this._rot(a,2,0);}   // Y축 회전 (+X → -Z 방향)
  rz(a){return this._rot(a,0,1);}   // Z축 회전
  col(c){c=hex(c);for(let k=0;k<this.c.length;k+=3){this.c[k]=c[0];this.c[k+1]=c[1];this.c[k+2]=c[2];}return this;}
  grad(top,bot,y0,y1){const a=hex(top),b=hex(bot);for(let k=0;k<this.p.length;k+=3){const t=Math.max(0,Math.min(1,(this.p[k+1]-y0)/(y1-y0)));for(let q=0;q<3;q++)this.c[k+q]=b[q]+(a[q]-b[q])*t;}return this;}
  clone(){const g=new Geo();g.add(this);return g;}
}
const GEO={
  box(w,h,d,col){
    const g=new Geo(),c=hex(col||'#fff'),x=w/2,y=h/2,z=d/2;
    const F=[[[0,0,1],[[-x,-y,z],[x,-y,z],[x,y,z],[-x,y,z]]],[[0,0,-1],[[x,-y,-z],[-x,-y,-z],[-x,y,-z],[x,y,-z]]],
      [[1,0,0],[[x,-y,z],[x,-y,-z],[x,y,-z],[x,y,z]]],[[-1,0,0],[[-x,-y,-z],[-x,-y,z],[-x,y,z],[-x,y,-z]]],
      [[0,1,0],[[-x,y,z],[x,y,z],[x,y,-z],[-x,y,-z]]],[[0,-1,0],[[-x,-y,-z],[x,-y,-z],[x,-y,z],[-x,-y,z]]]];
    for(const [n,vs] of F){const o=g.vc;for(const v of vs)g.v(v[0],v[1],v[2],n[0],n[1],n[2],c);g.i.push(o,o+1,o+2,o,o+2,o+3);}
    return g;
  },
  cyl(rt,rb,h,seg,col,cap){
    seg=seg||10;cap=cap!==false;const g=new Geo(),c=hex(col||'#fff'),hy=h/2;
    const sl=(rb-rt)/h,nl=Math.hypot(1,sl);
    for(let s=0;s<=seg;s++){const a=s/seg*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a);
      g.v(ca*rt,hy,sa*rt,ca/nl,sl/nl,sa/nl,c);g.v(ca*rb,-hy,sa*rb,ca/nl,sl/nl,sa/nl,c);}
    for(let s=0;s<seg;s++){const k=s*2;g.i.push(k,k+1,k+3,k,k+3,k+2);}
    if(cap){for(const [r,y,ny] of [[rt,hy,1],[rb,-hy,-1]]){if(r<=0)continue;const o=g.vc;g.v(0,y,0,0,ny,0,c);
      for(let s=0;s<=seg;s++){const a=s/seg*Math.PI*2;g.v(Math.cos(a)*r,y,Math.sin(a)*r,0,ny,0,c);}
      for(let s=0;s<seg;s++)g.i.push(o,o+1+s,o+2+s);}}
    return g;
  },
  cone(r,h,seg,col){return GEO.cyl(0.0001,r,h,seg,col);},
  sph(r,seg,col){
    seg=seg||10;const g=new Geo(),c=hex(col||'#fff'),lat=Math.max(4,seg>>1);
    for(let y=0;y<=lat;y++){const th=y/lat*Math.PI,st=Math.sin(th),ct=Math.cos(th);
      for(let x=0;x<=seg;x++){const ph=x/seg*Math.PI*2;const nx=Math.cos(ph)*st,nz=Math.sin(ph)*st;g.v(nx*r,ct*r,nz*r,nx,ct,nz,c);}}
    for(let y=0;y<lat;y++)for(let x=0;x<seg;x++){const a=y*(seg+1)+x,b=a+seg+1;g.i.push(a,b,a+1,b,b+1,a+1);}
    return g;
  },
  disc(r,seg,col){const g=new Geo(),c=hex(col||'#fff');seg=seg||24;g.v(0,0,0,0,1,0,c);for(let s=0;s<=seg;s++){const a=s/seg*Math.PI*2;g.v(Math.cos(a)*r,0,Math.sin(a)*r,0,1,0,c);}for(let s=0;s<seg;s++)g.i.push(0,s+1,s+2);return g;},
  ring(r1,r2,seg,col,col2){const g=new Geo(),c=hex(col||'#fff'),c2=hex(col2||col||'#fff');seg=seg||32;
    for(let s=0;s<=seg;s++){const a=s/seg*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a);g.v(ca*r1,0,sa*r1,0,1,0,c2);g.v(ca*r2,0,sa*r2,0,1,0,c);}
    for(let s=0;s<seg;s++){const k=s*2;g.i.push(k,k+1,k+3,k,k+3,k+2);}return g;},
  sector(r1,r2,arc,seg,col,col2){ // +X 방향 중심 부채꼴 (r1=안쪽, r2=바깥)
    const g=new Geo(),c=hex(col||'#fff'),c2=hex(col2||col||'#fff');seg=seg||16;
    for(let s=0;s<=seg;s++){const a=-arc/2+s/seg*arc,ca=Math.cos(a),sa=Math.sin(a);g.v(ca*r1,0,sa*r1,0,1,0,c2);g.v(ca*r2,0,sa*r2,0,1,0,c);}
    for(let s=0;s<seg;s++){const k=s*2;g.i.push(k,k+1,k+3,k,k+3,k+2);}return g;},
  rect(x0,x1,z0,z1,col){const g=new Geo(),c=hex(col||'#fff');g.v(x0,0,z0,0,1,0,c);g.v(x1,0,z0,0,1,0,c);g.v(x1,0,z1,0,1,0,c);g.v(x0,0,z1,0,1,0,c);g.i.push(0,1,2,0,2,3);return g;},
  oct(r,col){const g=new Geo(),c=hex(col||'#fff');const V=[[r,0,0],[-r,0,0],[0,r,0],[0,-r,0],[0,0,r],[0,0,-r]];
    const T=[[0,2,4],[2,1,4],[1,3,4],[3,0,4],[2,0,5],[1,2,5],[3,1,5],[0,3,5]];
    for(const t of T){const o=g.vc;for(const k of t){const v=V[k];g.v(v[0],v[1],v[2],v[0]/r,v[1]/r,v[2]/r,c);}g.i.push(o,o+1,o+2);}return g;},
  torus(R,r,seg,seg2,col){const g=new Geo(),c=hex(col||'#fff');seg=seg||24;seg2=seg2||8;
    for(let i=0;i<=seg;i++){const a=i/seg*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a);
      for(let j=0;j<=seg2;j++){const b=j/seg2*Math.PI*2,cb=Math.cos(b),sb=Math.sin(b);g.v((R+r*cb)*ca,r*sb,(R+r*cb)*sa,cb*ca,sb,cb*sa,c);}}
    for(let i=0;i<seg;i++)for(let j=0;j<seg2;j++){const a=i*(seg2+1)+j,b=a+seg2+1;g.i.push(a,b,a+1,b,b+1,a+1);}return g;},
  merge(...gs){const g=new Geo();g.add(...gs);return g;},
};

/* ---------- 노드 ---------- */
function Node(mesh,o){
  const n={mesh:mesh||null,p:[0,0,0],r:[0,0,0],s:[1,1,1],ch:[],tint:null,emis:null,mode:0,vis:true,_w:M4.create(),name:''};
  if(o)Object.assign(n,o);return n;
}
function addTo(parent,child,p,r,s){if(p)child.p=p.slice();if(r)child.r=r.slice();if(s)child.s=(typeof s==='number')?[s,s,s]:s.slice();parent.ch.push(child);return child;}

/* ---------- 렌더러 ---------- */
const R3={
  gl:null,cv:null,W:1,H:1,dpr:1,P:M4.create(),V:M4.create(),PV:M4.create(),
  cam:{pos:[0,5,10],tgt:[0,1,0],fov:0.95,near:0.1,far:700},
  env:{fog:[.05,.04,.1],fogN:20,fogF:120,light:[-.4,-1,-.3],lightCol:[.9,.85,.9],ambTop:[.35,.33,.45],ambBot:[.12,.1,.16]},
  items:[],nItems:0,flash:0,ok:false,
  init(cv){
    this.cv=cv;
    const gl=cv.getContext('webgl2',{antialias:true,alpha:false,powerPreference:'high-performance'});
    if(!gl){this.ok=false;return false;}
    this.gl=gl;
    const VS=`#version 300 es
in vec3 aP;in vec3 aN;in vec3 aC;
uniform mat4 uPV,uM;
out vec3 vN;out vec3 vC;out vec3 vW;
void main(){vec4 w=uM*vec4(aP,1.);vW=w.xyz;vN=mat3(uM)*aN;vC=aC;gl_Position=uPV*w;}`;
    const FS=`#version 300 es
precision mediump float;
in vec3 vN;in vec3 vC;in vec3 vW;
uniform vec3 uL,uLC,uAT,uAB,uE,uF,uCam;uniform vec4 uT;uniform float uMode,uFN,uFF,uFl;
out vec4 o;
void main(){
  vec3 c=vC*uT.rgb;
  if(uMode<0.5){vec3 n=normalize(vN);float d=max(dot(n,-uL),0.);vec3 a=mix(uAB,uAT,n.y*.5+.5);c=c*(a+uLC*d);}
  c+=uE;c=mix(c,vec3(1.),uFl);
  float f=clamp((length(vW-uCam)-uFN)/(uFF-uFN),0.,1.);
  if(uMode<1.5)c=mix(c,uF,f);else if(uMode<2.5)c*=1.-f;
  o=vec4(c,uT.a);
}`;
    const sh=(t,s)=>{const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(x));return x;};
    const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));
    gl.bindAttribLocation(pr,0,'aP');gl.bindAttribLocation(pr,1,'aN');gl.bindAttribLocation(pr,2,'aC');gl.linkProgram(pr);
    if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(pr));
    this.pr=pr;gl.useProgram(pr);
    this.u={};for(const k of ['uPV','uM','uL','uLC','uAT','uAB','uE','uF','uCam','uT','uMode','uFN','uFF','uFl'])this.u[k]=gl.getUniformLocation(pr,k);
    gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);
    this.ok=true;return true;
  },
  mesh(geo){
    const gl=this.gl;const vao=gl.createVertexArray();gl.bindVertexArray(vao);
    const buf=(data,loc)=>{const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,0,0);};
    buf(geo.p,0);buf(geo.n,1);buf(geo.c,2);
    const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);
    const big=geo.vc>65535;gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,big?new Uint32Array(geo.i):new Uint16Array(geo.i),gl.STATIC_DRAW);
    gl.bindVertexArray(null);
    return{vao,count:geo.i.length,type:big?gl.UNSIGNED_INT:gl.UNSIGNED_SHORT};
  },
  resize(W,H,dpr){this.W=W;this.H=H;this.dpr=dpr;if(this.cv){this.cv.width=Math.round(W*dpr);this.cv.height=Math.round(H*dpr);}},
  begin(env){
    if(env)this.env=env;
    const c=this.cam;
    M4.persp(this.P,c.fov,this.W/Math.max(1,this.H),c.near,c.far);
    M4.lookAt(this.V,c.pos,c.tgt,[0,1,0]);
    M4.mul(this.PV,this.P,this.V);
    this.nItems=0;
  },
  _item(){let it=this.items[this.nItems];if(!it){it={m:M4.create(),tint:[1,1,1,1],emis:[0,0,0]};this.items.push(it);}this.nItems++;return it;},
  /* 메시 한 개 그리기. o={tint:[r,g,b,a] 또는 '#hex', a:알파, emis:'#hex' 또는 [..], mode:0~3, fl:흰 번쩍임} */
  draw(mesh,m,o){
    if(!mesh)return;o=o||{};
    const it=this._item();it.mesh=mesh;it.m.set(m);
    const t=o.tint?(typeof o.tint==='string'?hex(o.tint):o.tint):null;
    it.tint[0]=t?t[0]:1;it.tint[1]=t?t[1]:1;it.tint[2]=t?t[2]:1;it.tint[3]=o.a!=null?o.a:(t&&t.length>3?t[3]:1);
    const e=o.emis?(typeof o.emis==='string'?hex(o.emis):o.emis):null;
    it.emis[0]=e?e[0]:0;it.emis[1]=e?e[1]:0;it.emis[2]=e?e[2]:0;
    it.mode=o.mode||0;it.fl=o.fl||0;
    it.tr=it.mode===2||it.tint[3]<0.999;
    it.d=it.tr?Math.hypot(m[12]-this.cam.pos[0],m[13]-this.cam.pos[1],m[14]-this.cam.pos[2]):0;
  },
  /* 노드 트리 그리기. inh = {a:알파, fl:번쩍임, emis:추가 발광} — 캐릭터 전체에 적용 */
  node(n,parent,inh){
    if(!n||!n.vis)return;
    M4.trs(n._w,n.p,n.r,n.s);
    if(parent)M4.mul(n._w,parent,n._w);
    if(n.mesh){
      const a=(n.tint&&n.tint.length>3?n.tint[3]:1)*(inh&&inh.a!=null?inh.a:1);
      this.draw(n.mesh,n._w,{tint:n.tint,a,emis:(inh&&inh.emis)||n.emis,mode:n.mode,fl:inh?inh.fl:0});
    }
    for(const c of n.ch)this.node(c,n._w,inh);
  },
  end(){
    const gl=this.gl,u=this.u,e=this.env;
    gl.viewport(0,0,this.cv.width,this.cv.height);
    const f=e.fog;gl.clearColor(f[0],f[1],f[2],1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.pr);
    gl.uniformMatrix4fv(u.uPV,false,this.PV);
    const L=e.light,ll=Math.hypot(...L);gl.uniform3f(u.uL,L[0]/ll,L[1]/ll,L[2]/ll);
    gl.uniform3fv(u.uLC,e.lightCol);gl.uniform3fv(u.uAT,e.ambTop);gl.uniform3fv(u.uAB,e.ambBot);
    gl.uniform3fv(u.uF,e.fog);gl.uniform1f(u.uFN,e.fogN);gl.uniform1f(u.uFF,e.fogF);gl.uniform3fv(u.uCam,this.cam.pos);
    const list=this.items.slice(0,this.nItems);
    const op=list.filter(i=>!i.tr),tr=list.filter(i=>i.tr).sort((a,b)=>b.d-a.d);
    const go=it=>{gl.uniformMatrix4fv(u.uM,false,it.m);gl.uniform4fv(u.uT,it.tint);gl.uniform3fv(u.uE,it.emis);gl.uniform1f(u.uMode,it.mode);gl.uniform1f(u.uFl,it.fl);
      gl.bindVertexArray(it.mesh.vao);gl.drawElements(gl.TRIANGLES,it.mesh.count,it.mesh.type,0);};
    gl.disable(gl.BLEND);gl.depthMask(true);
    for(const it of op)go(it);
    gl.enable(gl.BLEND);gl.depthMask(false);
    for(const it of tr){if(it.mode===2)gl.blendFunc(gl.SRC_ALPHA,gl.ONE);else gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);go(it);}
    gl.depthMask(true);gl.disable(gl.BLEND);gl.bindVertexArray(null);
  },
  /* 월드 좌표 → 화면 좌표 (CSS px). 화면 뒤쪽이면 null */
  project(x,y,z){
    const m=this.PV;const cx=m[0]*x+m[4]*y+m[8]*z+m[12],cy=m[1]*x+m[5]*y+m[9]*z+m[13],cw=m[3]*x+m[7]*y+m[11]*z+m[15];
    if(cw<=0.05)return null;return[(cx/cw*.5+.5)*this.W,(1-(cy/cw*.5+.5))*this.H,cw];
  },
};
/* 행렬 하나 빠르게 만들기 */
const _TM=M4.create();
function mat(x,y,z,ry,sx,sy,sz,rx,rz){return M4.trs(_TM,[x,y,z],[rx||0,ry||0,rz||0],[sx==null?1:sx,sy==null?(sx==null?1:sx):sy,sz==null?(sx==null?1:sx):sz]);}
/* 메시 캐시: 같은 도형을 한 번만 GPU에 올린다 */
const MESH={_c:{},get(key,fn){return this._c[key]||(this._c[key]=R3.mesh(fn()));}};

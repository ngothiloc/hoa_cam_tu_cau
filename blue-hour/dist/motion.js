import * as T from 'three';

// The same deformation runs in the color and shadow passes. Thin tips move most;
// attachment points remain anchored, and each instance gets its own wind phase.
export function createMotion(model,reduced){
 const time={value:0},strength={value:reduced?0:1};
 const kinds={petal:0,leaf:1,paper:2,ribbon:3,lowerPaper:4};
 function windCode(kind){return `
 uniform float bouquetTime;
 uniform float bouquetWind;
 float windPhase(){
   vec3 origin=modelMatrix[3].xyz;
   #ifdef USE_INSTANCING
     origin+=instanceMatrix[3].xyz;
   #endif
   return dot(origin,vec3(3.1,4.7,2.3));
 }
 float tipAngle(vec3 p){
   float weight=${kind===1?'pow(clamp((p.y+1.)*.5,0.,1.),2.)':'pow(clamp(p.y,0.,1.),2.)'};
   return bouquetWind*weight*(sin(bouquetTime*1.8+windPhase())*.095+sin(bouquetTime*3.1+windPhase()*1.7)*.035);
 }
 vec3 bouquetDeform(vec3 p){
   ${kind<=1?`float a=tipAngle(p);float c=cos(a),s=sin(a);p.yz=mat2(c,-s,s,c)*p.yz;`:
   `float weight=${kind===2?'pow(clamp((p.y+.85)/3.,0.,1.),2.)':kind===4?'pow(clamp((-p.y-.85)/1.5,0.,1.),2.)':'clamp(abs(p.y+.91)/1.3,.12,1.)'};
    p.x+=sin(bouquetTime*1.15+p.y*1.8+windPhase())*weight*.032*bouquetWind;
    p.z+=sin(bouquetTime*1.55+p.x*2.1+windPhase())*weight*.035*bouquetWind;`}
   return p;
 }
 vec3 bouquetNormal(vec3 n,vec3 p){
   ${kind<=1?'float a=tipAngle(p);float c=cos(a),s=sin(a);n.yz=mat2(c,-s,s,c)*n.yz;':''}
   return n;
 }`}
 model.root.traverse(mesh=>{const kind=kinds[mesh.userData.windKind];if(kind===undefined||!mesh.isMesh)return;
   const apply=material=>{material.onBeforeCompile=shader=>{shader.uniforms.bouquetTime=time;shader.uniforms.bouquetWind=strength;shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\n'+windCode(kind)).replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed=bouquetDeform(transformed);').replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\nobjectNormal=bouquetNormal(objectNormal,position);')};material.customProgramCacheKey=()=>`bouquet-wind-v1-${kind}`;return material};
   mesh.material=apply(mesh.material.clone());mesh.customDepthMaterial=apply(new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,side:T.DoubleSide}));mesh.frustumCulled=false;
 });
 const flowerBases=model.flowers.map(g=>g.position.clone());
 let introTime=reduced?6:0;
 const smooth=(a,b,x)=>{const t=T.MathUtils.clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
 function finishIntro(){introTime=6}
 function update(elapsed,delta,focused,pulse){
   introTime+=delta;const intro=reduced?1:smooth(0,4.3,introTime);time.value=reduced?0:elapsed;
   // Keep a selected photograph still while nearby flowers continue to breathe.
   const target=reduced?0:focused?.38:1;strength.value=T.MathUtils.lerp(strength.value,target,1-Math.exp(-delta*3));
   for(let i=0;i<model.papers.length;i++){const {pivot,angle}=model.papers[i];const fold=reduced?1:smooth(.25+i*.028,2.35+i*.035,introTime);pivot.rotation.z=(1-fold)*Math.sin(angle)*.28;pivot.rotation.x=(1-fold)*-.19;pivot.position.x=(1-fold)*Math.sin(angle)*.26;pivot.position.y=-.85-(1-fold)*.18;}
   for(let i=0;i<model.flowers.length;i++){const g=model.flowers[i],base=flowerBases[i];const settle=reduced?1:smooth(0,1.5+i*.09,introTime);const sway=strength.value;g.position.copy(base);g.position.x+=base.x*(1-settle)*.1+Math.sin(elapsed*1.05+i*1.3)*.023*sway;g.position.y+=(1-settle)*.17+Math.sin(elapsed*1.35+i)*.012*sway;g.rotation.z=Math.sin(elapsed*1.15+i*1.1)*.023*sway+Math.sin(pulse*7+i*.6)*.025*Math.exp(-pulse)*(pulse<3&&!reduced?1:0);g.rotation.x=Math.sin(elapsed*.9+i*.8)*.016*sway;}
   const tied=reduced?1:smooth(2.05,3.8,introTime);model.bow.visible=tied>.001;model.bow.scale.set(Math.max(.001,tied),Math.max(.001,tied),Math.max(.001,tied));model.bow.rotation.z=reduced?0:Math.sin(elapsed*.92)*.012*strength.value;
   for(let i=0;i<model.wings.length;i++)model.wings[i].rotation.y=reduced?.2:Math.sin(elapsed*2.5)*(i?1:-1)*.19;
   return intro;
 }
 return {update,finishIntro};
}

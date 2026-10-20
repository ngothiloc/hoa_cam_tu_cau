import * as T from 'three';
import {OrbitControls} from 'three/addons/OrbitControls.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {createBouquet} from './bouquet.js';
import {createMotion} from './motion.js';
export function createStage(host,reduced){
 const renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});renderer.setClearColor(0x020305);renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;host.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','Bó hoa cẩm tú cầu 3D');
 const scene=new T.Scene();scene.background=new T.Color(0x020305);const camera=new T.PerspectiveCamera(35,1,.08,70);const home=new T.Vector3(),homeTarget=new T.Vector3(0,.12,0);
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.065;controls.enablePan=false;controls.minDistance=1.6;controls.maxDistance=24;controls.minPolarAngle=.05;controls.maxPolarAngle=Math.PI-.05;
 scene.add(new T.HemisphereLight(0xe5efff,0x8994a3,1.05));
 const key=new T.DirectionalLight(0xfff5e9,1.95);key.position.set(-3.5,6,5);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-3.5,right:3.5,top:4,bottom:-3.5,near:.5,far:18});key.shadow.bias=-.00015;key.shadow.normalBias=.012;key.shadow.radius=3;key.shadow.intensity=.65;scene.add(key);
 const fill=new T.DirectionalLight(0xe4edff,1.15);fill.position.set(4,1,5);scene.add(fill);
 const rim=new T.DirectionalLight(0xc8e0ff,1.65);rim.position.set(2,4,-4);scene.add(rim);const edge=new T.DirectionalLight(0xffead0,.7);edge.position.set(-3,-.5,-2);scene.add(edge);
 // Off-camera softboxes in a PMREM environment give satin and metal broad reflections.
 const envScene=new T.Scene();envScene.background=new T.Color(0x070b12);const box=(x,y,z,sx,sy,sz,color)=>{const m=new T.Mesh(new T.BoxGeometry(sx,sy,sz),new T.MeshBasicMaterial({color}));m.position.set(x,y,z);envScene.add(m)};box(-4,3,3,1.5,6,2,new T.Color(2,2,2));box(4,2,-3,1,5,2,new T.Color(1.15,1.3,1.5));box(0,6,0,5,.2,4,new T.Color(1.2,1.2,1.2));const pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(envScene,.08).texture;scene.environmentIntensity=.65;pmrem.dispose();envScene.traverse(o=>{o.geometry?.dispose();o.material?.dispose()});
 const model=createBouquet(renderer);scene.add(model.root);const motion=createMotion(model,reduced);motion.update(0,0,false,20);
 const composer=new EffectComposer(renderer);const samples=Math.min(innerWidth<=700?2:4,renderer.capabilities.maxSamples);composer.renderTarget1.samples=samples;composer.renderTarget2.samples=samples;composer.addPass(new RenderPass(scene,camera));const bloom=new UnrealBloomPass(new T.Vector2(1,1),.15,.45,1.4);composer.addPass(bloom);composer.addPass(new OutputPass());
 // Tiny drifting motes with isolated, softly blooming four-point glints.
 let s=863;const random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};const count=145,positions=new Float32Array(count*3),phases=new Float32Array(count),sizes=new Float32Array(count);
 for(let i=0;i<count;i++){positions[i*3]=(random()-.5)*7.5;positions[i*3+1]=(random()-.5)*7;positions[i*3+2]=(random()-.5)*5;phases[i]=random()*20;sizes[i]=i%7===0?1.7: .45+random()*.6}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(positions,3));geo.setAttribute('phase',new T.BufferAttribute(phases,1));geo.setAttribute('pointSize',new T.BufferAttribute(sizes,1));
 const sparkleMat=new T.ShaderMaterial({uniforms:{time:{value:0},pixelRatio:{value:renderer.getPixelRatio()},burst:{value:0}},vertexShader:`attribute float phase;attribute float pointSize;uniform float time;uniform float pixelRatio;uniform float burst;varying float bright;varying float kind;void main(){vec3 p=position;p.x+=sin(time*.12+phase)*.15;p.y+=sin(time*.15+phase)*.2;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;float twinkle=pow(max(0.,sin(time*.8+phase)),12.);bright=.08+twinkle*.8+burst*.45;kind=pointSize;gl_PointSize=clamp(pointSize*75.*pixelRatio/-mv.z,1.,32.);}`,fragmentShader:`varying float bright;varying float kind;void main(){vec2 p=gl_PointCoord-.5;float d=length(p);float glow=exp(-d*d*45.);float cross=exp(-abs(p.x)*100.)*exp(-abs(p.y)*8.)+exp(-abs(p.y)*100.)*exp(-abs(p.x)*8.);float a=(glow*.55+(kind>1.5?cross*.48:0.))*bright;if(a<.007)discard;gl_FragColor=vec4(vec3(1.25,1.5,1.9),a);}`,transparent:true,depthWrite:false,blending:T.AdditiveBlending});const motes=new T.Points(geo,sparkleMat);scene.add(motes);
 let transition=null,elapsed=0,waveStart=-20,selected=-1;let lastTime=performance.now();let lastPointer=0;
 function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);composer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();const distance=Math.max(9.9,4.65/(2*Math.tan(T.MathUtils.degToRad(17.5))*camera.aspect));home.set(.12,1.05,distance);if(selected<0){camera.position.copy(home);controls.target.copy(homeTarget);controls.update()}controls.maxDistance=Math.max(24,distance*1.5)}
 new ResizeObserver(resize).observe(host);resize();
 function tween(position,target){transition={from:camera.position.clone(),to:position.clone(),a:controls.target.clone(),b:target.clone(),start:performance.now(),duration:reduced?1:1250}}
 function reset(){selected=-1;host.dataset.selected='';tween(home,homeTarget)}
 function focus(i){motion.finishIntro();motion.update(elapsed,0,true,elapsed-waveStart);selected=i;host.dataset.selected=String(i);model.root.updateMatrixWorld(true);const g=model.photos[i],p=g.getWorldPosition(new T.Vector3()),q=g.getWorldQuaternion(new T.Quaternion());const normal=new T.Vector3(0,.03,1).applyQuaternion(q).normalize();const target=p.clone();if(innerWidth<=700)target.y-=.45;else target.x+=.45;tween(target.clone().addScaledVector(normal,innerWidth<=700?4.2:3.8),target)}
 function zoom(f){motion.finishIntro();transition=null;const offset=camera.position.clone().sub(controls.target);offset.setLength(T.MathUtils.clamp(offset.length()*f,controls.minDistance,controls.maxDistance));camera.position.copy(controls.target).add(offset);controls.update()}
 function flowerPulse(){waveStart=elapsed}
 controls.addEventListener('start',()=>{motion.finishIntro();transition=null;lastPointer=performance.now()});
 const raycaster=new T.Raycaster(),pointer=new T.Vector2();let down=null,multi=false;const pointers=new Set();let onPhoto=()=>{};
 function hits(e,targets){const rect=host.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);return raycaster.intersectObjects(targets,true)}
 const canvas=renderer.domElement;canvas.addEventListener('pointerdown',e=>{pointers.add(e.pointerId);if(pointers.size>1)multi=true;down=[e.clientX,e.clientY];host.focus({preventScroll:true})});canvas.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);down=null;if(!pointers.size)multi=false});
 canvas.addEventListener('pointerup',e=>{pointers.delete(e.pointerId);const wasMulti=multi;if(!pointers.size)multi=false;if(wasMulti||!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>6)return;down=null;const intersections=hits(e,model.root.children);if(!intersections.length)return;let o=intersections[0].object;if(o.userData.photo!==undefined){onPhoto(o.userData.photo);return}while(o&&o!==model.root){if(o.userData.flower){flowerPulse();return}o=o.parent}});
 canvas.addEventListener('pointermove',e=>{if(e.buttons||performance.now()-lastPointer<70)return;lastPointer=performance.now();const intersections=hits(e,model.photoTargets);canvas.style.cursor=intersections.length?'pointer':'grab'});
 host.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-'].includes(e.key)){e.preventDefault();transition=null;if(e.key==='+'||e.key==='=')zoom(.85);else if(e.key==='-')zoom(1.18);else{const s=new T.Spherical().setFromVector3(camera.position.clone().sub(controls.target));if(e.key==='ArrowLeft')s.theta-=.15;if(e.key==='ArrowRight')s.theta+=.15;if(e.key==='ArrowUp')s.phi=Math.max(.05,s.phi-.15);if(e.key==='ArrowDown')s.phi=Math.min(Math.PI-.05,s.phi+.15);camera.position.copy(new T.Vector3().setFromSpherical(s).add(controls.target));controls.update()}}if(/^[1-4]$/.test(e.key))onPhoto(Number(e.key)-1)});
 let running=true,lastShadow=-1;
 function animate(now){
   if(!running)return;requestAnimationFrame(animate);
   const delta=Math.max(0,(now-lastTime)/1000);lastTime=now;if(document.hidden)return;elapsed+=delta;
   if(transition){const t=Math.min(1,(now-transition.start)/transition.duration),v=t*t*(3-2*t);camera.position.lerpVectors(transition.from,transition.to,v);controls.target.lerpVectors(transition.a,transition.b,v);if(t===1)transition=null}
   controls.update(Math.min(delta,.05));const pulse=elapsed-waveStart;
   const intro=motion.update(elapsed,delta,selected>=0,pulse);
   model.fairy.update(elapsed,intro,reduced);
   sparkleMat.uniforms.time.value=reduced?1:elapsed;sparkleMat.uniforms.burst.value=reduced?0:Math.max(0,1-pulse/2);
   host.dataset.distance=camera.position.distanceTo(controls.target).toFixed(3);host.dataset.intro=intro===1?'complete':'wrapping';
   // Follow the moving silhouettes without rerendering the shadow on every frame.
   if((!reduced&&elapsed-lastShadow>1/20)||lastShadow<0){renderer.shadowMap.needsUpdate=true;lastShadow=elapsed}
   composer.render();
 }
 function start(){lastTime=performance.now();requestAnimationFrame(animate)}
 document.addEventListener('visibilitychange',()=>{lastTime=performance.now()});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();running=false;const loading=document.querySelector('#loading');loading.hidden=false;loading.textContent='Đồ họa bị gián đoạn. Tải lại trang để tiếp tục.'});
 return {...model,renderer,camera,controls,scene,focus,reset,zoom,start,flowerPulse,set onPhoto(fn){onPhoto=fn}};
}

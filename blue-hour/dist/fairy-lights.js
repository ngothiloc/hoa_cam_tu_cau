import * as T from 'three';

export function createFairyLights(){
 const group=new T.Group();group.name='Warm fairy light string';
 // One continuous copper wire follows the flower crown, including its back.
 const points=[];
 for(let i=0;i<=240;i++){
   const t=i/240,angle=-.7+t*Math.PI*5.1;
   const y=.08+t*2.1-.14*Math.max(0,Math.cos(angle))**2+.02*Math.sin(angle*3);
   const radius=1.48-.62*Math.pow(t,3);
   points.push(new T.Vector3(Math.sin(angle)*radius,y,.18+Math.cos(angle)*(1.24-.48*Math.pow(t,3))));
 }
 const curve=new T.CatmullRomCurve3(points);
 const copper=new T.MeshStandardMaterial({color:0xb18a4e,metalness:.7,roughness:.45});
 const wire=new T.Mesh(new T.TubeGeometry(curve,480,.005,6,false),copper);group.add(wire);
 const count=56,bulbMat=new T.MeshBasicMaterial({color:new T.Color(5.5,2.7,.75)});
 const bulbs=new T.InstancedMesh(new T.SphereGeometry(1,10,8),bulbMat,count);
 const sockets=new T.InstancedMesh(new T.CylinderGeometry(.009,.009,.023,7),copper,count);
 const dummy=new T.Object3D(),positions=[];
 for(let i=0;i<count;i++){
   const t=(i+.5)/count,p=curve.getPointAt(t);positions.push(p);
   const outward=new T.Vector3(p.x,.15,p.z-.18).normalize();
   dummy.position.copy(p);dummy.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),outward);dummy.scale.set(1,1,1);dummy.updateMatrix();sockets.setMatrixAt(i,dummy.matrix);
   dummy.position.addScaledVector(outward,.015);dummy.scale.set(.014,.021,.014);dummy.updateMatrix();bulbs.setMatrixAt(i,dummy.matrix);
 }
 group.add(sockets,bulbs);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const ctx=canvas.getContext('2d');const gradient=ctx.createRadialGradient(32,32,0,32,32,32);gradient.addColorStop(0,'rgba(255,255,255,.9)');gradient.addColorStop(.12,'rgba(255,225,174,.6)');gradient.addColorStop(.38,'rgba(255,183,79,.13)');gradient.addColorStop(1,'rgba(255,170,65,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);
 const glowTexture=new T.CanvasTexture(canvas);const glowMat=new T.SpriteMaterial({map:glowTexture,color:0xffc36c,transparent:true,opacity:.7,depthWrite:false,depthTest:true,blending:T.AdditiveBlending});
 for(const p of positions){const halo=new T.Sprite(glowMat);halo.position.copy(p);halo.scale.setScalar(.17);group.add(halo)}
 // A few nearby practical lights give the petals a gentle warm reflection.
 const practical=[];for(const index of [7,19,32,45]){const light=new T.PointLight(0xffce83,.11,1.25,2);light.position.copy(positions[index]);group.add(light);practical.push(light)}
 // Decorative wire and halos should never intercept a click meant for a photo.
 group.traverse(o=>{o.raycast=()=>{}});
 function update(time,intro,reduced){const fade=T.MathUtils.smoothstep(intro,.4,.98);const shimmer=reduced?1:.96+.04*Math.sin(time*1.15);const power=fade*shimmer;group.visible=fade>.001;bulbMat.color.setRGB(5.5*power,2.7*power,.75*power);glowMat.opacity=.72*power;for(const light of practical)light.intensity=.11*power;}
 return {group,update,bulbs,wire};
}

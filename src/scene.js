/* scene.js — ES module. Three.js scene driven by window.__stage (set up in ui.js).
   Set CONFIG.modelUrl to a hosted .glb to swap the procedural blob for your own Blender model. */
import * as THREE from 'three';

const CONFIG = { modelUrl: '' };
const S = window.__stage;
const canvas = document.getElementById('stage');

const NOISE = /* glsl */`
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.); const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.-g;
  vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.; vec4 s1=floor(b1)*2.+1.; vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.); m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const BLOB_VERT = NOISE + /* glsl */`
uniform float uTime; uniform float uStrength; uniform float uPulse;
varying vec3 vView; varying float vN;
void main(){
  vec3 p=position;
  float n=snoise(p*1.15+vec3(0.,uTime*.28,uTime*.18));
  float n2=snoise(p*2.6-vec3(uTime*.22,0.,uTime*.1))*.3;
  float d=(n+n2)*uStrength*.5+uPulse*.3*sin(p.y*4.+uTime*6.);
  p+=normal*d; vN=n;
  vec4 mv=modelViewMatrix*vec4(p,1.); vView=mv.xyz;
  gl_Position=projectionMatrix*mv;
}`;
const BLOB_FRAG = /* glsl */`
uniform vec3 uA; uniform vec3 uB; uniform vec3 uRim; uniform float uOpacity;
varying vec3 vView; varying float vN;
void main(){
  vec3 N=normalize(cross(dFdx(vView),dFdy(vView)));
  vec3 V=normalize(-vView);
  float fr=pow(1.-abs(dot(N,V)),2.4);
  float diff=dot(N,normalize(vec3(.45,.8,.6)))*.5+.5;
  vec3 col=mix(uA,uB,clamp(diff*.8+vN*.35,0.,1.));
  col+=uRim*fr*.9;
  gl_FragColor=vec4(col,uOpacity);
  #include <colorspace_fragment>
}`;
const PART_VERT = /* glsl */`
uniform float uTime; uniform float uPR; uniform float uSize; attribute float aR; varying float vA;
void main(){
  vec3 p=position; float a=uTime*.05*(.4+aR); float c=cos(a); float s=sin(a);
  p.xz=mat2(c,-s,s,c)*p.xz; p.y+=sin(uTime*.4+aR*20.)*.08;
  vec4 mv=modelViewMatrix*vec4(p,1.);
  gl_Position=projectionMatrix*mv;
  gl_PointSize=(1.2+aR*2.8)*uPR*uSize*(6./-mv.z);
  vA=.25+aR*.6;
}`;
const PART_FRAG = /* glsl */`
uniform vec3 uColor; uniform float uOpacity; varying float vA;
void main(){
  float d=length(gl_PointCoord-.5);
  gl_FragColor=vec4(uColor,smoothstep(.5,.0,d)*vA*uOpacity);
  #include <colorspace_fragment>
}`;

const PAL = {
  dark:  { a: '#5b7bff', b: '#ffb089', rim: '#9fb7ff', part: '#c9d6ff', line: '#9db4ff', ring: '#ffb089' },
  light: { a: '#2f56d6', b: '#ff9a62', rim: '#7ea0ff', part: '#3058ca', line: '#3058ca', ring: '#ff7a3d' }
};
const root = document.documentElement;
const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;

boot();

function boot() {
  if (!S || !canvas) return;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !S.mobile, powerPreference: 'high-performance' });
  } catch (e) { S.fail(); return; }
  if (!renderer.getContext()) { S.fail(); return; }

  let pr = Math.min(window.devicePixelRatio || 1, S.mobile ? 1.5 : 1.75);
  renderer.setPixelRatio(pr);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, S.mobile ? 8 : 7);

  const uni = {
    uTime: { value: 0 }, uStrength: { value: 0.5 }, uPulse: { value: 0 }, uOpacity: { value: 1 },
    uA: { value: new THREE.Color() }, uB: { value: new THREE.Color() }, uRim: { value: new THREE.Color() }
  };
  const pal = { a: new THREE.Color(), b: new THREE.Color(), rim: new THREE.Color(), part: new THREE.Color(), line: new THREE.Color(), ring: new THREE.Color() };
  const target = { a: new THREE.Color(), b: new THREE.Color(), rim: new THREE.Color(), part: new THREE.Color(), line: new THREE.Color(), ring: new THREE.Color() };
  function setTargets(snap) {
    const p = PAL[isDark() ? 'dark' : 'light'];
    for (const k in p) { target[k].set(p[k]); if (snap) pal[k].copy(target[k]); }
  }
  setTargets(true);
  new MutationObserver(() => setTargets(false)).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => setTargets(false));

  /* core group: blob + wire shell + rings + invisible raycast proxy */
  const core = new THREE.Group();
  scene.add(core);
  const blobGeo = new THREE.IcosahedronGeometry(1.3, S.mobile ? 20 : 40);
  const blobMat = new THREE.ShaderMaterial({ uniforms: uni, vertexShader: BLOB_VERT, fragmentShader: BLOB_FRAG, transparent: true });
  const blob = new THREE.Mesh(blobGeo, blobMat);
  core.add(blob);

  const shellMat = new THREE.MeshBasicMaterial({ wireframe: true, transparent: true, opacity: 0.14, depthWrite: false });
  const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(1.75, 3), shellMat);
  core.add(shell);

  const rings = new THREE.Group();
  const ringMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.7, depthWrite: false });
  const ringGeo = new THREE.TorusGeometry(2.3, 0.008, 8, 200);
  const r1 = new THREE.Mesh(ringGeo, ringMat), r2 = new THREE.Mesh(ringGeo, ringMat);
  r1.rotation.x = Math.PI / 2.4; r2.rotation.set(Math.PI / 3, Math.PI / 5, 0); r2.scale.setScalar(1.25);
  rings.add(r1, r2); rings.visible = false;
  core.add(rings);

  const proxy = new THREE.Mesh(new THREE.SphereGeometry(1.45, 16, 12), new THREE.MeshBasicMaterial());
  proxy.visible = false; core.add(proxy);

  /* particles */
  const N = S.mobile ? 900 : 2200;
  const pos = new Float32Array(N * 3), rnd = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const r = 3 + Math.pow(Math.random(), 0.7) * 7, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th); pos[i * 3 + 1] = r * Math.cos(ph) * 0.7; pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    rnd[i] = Math.random();
  }
  const partGeo = new THREE.BufferGeometry();
  partGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  partGeo.setAttribute('aR', new THREE.BufferAttribute(rnd, 1));
  const partUni = { uTime: uni.uTime, uPR: { value: pr }, uSize: { value: 60 }, uColor: { value: new THREE.Color() }, uOpacity: { value: 1 } };
  const partMat = new THREE.ShaderMaterial({ uniforms: partUni, vertexShader: PART_VERT, fragmentShader: PART_FRAG, transparent: true, depthWrite: false });
  const points = new THREE.Points(partGeo, partMat);
  points.frustumCulled = false;
  scene.add(points);

  /* optional Blender / GLB model */
  let mixer = null, model = null;
  if (CONFIG.modelUrl) loadModel();
  async function loadModel() {
    try {
      const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
      const gltf = await new GLTFLoader().loadAsync(CONFIG.modelUrl);
      model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
      model.position.sub(c); const k = 2.6 / Math.max(size.x, size.y, size.z);
      const holder = new THREE.Group(); holder.add(model); holder.scale.setScalar(k); core.add(holder); model = holder;
      blob.visible = false;
      if (gltf.animations.length) { mixer = new THREE.AnimationMixer(gltf.scene); mixer.clipAction(gltf.animations[0]).play(); }
    } catch (e) { if (window.console) console.warn('GLB load failed, using procedural core', e); }
  }

  /* pointer + raycaster */
  const ptr = { x: 0, y: 0, tx: 0, ty: 0, nx: 0, ny: 0, moved: false };
  const ray = new THREE.Raycaster(), v2 = new THREE.Vector2();
  let hover = 0, hoverT = 0, pulse = 0;
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    ptr.nx = (e.clientX / innerWidth) * 2 - 1; ptr.ny = -(e.clientY / innerHeight) * 2 + 1;
    ptr.tx = ptr.nx; ptr.ty = ptr.ny; ptr.moved = true;
  }, { passive: true });
  function hit(nx, ny) { v2.set(nx, ny); ray.setFromCamera(v2, camera); return ray.intersectObject(proxy, false).length > 0; }
  window.addEventListener('pointerdown', (e) => {
    if (e.target.closest && e.target.closest('a,button,summary,input,.header')) return;
    if (hit((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1)) pulse = 1;
  }, { passive: true });

  /* sizing */
  function resize() {
    const w = innerWidth, h = innerHeight, a = w / h;
    renderer.setSize(w, h, false);
    camera.aspect = a; camera.fov = a < 0.8 ? 58 : a < 1.2 ? 48 : 40;
    camera.position.z = a < 0.8 ? 8.5 : 7;
    camera.updateProjectionMatrix();
    partUni.uPR.value = pr;
    S.dirty = true;
  }
  let rz = 0;
  addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(resize); });
  resize();

  /* loop */
  const clock = new THREE.Clock();
  let t = 0, raf = 0, coreRot = 0, frames = 0, acc = 0, sig = '', first = true;

  function frame() {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05), st = S.state;

    if (S.reduce) {
      const s = [st.x, st.y, st.z, st.s, st.strength, st.rings, st.opacity, isDark(), innerWidth].join();
      if (s === sig && !S.dirty) return;
      sig = s; S.dirty = false;
    } else t += dt;

    uni.uTime.value = t;
    for (const k in pal) pal[k].lerp(target[k], 0.08);
    uni.uA.value.copy(pal.a); uni.uB.value.copy(pal.b); uni.uRim.value.copy(pal.rim);
    partUni.uColor.value.copy(pal.part); shellMat.color.copy(pal.line); ringMat.color.copy(pal.ring);

    ptr.x += (ptr.tx - ptr.x) * 0.06; ptr.y += (ptr.ty - ptr.y) * 0.06;
    if (ptr.moved && !S.reduce) { hoverT = hit(ptr.nx, ptr.ny) ? 1 : 0; ptr.moved = false; }
    hover += (hoverT - hover) * 0.1; pulse *= 0.94;

    const pm = S.reduce ? 0 : 1;
    core.position.set(st.x, st.y, st.z);
    core.scale.setScalar(st.s * (1 + pulse * 0.08 + hover * 0.05));
    coreRot += dt * 0.15 * st.speed * pm;
    core.rotation.y = coreRot + S.aux * Math.PI * 2 + ptr.x * 0.4 * pm;
    core.rotation.x = Math.sin(t * 0.2) * 0.15 + ptr.y * 0.25 * pm + S.scroll * 1.5;
    blob.rotation.y = -coreRot * 0.6;

    uni.uStrength.value = Math.min(1.4, st.strength + hover * 0.35 + pulse * 0.4);
    uni.uPulse.value = pulse; uni.uOpacity.value = st.opacity;
    shell.rotation.y = -coreRot * 1.4; shell.rotation.x = coreRot * 0.5;
    shellMat.opacity = 0.14 * st.opacity;
    rings.visible = st.rings > 0.01; rings.scale.setScalar(0.001 + st.rings);
    r1.rotation.z = t * 0.2 * pm; r2.rotation.z = -t * 0.14 * pm;
    if (model) model.rotation.y = coreRot * 0.6;
    if (mixer) mixer.update(dt * pm);

    points.rotation.y = t * 0.02 * st.speed + S.scroll * 1.2;
    points.rotation.x = S.scroll * 0.6;
    points.position.y = S.scroll * 2;
    partUni.uOpacity.value = Math.max(0.35, st.opacity);

    camera.position.x += (ptr.x * 0.5 * pm - camera.position.x) * 0.04;
    camera.position.y += (ptr.y * 0.3 * pm - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);

    if (first) { first = false; S.ready = true; window.dispatchEvent(new CustomEvent('stage:ready')); }

    /* adaptive resolution: step down if the GPU struggles */
    if (!S.reduce && ++frames > 60) {
      acc += dt;
      if (frames === 150) {
        if (acc / 90 > 1 / 40 && pr > 1) { pr = Math.max(1, pr - 0.25); renderer.setPixelRatio(pr); resize(); }
        frames = 60; acc = 0;
      }
    }
  }
  raf = requestAnimationFrame(frame);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else { clock.getDelta(); raf = requestAnimationFrame(frame); }
  });

  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); cancelAnimationFrame(raf); S.fail(); });

  addEventListener('pagehide', () => {
    cancelAnimationFrame(raf);
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
    });
    renderer.dispose();
  });
}

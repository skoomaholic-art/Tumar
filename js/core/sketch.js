// «Рисованный» вид: кадр рендерится в текстуру и перерисовывается шейдером под акварель-набросок.
// Сепия с сохранённым красным, чернильный контур по глубине и яркости (линия «дрожит»),
// свет пятнами, штриховка пером в тенях, бумага, затемнение краёв пятен, виньетка.
const SKETCH = (()=>{
  let rt=null, quad=null, pscene=null, pcam=null, mat=null, w=0, h=0;
  const pref = (()=>{ try{ return localStorage.getItem('tumar-sketch'); }catch(e){ return null; } })();
  const S = { enabled: pref!=='0', scale: (matchMedia('(pointer:coarse)').matches ? .75 : 1) };
  const VS = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`;
  const FS = `
precision highp float;
varying vec2 vUv;
uniform sampler2D tColor; uniform sampler2D tDepth;
uniform vec2 res; uniform float near; uniform float far; uniform float boil; uniform float gam;
uniform vec3 inkC; uniform vec3 midC; uniform vec3 paperC; uniform float hueKeep;
float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float a=.5, s=0.; for(int i=0;i<4;i++){ s+=a*vnoise(p); p*=2.03; a*=.5; } return s; }
float lin(float d){ float z=d*2.-1.; return (2.*near*far)/(far+near-z*(far-near)); }
float lum(vec3 c){ return dot(c, vec3(.299,.587,.114)); }
float dep(vec2 uv){ return lin(texture2D(tDepth, uv).x); }
void main(){
  vec2 px = 1./res;
  // линия от руки: координаты чуть сдвинуты шумом, шум меняется рывками (boil)
  vec2 wob = (vec2(vnoise(vUv*res/38.+boil*7.1), vnoise(vUv*res/38.+31.+boil*3.7))-.5)*px*2.6;
  vec2 uv = vUv + wob*.6;
  vec3 col = texture2D(tColor, uv).rgb;
  // --- контур: Собель по глубине (относительный) и по яркости ---
  vec2 e = px*1.25; vec2 uvL = vUv + wob;
  float d00=dep(uvL+vec2(-e.x,-e.y)), d10=dep(uvL+vec2(0.,-e.y)), d20=dep(uvL+vec2(e.x,-e.y));
  float d01=dep(uvL+vec2(-e.x,0.)),   d11=dep(uvL),               d21=dep(uvL+vec2(e.x,0.));
  float d02=dep(uvL+vec2(-e.x,e.y)),  d12=dep(uvL+vec2(0.,e.y)),  d22=dep(uvL+vec2(e.x,e.y));
  // вторая производная: плоскость под скользящим углом (земля к горизонту) не даёт линии, излом и край — дают
  float lap = abs(d01+d21+d10+d12-4.*d11) + .5*abs(d00+d22+d20+d02-4.*d11);
  float dEdge = lap/max(d11,.5)*2.2;
  float sky = step(far*.92, d11);
  float l00=lum(texture2D(tColor,uvL+vec2(-e.x,-e.y)).rgb), l20=lum(texture2D(tColor,uvL+vec2(e.x,-e.y)).rgb);
  float l02=lum(texture2D(tColor,uvL+vec2(-e.x,e.y)).rgb),  l22=lum(texture2D(tColor,uvL+vec2(e.x,e.y)).rgb);
  float lEdge = abs(l00-l22)+abs(l20-l02);
  float fade = 1.-smoothstep(12., 80., d11);            // дальний план — тоньше и светлее, как в эскизе
  float ink = smoothstep(.10,.32,dEdge)*(1.-sky)*mix(.12,1.,fade);
  ink = max(ink, smoothstep(.16,.42,lEdge)*.55*mix(.1,1.,fade));
  ink *= .75 + .5*vnoise(vUv*res/9.+boil*11.);           // нажим пера неровный
  ink = clamp(ink,0.,1.);
  // --- тон: яркость пятнами (3–4 ступени с мягким переходом) ---
  float L = lum(col);
  // ступени с мягким переходом: свет ложится пятнами, но без резких «вырезанных» краёв
  float bands = 4.; float f = L*bands; float q = (floor(f) + smoothstep(.35,.65,fract(f)))/bands;
  float Lt = mix(L, q, .45);
  // палитра: тушь → охра → бумага
  vec3 tone = Lt<.5 ? mix(inkC, midC, Lt*2.) : mix(midC, paperC, (Lt-.5)*2.);
  // немного исходного оттенка, чтобы хаки, трава и войлок различались
  vec3 chroma = col - vec3(L);
  tone += chroma*hueKeep;
  // красный остаётся насыщенным (тумар, полоса на юрте, флаг)
  float red = smoothstep(.10,.28, col.r - max(col.g,col.b)) * smoothstep(.12,.3,col.r);
  vec3 redC = mix(vec3(.30,.05,.04), vec3(.52,.08,.06), clamp(L*1.6,0.,1.));
  tone = mix(tone, redC, red*.85);
  // --- акварель: неровная заливка, пигмент темнеет к краям пятна ---
  float wash = fbm(vUv*res/220. + 3.) ;
  tone *= .9 + .2*wash;
  tone *= 1. - .18*smoothstep(.04,.2,lEdge);
  // --- штриховка пером в тенях: диагональ, в глубокой тени — перекрёстная ---
  vec2 sp = vUv*res;
  float hatch1 = smoothstep(.55,.9, sin((sp.x+sp.y)*.9 + vnoise(sp/30.)*3.)*.5+.5);
  float hatch2 = smoothstep(.6,.92, sin((sp.x-sp.y)*.95 + vnoise(sp/27.+9.)*3.)*.5+.5);
  float dark = 1.-smoothstep(.12,.42,L);
  float hatch = hatch1*smoothstep(.0,.5,dark) + hatch2*smoothstep(.5,1.,dark);
  tone = mix(tone, inkC, hatch*.38*(1.-sky)*(1.-red));
  // --- бумага ---
  float fib = fbm(sp/3.5)*.5 + fbm(sp/40.)*.5;
  vec3 paper = paperC*(.93+.1*fib);
  tone = mix(tone, tone*paper/paperC, .6);
  // чернила
  tone = mix(tone, inkC*.85, ink);
  // виньетка
  vec2 vc = vUv-.5; tone *= 1. - .55*pow(dot(vc,vc)*1.9, 1.6);
  tone *= gam;
  gl_FragColor = vec4(tone, 1.);
}`;
  function ensure(){
    const pr = renderer.getPixelRatio()*S.scale;
    const W = Math.max(2, Math.floor(innerWidth*pr)), H = Math.max(2, Math.floor(innerHeight*pr));
    if(rt && W===w && H===h) return;
    w=W; h=H;
    if(rt){ rt.dispose(); rt.depthTexture.dispose(); }
    rt = new THREE.WebGLRenderTarget(W, H, { minFilter:THREE.LinearFilter, magFilter:THREE.LinearFilter, format:THREE.RGBAFormat });
    rt.texture.encoding = THREE.sRGBEncoding;
    rt.depthTexture = new THREE.DepthTexture(W, H); rt.depthTexture.type = THREE.UnsignedIntType;
    if(!mat){
      mat = new THREE.ShaderMaterial({ vertexShader:VS, fragmentShader:FS, depthTest:false, depthWrite:false, uniforms:{
        tColor:{value:null}, tDepth:{value:null}, res:{value:new THREE.Vector2()}, near:{value:.1}, far:{value:1000},
        boil:{value:0}, gam:{value:1}, hueKeep:{value:.28},
        inkC:{value:new THREE.Color(0x231a12)}, midC:{value:new THREE.Color(0x8c6c45)}, paperC:{value:new THREE.Color(0xeee2c6)} } });
      quad = new THREE.Mesh(new THREE.PlaneGeometry(2,2), mat); quad.frustumCulled=false;
      pscene = new THREE.Scene(); pscene.add(quad); pcam = new THREE.Camera();
    }
    mat.uniforms.res.value.set(W,H);
  }
  // палитра главы: [тушь, середина, бумага], доля исходного оттенка
  S.palette = (ink, mid, paper, hueKeep=.28)=>{ ensure(); mat.uniforms.inkC.value.setHex(ink); mat.uniforms.midC.value.setHex(mid); mat.uniforms.paperC.value.setHex(paper); mat.uniforms.hueKeep.value=hueKeep; };
  S.render = (scene, cam, t=0)=>{
    ensure();
    renderer.setRenderTarget(rt); renderer.render(scene, cam); renderer.setRenderTarget(null);
    const u=mat.uniforms; u.tColor.value=rt.texture; u.tDepth.value=rt.depthTexture;
    u.near.value=cam.near||.1; u.far.value=cam.far||1000; u.boil.value=Math.floor(t*6)/6;
    u.gam.value=(typeof SETTINGS!=='undefined' && +SETTINGS.gamma)||1;
    renderer.render(pscene, pcam);
  };
  S.set = on=>{ S.enabled=!!on; try{ localStorage.setItem('tumar-sketch', on?'1':'0'); }catch(e){} };
  return S;
})();
// отрисовка кадра: рисованный вид, если сцена его поддерживает и он включён
function renderFrame(t){
  if(!scene) return;
  const on = SKETCH.enabled && active && active.sketch;
  document.body.classList.toggle('sketch', !!on);
  if(on){ try{ SKETCH.render(scene, camera, t); return; }catch(e){ console.error('sketch off:', e); SKETCH.enabled=false; renderer.setRenderTarget(null); document.body.classList.remove('sketch'); } }
  renderer.render(scene, camera);
}
// переключатель в настройках
(()=>{ const b=document.getElementById('sketchBtn'); if(!b) return;
  const lab=()=>{ b.textContent='Рисованный стиль: '+(SKETCH.enabled?'вкл':'выкл'); };
  lab(); b.addEventListener('click',()=>{ SKETCH.set(!SKETCH.enabled); lab(); }); })();

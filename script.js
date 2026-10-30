(function () {
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mouse = { nx: 0, ny: 0 };

  /* circuit board background */
var cv=document.getElementById("gl"),cx=cv.getContext("2d"),dpr=Math.min(devicePixelRatio,2),W,H,paths=[],layer,G=44;
var DX=[1,1,0,-1,-1,-1,0,1],DY=[0,1,1,1,0,-1,-1,-1];
function build(){
W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;
layer=document.createElement("canvas");layer.width=cv.width;layer.height=cv.height;
var l=layer.getContext("2d");l.scale(dpr,dpr);
l.strokeStyle="rgba(111,138,163,.22)";l.lineWidth=1.5;l.fillStyle="rgba(111,138,163,.4)";
paths=[];
var n=Math.round(W*H/16000);
for(var p=0;p<n;p++){
var x=Math.round(Math.random()*W/G)*G,y=Math.round(Math.random()*H/G)*G,pts=[[x,y]],dir=Math.floor(Math.random()*8),steps=4+Math.floor(Math.random()*8);
for(var s=0;s<steps;s++){
if(Math.random()<.45)dir=(dir+(Math.random()<.5?1:7))%8;
var len=1+Math.floor(Math.random()*3);
x+=DX[dir]*G*len;y+=DY[dir]*G*len;pts.push([x,y])}
var cum=[0],tot=0;
for(var i=1;i<pts.length;i++){tot+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);cum.push(tot)}
paths.push({pts:pts,cum:cum,total:tot,t:Math.random()*tot,v:45+Math.random()*60});
l.beginPath();pts.forEach(function(q,i){i?l.lineTo(q[0],q[1]):l.moveTo(q[0],q[1])});l.stroke();
[pts[0],pts[pts.length-1]].forEach(function(q){l.beginPath();l.arc(q[0],q[1],4,0,6.283);l.stroke();l.beginPath();l.arc(q[0],q[1],1.6,0,6.283);l.fill()})}}
function at(p,d){
if(d<0||d>p.total)return null;
for(var i=1;i<p.cum.length;i++){if(d<=p.cum[i]){var a=p.pts[i-1],b=p.pts[i],f=(d-p.cum[i-1])/(p.cum[i]-p.cum[i-1]);return[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f]}}
return null}
build();
var rt;addEventListener("resize",function(){clearTimeout(rt);rt=setTimeout(build,200)});
var last=performance.now();
function frame(now){
var dt=Math.min((now-last)/1000,.05);last=now;
var mx=(mouse.nx+1)/2*W,my=(mouse.ny+1)/2*H;
cx.setTransform(1,0,0,1,0,0);cx.clearRect(0,0,cv.width,cv.height);cx.drawImage(layer,0,0);
cx.setTransform(dpr,0,0,dpr,0,0);cx.globalCompositeOperation="lighter";
paths.forEach(function(p){
var h=at(p,p.t),ref=h||p.pts[0],d=Math.hypot(ref[0]-mx,ref[1]-my),boost=1;
if(d<170){
var f=1-d/170;boost=1+f*3;
cx.strokeStyle="rgba(200,121,46,"+(f*.5)+")";cx.lineWidth=1.5;
cx.beginPath();p.pts.forEach(function(q,i){i?cx.lineTo(q[0],q[1]):cx.moveTo(q[0],q[1])});cx.stroke()}
for(var k=0;k<15;k++){
var q=at(p,p.t-k*7);
if(q){cx.fillStyle="rgba(200,121,46,"+((1-k/15)*.9)+")";cx.beginPath();cx.arc(q[0],q[1],2.2*(1-k/20),0,6.283);cx.fill()}}
if(h){cx.fillStyle="rgba(255,170,80,.18)";cx.beginPath();cx.arc(h[0],h[1],9,0,6.283);cx.fill()}
if(!reduce){p.t+=p.v*boost*dt;if(p.t>p.total+110)p.t=-Math.random()*300}});
cx.globalCompositeOperation="source-over";
if(!reduce)requestAnimationFrame(frame)}
requestAnimationFrame(frame);

  /* pointer */
  var glow = document.getElementById("glow");
  addEventListener("pointermove", function (e) {
    mouse.nx = (e.clientX / innerWidth) * 2 - 1;
    mouse.ny = (e.clientY / innerHeight) * 2 - 1;
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  });

  /* name scramble */
  var nm = document.getElementById("name"),
    final = nm.textContent,
    ch = "01#<>/\\|=+*";
  if (!reduce) {
    var f = 0,
      iv = setInterval(function () {
        nm.textContent = final
          .split("")
          .map(function (c, i) {
            return c === " " || i < f / 2
              ? c
              : ch[Math.floor(Math.random() * ch.length)];
          })
          .join("");
        if (++f > final.length * 2 + 2) {
          clearInterval(iv);
          nm.textContent = final;
        }
      }, 38);
  }

  /* role typing */
  var roles = [
      "Electrical & Electronic Engineering student",
      "Signal monitoring, SIWES trained",
      "IoT and solar switching systems",
      "Open to graduate trainee roles",
    ],
    ri = 0,
    ci = 0,
    del = false,
    el = document.getElementById("role");
  function type() {
    var r = roles[ri];
    if (reduce) {
      el.textContent = r;
      return;
    }
    el.textContent = r.slice(0, ci);
    if (!del && ci < r.length) {
      ci++;
      setTimeout(type, 45);
    } else if (!del) {
      del = true;
      setTimeout(type, 1400);
    } else if (ci > 0) {
      ci--;
      setTimeout(type, 22);
    } else {
      del = false;
      ri = (ri + 1) % roles.length;
      setTimeout(type, 300);
    }
  }
  type();

  /* reveal on scroll */
  var io = new IntersectionObserver(
    function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("on");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 },
  );
  document.querySelectorAll(".rv").forEach(function (n) {
    io.observe(n);
  });

  /* 3D tilt on cards */
  if (!reduce && matchMedia("(pointer:fine)").matches)
    document.querySelectorAll(".tilt").forEach(function (n) {
      n.addEventListener("pointermove", function (e) {
        var b = n.getBoundingClientRect(),
          x = (e.clientX - b.left) / b.width - 0.5,
          y = (e.clientY - b.top) / b.height - 0.5;
        n.style.transform =
          "perspective(900px) rotateY(" +
          x * 7 +
          "deg) rotateX(" +
          -y * 7 +
          "deg)";
      });
      n.addEventListener("pointerleave", function () {
        n.style.transform = "";
      });
    });

  /* solar switch simulation */
  var sw = document.getElementById("sw"),
    st = document.getElementById("stage"),
    lg = document.getElementById("log"),
    on = false,
    lines = [];
  sw.addEventListener("click", function () {
    on = !on;
    sw.setAttribute("aria-checked", on);
    var ms = Math.round(900 + Math.random() * 300);
    lines.unshift(
      (on ? "Command sent: output ON" : "Command sent: output OFF") +
        " (relay " +
        (on ? "closed" : "opened") +
        " in " +
        (ms / 1000).toFixed(1) +
        " s)",
    );
    lines = lines.slice(0, 4);
    lg.innerHTML = lines.join("<br>");
    setTimeout(
      function () {
        st.classList.toggle("on-state", on);
      },
      reduce ? 0 : ms * 0.4,
    );
  });
  /* nav: highlight current section and show scroll progress */
var navEl=document.querySelector("nav"),links=[].slice.call(document.querySelectorAll(".links a")),secs=links.map(function(a){return document.querySelector(a.getAttribute("href"))});
function spy(){
var y=scrollY+innerHeight*.35,cur=-1;
secs.forEach(function(s,i){if(s&&s.offsetTop<=y)cur=i});
links.forEach(function(a,i){a.classList.toggle("active",i===cur)});
var h=document.documentElement.scrollHeight-innerHeight;
navEl.style.setProperty("--p",h>0?scrollY/h:0)}
addEventListener("scroll",spy,{passive:true});spy();
})();

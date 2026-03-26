/* ============================================================
   ASTOR — Main JavaScript
   GSAP + ScrollTrigger + Canvas Animations
   ============================================================ */
gsap.registerPlugin(ScrollTrigger);

/* Dynamic copyright year */
(function(){
  var el = document.getElementById('footerYear');
  if(el) el.textContent = new Date().getFullYear();
})();

/* ============================================================
   1. SIDEBAR MENU
   ============================================================ */
(function(){
  var menuBtn = document.getElementById('menuButton');
  var overlay = document.getElementById('menuOverlay');
  var navLinks = overlay.querySelectorAll('.menu-nav a');

  menuBtn.addEventListener('click', function(){
    menuBtn.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = overlay.classList.contains('active') ? 'hidden' : '';
  });

  navLinks.forEach(function(link){
    link.addEventListener('click', function(){
      menuBtn.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
})();

/* ============================================================
   2. HERO — Particle Text "ASTOR"
   ============================================================ */
(function(){
  var canvas = document.getElementById('heroCanvas');
  if(!canvas) return;
  var ctx = canvas.getContext('2d');
  var W, H, dpr;
  var particles = [];
  var mouse = { x: -9999, y: -9999 };
  var MOUSE_RADIUS = 120;
  var PARTICLE_COUNT = 6000;
  var SPRING = 0.08;
  var DAMPING = 0.85;
  var REPULSION = 8000;

  // Color palette: gold, platinum, warm white + pastel rainbow accents
  var palette = [
    [201,169,110],  // gold
    [218,195,145],  // light gold
    [240,225,190],  // platinum/cream
    [255,245,220],  // warm white
    [180,155,100],  // dark gold
    [230,210,170],  // champagne
    // pastel rainbow accents (subtle)
    [255,182,185],  // pastel pink
    [255,218,185],  // pastel peach
    [255,240,175],  // pastel yellow
    [185,240,200],  // pastel mint
    [175,215,255],  // pastel blue
    [210,185,255],  // pastel lavender
  ];

  function resize(){
    dpr = window.devicePixelRatio || 1;
    W = canvas.parentElement.clientWidth;
    H = canvas.parentElement.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    sampleText();
  }

  function sampleText(){
    var offCanvas = document.createElement('canvas');
    var offCtx = offCanvas.getContext('2d');
    var text = 'ASTOR';
    var fontSize = Math.min(W * 0.22, 320);  // %50 bigger
    offCanvas.width = W;
    offCanvas.height = H;
    offCtx.fillStyle = '#ffffff';
    offCtx.font = '800 ' + fontSize + 'px "Bricolage Grotesque", sans-serif';
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.fillText(text, W / 2, H * 0.42);

    var imageData = offCtx.getImageData(0,0,W,H);
    var data = imageData.data;
    var positions = [];

    var gap = Math.max(2, Math.floor(Math.sqrt((W * H) / (PARTICLE_COUNT * 8))));
    for(var y = 0; y < H; y += gap){
      for(var x = 0; x < W; x += gap){
        var idx = (y * W + x) * 4;
        if(data[idx + 3] > 128){
          positions.push({ x: x, y: y });
        }
      }
    }

    for(var i = positions.length - 1; i > 0; i--){
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = positions[i]; positions[i] = positions[j]; positions[j] = tmp;
    }
    var selected = positions.slice(0, PARTICLE_COUNT);

    particles = [];
    for(var i = 0; i < selected.length; i++){
      var p = selected[i];
      var rnd = Math.random();
      var col;
      if(rnd < 0.7){
        // 70% gold/platinum tones (first 6 colors)
        col = palette[Math.floor(Math.random() * 6)];
      } else {
        // 30% pastel rainbow accents (last 6 colors)
        col = palette[6 + Math.floor(Math.random() * 6)];
      }
      // Some particles are extra bright (platinum sparkle)
      var bright = Math.random() < 0.15;
      var pr = bright ? Math.min(255, col[0] + 40) : col[0];
      var pg = bright ? Math.min(255, col[1] + 40) : col[1];
      var pb = bright ? Math.min(255, col[2] + 40) : col[2];
      particles.push({
        x: Math.random() * W, y: Math.random() * H,
        ox: p.x, oy: p.y,
        vx: 0, vy: 0,
        r: bright ? (Math.random() * 1.8 + 1.2) : (Math.random() * 1.4 + 0.7),
        colorR: pr, colorG: pg, colorB: pb,
        bright: bright
      });
    }
  }

  canvas.addEventListener('mousemove', function(e){
    var rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.addEventListener('mouseleave', function(){ mouse.x = -9999; mouse.y = -9999; });
  canvas.addEventListener('touchmove', function(e){
    e.preventDefault();
    var rect = canvas.getBoundingClientRect();
    mouse.x = e.touches[0].clientX - rect.left;
    mouse.y = e.touches[0].clientY - rect.top;
  }, { passive: false });
  canvas.addEventListener('touchend', function(){ mouse.x = -9999; mouse.y = -9999; });

  function animate(){
    ctx.clearRect(0,0,W,H);
    for(var i = 0; i < particles.length; i++){
      var p = particles[i];
      var dx = p.ox - p.x;
      var dy = p.oy - p.y;
      p.vx += dx * SPRING;
      p.vy += dy * SPRING;
      var mx = p.x - mouse.x;
      var my = p.y - mouse.y;
      var mDist = Math.sqrt(mx*mx + my*my);
      if(mDist < MOUSE_RADIUS && mDist > 0){
        var force = REPULSION / (mDist * mDist);
        p.vx += (mx/mDist) * force;
        p.vy += (my/mDist) * force;
      }
      p.vx *= DAMPING;
      p.vy *= DAMPING;
      p.x += p.vx;
      p.y += p.vy;
      var distFromOrigin = Math.sqrt(dx*dx + dy*dy);
      var alpha = Math.min(1, 0.6 + distFromOrigin * 0.004);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba('+p.colorR+','+p.colorG+','+p.colorB+','+alpha.toFixed(3)+')';
      ctx.fill();
      // Bright particles get a soft glow
      if(p.bright){
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba('+p.colorR+','+p.colorG+','+p.colorB+','+(alpha*0.12).toFixed(3)+')';
        ctx.fill();
      }
    }
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize);
  document.fonts.ready.then(function(){
    resize();
    animate();
    // Hero entrance animations
    gsap.to('.hero-subtitle', { opacity:1, y:0, duration:0.8, delay:0.5 });
    gsap.to('.hero-tagline', { opacity:1, y:0, duration:0.8, delay:1 });
  });
})();

/* ============================================================
   3. 3D HOVER LAYERS
   ============================================================ */
(function(){
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(prefersReduced) return;

  document.querySelectorAll('[data-layers]').forEach(function(card){
    var bg = card.querySelector('.layer-bg');
    var content = card.querySelector('.layer-content');
    var overlay = card.querySelector('.layer-overlay');
    var isHovered = false;

    card.addEventListener('mouseenter', function(){
      isHovered = true;
      gsap.to(bg, { z:-40, duration:0.5, ease:'power2.out' });
      gsap.to(content, { z:0, duration:0.5, ease:'power2.out' });
      gsap.to(overlay, { z:40, duration:0.5, ease:'power2.out' });
    });

    card.addEventListener('mousemove', function(e){
      if(!isHovered) return;
      var rect = card.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(card, { rotateX: -y*15, rotateY: x*15, duration:0.3, ease:'power2.out' });
    });

    card.addEventListener('mouseleave', function(){
      isHovered = false;
      gsap.to(bg, { z:0, duration:0.5, ease:'power2.out' });
      gsap.to(content, { z:0, duration:0.5, ease:'power2.out' });
      gsap.to(overlay, { z:0, duration:0.5, ease:'power2.out' });
      gsap.to(card, { rotateX:0, rotateY:0, duration:0.5, ease:'power2.out' });
    });
  });
})();

/* ============================================================
   4. CULTURE MOSAIC
   ============================================================ */
(function(){
  var tiles = document.querySelectorAll('.mosaic-tile');
  tiles.forEach(function(tile, i){
    ScrollTrigger.create({
      trigger: tile, start:'top 88%', once:true,
      onEnter: function(){
        gsap.to(tile, { opacity:1, y:0, duration:0.6, delay:i*0.07, ease:'power3.out' });
      }
    });
  });

  var statNumbers = document.querySelectorAll('.stat-number[data-target]');
  statNumbers.forEach(function(el){
    var target = parseInt(el.dataset.target, 10);
    ScrollTrigger.create({
      trigger: el, start:'top 85%', once:true,
      onEnter: function(){
        var obj = {val:0};
        gsap.to(obj, {
          val:target, duration:1.5, delay:0.2, ease:'power2.out',
          onUpdate:function(){ el.textContent = Math.round(obj.val); }
        });
      }
    });
  });

  document.querySelectorAll('.tile-photo').forEach(function(tile){
    tile.addEventListener('mouseenter', function(){ gsap.to(tile, {scale:1.02, duration:0.3, ease:'power2.out'}); });
    tile.addEventListener('mouseleave', function(){ gsap.to(tile, {scale:1, duration:0.3, ease:'power2.out'}); });
  });
  document.querySelectorAll('.tile-value').forEach(function(tile){
    tile.addEventListener('mouseenter', function(){ gsap.to(tile, {scale:1.03, duration:0.3, ease:'power2.out'}); });
    tile.addEventListener('mouseleave', function(){ gsap.to(tile, {scale:1, duration:0.3, ease:'power2.out'}); });
  });

  var footer = document.getElementById('mosaicFooter');
  if(footer){
    ScrollTrigger.create({
      trigger: footer, start:'top 92%', once:true,
      onEnter: function(){ gsap.to(footer, {opacity:1, duration:0.6, ease:'power2.out'}); }
    });
  }
})();

/* ============================================================
   5. HOVER REVEAL GALLERY
   ============================================================ */
(function(){
  var items = document.querySelectorAll('.project-item');
  var hoverImg = document.getElementById('hoverImage');
  var hoverImgEl = document.getElementById('hoverImageImg');

  var images = [
    'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=280&fit=crop',
    'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&h=280&fit=crop',
    'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=400&h=280&fit=crop',
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&h=280&fit=crop',
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=280&fit=crop',
    'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400&h=280&fit=crop'
  ];

  var mouseX = 0, mouseY = 0;
  var isHovering = false;

  document.addEventListener('mousemove', function(e){ mouseX = e.clientX; mouseY = e.clientY; });

  gsap.ticker.add(function(){
    if(isHovering){
      gsap.to(hoverImg, { x: mouseX + 20, y: mouseY - 130, duration:0.4, ease:'power2.out', overwrite:'auto' });
    }
  });

  items.forEach(function(item){
    var idx = parseInt(item.dataset.img);
    item.addEventListener('mouseenter', function(){
      hoverImgEl.src = images[idx];
      isHovering = true;
      gsap.to(hoverImg, {opacity:1, scale:1, duration:0.35, ease:'power2.out'});
    });
    item.addEventListener('mouseleave', function(){
      isHovering = false;
      gsap.to(hoverImg, {opacity:0, scale:0.9, duration:0.25, ease:'power2.in'});
    });
  });

  items.forEach(function(item, i){
    ScrollTrigger.create({
      trigger: item, start:'top 85%', once:true,
      onEnter: function(){ gsap.to(item, {opacity:1, y:0, duration:0.5, delay:i*0.08, ease:'power3.out'}); }
    });
  });
})();

/* ============================================================
   6. GANTT TIMELINE
   ============================================================ */
(function(){
  var bars = document.querySelectorAll('.gantt-bar');
  var todayLine = document.getElementById('todayLine');
  var depSvg = document.getElementById('depSvg');

  var deps = [[0,1],[1,2],[2,3],[2,4],[4,5]];
  function drawDeps(){
    var barsArr = document.querySelectorAll('.gantt-bar');
    var bodyRect = document.getElementById('ganttBody');
    var svgRect = depSvg.getBoundingClientRect();

    deps.forEach(function(d){
      var fromBar = barsArr[d[0]];
      var toBar = barsArr[d[1]];
      if(!fromBar || !toBar) return;
      var fromRect = fromBar.getBoundingClientRect();
      var toRect = toBar.getBoundingClientRect();
      var x1 = fromRect.right - svgRect.left;
      var y1 = fromRect.top + fromRect.height/2 - svgRect.top;
      var x2 = toRect.left - svgRect.left;
      var y2 = toRect.top + toRect.height/2 - svgRect.top;
      var midX = x1 + (x2-x1)*0.5;
      var path = document.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('class','dep-arrow');
      path.setAttribute('d','M'+x1+','+y1+' C'+midX+','+y1+' '+midX+','+y2+' '+x2+','+y2);
      depSvg.appendChild(path);
    });
  }

  ScrollTrigger.create({
    trigger: '.gantt-container', start:'top 75%', once:true,
    onEnter: function(){
      bars.forEach(function(bar, i){
        gsap.to(bar, { scaleX:1, duration:0.8, delay:i*0.15, ease:'power2.out' });
      });
      gsap.to(todayLine, { opacity:1, duration:0.5, delay:1 });
      setTimeout(function(){
        drawDeps();
        var arrows = depSvg.querySelectorAll('.dep-arrow');
        gsap.to(arrows, { opacity:1, duration:0.5, stagger:0.1, delay:0.2 });
      }, 1200);
    }
  });
})();

/* ============================================================
   7. COMPARISON SLIDER (Pointer-based — mouse + touch)
   ============================================================ */
(function(){
  var wrapper = document.getElementById('compWrapper');
  var handle = document.getElementById('compHandle');
  var panelLeft = document.getElementById('compLeft');
  if(!wrapper || !handle) return;

  var isDragging = false;
  var wrapperRect;
  var currentPct = 50;

  function setPosition(pct) {
    pct = Math.max(2, Math.min(98, pct));
    currentPct = pct;
    handle.style.left = pct + '%';
    panelLeft.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
  }

  function updateRect() {
    wrapperRect = wrapper.getBoundingClientRect();
  }

  setPosition(50);

  // Pointer events on handle (captures both mouse & touch)
  handle.addEventListener('pointerdown', function(e) {
    e.preventDefault();
    handle.setPointerCapture(e.pointerId);
    isDragging = true;
    updateRect();
  });

  handle.addEventListener('pointermove', function(e) {
    if (!isDragging) return;
    var x = e.clientX - wrapperRect.left;
    var pct = (x / wrapperRect.width) * 100;
    gsap.to({ val: currentPct }, {
      val: pct, duration: 0.08, ease: 'power2.out',
      onUpdate: function() { setPosition(this.targets()[0].val); }
    });
  });

  handle.addEventListener('pointerup', function() { isDragging = false; });
  handle.addEventListener('lostpointercapture', function() { isDragging = false; });

  // Click anywhere on wrapper to jump
  wrapper.addEventListener('pointerdown', function(e) {
    if (e.target === handle || handle.contains(e.target)) return;
    updateRect();
    var x = e.clientX - wrapperRect.left;
    var pct = (x / wrapperRect.width) * 100;
    gsap.to({ val: currentPct }, {
      val: pct, duration: 0.4, ease: 'power3.out',
      onUpdate: function() { setPosition(this.targets()[0].val); }
    });
  });

  window.addEventListener('resize', updateRect);

  // Entrance animations
  gsap.from('.cs-header', { opacity: 0, y: 50, duration: 0.8, scrollTrigger: { trigger: '.cs-header', start: 'top 85%' } });
  gsap.fromTo('.comparison-wrapper', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: '.comparison-wrapper', start: 'top 80%' } });
  gsap.fromTo(handle, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.8, delay: 0.3, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.comparison-wrapper', start: 'top 75%' } });

  // Auto-demo: slide right then back on first view
  ScrollTrigger.create({
    trigger: '.comparison-wrapper', start: 'top 70%', once: true,
    onEnter: function() {
      gsap.to({ v: 50 }, { v: 72, duration: 0.8, ease: 'power2.inOut', onUpdate: function() { setPosition(this.targets()[0].v); } })
        .then(function() { return gsap.to({ v: 72 }, { v: 50, duration: 0.8, ease: 'power2.inOut', delay: 0.2, onUpdate: function() { setPosition(this.targets()[0].v); } }); });
    }
  });

  ScrollTrigger.batch('.cs-stat', {
    onEnter: function(b) { gsap.fromTo(b, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12 }); },
    start: 'top 90%'
  });
})();

/* ============================================================
   8. MORPH ZOOM JOURNEY
   ============================================================ */
(function(){
  "use strict";
  var COUNT = 1200;
  var SECTION = 1/8;
  var GOLDEN_ANGLE = 137.508 * (Math.PI / 180);

  var colors = [
    [201,169,110], // 0 circle: gold (pamuk)
    [56,189,248],   // 1 square: blue (iplik)
    [52,211,153],   // 2 triangle: green (orme)
    [251,146,60],   // 3 flower: orange (boyama)
    [236,72,153],   // 4 pentagon: pink (kalite)
    [239,68,68],    // 5 explosion: red
    [168,85,247],   // 6 gather: violet (moda)
    [34,197,94]     // 7 phyllotaxis: emerald
  ];

  var sectionCenterX = [0.3, 0.7, 0.3, 0.7, 0.3, 0.5, 0.7, 0.5];

  var cardConfig = [
    { id:'card0', hasCard:true },
    { id:'card1', hasCard:true },
    { id:'card2', hasCard:true },
    { id:'card3', hasCard:true },
    { id:'card4', hasCard:true },
    { id:null,    hasCard:false },
    { id:'card6', hasCard:true },
    { id:null,    hasCard:false }
  ];

  var canvas = document.getElementById('morphCanvas');
  if(!canvas) return;
  var ctx = canvas.getContext('2d');
  var progressBar = document.getElementById('morphProgressBar');
  var scrollHint = document.getElementById('morphScrollHint');
  var W, H, dpr;
  var particles = [];
  var shapes = [[],[],[],[],[]];
  var explosionTargets = [];
  var phylloTargets = [];
  var progress = 0;
  var time = 0;
  var currentSection = 0;
  var mouse = { x:-9999, y:-9999 };
  var cx = 0, cy = 0;
  var targetCX = 0, targetCY = 0;

  function lerp(a,b,t){ return a+(b-a)*t; }
  function easeIO(t){ return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2; }
  function easeCubicOut(t){ return 1-Math.pow(1-t,3); }
  function easeCubicIO(t){ return t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2; }

  function generateAll(){
    var base = Math.min(W,H)*0.22;
    // Circle
    shapes[0]=[];
    for(var i=0;i<COUNT;i++){
      var a=(i/COUNT)*Math.PI*2;
      var r=base*(0.3+Math.random()*0.7);
      shapes[0].push({x:Math.cos(a)*r, y:Math.sin(a)*r});
    }
    // Square
    shapes[1]=[];
    var hs=base*0.9;
    for(var i=0;i<COUNT;i++){
      var side=Math.floor(Math.random()*4),t=Math.random(),x,y;
      if(side===0){x=-hs+t*hs*2;y=-hs;}
      else if(side===1){x=hs;y=-hs+t*hs*2;}
      else if(side===2){x=hs-t*hs*2;y=hs;}
      else{x=-hs;y=hs-t*hs*2;}
      if(Math.random()<0.35){x=(Math.random()-0.5)*hs*2;y=(Math.random()-0.5)*hs*2;}
      shapes[1].push({x:x,y:y});
    }
    // Triangle
    shapes[2]=[];
    var tH=base*1.6,tW=base*1.8;
    var tv=[{x:0,y:-tH*0.5},{x:-tW*0.5,y:tH*0.5},{x:tW*0.5,y:tH*0.5}];
    for(var i=0;i<COUNT;i++){
      if(Math.random()<0.5){
        var e=Math.floor(Math.random()*3),t=Math.random();
        var a=tv[e],b=tv[(e+1)%3];
        shapes[2].push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
      }else{
        var r1=Math.random(),r2=Math.random();
        if(r1+r2>1){r1=1-r1;r2=1-r2;}
        shapes[2].push({x:tv[0].x+r1*(tv[1].x-tv[0].x)+r2*(tv[2].x-tv[0].x),y:tv[0].y+r1*(tv[1].y-tv[0].y)+r2*(tv[2].y-tv[0].y)});
      }
    }
    // Flower
    shapes[3]=[];
    for(var i=0;i<COUNT;i++){
      var a=(i/COUNT)*Math.PI*2;
      var wave=Math.cos(8*a);
      var r=base*(0.4+0.6*Math.abs(wave))*(0.5+Math.random()*0.5);
      shapes[3].push({x:Math.cos(a)*r,y:Math.sin(a)*r});
    }
    // Pentagon
    shapes[4]=[];
    var pentR=base*0.95;
    var pv=[];
    for(var k=0;k<5;k++){var a=(k/5)*Math.PI*2-Math.PI/2;pv.push({x:Math.cos(a)*pentR,y:Math.sin(a)*pentR});}
    for(var i=0;i<COUNT;i++){
      if(Math.random()<0.45){
        var e=Math.floor(Math.random()*5),t=Math.random();
        shapes[4].push({x:pv[e].x+(pv[(e+1)%5].x-pv[e].x)*t,y:pv[e].y+(pv[(e+1)%5].y-pv[e].y)*t});
      }else{
        var e=Math.floor(Math.random()*5);
        var r1=Math.random(),r2=Math.random();
        if(r1+r2>1){r1=1-r1;r2=1-r2;}
        shapes[4].push({x:r1*pv[e].x+r2*pv[(e+1)%5].x,y:r1*pv[e].y+r2*pv[(e+1)%5].y});
      }
    }
    // Explosion
    explosionTargets=[];
    for(var i=0;i<COUNT;i++){
      var ang=Math.random()*Math.PI*2;
      var dist=300+Math.random()*500;
      explosionTargets.push({x:shapes[4][i].x+Math.cos(ang)*dist,y:shapes[4][i].y+Math.sin(ang)*dist});
    }
    // Phyllotaxis
    phylloTargets=[];
    var maxR=Math.min(W,H)*0.42;
    var spacing=maxR/Math.sqrt(COUNT);
    for(var i=0;i<COUNT;i++){
      var angle=i*GOLDEN_ANGLE;
      var r=spacing*Math.sqrt(i);
      phylloTargets.push({x:Math.cos(angle)*r,y:Math.sin(angle)*r,distRatio:r/maxR,baseSize:2+(1-r/maxR)*6});
    }
  }

  function initParticles(){
    particles=[];
    for(var i=0;i<COUNT;i++){
      particles.push({x:shapes[0][i].x,y:shapes[0][i].y,noiseX:(Math.random()-0.5)*5,noiseY:(Math.random()-0.5)*5,size:Math.random()*2+1.2});
    }
  }

  function resizeMorph(){
    dpr=window.devicePixelRatio||1;
    W=window.innerWidth-60;
    H=window.innerHeight;
    canvas.width=W*dpr;
    canvas.height=H*dpr;
    canvas.style.width=W+'px';
    canvas.style.height=H+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    cx=W*sectionCenterX[0];cy=H/2;targetCX=cx;targetCY=cy;
    generateAll();
    initParticles();
  }

  canvas.addEventListener('mousemove',function(e){mouse.x=e.clientX-60;mouse.y=e.clientY;});
  canvas.addEventListener('mouseleave',function(){mouse.x=-9999;mouse.y=-9999;});

  var activeCardId=null;
  var morphProgressBar = document.getElementById('morphProgressBar');
  var shapeNavEl = document.getElementById('shapeNav');
  var morphScrollHintEl = document.getElementById('morphScrollHint');

  var allJCards = document.querySelectorAll('.j-card');

  function showMorphUI(){
    canvas.style.display='block';
    if(morphProgressBar) morphProgressBar.style.display='block';
    if(shapeNavEl) shapeNavEl.style.display='flex';
    if(morphScrollHintEl) morphScrollHintEl.style.display='flex';
    allJCards.forEach(function(c){ c.style.display='block'; });
  }
  function hideMorphUI(){
    canvas.style.display='none';
    if(morphProgressBar) morphProgressBar.style.display='none';
    if(shapeNavEl) shapeNavEl.style.display='none';
    if(morphScrollHintEl) morphScrollHintEl.style.display='none';
    allJCards.forEach(function(c){ c.style.display='none'; c.style.opacity='0'; });
    activeCardId=null;
  }

  ScrollTrigger.create({
    trigger:'.journey-spacer',
    start:'top bottom',
    end:'bottom top',
    onEnter: showMorphUI,
    onLeave: hideMorphUI,
    onEnterBack: showMorphUI,
    onLeaveBack: hideMorphUI
  });

  gsap.to({},{
    scrollTrigger:{
      trigger:'.journey-spacer',start:'top top',end:'bottom bottom',scrub:0.3,
      onUpdate:function(self){
        progress=self.progress;
        if(progressBar) progressBar.style.width=(progress*100)+'%';
        var sec=Math.min(7,Math.floor(progress*8));
        if(sec!==currentSection){currentSection=sec;updateCards(sec);updateDots(sec);}
        var exactSection=progress*8;
        var fromSec=Math.min(7,Math.floor(exactSection));
        var toSec=Math.min(7,fromSec+1);
        var secT=exactSection-fromSec;
        var eased=easeIO(secT);
        targetCX=lerp(W*sectionCenterX[fromSec],W*sectionCenterX[toSec],eased);
        targetCY=H/2;
        if(sec===7) canvas.classList.add('interactive'); else canvas.classList.remove('interactive');
        if(progress>0.02&&scrollHint){scrollHint.style.opacity='0';scrollHint.style.transition='opacity 0.5s';}
      }
    }
  });

  function updateCards(sec){
    if(activeCardId){
      var oldCard=document.getElementById(activeCardId);
      if(oldCard){
        gsap.to(oldCard,{opacity:0,x:oldCard.classList.contains('pos-right')?80:-80,duration:0.4,ease:'power2.in'});
      }
      activeCardId=null;
    }
    var cfg=cardConfig[sec];
    if(cfg&&cfg.hasCard&&cfg.id){
      var card=document.getElementById(cfg.id);
      if(card){
        activeCardId=cfg.id;
        var fromX=card.classList.contains('pos-right')?100:-100;
        gsap.fromTo(card,{opacity:0,x:fromX},{opacity:1,x:0,duration:0.6,ease:'power2.out',delay:0.1});
      }
    }
  }

  function updateDots(sec){
    var dots=document.querySelectorAll('.shape-dot');
    for(var i=0;i<dots.length;i++) dots[i].classList.toggle('active',i===sec);
  }

  document.querySelectorAll('.shape-dot').forEach(function(dot){
    dot.addEventListener('click',function(){
      var idx=parseInt(this.getAttribute('data-idx'));
      var spacer=document.querySelector('.journey-spacer');
      if(spacer){
        var targetScroll=spacer.offsetTop+(idx/8)*spacer.scrollHeight;
        window.scrollTo({top:targetScroll,behavior:'smooth'});
      }
    });
  });

  function animateMorph(){
    ctx.clearRect(0,0,W,H);
    time+=0.02;
    cx=lerp(cx,targetCX,0.08);
    cy=lerp(cy,targetCY,0.08);
    var cr=201,cg=169,cb=110;

    if(progress<SECTION*5){
      var mp=(progress/(SECTION*5))*4;
      var from=Math.min(4,Math.floor(mp));
      var to=Math.min(4,from+1);
      var mt=mp-from;
      var eased=easeIO(mt);
      var fc=colors[from],tc=colors[to];
      cr=Math.round(lerp(fc[0],tc[0],eased));
      cg=Math.round(lerp(fc[1],tc[1],eased));
      cb=Math.round(lerp(fc[2],tc[2],eased));
      for(var i=0;i<COUNT;i++){
        var p=particles[i];
        var sx=lerp(shapes[from][i].x,shapes[to][i].x,eased)+p.noiseX;
        var sy=lerp(shapes[from][i].y,shapes[to][i].y,eased)+p.noiseY;
        p.x=sx+cx;p.y=sy+cy;
        var cv=(i/COUNT)*25;
        ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
        ctx.fillStyle='rgba('+Math.min(255,cr+Math.round(cv))+','+Math.min(255,cg+Math.round(cv*0.5))+','+cb+',0.8)';
        ctx.fill();
      }
    }else if(progress<SECTION*6){
      var ep=(progress-SECTION*5)/SECTION;
      var eased=easeCubicIO(ep);
      cr=Math.round(lerp(colors[4][0],colors[5][0],eased));
      cg=Math.round(lerp(colors[4][1],colors[5][1],eased));
      cb=Math.round(lerp(colors[4][2],colors[5][2],eased));
      var expCX=lerp(cx,W*0.5,eased);
      for(var i=0;i<COUNT;i++){
        var p=particles[i];
        var ox=shapes[4][i].x+p.noiseX;
        var oy=shapes[4][i].y+p.noiseY;
        p.x=lerp(ox,explosionTargets[i].x,eased)+expCX;
        p.y=lerp(oy,explosionTargets[i].y,eased)+cy;
        var alpha=1-eased*0.6;
        var sz=p.size*(1+eased*0.5);
        ctx.beginPath();ctx.arc(p.x,p.y,sz,0,Math.PI*2);
        ctx.fillStyle='rgba('+cr+','+cg+','+cb+','+alpha.toFixed(3)+')';
        ctx.fill();
        if(eased>0.1){ctx.beginPath();ctx.arc(p.x,p.y,sz*3,0,Math.PI*2);ctx.fillStyle='rgba('+cr+','+cg+','+cb+','+(eased*0.04).toFixed(3)+')';ctx.fill();}
      }
    }else if(progress<SECTION*7){
      var gp=(progress-SECTION*6)/SECTION;
      var eased=easeCubicOut(gp);
      cr=Math.round(lerp(colors[5][0],colors[7][0],eased));
      cg=Math.round(lerp(colors[5][1],colors[7][1],eased));
      cb=Math.round(lerp(colors[5][2],colors[7][2],eased));
      for(var i=0;i<COUNT;i++){
        var p=particles[i];
        p.x=lerp(explosionTargets[i].x,phylloTargets[i].x,eased)+cx;
        p.y=lerp(explosionTargets[i].y,phylloTargets[i].y,eased)+cy;
        var alpha=0.3+eased*0.5;
        var sz=lerp(p.size*1.5,phylloTargets[i].baseSize,eased);
        ctx.beginPath();ctx.arc(p.x,p.y,sz,0,Math.PI*2);
        ctx.fillStyle='rgba('+cr+','+cg+','+cb+','+alpha.toFixed(3)+')';
        ctx.fill();
      }
    }else{
      cr=colors[7][0];cg=colors[7][1];cb=colors[7][2];
      var c2=[56,189,248];
      var phCX=W*0.5,phCY=H/2;
      for(var i=0;i<COUNT;i++){
        var p=particles[i];var pt=phylloTargets[i];
        var pulse=1+Math.sin(time*1.5+i*0.05)*0.15;
        var sz=pt.baseSize*pulse;
        var drawX=pt.x+phCX,drawY=pt.y+phCY;
        var dx=drawX-mouse.x,dy=drawY-mouse.y;
        var md=Math.sqrt(dx*dx+dy*dy);
        var mi=Math.max(0,1-md/150);
        sz+=mi*8;
        p.x=drawX;p.y=drawY;
        var t=pt.distRatio;
        var colR=Math.round(lerp(cr,c2[0],t));
        var colG=Math.round(lerp(cg,c2[1],t));
        var colB=Math.round(lerp(cb,c2[2],t));
        var alpha=0.4+(1-t)*0.5;
        ctx.beginPath();ctx.arc(p.x,p.y,sz,0,Math.PI*2);
        ctx.fillStyle='rgba('+colR+','+colG+','+colB+','+alpha.toFixed(3)+')';
        ctx.fill();
        if(mi>0.3){ctx.beginPath();ctx.arc(p.x,p.y,sz+3,0,Math.PI*2);ctx.strokeStyle='rgba('+colR+','+colG+','+colB+','+(mi*0.4).toFixed(3)+')';ctx.lineWidth=1;ctx.stroke();}
      }
    }

    // Center glow
    var glowCX=(progress>=SECTION*7)?W*0.5:cx;
    var grad=ctx.createRadialGradient(glowCX,cy,0,glowCX,cy,200);
    grad.addColorStop(0,'rgba('+cr+','+cg+','+cb+',0.05)');
    grad.addColorStop(1,'rgba('+cr+','+cg+','+cb+',0)');
    ctx.fillStyle=grad;ctx.fillRect(glowCX-200,cy-200,400,400);

    // Vignette
    var vigGrad=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*0.3,W/2,H/2,Math.max(W,H)*0.75);
    vigGrad.addColorStop(0,'rgba(10,10,15,0)');
    vigGrad.addColorStop(1,'rgba(10,10,15,0.4)');
    ctx.fillStyle=vigGrad;ctx.fillRect(0,0,W,H);

    requestAnimationFrame(animateMorph);
  }

  window.addEventListener('resize',resizeMorph);
  resizeMorph();
  animateMorph();
})();

/* ============================================================
   9. TICKER TAPE MARQUEE
   ============================================================ */
(function(){
  function createMarquee(trackId, direction){
    var track = document.getElementById(trackId);
    if(!track) return;
    var clone = track.innerHTML;
    track.innerHTML += clone + clone;
    var badges = track.querySelectorAll('.ticker-badge');
    var totalWidth = 0;
    var origCount = badges.length / 3;
    for(var i=0;i<origCount;i++){
      totalWidth += badges[i].offsetWidth + 16;
    }
    var tween = gsap.to(track,{
      x: direction==='left' ? -totalWidth : totalWidth,
      duration: totalWidth / 40,
      ease:'none',
      repeat:-1,
      modifiers:{
        x:function(x){ return (parseFloat(x) % totalWidth) + 'px'; }
      }
    });
    var row = track.parentElement;
    row.addEventListener('mouseenter',function(){tween.pause();});
    row.addEventListener('mouseleave',function(){tween.resume();});
    return tween;
  }

  document.addEventListener('DOMContentLoaded',function(){
    createMarquee('track1','left');

    var track2 = document.getElementById('track2');
    if(!track2) return;
    var clone2 = track2.innerHTML;
    track2.innerHTML += clone2 + clone2;
    var badges2 = track2.querySelectorAll('.ticker-badge');
    var totalWidth2 = 0;
    var origCount2 = badges2.length / 3;
    for(var j=0;j<origCount2;j++){
      totalWidth2 += badges2[j].offsetWidth + 16;
    }
    gsap.set(track2,{x:-totalWidth2});
    var tween2 = gsap.to(track2,{
      x:0,
      duration: totalWidth2 / 35,
      ease:'none',
      repeat:-1,
      modifiers:{
        x:function(x){ return ((parseFloat(x) % totalWidth2) - totalWidth2) + 'px'; }
      }
    });
    var row2 = document.getElementById('tickerRow2');
    row2.addEventListener('mouseenter',function(){tween2.pause();});
    row2.addEventListener('mouseleave',function(){tween2.resume();});
  });

  ScrollTrigger.create({
    trigger:'#stats', start:'top 85%', once:true,
    onEnter:function(){
      gsap.from('#stats .section-header',{opacity:0,y:30,duration:0.7,ease:'power3.out'});
      gsap.from('.ticker-row',{opacity:0,duration:0.8,stagger:0.2,delay:0.3,ease:'power2.out'});
    }
  });
})();

/* ============================================================
   10. MOUNTAIN RAIN SCENE + FOOTER
   ============================================================ */
(function(){
  var scene = document.getElementById('mountainScene');
  if (!scene) return;
  var vp = scene.querySelector('.mountain-viewport');
  var rainCanvas = document.getElementById('rainCanvas');
  var mtnDarkOverlay = document.getElementById('mtnDarkOverlay');

  /* --- Generate trees --- */
  var forest = document.getElementById('forest');
  if (forest) {
    for (var i = 0; i < 50; i++) {
      var tree = document.createElement('div');
      tree.style.position = 'absolute';
      tree.style.bottom = '0';
      tree.style.left = (i * 2) + '%';
      tree.style.transform = 'scale(' + (0.5 + Math.random() * 0.7) + ')';
      tree.innerHTML = '<div class="pine"></div><div class="pine-trunk"></div>';
      forest.appendChild(tree);
    }
  }

  /* --- Generate clouds --- */
  for (var i = 0; i < 6; i++) {
    var cloud = document.createElement('div');
    cloud.className = 'cloud';
    cloud.style.left = (5 + Math.random() * 85) + '%';
    cloud.style.top = (15 + Math.random() * 35) + '%';
    var w = 50 + Math.random() * 70;
    cloud.innerHTML = '<div class="cloud-body" style="width:' + w + 'px;height:' + (w * 0.35) + 'px;left:0;top:8px"></div>'
      + '<div class="cloud-body" style="width:' + (w * 0.55) + 'px;height:' + (w * 0.3) + 'px;left:' + (w * 0.25) + 'px;top:0"></div>';
    vp.appendChild(cloud);
  }

  /* --- Rain engine --- */
  var ctx = rainCanvas.getContext('2d');
  var rW, rH, dpr;
  var drops = [];
  var splashes = [];
  var MAX_DROPS = 150;
  var GROUND_Y;
  var rainWind = 0;
  var rainIntensity = 0;

  function resizeRain() {
    dpr = window.devicePixelRatio || 1;
    rW = rainCanvas.parentElement.clientWidth;
    rH = rainCanvas.parentElement.clientHeight;
    rainCanvas.width = rW * dpr;
    rainCanvas.height = rH * dpr;
    rainCanvas.style.width = rW + 'px';
    rainCanvas.style.height = rH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    GROUND_Y = rH - 30;
  }

  function createDrop() {
    return {
      x: Math.random() * (rW + 100) - 50,
      y: -10 - Math.random() * 150,
      vy: 2 + Math.random() * 2,
      vx: rainWind,
      length: 10 + Math.random() * 15,
      alpha: 0.1 + Math.random() * 0.3,
      thickness: 0.6 + Math.random() * 1
    };
  }

  function createSplash(x, y) {
    for (var j = 0; j < 2; j++) {
      splashes.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 3,
        vy: -1.5 - Math.random() * 3,
        life: 1,
        decay: 0.03 + Math.random() * 0.04,
        size: 0.5 + Math.random() * 1
      });
    }
  }

  function initRain() {
    resizeRain();
    drops = [];
    for (var i = 0; i < MAX_DROPS; i++) {
      var d = createDrop();
      d.y = Math.random() * rH;
      drops.push(d);
    }
  }

  function rainLoop() {
    ctx.clearRect(0, 0, rW, rH);
    if (rainIntensity > 0.01) {
      rainWind += (0 - rainWind) * 0.05;
      var active = Math.floor(MAX_DROPS * rainIntensity);
      ctx.lineCap = 'round';

      for (var i = 0; i < drops.length; i++) {
        var d = drops[i];
        if (i >= active) { if (d.y > 0) { d.y = -100; } continue; }
        d.vy += 0.03;
        d.x += d.vx;
        d.y += d.vy;
        var a = d.alpha * rainIntensity;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + d.vx * 0.3, d.y + d.length);
        ctx.strokeStyle = 'rgba(160,190,220,' + a.toFixed(3) + ')';
        ctx.lineWidth = d.thickness * (0.5 + rainIntensity * 0.5);
        ctx.stroke();
        if (d.y > GROUND_Y) { createSplash(d.x, GROUND_Y); drops[i] = createDrop(); }
        if (d.x < -50 || d.x > rW + 50) { drops[i] = createDrop(); }
      }

      // Splashes
      for (var i = splashes.length - 1; i >= 0; i--) {
        var s = splashes[i];
        s.vy += 0.12; s.x += s.vx; s.y += s.vy; s.life -= s.decay;
        if (s.life <= 0) { splashes.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(160,200,240,' + (s.life * 0.5).toFixed(3) + ')';
        ctx.fill();
      }

      // Fog at bottom
      var fogA = rainIntensity * 0.3;
      var fogG = ctx.createLinearGradient(0, GROUND_Y - 40, 0, rH);
      fogG.addColorStop(0, 'rgba(10,15,20,0)');
      fogG.addColorStop(1, 'rgba(10,15,20,' + fogA.toFixed(3) + ')');
      ctx.fillStyle = fogG;
      ctx.fillRect(0, GROUND_Y - 40, rW, rH - GROUND_Y + 40);
    }
    requestAnimationFrame(rainLoop);
  }

  window.addEventListener('resize', resizeRain);
  initRain();
  rainLoop();

  /* --- GSAP scroll animation for mountain scene --- */
  var tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#mountainScene',
      start: 'top 85%',
      end: 'bottom 20%',
      scrub: 0.6,
      onUpdate: function(self) {
        rainIntensity = self.progress * 0.8;
      }
    }
  });

  // Scene fades in from dark
  tl.fromTo('#mountainScene', { opacity: 0.3 }, { opacity: 1, duration: 3 }, 0);
  // Parallax layers
  tl.to('.mtn-back', { y: -15, duration: 10 }, 0);
  tl.to('.mtn-mid', { y: -25, duration: 10 }, 0);
  tl.to('.mtn-front', { y: -35, duration: 10 }, 0);
  // Forest fades
  tl.to('#forest', { y: -20, opacity: 0.3, duration: 6 }, 0);
  // Sky darkens
  tl.to('#skyCold', { opacity: 0.7, duration: 5 }, 0);
  tl.to('#skyHigh', { opacity: 0.6, duration: 5 }, 3);
  // Snow caps appear
  tl.to('#snowCap', { opacity: 0.5, duration: 4 }, 1);
  // Clouds drift
  scene.querySelectorAll('.cloud').forEach(function(c, i) {
    gsap.set(c, { opacity: 0 });
    tl.to(c, { opacity: 0.4, y: 20 + i * 5, duration: 4 }, i * 0.5);
  });
  // Dark overlay strengthens at bottom
  tl.to('#mtnDarkOverlay', { opacity: 1, duration: 6 }, 2);

  /* --- Footer entrance --- */
  gsap.from('.mega-footer .brand-area', {
    opacity: 0, y: 40, duration: 0.7, ease: 'power3.out',
    scrollTrigger: { trigger: '.mega-footer .brand-area', start: 'top 92%' }
  });
  gsap.from('.mega-footer .footer-col', {
    opacity: 0, y: 30, duration: 0.5, stagger: 0.1, ease: 'power3.out',
    scrollTrigger: { trigger: '.mega-footer .footer-columns', start: 'top 88%' }
  });
  gsap.from('.mega-footer .social-btn', {
    opacity: 0, scale: 0, duration: 0.3, stagger: 0.05, ease: 'back.out(2)',
    scrollTrigger: { trigger: '.mega-footer .social-row', start: 'top 92%' }
  });
  gsap.from('.mega-footer .footer-bottom', {
    opacity: 0, duration: 0.6, ease: 'power2.out',
    scrollTrigger: { trigger: '.mega-footer .footer-bottom', start: 'top 95%' }
  });
})();

/* ======================
   Utility helpers
   ====================== */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const on = (el, ev, fn) => el?.addEventListener(ev, fn);

/* ======================
   Particles background (simple) - canvas
   ====================== */
(function particlesBg(){
  const canvas = document.getElementById('bgCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width = innerWidth;
  let H = canvas.height = innerHeight;
  const num = Math.floor((W*H)/60000) * 40 + 40; // scale with area
  const particles = [];
  function rand(min, max){ return Math.random()*(max-min)+min; }
  for(let i=0;i<num;i++){
    particles.push({
      x:rand(0,W), y:rand(0,H),
      r:rand(0.6,2.4),
      vx:rand(-0.2,0.6), vy:rand(-0.1,0.4),
      alpha:rand(0.05,0.5)
    });
  }
  function resize(){ W = canvas.width = innerWidth; H = canvas.height = innerHeight; }
  window.addEventListener('resize', resize);
  function draw(){
    ctx.clearRect(0,0,W,H);
    for(const p of particles){
      p.x += p.vx; p.y += p.vy;
      if(p.x > W+20) p.x = -10;
      if(p.x < -20) p.x = W+10;
      if(p.y > H+20) p.y = -10;
      ctx.beginPath();
      ctx.fillStyle = `rgba(140,180,255,${p.alpha})`;
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ======================
   Page progress bar
   ====================== */
(function progressBar(){
  const bar = $('#progressBar');
  if(!bar) return;
  window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const pct = (window.scrollY / (h || 1)) * 100;
    bar.style.width = Math.min(100, Math.max(0, pct)) + '%';
  }, {passive:true});
})();

/* ======================
   Typing effect (hero)
   ====================== */
(function typingHero(){
  const txtEl = $('#typing');
  if(!txtEl) return;
  const phrases = [
    'Pemula, Suka Tantangan, Aktif, Menarik',
    'Ambisius, Suka Hal Baru',
    'Suka Mendengarkan Lagu'
  ];
  let i = 0, j = 0, typing = true;
  function step(){
    const p = phrases[i];
    if(typing){
      j++;
      txtEl.textContent = p.slice(0,j);
      if(j >= p.length){ typing = false; setTimeout(step,1200); return; }
    } else {
      j--;
      txtEl.textContent = p.slice(0,j);
      if(j === 0){ typing = true; i = (i+1)%phrases.length; }
    }
    setTimeout(step, typing ? 70 : 35);
  }
  step();
})();

/* ======================
   Sticky nav burger
   ====================== */
(function navToggle(){
  const burger = $('#burger'), nav = $('#mainNav');
  if(!burger) return;
  burger.addEventListener('click', () => {
    const open = nav.style.display === 'flex';
    nav.style.display = open ? '' : 'flex';
    if(!open){
      nav.style.flexDirection = 'column';
      nav.style.position = 'absolute';
      nav.style.right = '18px';
      nav.style.top = '62px';
      nav.style.background = 'rgba(2,6,23,0.95)';
      nav.style.padding = '10px';
      nav.style.borderRadius = '8px';
      nav.style.boxShadow = '0 10px 40px rgba(2,6,23,0.6)';
    }
  });
})();

/* ======================
   IntersectionObserver for section reveal + skill fill
   ====================== */
(function sectionObserver(){
  const sections = $$('.section');
  if(!sections.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(ent => {
      if(ent.isIntersecting){
        ent.target.classList.add('show');
        if(ent.target.id === 'skills') animateSkills();
      }
    });
  }, {threshold: 0.18});
  sections.forEach(s => io.observe(s));
})();

/* ======================
   Skill bars fill + simple donut (canvas) chart
   ====================== */
function animateSkills(){
  const bars = $$('.progress');
  bars.forEach(b => {
    const val = parseInt(b.dataset.skill || '0',10);
    b.style.width = val + '%';
  });
  // simple donut chart for visible effect
  const canvas = $('#skillsChart');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const data = [95,90,85,80]; // example values
  const colors = ['#6a11cb','#2575fc','#87ceeb','#8bd3ff'];
  const total = data.reduce((a,b)=>a+b,0);
  const cx = canvas.width/2;
  const cy = canvas.height/2;
  const radius = Math.min(cx,cy) - 10;
  let start = -Math.PI/2;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  data.forEach((d,i) => {
    const angle = (d/total) * Math.PI*2;
    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.arc(cx,cy,radius,start,start+angle);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    start += angle;
  });
  // inner circle
  ctx.beginPath();
  ctx.fillStyle = 'rgba(2,6,23,0.85)';
  ctx.arc(cx,cy,radius*0.6,0,Math.PI*2);
  ctx.fill();
}

/* ======================
   Timeline click -> modal
   ====================== */
(function timelineModals(){
  const data = {
    sd:{title:'SD — [Nama Sekolah]', content:'Di SD saya belajar... (cerita lengkap)'},
    smp:{title:'SMP — [Nama Sekolah]', content:'Di SMP saya mulai tertarik...'},
    sma:{title:'SMA — [Nama Sekolah]', content:'Di SMA saya ikut OSIS...'},
    kuliah:{title:'Kuliah — [Nama Universitas]', content:'Di kampus saya mempelajari...'}
  };
  $$('.timeline-item').forEach(item => {
    item.addEventListener('click', ()=> openTimeline(item.dataset.id));
    item.addEventListener('keypress', (e) => { if(e.key==='Enter') openTimeline(item.dataset.id); });
  });
  function openTimeline(id){
    const d = data[id];
    if(!d) return;
    $('#tlTitle').textContent = d.title;
    $('#tlContent').textContent = d.content;
    openModal($('#timelineModal'));
  }
})();

/* ======================
   Projects filter + search + detail modal
   ====================== */
(function projects(){
  const filters = $$('.filter');
  const cards = $$('.project-card');
  const search = $('#projectSearch');

  filters.forEach(f => f.addEventListener('click', () => {
    filters.forEach(x=>x.classList.remove('active'));
    f.classList.add('active');
    const mode = f.dataset.filter;
    cards.forEach(c => {
      const type = c.dataset.type;
      c.style.display = (mode==='all' || type===mode) ? '' : 'none';
    });
  }));

  search && search.addEventListener('input', () => {
    const q = search.value.toLowerCase().trim();
    cards.forEach(c => {
      const title = (c.dataset.title||'').toLowerCase();
      c.style.display = title.includes(q) ? '' : 'none';
    });
  });

  // open detail modal
  $$('.open-proj').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.project-card');
      const title = card.dataset.title || card.querySelector('h3')?.textContent || '';
      $('#projTitle').textContent = title;
      const img = card.querySelector('img');
      $('#projImg').src = img?.src || '';
      $('#projDesc').textContent = card.querySelector('p')?.textContent || '';
      $('#projLinks').innerHTML = `<a class="btn small" href="#">Demo</a> <a class="btn alt small" href="#">Repo</a>`;
      openModal($('#projectModal'));
    });
  });
})();

/* ======================
   Hobby modals + audio preview
   ====================== */
(function hobbies(){
  const hobbyContent = {
    musik:{title:'Mendengarkan Lagu', html:'<p>Saya suka playlist: elektronik, pop, chill.</p><img src="hobby-music-detail.jpg" alt="Musik" />'},
    film:{title:'Menonton Film', html:'<p>Saya suka film indie dan sci-fi.</p><img src="hobby-movie-detail.jpg" alt="Film" />'},
    game:{title:'Bermain Video Game', html:'<p>Saya sering bermain game strategi dan indie.</p><img src="hobby-game-detail.jpg" alt="Game" />'},
    foto:{title:'Fotografi Langit', html:'<p>Fotografi sunset & nightscape.</p><img src="hobby-photo-detail.jpg" alt="Foto" />'}
  };
  $$('.hobby-item').forEach(el => {
    const btn = el.querySelector('[data-popup]');
    if(btn){
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-popup').replace('hobi','').toLowerCase();
        const data = hobbyContent[key] || {title:'Hobi', html:'<p>Detail...</p>'};
        $('#hobbyContent').innerHTML = `<h3>${data.title}</h3>${data.html}`;
        openModal($('#hobbyModal'));
      });
    }
  });

  // audio preview
  $$('.play-audio').forEach(btn => {
    btn.addEventListener('click', () => {
      const src = btn.dataset.src;
      let audio = btn._audio;
      if(!audio){
        audio = new Audio(src);
        audio.loop = false;
        btn._audio = audio;
      }
      if(audio.paused) {
        audio.play();
        btn.textContent = 'Pause';
      } else {
        audio.pause();
        btn.textContent = 'Play Sample';
      }
    });
  });
})();

/* ======================
   Gallery lightbox + carousel controls
   ====================== */
(function gallery(){
  const imgs = $$('.gallery-item img');
  const lb = $('#lightbox');
  const lbImg = $('#lightboxImg');
  const lbCap = $('#lightboxCaption');
  imgs.forEach(img => {
    img.addEventListener('click', () => {
      lbImg.src = img.src;
      lbCap.textContent = img.alt || '';
      openModal(lb);
    });
  });

  // carousel next/prev (scrolling container)
  const gallery = $('.gallery');
  const prev = $('#prevSlide'), next = $('#nextSlide');
  if(prev && next && gallery){
    prev.addEventListener('click', ()=> gallery.scrollBy({left:-220, behavior:'smooth'}));
    next.addEventListener('click', ()=> gallery.scrollBy({left:220, behavior:'smooth'}));
  }
})();

/* ======================
   Contact form validation + fake send
   ====================== */
(function contactForm(){
  const form = $('#contactForm');
  const status = $('#formStatus');
  if(!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#name').value.trim();
    const email = $('#email').value.trim();
    const msg = $('#message').value.trim();
    if(!name || !email || !msg){
      status.textContent = 'Mohon isi semua field yang diperlukan.';
      return;
    }
    // basic email regex
    const re = /\S+@\S+\.\S+/;
    if(!re.test(email)){
      status.textContent = 'Email tidak valid.';
      return;
    }
    status.textContent = 'Mengirim...';
    // simulate sending
    setTimeout(()=> {
      status.textContent = 'Pesan berhasil dikirim! Terima kasih.';
      form.reset();
    }, 1400);
  });
  $('#resetForm')?.addEventListener('click', ()=> { form.reset(); $('#formStatus').textContent = ''; });
})();

/* ======================
   Modal helpers (open/close)
   ====================== */
function openModal(modal){
  if(!modal) return;
  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
  // focus inside modal for accessibility
  setTimeout(()=> modal.querySelector('.modal-body')?.focus?.(), 80);
}
function closeModal(modal){
  if(!modal) return;
  modal.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
}

/* close buttons and outside click */
(function modalCloseers(){
  $$('[data-close]').forEach(btn => btn.addEventListener('click', (e) => {
    const modal = e.target.closest('.modal');
    closeModal(modal);
  }));
  $$('.modal').forEach(modal => modal.addEventListener('click', (e) => {
    if(e.target === modal) closeModal(modal);
  }));
  $$('.popup .close-btn').forEach(btn => btn.addEventListener('click', (e)=> {
    const popup = e.target.closest('.popup');
    popup.classList.remove('active');
  }));
})();

/* ======================
   Project card keyboard access (Enter)
   ====================== */
$$('.project-card').forEach(card => {
  card.addEventListener('keypress', (e) => {
    if(e.key==='Enter') card.querySelector('.open-proj')?.click();
  });
});

/* ======================
   Light keyboard shortcuts
   - Esc: close modals/popup
   - M: toggle main nav on mobile
   ====================== */
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape'){
    $$('.modal[aria-hidden="false"]').forEach(m => closeModal(m));
    $$('.popup.active').forEach(p => p.classList.remove('active'));
  }
  if(e.key.toLowerCase() === 'm'){
    const nav = $('#mainNav');
    if(window.innerWidth <= 900){
      const open = nav.style.display === 'flex';
      nav.style.display = open ? '' : 'flex';
    }
  }
});

/* ======================
   Modal open by clicking profile small/hero pic
   ====================== */
$('#profileSmall')?.addEventListener('click', ()=> openModal($('#photoModal')));
$('#profile-pic')?.addEventListener('click', ()=> openModal($('#photoModal')));
$('#openProfile')?.addEventListener('click', ()=> openModal($('#photoModal')));

/* ======================
   Projects detail open by clicking image or title
   ====================== */
$$('.project-card img').forEach(img => img.addEventListener('click', (e) => {
  const card = e.target.closest('.project-card');
  card.querySelector('.open-proj')?.click();
}));

/* ======================
   Reusable popup (small) behavior for galleryPopup
   ====================== */
(function smallPopup(){
  const p = $('#galleryPopup');
  if(!p) return;
  $$('.gallery img').forEach(img => {
    img.addEventListener('click', (e) => {
      const contentImg = p.querySelector('img');
      contentImg.src = img.src;
      p.classList.add('active');
    });
  });
  p.addEventListener('click', (e) => {
    if(e.target === p) p.classList.remove('active');
  });
})();

/* ======================
   Accessibility improvements: focus trap not implemented but basic focus
   ====================== */

/* ======================
   Set dynamic year in footer
   ====================== */
(function setYear(){ $('#year').textContent = new Date().getFullYear(); })();

/* ======================
   Lazy tips: you can add more assets and behavior later
   ====================== */
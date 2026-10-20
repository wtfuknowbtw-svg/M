/* ═══════════════════════════════════════════════════════════
   A LITTLE WORLD MADE JUST FOR YOU ♡
   MOONLIT LILY GARDEN — MAIN APPLICATION LOGIC
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => { App.init(); });

const App = {

  // ── State ─────────────────────────────────────────────
  currentScreen: 'intro',
  gameState: null,
  _startGameFn: null,
  audio: null,
  audioPlaying: false,

  // ── Initialise ────────────────────────────────────────
  init() {
    this.setupBackground();
    this.setupParticles();
    this.setupMusicToggle();
    this.buildHub();
    this.buildLetter();
    this.buildGarden();
    this.buildMemory();
    this.setupGame();       // attaches static button listeners once
    this.buildSurprise();
    this.buildEnding();
    this.startIntro();
    this.setupBackBtn();
  },

  // ── Screen Navigation ────────────────────────────────
  goTo(id, hideBack) {
    const current = document.querySelector('.screen.active');
    if (current) {
      current.classList.add('exiting');
      current.classList.remove('active');
      setTimeout(() => current.classList.remove('exiting'), 800);
    }

    const next = document.getElementById('screen-' + id);
    if (!next) return;
    next.scrollTop = 0;
    window.scrollTo(0, 0);

    setTimeout(() => {
      next.classList.add('active');
      this.currentScreen = id;
      next.scrollTop = 0;
      window.scrollTo(0, 0);

      requestAnimationFrame(() => {
        next.scrollTop = 0;
        window.scrollTo(0, 0);
      });

      const btn = document.getElementById('back-btn');
      if (hideBack || id === 'intro') {
        btn.classList.add('hidden');
      } else {
        btn.classList.remove('hidden');
      }

      this.onScreenEnter(id);
    }, 80);
  },

  onScreenEnter(id) {
    if (id === 'intro') this.animateIntro();
    if (id === 'hub') this.animateHub();
    if (id === 'letter') this.animateLetter(0);
    if (id === 'garden') this.animateGarden();
    if (id === 'memory') this.animateMemory();
    if (id === 'game') this.initGame();
    if (id === 'surprise') this.animateSurprise();
    if (id === 'end') this.animateEnd();
  },

  // ══════════════════════════════════════════════════════
  //  AMBIENT BACKGROUND
  // ══════════════════════════════════════════════════════

  setupBackground() {
    ['screen-intro', 'screen-surprise', 'screen-end'].forEach(id => {
      const screen = document.getElementById(id);
      if (!screen) return;
      const sf = document.createElement('div');
      sf.className = 'star-field';
      sf.setAttribute('aria-hidden', 'true');
      for (let i = 0; i < 70; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 2.5 + 0.5;
        star.style.cssText = [
          'width:' + size + 'px',
          'height:' + size + 'px',
          'top:' + Math.random() * 100 + '%',
          'left:' + Math.random() * 100 + '%',
          '--dur:' + (2.5 + Math.random() * 4) + 's',
          '--delay:' + Math.random() * 5 + 's',
          '--min-op:' + (0.08 + Math.random() * 0.15),
          '--max-op:' + (0.4 + Math.random() * 0.5),
        ].join(';');
        sf.appendChild(star);
      }
      screen.insertBefore(sf, screen.firstChild);
    });
  },

  setupParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const SYMBOLS = ['\u2661', '\u22C6', '\u00B7', '\u263D', '\u00B7'];
    const createParticle = () => ({
      x: Math.random() * canvas.width,
      y: canvas.height + 20,
      symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      size: 10 + Math.random() * 12,
      opacity: 0.08 + Math.random() * 0.2,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -(0.3 + Math.random() * 0.4),
      maxLife: 200 + Math.random() * 220,
      frameAge: 0,
    });

    let frameCount = 0;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frameCount++;
      if (frameCount % 35 === 0 && particles.length < 22) {
        particles.push(createParticle());
      }
      particles = particles.filter(p => p.frameAge < p.maxLife);
      particles.forEach(p => {
        p.frameAge++;
        p.x += p.vx;
        p.y += p.vy;
        const progress = p.frameAge / p.maxLife;
        const op = p.opacity * Math.sin(progress * Math.PI);
        ctx.globalAlpha = op;
        ctx.fillStyle = progress < 0.5 ? '#AFC7DC' : '#DCD6F2';
        ctx.font = p.size + 'px serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.symbol, p.x, p.y);
      });
      ctx.globalAlpha = 1;
      requestAnimationFrame(tick);
    };
    tick();
  },

  // ══════════════════════════════════════════════════════
  //  MUSIC
  // ══════════════════════════════════════════════════════

  setupMusicToggle() {
    const btn = document.getElementById('music-btn');
    if (!btn) return;

    if (!CONFIG.musicPath) {
      btn.classList.add('hidden');
      return;
    }

    this.audio = new Audio(CONFIG.musicPath);
    this.audio.loop = true;
    this.audio.volume = 0.45;

    btn.addEventListener('click', () => {
      if (this.audioPlaying) {
        this.audio.pause();
        btn.textContent = '\u266A';
        btn.setAttribute('aria-label', 'Play music');
        this.audioPlaying = false;
      } else {
        this.audio.play().catch(() => { });
        btn.textContent = '\u266B';
        btn.setAttribute('aria-label', 'Pause music');
        this.audioPlaying = true;
      }
    });
  },

  // ══════════════════════════════════════════════════════
  //  BACK BUTTON
  // ══════════════════════════════════════════════════════

  setupBackBtn() {
    const btn = document.getElementById('back-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (this.gameState && this.gameState.running) {
        this.gameState.running = false;
        cancelAnimationFrame(this.gameState.raf);
      }
      // Hide any game overlays
      document.getElementById('game-start-overlay')?.classList.remove('visible');
      document.getElementById('game-win-overlay')?.classList.remove('visible');
      document.getElementById('game-lose-overlay')?.classList.remove('visible');
      this.goTo('hub', false);
    });
  },

  // ══════════════════════════════════════════════════════
  //  SCREEN 1 — INTRO
  // ══════════════════════════════════════════════════════

  startIntro() {
    this.goTo('intro', true);
  },

  animateIntro() {
    const lines = document.querySelectorAll('#screen-intro .intro-line');
    lines.forEach(l => l.classList.remove('visible'));
    let delay = 400;
    lines.forEach((line, i) => {
      setTimeout(() => line.classList.add('visible'), delay + i * 900);
    });
  },

  // ══════════════════════════════════════════════════════
  //  SCREEN 2 — HUB
  // ══════════════════════════════════════════════════════

  buildHub() {
    const destinations = [
      {
        id: 'letter', emoji: '💌', title: 'a letter for you',
        subtitle: 'a few words i’ve been meaning to say🙃'
      },
      {
        id: 'garden', emoji: '🤍', title: 'things i like bout u, vese sabhi krta hu lekin likh nhi skta yha😭',
        subtitle: 'lily ko tap kr'
      },
      {
        id: 'game', emoji: '🐈', title: 'bohot padhai krli, thank gy honge, ek game khelo😚',
        subtitle: 'catch the kitty\'s kisses'
      },
      {
        id: 'surprise', emoji: '🌙', title: 'n lastly chota suprise 🤧',
        subtitle: 'save this one for last ♡'
      },
    ];

    const grid = document.getElementById('dest-grid');
    if (!grid) return;

    grid.innerHTML = '';
    destinations.forEach(d => {
      const card = document.createElement('button');
      card.className = 'dest-card';
      card.setAttribute('aria-label', d.title);
      card.innerHTML =
        '<div class="dest-emoji" aria-hidden="true">' + d.emoji + '</div>' +
        '<div class="dest-text">' +
        '<div class="dest-title">' + d.title + '</div>' +
        '<div class="dest-subtitle">' + d.subtitle + '</div>' +
        '</div>' +
        '<div class="dest-arrow" aria-hidden="true">\u2192</div>';
      card.addEventListener('click', () => this.goTo(d.id));
      grid.appendChild(card);
    });
  },

  animateHub() {
    const cards = document.querySelectorAll('.dest-card');
    cards.forEach((c, i) => {
      c.style.opacity = '0';
      c.style.transform = 'translateY(20px)';
      setTimeout(() => {
        c.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1)';
        c.style.opacity = '1';
        c.style.transform = 'translateY(0)';
      }, 100 + i * 100);
    });
  },

  // ══════════════════════════════════════════════════════
  //  SCREEN 3 — LOVE LETTER
  // ══════════════════════════════════════════════════════

  buildLetter() {
    const container = document.getElementById('letter-content');
    const progress = document.getElementById('letter-progress');
    const prevBtn = document.getElementById('letter-prev');
    const nextBtn = document.getElementById('letter-next');
    const doneBtn = document.getElementById('letter-done');
    if (!container) return;

    const pages = CONFIG.letter;
    let page = 0;

    const render = (p) => {
      page = p;
      container.innerHTML = '';
      const para = document.createElement('p');
      para.className = 'letter-para';
      para.textContent = pages[p];
      container.appendChild(para);
      requestAnimationFrame(() => para.classList.add('visible'));

      progress.textContent = (p + 1) + ' / ' + pages.length;
      prevBtn.disabled = p === 0;

      const isLast = p === pages.length - 1;
      nextBtn.style.display = isLast ? 'none' : '';
      doneBtn.style.display = isLast ? '' : 'none';
    };

    prevBtn.addEventListener('click', () => { if (page > 0) render(page - 1); });
    nextBtn.addEventListener('click', () => { if (page < pages.length - 1) render(page + 1); });
    doneBtn.addEventListener('click', () => this.goTo('hub'));

    document.addEventListener('keydown', (e) => {
      if (this.currentScreen !== 'letter') return;
      if (e.key === 'ArrowRight' && page < pages.length - 1) render(page + 1);
      if (e.key === 'ArrowLeft' && page > 0) render(page - 1);
    });

    this._letterRender = render;
  },

  animateLetter(p) {
    if (this._letterRender) this._letterRender(p || 0);
  },

  // ══════════════════════════════════════════════════════
  //  SCREEN 4 — LILY GARDEN
  // ══════════════════════════════════════════════════════

  buildGarden() {
    const grid = document.getElementById('flower-grid');
    const popup = document.getElementById('flower-popup');
    const popText = document.getElementById('flower-popup-text');
    const closeBtn = document.getElementById('flower-popup-close');
    const overlay = document.getElementById('flower-popup-overlay');
    if (!grid) return;

    const closePopup = () => popup.classList.remove('visible');
    closeBtn?.addEventListener('click', closePopup);
    overlay?.addEventListener('click', closePopup);

    CONFIG.compliments.forEach((msg, i) => {
      const item = document.createElement('div');
      item.className = 'flower-item';
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.setAttribute('aria-label', 'Tap this lily to reveal a compliment');

      // Lily petals — subtle hue variation (white-to-lavender)
      const lilyHue = (i * 25) % 30;
      const petals = [0, 60, 120, 180, 240, 300].map(r =>
        '<ellipse class="lily-petal" cx="40" cy="26" rx="5" ry="15"' +
        ' transform="rotate(' + r + ' 40 42)"' +
        ' style="fill:hsl(' + (260 + lilyHue) + ',' + (12 + (i % 3) * 5) + '%,' + (92 + (i % 4) * 2) + '%);' +
        'stroke:hsl(' + (260 + lilyHue) + ',8%,86%);stroke-width:0.3;"/>'
      ).join('');

      item.innerHTML =
        '<div class="flower-svg-wrap">' +
        '<svg class="flower-svg" viewBox="0 0 80 84" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        // Stem
        '<path class="lily-stem" d="M40 82 Q38 68 40 52" fill="none" stroke="#7a9970" stroke-width="2.5" stroke-linecap="round"/>' +
        // Leaves
        '<ellipse class="lily-leaf" cx="33" cy="70" rx="9" ry="3.5" transform="rotate(-25 33 70)" fill="#7a9970" opacity="0.8"/>' +
        '<ellipse class="lily-leaf" cx="48" cy="66" rx="7" ry="3" transform="rotate(20 48 66)" fill="#8aaa7a" opacity="0.6"/>' +
        // Petals
        petals +
        // Center
        '<circle class="lily-center" cx="40" cy="42" r="5" fill="#e8dcc0"/>' +
        // Stamen dots
        '<circle cx="37" cy="36" r="1.2" fill="#c4956a" opacity="0.65"/>' +
        '<circle cx="43" cy="36" r="1.2" fill="#c4956a" opacity="0.65"/>' +
        '<circle cx="40" cy="34" r="1.2" fill="#c4956a" opacity="0.65"/>' +
        '<circle cx="36" cy="39" r="1" fill="#c4956a" opacity="0.45"/>' +
        '<circle cx="44" cy="39" r="1" fill="#c4956a" opacity="0.45"/>' +
        '</svg>' +
        '</div>' +
        '<div class="flower-label">tap me \u2661</div>';

      const open = () => {
        item.classList.add('bloomed');
        if (popText) popText.textContent = msg;
        const icon = document.getElementById('flower-popup-icon');
        if (icon) icon.textContent = '\u2728';
        popup.classList.add('visible');
      };

      item.addEventListener('click', open);
      item.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
      });

      grid.appendChild(item);
    });
  },

  animateGarden() {
    document.querySelectorAll('.flower-item').forEach((item, i) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(24px) scale(0.85)';
      setTimeout(() => {
        item.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.34,1.56,0.64,1)';
        item.style.opacity = '1';
        item.style.transform = 'none';
      }, 80 + i * 80);
    });
  },

  // ══════════════════════════════════════════════════════
  //  SCREEN 5 — MEMORY LANE
  // ══════════════════════════════════════════════════════

  buildMemory() {
    const scroll = document.getElementById('memory-scroll');
    if (!scroll || !CONFIG.memories || !CONFIG.memories.length) return;

    const ICONS = ['\uD83C\uDF19', '\u2B50', '\uD83D\uDC8C', '\u2728', '\uD83E\uDD0D'];
    CONFIG.memories.forEach((mem, i) => {
      const polaroid = document.createElement('div');
      polaroid.className = 'polaroid';
      polaroid.setAttribute('role', 'listitem');

      const photoEl = mem.src
        ? '<img src="' + mem.src + '" alt="' + mem.caption + '" loading="lazy" />'
        : '<div class="polaroid-photo-placeholder"><span>' + ICONS[i % 5] + '</span><small>add your photo here</small></div>';

      const lilyAccent =
        '<div class="polaroid-lily-accent" aria-hidden="true">' +
        '<svg viewBox="0 0 24 30" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M12 28 Q11 20 12 14" fill="none" stroke="#7a9970" stroke-width="1.2" stroke-linecap="round"/>' +
        '<ellipse cx="12" cy="7" rx="2" ry="6" transform="rotate(0 12 12)" fill="#ffffff" stroke="#c8c2d8" stroke-width="0.3"/>' +
        '<ellipse cx="12" cy="7" rx="2" ry="6" transform="rotate(60 12 12)" fill="#f0edf6" stroke="#c8c2d8" stroke-width="0.3"/>' +
        '<ellipse cx="12" cy="7" rx="2" ry="6" transform="rotate(120 12 12)" fill="#ffffff" stroke="#c8c2d8" stroke-width="0.3"/>' +
        '<ellipse cx="12" cy="7" rx="2" ry="6" transform="rotate(180 12 12)" fill="#f0edf6" stroke="#c8c2d8" stroke-width="0.3"/>' +
        '<ellipse cx="12" cy="7" rx="2" ry="6" transform="rotate(240 12 12)" fill="#ffffff" stroke="#c8c2d8" stroke-width="0.3"/>' +
        '<ellipse cx="12" cy="7" rx="2" ry="6" transform="rotate(300 12 12)" fill="#f0edf6" stroke="#c8c2d8" stroke-width="0.3"/>' +
        '<circle cx="12" cy="12" r="1.5" fill="#e8dcc0"/>' +
        '</svg>' +
        '</div>';

      polaroid.innerHTML =
        '<div class="polaroid-photo">' + photoEl + '</div>' +
        '<div class="polaroid-tag">' + mem.tag + '</div>' +
        '<div class="polaroid-caption">' + mem.caption + '</div>' +
        lilyAccent;

      scroll.appendChild(polaroid);
    });
  },

  animateMemory() {
    document.querySelectorAll('.polaroid').forEach((p, i) => {
      p.style.opacity = '0';
      p.style.transform = 'rotate(' + ((i % 2 === 0 ? -1 : 1) * (1 + i)) + 'deg) translateY(30px)';
      setTimeout(() => {
        p.style.transition = 'opacity 0.7s ease, transform 0.7s cubic-bezier(0.16,1,0.3,1)';
        p.style.opacity = '1';
        const rots = [-1.5, 2, -1, 2.5, -2];
        p.style.transform = 'rotate(' + (rots[i] || 0) + 'deg)';
      }, 100 + i * 120);
    });
  },

  // ══════════════════════════════════════════════════════
  //  SCREEN 6 — MINI GAME (Catch the Kitty's Kisses)
  // ══════════════════════════════════════════════════════

  // Called once at app start — attaches button listeners
  setupGame() {
    const startBtn = document.getElementById('game-start-btn');
    const retryBtn = document.getElementById('game-retry-btn');
    const collectBtn = document.getElementById('game-collect-btn');

    startBtn?.addEventListener('click', () => { if (this._startGameFn) this._startGameFn(); });
    retryBtn?.addEventListener('click', () => { if (this._startGameFn) this._startGameFn(); });
    collectBtn?.addEventListener('click', () => {
      // Show final message after collecting kisses
      const winCard = document.querySelector('.game-win-card');
      if (winCard) {
        const title = winCard.querySelector('.game-overlay-title');
        const text = winCard.querySelector('.game-overlay-text');
        const btns = winCard.querySelector('.game-overlay-btns');
        if (title) title.textContent = 'mwahhh 😭❤️ okay now stop being this cute, maithili';
        if (text) text.style.display = 'none';
        if (btns) {
          btns.innerHTML = '<button class="btn btn-ghost" id="game-home-btn">go home ♡</button>';
          document.getElementById('game-home-btn')?.addEventListener('click', () => {
            document.getElementById('game-win-overlay')?.classList.remove('visible');
            this.goTo('hub');
          });
        }
      }
    });
  },

  // Called each time the game screen is entered
  initGame() {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) return;

    // stop any previous session
    if (this.gameState) {
      this.gameState.running = false;
      cancelAnimationFrame(this.gameState.raf);
    }

    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('game-score');
    const livesEl = document.getElementById('game-lives');
    const startOverlay = document.getElementById('game-start-overlay');
    const winOverlay = document.getElementById('game-win-overlay');
    const loseOverlay = document.getElementById('game-lose-overlay');

    // ── Canvas sizing ──
    const setSize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width) return;
      canvas.width = Math.round(rect.width * window.devicePixelRatio);
      canvas.height = Math.round(rect.height * window.devicePixelRatio);
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };
    requestAnimationFrame(setSize);

    const W = () => canvas.getBoundingClientRect().width;
    const H = () => canvas.getBoundingClientRect().height;

    // ── State ──
    const state = {
      running: false,
      score: 0,
      lives: 3,
      targetScore: 10,
      raf: null,
      hearts: [],
      particles: [],
      lastSpawn: 0,
      catX: 0,
      catY: 0,
      catWobble: 0,
    };
    this.gameState = state;

    // ── Draw adorable cat ──
    const drawCat = () => {
      const x = W() / 2;
      const y = H() - 80;
      state.catX = x;
      state.catY = y;

      // Cat body (simple adorable cat shape)
      ctx.font = '60px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Add slight wobble animation
      state.catWobble += 0.05;
      const wobbleX = Math.sin(state.catWobble) * 3;
      const wobbleY = Math.cos(state.catWobble * 0.7) * 2;

      ctx.fillText('🐱', x + wobbleX, y + wobbleY);
    };

    // ── Heart types ──
    const HEART_TYPES = [
      { color: '#F3DDE5', size: 28 },
      { color: '#DCD6F2', size: 24 },
      { color: '#FFFDF8', size: 26 },
      { color: '#F3DDE5', size: 22 },
    ];

    const spawnHeart = () => {
      const t = HEART_TYPES[Math.floor(Math.random() * HEART_TYPES.length)];
      state.hearts.push({
        x: 30 + Math.random() * (W() - 60),
        y: -30,
        vy: 0.8 + Math.random() * 0.6,
        vx: (Math.random() - 0.5) * 0.5,
        color: t.color,
        size: t.size,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.02 + Math.random() * 0.02,
        caught: false,
      });
    };

    const spawnParticle = (x, y, color) => {
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        state.particles.push({
          x, y,
          vx: Math.cos(angle) * (2 + Math.random()),
          vy: Math.sin(angle) * (2 + Math.random()) - 1.5,
          life: 1, symbol: '💕', color,
          size: 12 + Math.random() * 8,
        });
      }
    };

    const updateLivesDisplay = () => {
      if (livesEl) {
        livesEl.textContent = '❤️'.repeat(state.lives);
      }
    };

    // ── Tap/click input ──
    const onHit = (clientX, clientY) => {
      if (!state.running) return;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // Check if tap hit any heart
      for (let i = state.hearts.length - 1; i >= 0; i--) {
        const heart = state.hearts[i];
        if (heart.caught) continue;

        const dx = x - heart.x;
        const dy = y - heart.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Touch target size (comfortable for mobile)
        if (dist < heart.size + 20) {
          heart.caught = true;
          state.score++;
          if (scoreEl) scoreEl.textContent = state.score;
          spawnParticle(heart.x, heart.y, heart.color);

          // Check win condition
          if (state.score >= state.targetScore) {
            winGame();
          }
          return;
        }
      }
    };

    canvas.addEventListener('mousedown', e => onHit(e.clientX, e.clientY));
    canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      onHit(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });

    // ── Visibility change (pause when tab hidden) ──
    const onVisibilityChange = () => {
      if (document.hidden && state.running) {
        state.running = false;
        cancelAnimationFrame(state.raf);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const winGame = () => {
      state.running = false;
      cancelAnimationFrame(state.raf);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (winOverlay) winOverlay.classList.add('visible');
    };

    const loseGame = () => {
      state.running = false;
      cancelAnimationFrame(state.raf);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (loseOverlay) loseOverlay.classList.add('visible');
    };

    // ── Game loop ──
    const loop = (ts) => {
      if (!state.running) return;

      const w = W(), h = H();
      ctx.clearRect(0, 0, w, h);

      // Spawn hearts (spawn rate adjusted for 30-45s game at target score)
      const spawnRate = 1200; // ms between spawns
      if (ts - state.lastSpawn > spawnRate) {
        spawnHeart();
        state.lastSpawn = ts;
      }

      // Update and draw hearts
      state.hearts = state.hearts.filter(heart => {
        if (heart.caught) return false;

        heart.y += heart.vy;
        heart.wobble += heart.wobbleSpeed;
        heart.x += Math.sin(heart.wobble) * 0.8 + heart.vx;

        // Check if heart fell off screen (missed)
        if (heart.y > h + 30) {
          state.lives--;
          updateLivesDisplay();
          if (state.lives <= 0) {
            loseGame();
          }
          return false;
        }

        // Draw heart
        ctx.globalAlpha = 0.95;
        ctx.fillStyle = heart.color;
        ctx.font = heart.size + 'px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = heart.color;
        ctx.shadowBlur = 10;
        ctx.fillText('♡', heart.x, heart.y);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        return true;
      });

      // Update and draw particles
      state.particles = state.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.life -= 0.035;
        if (p.life <= 0) return false;
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.font = p.size + 'px serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.symbol, p.x, p.y);
        ctx.globalAlpha = 1;
        return true;
      });

      drawCat();
      state.raf = requestAnimationFrame(loop);
    };

    // ── Expose startGame for button listeners ──
    this._startGameFn = () => {
      state.score = 0;
      state.lives = 3;
      state.hearts = [];
      state.particles = [];
      state.running = true;
      state.lastSpawn = 0;

      if (scoreEl) scoreEl.textContent = '0';
      updateLivesDisplay();

      startOverlay?.classList.remove('visible');
      winOverlay?.classList.remove('visible');
      loseOverlay?.classList.remove('visible');

      // Reset win overlay card state
      const winCard = document.querySelector('.game-win-card');
      if (winCard) {
        const title = winCard.querySelector('.game-overlay-title');
        const text = winCard.querySelector('.game-overlay-text');
        const btns = winCard.querySelector('.game-overlay-btns');
        if (title) title.textContent = 'AYYYYY YOU DID IT 😭❤️';
        if (text) {
          text.style.display = '';
          text.textContent = 'your reward: one cat kiss and one from me too, if i was there 🙃';
        }
        if (btns) {
          btns.innerHTML = '<button class="btn btn-gold" id="game-collect-btn">collect your kisses 💋</button>';
          document.getElementById('game-collect-btn')?.addEventListener('click', () => {
            if (title) title.textContent = 'mwahhh 😭❤️ okay now stop being this cute, maithili';
            if (text) text.style.display = 'none';
            if (btns) {
              btns.innerHTML = '<button class="btn btn-ghost" id="game-home-btn">go home ♡</button>';
              document.getElementById('game-home-btn')?.addEventListener('click', () => {
                document.getElementById('game-win-overlay')?.classList.remove('visible');
                this.goTo('hub');
              });
            }
          });
        }
      }

      cancelAnimationFrame(state.raf);
      state.raf = requestAnimationFrame(loop);
    };

    // Show start overlay
    startOverlay?.classList.add('visible');
    winOverlay?.classList.remove('visible');
    loseOverlay?.classList.remove('visible');
  },

  // ══════════════════════════════════════════════════════
  //  SCREEN 7 — FINAL SURPRISE (with sunflower scene)
  // ══════════════════════════════════════════════════════

  buildSurprise() {
    // Hug button listeners
    document.getElementById('surprise-hug-btn')?.addEventListener('click', () => {
      document.getElementById('hug-overlay')?.classList.add('visible');
    });
    document.getElementById('hug-close')?.addEventListener('click', () => {
      document.getElementById('hug-overlay')?.classList.remove('visible');
    });
    document.querySelector('.hug-bg')?.addEventListener('click', () => {
      document.getElementById('hug-overlay')?.classList.remove('visible');
    });

    // Build sunflower scene — lilies + one sunflower
    const scene = document.getElementById('sunflower-scene');
    if (!scene) return;

    // Helper: create a lily SVG string
    const lilySVG = (hue) =>
      '<svg viewBox="0 0 50 75" class="scene-lily" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M25 73 Q24 60 25 46" fill="none" stroke="#7a9970" stroke-width="2" stroke-linecap="round"/>' +
      '<ellipse cx="20" cy="62" rx="6" ry="2.5" transform="rotate(-25 20 62)" fill="#7a9970" opacity="0.7"/>' +
      [0, 60, 120, 180, 240, 300].map(r =>
        '<ellipse cx="25" cy="22" rx="4" ry="11" transform="rotate(' + r + ' 25 35)"' +
        ' fill="hsl(' + (260 + hue) + ',14%,93%)" stroke="hsl(260,8%,87%)" stroke-width="0.3"/>'
      ).join('') +
      '<circle cx="25" cy="35" r="3.5" fill="#e8dcc0"/>' +
      '<circle cx="23" cy="32" r="0.8" fill="#c4956a" opacity="0.5"/>' +
      '<circle cx="27" cy="32" r="0.8" fill="#c4956a" opacity="0.5"/>' +
      '<circle cx="25" cy="30" r="0.8" fill="#c4956a" opacity="0.5"/>' +
      '</svg>';

    // The ONE sunflower SVG
    const sunflowerSVG =
      '<svg viewBox="0 0 56 78" class="scene-sunflower" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M28 76 Q27 62 28 48" fill="none" stroke="#6a8c5e" stroke-width="2.2" stroke-linecap="round"/>' +
      '<ellipse cx="22" cy="64" rx="7" ry="3" transform="rotate(-25 22 64)" fill="#6a8c5e" opacity="0.75"/>' +
      [0, 25.7, 51.4, 77.1, 102.9, 128.6, 154.3, 180, 205.7, 231.4, 257.1, 282.9, 308.6, 334.3].map(a =>
        '<ellipse cx="28" cy="26" rx="3.2" ry="8.5" transform="rotate(' + a + ' 28 37)" fill="#F0C640"/>'
      ).join('') +
      '<circle cx="28" cy="37" r="7.5" fill="#8B5E3C"/>' +
      '<circle cx="28" cy="37" r="4.5" fill="#6B4226"/>' +
      '<circle cx="26" cy="35" r="0.7" fill="#5a3820" opacity="0.4"/>' +
      '<circle cx="30" cy="36" r="0.7" fill="#5a3820" opacity="0.4"/>' +
      '<circle cx="28" cy="39" r="0.7" fill="#5a3820" opacity="0.4"/>' +
      '</svg>';

    scene.innerHTML =
      '<div class="sunflower-scene-row">' +
      lilySVG(0) +
      lilySVG(15) +
      sunflowerSVG +
      lilySVG(8) +
      lilySVG(20) +
      '</div>' +
      '<p class="sunflower-note">one little sunflower, in a world full of your lilies. \u2661</p>';
  },

  animateSurprise() {
    const screen = document.getElementById('screen-surprise');
    if (screen) screen.scrollTop = 0;
    window.scrollTo(0, 0);

    const intro = document.getElementById('surprise-intro');
    const body = document.getElementById('surprise-body');
    const paras = document.querySelectorAll('.surprise-para');
    const scene = document.getElementById('sunflower-scene');

    if (intro) {
      intro.classList.remove('visible');
      setTimeout(() => intro.classList.add('visible'), 300);
    }

    if (body) {
      body.classList.remove('visible');
      paras.forEach(p => p.classList.remove('visible'));
      if (scene) scene.classList.remove('visible');

      setTimeout(() => {
        body.classList.add('visible');
        paras.forEach((p, i) => {
          setTimeout(() => p.classList.add('visible'), 200 + i * 500);
        });
        // Sunflower scene appears after all paragraphs
        if (scene) {
          setTimeout(() => scene.classList.add('visible'), 200 + paras.length * 500 + 800);
        }
      }, 1600);
    }
  },

  // ══════════════════════════════════════════════════════
  //  SCREEN 8 — ENDING
  // ══════════════════════════════════════════════════════

  buildEnding() {
    const lines = document.getElementById('end-lines');
    if (!lines) return;

    CONFIG.endingLines.forEach((line, i) => {
      const el = document.createElement('p');
      el.className = 'end-line' + (i === CONFIG.endingLines.length - 1 ? ' highlight' : '');
      el.textContent = line;
      lines.appendChild(el);
    });

    document.getElementById('end-home-btn')?.addEventListener('click', () => this.goTo('hub'));
  },

  animateEnd() {
    const endLines = document.querySelectorAll('.end-line');
    endLines.forEach(l => l.classList.remove('visible'));
    endLines.forEach((l, i) => {
      setTimeout(() => l.classList.add('visible'), 400 + i * 600);
    });
  },
};

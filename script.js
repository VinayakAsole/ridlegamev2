// Alphanumerical Riddle Challenge — v3.0 (3D + Effects Edition)

/* ═══════════════════════════════════════════════════
   PARTICLE SYSTEM
════════════════════════════════════════════════════ */
class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.resize();
        this.spawn();
        this.loop();
        window.addEventListener('resize', () => this.resize());
    }
    resize() {
        this.canvas.width  = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    spawn() {
        const count = Math.min(120, Math.floor(window.innerWidth / 12));
        for (let i = 0; i < count; i++) this.addParticle(true);
    }
    addParticle(init = false) {
        const colors = ['#00d4ff','#a855f7','#f72585','#39ff14','#ff9500','#ffffff'];
        this.particles.push({
            x: Math.random() * (this.canvas?.width || 800),
            y: init ? Math.random() * (this.canvas?.height || 600) : (this.canvas?.height || 600) + 10,
            r: Math.random() * 1.8 + 0.3,
            color: colors[Math.floor(Math.random() * colors.length)],
            vy: -(Math.random() * 0.5 + 0.1),
            vx: (Math.random() - 0.5) * 0.3,
            opacity: Math.random() * 0.6 + 0.1,
            twinkle: Math.random() * Math.PI * 2
        });
    }
    loop() {
        if (!this.canvas) return;
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles = this.particles.filter(p => {
            p.twinkle += 0.04;
            p.x += p.vx;
            p.y += p.vy;
            const alpha = p.opacity * (0.6 + 0.4 * Math.sin(p.twinkle));
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = alpha;
            ctx.shadowBlur = 6;
            ctx.shadowColor = p.color;
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            return p.y > -10;
        });
        while (this.particles.length < 100) this.addParticle();
        requestAnimationFrame(() => this.loop());
    }
}

/* ═══════════════════════════════════════════════════
   FIREWORKS SYSTEM
════════════════════════════════════════════════════ */
class FireworksSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.sparks = [];
        this.resize();
        this.running = false;
        window.addEventListener('resize', () => this.resize());
    }
    resize() {
        if (!this.canvas) return;
        this.canvas.width  = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    burst(x, y, color = null) {
        if (!this.canvas) return;
        const colors = ['#00d4ff','#a855f7','#f72585','#fbbf24','#4ade80','#ffffff'];
        const c = color || colors[Math.floor(Math.random() * colors.length)];
        const count = 70 + Math.floor(Math.random() * 30);
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + Math.random() * 0.3;
            const speed = Math.random() * 8 + 2;
            this.sparks.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: Math.random() > 0.5 ? c : '#ffffff',
                life: 1, decay: Math.random() * 0.02 + 0.012,
                r: Math.random() * 3 + 1, trail: []
            });
        }
        if (!this.running) { this.running = true; this.loop(); }
    }
    celebrate() {
        if (!this.canvas) return;
        const positions = [
            [this.canvas.width * 0.25, this.canvas.height * 0.35],
            [this.canvas.width * 0.75, this.canvas.height * 0.35],
            [this.canvas.width * 0.5,  this.canvas.height * 0.25],
        ];
        positions.forEach(([x, y], i) =>
            setTimeout(() => this.burst(x, y), i * 200)
        );
    }
    loop() {
        if (!this.canvas) return;
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.sparks = this.sparks.filter(s => {
            s.trail.push({ x: s.x, y: s.y, life: s.life });
            if (s.trail.length > 5) s.trail.shift();
            s.x  += s.vx;
            s.y  += s.vy;
            s.vy += 0.18; // gravity
            s.vx *= 0.97;
            s.life -= s.decay;
            // trail
            s.trail.forEach((t, ti) => {
                ctx.beginPath();
                ctx.arc(t.x, t.y, s.r * (ti / s.trail.length) * 0.5, 0, Math.PI * 2);
                ctx.fillStyle = s.color;
                ctx.globalAlpha = t.life * 0.3 * (ti / s.trail.length);
                ctx.fill();
            });
            // spark
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r * s.life, 0, Math.PI * 2);
            ctx.fillStyle = s.color;
            ctx.globalAlpha = s.life;
            ctx.shadowBlur = 8;
            ctx.shadowColor = s.color;
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            return s.life > 0;
        });
        if (this.sparks.length > 0) {
            requestAnimationFrame(() => this.loop());
        } else {
            this.running = false;
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
}

/* ═══════════════════════════════════════════════════
   3D TILT ENGINE
════════════════════════════════════════════════════ */
class TiltEngine {
    static init() {
        document.querySelectorAll('.tilt-card').forEach(card => {
            card.addEventListener('mousemove', e => TiltEngine.onMove(e, card));
            card.addEventListener('mouseleave', e => TiltEngine.onLeave(card));
        });
    }
    static onMove(e, card) {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width  / 2;
        const cy = rect.top  + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width  / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        const rotX = -dy * 10;
        const rotY =  dx * 10;
        card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02,1.02,1.02)`;
        card.style.transition = 'transform 0.1s ease';
        // shine position
        const shine = card.querySelector('.card-shine');
        if (shine) {
            const px = ((e.clientX - rect.left) / rect.width)  * 100;
            const py = ((e.clientY - rect.top)  / rect.height) * 100;
            shine.style.setProperty('--mx', px + '%');
            shine.style.setProperty('--my', py + '%');
        }
    }
    static onLeave(card) {
        card.style.transform = '';
        card.style.transition = 'transform 0.5s ease';
    }
    static refresh() {
        document.querySelectorAll('.tilt-card').forEach(card => {
            card.removeEventListener('mousemove', TiltEngine.onMove);
            card.removeEventListener('mouseleave', TiltEngine.onLeave);
        });
        TiltEngine.init();
    }
}

/* ═══════════════════════════════════════════════════
   ANIMATED COUNTER
════════════════════════════════════════════════════ */
function animateCount(el, target, duration = 600) {
    if (!el) return;
    const start = parseInt(el.textContent) || 0;
    if (start === target) return;
    const startTime = performance.now();
    const step = ts => {
        const elapsed = ts - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(start + (target - start) * eased);
        if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

/* ═══════════════════════════════════════════════════
   RIPPLE EFFECT
════════════════════════════════════════════════════ */
function addRipple(e, btn) {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rip = document.createElement('span');
    rip.className = 'ripple-effect';
    rip.style.left = x + 'px';
    rip.style.top  = y + 'px';
    btn.appendChild(rip);
    setTimeout(() => rip.remove(), 650);
}

/* ═══════════════════════════════════════════════════
   MAIN GAME CLASS
════════════════════════════════════════════════════ */
class AlphanumericalRiddleGame {
    constructor() {
        this.currentPage    = 'welcome';
        this.currentStage   = 'easy';
        this.currentLevel   = 1;
        this.maxLevel       = 20;
        this.levelStartTime = null;
        this.levelAttemptsCount = 0;
        this.timerInterval  = null;
        this.timerSeconds   = 0;
        this.skipsRemaining = 3;
        this.isDarkMode     = false;

        this.riddleDatabase = {
            easy: [
                { question: "What comes next?",         sequence: "A10, B20, C30, D40, ?",   answer: "E50",  hint: "Letters in order, numbers increase by 10" },
                { question: "Complete the pattern:",    sequence: "Z1, A2, B3, C4, ?",        answer: "D5",   hint: "Alphabet wraps from Z to A, numbers increase by 1" },
                { question: "Find the next:",           sequence: "H8, I9, J10, K11, ?",      answer: "L12",  hint: "Letters and numbers match their alphabet positions" },
                { question: "What's the sequence?",    sequence: "A1, A2, B3, B4, ?",         answer: "C5",   hint: "Each letter appears twice with consecutive numbers" },
                { question: "Complete this:",           sequence: "M1, O2, Q3, S4, ?",        answer: "U5",   hint: "Skip one letter each time, numbers increase by 1" },
                { question: "Next in pattern:",         sequence: "A100, B200, C300, D400, ?", answer: "E500", hint: "Letters in order, numbers increase by 100" },
                { question: "Find the next term:",      sequence: "Y2, X4, W6, V8, ?",        answer: "U10",  hint: "Go backwards in alphabet, numbers increase by 2" },
                { question: "What comes next?",         sequence: "A1, C1, E1, G1, ?",        answer: "I1",   hint: "Skip one letter each time, all numbers are 1" },
                { question: "Complete pattern:",        sequence: "B11, C22, D33, E44, ?",     answer: "F55",  hint: "Letters in order, numbers are double digits" },
                { question: "Find sequence:",           sequence: "A0, B1, C2, D3, ?",         answer: "E4",   hint: "Letters in order, numbers start from 0" },
                { question: "What's next?",            sequence: "J1, K3, L5, M7, ?",          answer: "N9",   hint: "Letters in order, numbers are odd" },
                { question: "Complete this:",           sequence: "A12, B24, C36, D48, ?",     answer: "E60",  hint: "Letters in order, numbers are multiples of 12" },
                { question: "Next term:",               sequence: "P1, Q1, R2, S2, ?",         answer: "T3",   hint: "Letters in order, numbers increase every two letters" },
                { question: "Find pattern:",            sequence: "A9, B18, C27, D36, ?",      answer: "E45",  hint: "Letters in order, numbers are multiples of 9" },
                { question: "What comes next?",         sequence: "F1, H2, J3, L4, ?",         answer: "N5",   hint: "Skip one letter each time, numbers increase by 1" },
                { question: "Complete sequence:",       sequence: "A25, B50, C75, D100, ?",    answer: "E125", hint: "Letters in order, numbers increase by 25" },
                { question: "Find the next:",           sequence: "T1, U1, V2, W2, ?",         answer: "X3",   hint: "Letters in order, numbers increase every two letters" },
                { question: "What's the pattern?",     sequence: "A8, C16, E24, G32, ?",       answer: "I40",  hint: "Skip letters, numbers are multiples of 8" },
                { question: "Next in sequence:",        sequence: "D4, E5, F6, G7, ?",         answer: "H8",   hint: "Letters and numbers both increase by 1" },
                { question: "Final easy challenge:",    sequence: "A15, B30, C45, D60, ?",     answer: "E75",  hint: "Letters in order, numbers are multiples of 15" }
            ],
            medium: [
                { question: "What comes next?",      sequence: "A2, D8, G14, J20, ?",    answer: "M26",  hint: "Skip 2 letters, add 6 each time" },
                { question: "Find the pattern:",     sequence: "B1, F5, J9, N13, ?",     answer: "R17",  hint: "Skip 3 letters, add 4 each time" },
                { question: "Complete this:",        sequence: "A3, C9, E15, G21, ?",    answer: "I27",  hint: "Skip 1 letter, add 6 each time" },
                { question: "What's the sequence?", sequence: "Z26, W23, T20, Q17, ?",  answer: "N14",  hint: "Go backwards, skip 2 letters, subtract 3" },
                { question: "Find next term:",       sequence: "A1, E5, I9, M13, ?",     answer: "Q17",  hint: "Skip 3 letters, add 4 each time" },
                { question: "Complete pattern:",     sequence: "B4, F12, J20, N28, ?",   answer: "R36",  hint: "Skip 3 letters, add 8 each time" },
                { question: "What comes next?",      sequence: "A7, D21, G35, J49, ?",   answer: "M63",  hint: "Skip 2 letters, add 14 each time" },
                { question: "Find the next:",        sequence: "C6, H18, M30, R42, ?",   answer: "W54",  hint: "Skip 4 letters, add 12 each time" },
                { question: "Complete this:",        sequence: "A5, F25, K45, P65, ?",   answer: "U85",  hint: "Skip 4 letters, add 20 each time" },
                { question: "What's the pattern?",  sequence: "B3, G15, L27, Q39, ?",   answer: "V51",  hint: "Skip 4 letters, add 12 each time" },
                { question: "Find sequence:",        sequence: "A10, E30, I50, M70, ?",  answer: "Q90",  hint: "Skip 3 letters, add 20 each time" },
                { question: "Complete pattern:",     sequence: "D2, I12, N22, S32, ?",   answer: "X42",  hint: "Skip 4 letters, add 10 each time" },
                { question: "What comes next?",      sequence: "A4, F20, K36, P52, ?",   answer: "U68",  hint: "Skip 4 letters, add 16 each time" },
                { question: "Find the next:",        sequence: "C8, I24, O40, U56, ?",   answer: "A72",  hint: "Skip 5 letters, add 16 each time (wraps)" },
                { question: "Complete this:",        sequence: "B6, H24, N42, T60, ?",   answer: "Z78",  hint: "Skip 5 letters, add 18 each time" },
                { question: "What's next?",         sequence: "A11, G33, M55, S77, ?",  answer: "Y99",  hint: "Skip 5 letters, add 22 each time" },
                { question: "Find pattern:",         sequence: "E1, K7, Q13, W19, ?",    answer: "C25",  hint: "Skip 5 letters, add 6 each time (wraps)" },
                { question: "Complete sequence:",    sequence: "A13, H39, O65, V91, ?",  answer: "C117", hint: "Skip 6 letters, add 26 each time (wraps)" },
                { question: "What comes next?",      sequence: "D5, L25, T45, B65, ?",   answer: "J85",  hint: "Skip 7 letters, add 20 each time (wraps)" },
                { question: "Final medium challenge:",sequence:"A16, J48, S80, B112, ?", answer: "K144", hint: "Skip 8 letters, add 32 each time (wraps)" }
            ],
            hard: [
                { question: "Complete this sequence:", sequence: "A1, D8, I27, P64, ?",         answer: "Y125",      hint: "Triangular positions with perfect cubes" },
                { question: "What's the pattern?",    sequence: "B4, F16, L36, T64, ?",         answer: "D100",      hint: "Triangular positions, numbers are perfect squares ×4" },
                { question: "Find the next term:",    sequence: "A2, E10, K26, S50, ?",         answer: "C82",       hint: "Pentagonal positions, numbers follow 2n²−2n+2" },
                { question: "Complete pattern:",      sequence: "C3, H24, Q75, D144, ?",        answer: "S243",      hint: "Complex position jumps with n³×3 pattern" },
                { question: "What comes next?",       sequence: "A7, G49, Q169, E361, ?",       answer: "W625",      hint: "Prime position jumps with consecutive odd squares" },
                { question: "Find sequence:",         sequence: "B5, J25, V125, N625, ?",       answer: "Z3125",     hint: "Fibonacci positions with powers of 5" },
                { question: "Complete this:",         sequence: "A6, I72, U432, Q2592, ?",      answer: "A15552",    hint: "Octagonal positions, numbers ×6 each time" },
                { question: "What's next?",           sequence: "D16, P256, H4096, X65536, ?",  answer: "T1048576",  hint: "Hexagonal positions with powers of 16" },
                { question: "Find pattern:",          sequence: "A9, L144, C729, R2916, ?",     answer: "M11664",    hint: "Complex jumps with perfect squares ×9" },
                { question: "Complete sequence:",     sequence: "E32, T1024, M32768, F1048576, ?", answer: "Y33554432", hint: "Prime positions with powers of 32" },
                { question: "What comes next?",       sequence: "A11, N169, D625, S2401, ?",    answer: "L8281",     hint: "Triangular jumps with consecutive prime squares" },
                { question: "Find the next:",         sequence: "C18, R324, K5832, D104976, ?", answer: "W1889568",  hint: "Complex pattern with 18×n² progression" },
                { question: "Complete pattern:",      sequence: "B14, Q196, J2744, C38416, ?",  answer: "V537824",   hint: "Fibonacci positions with 14×n³ pattern" },
                { question: "What's next?",           sequence: "F21, Y441, R9261, K194481, ?", answer: "D4084101",  hint: "Hexagonal positions with 21×n⁴ pattern" },
                { question: "Find sequence:",         sequence: "A23, X529, U12167, R279841, ?",answer: "O6436343",  hint: "Prime positions with 23×n⁵ pattern" },
                { question: "Complete this:",         sequence: "E26, Z676, U17576, P456976, ?",answer: "K11881376", hint: "Pentagonal positions with 26×n⁶ pattern" },
                { question: "What comes next?",       sequence: "H29, C841, X24389, S707281, ?",answer: "N20511149", hint: "Octagonal positions with 29×n⁷ pattern" },
                { question: "Find pattern:",          sequence: "B31, A961, Y29791, T923521, ?",answer: "O28629151", hint: "Complex prime jumps with 31×n⁸ pattern" },
                { question: "Complete sequence:",     sequence: "J33, B1089, Z35937, U1185921, ?",answer:"P39135393",hint: "Fibonacci positions with 33×n⁹ pattern" },
                { question: "Ultimate challenge:",    sequence: "A37, A1369, A50653, A1874161, ?",answer:"A69343957",hint: "All A's with 37×n¹⁰ pattern — ultimate test!" }
            ]
        };

        this.stats = {
            easy:   { completed: 0, total: 20 },
            medium: { completed: 0, total: 20 },
            hard:   { completed: 0, total: 20 },
            overall: { correct: 0, total: 0, streak: 0, bestStreak: 0 }
        };

        this.loadStats();
        this.initializeElements();
        this.bindEvents();
        this.loadDarkMode();
        this.loadSkips();
        this.updateSkipBadge();
        this.showPage('welcome');
    }

    /* ── Element References ─────────────────────────────── */
    initializeElements() {
        this.welcomePage        = document.getElementById('welcomePage');
        this.stageSelectionPage = document.getElementById('stageSelectionPage');
        this.gamePage           = document.getElementById('gamePage');
        this.startGameBtn       = document.getElementById('startGameBtn');
        this.backToWelcome      = document.getElementById('backToWelcome');
        this.backToStages       = document.getElementById('backToStages');
        this.backToStagesFromModal = document.getElementById('backToStagesFromModal');
        this.stageCards         = document.querySelectorAll('.stage-card');
        this.selectStageBtns    = document.querySelectorAll('.select-stage-btn');
        this.currentStageEl     = document.getElementById('currentStage');
        this.currentLevelEl     = document.getElementById('currentLevel');
        this.progressFill       = document.getElementById('progressFill');
        this.riddleQuestion     = document.getElementById('riddleQuestion');
        this.sequenceText       = document.getElementById('sequenceText');
        this.answerInput        = document.getElementById('answerInput');
        this.submitBtn          = document.getElementById('submitBtn');
        this.resultSection      = document.getElementById('resultSection');
        this.resultText         = document.getElementById('resultText');
        this.hintBtn            = document.getElementById('hintBtn');
        this.hintText           = document.getElementById('hintText');
        this.difficultyBadge    = document.getElementById('difficulty');
        this.skipBtn            = document.getElementById('skipBtn');
        this.skipBadge          = document.getElementById('skipBadge');
        this.timerValue         = document.getElementById('timerValue');
        this.correctAnswersEl   = document.getElementById('correctAnswers');
        this.totalAttemptsEl    = document.getElementById('totalAttempts');
        this.currentStreakEl    = document.getElementById('currentStreak');
        this.accuracyPercent    = document.getElementById('accuracyPercent');
        this.accuracyFill       = document.getElementById('accuracyFill');
        this.bestStreakDisplay  = document.getElementById('bestStreakDisplay');
        this.miniDots           = document.getElementById('miniDots');
        this.easyCompletion     = document.getElementById('easyCompletion');
        this.mediumCompletion   = document.getElementById('mediumCompletion');
        this.hardCompletion     = document.getElementById('hardCompletion');
        this.congratsModal      = document.getElementById('congratsModal');
        this.congratsText       = document.getElementById('congratsText');
        this.quickTime          = document.getElementById('quickTime');
        this.quickAttempts      = document.getElementById('quickAttempts');
        this.nextQuizBtn        = document.getElementById('nextQuizBtn');
        this.stayHereBtn        = document.getElementById('stayHereBtn');
        this.showLevelsModal    = document.getElementById('showLevelsModal');
        this.levelsModalSubtitle = document.getElementById('levelsModalSubtitle');
        this.levelsGrid         = document.getElementById('levelsGrid');
        this.showLevelsBtn      = document.getElementById('showLevelsBtn');
        this.closeLevelsModal   = document.getElementById('closeLevelsModal');
        this.closeLevelsBtn     = document.getElementById('closeLevelsBtn');
        this.resetProgressBtn   = document.getElementById('resetProgressBtn');
        this.levelCompleteModal = document.getElementById('levelCompleteModal');
        this.levelCompleteText  = document.getElementById('levelCompleteText');
        this.levelTimeEl        = document.getElementById('levelTime');
        this.levelAttemptsEl    = document.getElementById('levelAttempts');
        this.nextLevelBtn       = document.getElementById('nextLevelBtn');
        this.darkModeToggle     = document.getElementById('darkModeToggle');
        this.darkModeIcon       = document.getElementById('darkModeIcon');
        this.toastNotification  = document.getElementById('toastNotification');
        this.toastMessage       = document.getElementById('toastMessage');
        this.globalCorrect      = document.getElementById('globalCorrect');
        this.globalBestStreak   = document.getElementById('globalBestStreak');
        this.globalAccuracy     = document.getElementById('globalAccuracy');
        this.flipCardInner      = document.getElementById('flipCardInner');
    }

    /* ── Event Bindings ─────────────────────────────────── */
    bindEvents() {
        this.startGameBtn.addEventListener('click', e => { addRipple(e, this.startGameBtn); this.showPage('stageSelection'); });
        this.backToWelcome.addEventListener('click', () => { this.stopTimer(); this.showPage('welcome'); });
        this.backToStages.addEventListener('click',  () => { this.stopTimer(); this.showPage('stageSelection'); });
        this.backToStagesFromModal.addEventListener('click', () => { this.hideLevelCompleteModal(); this.stopTimer(); this.showPage('welcome'); });

        this.selectStageBtns.forEach(btn => {
            btn.addEventListener('click', e => {
                addRipple(e, btn);
                const stage = e.target.closest('.stage-card').dataset.stage;
                this.startStage(stage);
            });
        });

        this.submitBtn.addEventListener('click', e => { addRipple(e, this.submitBtn); this.checkAnswer(); });
        this.answerInput.addEventListener('keypress', e => { if (e.key === 'Enter') this.checkAnswer(); });
        this.hintBtn.addEventListener('click', e => { addRipple(e, this.hintBtn); this.showHint(); });
        this.skipBtn.addEventListener('click', () => this.skipLevel());
        this.nextQuizBtn.addEventListener('click', e => { addRipple(e, this.nextQuizBtn); this.nextQuiz(); });
        this.stayHereBtn.addEventListener('click', () => this.hideCongratsModal());
        this.nextLevelBtn.addEventListener('click', e => { addRipple(e, this.nextLevelBtn); this.hideLevelCompleteModal(); this.stopTimer(); this.showPage('stageSelection'); });
        this.showLevelsBtn.addEventListener('click', () => this.openLevelsModal());
        this.closeLevelsModal.addEventListener('click', () => this.hideLevelsModal());
        this.closeLevelsBtn.addEventListener('click', () => this.hideLevelsModal());
        this.resetProgressBtn.addEventListener('click', () => this.resetStageProgress());
        this.darkModeToggle.addEventListener('click', () => this.toggleDarkMode());

        [this.congratsModal, this.showLevelsModal, this.levelCompleteModal].forEach(m => {
            m && m.addEventListener('click', e => { if (e.target === m) m.classList.remove('active'); });
        });
    }

    /* ── Pages ──────────────────────────────────────────── */
    showPage(name) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(name + 'Page').classList.add('active');
        this.currentPage = name;
        if (name === 'stageSelection') { this.updateStageCompletions(); this.updateStageStars(); }
        else if (name === 'game') { this.displayCurrentRiddle(); this.updateGameHeader(); this.answerInput.focus(); this.startTimer(); this.updateMiniMap(); setTimeout(() => TiltEngine.refresh(), 100); }
        else if (name === 'welcome')   { this.updateWelcomeStats(); }
        setTimeout(() => TiltEngine.refresh(), 150);
    }

    /* ── Stage Completions ──────────────────────────────── */
    updateStageCompletions() {
        this.easyCompletion.textContent   = `${this.stats.easy.completed}/20`;
        this.mediumCompletion.textContent = `${this.stats.medium.completed}/20`;
        this.hardCompletion.textContent   = `${this.stats.hard.completed}/20`;
    }

    updateStageStars() {
        ['easy','medium','hard'].forEach(s => {
            const pct   = this.stats[s].completed / 20;
            const el    = document.getElementById(`${s}Stars`);
            if (!el) return;
            el.querySelectorAll('i').forEach((icon, i) => {
                icon.classList.toggle('fas', pct >= (i + 1) / 3);
                icon.classList.toggle('far', pct < (i + 1) / 3);
            });
        });
    }

    updateWelcomeStats() {
        const acc = this.stats.overall.total > 0
            ? Math.round((this.stats.overall.correct / this.stats.overall.total) * 100) : 0;
        if (this.globalCorrect)    animateCount(this.globalCorrect,    this.stats.overall.correct,    800);
        if (this.globalBestStreak) animateCount(this.globalBestStreak, this.stats.overall.bestStreak || 0, 800);
        if (this.globalAccuracy)   this.globalAccuracy.textContent = acc + '%';
    }

    /* ── Start Stage ────────────────────────────────────── */
    startStage(stage) {
        this.currentStage       = stage;
        this.currentLevel       = this.getNextIncompleteLevel(stage);
        this.levelStartTime     = Date.now();
        this.levelAttemptsCount = 0;
        this.loadSkips();
        this.updateSkipBadge();
        this.showPage('game');
    }

    /* ── Level Helpers ──────────────────────────────────── */
    getNextIncompleteLevel(stage) {
        const done = this.getCompletedLevels(stage);
        for (let i = 1; i <= this.maxLevel; i++) if (!done.includes(i)) return i;
        return 1;
    }
    getCompletedLevels(stage) {
        const s = localStorage.getItem(`completedLevels_${stage}`);
        return s ? JSON.parse(s) : [];
    }
    markLevelCompleted(stage, level) {
        const done = this.getCompletedLevels(stage);
        if (!done.includes(level)) {
            done.push(level);
            localStorage.setItem(`completedLevels_${stage}`, JSON.stringify(done));
            this.stats[stage].completed = done.length;
            this.saveStats();
        }
    }

    /* ── Game Header ────────────────────────────────────── */
    updateGameHeader() {
        const label = this.currentStage.charAt(0).toUpperCase() + this.currentStage.slice(1);
        this.currentStageEl.textContent = label;
        this.currentLevelEl.textContent = this.currentLevel;

        const pct    = (this.currentLevel / this.maxLevel) * 100;
        this.progressFill.style.width = pct + '%';

        const colors = {
            easy:   'linear-gradient(135deg, #22c55e, #16a34a)',
            medium: 'linear-gradient(135deg, #f97316, #ea580c)',
            hard:   'linear-gradient(135deg, #f72585, #c026d3)'
        };
        this.difficultyBadge.style.background = colors[this.currentStage];
        this.difficultyBadge.style.boxShadow  = '';
        this.difficultyBadge.textContent = label;
    }

    /* ── Display Riddle (with 3D flip) ─────────────────── */
    displayCurrentRiddle(animate = false) {
        const riddle = this.riddleDatabase[this.currentStage][this.currentLevel - 1];
        if (!riddle) return;

        const doRender = () => {
            if (this.riddleQuestion) this.riddleQuestion.textContent = riddle.question;
            if (this.sequenceText)   this.sequenceText.textContent   = riddle.sequence;
            if (this.resultText)     { this.resultText.textContent = ''; this.resultText.className = ''; }
            if (this.hintText)       this.hintText.textContent = '';
            if (this.answerInput)    { this.answerInput.value = ''; this.answerInput.focus(); }
        };

        if (animate && this.flipCardInner) {
            this.flipCardInner.classList.add('flipping');
            setTimeout(() => {
                doRender();
                this.flipCardInner.classList.remove('flipping');
            }, 280);
        } else {
            doRender();
        }
    }

    /* ── Mini Level Map ─────────────────────────────────── */
    updateMiniMap() {
        if (!this.miniDots) return;
        const done = this.getCompletedLevels(this.currentStage);
        this.miniDots.innerHTML = '';
        for (let i = 1; i <= this.maxLevel; i++) {
            const dot = document.createElement('div');
            dot.className = 'mini-dot';
            if (done.includes(i))      dot.classList.add('done');
            else if (i === this.currentLevel) dot.classList.add('active');
            else if (i > this.currentLevel)   dot.classList.add('locked');
            this.miniDots.appendChild(dot);
        }
    }

    /* ── Check Answer ───────────────────────────────────── */
    checkAnswer() {
        const userAnswer    = this.answerInput.value.trim().toUpperCase();
        const riddle        = this.riddleDatabase[this.currentStage][this.currentLevel - 1];
        const correctAnswer = riddle.answer.toUpperCase();

        if (!userAnswer) { this.showResult('Please enter an answer!', 'incorrect'); return; }

        this.levelAttemptsCount++;
        this.stats.overall.total++;

        if (userAnswer === correctAnswer) {
            this.stats.overall.correct++;
            this.stats.overall.streak++;
            if (this.stats.overall.streak > (this.stats.overall.bestStreak || 0))
                this.stats.overall.bestStreak = this.stats.overall.streak;

            this.showResult('🎉 Correct! Well done!', 'correct');
            this.markLevelCompleted(this.currentStage, this.currentLevel);
            this.stopTimer();
            this.updateMiniMap();
            this.playCelebrationSound();
            if (window._fireworks) window._fireworks.celebrate();

            setTimeout(() => this.showCongratsModal(), 700);
        } else {
            this.stats.overall.streak = 0;
            this.showResult(`❌ Wrong! Correct answer: ${riddle.answer}`, 'incorrect');
            this.autoAdvanceToNext();
        }

        this.updateStatsDisplay();
        this.saveStats();
    }

    showResult(msg, type) {
        this.resultText.textContent = msg;
        this.resultText.className   = type;
    }

    /* ── Auto-Advance After Wrong ───────────────────────── */
    autoAdvanceToNext() {
        let remaining = 3;
        this.submitBtn.disabled   = true;
        this.answerInput.disabled = true;
        this.hintBtn.disabled     = true;
        if (this.skipBtn) this.skipBtn.disabled = true;

        const tick = () => {
            const r = this.riddleDatabase[this.currentStage][this.currentLevel - 1];
            this.resultText.textContent = `❌ Wrong! Correct answer: ${r.answer} — Next in ${remaining}s…`;
        };
        tick();
        const iv = setInterval(() => {
            remaining--;
            if (remaining > 0) { tick(); }
            else {
                clearInterval(iv);
                this._unlockInput();
                this._goToNext(true);
            }
        }, 1000);
    }

    _unlockInput() {
        this.submitBtn.disabled   = false;
        this.answerInput.disabled = false;
        this.hintBtn.disabled     = false;
        if (this.skipBtn) this.skipBtn.disabled = this.skipsRemaining <= 0;
    }

    _goToNext(animate = false) {
        if (this.currentLevel >= this.maxLevel) {
            this.stopTimer(); this.showPage('stageSelection'); return;
        }
        this.currentLevel++;
        this.levelStartTime     = Date.now();
        this.levelAttemptsCount = 0;
        this.displayCurrentRiddle(animate);
        this.updateGameHeader();
        this.updateMiniMap();
        this.startTimer();
    }

    /* ── Hint ───────────────────────────────────────────── */
    showHint() {
        const r = this.riddleDatabase[this.currentStage][this.currentLevel - 1];
        this.hintText.textContent = `💡 Hint: ${r.hint}`;
    }

    /* ── Skip ───────────────────────────────────────────── */
    skipLevel() {
        if (this.skipsRemaining <= 0) { this.showToast('No skips remaining!'); return; }
        if (!confirm(`Skip Level ${this.currentLevel}? (${this.skipsRemaining - 1} left)`)) return;
        this.skipsRemaining--;
        this.saveSkips();
        this.updateSkipBadge();
        this.showToast(`Skipped! ${this.skipsRemaining} skip(s) left.`);
        this._goToNext(true);
    }

    updateSkipBadge() {
        if (this.skipBadge) this.skipBadge.textContent = `${this.skipsRemaining} left`;
        if (this.skipBtn)   this.skipBtn.disabled = this.skipsRemaining <= 0;
    }
    saveSkips() { sessionStorage.setItem('skipsRemaining', this.skipsRemaining); }
    loadSkips()  { const s = sessionStorage.getItem('skipsRemaining'); this.skipsRemaining = s !== null ? parseInt(s) : 3; return this.skipsRemaining; }

    /* ── Timer ──────────────────────────────────────────── */
    startTimer() {
        this.stopTimer();
        this.timerSeconds = 0;
        this.renderTimer();
        this.timerInterval = setInterval(() => { this.timerSeconds++; this.renderTimer(); }, 1000);
    }
    stopTimer() { if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; } }
    renderTimer() {
        const m = Math.floor(this.timerSeconds / 60);
        const s = this.timerSeconds % 60;
        if (this.timerValue) this.timerValue.textContent = `${m}:${s.toString().padStart(2,'0')}`;
    }

    /* ── Congrats Modal ─────────────────────────────────── */
    showCongratsModal() {
        const t = Math.round((Date.now() - this.levelStartTime) / 1000);
        const m = Math.floor(t / 60), s = t % 60;
        this.congratsText.textContent  = `You solved Level ${this.currentLevel}!`;
        this.quickTime.textContent     = m > 0 ? `${m}m ${s}s` : `${s}s`;
        this.quickAttempts.textContent = `${this.levelAttemptsCount} attempt${this.levelAttemptsCount !== 1 ? 's' : ''}`;
        this.nextQuizBtn.innerHTML     = this.currentLevel >= this.maxLevel
            ? '<span class="btn-text"><i class="fas fa-trophy"></i> Stage Complete!</span><span class="btn-glow"></span>'
            : '<span class="btn-text"><i class="fas fa-arrow-right"></i> Next Quiz</span><span class="btn-glow"></span>';
        this.congratsModal.classList.add('active');
    }
    hideCongratsModal() { this.congratsModal.classList.remove('active'); }

    nextQuiz() {
        this.hideCongratsModal();
        if (this.currentLevel >= this.maxLevel) { this.showStageCompleteModal(); return; }
        this.currentLevel++;
        this.levelStartTime     = Date.now();
        this.levelAttemptsCount = 0;
        this.displayCurrentRiddle(true);
        this.updateGameHeader();
        this.updateMiniMap();
        this.startTimer();
    }

    /* ── Stage Complete Modal ───────────────────────────── */
    showStageCompleteModal() {
        const pct   = this.stats[this.currentStage].completed / this.maxLevel;
        const stars = pct >= 1 ? 3 : pct >= 0.6 ? 2 : 1;
        this.levelCompleteText.textContent = `🎉 Amazing! All ${this.maxLevel} levels of ${this.currentStage} done!`;
        this.levelTimeEl.textContent    = this.timerValue ? this.timerValue.textContent : '--';
        this.levelAttemptsEl.textContent = this.stats.overall.total;
        const el = document.getElementById('stageCompleteStars');
        if (el) el.innerHTML = [1,2,3].map(i => `<i class="${i <= stars ? 'fas' : 'far'} fa-star"></i>`).join('');
        this.levelCompleteModal.classList.add('active');
    }
    hideLevelCompleteModal() { this.levelCompleteModal.classList.remove('active'); }

    /* ── Levels Modal ───────────────────────────────────── */
    openLevelsModal() {
        const label = this.currentStage.charAt(0).toUpperCase() + this.currentStage.slice(1);
        this.levelsModalSubtitle.textContent = `${label} Difficulty`;
        this.generateLevelsGrid();
        this.showLevelsModal.classList.add('active');
    }
    hideLevelsModal() { this.showLevelsModal.classList.remove('active'); }

    generateLevelsGrid() {
        const done = this.getCompletedLevels(this.currentStage);
        this.levelsGrid.innerHTML = '';
        for (let i = 1; i <= this.maxLevel; i++) {
            const el   = document.createElement('div');
            el.className = 'level-item';
            let status = done.includes(i) ? 'completed' : i === this.currentLevel ? 'current' : i < this.currentLevel ? 'available' : 'locked';
            el.classList.add(status);
            const answer = done.includes(i) ? this.riddleDatabase[this.currentStage][i - 1].answer : '';
            const statusLabel = { completed:'Done ✓', current:'Current', available:'Replay', locked:'Locked' }[status];
            el.innerHTML = `<div class="level-number">${i}</div><div class="level-status">${statusLabel}</div>${answer ? `<div class="level-answer">${answer}</div>` : ''}`;
            if (status !== 'locked') el.addEventListener('click', () => this.jumpToLevel(i));
            this.levelsGrid.appendChild(el);
        }
    }

    jumpToLevel(n) {
        this.currentLevel = n; this.levelStartTime = Date.now(); this.levelAttemptsCount = 0;
        this.hideLevelsModal(); this.displayCurrentRiddle(true); this.updateGameHeader(); this.updateMiniMap(); this.startTimer();
    }

    resetStageProgress() {
        if (!confirm(`Reset all progress for ${this.currentStage}?`)) return;
        localStorage.removeItem(`completedLevels_${this.currentStage}`);
        this.stats[this.currentStage].completed = 0;
        this.saveStats(); this.currentLevel = 1;
        this.generateLevelsGrid(); this.updateGameHeader(); this.updateMiniMap();
        this.showToast('Progress reset!');
    }

    /* ── Stats Display ──────────────────────────────────── */
    updateStatsDisplay() {
        animateCount(this.correctAnswersEl, this.stats.overall.correct);
        animateCount(this.totalAttemptsEl,  this.stats.overall.total);
        animateCount(this.currentStreakEl,  this.stats.overall.streak);
        if (this.bestStreakDisplay) animateCount(this.bestStreakDisplay, this.stats.overall.bestStreak || 0);
        const acc = this.stats.overall.total > 0
            ? Math.round((this.stats.overall.correct / this.stats.overall.total) * 100) : 0;
        if (this.accuracyPercent) this.accuracyPercent.textContent = acc + '%';
        if (this.accuracyFill)    this.accuracyFill.style.width    = acc + '%';
    }

    /* ── Persistence ────────────────────────────────────── */
    saveStats() { localStorage.setItem('riddleGameStats', JSON.stringify(this.stats)); }
    loadStats() {
        const s = localStorage.getItem('riddleGameStats');
        if (s) { try { this.stats = { ...this.stats, ...JSON.parse(s) }; } catch(e){} }
        ['easy','medium','hard'].forEach(st => { this.stats[st].completed = this.getCompletedLevels(st).length; });
    }

    /* ── Dark Mode ──────────────────────────────────────── */
    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        document.body.classList.toggle('dark-mode', this.isDarkMode);
        this.darkModeIcon.className = this.isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
        localStorage.setItem('darkMode', this.isDarkMode ? '1' : '0');
    }
    loadDarkMode() {
        if (localStorage.getItem('darkMode') === '1') {
            this.isDarkMode = true;
            document.body.classList.add('dark-mode');
            if (this.darkModeIcon) this.darkModeIcon.className = 'fas fa-sun';
        }
    }

    /* ── Toast ──────────────────────────────────────────── */
    showToast(msg, dur = 3000) {
        this.toastMessage.textContent = msg;
        this.toastNotification.classList.add('show');
        setTimeout(() => this.toastNotification.classList.remove('show'), dur);
    }

    /* ── Sound ──────────────────────────────────────────── */
    playCelebrationSound() {
        try {
            const ctx  = new (window.AudioContext || window.webkitAudioContext)();
            const gain = ctx.createGain();
            gain.connect(ctx.destination);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
            [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
                const o = ctx.createOscillator();
                o.connect(gain); o.type = 'sine';
                o.frequency.setValueAtTime(f, ctx.currentTime + i * 0.1);
                o.start(ctx.currentTime + i * 0.1);
                o.stop(ctx.currentTime + i * 0.1 + 0.25);
            });
        } catch(e) {}
    }
}

/* ═══════════════════════════════════════════════════
   BOOT
════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    // Launch canvas systems
    window._particles = new ParticleSystem('particleCanvas');
    window._fireworks = new FireworksSystem('fireworksCanvas');

    // Launch game
    const game = new AlphanumericalRiddleGame();

    // 3D tilt on all tilt-cards
    TiltEngine.init();

    // Ripple on every button
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', e => addRipple(e, btn));
    });

    // Typing effect on main title
    const title = document.querySelector('.main-title');
    if (title && title.dataset.text) {
        const text = title.dataset.text;
        title.textContent = '';
        let i = 0;
        const iv = setInterval(() => {
            title.textContent += text[i++];
            title.setAttribute('data-text', title.textContent);
            if (i >= text.length) clearInterval(iv);
        }, 55);
    }
});

// Konami code Easter egg
let konamiCode = [];
const konamiSeq = [38,38,40,40,37,39,37,39,66,65];
document.addEventListener('keydown', e => {
    konamiCode.push(e.keyCode);
    if (konamiCode.length > konamiSeq.length) konamiCode.shift();
    if (konamiCode.length === konamiSeq.length && konamiCode.every((c, i) => c === konamiSeq[i])) {
        document.body.style.animation = 'rainbow 2s infinite';
        if (window._fireworks) {
            for (let i = 0; i < 5; i++)
                setTimeout(() => window._fireworks.burst(Math.random() * window.innerWidth, Math.random() * window.innerHeight * 0.6), i * 300);
        }
        setTimeout(() => { document.body.style.animation = ''; }, 6000);
        konamiCode = [];
    }
});
const App = (() => {

    const state = {
        theme: 'dark',
        currentStep: 1,
        totalSteps: 5,
        surveyData: {},
        chartsInitialized: {},
        activeTab: 'overview',
        responsesCount: 247
    };

    function init() {
        setupTheme();
        setupNavbar();
        setupHamburger();
        setupScrollReveal();
        setupStatCounters();
        setupSurvey();
        setupTabs();
        setupRangeInputs();
        setupChipGroups();
        setupContactForm();
        setupNavActiveState();
        initChartsOnView();
        setupOutcomeBars();
    }

    function setupTheme() {
        const saved = localStorage.getItem('s2s-theme') || 'dark';
        applyTheme(saved);

        document.getElementById('themeToggle').addEventListener('click', () => {
            const next = state.theme === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            localStorage.setItem('s2s-theme', next);
        });
    }

    function applyTheme(theme) {
        state.theme = theme;
        document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : '');
        const icon = document.querySelector('.theme-icon');
        icon.textContent = theme === 'light' ? '●' : '◐';
    }

    function setupNavbar() {
        const navbar = document.getElementById('navbar');
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const current = window.scrollY;
            if (current > 80) {
                navbar.style.transform = current > lastScroll && current > 300
                    ? 'translateY(-120%)'
                    : 'translateY(0)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
            lastScroll = current;
        }, { passive: true });
    }

    function setupNavActiveState() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navLinks.forEach(link => {
                        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
                    });
                }
            });
        }, { rootMargin: '-40% 0px -40% 0px' });

        sections.forEach(s => observer.observe(s));
    }

    function setupHamburger() {
        const btn = document.getElementById('hamburger');
        const nav = document.getElementById('nav-links');

        btn.addEventListener('click', () => {
            nav.classList.toggle('open');
            btn.classList.toggle('open');
        });

        document.addEventListener('click', (e) => {
            if (!btn.contains(e.target) && !nav.contains(e.target)) {
                nav.classList.remove('open');
                btn.classList.remove('open');
            }
        });
    }

    function setupScrollReveal() {
        const elements = document.querySelectorAll(
            '.about-card, .chart-card, .insight-pill, .infographic-card, .skill-showcase, .info-card, .contact-card, .report-finding, .journey-step, .stat-card'
        );

        elements.forEach((el, i) => {
            el.classList.add('reveal');
            el.classList.add(`reveal-delay-${(i % 4) + 1}`);
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { rootMargin: '0px 0px -80px 0px' });

        elements.forEach(el => observer.observe(el));
    }

    function setupStatCounters() {
        const stats = document.querySelectorAll('.stat-number[data-target]');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.counted) {
                    entry.target.dataset.counted = 'true';
                    animateCounter(entry.target);
                }
            });
        }, { threshold: 0.5 });

        stats.forEach(s => observer.observe(s));
    }

    function animateCounter(el) {
        const target = parseFloat(el.dataset.target);
        const suffix = el.dataset.suffix || (target < 10 ? 'hrs' : '%');
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        let step = 0;

        const timer = setInterval(() => {
            step++;
            current = Math.min(current + increment, target);

            const display = Number.isInteger(target) ? Math.round(current) : current.toFixed(1);
            el.textContent = `${display}${el.dataset.suffix !== undefined ? el.dataset.suffix : (target > 10 ? '%' : 'hrs')}`;

            if (step >= steps || current >= target) {
                clearInterval(timer);
                el.textContent = `${target}${el.dataset.suffix !== undefined ? el.dataset.suffix : (target > 10 ? '%' : 'hrs')}`;
            }
        }, duration / steps);
    }

    function setupRangeInputs() {
        const hoursRange = document.getElementById('dailyHours');
        const hoursDisplay = document.getElementById('hoursDisplay');

        if (hoursRange) {
            hoursRange.addEventListener('input', () => {
                const v = parseFloat(hoursRange.value);
                hoursDisplay.textContent = `${v} hour${v !== 1 ? 's' : ''}`;
                updateRangeBackground(hoursRange);
            });
            updateRangeBackground(hoursRange);
        }

        const ratingRange = document.getElementById('skillRating');
        const ratingDisplay = document.getElementById('ratingDisplay');

        if (ratingRange) {
            ratingRange.addEventListener('input', () => {
                ratingDisplay.textContent = `${ratingRange.value}/10`;
                updateRangeBackground(ratingRange);
            });
            updateRangeBackground(ratingRange);
        }
    }

    function updateRangeBackground(input) {
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);
        const val = parseFloat(input.value);
        const pct = ((val - min) / (max - min)) * 100;
        input.style.background = `linear-gradient(to right, #6366f1 ${pct}%, var(--border) ${pct}%)`;
    }

    function setupChipGroups() {
        document.querySelectorAll('.chip-group').forEach(group => {
            const isMulti = group.classList.contains('multi');
            group.querySelectorAll('.chip').forEach(chip => {
                chip.addEventListener('click', () => {
                    if (!isMulti) {
                        group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
                    }
                    chip.classList.toggle('active');
                });
            });
        });
    }

    function setupTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                if (tab === state.activeTab) return;

                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

                btn.classList.add('active');
                const content = document.getElementById(`content-${tab}`);
                content.classList.add('active');
                state.activeTab = tab;

                setTimeout(() => initChartForTab(tab), 50);
            });
        });
    }

    function initChartsOnView() {
        const insightSection = document.getElementById('insights');
        const dataSection = document.getElementById('data');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (entry.target === insightSection) {
                        initChartForTab('overview');
                    }
                    if (entry.target === dataSection) {
                        initBreakdownChart();
                    }
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        if (insightSection) observer.observe(insightSection);
        if (dataSection) observer.observe(dataSection);
    }

    function getChartDefaults() {
        const isDark = state.theme === 'dark';
        return {
            textColor: isDark ? 'rgba(245,245,247,0.6)' : 'rgba(29,29,31,0.6)',
            gridColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            fontFamily: "'Inter', sans-serif"
        };
    }

    function initChartForTab(tab) {
        if (state.chartsInitialized[tab]) return;
        state.chartsInitialized[tab] = true;

        const defaults = getChartDefaults();

        if (tab === 'overview') {
            initScreenTimeChart(defaults);
            initUsagePurposeChart(defaults);
        } else if (tab === 'platforms') {
            initPlatformsChart(defaults);
            initSatisfactionChart(defaults);
        } else if (tab === 'skills') {
            initSkillsRadarChart(defaults);
            initGrowthChart(defaults);
        } else if (tab === 'trends') {
            initCorrelationChart(defaults);
        }
    }

    function initScreenTimeChart(d) {
        const ctx = document.getElementById('screenTimeChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['< 2 hrs', '2–4 hrs', '4–6 hrs', '6–8 hrs', '> 8 hrs'],
                datasets: [{
                    label: 'Students (%)',
                    data: [8, 31, 38, 16, 7],
                    backgroundColor: [
                        'rgba(13,148,136,0.4)',
                        'rgba(13,148,136,0.6)',
                        'rgba(13,148,136,0.85)',
                        'rgba(8,145,178,0.65)',
                        'rgba(8,145,178,0.45)'
                    ],
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(15,15,26,0.9)',
                        titleColor: d.textColor,
                        bodyColor: d.textColor,
                        borderColor: 'rgba(255,255,255,0.08)',
                        borderWidth: 1,
                        callbacks: {
                            label: ctx => `${ctx.raw}% of students`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 50,
                        grid: { color: d.gridColor },
                        ticks: { color: d.textColor, font: { family: d.fontFamily, size: 11 }, callback: v => `${v}%` }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: d.textColor, font: { family: d.fontFamily, size: 11 } }
                    }
                }
            }
        });
    }

    function initUsagePurposeChart(d) {
        const ctx = document.getElementById('usagePurposeChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Education', 'Entertainment', 'Social Media', 'Gaming', 'Creative Work'],
                datasets: [{
                    data: [34, 28, 22, 10, 6],
                    backgroundColor: ['#0d9488', '#0891b2', '#06b6d4', '#22d3ee', '#67e8f9'],
                    borderWidth: 0,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: d.textColor,
                            font: { family: d.fontFamily, size: 11 },
                            padding: 16,
                            usePointStyle: true,
                            pointStyleWidth: 8
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15,15,26,0.9)',
                        titleColor: '#fff',
                        bodyColor: d.textColor,
                        callbacks: {
                            label: ctx => ` ${ctx.raw}% of daily screen time`
                        }
                    }
                }
            }
        });
    }

    function initPlatformsChart(d) {
        const ctx = document.getElementById('platformsChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['YouTube', 'Khan Academy', 'BYJU\'S', 'Coursera', 'Duolingo', 'GitHub', 'Udemy'],
                datasets: [{
                    label: 'Usage (%)',
                    data: [89, 62, 55, 38, 41, 29, 33],
                    backgroundColor: 'rgba(13,148,136,0.12)',
                    borderColor: 'rgba(13,148,136,0.85)',
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(15,15,26,0.9)',
                        titleColor: '#fff',
                        bodyColor: d.textColor,
                        callbacks: { label: c => `${c.raw}% of students use this` }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: d.gridColor },
                        ticks: { color: d.textColor, font: { family: d.fontFamily, size: 11 }, callback: v => `${v}%` }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { color: d.textColor, font: { family: d.fontFamily, size: 11 } }
                    }
                }
            }
        });
    }

    function initSatisfactionChart(d) {
        const ctx = document.getElementById('satisfactionChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Content Quality', 'Ease of Use', 'Engagement', 'Learning Outcome', 'Value for Time', 'Accessibility'],
                datasets: [
                    {
                        label: 'YouTube',
                        data: [8.2, 9.1, 8.8, 7.4, 8.6, 9.2],
                        borderColor: '#0d9488',
                        backgroundColor: 'rgba(13,148,136,0.1)',
                        pointBackgroundColor: '#0d9488',
                        borderWidth: 2
                    },
                    {
                        label: 'Khan Academy',
                        data: [9.1, 8.4, 8.2, 9.4, 9.0, 9.5],
                        borderColor: '#0891b2',
                        backgroundColor: 'rgba(8,145,178,0.08)',
                        pointBackgroundColor: '#0891b2',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: { color: d.textColor, font: { family: d.fontFamily, size: 11 }, usePointStyle: true }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15,15,26,0.9)',
                        titleColor: '#fff',
                        bodyColor: d.textColor
                    }
                },
                scales: {
                    r: {
                        beginAtZero: false,
                        min: 6,
                        max: 10,
                        grid: { color: d.gridColor },
                        pointLabels: { color: d.textColor, font: { family: d.fontFamily, size: 10 } },
                        ticks: { display: false }
                    }
                }
            }
        });
    }

    function initSkillsRadarChart(d) {
        const ctx = document.getElementById('skillsRadarChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Coding', 'Design', 'Critical Thinking', 'Communication', 'Research', 'Math', 'Languages', 'Creativity'],
                datasets: [{
                    label: 'Skill Development (%)',
                    data: [64, 71, 78, 68, 82, 59, 73, 80],
                    borderColor: '#0d9488',
                    backgroundColor: 'rgba(13,148,136,0.13)',
                    pointBackgroundColor: '#0d9488',
                    pointRadius: 4,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: { color: d.textColor, font: { family: d.fontFamily, size: 11 }, usePointStyle: true }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15,15,26,0.9)',
                        callbacks: { label: c => ` ${c.raw}% reported improvement` }
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: d.gridColor },
                        pointLabels: { color: d.textColor, font: { family: d.fontFamily, size: 10 } },
                        ticks: { display: false }
                    }
                }
            }
        });
    }

    function initGrowthChart(d) {
        const ctx = document.getElementById('growthChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                    {
                        label: 'Technical Skills',
                        data: [42, 51, 58, 63, 71, 79],
                        borderColor: '#0d9488',
                        backgroundColor: 'rgba(13,148,136,0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointBackgroundColor: '#0d9488'
                    },
                    {
                        label: 'Soft Skills',
                        data: [55, 59, 64, 68, 74, 82],
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245,158,11,0.07)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointBackgroundColor: '#f59e0b'
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: { color: d.textColor, font: { family: d.fontFamily, size: 11 }, usePointStyle: true }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15,15,26,0.9)',
                        titleColor: '#fff',
                        bodyColor: d.textColor,
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 30,
                        grid: { color: d.gridColor },
                        ticks: { color: d.textColor, font: { family: d.fontFamily, size: 11 }, callback: v => `${v}%` }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: d.textColor, font: { family: d.fontFamily, size: 11 } }
                    }
                }
            }
        });
    }

    function initCorrelationChart(d) {
        const ctx = document.getElementById('correlationChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['1 hr/day', '2 hrs/day', '3 hrs/day', '4 hrs/day', '5 hrs/day', '6 hrs/day', '7 hrs/day', '8+ hrs/day'],
                datasets: [
                    {
                        label: 'Educational Screen Time',
                        data: [62, 71, 79, 84, 85, 83, 76, 66],
                        borderColor: '#0d9488',
                        backgroundColor: 'rgba(13,148,136,0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5,
                        pointBackgroundColor: '#0d9488',
                        pointHoverRadius: 8
                    },
                    {
                        label: 'Unstructured Screen Time',
                        data: [58, 60, 59, 55, 49, 43, 37, 30],
                        borderColor: '#f87171',
                        backgroundColor: 'rgba(248,113,113,0.08)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5,
                        pointBackgroundColor: '#f87171',
                        pointHoverRadius: 8
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: { color: d.textColor, font: { family: d.fontFamily, size: 12 }, usePointStyle: true, padding: 20 }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15,15,26,0.95)',
                        titleColor: '#fff',
                        bodyColor: d.textColor,
                        mode: 'index',
                        intersect: false,
                        callbacks: { label: c => ` ${c.dataset.label}: ${c.raw} (Academic Score Index)` }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 20,
                        max: 100,
                        grid: { color: d.gridColor },
                        ticks: {
                            color: d.textColor,
                            font: { family: d.fontFamily, size: 11 },
                            callback: v => `${v}`
                        },
                        title: { display: true, text: 'Academic Performance Index', color: d.textColor, font: { size: 11 } }
                    },
                    x: {
                        grid: { color: d.gridColor },
                        ticks: { color: d.textColor, font: { family: d.fontFamily, size: 11 } }
                    }
                }
            }
        });
    }

    function initBreakdownChart() {
        if (state.chartsInitialized['breakdown']) return;
        state.chartsInitialized['breakdown'] = true;

        const ctx = document.getElementById('screenBreakdownChart');
        if (!ctx) return;

        const d = getChartDefaults();

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Education', 'Entertainment', 'Social', 'Gaming'],
                datasets: [{
                    data: [34, 28, 22, 16],
                    backgroundColor: ['#0d9488', '#0891b2', '#06b6d4', '#22d3ee'],
                    borderWidth: 0,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                cutout: '72%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(15,15,26,0.9)',
                        callbacks: { label: c => ` ${c.label}: ${c.raw}%` }
                    }
                }
            }
        });
    }

    function setupOutcomeBars() {
        const section = document.getElementById('data');
        if (!section) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    document.querySelectorAll('.outcome-fill').forEach((bar, i) => {
                        setTimeout(() => {
                            bar.style.width = bar.style.getPropertyValue('--w');
                        }, i * 100);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        observer.observe(section);
    }

    function setupSurvey() {
        const nextBtn = document.getElementById('nextBtn');
        const backBtn = document.getElementById('backBtn');

        if (!nextBtn) return;

        nextBtn.addEventListener('click', () => {
            if (state.currentStep < state.totalSteps) {
                goToStep(state.currentStep + 1);
            } else {
                submitSurvey();
            }
        });

        backBtn.addEventListener('click', () => {
            if (state.currentStep > 1) {
                goToStep(state.currentStep - 1);
            }
        });
    }

    function goToStep(step) {
        const current = document.getElementById(`step-${state.currentStep}`);
        const next = document.getElementById(`step-${step}`);
        const fill = document.getElementById('progressFill');
        const label = document.getElementById('progressLabel');
        const backBtn = document.getElementById('backBtn');
        const nextBtn = document.getElementById('nextBtn');

        current.classList.remove('active');
        next.classList.add('active');

        state.currentStep = step;

        const pct = (step / state.totalSteps) * 100;
        fill.style.width = `${pct}%`;
        label.textContent = `Step ${step} of ${state.totalSteps}`;

        backBtn.style.display = step > 1 ? 'block' : 'none';
        nextBtn.textContent = step === state.totalSteps ? 'Submit →' : 'Continue →';
    }

    function submitSurvey() {
        const form = document.getElementById('surveyForm');
        const success = document.getElementById('surveySuccess');

        if (form && success) {
            form.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => {
                form.style.display = 'none';
                success.style.display = 'flex';
                success.style.flexDirection = 'column';
                success.style.alignItems = 'center';
                success.style.animation = 'fadeSlideUp 0.5s ease';
            }, 300);
        }
    }

    function setupContactForm() {
        window.handleContact = function(e) {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            btn.textContent = 'Sending...';
            btn.disabled = true;

            setTimeout(() => {
                btn.textContent = '✓ Message Sent!';
                btn.style.background = 'linear-gradient(135deg, #34d399, #10b981)';
                e.target.reset();

                setTimeout(() => {
                    btn.textContent = 'Send Message';
                    btn.style.background = '';
                    btn.disabled = false;
                }, 3000);
            }, 1500);
        };
    }

    window.resetSurvey = function() {
        const form = document.getElementById('surveyForm');
        const success = document.getElementById('surveySuccess');

        state.currentStep = 1;

        if (form) {
            form.style.display = 'block';
            form.style.animation = '';

            document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
            const step1 = document.getElementById('step-1');
            if (step1) step1.classList.add('active');

            const fill = document.getElementById('progressFill');
            const label = document.getElementById('progressLabel');
            const backBtn = document.getElementById('backBtn');
            const nextBtn = document.getElementById('nextBtn');

            if (fill) fill.style.width = '20%';
            if (label) label.textContent = 'Step 1 of 5';
            if (backBtn) backBtn.style.display = 'none';
            if (nextBtn) nextBtn.textContent = 'Continue →';

            document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
        }

        if (success) success.style.display = 'none';
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return { state };
})();

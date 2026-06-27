const content_dir = 'contents/'
const config_file = 'config.yml'
const section_names = ['home', 'experience'];


// 立即创建背景和效果（不等待 DOMContentLoaded）
(function() {
    createMatrixRain();
    createClickEffect();
})();

window.addEventListener('DOMContentLoaded', event => {

    typeBootSequence();
    createCrosshair();
    initScrollReveal();   // 滚动渐入动画

    // Activate Bootstrap scrollspy
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

    // Yaml 配置加载
    fetch(content_dir + config_file)
        .then(response => response.text())
        .then(text => {
            const yml = jsyaml.load(text);
            Object.keys(yml).forEach(key => {
                try {
                    const el = document.getElementById(key);
                    if (el) el.innerHTML = yml[key];
                } catch {
                    console.log("Unknown id and value: " + key + "," + yml[key].toString())
                }
            });
        })
        .catch(error => console.log(error));

    // Markdown 内容加载
    marked.use({ mangle: false, headerIds: false });
    section_names.forEach((name) => {
        fetch(content_dir + name + '.md')
            .then(response => response.text())
            .then(markdown => {
                const html = marked.parse(markdown);
                const target = document.getElementById(name + '-md');
                if (target) target.innerHTML = html;
            }).then(() => {
                if (window.MathJax) MathJax.typeset();
                // 内容加载后给子元素加滚动渐入标记
                markRevealChildren();
                initScrollReveal();
            })
            .catch(error => console.log(error));
    });

});


// ============================================================
// 滚动渐入：给内容区子元素打标记 + IntersectionObserver 触发
// ============================================================
function markRevealChildren() {
    const targets = document.querySelectorAll('section .main-body');
    targets.forEach(section => {
        // 给段落/标题/技能容器/列表逐个加 reveal，带交错延迟
        const kids = section.querySelectorAll('p, h4, ul, .skills-container, code');
        kids.forEach((el, i) => {
            if (!el.classList.contains('reveal')) {
                el.classList.add('reveal');
                el.style.transitionDelay = (i * 0.08) + 's';
            }
        });
    });
}

function initScrollReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
        // 降级：直接显示
        els.forEach(el => el.classList.add('revealed'));
        return;
    }
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => io.observe(el));
}


// ============================================================
// 终端启动序列：打字机逐字输出
// ============================================================
function typeBootSequence() {
    const output = document.getElementById('terminal-output');
    if (!output) return;

    const cursor = '<span class="term-cursor">&#9608;</span>';

    const lines = [
        { text: 'peng.liu@hpc', cls: 'term-prompt' },
        { text: ':~$ ',          cls: 'term-prompt' },
        { text: 'whoami',        cls: 'term-cmd',    nl: true },
        { text: '> Software Engineer @ SmartLogic',  cls: 'term-output', nl: true },
        { text: 'peng.liu@hpc',  cls: 'term-prompt' },
        { text: ':~$ ',          cls: 'term-prompt' },
        { text: 'cat /etc/skills', cls: 'term-cmd',  nl: true },
        { text: 'C  C++  HPC  slurm  K8s  MPI  spack  make  gdb', cls: 'term-accent', nl: true },
        { text: 'peng.liu@hpc',  cls: 'term-prompt' },
        { text: ':~$ ',          cls: 'term-prompt' },
        { text: './profile --boot', cls: 'term-cmd', nl: true },
        { text: 'booting ',      cls: 'term-output' },
        { text: '[',             cls: 'term-output' },
        { text: '################', cls: 'term-bar-fill' },
        { text: '] 100%',        cls: 'term-output', nl: true },
        { text: 'peng.liu@hpc',  cls: 'term-prompt' },
        { text: ':~$ ',          cls: 'term-prompt' },
        { text: '_',             cls: 'term-cmd',    isCursor: true },
    ];

    output.innerHTML = '';
    let lineIdx = 0;
    let charIdx = 0;
    let currentLineSpan = null;
    let lineBuffer = '';

    function step() {
        if (currentLineSpan === null) {
            if (lineIdx >= lines.length) {
                output.innerHTML += cursor;
                return;
            }
            const line = lines[lineIdx];
            lineBuffer = '';
            currentLineSpan = document.createElement('span');
            currentLineSpan.className = line.cls;
            output.appendChild(currentLineSpan);
            charIdx = 0;
        }

        const line = lines[lineIdx];

        if (charIdx >= line.text.length) {
            if (line.nl) {
                output.appendChild(document.createElement('br'));
            }
            if (line.isCursor) {
                currentLineSpan.remove();
                output.innerHTML += cursor;
                lineIdx = lines.length;
                currentLineSpan = null;
                return;
            }
            currentLineSpan = null;
            lineIdx++;
            setTimeout(step, 120);
            return;
        }

        lineBuffer += line.text[charIdx];
        currentLineSpan.textContent = lineBuffer;
        charIdx++;

        const delay = line.cls === 'term-cmd' ? 55 : 22;
        setTimeout(step, delay);
    }

    setTimeout(step, 400);
}


// ============================================================
// Matrix 数字雨（二进制 0/1 + 数字符号）
// ============================================================
function createMatrixRain() {
    function initCanvas() {
        if (!document.body) {
            setTimeout(initCanvas, 10);
            return;
        }

        let canvas = document.getElementById('tech-city-canvas');
        if (canvas) canvas.remove();
        canvas = document.getElementById('matrix-canvas');
        if (canvas) canvas.remove();

        canvas = document.createElement('canvas');
        canvas.id = 'matrix-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '-2';
        canvas.style.pointerEvents = 'none';
        canvas.style.background = '#050807';
        document.body.insertBefore(canvas, document.body.firstChild);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Canvas context not available');
            return;
        }

        // 二进制 0/1 为主 + 少量数字与符号
        const chars = '0101010101010123456789{}[]<>/$#&%@'.split('');

        let fontSize = 16;
        let columns = 0;
        let drops = [];

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // 字体稍大、列稍稀疏，提升呼吸感与质感
            fontSize = window.innerWidth < 768 ? 15 : 18;
            columns = Math.floor(canvas.width / fontSize);
            drops = Array(columns).fill(0).map(() => Math.random() * -120);
        }
        resize();
        window.addEventListener('resize', resize);

        function draw() {
            // 拖尾：半透明覆盖
            ctx.fillStyle = 'rgba(5, 8, 7, 0.075)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.font = fontSize + "px 'JetBrains Mono', monospace";

            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                const x = i * fontSize;
                const y = drops[i] * fontSize;

                // 头部字符高亮（白绿），尾部暗绿
                if (Math.random() > 0.97) {
                    ctx.fillStyle = '#e6ffe6';
                    ctx.shadowColor = '#00ff41';
                    ctx.shadowBlur = 8;
                    ctx.fillText(text, x, y);
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = '#00ff41';
                } else {
                    ctx.fillStyle = '#00b82e';
                    ctx.fillText(text, x, y);
                }

                if (y > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
            requestAnimationFrame(draw);
        }

        draw();
    }

    initCanvas();
}


// ============================================================
// 鼠标十字准星（终端风）
// ============================================================
function createCrosshair() {
    const crosshair = document.createElement('div');
    crosshair.id = 'term-crosshair';
    document.body.appendChild(crosshair);

    document.addEventListener('mousemove', (e) => {
        crosshair.classList.add('active');
        crosshair.style.left = (e.clientX - 3) + 'px';
        crosshair.style.top = (e.clientY - 3) + 'px';
        crosshair.style.width = '6px';
        crosshair.style.height = '6px';
        crosshair.style.background = 'transparent';
        crosshair.style.border = '1px solid #00ff41';
        crosshair.style.boxShadow = '0 0 6px rgba(0,255,65,0.5)';
        crosshair.style.position = 'fixed';
    });

    document.addEventListener('mouseleave', () => {
        crosshair.classList.remove('active');
    });
}


// ============================================================
// 点击涟漪 + 粒子爆炸（终端绿色）
// ============================================================
function createClickEffect() {
    document.addEventListener('click', (e) => {
        const ripple = document.createElement('div');
        ripple.className = 'click-ripple';
        ripple.style.left = e.clientX + 'px';
        ripple.style.top = e.clientY + 'px';
        ripple.style.position = 'fixed';
        ripple.style.zIndex = '99999';
        document.body.appendChild(ripple);

        const particleCount = 10;
        const particles = [];

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'click-particle';
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = 40 + Math.random() * 30;
            const endX = e.clientX + Math.cos(angle) * distance;
            const endY = e.clientY + Math.sin(angle) * distance;

            particle.style.left = e.clientX + 'px';
            particle.style.top = e.clientY + 'px';
            particle.style.position = 'fixed';
            particle.style.zIndex = '99999';
            document.body.appendChild(particle);

            particles.push({
                element: particle,
                startX: e.clientX,
                startY: e.clientY,
                endX: endX,
                endY: endY,
                progress: 0
            });
        }

        function animateParticles() {
            particles.forEach((particle) => {
                if (particle.progress >= 1) {
                    particle.element.remove();
                    return;
                }
                particle.progress += 0.06;
                const easeOut = 1 - Math.pow(1 - particle.progress, 3);
                const x = particle.startX + (particle.endX - particle.startX) * easeOut;
                const y = particle.startY + (particle.endY - particle.startY) * easeOut;
                const scale = 1 - particle.progress;
                const opacity = 1 - particle.progress;

                particle.element.style.left = x + 'px';
                particle.element.style.top = y + 'px';
                particle.element.style.transform = `translate(-50%, -50%) scale(${scale})`;
                particle.element.style.opacity = opacity;
            });

            if (particles.some(p => p.progress < 1)) {
                requestAnimationFrame(animateParticles);
            }
        }

        animateParticles();

        setTimeout(() => {
            ripple.remove();
        }, 500);
    });
}

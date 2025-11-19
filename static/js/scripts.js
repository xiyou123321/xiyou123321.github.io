const content_dir = 'contents/'
const config_file = 'config.yml'
const section_names = ['home', 'experience'];


window.addEventListener('DOMContentLoaded', event => {

    // Activate Bootstrap scrollspy on the main nav element
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


    // Yaml
    fetch(content_dir + config_file)
        .then(response => response.text())
        .then(text => {
            const yml = jsyaml.load(text);
            Object.keys(yml).forEach(key => {
                try {
                    document.getElementById(key).innerHTML = yml[key];
                } catch {
                    console.log("Unknown id and value: " + key + "," + yml[key].toString())
                }

            })
        })
        .catch(error => console.log(error));


    // Marked
    marked.use({ mangle: false, headerIds: false })
    section_names.forEach((name, idx) => {
        fetch(content_dir + name + '.md')
            .then(response => response.text())
            .then(markdown => {
                const html = marked.parse(markdown);
                document.getElementById(name + '-md').innerHTML = html;
            }).then(() => {
                // MathJax
                MathJax.typeset();
            })
            .catch(error => console.log(error));
    })

    // 鼠标跟随效果
    createMouseFollower();
    
    // 创建动态科技城市背景
    createTechCityBackground();
    
    // 鼠标点击效果
    createClickEffect();

});

// 创建鼠标跟随效果（增强版 - 多个粒子）
function createMouseFollower() {
    // 创建主跟随元素
    const follower = document.createElement('div');
    follower.id = 'mouse-follower';
    document.body.appendChild(follower);

    // 创建多个跟随粒子
    const particles = [];
    const particleCount = 8;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'mouse-particle';
        particle.style.setProperty('--delay', i * 0.05);
        document.body.appendChild(particle);
        particles.push({
            element: particle,
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0
        });
    }

    let mouseX = 0;
    let mouseY = 0;
    let followerX = 0;
    let followerY = 0;
    let isMouseMoving = false;

    // 鼠标移动事件
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        isMouseMoving = true;
        follower.style.opacity = '1';
        
        // 更新所有粒子的目标位置
        particles.forEach((particle, index) => {
            const angle = (index / particleCount) * Math.PI * 2;
            const radius = 30 + index * 5;
            particle.targetX = mouseX + Math.cos(angle) * radius;
            particle.targetY = mouseY + Math.sin(angle) * radius;
            particle.element.style.opacity = '1';
        });
    });

    // 鼠标离开窗口
    document.addEventListener('mouseleave', () => {
        isMouseMoving = false;
        follower.style.opacity = '0';
        particles.forEach(particle => {
            particle.element.style.opacity = '0';
        });
    });

    // 平滑跟随动画
    function animateFollower() {
        // 主跟随元素
        const dx = mouseX - followerX;
        const dy = mouseY - followerY;
        followerX += dx * 0.1;
        followerY += dy * 0.1;
        follower.style.left = followerX + 'px';
        follower.style.top = followerY + 'px';

        // 粒子跟随
        particles.forEach((particle, index) => {
            const dx = particle.targetX - particle.x;
            const dy = particle.targetY - particle.y;
            particle.x += dx * (0.08 + index * 0.01);
            particle.y += dy * (0.08 + index * 0.01);
            particle.element.style.left = particle.x + 'px';
            particle.element.style.top = particle.y + 'px';
        });

        requestAnimationFrame(animateFollower);
    }

    // 开始动画
    animateFollower();

    // 鼠标悬停在可交互元素上时的效果
    const interactiveElements = document.querySelectorAll('a, button, .nav-link, input, textarea, select');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            follower.classList.add('hover');
            particles.forEach(p => p.element.classList.add('hover'));
        });
        element.addEventListener('mouseleave', () => {
            follower.classList.remove('hover');
            particles.forEach(p => p.element.classList.remove('hover'));
        });
    });
}

// 创建动态科技城市背景
function createTechCityBackground() {
    // 检查是否已存在 Canvas
    let canvas = document.getElementById('tech-city-canvas');
    if (canvas) {
        canvas.remove();
    }
    
    canvas = document.createElement('canvas');
    canvas.id = 'tech-city-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-2';
    canvas.style.pointerEvents = 'none';
    canvas.style.background = '#0a0e27';
    // 插入到 body 最前面，确保在最底层
    document.body.insertBefore(canvas, document.body.firstChild);

    const ctx = canvas.getContext('2d');
    let animationId;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 科技城市建筑
    const buildings = [];
    const buildingCount = 30;

    for (let i = 0; i < buildingCount; i++) {
        buildings.push({
            x: (i / buildingCount) * canvas.width + Math.random() * 50,
            width: 20 + Math.random() * 40,
            height: 100 + Math.random() * (canvas.height * 0.6),
            speed: 0.1 + Math.random() * 0.2,
            windows: Math.floor(3 + Math.random() * 8),
            color: `hsl(${200 + Math.random() * 60}, 70%, ${40 + Math.random() * 20}%)`
        });
    }

    // 粒子系统
    const particles = [];
    for (let i = 0; i < 50; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1,
            opacity: Math.random() * 0.5 + 0.2
        });
    }

    function draw() {
        ctx.fillStyle = '#0a0e27';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 绘制星空背景
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 200; i++) {
            const x = (i * 137.508) % canvas.width;
            const y = (i * 137.508) % canvas.height;
            const size = Math.sin(Date.now() * 0.001 + i) * 0.5 + 1;
            ctx.globalAlpha = Math.sin(Date.now() * 0.002 + i) * 0.3 + 0.5;
            ctx.fillRect(x, y, size, size);
        }
        ctx.globalAlpha = 1;

        // 绘制建筑
        buildings.forEach(building => {
            // 建筑主体
            const gradient = ctx.createLinearGradient(building.x, canvas.height, building.x, canvas.height - building.height);
            gradient.addColorStop(0, building.color);
            gradient.addColorStop(1, building.color + '80');
            ctx.fillStyle = gradient;
            ctx.fillRect(building.x, canvas.height - building.height, building.width, building.height);

            // 建筑轮廓光
            ctx.strokeStyle = building.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(building.x, canvas.height - building.height, building.width, building.height);

            // 窗户
            ctx.fillStyle = '#00d4ff';
            const windowRows = Math.floor(building.height / 30);
            const windowCols = Math.floor(building.width / 15);
            for (let row = 0; row < windowRows; row++) {
                for (let col = 0; col < windowCols; col++) {
                    if (Math.random() > 0.3) {
                        ctx.globalAlpha = Math.sin(Date.now() * 0.003 + row + col) * 0.3 + 0.7;
                        ctx.fillRect(
                            building.x + col * 12 + 3,
                            canvas.height - building.height + row * 25 + 5,
                            4,
                            8
                        );
                    }
                }
            }
            ctx.globalAlpha = 1;

            // 移动建筑（视差效果）
            building.x -= building.speed;
            if (building.x + building.width < 0) {
                building.x = canvas.width;
            }
        });

        // 绘制粒子
        particles.forEach(particle => {
            ctx.fillStyle = `rgba(0, 212, 255, ${particle.opacity})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();

            particle.x += particle.vx;
            particle.y += particle.vy;

            if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        });

        animationId = requestAnimationFrame(draw);
    }

    draw();
}

// 创建鼠标点击效果
function createClickEffect() {
    document.addEventListener('click', (e) => {
        // 创建涟漪效果
        const ripple = document.createElement('div');
        ripple.className = 'click-ripple';
        ripple.style.left = e.clientX + 'px';
        ripple.style.top = e.clientY + 'px';
        document.body.appendChild(ripple);

        // 创建粒子爆炸效果
        const particleCount = 12;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'click-particle';
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = 50 + Math.random() * 30;
            const endX = e.clientX + Math.cos(angle) * distance;
            const endY = e.clientY + Math.sin(angle) * distance;
            
            particle.style.left = e.clientX + 'px';
            particle.style.top = e.clientY + 'px';
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

        // 动画粒子
        function animateParticles() {
            particles.forEach((particle, index) => {
                if (particle.progress >= 1) {
                    particle.element.remove();
                    return;
                }
                
                particle.progress += 0.05;
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
        }, 600);
    });
}

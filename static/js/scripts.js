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

});

// 创建鼠标跟随效果
function createMouseFollower() {
    // 创建跟随元素
    const follower = document.createElement('div');
    follower.id = 'mouse-follower';
    document.body.appendChild(follower);

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
    });

    // 鼠标离开窗口
    document.addEventListener('mouseleave', () => {
        isMouseMoving = false;
        follower.style.opacity = '0';
    });

    // 平滑跟随动画
    function animateFollower() {
        // 计算距离
        const dx = mouseX - followerX;
        const dy = mouseY - followerY;

        // 使用缓动函数实现平滑跟随
        followerX += dx * 0.1;
        followerY += dy * 0.1;

        // 更新位置
        follower.style.left = followerX + 'px';
        follower.style.top = followerY + 'px';

        requestAnimationFrame(animateFollower);
    }

    // 开始动画
    animateFollower();

    // 鼠标悬停在可交互元素上时的效果
    const interactiveElements = document.querySelectorAll('a, button, .nav-link, input, textarea, select');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            follower.classList.add('hover');
        });
        element.addEventListener('mouseleave', () => {
            follower.classList.remove('hover');
        });
    });
}

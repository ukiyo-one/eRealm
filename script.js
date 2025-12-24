// 基础变量
let scene, camera, renderer;
let currentScene = 0;
let scenes = [];
let mouse = { x: 0, y: 0 };
let isMouseDown = false;
let cameraTarget = new THREE.Vector3(0, 1.6, 0);
let cameraPosition = new THREE.Vector3(0, 1.6, 5);

// UI相关变量
let isMenuExpanded = true; // 菜单栏是否展开
let isLightVisible = true; // 鼠标光效是否可见
let lightSize = 100; // 鼠标光效大小
let hasUserInteracted = false; // 用户是否已经交互

// DOM元素
let mouseLight, mainMenu, sceneMenu, menuToggle, menuContent, returnBtn, toggleLightBtn, lightSizeSlider;

// 初始化函数
function init() {
    // 获取DOM元素
    mouseLight = document.getElementById('mouse-light');
    mainMenu = document.getElementById('main-menu');
    sceneMenu = document.getElementById('scene-menu');
    menuToggle = document.getElementById('menu-toggle');
    menuContent = document.getElementById('menu-content');
    returnBtn = document.getElementById('return-btn');
    toggleLightBtn = document.getElementById('toggle-light-btn');
    lightSizeSlider = document.getElementById('light-size-slider');

    // 创建场景
    scene = new THREE.Scene();

    // 创建相机
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 5);
    camera.lookAt(0, 1.6, 0);

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0a0a0a, 1);
    renderer.shadowMap.enabled = true;
    document.getElementById('container').appendChild(renderer.domElement);

    // 添加事件监听
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchstart', onTouchStart);
    document.addEventListener('touchend', onTouchEnd);

    // 添加菜单事件监听
    menuToggle.addEventListener('click', toggleMenu);
    returnBtn.addEventListener('click', returnToMainMenu);
    toggleLightBtn.addEventListener('click', toggleLight);
    lightSizeSlider.addEventListener('input', adjustLightSize);

    // 添加场景按钮事件
    document.querySelectorAll('.scene-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            startScene(parseInt(e.target.dataset.scene));
        });
    });

    // 创建三个场景
    createScene0(); // 后室走廊
    createScene1(); // 泳池空间
    createScene2(); // 诡异教室

    // 初始化光效大小
    adjustLightSize();

    // 开始动画循环
    animate();

    // 初始化音效
    initAudio();

    // 首次进入时展开菜单
    setTimeout(() => {
        expandMenu();
    }, 500);
}

// 进入场景
function startScene(sceneIndex) {
    // 隐藏主菜单
    mainMenu.classList.add('hidden');

    // 显示场景菜单
    sceneMenu.classList.add('visible');

    // 切换到指定场景
    switchScene(sceneIndex);

    // 重置用户交互状态
    hasUserInteracted = false;

    // 播放场景切换音效
    playSound('switch');
}

// 返回主菜单
function returnToMainMenu() {
    // 隐藏场景菜单
    sceneMenu.classList.remove('visible');
    menuContent.classList.remove('expanded');
    isMenuExpanded = false;

    // 显示主菜单
    mainMenu.classList.remove('hidden');

    // 重置相机位置
    camera.position.set(0, 1.6, 5);
    cameraTarget = new THREE.Vector3(0, 1.6, 0);

    // 播放音效
    playSound('click');
}

// 场景切换
function switchScene(sceneIndex) {
    if (sceneIndex === currentScene) return;

    // 隐藏当前场景
    scenes[currentScene].visible = false;

    // 显示新场景
    scenes[sceneIndex].visible = true;
    currentScene = sceneIndex;

    // 更新按钮状态
    document.querySelectorAll('.scene-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === sceneIndex);
    });
}

// 切换菜单栏
function toggleMenu() {
    isMenuExpanded = !isMenuExpanded;
    if (isMenuExpanded) {
        expandMenu();
    } else {
        collapseMenu();
    }
    playSound('click');
}

// 展开菜单
function expandMenu() {
    menuContent.classList.add('expanded');
    isMenuExpanded = true;
}

// 折叠菜单
function collapseMenu() {
    menuContent.classList.remove('expanded');
    isMenuExpanded = false;
}

// 切换鼠标光效
function toggleLight() {
    isLightVisible = !isLightVisible;
    if (isLightVisible) {
        mouseLight.classList.remove('hidden');
        toggleLightBtn.textContent = '隐藏鼠标光效';
    } else {
        mouseLight.classList.add('hidden');
        toggleLightBtn.textContent = '显示鼠标光效';
    }
    playSound('click');
}

// 调整鼠标光效大小
function adjustLightSize() {
    lightSize = parseInt(lightSizeSlider.value);
    mouseLight.style.width = lightSize + 'px';
    mouseLight.style.height = lightSize + 'px';
}

// 场景0：后室走廊
function createScene0() {
    const scene0 = new THREE.Group();

    // 墙壁材质
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x999999 });
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x777777 });
    const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });

    // 地板
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 100),
        floorMaterial
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene0.add(floor);

    // 天花板
    const ceiling = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 100),
        ceilingMaterial
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 3;
    ceiling.receiveShadow = true;
    scene0.add(ceiling);

    // 左侧墙壁
    const leftWall = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 3),
        wallMaterial
    );
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.x = -10;
    leftWall.position.y = 1.5;
    leftWall.receiveShadow = true;
    scene0.add(leftWall);

    // 右侧墙壁
    const rightWall = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 3),
        wallMaterial
    );
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.x = 10;
    rightWall.position.y = 1.5;
    rightWall.receiveShadow = true;
    scene0.add(rightWall);

    // 添加走廊门
    for (let i = 0; i < 10; i++) {
        const door = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 2.5, 0.1),
            new THREE.MeshStandardMaterial({ color: 0x555555 })
        );
        door.position.z = -i * 10;
        door.position.x = Math.random() > 0.5 ? -8 : 8;
        door.position.y = 1.25;
        door.castShadow = true;
        scene0.add(door);

        // 门把手
        const handle = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0xaaaaaa })
        );
        handle.position.set(door.position.x + (door.position.x > 0 ? -0.5 : 0.5), 1.25, door.position.z - 0.05);
        scene0.add(handle);
    }

    // 添加光源
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene0.add(ambientLight);

    for (let i = 0; i < 20; i++) {
        const light = new THREE.PointLight(0xccccff, 1, 10);
        light.position.set(0, 2.8, -i * 5);
        scene0.add(light);

        // 灯光闪烁效果
        light.intensity = 0.8 + Math.random() * 0.4;
        setInterval(() => {
            light.intensity = 0.6 + Math.random() * 0.6;
        }, 500 + Math.random() * 1000);
    }

    // 添加隐藏元素
    const hidden1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xffaaaa, emissive: 0xff5555 })
    );
    hidden1.position.set(5, 0.5, -15);
    scene0.add(hidden1);

    scene0.visible = false;
    scenes.push(scene0);
    scene.add(scene0);
}

// 场景1：泳池空间
function createScene1() {
    const scene1 = new THREE.Group();

    // 泳池水材质
    const waterMaterial = new THREE.MeshStandardMaterial({
        color: 0x4488ff,
        transparent: true,
        opacity: 0.8,
        metalness: 0.3,
        roughness: 0.1
    });

    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

    // 地板
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 30),
        floorMaterial
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene1.add(floor);

    // 泳池
    const pool = new THREE.Mesh(
        new THREE.BoxGeometry(15, 2, 15),
        waterMaterial
    );
    pool.position.y = -1;
    pool.castShadow = true;
    scene1.add(pool);

    // 泳池边缘
    const poolEdge = new THREE.Mesh(
        new THREE.BoxGeometry(16, 0.5, 16),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    scene1.add(poolEdge);

    // 泳池梯子
    for (let i = 0; i < 3; i++) {
        const step = new THREE.Mesh(
            new THREE.BoxGeometry(1, 0.1, 2),
            new THREE.MeshStandardMaterial({ color: 0x888888 })
        );
        step.position.set(6, -0.9 + i * 0.3, 0);
        scene1.add(step);
    }

    // 添加超现实元素 - 悬浮椅子
    for (let i = 0; i < 5; i++) {
        const chair = new THREE.Mesh(
            new THREE.BoxGeometry(1, 0.8, 0.5),
            new THREE.MeshStandardMaterial({ color: 0xff8888 })
        );
        chair.position.set(
            -10 + Math.random() * 20,
            Math.random() * 3,
            -10 + Math.random() * 20
        );
        chair.rotation.y = Math.random() * Math.PI * 2;
        scene1.add(chair);
    }

    // 添加光源
    const ambientLight = new THREE.AmbientLight(0x606060, 0.6);
    scene1.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene1.add(directionalLight);

    // 添加隐藏元素
    const hidden1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xffff88, emissive: 0xffff00 })
    );
    hidden1.position.set(0, -0.5, 5);
    scene1.add(hidden1);

    scene1.visible = false;
    scenes.push(scene1);
    scene.add(scene1);
}

// 场景2：诡异教室
function createScene2() {
    const scene2 = new THREE.Group();

    // 材质
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xccaa99 });
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x886644 });
    const deskMaterial = new THREE.MeshStandardMaterial({ color: 0x664422 });
    const chairMaterial = new THREE.MeshStandardMaterial({ color: 0x443322 });

    // 地板
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(25, 25),
        floorMaterial
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene2.add(floor);

    // 墙壁
    const backWall = new THREE.Mesh(
        new THREE.PlaneGeometry(25, 4),
        wallMaterial
    );
    backWall.position.z = -12.5;
    backWall.position.y = 2;
    scene2.add(backWall);

    const leftWall = new THREE.Mesh(
        new THREE.PlaneGeometry(25, 4),
        wallMaterial
    );
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.x = -12.5;
    leftWall.position.y = 2;
    scene2.add(leftWall);

    const rightWall = new THREE.Mesh(
        new THREE.PlaneGeometry(25, 4),
        wallMaterial
    );
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.x = 12.5;
    rightWall.position.y = 2;
    scene2.add(rightWall);

    // 黑板
    const blackboard = new THREE.Mesh(
        new THREE.PlaneGeometry(8, 4),
        new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    blackboard.position.set(0, 2.5, -12.4);
    scene2.add(blackboard);

    // 添加桌椅
    for (let i = 0; i < 15; i++) {
        const desk = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.7, 0.8),
            deskMaterial
        );
        desk.position.set(
            -10 + (i % 5) * 5,
            0.35,
            -8 + Math.floor(i / 5) * 4
        );
        scene2.add(desk);

        const chair = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.6, 0.6),
            chairMaterial
        );
        chair.position.set(
            -10 + (i % 5) * 5,
            0.3,
            -8 + Math.floor(i / 5) * 4 + 1
        );
        scene2.add(chair);
    }

    // 添加光源
    const ambientLight = new THREE.AmbientLight(0x406080, 0.5);
    scene2.add(ambientLight);

    // 主荧光灯 - 调整为蓝绿色调
    const fluorescentLight = new THREE.RectAreaLight(0x88ffff, 6, 4, 1);
    fluorescentLight.position.set(0, 3.8, 0);
    scene2.add(fluorescentLight);

    // 添加额外的矩形区域光，形成矩阵排列
    const fluorescentLight1 = new THREE.RectAreaLight(0x66ffff, 5, 4, 1);
    fluorescentLight1.position.set(-6, 3.8, 0);
    scene2.add(fluorescentLight1);

    const fluorescentLight2 = new THREE.RectAreaLight(0x99ffff, 5, 4, 1);
    fluorescentLight2.position.set(6, 3.8, 0);
    scene2.add(fluorescentLight2);

    // 在教室角落添加柔和的蓝绿色点光源
    const cornerLight1 = new THREE.PointLight(0x44aaaa, 0.5, 15);
    cornerLight1.position.set(-10, 2, -10);
    scene2.add(cornerLight1);

    const cornerLight2 = new THREE.PointLight(0x44aaaa, 0.5, 15);
    cornerLight2.position.set(10, 2, -10);
    scene2.add(cornerLight2);

    const cornerLight3 = new THREE.PointLight(0x44aaaa, 0.5, 15);
    cornerLight3.position.set(-10, 2, 10);
    scene2.add(cornerLight3);

    const cornerLight4 = new THREE.PointLight(0x44aaaa, 0.5, 15);
    cornerLight4.position.set(10, 2, 10);
    scene2.add(cornerLight4);

    // 灯光闪烁 - 为所有光源添加协调的闪烁效果
    const allLights = [fluorescentLight, fluorescentLight1, fluorescentLight2];
    setInterval(() => {
        allLights.forEach(light => {
            light.intensity = 4 + Math.random() * 4;
        });
    }, 200 + Math.random() * 800);

    // 添加隐藏元素
    const hidden1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xff88ff, emissive: 0xff00ff })
    );
    hidden1.position.set(-5, 1, -10);
    scene2.add(hidden1);

    scene2.visible = false;
    scenes.push(scene2);
    scene.add(scene2);
}

// 音频初始化
function initAudio() {
    // 简单的音频管理
    window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    window.sounds = {};
}

// 播放音效
function playSound(type) {
    if (!window.audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // 不同场景的音效
    if (type === 'switch') {
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.type = 'sine';
    } else if (type === 'click') {
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.type = 'square';
    }

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// 更新鼠标光效位置
function updateMouseLight(event) {
    const x = event.clientX;
    const y = event.clientY;
    mouseLight.style.left = x + 'px';
    mouseLight.style.top = y + 'px';

    // 标记用户已交互
    if (!hasUserInteracted) {
        hasUserInteracted = true;
        // 用户交互后折叠菜单
        setTimeout(() => {
            if (isMenuExpanded) {
                collapseMenu();
            }
        }, 1000);
    }
}

// 事件监听
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // 更新鼠标光效位置
    updateMouseLight(event);
}

function onMouseDown() {
    isMouseDown = true;
    playSound('click');
}

function onMouseUp() {
    isMouseDown = false;
}

function onTouchMove(event) {
    if (event.touches.length === 1) {
        event.preventDefault();
        mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;

        // 更新鼠标光效位置
        updateMouseLight(event.touches[0]);
    }
}

function onTouchStart(event) {
    if (event.touches.length === 1) {
        event.preventDefault();
        isMouseDown = true;
        playSound('click');

        // 更新鼠标光效位置
        updateMouseLight(event.touches[0]);
    }
}

function onTouchEnd(event) {
    isMouseDown = false;
}

// 动画循环
function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    // 相机控制
    const targetX = mouse.x * 5;
    const targetY = mouse.y * 2 + 1.6;

    cameraTarget.x += (targetX - cameraTarget.x) * 0.05;
    cameraTarget.y += (targetY - cameraTarget.y) * 0.05;

    camera.lookAt(cameraTarget);

    // 场景0：后室走廊动画效果
    if (currentScene === 0) {
        scenes[0].children.forEach((child, index) => {
            // 灯光闪烁
            if (child.type === 'PointLight') {
                child.intensity = 0.6 + Math.sin(time + index) * 0.4;
            }
            // 墙壁微妙移动
            if (child.geometry && child.geometry.type === 'PlaneGeometry' && child.position.y < 3) {
                child.position.x += Math.sin(time * 0.5 + index) * 0.001;
            }
        });
    }

    // 场景1：泳池空间动画效果
    if (currentScene === 1) {
        scenes[1].children.forEach((child, index) => {
            // 泳池水波纹效果
            if (child.material && child.material.color.r === 0.2667) {
                child.rotation.y += 0.001;
                child.position.y = -1 + Math.sin(time + index) * 0.1;
                child.material.opacity = 0.7 + Math.sin(time * 2) * 0.1;
            }
            // 悬浮椅子浮动
            if (child.geometry && child.geometry.type === 'BoxGeometry' && child.material.color.r === 0.9961) {
                child.position.y += Math.sin(time + index) * 0.005;
                child.rotation.z += Math.sin(time * 0.5 + index) * 0.002;
            }
        });
    }

    // 场景2：诡异教室动画效果
    if (currentScene === 2) {
        scenes[2].children.forEach((child, index) => {
            // 黑板微妙闪烁
            if (child.material && child.material.color.r === 0.1333) {
                child.material.emissive.r = Math.sin(time * 3) * 0.1;
            }
            // 桌椅微妙移动
            if (child.geometry && (child.geometry.type === 'BoxGeometry' || child.geometry.type === 'PlaneGeometry')) {
                if (child.position.y < 2) {
                    child.position.x += Math.sin(time * 0.3 + index) * 0.001;
                    child.position.z += Math.sin(time * 0.4 + index) * 0.001;
                }
            }
        });
    }

    renderer.render(scene, camera);
}

// 初始化应用
window.addEventListener('DOMContentLoaded', init);
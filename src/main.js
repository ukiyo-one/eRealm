// 主入口文件
// 导入Three.js库
// 注：Three.js通过CDN引入，无需额外导入

// 导入事件总线
// import EventBus from './utils/eventBus.js';

// 导入管理器
// import BackgroundEffectManager from './managers/backgroundEffectManager.js';
// import SceneManager from './managers/sceneManager.js';
// import UIManager from './managers/uiManager.js';

// 导入场景
// import CorridorScene from './scenes/corridorScene.js';
// import SeaScene from './scenes/seaScene.js';
// import FlowerGalleryScene from './scenes/flowerGalleryScene.js';
// import StairsScene from './scenes/stairsScene.js';

// 全局变量
let scene, camera, renderer;
let currentScene = 0;
let scenes = [];
let sceneManager;
let uiManager;
let mouse = { x: 0, y: 0, prevX: 0, prevY: 0 };
let isMouseDown = false;
let cameraTarget = new THREE.Vector3(0, 1.6, 0);
let cameraPosition = new THREE.Vector3(0, 1.6, 5);
let keys = {};
let moveSpeed = 0.05;
let moveSpeedTarget = 0.05;
let acceleration = 0.01;

// 相机旋转角度
let yaw = 0; // 水平旋转角度（绕Y轴）
let pitch = 0; // 垂直旋转角度（绕X轴）
let mouseSensitivity = 0.002; // 鼠标灵敏度
let maxPitch = Math.PI / 2 - 0.1; // 最大垂直旋转角度
let minPitch = -Math.PI / 2 + 0.1; // 最小垂直旋转角度

// 初始化函数
function init() {
    // 初始化背景效果
    const backgroundEffectManager = new BackgroundEffectManager();

    // 创建场景
    scene = new THREE.Scene();

    // 创建相机
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 5);
    camera.lookAt(0, 1.6, 0);

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1); // 改为纯黑色背景
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

    // 键盘事件监听
    document.addEventListener('keydown', (e) => {
        keys[e.code] = true;
    });

    document.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });

    // 初始化管理器
    sceneManager = new SceneManager(scene, camera);
    uiManager = new UIManager();

    // 初始化场景
    sceneManager.initScenes();

    // 发布场景配置信息
    eventBus.emit('scenes:configs', {
        configs: sceneManager.getSceneConfigs()
    });

    // 初始状态：显示菜单，隐藏游戏场景
    uiManager.showMenu();

    // 开始动画循环
    animate();

    // 初始化音效
    initAudio();
}

// 事件处理函数
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    mouse.prevX = mouse.x;
    mouse.prevY = mouse.y;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // 计算鼠标移动距离
    const deltaX = event.clientX - (mouse.prevX + 1) * window.innerWidth / 2;
    const deltaY = (mouse.prevY + 1) * window.innerHeight / 2 - event.clientY;

    // 更新旋转角度
    yaw += deltaX * mouseSensitivity;
    pitch += deltaY * mouseSensitivity;

    // 限制垂直旋转角度
    pitch = Math.max(minPitch, Math.min(maxPitch, pitch));
}

function onMouseDown() {
    isMouseDown = true;
    eventBus.emit('audio:play', { type: 'click' });
}

function onMouseUp() {
    isMouseDown = false;
}

function onTouchMove(event) {
    if (event.touches.length === 1) {
        event.preventDefault();

        const currentX = event.touches[0].clientX;
        const currentY = event.touches[0].clientY;

        const prevX = (mouse.prevX + 1) * window.innerWidth / 2;
        const prevY = (mouse.prevY + 1) * window.innerHeight / 2;

        // 计算触摸移动距离
        const deltaX = currentX - prevX;
        const deltaY = prevY - currentY;

        // 更新旋转角度
        yaw += deltaX * mouseSensitivity;
        pitch += deltaY * mouseSensitivity;

        // 限制垂直旋转角度
        pitch = Math.max(minPitch, Math.min(maxPitch, pitch));

        mouse.prevX = mouse.x;
        mouse.prevY = mouse.y;
        mouse.x = (currentX / window.innerWidth) * 2 - 1;
        mouse.y = -(currentY / window.innerHeight) * 2 + 1;
    }
}

function onTouchStart(event) {
    if (event.touches.length === 1) {
        isMouseDown = true;
        eventBus.emit('audio:play', { type: 'click' });
    }
}

function onTouchEnd(event) {
    isMouseDown = false;
}

// 动画循环
function animate() {
    requestAnimationFrame(animate);

    // 更新相机位置（平滑移动）
    if (sceneManager && sceneManager.cameraResetTarget) {
        camera.position.lerp(sceneManager.cameraResetTarget.position, 0.05);
        cameraTarget.lerp(sceneManager.cameraResetTarget.target, 0.05);

        // 检查是否接近目标位置
        if (camera.position.distanceTo(sceneManager.cameraResetTarget.position) < 0.1) {
            camera.position.copy(sceneManager.cameraResetTarget.position);
            cameraTarget.copy(sceneManager.cameraResetTarget.target);
            delete sceneManager.cameraResetTarget;
        }
    } else {
        // 平滑移动速度
        moveSpeed += (moveSpeedTarget - moveSpeed) * acceleration;

        // 根据旋转角度计算相机朝向
        const forward = new THREE.Vector3(
            -Math.sin(yaw) * Math.cos(pitch),
            -Math.sin(pitch),
            -Math.cos(yaw) * Math.cos(pitch)
        ).normalize();

        const right = new THREE.Vector3(
            Math.cos(yaw),
            0,
            -Math.sin(yaw)
        ).normalize();

        const up = new THREE.Vector3(
            Math.sin(yaw) * Math.sin(pitch),
            Math.cos(pitch),
            Math.cos(yaw) * Math.sin(pitch)
        ).normalize();

        // 键盘控制相机移动
        const moveDirection = new THREE.Vector3(0, 0, 0);

        if (keys['KeyW'] || keys['ArrowUp']) {
            // 前进
            moveDirection.add(forward);
        }
        if (keys['KeyS'] || keys['ArrowDown']) {
            // 后退
            moveDirection.sub(forward);
        }
        if (keys['KeyA'] || keys['ArrowLeft']) {
            // 向左平移
            moveDirection.sub(right);
        }
        if (keys['KeyD'] || keys['ArrowRight']) {
            // 向右平移
            moveDirection.add(right);
        }

        // 归一化移动方向
        if (moveDirection.length() > 0) {
            moveDirection.normalize();
        }

        // 应用移动
        camera.position.add(moveDirection.multiplyScalar(moveSpeed));

        // 更新相机目标位置
        cameraTarget.copy(camera.position).add(forward.multiplyScalar(5));

        // 动态生成场景内容
        if (sceneManager) {
            sceneManager.updateScene(camera.position);
        }
    }

    camera.lookAt(cameraTarget);

    // 渲染场景
    renderer.render(scene, camera);
}

// 音效初始化
function initAudio() {
    // 音效系统初始化（如果需要）
    // 目前仅通过事件总线触发，实际音频播放逻辑可以在这里扩展
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);

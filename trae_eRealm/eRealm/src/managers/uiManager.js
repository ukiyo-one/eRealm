// UI管理器类
class UIManager {
    constructor() {
        this.menuButtons = document.querySelectorAll('.menu-btn');
        this.backButton = document.getElementById('back-to-menu');
        this.sceneConfigs = [];

        // 菜单滚动相关
        this.scrollContainer = null;
        this.scrollContent = null;
        this.scrollBar = null;
        this.scrollIndicator = null;
        this.scrollOffset = 0;
        this.maxScrollOffset = 0;
        this.scrollSpeed = 20;
        this.touchStartY = 0;
        this.touchStartScrollOffset = 0;
        this.isDragging = false;

        // 侧边菜单相关
        this.menuToggle = null;
        this.sideMenu = null;
        this.sideMenuOpen = false;
        this.returnBtn = null;
        this.toggleMouseEffect = null;
        this.mouseEffectSize = null;

        // 初始状态：显示菜单，隐藏游戏UI
        this.container = document.getElementById('container');
        this.menu = document.getElementById('menu');
        this.ui = document.getElementById('ui');

        // 初始化UI和菜单事件
        this.initEvents();

        // 订阅场景切换完成事件
        eventBus.on('scene:switched', (data) => {
            this.updateUIAfterSceneSwitch(data);
        });

        // 订阅场景配置更新事件
        eventBus.on('scenes:configs', (data) => {
            this.sceneConfigs = data.configs;
        });

        // 初始化菜单滚动
        this.initMenuScroll();
    }

    // 初始化菜单滚动
    initMenuScroll() {
        // 获取滚动相关元素
        this.scrollContainer = document.querySelector('.menu-scroll-container');
        this.scrollContent = document.querySelector('.menu-scroll-content');
        this.scrollBar = document.querySelector('.scroll-bar');
        this.scrollIndicator = document.querySelector('.scroll-indicator');

        // 延迟初始化，确保DOM已加载完成
        setTimeout(() => {
            // 计算最大滚动偏移量
            this.calculateMaxScrollOffset();
        }, 100);
    }

    // 计算最大滚动偏移量
    calculateMaxScrollOffset() {
        if (this.scrollContainer && this.scrollContent) {
            const containerHeight = this.scrollContainer.clientHeight;
            const contentHeight = this.scrollContent.scrollHeight;
            this.maxScrollOffset = Math.max(0, contentHeight - containerHeight);

            // 更新滚动指示器
            this.updateScrollIndicator();
        }
    }

    // 初始化UI事件
    initEvents() {
        // 菜单按钮事件
        this.menuButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sceneType = e.target.dataset.scene;
                this.handleMenuSelect(sceneType);
            });
        });

        // 返回菜单按钮事件
        if (this.backButton) {
            this.backButton.addEventListener('click', () => {
                this.showMenu();
            });
        }

        // 鼠标滚轮事件
        document.addEventListener('wheel', (e) => {
            // 只有菜单激活时才响应滚轮事件
            if (this.menu.classList.contains('menu-active')) {
                e.preventDefault();
                this.scrollMenu(e.deltaY);
            }
        }, { passive: false });

        // 触摸事件
        document.addEventListener('touchstart', (e) => {
            if (this.menu.classList.contains('menu-active')) {
                this.touchStartY = e.touches[0].clientY;
                this.touchStartScrollOffset = this.scrollOffset;
                this.isDragging = true;
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (this.isDragging && this.menu.classList.contains('menu-active')) {
                e.preventDefault();
                const deltaY = e.touches[0].clientY - this.touchStartY;
                this.scrollMenu(-deltaY);
            }
        }, { passive: false });

        document.addEventListener('touchend', () => {
            this.isDragging = false;
        });

        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (this.menu.classList.contains('menu-active')) {
                switch (e.key) {
                    case 'ArrowUp':
                        e.preventDefault();
                        this.scrollMenu(-this.scrollSpeed);
                        break;
                    case 'ArrowDown':
                        e.preventDefault();
                        this.scrollMenu(this.scrollSpeed);
                        break;
                }
            }
            // ESC键返回菜单
            if (e.key === 'Escape') {
                if (!this.menu.classList.contains('menu-active')) {
                    this.showMenu();
                }
            }
        });

        // 窗口大小变化事件
        window.addEventListener('resize', () => {
            this.calculateMaxScrollOffset();
        });
    }

    // 初始化游戏内UI事件
    initGameUIEvents() {
        // 获取侧边菜单相关元素
        this.menuToggle = document.getElementById('menu-toggle');
        this.sideMenu = document.getElementById('side-menu');
        this.returnBtn = document.getElementById('return-btn');
        this.toggleMouseEffect = document.getElementById('toggle-mouse-effect');
        this.mouseEffectSize = document.getElementById('mouse-effect-size');

        // 菜单切换按钮事件
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', () => {
                this.toggleSideMenu();
            });
        }

        // 返回按钮事件
        if (this.returnBtn) {
            this.returnBtn.addEventListener('click', () => {
                this.showMenu();
            });
        }

        // 鼠标效果开关事件
        if (this.toggleMouseEffect) {
            this.toggleMouseEffect.addEventListener('change', (e) => {
                eventBus.emit('mouse:effect:toggle', { enabled: e.target.checked });
            });
        }

        // 鼠标效果大小调节事件
        if (this.mouseEffectSize) {
            this.mouseEffectSize.addEventListener('input', (e) => {
                const size = parseInt(e.target.value);
                eventBus.emit('mouse:effect:size', { size: size });
                document.documentElement.style.setProperty('--mouse-radius', `${size}px`);
            });
        }
    }

    // 滚动菜单
    scrollMenu(deltaY) {
        // 更新滚动偏移量
        this.scrollOffset += deltaY;

        // 应用边界限制
        this.scrollOffset = Math.max(0, Math.min(this.scrollOffset, this.maxScrollOffset));

        // 更新滚动位置
        this.updateScrollPosition();

        // 更新滚动指示器
        this.updateScrollIndicator();
    }

    // 更新滚动位置
    updateScrollPosition() {
        if (this.scrollContent) {
            this.scrollContent.style.transform = `translateY(${-this.scrollOffset}px)`;
        }
    }

    // 更新滚动指示器
    updateScrollIndicator() {
        if (this.scrollBar && this.maxScrollOffset > 0) {
            const scrollPercentage = this.scrollOffset / this.maxScrollOffset;
            const containerHeight = this.scrollIndicator.clientHeight;
            const barHeight = this.scrollBar.clientHeight;
            const maxBarOffset = containerHeight - barHeight;
            const barOffset = scrollPercentage * maxBarOffset;

            this.scrollBar.style.transform = `translateY(${barOffset}px)`;
        }
    }

    // 处理菜单选择
    handleMenuSelect(sceneType) {
        // 隐藏菜单，显示游戏场景
        this.hideMenu();

        // 发布菜单选择事件
        eventBus.emit('menu:select', { sceneType: sceneType });
    }

    // 更新场景切换后的UI
    updateUIAfterSceneSwitch(data) {
        // 更新场景信息
        this.updateSceneInfo(data);

        // 显示游戏UI
        this.showGameUI();
    }

    // 更新场景信息
    updateSceneInfo(data) {
        const sceneName = document.getElementById('scene-name');
        const sceneDescription = document.getElementById('scene-description');

        if (sceneName && sceneDescription) {
            sceneName.textContent = data.sceneName;
            sceneDescription.textContent = data.sceneDescription;
        }
        console.log(`当前场景：${data.sceneName} - ${data.sceneDescription}`);
    }

    // 切换侧边菜单
    toggleSideMenu() {
        if (this.sideMenu) {
            this.sideMenu.classList.toggle('open');
            this.menuToggle.classList.toggle('active');
            this.sideMenuOpen = !this.sideMenuOpen;
        }
    }

    // 显示菜单
    showMenu() {
        this.menu.classList.remove('fade-out');
        this.menu.classList.add('menu-active');
        this.container.classList.remove('show');
        this.ui.classList.remove('show');

        // 关闭侧边菜单
        if (this.sideMenu) {
            this.sideMenu.classList.remove('open');
        }
        if (this.menuToggle) {
            this.menuToggle.classList.remove('active');
        }
        this.sideMenuOpen = false;
    }

    // 隐藏菜单
    hideMenu() {
        this.menu.classList.remove('menu-active');
        this.menu.classList.add('fade-out');
        this.container.classList.add('show');

        // 初始化游戏内UI事件
        this.initGameUIEvents();
    }

    // 显示游戏UI
    showGameUI() {
        this.ui.classList.add('show');

        // 首次进入时展开侧边菜单
        setTimeout(() => {
            if (this.sideMenu && !this.sideMenuOpen) {
                this.sideMenu.classList.add('open');
                this.menuToggle.classList.add('active');
                this.sideMenuOpen = true;
            }
        }, 500);
    }

    // 隐藏游戏UI
    hideGameUI() {
        this.ui.classList.remove('show');
    }
}
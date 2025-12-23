// 背景效果管理器
class BackgroundEffectManager {
    constructor() {
        // 创建国际象棋棋盘背景
        this.createChessboardBackground();

        // 创建鼠标影响区域
        this.createMouseInfluenceArea();

        // 拖尾数组
        this.trails = [];
        this.maxTrails = 20;
        this.mousePosition = { x: 0, y: 0 };
        this.isMouseEffectEnabled = true;
        this.isDarkTheme = false;



        // 订阅鼠标效果开关事件
        eventBus.on('mouse:effect:toggle', (data) => {
            this.isMouseEffectEnabled = data.enabled;
        });

        // 监听鼠标移动事件
        document.addEventListener('mousemove', (e) => {
            this.mousePosition.x = e.clientX;
            this.mousePosition.y = e.clientY;
            if (this.isMouseEffectEnabled) {
                this.createTrail(e.clientX, e.clientY);
                this.updateGridDeformation(e.clientX, e.clientY);
            }
        });

        // 监听触摸移动事件
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                this.mousePosition.x = touch.clientX;
                this.mousePosition.y = touch.clientY;
                if (this.isMouseEffectEnabled) {
                    this.createTrail(touch.clientX, touch.clientY);
                    this.updateGridDeformation(touch.clientX, touch.clientY);
                }
            }
        });

        // 监听点击事件
        document.addEventListener('click', (e) => {
            if (this.isMouseEffectEnabled) {
                this.createClickEffect(e.clientX, e.clientY);
            }
        });

        // 定期清理过期拖尾
        setInterval(() => {
            this.cleanupTrails();
        }, 100);
    }

    // 创建国际象棋棋盘背景
    createChessboardBackground() {
        this.chessboard = document.createElement('div');
        this.chessboard.id = 'chessboard-background';
        document.body.appendChild(this.chessboard);
    }

    // 创建鼠标影响区域
    createMouseInfluenceArea() {
        this.mouseInfluence = document.createElement('div');
        this.mouseInfluence.id = 'mouse-influence';
        document.body.appendChild(this.mouseInfluence);

        // 初始化网格形变元素
        this.gridElements = [];
        const gridSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--grid-size'));
        const cols = Math.ceil(window.innerWidth / gridSize) + 2;
        const rows = Math.ceil(window.innerHeight / gridSize) + 2;

        for (let i = 0; i < cols * rows; i++) {
            const gridElement = document.createElement('div');
            gridElement.className = 'grid-deformation';
            gridElement.style.width = `${gridSize}px`;
            gridElement.style.height = `${gridSize}px`;
            gridElement.style.left = `${(i % cols - 1) * gridSize}px`;
            gridElement.style.top = `${(Math.floor(i / cols) - 1) * gridSize}px`;
            this.mouseInfluence.appendChild(gridElement);
            this.gridElements.push(gridElement);
        }
    }

    // 创建拖尾
    createTrail(x, y) {
        // 限制拖尾数量
        if (this.trails.length >= this.maxTrails) {
            const oldTrail = this.trails.shift();
            if (oldTrail && oldTrail.parentNode) {
                oldTrail.remove();
            }
        }

        // 创建拖尾元素
        const trail = document.createElement('div');
        trail.className = 'trail';
        trail.style.left = `${x}px`;
        trail.style.top = `${y}px`;

        // 使用更多高饱和颜色选项
        const colors = [
            '#ff0000', // 红色
            '#00ff00', // 绿色
            '#0000ff', // 蓝色
            '#ffff00', // 黄色
            '#ff00ff', // 紫色
            '#00ffff', // 青色
            '#ffffff', // 白色
            '#ff6600', // 橙色
            '#9900ff', // 深紫色
            '#00ff99'  // 青绿色
        ];

        // 随机选择两种颜色创建渐变效果
        const color1 = colors[Math.floor(Math.random() * colors.length)];
        const color2 = colors[Math.floor(Math.random() * colors.length)];

        trail.style.background = `radial-gradient(circle, ${color1} 0%, ${color2} 50%, transparent 70%)`;
        trail.style.boxShadow = `0 0 30px ${color1}, 0 0 60px ${color2}, inset 0 0 20px rgba(255, 255, 255, 0.2)`;

        // 随机角度用于不规则效果
        const randomAngle = Math.floor(Math.random() * 360);
        trail.style.setProperty('--angle', randomAngle);

        // 添加到容器
        document.body.appendChild(trail);
        this.trails.push(trail);
    }

    // 创建点击效果
    createClickEffect(x, y) {
        // 创建多个点击效果元素
        for (let i = 0; i < 5; i++) {
            const clickEffect = document.createElement('div');
            clickEffect.className = 'trail';
            clickEffect.style.left = `${x}px`;
            clickEffect.style.top = `${y}px`;

            // 使用随机高饱和颜色
            const colors = [
                '#ff0000', // 红色
                '#00ff00', // 绿色
                '#0000ff', // 蓝色
                '#ffff00', // 黄色
                '#ff00ff', // 紫色
                '#00ffff'  // 青色
            ];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];

            // 创建爆炸效果
            const size = 20 + Math.random() * 40;
            clickEffect.style.width = `${size}px`;
            clickEffect.style.height = `${size}px`;
            clickEffect.style.background = `radial-gradient(circle, ${randomColor} 0%, transparent 70%)`;
            clickEffect.style.boxShadow = `0 0 40px ${randomColor}, 0 0 80px ${randomColor}`;
            clickEffect.style.animation = `click-explode 0.8s ease-out forwards`;

            // 随机角度
            const randomAngle = Math.floor(Math.random() * 360);
            clickEffect.style.setProperty('--angle', randomAngle);

            // 添加到容器
            document.body.appendChild(clickEffect);

            // 添加到拖尾数组，以便清理
            this.trails.push(clickEffect);
        }
    }

    // 更新网格形变
    updateGridDeformation(mouseX, mouseY) {
        const gridSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--grid-size'));

        this.gridElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // 计算距离鼠标的距离
            const distance = Math.sqrt(
                Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2)
            );

            // 影响范围
            const influenceRadius = 250;

            if (distance < influenceRadius) {
                // 计算形变强度
                const intensity = 1 - (distance / influenceRadius);

                // 计算形变方向
                const angle = Math.atan2(mouseY - centerY, mouseX - centerX);
                const offsetX = Math.cos(angle) * intensity * 25;
                const offsetY = Math.sin(angle) * intensity * 25;

                // 应用形变
                element.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${1 + intensity * 0.3}) rotate(${intensity * 8}deg)`;
                element.style.opacity = `${intensity * 0.6}`;

                // 添加颜色效果 - 使用更多样化的颜色
                const hue = Math.random() * 360; // 全色系随机
                const saturation = 80 + Math.random() * 20; // 高饱和度
                const lightness = 50 + Math.random() * 20; // 中等亮度
                element.style.background = `radial-gradient(circle, hsla(${hue}, ${saturation}%, ${lightness}%, ${intensity * 0.4}) 0%, transparent 70%)`;
            } else {
                // 恢复原始状态
                element.style.transform = 'translate(0, 0) scale(1) rotate(0deg)';
                element.style.opacity = '0';
                element.style.background = 'radial-gradient(circle, rgba(255, 0, 0, 0) 0%, transparent 70%)';
            }
        });
    }

    // 清理过期拖尾
    cleanupTrails() {
        // 由于使用CSS动画，我们只需要检查是否已经消失
        this.trails = this.trails.filter(trail => {
            if (trail.parentNode) {
                return true;
            }
            return false;
        });
    }

    // 销毁所有效果
    destroy() {
        // 移除拖尾
        this.trails.forEach(trail => {
            if (trail.parentNode) {
                trail.remove();
            }
        });
        this.trails = [];

        // 移除背景和影响区域
        if (this.chessboard && this.chessboard.parentNode) {
            this.chessboard.remove();
        }
        if (this.mouseInfluence && this.mouseInfluence.parentNode) {
            this.mouseInfluence.remove();
        }


    }

    // 更新主题
    updateTheme(isDark) {
        this.isDarkTheme = isDark;
    }
}
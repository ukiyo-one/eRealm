// 场景管理器类
class SceneManager {
    constructor(mainScene, camera) {
        this.mainScene = mainScene;
        this.camera = camera;
        this.scenes = [];
        this.currentSceneIndex = 0;
        this.sceneConfigs = [
            { name: 'Corridor', type: 'corridor', description: 'Liminal space corridor scene' },
            { name: 'Sea', type: 'sea', description: 'Pool core scene with calming waters' },
            { name: 'Flower Gallery', type: 'gallery', description: 'Dream core scene with beautiful flowers' },
            { name: 'Stairs', type: 'stairs', description: 'Liminal space with endless stairs' }
        ];

        // 动态场景相关变量
        this.generatedAreas = new Set(); // 已生成的区域
        this.loadDistance = 50; // 加载距离
        this.unloadDistance = 70; // 卸载距离
        this.gridSize = 20; // 网格大小
        this.lastGeneratedPos = new THREE.Vector3(0, 0, 0); // 上次生成位置

        // 订阅场景切换事件
        eventBus.on('scene:switch', (data) => {
            this.switchScene(data.sceneIndex);
        });

        // 订阅菜单选择事件
        eventBus.on('menu:select', (data) => {
            this.handleMenuSelect(data);
        });
    }

    // 初始化所有场景
    initScenes() {
        this.createScene0(); // 后室走廊
        this.createScene1(); // 泳池空间
        this.createScene2(); // 诡异教室
        this.createScene3(); // 旷原
    }

    // 场景0：后室走廊
    createScene0() {
        const scene0 = new THREE.Group();
        scene0.name = '后室走廊';
        scene0.description = this.sceneConfigs[0].description;

        // 墙壁材质
        const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x999999 });
        const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x777777 });
        const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });

        // 保存材质引用，用于动态生成
        scene0.wallMaterial = wallMaterial;
        scene0.floorMaterial = floorMaterial;
        scene0.ceilingMaterial = ceilingMaterial;

        // 基础走廊结构（中心区域）
        this.generateCorridorArea(0, 0, scene0);

        // 添加光源
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        scene0.add(ambientLight);

        // 初始光源
        for (let i = 0; i < 4; i++) {
            const light = new THREE.PointLight(0xccccff, 1, 10);
            light.position.set(0, 2.8, -i * 5);
            scene0.add(light);

            // 灯光闪烁效果
            light.intensity = 0.8 + Math.random() * 0.4;
            setInterval(() => {
                light.intensity = 0.6 + Math.random() * 0.6;
            }, 500 + Math.random() * 1000);
        }

        scene0.visible = true;
        this.scenes.push(scene0);
        this.mainScene.add(scene0);
    }

    // 生成后室走廊区域
    generateCorridorArea(x, z, targetScene = null) {
        const currentScene = targetScene || this.getCurrentScene();

        // 墙壁材质
        const wallMaterial = currentScene.wallMaterial || new THREE.MeshStandardMaterial({ color: 0x999999 });
        const floorMaterial = currentScene.floorMaterial || new THREE.MeshStandardMaterial({ color: 0x777777 });
        const ceilingMaterial = currentScene.ceilingMaterial || new THREE.MeshStandardMaterial({ color: 0x888888 });

        // 地板
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(20, this.gridSize),
            floorMaterial
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(x, 0, z - this.gridSize / 2);
        floor.receiveShadow = true;
        floor.name = `floor_${x}_${z}`;
        currentScene.add(floor);

        // 天花板
        const ceiling = new THREE.Mesh(
            new THREE.PlaneGeometry(20, this.gridSize),
            ceilingMaterial
        );
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.set(x, 3, z - this.gridSize / 2);
        ceiling.receiveShadow = true;
        ceiling.name = `ceiling_${x}_${z}`;
        currentScene.add(ceiling);

        // 左侧墙壁
        const leftWall = new THREE.Mesh(
            new THREE.PlaneGeometry(this.gridSize, 3),
            wallMaterial
        );
        leftWall.rotation.y = Math.PI / 2;
        leftWall.position.set(x - 10, 1.5, z - this.gridSize / 2);
        leftWall.receiveShadow = true;
        leftWall.name = `left_wall_${x}_${z}`;
        currentScene.add(leftWall);

        // 右侧墙壁
        const rightWall = new THREE.Mesh(
            new THREE.PlaneGeometry(this.gridSize, 3),
            wallMaterial
        );
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.position.set(x + 10, 1.5, z - this.gridSize / 2);
        rightWall.receiveShadow = true;
        rightWall.name = `right_wall_${x}_${z}`;
        currentScene.add(rightWall);

        // 添加走廊门
        for (let i = 0; i < 2; i++) {
            const door = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 2.5, 0.1),
                new THREE.MeshStandardMaterial({ color: 0x555555 })
            );
            door.position.z = z - i * (this.gridSize / 2);
            door.position.x = Math.random() > 0.5 ? -8 : 8;
            door.position.y = 1.25;
            door.castShadow = true;
            door.name = `door_${x}_${z}_${i}`;
            currentScene.add(door);

            // 门把手
            const handle = new THREE.Mesh(
                new THREE.SphereGeometry(0.05, 16, 16),
                new THREE.MeshStandardMaterial({ color: 0xaaaaaa })
            );
            handle.position.set(door.position.x + (door.position.x > 0 ? -0.5 : 0.5), 1.25, door.position.z - 0.05);
            currentScene.add(handle);
        }

        // 添加区域光源
        for (let i = 0; i < this.gridSize / 5; i++) {
            const light = new THREE.PointLight(0xccccff, 1, 10);
            light.position.set(0, 2.8, z - i * 5);
            currentScene.add(light);

            // 灯光闪烁效果
            light.intensity = 0.8 + Math.random() * 0.4;
            setInterval(() => {
                light.intensity = 0.6 + Math.random() * 0.6;
            }, 500 + Math.random() * 1000);
        }

        // 随机添加隐藏元素
        if (Math.random() < 0.3) {
            const hidden1 = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 16, 16),
                new THREE.MeshStandardMaterial({ color: 0xffaaaa, emissive: 0xff5555 })
            );
            hidden1.position.set(x + (Math.random() * 10 - 5), 0.5, z - Math.random() * this.gridSize);
            hidden1.name = `hidden_element_${x}_${z}`;
            currentScene.add(hidden1);
        }
    }

    // 场景1：海场景（池核风格）
    createScene1() {
        const scene1 = new THREE.Group();
        scene1.name = 'Sea';
        scene1.description = this.sceneConfigs[1].description;

        // 材质定义
        const 河堤Material = new THREE.MeshStandardMaterial({ color: 0x886644 });
        const waterMaterial = new THREE.MeshStandardMaterial({
            color: 0x4488ff,
            transparent: true,
            opacity: 0.8,
            metalness: 0.3,
            roughness: 0.1
        });
        const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });

        // 保存材质引用，用于动态生成
        scene1.河堤Material = 河堤Material;
        scene1.waterMaterial = waterMaterial;
        scene1.floorMaterial = floorMaterial;

        // 基础结构（中心区域）
        this.generateSeaArea(0, 0, scene1);

        // 添加光源
        const ambientLight = new THREE.AmbientLight(0x606060, 0.6);
        scene1.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        scene1.add(directionalLight);

        scene1.visible = false;
        this.scenes.push(scene1);
        this.mainScene.add(scene1);
    }

    // 生成泳池空间区域
    generateSeaArea(x, z, targetScene = null) {
        const currentScene = targetScene || this.getCurrentScene();

        // 材质定义
        const 河堤Material = currentScene.河堤Material || new THREE.MeshStandardMaterial({ color: 0x886644 });
        const waterMaterial = currentScene.waterMaterial || new THREE.MeshStandardMaterial({
            color: 0x4488ff,
            transparent: true,
            opacity: 0.8,
            metalness: 0.3,
            roughness: 0.1
        });
        const floorMaterial = currentScene.floorMaterial || new THREE.MeshStandardMaterial({ color: 0xaaaaaa });

        // 地板
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(40, this.gridSize),
            floorMaterial
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(x, 0, z - this.gridSize / 2);
        floor.receiveShadow = true;
        floor.name = `sea_floor_${x}_${z}`;
        currentScene.add(floor);

        // 河堤通道（核心场景主体）
        const 河堤Width = 4;
        const 河堤Height = 1;
        const 河堤Length = this.gridSize;

        const 河堤 = new THREE.Mesh(
            new THREE.BoxGeometry(河堤Width, 河堤Height, 河堤Length),
            河堤Material
        );
        河堤.position.set(x, 河堤Height / 2, z - 河堤Length / 2);
        currentScene.add(河堤);

        // 通道两侧的水池景观
        const 水池Width = 15;
        const 水池Depth = 2;

        // 左侧水池
        const 左水池 = new THREE.Mesh(
            new THREE.BoxGeometry(水池Width, 水池Depth, 河堤Length),
            waterMaterial
        );
        左水池.position.set(x - 河堤Width / 2 - 水池Width / 2, -水池Depth / 2, z - 河堤Length / 2);
        左水池.castShadow = true;
        左水池.name = `left_pool_${x}_${z}`;
        currentScene.add(左水池);

        // 右侧水池
        const 右水池 = new THREE.Mesh(
            new THREE.BoxGeometry(水池Width, 水池Depth, 河堤Length),
            waterMaterial
        );
        右水池.position.set(x + 河堤Width / 2 + 水池Width / 2, -水池Depth / 2, z - 河堤Length / 2);
        右水池.castShadow = true;
        右水池.name = `right_pool_${x}_${z}`;
        currentScene.add(右水池);

        // 水面（用于反射和折射效果）
        const 水面Geometry = new THREE.PlaneGeometry(水池Width, 河堤Length, 128, 128);
        const 水面Material = new THREE.MeshStandardMaterial({
            color: 0x4488ff,
            transparent: true,
            opacity: 0.9,
            metalness: 0.8,
            roughness: 0.1,
            reflectivity: 1.0
        });

        // 左侧水面
        const 左水面 = new THREE.Mesh(水面Geometry, 水面Material);
        左水面.rotation.x = -Math.PI / 2;
        左水面.position.set(x - 河堤Width / 2 - 水池Width / 2, 0, z - 河堤Length / 2);
        左水面.name = `left_water_surface_${x}_${z}`;
        currentScene.add(左水面);

        // 右侧水面
        const 右水面 = new THREE.Mesh(水面Geometry, 水面Material);
        右水面.rotation.x = -Math.PI / 2;
        右水面.position.set(x + 河堤Width / 2 + 水池Width / 2, 0, z - 河堤Length / 2);
        右水面.name = `right_water_surface_${x}_${z}`;
        currentScene.add(右水面);

        // 水池边缘
        const 水池边缘Material = new THREE.MeshStandardMaterial({ color: 0xffffff });

        // 左侧水池边缘
        const 左水池边缘 = new THREE.Mesh(
            new THREE.BoxGeometry(水池Width + 0.5, 0.3, 河堤Length + 0.5),
            水池边缘Material
        );
        左水池边缘.position.set(x - 河堤Width / 2 - 水池Width / 2, 0, z - 河堤Length / 2);
        currentScene.add(左水池边缘);

        // 右侧水池边缘
        const 右水池边缘 = new THREE.Mesh(
            new THREE.BoxGeometry(水池Width + 0.5, 0.3, 河堤Length + 0.5),
            水池边缘Material
        );
        右水池边缘.position.set(x + 河堤Width / 2 + 水池Width / 2, 0, z - 河堤Length / 2);
        currentScene.add(右水池边缘);

        // 随机出现的集合体
        const 集合体材质 = new THREE.MeshStandardMaterial({
            color: 0x8844ff,
            transparent: true,
            opacity: 0.6,
            metalness: 0.7,
            roughness: 0.2
        });

        for (let i = 0; i < 3; i++) {
            const 集合体 = new THREE.Mesh(
                new THREE.SphereGeometry(Math.random() * 0.5 + 0.3, 16, 16),
                集合体材质
            );
            集合体.position.set(
                x + Math.random() * 30 - 15,
                Math.random() * 2 + 0.5,
                z - this.gridSize / 2 + Math.random() * this.gridSize
            );
            集合体.name = `集合体_${x}_${z}_${i}`;
            currentScene.add(集合体);
        }

        // 随机添加隐藏元素
        if (Math.random() < 0.2) {
            const hidden1 = new THREE.Mesh(
                new THREE.SphereGeometry(0.15, 16, 16),
                new THREE.MeshStandardMaterial({ color: 0xffff88, emissive: 0xffff00 })
            );
            hidden1.position.set(x + Math.random() * 10 - 5, 0.5, z - Math.random() * this.gridSize);
            hidden1.name = `hidden_element_${x}_${z}`;
            currentScene.add(hidden1);
        }
    }

    // 场景2：花廊场景（梦核风格）
    createScene2() {
        const scene2 = new THREE.Group();
        scene2.name = 'Flower Gallery';
        scene2.description = this.sceneConfigs[2].description;

        // 材质定义
        const 长廊Material = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
        const 柱子Material = new THREE.MeshStandardMaterial({ color: 0xdddddd });
        const 地板Material = new THREE.MeshStandardMaterial({ color: 0xffffcc });
        const 平原Material = new THREE.MeshStandardMaterial({ color: 0xccffcc });

        // 保存材质引用，用于动态生成
        scene2.长廊Material = 长廊Material;
        scene2.柱子Material = 柱子Material;
        scene2.地板Material = 地板Material;
        scene2.平原Material = 平原Material;

        // 基础结构（中心区域）
        this.generateGalleryArea(0, 0, scene2);

        // 添加光源
        const ambientLight = new THREE.AmbientLight(0xffffcc, 0.8);
        scene2.add(ambientLight);

        scene2.visible = false;
        this.scenes.push(scene2);
        this.mainScene.add(scene2);
    }

    // 生成花廊场景区域
    generateGalleryArea(x, z, targetScene = null) {
        const currentScene = targetScene || this.getCurrentScene();

        // 材质定义
        const 长廊Material = currentScene.长廊Material || new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
        const 柱子Material = currentScene.柱子Material || new THREE.MeshStandardMaterial({ color: 0xdddddd });
        const 地板Material = currentScene.地板Material || new THREE.MeshStandardMaterial({ color: 0xffffcc });
        const 平原Material = currentScene.平原Material || new THREE.MeshStandardMaterial({ color: 0xccffcc });

        // 平原景观
        const 平原 = new THREE.Mesh(
            new THREE.PlaneGeometry(100, this.gridSize),
            平原Material
        );
        平原.rotation.x = -Math.PI / 2;
        平原.position.set(x, 0, z - this.gridSize / 2);
        平原.receiveShadow = true;
        平原.name = `gallery_plane_${x}_${z}`;
        currentScene.add(平原);

        // 长廊结构
        const 长廊长度 = this.gridSize;
        const 长廊宽度 = 6;
        const 长廊高度 = 4;

        // 长廊地板
        const 长廊地板 = new THREE.Mesh(
            new THREE.PlaneGeometry(长廊宽度, 长廊长度),
            地板Material
        );
        长廊地板.rotation.x = -Math.PI / 2;
        长廊地板.position.set(x, 0, z - 长廊长度 / 2);
        长廊地板.receiveShadow = true;
        长廊地板.name = `gallery_floor_${x}_${z}`;
        currentScene.add(长廊地板);

        // 长廊顶部
        const 长廊顶部 = new THREE.Mesh(
            new THREE.PlaneGeometry(长廊宽度, 长廊长度),
            长廊Material
        );
        长廊顶部.rotation.x = Math.PI / 2;
        长廊顶部.position.set(x, 长廊高度, z - 长廊长度 / 2);
        长廊顶部.name = `gallery_top_${x}_${z}`;
        currentScene.add(长廊顶部);

        // 长廊柱子
        const 柱子间距 = 5;
        const 柱子数量 = Math.floor(长廊长度 / 柱子间距) + 1;

        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 柱子数量; j++) {
                const 柱子 = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.2, 0.2, 长廊高度, 16),
                    柱子Material
                );
                const columnX = i === 0 ? x - 长廊宽度 / 2 + 0.5 : x + 长廊宽度 / 2 - 0.5;
                const columnZ = z - 长廊长度 / 2 + j * 柱子间距;
                柱子.position.set(columnX, 长廊高度 / 2, columnZ);
                柱子.castShadow = true;
                柱子.name = `gallery_pillar_${x}_${z}_${i}_${j}`;
                currentScene.add(柱子);
            }
        }

        // 随机生成立体图形
        const 立体图形数量 = 8;
        for (let i = 0; i < 立体图形数量; i++) {
            let geometry;
            const 图形类型 = Math.floor(Math.random() * 4);

            switch (图形类型) {
                case 0: // 立方体
                    geometry = new THREE.BoxGeometry(1 + Math.random() * 2, 1 + Math.random() * 2, 1 + Math.random() * 2);
                    break;
                case 1: // 球体
                    geometry = new THREE.SphereGeometry(0.5 + Math.random() * 1, 16, 16);
                    break;
                case 2: // 圆柱体
                    geometry = new THREE.CylinderGeometry(0.3 + Math.random() * 0.7, 0.3 + Math.random() * 0.7, 1 + Math.random() * 2, 16);
                    break;
                case 3: // 锥体
                    geometry = new THREE.ConeGeometry(0.5 + Math.random() * 0.8, 1.5 + Math.random() * 1.5, 16);
                    break;
            }

            // 随机颜色
            const 随机颜色 = new THREE.Color();
            随机颜色.setHSL(Math.random(), 0.7, 0.6);

            const 图形Material = new THREE.MeshStandardMaterial({
                color: 随机颜色,
                transparent: true,
                opacity: 0.8,
                metalness: 0.3,
                roughness: 0.2
            });

            const 立体图形 = new THREE.Mesh(geometry, 图形Material);

            // 随机位置（长廊周围和内部）
            const 位置范围 = 30;
            立体图形.position.set(
                x + Math.random() * 位置范围 - 位置范围 / 2,
                Math.random() * 5 + 1,
                z - this.gridSize / 2 + Math.random() * this.gridSize
            );

            // 随机旋转
            立体图形.rotation.set(
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2
            );

            立体图形.name = `立体图形_${x}_${z}_${i}`;
            currentScene.add(立体图形);
        }

        // 梦幻风格的彩色光源
        for (let i = 0; i < 5; i++) {
            const 彩色光源 = new THREE.PointLight(
                new THREE.Color(Math.random(), Math.random(), Math.random()),
                0.5,
                15
            );
            彩色光源.position.set(
                x + Math.random() * 40 - 20,
                Math.random() * 3 + 2,
                z - this.gridSize / 2 + Math.random() * this.gridSize
            );
            currentScene.add(彩色光源);
        }

        // 随机添加隐藏元素
        if (Math.random() < 0.25) {
            const hidden1 = new THREE.Mesh(
                new THREE.SphereGeometry(0.15, 16, 16),
                new THREE.MeshStandardMaterial({ color: 0xffff88, emissive: 0xffff00 })
            );
            hidden1.position.set(x + Math.random() * 10 - 5, 2, z - Math.random() * this.gridSize);
            hidden1.name = `hidden_element_${x}_${z}`;
            currentScene.add(hidden1);
        }
    }

    // 场景3：楼梯场景（域限空间）
    createScene3() {
        const scene3 = new THREE.Group();
        scene3.name = 'Stairs';
        scene3.description = this.sceneConfigs[3].description;

        // 材质定义
        const 墙壁Material = new THREE.MeshStandardMaterial({ color: 0xdddddd });
        const 楼梯Material = new THREE.MeshStandardMaterial({ color: 0xcccccc });
        const 扶手Material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
        const 窗户框架Material = new THREE.MeshStandardMaterial({ color: 0x888888 });
        const 窗户玻璃Material = new THREE.MeshStandardMaterial({
            color: 0x88ccff,
            transparent: true,
            opacity: 0.8
        });

        // 保存材质引用，用于动态生成
        scene3.墙壁Material = 墙壁Material;
        scene3.楼梯Material = 楼梯Material;
        scene3.扶手Material = 扶手Material;
        scene3.窗户框架Material = 窗户框架Material;
        scene3.窗户玻璃Material = 窗户玻璃Material;

        // 基础结构（中心区域）
        this.generateStairsArea(0, 0, scene3);

        // 添加光源
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        scene3.add(ambientLight);

        scene3.visible = false;
        this.scenes.push(scene3);
        this.mainScene.add(scene3);
    }

    // 生成楼梯场景区域
    generateStairsArea(x, z, targetScene = null) {
        const currentScene = targetScene || this.getCurrentScene();

        // 材质定义
        const 墙壁Material = currentScene.墙壁Material || new THREE.MeshStandardMaterial({ color: 0xdddddd });
        const 楼梯Material = currentScene.楼梯Material || new THREE.MeshStandardMaterial({ color: 0xcccccc });
        const 扶手Material = currentScene.扶手Material || new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
        const 窗户框架Material = currentScene.窗户框架Material || new THREE.MeshStandardMaterial({ color: 0x888888 });
        const 窗户玻璃Material = currentScene.窗户玻璃Material || new THREE.MeshStandardMaterial({
            color: 0x88ccff,
            transparent: true,
            opacity: 0.8
        });

        // 墙壁
        const 墙壁 = new THREE.Mesh(
            new THREE.BoxGeometry(20, 8, this.gridSize),
            墙壁Material
        );
        墙壁.position.set(x, 4, z - this.gridSize / 2);
        墙壁.receiveShadow = true;
        墙壁.name = `stairs_wall_${x}_${z}`;
        currentScene.add(墙壁);

        // 上下交错的楼梯结构
        const 楼梯段数量 = 2;
        const 楼梯宽度 = 4;
        const 楼梯高度 = 1;
        const 楼梯长度 = 8;

        for (let i = 0; i < 楼梯段数量; i++) {
            // 左楼梯段
            const 左楼梯 = new THREE.Mesh(
                new THREE.BoxGeometry(楼梯宽度, 0.2, 楼梯长度),
                楼梯Material
            );
            左楼梯.position.set(
                x - 6,
                i * 楼梯高度,
                z - this.gridSize / 2 + i * 楼梯长度
            );
            左楼梯.receiveShadow = true;
            左楼梯.name = `stairs_left_${x}_${z}_${i}`;
            currentScene.add(左楼梯);

            // 右楼梯段（交错）
            const 右楼梯 = new THREE.Mesh(
                new THREE.BoxGeometry(楼梯宽度, 0.2, 楼梯长度),
                楼梯Material
            );
            右楼梯.position.set(
                x + 6,
                i * 楼梯高度 + 楼梯高度 / 2,
                z - this.gridSize / 2 + i * 楼梯长度 + 楼梯长度 / 2
            );
            右楼梯.receiveShadow = true;
            右楼梯.name = `stairs_right_${x}_${z}_${i}`;
            currentScene.add(右楼梯);

            // 楼梯台阶
            const 台阶数量 = 8;
            for (let j = 0; j < 台阶数量; j++) {
                // 左台阶
                const 左台阶 = new THREE.Mesh(
                    new THREE.BoxGeometry(楼梯宽度, 0.2, 0.8),
                    楼梯Material
                );
                左台阶.position.set(
                    x - 6,
                    i * 楼梯高度 + j * 0.125,
                    z - this.gridSize / 2 + i * 楼梯长度 + j * 1
                );
                左台阶.receiveShadow = true;
                currentScene.add(左台阶);

                // 右台阶
                const 右台阶 = new THREE.Mesh(
                    new THREE.BoxGeometry(楼梯宽度, 0.2, 0.8),
                    楼梯Material
                );
                右台阶.position.set(
                    x + 6,
                    i * 楼梯高度 + 楼梯高度 / 2 + j * 0.125,
                    z - this.gridSize / 2 + i * 楼梯长度 + 楼梯长度 / 2 + j * 1
                );
                右台阶.receiveShadow = true;
                currentScene.add(右台阶);
            }
        }

        // 窗户元素
        const 窗户数量 = 4;
        for (let i = 0; i < 窗户数量; i++) {
            // 随机位置
            const windowX = (i % 2 === 0) ? x - 10 : x + 10;
            const windowY = Math.random() * 6 + 1;
            const windowZ = z - this.gridSize / 2 + Math.random() * this.gridSize;

            // 窗户框架
            const 窗户框架 = new THREE.Mesh(
                new THREE.BoxGeometry(0.2, 2, 2),
                窗户框架Material
            );
            窗户框架.position.set(windowX, windowY, windowZ);
            窗户框架.castShadow = true;
            currentScene.add(窗户框架);

            // 窗户玻璃
            const 窗户玻璃 = new THREE.Mesh(
                new THREE.PlaneGeometry(1.8, 1.8),
                new THREE.MeshStandardMaterial({
                    color: new THREE.Color().setHSL(Math.random(), 0.7, 0.6),
                    transparent: true,
                    opacity: 0.8
                })
            );
            窗户玻璃.rotation.y = (windowX > 0) ? Math.PI / 2 : -Math.PI / 2;
            窗户玻璃.position.set(windowX, windowY, windowZ);
            窗户玻璃.name = `窗户玻璃_${x}_${z}_${i}`;
            currentScene.add(窗户玻璃);
        }

        // 点光源，营造域限空间氛围
        for (let i = 0; i < 4; i++) {
            const 点光源 = new THREE.PointLight(0x88ccff, 0.6, 15);
            点光源.position.set(
                x + Math.random() * 10 - 5,
                Math.random() * 6 + 1,
                z - this.gridSize / 2 + Math.random() * this.gridSize
            );
            currentScene.add(点光源);
        }

        // 随机添加隐藏元素
        if (Math.random() < 0.2) {
            const hidden1 = new THREE.Mesh(
                new THREE.SphereGeometry(0.2, 16, 16),
                new THREE.MeshStandardMaterial({ color: 0x88ff88, emissive: 0x00ff00 })
            );
            hidden1.position.set(x + Math.random() * 10 - 5, 5, z - Math.random() * this.gridSize);
            hidden1.name = `hidden_element_${x}_${z}`;
            currentScene.add(hidden1);
        }
    }

    // 场景切换
    switchScene(sceneIndex) {
        if (sceneIndex === this.currentSceneIndex) return;

        // 隐藏当前场景
        this.scenes[this.currentSceneIndex].visible = false;

        // 显示新场景
        this.scenes[sceneIndex].visible = true;
        this.currentSceneIndex = sceneIndex;

        // 发布场景切换完成事件
        eventBus.emit('scene:switched', {
            sceneIndex: sceneIndex,
            sceneName: this.scenes[sceneIndex].name,
            sceneDescription: this.scenes[sceneIndex].description
        });

        // 重置相机位置
        this.resetCamera();

        // 播放场景切换音效
        eventBus.emit('audio:play', { type: 'switch' });
    }

    // 重置相机位置（使用平滑过渡）
    resetCamera() {
        // 存储目标位置，让animate函数处理平滑过渡
        this.cameraResetTarget = {
            position: new THREE.Vector3(0, 1.6, 5),
            target: new THREE.Vector3(0, 1.6, 0)
        };
    }

    // 获取当前场景
    getCurrentScene() {
        return this.scenes[this.currentSceneIndex];
    }

    // 获取场景配置
    getSceneConfigs() {
        return this.sceneConfigs;
    }

    // 处理菜单选择
    handleMenuSelect(data) {
        const sceneType = data.sceneType;
        let sceneIndex = 0;

        // 根据场景类型查找对应的索引
        switch (sceneType) {
            case 'corridor':
                sceneIndex = 0;
                break;
            case 'sea':
                sceneIndex = 1;
                break;
            case 'gallery':
                sceneIndex = 2;
                break;
            case 'stairs':
                sceneIndex = 3;
                break;
            default:
                sceneIndex = 0;
        }

        // 切换到对应的场景
        this.switchScene(sceneIndex);
    }

    // 场景动态更新方法
    updateScene(cameraPosition) {
        this.checkAndGenerateAreas(cameraPosition);
        this.checkAndUnloadAreas(cameraPosition);

        // 更新场景元素（如果需要）
        this.updateSceneElements();
    }

    // 生成网格区域的唯一标识符
    getGridKey(pos) {
        const x = Math.floor(pos.x / this.gridSize) * this.gridSize;
        const z = Math.floor(pos.z / this.gridSize) * this.gridSize;
        return `${x},${z}`;
    }

    // 生成指定区域的场景内容
    generateArea(gridKey) {
        if (this.generatedAreas.has(gridKey)) return;

        const [x, z] = gridKey.split(',').map(Number);

        // 根据当前场景类型生成对应的场景内容
        switch (this.currentSceneIndex) {
            case 0: // 后室走廊
                this.generateCorridorArea(x, z);
                break;
            case 1: // 泳池空间
                this.generateSeaArea(x, z);
                break;
            case 2: // 花廊场景
                this.generateGalleryArea(x, z);
                break;
            case 3: // 楼梯场景
                this.generateStairsArea(x, z);
                break;
        }

        this.generatedAreas.add(gridKey);
    }

    // 卸载指定区域的场景内容
    unloadArea(gridKey) {
        if (!this.generatedAreas.has(gridKey)) return;

        const currentScene = this.getCurrentScene();
        const [x, z] = gridKey.split(',').map(Number);

        // 查找并移除该区域的场景元素
        const elementsToRemove = [];
        currentScene.children.forEach(child => {
            // 检查元素是否在该区域内
            if (Math.abs(child.position.x - x) < this.gridSize &&
                Math.abs(child.position.z - z) < this.gridSize) {
                elementsToRemove.push(child);
            }
        });

        // 移除元素
        elementsToRemove.forEach(element => {
            currentScene.remove(element);
        });

        this.generatedAreas.delete(gridKey);
    }

    // 检查并生成相机周围的区域
    checkAndGenerateAreas(cameraPosition) {
        const centerX = Math.floor(cameraPosition.x / this.gridSize) * this.gridSize;
        const centerZ = Math.floor(cameraPosition.z / this.gridSize) * this.gridSize;

        const gridRadius = Math.ceil(this.loadDistance / this.gridSize);

        // 生成周围区域
        for (let x = centerX - gridRadius * this.gridSize; x <= centerX + gridRadius * this.gridSize; x += this.gridSize) {
            for (let z = centerZ - gridRadius * this.gridSize; z <= centerZ + gridRadius * this.gridSize; z += this.gridSize) {
                const gridKey = `${x},${z}`;
                this.generateArea(gridKey);
            }
        }
    }

    // 检查并卸载远离相机的区域
    checkAndUnloadAreas(cameraPosition) {
        const centerX = Math.floor(cameraPosition.x / this.gridSize) * this.gridSize;
        const centerZ = Math.floor(cameraPosition.z / this.gridSize) * this.gridSize;

        // 卸载远离相机的区域
        for (const gridKey of this.generatedAreas) {
            const [x, z] = gridKey.split(',').map(Number);
            const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(z - centerZ, 2));

            if (distance > this.unloadDistance) {
                this.unloadArea(gridKey);
            }
        }
    }

    // 更新场景元素（例如动画效果）
    updateSceneElements() {
        const currentScene = this.getCurrentScene();

        // 更新场景元素的动画效果
        currentScene.children.forEach(child => {
            if (child.name.includes('集合体') || child.name.includes('立体图形')) {
                // 为某些元素添加旋转动画
                child.rotation.x += 0.01;
                child.rotation.y += 0.01;
            }
        });
    }
}
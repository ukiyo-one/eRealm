// 海场景（池核风格）
class SeaScene {
    constructor(sceneConfig) {
        this.sceneConfig = sceneConfig;
    }

    createScene() {
        const scene = new THREE.Group();
        scene.name = 'Sea';
        scene.description = this.sceneConfig.description;

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

        // 地板
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(40, 100),
            floorMaterial
        );
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floor);

        // 河堤通道（核心场景主体）
        const 河堤Width = 4;
        const 河堤Height = 1;
        const 河堤Length = 80;

        const 河堤 = new THREE.Mesh(
            new THREE.BoxGeometry(河堤Width, 河堤Height, 河堤Length),
            河堤Material
        );
        河堤.position.y = 河堤Height / 2;
        scene.add(河堤);

        // 通道两侧的水池景观
        const 水池Width = 15;
        const 水池Depth = 2;

        // 左侧水池
        const 左水池 = new THREE.Mesh(
            new THREE.BoxGeometry(水池Width, 水池Depth, 河堤Length),
            waterMaterial
        );
        左水池.position.set(-河堤Width / 2 - 水池Width / 2, -水池Depth / 2, 0);
        左水池.castShadow = true;
        左水池.name = 'left_pool';
        scene.add(左水池);

        // 右侧水池
        const 右水池 = new THREE.Mesh(
            new THREE.BoxGeometry(水池Width, 水池Depth, 河堤Length),
            waterMaterial
        );
        右水池.position.set(河堤Width / 2 + 水池Width / 2, -水池Depth / 2, 0);
        右水池.castShadow = true;
        右水池.name = 'right_pool';
        scene.add(右水池);

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
        左水面.position.set(-河堤Width / 2 - 水池Width / 2, 0, 0);
        左水面.name = 'left_water_surface';
        scene.add(左水面);

        // 右侧水面
        const 右水面 = new THREE.Mesh(水面Geometry, 水面Material);
        右水面.rotation.x = -Math.PI / 2;
        右水面.position.set(河堤Width / 2 + 水池Width / 2, 0, 0);
        右水面.name = 'right_water_surface';
        scene.add(右水面);

        // 水池边缘
        const 水池边缘Material = new THREE.MeshStandardMaterial({ color: 0xffffff });

        // 左侧水池边缘
        const 左水池边缘 = new THREE.Mesh(
            new THREE.BoxGeometry(水池Width + 0.5, 0.3, 河堤Length + 0.5),
            水池边缘Material
        );
        左水池边缘.position.set(-河堤Width / 2 - 水池Width / 2, 0, 0);
        scene.add(左水池边缘);

        // 右侧水池边缘
        const 右水池边缘 = new THREE.Mesh(
            new THREE.BoxGeometry(水池Width + 0.5, 0.3, 河堤Length + 0.5),
            水池边缘Material
        );
        右水池边缘.position.set(河堤Width / 2 + 水池Width / 2, 0, 0);
        scene.add(右水池边缘);

        // 添加光源
        const ambientLight = new THREE.AmbientLight(0x606060, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        // 添加水底光源，增强水的效果
        for (let i = 0; i < 10; i++) {
            const underwaterLight = new THREE.PointLight(0x4488ff, 0.5, 10);
            underwaterLight.position.set(
                Math.random() * 20 - 10,
                -1.5,
                Math.random() * 60 - 30
            );
            scene.add(underwaterLight);
        }

        // 随机出现的集合体
        const 集合体材质 = new THREE.MeshStandardMaterial({
            color: 0x8844ff,
            transparent: true,
            opacity: 0.6,
            metalness: 0.7,
            roughness: 0.2
        });

        for (let i = 0; i < 8; i++) {
            const 集合体 = new THREE.Mesh(
                new THREE.SphereGeometry(Math.random() * 0.5 + 0.3, 16, 16),
                集合体材质
            );
            集合体.position.set(
                Math.random() * 30 - 15,
                Math.random() * 2 + 0.5,
                Math.random() * 60 - 30
            );
            集合体.name = `集合体_${i}`;
            scene.add(集合体);
        }

        // 添加隐藏元素
        const hidden1 = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0xffff88, emissive: 0xffff00 })
        );
        hidden1.position.set(0, 0.5, 20);
        hidden1.name = 'hidden_element_1';
        scene.add(hidden1);

        scene.visible = false;
        return scene;
    }
}
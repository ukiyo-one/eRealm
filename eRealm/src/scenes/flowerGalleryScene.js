// 花廊场景（梦核风格）
class FlowerGalleryScene {
    constructor(sceneConfig) {
        this.sceneConfig = sceneConfig;
    }

    createScene() {
        const scene = new THREE.Group();
        scene.name = 'Flower Gallery';
        scene.description = this.sceneConfig.description;

        // 材质定义
        const 长廊Material = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
        const 柱子Material = new THREE.MeshStandardMaterial({ color: 0xdddddd });
        const 地板Material = new THREE.MeshStandardMaterial({ color: 0xffffcc });
        const 平原Material = new THREE.MeshStandardMaterial({ color: 0xccffcc });
        const 立体图形Material = new THREE.MeshStandardMaterial({ color: 0xff88cc, metalness: 0.3, roughness: 0.2 });

        // 平原景观
        const 平原 = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),
            平原Material
        );
        平原.rotation.x = -Math.PI / 2;
        平原.receiveShadow = true;
        scene.add(平原);

        // 长廊结构
        const 长廊长度 = 50;
        const 长廊宽度 = 6;
        const 长廊高度 = 4;

        // 长廊地板
        const 长廊地板 = new THREE.Mesh(
            new THREE.PlaneGeometry(长廊宽度, 长廊长度),
            地板Material
        );
        长廊地板.rotation.x = -Math.PI / 2;
        长廊地板.receiveShadow = true;
        scene.add(长廊地板);

        // 长廊顶部
        const 长廊顶部 = new THREE.Mesh(
            new THREE.PlaneGeometry(长廊宽度, 长廊长度),
            长廊Material
        );
        长廊顶部.rotation.x = Math.PI / 2;
        长廊顶部.position.y = 长廊高度;
        scene.add(长廊顶部);

        // 长廊柱子
        const 柱子间距 = 5;
        const 柱子数量 = Math.floor(长廊长度 / 柱子间距) + 1;

        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 柱子数量; j++) {
                const 柱子 = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.2, 0.2, 长廊高度, 16),
                    柱子Material
                );
                const x = i === 0 ? -长廊宽度 / 2 + 0.5 : 长廊宽度 / 2 - 0.5;
                const z = -长廊长度 / 2 + j * 柱子间距;
                柱子.position.set(x, 长廊高度 / 2, z);
                柱子.castShadow = true;
                scene.add(柱子);
            }
        }

        // 随机生成立体图形
        const 立体图形数量 = 20;
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
                Math.random() * 位置范围 - 位置范围 / 2,
                Math.random() * 5 + 1,
                Math.random() * 位置范围 - 位置范围 / 2
            );

            // 随机旋转
            立体图形.rotation.set(
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2
            );

            立体图形.name = `立体图形_${i}`;
            scene.add(立体图形);
        }

        // 添加光源
        const ambientLight = new THREE.AmbientLight(0xffffcc, 0.8);
        scene.add(ambientLight);

        // 梦幻风格的彩色光源
        for (let i = 0; i < 10; i++) {
            const 彩色光源 = new THREE.PointLight(
                new THREE.Color(Math.random(), Math.random(), Math.random()),
                0.5,
                15
            );
            彩色光源.position.set(
                Math.random() * 40 - 20,
                Math.random() * 3 + 2,
                Math.random() * 40 - 20
            );
            scene.add(彩色光源);
        }

        // 添加隐藏元素
        const hidden1 = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0xffff88, emissive: 0xffff00 })
        );
        hidden1.position.set(0, 2, 15);
        hidden1.name = 'hidden_element_1';
        scene.add(hidden1);

        scene.visible = false;
        return scene;
    }
}
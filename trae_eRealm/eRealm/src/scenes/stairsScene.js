// 楼梯场景（域限空间）
class StairsScene {
    constructor(sceneConfig) {
        this.sceneConfig = sceneConfig;
    }

    createScene() {
        const scene = new THREE.Group();
        scene.name = 'Stairs';
        scene.description = this.sceneConfig.description;

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

        // 墙壁
        const 墙壁 = new THREE.Mesh(
            new THREE.BoxGeometry(20, 8, 20),
            墙壁Material
        );
        墙壁.position.y = 4;
        墙壁.receiveShadow = true;
        scene.add(墙壁);

        // 上下交错的楼梯结构
        const 楼梯段数量 = 5;
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
                -6,
                i * 楼梯高度,
                -10 + i * 楼梯长度
            );
            左楼梯.receiveShadow = true;
            scene.add(左楼梯);

            // 右楼梯段（交错）
            const 右楼梯 = new THREE.Mesh(
                new THREE.BoxGeometry(楼梯宽度, 0.2, 楼梯长度),
                楼梯Material
            );
            右楼梯.position.set(
                6,
                i * 楼梯高度 + 楼梯高度 / 2,
                -10 + i * 楼梯长度 + 楼梯长度 / 2
            );
            右楼梯.receiveShadow = true;
            scene.add(右楼梯);

            // 楼梯台阶
            const 台阶数量 = 8;
            for (let j = 0; j < 台阶数量; j++) {
                // 左台阶
                const 左台阶 = new THREE.Mesh(
                    new THREE.BoxGeometry(楼梯宽度, 0.2, 0.8),
                    楼梯Material
                );
                左台阶.position.set(
                    -6,
                    i * 楼梯高度 + j * 0.125,
                    -10 + i * 楼梯长度 + j * 1
                );
                左台阶.receiveShadow = true;
                scene.add(左台阶);

                // 右台阶
                const 右台阶 = new THREE.Mesh(
                    new THREE.BoxGeometry(楼梯宽度, 0.2, 0.8),
                    楼梯Material
                );
                右台阶.position.set(
                    6,
                    i * 楼梯高度 + 楼梯高度 / 2 + j * 0.125,
                    -10 + i * 楼梯长度 + 楼梯长度 / 2 + j * 1
                );
                右台阶.receiveShadow = true;
                scene.add(右台阶);
            }
        }

        // 窗户元素
        const 窗户数量 = 10;
        for (let i = 0; i < 窗户数量; i++) {
            // 随机位置
            const x = (i % 2 === 0) ? -10 : 10;
            const y = Math.random() * 6 + 1;
            const z = Math.random() * 30 - 15;

            // 窗户框架
            const 窗户框架 = new THREE.Mesh(
                new THREE.BoxGeometry(0.2, 2, 2),
                窗户框架Material
            );
            窗户框架.position.set(x, y, z);
            窗户框架.castShadow = true;
            scene.add(窗户框架);

            // 窗户玻璃
            const 窗户玻璃 = new THREE.Mesh(
                new THREE.PlaneGeometry(1.8, 1.8),
                new THREE.MeshStandardMaterial({
                    color: new THREE.Color().setHSL(Math.random(), 0.7, 0.6),
                    transparent: true,
                    opacity: 0.8
                })
            );
            窗户玻璃.rotation.y = (x > 0) ? Math.PI / 2 : -Math.PI / 2;
            窗户玻璃.position.set(x, y, z);
            窗户玻璃.name = `窗户玻璃_${i}`;
            scene.add(窗户玻璃);
        }

        // 添加光源
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        scene.add(ambientLight);

        // 点光源，营造域限空间氛围
        for (let i = 0; i < 8; i++) {
            const 点光源 = new THREE.PointLight(0x88ccff, 0.6, 15);
            点光源.position.set(
                Math.random() * 10 - 5,
                Math.random() * 6 + 1,
                Math.random() * 20 - 10
            );
            scene.add(点光源);
        }

        // 添加隐藏元素
        const hidden1 = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0x88ff88, emissive: 0x00ff00 })
        );
        hidden1.position.set(0, 5, 0);
        hidden1.name = 'hidden_element_1';
        scene.add(hidden1);

        scene.visible = false;
        return scene;
    }
}
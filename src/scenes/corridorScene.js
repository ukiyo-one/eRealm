// 后室走廊场景
class CorridorScene {
    constructor(sceneConfig) {
        this.sceneConfig = sceneConfig;
    }

    createScene() {
        const scene = new THREE.Group();
        scene.name = '后室走廊';
        scene.description = this.sceneConfig.description;

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
        scene.add(floor);

        // 天花板
        const ceiling = new THREE.Mesh(
            new THREE.PlaneGeometry(20, 100),
            ceilingMaterial
        );
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = 3;
        ceiling.receiveShadow = true;
        scene.add(ceiling);

        // 左侧墙壁
        const leftWall = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 3),
            wallMaterial
        );
        leftWall.rotation.y = Math.PI / 2;
        leftWall.position.x = -10;
        leftWall.position.y = 1.5;
        leftWall.receiveShadow = true;
        scene.add(leftWall);

        // 右侧墙壁
        const rightWall = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 3),
            wallMaterial
        );
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.position.x = 10;
        rightWall.position.y = 1.5;
        rightWall.receiveShadow = true;
        scene.add(rightWall);

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
            door.name = `door_${i}`;
            scene.add(door);

            // 门把手
            const handle = new THREE.Mesh(
                new THREE.SphereGeometry(0.05, 16, 16),
                new THREE.MeshStandardMaterial({ color: 0xaaaaaa })
            );
            handle.position.set(door.position.x + (door.position.x > 0 ? -0.5 : 0.5), 1.25, door.position.z - 0.05);
            scene.add(handle);
        }

        // 添加光源
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        scene.add(ambientLight);

        for (let i = 0; i < 20; i++) {
            const light = new THREE.PointLight(0xccccff, 1, 10);
            light.position.set(0, 2.8, -i * 5);
            scene.add(light);

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
        hidden1.name = 'hidden_element_1';
        scene.add(hidden1);

        scene.visible = true;
        return scene;
    }
}
# 项目文件结构变更说明

## 变更目标
将项目代码按照业务场景和功能模块进行系统性重组，提高代码的可维护性和团队协作效率。

## 新的目录结构

```
├── src/
│   ├── managers/          # 管理器模块
│   │   ├── backgroundEffectManager.js  # 背景效果管理器
│   │   ├── sceneManager.js              # 场景管理器
│   │   └── uiManager.js                 # UI管理器
│   ├── scenes/            # 场景模块
│   │   ├── corridorScene.js        # 后室走廊场景
│   │   ├── seaScene.js              # 海场景（池核风格）
│   │   ├── flowerGalleryScene.js    # 花廊场景（梦核风格）
│   │   ├── stairsScene.js           # 楼梯场景（域限空间）
│   │   └── hospitalScene.js         # 医院场景（域限空间/后室风格）
│   ├── utils/             # 工具模块
│   │   └── eventBus.js              # 事件总线系统
│   └── main.js            # 主入口文件
├── index.html            # 主HTML文件
├── style.css             # 样式文件
└── STRUCTURE_CHANGE.md   # 本文件结构说明
```

## 模块说明

### 1. managers/ - 管理器模块

包含负责应用核心功能管理的类：

- **backgroundEffectManager.js**：管理背景效果，包括棋盘格背景、鼠标拖尾效果和网格形变。
- **sceneManager.js**：管理所有场景的加载、切换和卸载，处理场景间的过渡动画。
- **uiManager.js**：管理用户界面，包括菜单、侧边栏和游戏内UI元素。

### 2. scenes/ - 场景模块

每个场景作为一个独立的类实现，包含场景的创建和配置：

- **corridorScene.js**：后室走廊场景，包含无尽走廊和随机门元素。
- **seaScene.js**：海场景，具有池核风格，包含水池和水面效果。
- **flowerGalleryScene.js**：花廊场景，具有梦核风格，包含随机立体图形和彩色光源。
- **stairsScene.js**：楼梯场景，具有域限空间风格，包含交错楼梯结构。
- **hospitalScene.js**：医院场景，具有域限空间/后室风格，包含病房和闪烁灯光。

### 3. utils/ - 工具模块

包含通用工具函数和系统：

- **eventBus.js**：事件总线系统，用于组件间通信。

### 4. main.js - 主入口文件

应用的启动点，负责初始化所有模块，设置事件监听，并启动动画循环。

## 引用关系

```
index.html
└── 引入所有JavaScript文件
    ├── src/utils/eventBus.js
    ├── src/managers/backgroundEffectManager.js
    ├── src/managers/sceneManager.js
    ├── src/managers/uiManager.js
    ├── src/scenes/*.js
    └── src/main.js
        └── 初始化并协调所有模块
```

## 开发指南

### 添加新场景

1. 在 `src/scenes/` 目录下创建新的场景文件，例如 `newScene.js`
2. 创建场景类，实现 `createScene()` 方法
3. 在 `sceneManager.js` 中注册新场景
4. 在 `index.html` 的菜单中添加对应按钮

### 修改现有场景

1. 直接编辑对应场景文件
2. 场景配置在 `sceneManager.js` 的 `sceneConfigs` 数组中管理

### 添加新功能

1. 根据功能类型，选择合适的目录：
   - 管理类：`src/managers/`
   - 工具函数：`src/utils/`
   - 场景组件：`src/scenes/`
2. 在 `main.js` 中初始化新功能（如果需要）
3. 使用 `eventBus` 进行组件间通信

## 命名规范

- **文件名**：使用驼峰式命名，例如 `sceneManager.js`
- **类名**：使用 PascalCase，例如 `class SceneManager`
- **变量名**：使用 camelCase，例如 `sceneConfigs`
- **常量**：使用全大写，例如 `const MAX_SCENES = 5`
- **函数名**：使用 camelCase，例如 `initScenes()`

## 代码组织原则

1. **单一职责原则**：每个文件只负责一个功能模块
2. **高内聚低耦合**：模块内部高度内聚，模块间通过事件总线通信
3. **可扩展性**：便于添加新场景和功能
4. **可维护性**：清晰的代码结构和命名
5. **可读性**：适当的注释和文档

## 事件总线事件列表

| 事件名称 | 描述 | 数据结构 |
|---------|------|---------|
| `scene:switch` | 切换场景 | `{ sceneIndex: number }` |
| `menu:select` | 菜单选择 | `{ sceneType: string }` |
| `scene:switched` | 场景切换完成 | `{ sceneIndex: number, sceneName: string, sceneDescription: string }` |
| `scenes:configs` | 场景配置更新 | `{ configs: array }` |
| `mouse:effect:toggle` | 切换鼠标效果 | `{ enabled: boolean }` |
| `mouse:effect:size` | 更新鼠标效果大小 | `{ size: number }` |
| `audio:play` | 播放音效 | `{ type: string }` |

## 注意事项

1. 所有新文件必须遵循上述命名规范
2. 模块间通信优先使用事件总线
3. 场景类必须实现 `createScene()` 方法
4. 管理器类负责协调多个组件
5. 工具函数应该是通用的，不依赖于特定场景

## 部署说明

1. 保持 `index.html` 在根目录
2. 所有JavaScript文件必须在 `src/` 目录下
3. 确保 `index.html` 中正确引用了所有JavaScript文件
4. 样式文件 `style.css` 保持在根目录

## 后续优化建议

1. 实现场景预加载机制
2. 添加资源管理器，统一管理纹理和模型
3. 实现音效系统
4. 添加调试工具
5. 实现场景编辑器

## 总结

通过这次文件结构重组，项目代码更加清晰、模块化，便于维护和扩展。每个功能模块都有明确的职责，组件间通过事件总线通信，降低了耦合度。新的目录结构也更符合现代前端开发规范，便于团队协作。
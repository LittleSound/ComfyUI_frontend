# ComfyUI Extension System Refactor

## 概述

本次重构将 ComfyUI 的扩展系统从基于副作用导入的架构改造为声明式、可 tree shake 的架构，以提升应用启动性能和打包体积优化能力。

## 改动内容

### 1. 核心架构变更

#### 之前：副作用导入
```typescript
// src/extensions/core/index.ts
import './clipspace'
import './contextMenuFilter'
import './dynamicPrompts'
// ... 其他扩展
```

每个扩展文件在模块顶层立即执行注册：
```typescript
app.registerExtension({
  name: 'Comfy.SimpleTouchSupport',
  setup() { /* ... */ }
})
```

#### 之后：声明式导出
```typescript
// 扩展文件导出扩展对象
const extension: ComfyExtension = {
  name: 'Comfy.SimpleTouchSupport',
  setup() { /* ... */ }
}

export default extension
```

扩展通过清单文件注册：
```typescript
// src/extensions/core/extensionManifest.ts
export const coreExtensionManifest: ExtensionManifest = {
  version: '1.0.0',
  extensions: [
    {
      id: 'simpleTouchSupport',
      name: 'Comfy.SimpleTouchSupport',
      description: 'Provides basic touch interaction support',
      category: 'input',
      activationEvents: ['onStartup'],
      path: './simpleTouchSupport',
      defaultEnabled: true
    },
    // ... 其他扩展
  ]
}
```

### 2. 新增类型定义

创建了 `src/types/extensionManifest.ts`，定义了：
- `ActivationEvent`: 扩展激活事件类型
- `ExtensionCategory`: 扩展分类
- `ExtensionManifestEntry`: 扩展清单条目
- `ExtensionModule`: 扩展模块导出格式
- `ExtensionManifest`: 完整扩展清单

### 3. ExtensionService 增强

`src/services/extensionService.ts` 新增功能：
- `loadExtensionModule()`: 动态加载扩展模块
- `loadExtensionsByActivation()`: 根据激活事件加载扩展
- `loadExtensionById()`: 按 ID 加载特定扩展
- `loadExtensionsForNode()`: 为特定节点类型加载扩展
- `loadExtensionsForCommand()`: 为特定命令加载扩展

支持特性：
- ✅ 依赖管理（按依赖顺序加载）
- ✅ 重复加载检测
- ✅ 并发加载控制
- ✅ 扩展启用/禁用检查

### 4. 扩展迁移

所有核心扩展已从副作用导入模式迁移到声明式导出：

| 扩展文件 | 状态 | 备注 |
|---------|------|------|
| clipspace.ts | ✅ 已迁移 | 单一扩展 |
| contextMenuFilter.ts | ✅ 已迁移 | 单一扩展 |
| dynamicPrompts.ts | ✅ 已迁移 | 单一扩展 |
| editAttention.ts | ✅ 已迁移 | 单一扩展 |
| electronAdapter.ts | ✅ 已迁移 | 保留 IIFE 模式（异步初始化） |
| groupNode.ts | ✅ 已迁移 | 单一扩展 |
| groupNodeManage.ts | ✅ 已修复 | 工具类，非扩展文件 |
| groupOptions.ts | ✅ 已迁移 | 单一扩展 |
| load3d.ts | ✅ 已迁移 | 多扩展导出（4个） |
| maskeditor.ts | ✅ 已迁移 | 单一扩展 |
| nodeTemplates.ts | ✅ 已迁移 | 单一扩展 |
| noteNode.ts | ✅ 已迁移 | 单一扩展 |
| previewAny.ts | ✅ 已迁移 | 单一扩展 |
| rerouteNode.ts | ✅ 已迁移 | 单一扩展 |
| saveImageExtraOutput.ts | ✅ 已迁移 | 单一扩展 |
| saveMesh.ts | ✅ 已迁移 | 单一扩展 |
| simpleTouchSupport.ts | ✅ 已迁移 | 单一扩展 |
| slotDefaults.ts | ✅ 已迁移 | 单一扩展 |
| uploadAudio.ts | ✅ 已迁移 | 多扩展导出（2个） |
| uploadImage.ts | ✅ 已迁移 | 单一扩展 |
| webcamCapture.ts | ✅ 已迁移 | 单一扩展 |
| widgetInputs.ts | ✅ 已迁移 | 单一扩展 |

## 激活事件机制

扩展现在支持以下激活事件：

- `onStartup`: 应用启动时立即加载（默认）
- `onNode:NodeType`: 当特定节点类型被创建时加载
- `onCommand:CommandId`: 当特定命令被执行时加载
- `never`: 永不自动加载（需手动加载）

示例：
```typescript
{
  id: 'load3d',
  name: 'Comfy.Load3D',
  activationEvents: [
    'onStartup',
    'onNode:Load3D',
    'onNode:Load3DAnimation',
    'onNode:Preview3D',
    'onNode:Preview3DAnimation'
  ],
  path: './load3d'
}
```

## 扩展分类

扩展按以下类别组织：
- `core`: 核心系统功能
- `node`: 节点相关扩展
- `ui`: UI 增强
- `input`: 输入处理（触摸、键盘等）
- `media`: 媒体处理（3D、图片、音频等）
- `workflow`: 工作流管理

## Tree Shaking 支持

### 原理

1. **静态分析**: Vite/Rollup 可以静态分析动态 import() 语句
2. **按需加载**: 只有清单中声明的扩展会被动态导入
3. **死代码消除**: 未在清单中引用的扩展文件不会被打包

### 验证方法

```bash
# 构建生产版本
npm run build

# 分析打包体积
npm run build -- --mode analyze

# 检查特定扩展是否被打包
grep -r "extensionName" dist/
```

### 优化建议

1. **细化激活事件**: 将 `onStartup` 改为更具体的事件以延迟加载
2. **拆分大型扩展**: 将大型扩展拆分为多个小模块
3. **使用条件导入**: 根据运行环境动态决定加载哪些扩展

## 性能改进

### 启动性能

- **之前**: 所有扩展在启动时立即加载和注册
- **之后**: 只加载 `onStartup` 激活事件的扩展，其他延迟加载

### 打包体积

- **之前**: 所有扩展代码都被打包，即使未使用
- **之后**: 未使用的扩展可以被 tree shake

### 内存使用

- **之前**: 所有扩展代码常驻内存
- **之后**: 按需加载，减少初始内存占用

## 向后兼容性

### 第三方扩展

当前改造**仅影响核心扩展**。第三方扩展仍然可以使用旧的副作用导入模式：

```typescript
// 第三方扩展（仍然支持）
app.registerExtension({
  name: 'ThirdParty.Extension',
  // ...
})
```

`extensionService` 的 `loadExtensions()` 方法继续支持从 API 加载第三方扩展。

### 迁移路径

第三方扩展可以选择性地迁移到新模式：

1. 将 `app.registerExtension()` 改为导出扩展对象
2. 在扩展加载器中使用动态 import

## 开发指南

### 添加新的核心扩展

1. 创建扩展文件（使用声明式导出）：
```typescript
// src/extensions/core/myExtension.ts
import type { ComfyExtension } from '@/types/comfy'

const extension: ComfyExtension = {
  name: 'Comfy.MyExtension',
  // 实现扩展逻辑
}

export default extension
```

2. 在清单中注册：
```typescript
// src/extensions/core/extensionManifest.ts
{
  id: 'myExtension',
  name: 'Comfy.MyExtension',
  description: 'My awesome extension',
  category: 'ui',
  activationEvents: ['onStartup'],
  path: './myExtension',
  defaultEnabled: true
}
```

3. 扩展将自动被加载

### 多扩展文件

如果一个文件导出多个扩展，使用命名导出：
```typescript
const extension1: ComfyExtension = { /* ... */ }
const extension2: ComfyExtension = { /* ... */ }

export const extensions = [extension1, extension2]
```

`extensionService` 会自动识别 `default` 导出和 `extensions` 数组。

## 测试验证

- ✅ TypeScript 类型检查通过
- ✅ ESLint 检查通过  
- ✅ 所有扩展成功迁移
- ⏳ 单元测试（待添加）
- ⏳ 集成测试（待添加）
- ⏳ Tree shaking 验证（待手动测试）

## 下一步

1. **性能基准测试**: 测量启动时间和打包体积改进
2. **文档更新**: 更新扩展开发文档
3. **迁移指南**: 为第三方扩展开发者提供迁移指南
4. **增强激活事件**: 支持更多激活事件类型
5. **扩展管理 UI**: 允许用户动态启用/禁用扩展

## 参考资料

- [VSCode Extension API](https://code.visualstudio.com/api)
- [VSCode Extension Activation Events](https://code.visualstudio.com/api/references/activation-events)
- [Vite Tree Shaking](https://vitejs.dev/guide/features.html#build-optimizations)
- [Rollup Tree Shaking](https://rollupjs.org/introduction/#tree-shaking)

# Core Extension 动态加载功能验证指南

## 修改内容

本次修改将核心扩展从静态导入改为动态导入，使得禁用功能真正有效。

### 主要变更

1. **`src/extensions/core/index.ts`** - 完全重写

   - 创建了扩展名到文件路径的映射表 `EXTENSION_FILE_MAP`
   - 实现了 `loadCoreExtensions()` 函数，根据扩展状态动态加载
   - 处理特殊情况：
     - 一个文件包含多个扩展（如 `load3d.ts` 包含 4 个扩展）
     - ElectronAdapter 仅在 Electron 环境中加载
     - 禁用的扩展不会被加载

2. **测试覆盖**
   - 创建了 `tests-ui/tests/coreExtensionLoading.test.ts`
   - 验证了禁用/启用逻辑
   - 验证了多扩展文件处理
   - 验证了环境条件加载

## 验证步骤

### 1. 基本功能验证

#### 步骤 1: 禁用 Load3D 扩展

1. 启动应用：`npm run dev`
2. 打开设置面板
3. 导航到 Extensions 标签页
4. 找到 `Comfy.Load3D` 扩展并禁用它
5. 刷新页面

#### 步骤 2: 验证扩展功能不存在

打开浏览器控制台，应该看到类似的日志：

```
Skipping Comfy.Load3D: extension is disabled
Skipping Comfy.Load3DAnimation: extension is disabled
Skipping Comfy.Preview3D: extension is disabled
Skipping Comfy.Preview3DAnimation: extension is disabled
```

#### 步骤 3: 验证功能确实被移除

1. 在节点菜单中搜索 `Load3D` 节点
2. 如果成功禁用，相关节点应该不会出现
3. Settings 中的 Load3D 相关设置应该消失
4. Commands 中的 Load3D 相关命令应该消失

### 2. 单个扩展禁用验证

由于 `load3d.ts` 包含 4 个扩展，验证当只禁用其中一个时：

1. 只禁用 `Comfy.Load3D`
2. 其他三个扩展（`Comfy.Load3DAnimation`, `Comfy.Preview3D`, `Comfy.Preview3DAnimation`）应该仍然可用
3. 控制台应显示：
   ```
   Skipping Comfy.Load3D: extension is disabled
   Loaded core extension file: ./load3d
   ```

### 3. ElectronAdapter 环境验证

#### 在浏览器中（非 Electron）

1. 启动应用：`npm run dev`
2. 打开控制台
3. 应该看到：
   ```
   Skipping Comfy.ElectronAdapter: not running in Electron environment
   ```

#### 在 Electron 中

1. 如果在 Electron 环境中运行
2. ElectronAdapter 应该正常加载
3. Electron 特定的菜单项和功能应该可用

### 4. 性能验证

禁用不需要的扩展应该减少应用启动时间：

1. 禁用多个大型扩展（如 MaskEditor, Load3D）
2. 刷新页面
3. 检查网络标签页，确认禁用的扩展文件没有被加载
4. 应该观察到启动时间有所减少

## 测试命令

```bash
# 运行单元测试
npm run test:unit -- coreExtensionLoading.test.ts

# 运行类型检查
npm run typecheck

# 运行 lint
npm run lint
```

## 预期结果

### 成功指标

1. ✅ 禁用的扩展不会被加载（控制台日志显示 "Skipping"）
2. ✅ 禁用的扩展功能不存在（widgets, settings, commands 都不可用）
3. ✅ 启用的扩展正常工作
4. ✅ 一个文件包含多个扩展时，只要有一个启用就加载该文件
5. ✅ ElectronAdapter 只在 Electron 环境中加载
6. ✅ 所有测试通过
7. ✅ 类型检查和 lint 通过

### 失败指标（不应该出现）

1. ❌ 禁用扩展后，其功能仍然存在
2. ❌ 禁用扩展后，对应的文件仍然被加载
3. ❌ ElectronAdapter 在非 Electron 环境中加载
4. ❌ 应用启动失败或报错
5. ❌ 测试失败

## 回滚方案

如果需要回滚到静态导入：

```typescript
// src/extensions/core/index.ts
import './clipspace'
import './contextMenuFilter'
import './dynamicPrompts'
import './editAttention'
import './electronAdapter'
import './groupNode'
import './groupNodeManage'
import './groupOptions'
import './load3d'
import './maskeditor'
import './nodeTemplates'
import './noteNode'
import './previewAny'
import './rerouteNode'
import './saveImageExtraOutput'
import './saveMesh'
import './simpleTouchSupport'
import './slotDefaults'
import './uploadAudio'
import './uploadImage'
import './webcamCapture'
import './widgetInputs'
```

## 注意事项

1. **向后兼容**：所有现有的扩展注册流程保持不变
2. **性能优化**：禁用扩展可以减少应用启动时间
3. **模块化**：每个扩展文件现在可以独立加载/卸载
4. **环境感知**：ElectronAdapter 仅在需要时加载

## 相关文件

- `src/extensions/core/index.ts` - 主要修改文件
- `src/services/extensionService.ts` - 调用入口
- `src/stores/extensionStore.ts` - 扩展状态管理
- `tests-ui/tests/coreExtensionLoading.test.ts` - 单元测试

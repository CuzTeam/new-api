# Tasks

- [x] Task 1: 创建主题色派生算法工具函数
  - [x] SubTask 1.1: 创建 `web/default/src/lib/theme-color.ts`，实现 HSL → oklch 转换工具函数
  - [x] SubTask 1.2: 实现亮色模式下的颜色派生函数（从主色 hue 计算 `--primary`、`--primary-foreground`、`--ring` 等）
  - [x] SubTask 1.3: 实现暗色模式下的颜色派生函数
  - [x] SubTask 1.4: 导出 `generateThemeColors(hue: number)` 统一接口，返回亮色和暗色两套 CSS 变量值

- [x] Task 2: 创建 ThemeColorProvider 上下文
  - [x] SubTask 2.1: 创建 `web/default/src/context/theme-color-provider.tsx`
  - [x] SubTask 2.2: 实现 Cookie 读写逻辑（Cookie 名 `theme-color`，存储主色 hue 值）
  - [x] SubTask 2.3: 实现 `applyThemeColors` 函数，动态设置 `<html>` 元素上的 CSS 变量
  - [x] SubTask 2.4: 监听主题模式（dark/light）变化，自动切换衍生色板
  - [x] SubTask 2.5: 提供 `setHue`、`resetHue` 方法

- [x] Task 3: 创建主题色选择器 UI 组件
  - [x] SubTask 3.1: 创建 `web/default/src/components/theme-color-picker.tsx`，包含预设色板（8 个预设 hue 值）
  - [x] SubTask 3.2: 实现预设色块组件，当前选中色块有高亮边框
  - [x] SubTask 3.3: 集成原生 `<input type="color">` 作为自定义取色器
  - [x] SubTask 3.4: 添加"重置默认"按钮

- [x] Task 4: 集成到 ConfigDrawer 和应用入口
  - [x] SubTask 4.1: 在 ConfigDrawer 中 ThemeConfig 之后添加 ThemeColorConfig 区域
  - [x] SubTask 4.2: 在 `main.tsx` 中将 ThemeColorProvider 挂载到 Provider 树中（在 ThemeProvider 内部）

- [x] Task 5: 添加 i18n 翻译键
  - [x] SubTask 5.1: 在 `en.json` 中添加主题色相关翻译键
  - [x] SubTask 5.2: 在 `zh.json` 中添加对应中文翻译
  - [x] SubTask 5.3: 在 `fr.json`、`ru.json`、`ja.json`、`vi.json` 中添加翻译

# Task Dependencies

- [Task 2] depends on [Task 1] — ThemeColorProvider 需要使用颜色派生算法
- [Task 3] depends on [Task 2] — 主题色选择器需要调用 ThemeColorProvider 的方法
- [Task 4] depends on [Task 2, Task 3] — 集成需要 Provider 和 UI 组件都就绪
- [Task 5] 可与 Task 1-3 并行

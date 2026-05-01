# 自定义主题色功能 Spec

## Why

当前项目的 `--primary` 等核心颜色硬编码在 `theme.css` 中，用户无法自定义主色调。添加自定义主题色功能可以让用户根据个人偏好或品牌需求调整界面主色，提升个性化体验。

## What Changes

- 新增 `ThemeColorProvider` 上下文，管理用户选择的主题色，动态覆盖 CSS 变量
- 新增颜色选择器组件（预设色板 + 自定义取色），集成到 ConfigDrawer 外观配置面板
- 新增主题色派生算法：从用户选择的主色自动计算 `--primary`、`--primary-foreground`、`--ring` 等衍生色（亮色/暗色模式分别计算）
- 使用 Cookie 持久化主题色偏好（与现有主题模式、布局等偏好一致）
- 新增 i18n 翻译键

## Impact

- Affected specs: 主题系统、外观配置
- Affected code:
  - `web/default/src/styles/theme.css` — 无需修改，CSS 变量通过 JS 动态覆盖
  - `web/default/src/context/theme-provider.tsx` — 集成 ThemeColorProvider
  - `web/default/src/components/config-drawer.tsx` — 新增主题色配置区域
  - `web/default/src/main.tsx` — 挂载 ThemeColorProvider
  - `web/default/src/i18n/locales/*.json` — 新增翻译键

## ADDED Requirements

### Requirement: 主题色选择器

系统 SHALL 在 ConfigDrawer 外观配置面板中提供主题色选择器，包含预设色板和自定义取色两种方式。

#### Scenario: 用户选择预设主题色
- **WHEN** 用户在 ConfigDrawer 中点击某个预设色块
- **THEN** 界面立即应用该主题色，`--primary`、`--primary-foreground`、`--ring` 等 CSS 变量被动态更新
- **AND** 该偏好被持久化到 Cookie

#### Scenario: 用户使用自定义取色器
- **WHEN** 用户通过颜色选择器选取一个自定义颜色
- **THEN** 界面立即应用该主题色，衍生色自动计算并应用
- **AND** 该偏好被持久化到 Cookie

#### Scenario: 用户重置为默认主题色
- **WHEN** 用户点击"重置默认"按钮
- **THEN** 所有主题色 CSS 变量恢复为 `theme.css` 中的默认值
- **AND** Cookie 中的主题色偏好被清除

### Requirement: 主题色派生算法

系统 SHALL 根据用户选择的主色（HSL 格式），自动计算亮色和暗色模式下的完整衍生色板。

#### Scenario: 亮色模式下的颜色派生
- **WHEN** 用户选择一个主色且当前为亮色模式
- **THEN** `--primary` 使用主色的深色版本（降低亮度）
- **AND** `--primary-foreground` 使用高亮度对比色（确保文字可读）
- **AND** `--ring` 使用主色的中等亮度版本
- **AND** `--sidebar-primary`、`--sidebar-primary-foreground` 跟随 `--primary` 变化

#### Scenario: 暗色模式下的颜色派生
- **WHEN** 用户选择一个主色且当前为暗色模式
- **THEN** `--primary` 使用主色的亮色版本（提高亮度）
- **AND** `--primary-foreground` 使用深色对比色
- **AND** `--ring` 使用主色的中等亮度版本

#### Scenario: 主题模式切换时颜色自动适配
- **WHEN** 用户从亮色切换到暗色模式（或反之）
- **THEN** 自定义主题色的衍生色板自动切换为对应模式的版本

### Requirement: 主题色持久化

系统 SHALL 使用 Cookie 持久化用户选择的主题色偏好。

#### Scenario: 页面刷新后恢复主题色
- **WHEN** 用户设置了自定义主题色后刷新页面
- **THEN** 页面加载时从 Cookie 读取主题色偏好并立即应用
- **AND** 在 CSS 渲染前应用，避免闪烁

#### Scenario: Cookie 不存在时使用默认色
- **WHEN** 页面加载时 Cookie 中无主题色偏好
- **THEN** 使用 `theme.css` 中定义的默认颜色

### Requirement: 预设主题色方案

系统 SHALL 提供一组预设主题色方案供用户快速选择。

#### Scenario: 预设色板展示
- **WHEN** 用户打开 ConfigDrawer 的主题色配置区域
- **THEN** 显示 6-8 个预设色块，每个色块展示该主题色在当前模式下的 primary 颜色
- **AND** 当前选中的色块有视觉标识（如边框高亮）

### Requirement: i18n 支持

系统 SHALL 为主题色功能的所有用户可见文本提供 i18n 翻译。

#### Scenario: 多语言环境下的主题色配置
- **WHEN** 用户切换语言
- **THEN** 主题色配置区域的标签、提示文本、按钮文案均正确翻译

## MODIFIED Requirements

### Requirement: ConfigDrawer 外观配置面板

ConfigDrawer 外观配置面板 SHALL 新增"主题色"配置区域，位于主题模式（ThemeConfig）之后。

- 新增 ThemeColorConfig 组件，包含预设色板和自定义取色器
- 布局顺序：ThemeConfig → ThemeColorConfig → SidebarConfig → LayoutConfig → DirConfig

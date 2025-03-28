# 吉卜力风格图像生成器

这是一个基于 Next.js、TypeScript 和 Tailwind CSS 构建的吉卜力风格 AI 图像生成器网站。灵感来源于 Raphael.app 的设计风格。

## 功能

- 宫崎骏(吉卜力)风格的 AI 图像生成
- 响应式设计，适配各种设备
- 中英文支持
- 各种自定义选项（比例、风格、颜色等）

## 技术栈

- Next.js 14
- TypeScript
- Tailwind CSS
- React
- Framer Motion

## 开始使用

### 前提条件

- Node.js 18.0 或更高版本
- pnpm（推荐）或 npm 或 yarn

### 安装

```bash
# 安装依赖
pnpm install
```

### 开发

```bash
# 运行开发服务器
pnpm dev
```

应用程序将在 http://localhost:3000 上运行

### 构建

```bash
# 构建生产版本
pnpm build
```

## 目录结构

```
/
├── app/                  # Next.js App Router 目录
├── components/           # React 组件
├── public/               # 静态资源
│   └── examples/         # 示例图片
├── styles/               # 全局样式
```

## 许可证

MIT


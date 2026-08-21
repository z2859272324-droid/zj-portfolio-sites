# 我的个人网站

关于建筑设计、AIGC、数据洞察与摄影个人作品集。使用 React、Vite 与 TypeScript 构建，适配桌面端和移动端。

## 运行

```bash
pnpm install
pnpm run dev
```

生产构建：

```bash
pnpm run build
```

## 更新摄影与建筑素材

当前真实素材由 `scripts/import_portfolio_assets.py` 统一导入和压缩：

```bash
python scripts/import_portfolio_assets.py
```

- `摄影/` 中的所有 JPG 会等量分配到四行滚动画廊，统一显示宽度并保持原始比例，不会拉伸。
- `摄影/首页视频.mp4` 会更新为 Hero 背景视频，页面中始终静音自动播放。
- `建筑/` 中每个一级子文件夹对应一张项目卡，文件夹名称即项目标题。
- 子文件夹内按文件名排序，第一张图为主图，其他图片通过卡片左右箭头查看。
- 自动生成的数据位于 `src/data/media.generated.ts`，网页优化素材位于 `public/assets/gallery/` 与 `public/assets/architecture/`。
- 建筑与 AIGC 卡片支持本地开发环境中的站长编辑模式，可新增、删除、改标题与上传图片。
- 编辑入口只在 `pnpm run dev` 的开发环境显示；正式构建中访客看不到编辑按钮，也无法修改内容。
- 浏览器内编辑内容保存在当前站点来源对应的 `IndexedDB` 中，不会自动同步到部署域名。
- 在站长工作台点击“导出配置”，再执行 `node scripts/import_aigc_export.mjs <导出文件路径>`，即可把 AIGC 标题和图片固化到 `src/data/aigc.generated.ts` 与 `public/assets/aigc/`。

## 画廊展示规则

四行画廊使用等宽、自然高度布局：16:9 图片显示为横卡，9:16 图片显示为竖卡。图片只进行等比缩放，不会被拉伸或强制裁成相同比例。

## 联系方式

联系方式在 `src/App.tsx` 的 `Contact` 组件中。当前仅展示邮箱与电话。

## About 图片

页面直接使用 `DSC00387-1.jpg` 的网页优化副本 `public/assets/profile/dsc00387-original.webp`，不进行生成式重绘。

## 媒体说明

- Hero 视频：用户提供的 `首页视频.mp4`。
- 建筑项目图片：来自用户提供的建筑作品素材文件夹。
- About 图片：直接使用用户摄影原图 `DSC00387-1.jpg` 的等比压缩副本。

## Cloudflare Pages 部署

在 Cloudflare Pages 中连接本仓库并使用以下设置：

- Framework preset：`Vite`
- Build command：`pnpm run build`
- Build output directory：`dist`
- Node.js version：`20` 或更高

项目是纯前端单页网站，不需要服务器或数据库。部署完成后可直接绑定自定义域名。

# GW2 Raid Bounties — 激战2日常十人本查询

无需服务器、数据库、构建工具的纯静态网站：两张页面、4项每日团队悬赏、未来7天预告与完整12天循环表。

## 文件结构

```text
gw2-daily-raids/
├── index.html                首页：今日4个 Boss 和未来7天
├── rotation.html             第二页：完整12天循环表
├── assets/
│   ├── css/styles.css        全站样式，桌面/手机适配
│   ├── js/data.js            36项Boss、所属副本、4组轮换序列
│   ├── js/rotation.js        UTC日期、12天循环、每日刷新计算
│   ├── js/app.js             两页UI、7天展开、刷新倒计时
│   └── favicon.svg           站点图标
├── tests/test-rotation.cjs   自动化测试
├── .nojekyll                 禁用Jekyll处理
└── README.md
```

## 如何在电脑上预览

- **最简单**：双击 `index.html`，因为使用普通 `<script defer>`，不会遇到 ES Modules 在 `file://` 上的跨域问题。
- 或者使用 Python 启动本地服务：进入本目录执行 `python -m http.server 8000`，浏览器打开 http://localhost:8000/。
- 点击页面顶部“12天循环表”可进入第二页。

## 如何上传 GitHub Pages（不需要本地安装 Node）

1. GitHub 新建一个 **Public** 仓库，例如 `gw2-daily-raids`。
2. 解压这个项目包，将 `index.html`、`rotation.html`、`assets` 文件夹等**直接放在仓库根目录**。不要多套一层 `gw2-daily-raids/` 目录。
3. 进入仓库 `Settings` → `Pages`。
4. 在 `Build and deployment` 下面选择 `Deploy from a branch`；分支选择 `main`，目录选 `/(root)`，保存。
5. GitHub Pages 发布后，访问 `https://你的用户名.github.io/gw2-daily-raids/`。

页面使用相对资源路径，因此不要求独立域名，项目站点即可正常使用。

## 日期与数据逻辑

- 以 **2026-10-15 UTC = 周期第1天** 作为锚点。
- 每天 **UTC 00:00** 刷新（北京时间08:00；日本时间09:00），不按设备本地午夜刷新。
- 每天第1/4组各在6项中轮换，第2/3组各在12项中轮换；完整轮换每12天重复。
- 页面每秒重新读取访客设备时间；跨UTC日时立即重新渲染，切换回标签页也会校正。
- 网站完全离线计算，不请求游戏API；**依赖访客设备时间准确**。
- 数据来自玩家社区维护的 [Guild Wars 2 Wiki：Daily Raid Bounties](https://wiki.guildwars2.com/wiki/Daily_Raid_Bounties)。数据基线于 2026-10-21 核对。
- 如果未来游戏更新更改Boss池或轮换顺序，需要手动更新 `assets/js/data.js` 的条目和4组顺序（必要时调整锚点及周期算法）。

## 运行测试（可选）

本项目正常浏览和部署**不需要 Node.js**。如果你的电脑装有 Node.js 18+，可在项目根目录执行：

```sh
node --test tests/test-rotation.cjs tests/test-homepage.cjs
```

涵盖36项数据完整性、2026年10月15/20/21/26/27日的轮换、跨日UTC、负数日期、12天重复等。

## 可自由编辑

- 改网站颜色和排版：`assets/css/styles.css` 开头的 CSS 变量。
- 改Boss名称/副本名：`assets/js/data.js` 的 `ENCOUNTERS`。
- 改轮换顺序：`assets/js/data.js` 的 `GROUPS`。
- 改网站标题：`index.html`、`rotation.html`。

此站点是非官方粉丝工具，与 ArenaNet 无关。Guild Wars、Guild Wars 2 相关名称归其权利人所有。

## 当前界面

首页采用简洁的深色列表，直接展示当天四组 Boss 与所属副本；点击“一键复制今日日常”可复制日期、全部 Boss 和所属副本，方便粘贴分享。浏览器不支持或禁止自动复制时，会显示可手动复制的完整文本。复制时重新确认 UTC 日期，避免跨日后复制昨日目标。

未来七天默认折叠，完整12天循环表仍可通过顶部导航查看。首页样式位于 `assets/css/today.css`，循环表样式位于 `assets/css/styles.css`。

所有资源均在本地，无需安装依赖、连接外部字体服务或构建。Wiki 链接需要联网。

验证：轮换计算、首页渲染、七天展开收起、复制成功、复制被拒降级、旧浏览器降级、跨UTC日复制、循环表渲染测试及 JavaScript 语法检查通过。未完成真实浏览器视觉与系统剪贴板验证。

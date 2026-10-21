# 名称与来源

本次修正优先依据可检索的 Wiki 中英对照及游戏文本对照表。具体对应关系、来源链接和修改字段保存在 [translation-sources.json](translation-sources.json)。

## 核验限制

尝试访问 GW2 英文 Wiki 及用户提供的镜像 `https://wiki.wishingstar.top/wiki`，相关条目在当前工具中返回 403 或无法读取；镜像的 Spirit Shard 搜索索引可以读取，但不提供本站所需的中文名称。没有将未读到的镜像页面标记为已核验。

英文实体身份与副本归属以原始英文数据及英文 Wiki 条目为准；中文采用中文 Wiki 的双语条目、游戏更新文本及 Project:Trans 游戏文本对照表。社区 Wiki 的记录不等于本项目已独立验证全部官方客户端译文。

## 已修正的差异

- `Shiverpeaks Pass` → **席瓦雪山小径**（[来源](https://gw2.huijiwiki.com/wiki/Project:Trans/Sector)）
- `Voice of the Fallen and Claw of the Fallen` → **亡者之音和亡者之爪**（[来源](https://gw2.huijiwiki.com/wiki/大型地下城)）
- `Stronghold of the Faithful` → **信仰要塞**（[来源](https://gw2.huijiwiki.com/wiki/Project:Trans/NamedText)）
- `Salvation Pass` → **救赎小道**（[来源](https://gw2.huijiwiki.com/wiki/Project:Trans/NamedText)）
- `Mount Balrior` → **巴里尔山**（[来源](https://gw2.huijiwiki.com/wiki/蒸汽尖啸者厄拉)）
- `Cosmic Observatory` → **宇宙观测台**（[来源](https://gw2.huijiwiki.com/wiki/宇宙观测台)）
- `Temple of Febe` → **菲勃神殿**（[来源](https://gw2.huijiwiki.com/wiki/缩写)）
- `Xunlai Jade Junkyard` → **桑莱废料场**（[来源](https://gw2.huijiwiki.com/wiki/游戏更新/2022-5-13)）
- `Old Lion's Court` → **旧雄狮广场**（[来源](https://gw2.huijiwiki.com/wiki/游戏更新/2022-11-11)）
- `Kela, Seneschal of Waves` → **海浪总管齐拉**（[来源](https://gw2.huijiwiki.com/wiki/海浪总管齐拉)）
- `Echo of Scarlet Briar` → **绯红刺荆的回响**（[来源](https://gw2.huijiwiki.com/wiki/游戏更新/2022-5-13)）
- `Twin Largos` → **孪生蝶翼人**（[来源](https://gw2.huijiwiki.com/index.php?title=属性:Has_name_en&offset=41015&limit=100)）
- `Spirit Vale` → **灵魂山谷**（[来源](https://gw2.huijiwiki.com/wiki/灵魂山谷)）
- `Mythwright Gambit` → **秘法对决**（[来源](https://gw2.huijiwiki.com/wiki/秘法对决)）
- `Legendary Icebrood Construct` → **传奇冰巢构造体**（[来源](https://gw2.huijiwiki.com/wiki/大型地下城)）
- `Guardian's Glade` → **守护者林地**（[来源](https://gw2.huijiwiki.com/wiki/海浪总管齐拉)）
- `Harvest Temple` → **丰收神殿**（[来源](https://gw2.huijiwiki.com/wiki/丰收神殿)）
- `Cold War` → **冷战**（[来源](https://gw2.huijiwiki.com/wiki/Project:Trans/NamedText)）

## 尚未确认与原有参考

- `Watchknight Triumvirate` 未找到足够可靠的中文集合名称对应，撤回“守望骑士三巨头”猜译，中文模式暂时保留英文。其副本已修正为“旧雄狮广场”。
- 其余未出现冲突的 Boss 名称继续采用用户提供的 `gw2_database.json` v1.3.0，不能表述为本次已逐项从英文 Wiki 取得官方中文名。
- NPC 后缀不显示，Q1/Q2 编号保留；双 Boss 使用各自名称组合。
- 新条目中文为空时回退英文，避免空白或未经核实的猜译。

显示、未来七天、循环表和一键复制均使用 `assets/js/encounters-zh.js` 这一个名称来源。

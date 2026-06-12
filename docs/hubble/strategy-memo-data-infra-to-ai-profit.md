# Internal Strategy Memo: From Data Infra to AI-Driven Profit

**To:** Core Team  
**From:** Morris  
**Date:** 2025-12-24 Strategy Planning  
**Subject:** 从数据基建到 AI 盈利层 (From Data Infra to AI-Driven Profit)

> Purpose: This memo captures a strategic thesis for Hubble's future direction. It can be reused as source material for product strategy pages, founder-style essays, portfolio case studies, and roadmap narratives.

## 1. 长期来看，我们到底在帮用户解决什么问题？

过去我们认为自己在解决“获取数据难”的问题，所以我们做了 Kafka 流，做了 API。但数据的本质是原材料。除了极少数像 Allium 服务的企业级客户，为了合规和审计而需要原始数据，绝大多数 Crypto 用户，无论是散户还是机构，获取数据的目的都非常直接：ROI。

我们是在赚客户的成本，而不是帮客户赚增量。卖数据是“卖铲子”。如果用户或者 B 端客户赚不到钱，他们就会抱怨铲子贵。目前链上开发者大部分赚不到钱，所以做 Infra 的 churn rate 很高。

绝大多数 B 端客户也不知道自己到底想要什么数据。他们也在找自己的用户愿意为什么产品付费。类似 Questflow 所呈现的 Builders - Agents - Users 三层关系：只有 Users 愿意付费，Agents 调用量才会高，Builders 才会赚钱。

如果客户能说出非常明确的需求，他们通常也有能力找到平替竞品，或者已经在用平替竞品，把我们当作备选。在 AI 辅助下，让实习生调研几天，就能大概知道 API 和 Stream 的市场价格。

我们的 vision 应该从“提供数据基础设施”升级为：

> 在数据和 AI 的协助下，直接让用户赚到钱。

如果不能直接交付“赚钱的能力”，我们就永远只能在低毛利的红海里卷价格。

可以参考 Zeabur 的转型路径：

- Zeabur 一开始做 Vercel fork，也就是云托管，吸引的都是不想付费的白嫖用户。
- 后来他们发现用户真正抱怨的是运维太难，于是转型做 Cursor for DevOps，用 AI 帮用户搞定复杂的服务器配置。
- 对散户来说，他们也在抱怨数据太多、分析太累、交易太慢。他们不想写 SQL，不想看 K 线。

我们现有的数据能力，包括 Kafka 流和打包数据，不应该作为商品直接售卖，而应该作为燃料，供给给我们的 AI Agent。

## 2. 市场现状复盘：基础设施的陷阱

### 2.1 AWS 模式：QuickNode / Helius

这类公司在做“水电煤”。竞争优势是节点稳定性和低延迟。

Helius 必须深耕 Solana 的极度垂直领域才能存活。因为 Solana 数据量太大、太难处理，通用型厂商如 QuickNode 或 Alchemy 做得不好，给 Helius 留出了垂直领域专家的生态位，例如 DAS API、Compression 等独家能力。

常见用户抱怨：

- Pricing spikes: 代码写得不好，例如死循环轮询，可能一夜之间欠几千美元。
- Shared node latency: 共享节点在高峰期，例如 Meme 季，会卡顿，迫使用户购买昂贵的独享节点。

判断：

- QuickNode 融资额约 100M 美元，2017 年创立。
- Helius 融资额约 34.45M 美元，2022 年创立。
- AWS 模式是否适合我们？我们是否有足够的时间成本和资金去自建、维护大量归档节点和服务器资源？

### 2.2 2C 社区模式：Dune

Dune 的 PMF 可以分三类：

- 分析师 / Creators: 建立个人品牌，找工作，接外包。Dune 是他们的简历。
- 散户 / VC / Consumers: 寻找 Alpha 和验证叙事。
- 项目方: 免费的透明看板，用于向社区展示 traction。

商业模式：

- SaaS subscription: Plus / Premium 主要用于解除限制，例如 CSV 导出行数、私有查询、更快执行速度。
- Enterprise API: 现在的大头，向机构售卖数据和品牌溢价。

技术 edge：

- Spellbook: 社区维护的 ETL，让社区帮平台清洗数据，例如把 OpenSea 和 Blur 的数据统一成 NFT Trades，低成本维护大量协议解析。
- DuneSQL: 基于 Trino / DuckDB，能够处理大规模跨链数据 join，这是普通 Postgres 难以做到的。

常见用户抱怨：

- Credits system confusing / expensive: 计费逻辑复杂，用户仍会觉得贵。
- API pricing shock: 开发者原本用 Dune 做后端，API 通过 credit 计费后成本爆炸，被迫迁移到自建节点或 Goldsky。

判断：

绝大多数人是白嫖用户，只有极少数 Creator 会付费。Dashboard 只能解决“看”的问题，解决不了“做”的问题。用户看懂了数据，还需要去别的地方交易。

### 2.3 Palantir 模式：Allium / Goldsky

#### Allium

Allium 的核心客户是 Visa、Stripe、Uniswap Foundation，以及四大会计事务所，主要服务审计和合规场景。

商业模式：

- 高客单价 B2B 合同。
- 不做小散生意，直接切入巨头预算。

技术 edge：

- Standardization: Schema 清洗非常干净，例如把所有链的 stablecoin transfer 统一格式，适合直接进入企业 ERP 或数仓。
- Snowflake Data Shares: 不通过 API 传输，而是在 Snowflake 云端共享数据，降低传输和运维成本。

常见用户抱怨：

- Sales gated: 没有自助服务，想试用得先和销售沟通，小团队用不起。

判断：

这是咨询和企业销售生意，依赖强大的销售团队和定制化服务，不具备典型互联网产品的指数级扩张基因。

#### Goldsky

Goldsky 是 Polymarket 官方数据供应商。

PMF：

- 高性能索引，服务不想维护 The Graph 节点但又需要 Subgraph 数据结构的项目方。
- Mirror 是核心功能，把链上数据实时推送到客户自己的数据库，例如 Postgres / ClickHouse。

Polymarket 在通过 Goldsky 重构架构前面临两个核心挑战：

1. 数据不可靠：旧 Hosted Subgraph 经常出现“假死”状态，表面同步正常，但返回不一致数据或完全停滞，且缺乏调试手段。
2. 链上/链下数据割裂：用户资料在 AWS RDS Postgres 中，交易数据在链上。要把用户和投注行为对应起来，工程团队需要自建 ETL，并处理 reorg 与多 RPC 节点负载均衡。

Mirror 重构后的价值：

- 不是单纯提供 API 让用户拉取，而是将清洗后的链上数据实时写入 Polymarket 原有 Amazon RDS 数据库。
- Polymarket 后端可以直接在本地数据库中用 SQL 将 on-chain bets 和 off-chain usernames 做 join。
- 实时排行榜、持仓大户分析等前端功能底层依赖这种混合数据的实时拼接能力。

技术 edge：

- 智能 RPC 处理，自动处理链上 reorg 和 RPC 故障，达到高 uptime。
- Turbo Pipelines，支持用真实数据获得接近本地开发/测试的体验。

常见用户抱怨：

- 配置复杂度：对非硬核工程团队来说，配置稳定 pipeline 的门槛仍然不低。

### 2.4 平替模式：Bitquery

Bitquery 由俄罗斯团队开发，创始人在欧洲，团队 remote，融资约 8.5M 美元，2018 年创立，前身是 ETH 数据分析网站。

PMF：

- 支持大量小众链。
- 支持复杂资金流向追踪。
- Protobuf 是成功的低延迟 Stream 产品。
- 解析 API 数量多，价格便宜。

常见用户抱怨：

- UI/UX 比较陈旧。
- 文档有时跟不上，更像黑客工具，而不是现代开发者产品。
- 早期数据准确性曾被 memeradar 等用户抱怨。

### 2.5 Wikipedia 模式：The Graph

PMF：

- 适合需要宣称“我们没有中心化服务器”的协议。

常见用户抱怨：

- 不可靠：索引节点经常因为缺乏激励而断同步。
- 索引慢：实际试用中，Polygon 节点索引速度很慢。

### 2.6 The Money Pivot 模式：Ave / GMGN / Axiom

这是最接近“让用户赚钱”的领域。本质上，它们是披着交易外衣的数据公司。

GMGN / Ave.ai / Axiom 的 PMF：

- 核心壁垒是数据标签化。
- 它们把复杂链上交易解析为 KOL 建仓、老鼠仓、清洗交易等用户能理解的信号。
- 这种标签很难逆向，也是仿盘最难复刻的能力。
- 很多 B 端客户也找我们要过这种标签数据。

用户并不在乎“区块链数据”，用户在乎的是：

- 这个币是不是 honeypot？
- Smart Money 在买什么？
- 庄家是不是在出货？

GMGN 其实是一家拥有顶级数据清洗能力的 AI 公司。它没有把 Smart Money API 卖给用户，因为用户不会买，也不知道怎么用，而是把数据封装成 Follow Smart Money Buy 按钮。

核心 insight：

> 数据的价值随着封装程度的提高而指数级上升。

价值层级：

1. Raw: Kafka Stream -> 很少有人直接买。
2. API: GetBalance() -> 主要是开发者买。
3. Information: Dune Dashboard -> 分析师看。
4. Actionable Insight: Smart Money 刚买了 PEPE -> 交易员看。
5. Execution: 帮我跟单 Smart Money -> 用户愿意付手续费。

这也是为什么 Hyperliquid / Polymarket 相关产品的终局形态往往会走向跟单、找内幕、自动化交易或信号执行。

商业模式：

- 交易抽水，例如 1% 交易手续费。
- 广告与通道费，例如项目方为热门榜单付费。
- 收入会随 memecoin 热度波动。

常见用户抱怨：

- Sniper bots front-run me: 平台抢跑机器人。
- Laggy charts: 极端行情下 K 线更新不及时。
- 各类 bug 和卡顿。

## 3. 真正捕获价值的玩家不是纯卖 API 的

纯卖数据，也就是 Kafka / API，是一条很难的路。

市场上真正捕获价值的玩家，通常不是把数据作为原材料出售，而是把数据封装进更靠近用户结果的产品：

- 企业客户要的是可靠、标准化、可审计的数据工作流。
- 交易用户要的是更快发现信号、更低执行摩擦、更高 ROI。
- 开发者要的是少维护、更稳定、更接近业务目标的基础设施。

因此，Hubble 的路线不应该只停留在“支持多少条链”“API 延迟降低多少毫秒”“一年卖多少 API / Stream 订阅费”。

真正的问题应该是：

> 我们能构建多少个能帮用户赚钱的 Agent？

## 4. AI Agent & Trading

具体构想：

- 不要只给用户看 Dashboard。Dashboard 需要用户自己理解、判断、执行。
- 做 Agent Marketplace，提供基于 Hubble 独家数据的 AI Agent。

示例 Agent：

- Hyperliquid 跟单 Agent：基于标签库数据，监控 100 个高胜率钱包并自动跟随。
- Polymarket 内幕地址分析 Agent：识别潜在信息优势钱包与异常下注行为。
- 风控 Agent：监控高风险钱包、资金流、风险标签，并自动提醒或拦截。

商业模式：

- 用户不需要理解数据订阅费。
- 用户不需要写 SQL，也不需要看 API 文档。
- 用户只需要让 AI 看着数据帮他们赚钱。
- 我们可以从 Agent 帮用户赚到的钱中抽水。

### 4.1 The Edge

为什么别人做不了？

AI Agent 容易做，但高质量、低延迟、清洗过的数据很难做。

这正是 Hubble 现有技术积累发挥作用的地方。原本计划卖给 B 端的数据能力，可以变成 AI Agent 的核心燃料。

## 5. Summary

未来的 Roadmap 不再只是关于：

- 支持多少条链。
- API 延迟降低多少毫秒。
- API / Stream 订阅费一年能开多少单。

未来的 Roadmap 应该是关于：

> 我们要构建多少个能帮用户赚钱的 Agent？

Old way:

> 给用户铲子，祝他们好运。

New way:

> 给用户一支挖掘机队，然后从挖出来的价值中分成。


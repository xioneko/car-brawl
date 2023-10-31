# Car Brawl

🚧 **Working in progress**

## 📖 Learning

<ul>
  <li><img src="https://i.ibb.co/Qcs9FJD/js.png" alt="js" border="0"><a href="https://zh.javascript.info/"> JavaScript</a></li>
  <li><img src="https://www.typescriptlang.org/favicon-32x32.png?v=8944a05a8b601855de116c8a56d3b3ae" width=15><a href="https://www.typescriptlang.org/docs/"> TypeScript</a></li>
  <li><img src="https://cn.vuejs.org/logo.svg" width=15> <a href='https://cn.vuejs.org/guide/introduction.html'>Vue</a></li>
  <li><img src="https://img.icons8.com/?size=256&id=nvrsJYs7j9Vb&format=png" width=15> <a href="https://nuxt.com/docs/getting-started/introduction">Nuxt</a></li>
  <li><img width=15 src="https://s2.coinmarketcap.com/static/img/coins/64x64/2021.png"/><a href="https://github.com/JoshOrndorff/LearnRholangByExample/blob/master/README_CN.md"> Rholang</a></li>
</ul>

<details>
  <summary>搭建本地 Rholang 执行环境</summary>
  <div>
    <h4>方法一：</h4>
      <ol>
        <li>在 Windows 上安装 <a href="https://docs.docker.com/desktop/install/windows-install/">Docker</a> 并打开</li>
        <li>打开 VS Code 安装 Rholang 扩展</li>
        <li>在扩展设置中打开 Enable Docker，在 Rnode Docker Image 中输入 <code>rchain/rnode:v0.12.8</code></li>
        <li>打开 .rho 文件，Ctrl+S 保存，便可以在输出面板 [Rholang] 中看到执行结果
      </ol>
  </div>
  <div>
    <h4>方法二：</h4>
      <ol>
        <li>在 Windows 上安装 <a href="https://docs.docker.com/desktop/install/windows-install/">Docker</a> 并打开</li>
        <li>拉取 rnode 镜像 <code>docker pull rchain/rnode:v0.12.8</code></li>
        <li>创建 docker network <code>docker network create rnode-net</code></li>
        <li>运行 rnode 节点 <code>docker run -u root -it --rm --network rnode-net --name rnode -v "%cd%/":/data rchain/rnode:v0.12.8 run -s</code>，在当前终端中会显示 rnode 日志</li>
        <li>新建一个终端，创建命令别名 <code>doskey rnode=docker exec rnode /opt/docker/bin/rnode $*</code></li>
        <li>执行 .rho 文件 <code>rnode eval "file_path"</code> (路径格式：假如当前目录有个 hello.rho 文件，那么应该执行 <code>rnode eval /data/hello.rho</code>)</li>
        <li>在显示 rnode 日志的终端中可以看到执行结果</li>
      </ol>
    注意：<code>docker run</code> 命令创建的容器是一次性的，在运行命令的终端中按下 <code>Ctrl+C</code> 可以停止并删除容器。需要再次运行 rnode 时，先打开 Docker Desktop 应用，然后从第 4 步骤开始即可
  </div>
</details>

<details>
  <summary>了解 Deploy 和 Propose</summary>
  <ul>
    <li>可以将 Rholang 写的代码程序部署 (Deploy) 到 RChain 上运行</li>
    <li>要想执行 Deploy，部署者需要对部署的内容进行签名，且必须为所消耗的计算资源支付一定的费用</li>
    <li>任何拥有有效身份信息的人都可以成为部署者，这个身份信息一般指一对私钥和公钥</li>
    <li>在执行 Deploy 后，代码程序还没有被真正放到 RChain 区块链的区块上</li>
    <li>还需要一个验证者 (Validator) 节点 (RNode) 验证其有效性，然后由这个节点执行区块提议 (Propose)</li>
    <li>节点网络上的其他验证者接收到这个提议并达成共识之后，新区块才会被创建，代码程序才会被有效执行</li>
  <ul>
</details>

<details>
  <summary>了解 Rchain 智能合约</summary>
  <ul>
    <li>部署到区块上的 Rholang 代码程序可以定义合约 (contract)，rchain 的 contract 可以理解成一个“函数”</li>
    <li>在 contract 中可以定义和操纵表示状态的“变量”，可以创建子“函数”并根据条件执行</li>
    <li>部署的 contract 是公开的，任何部署者只需要获得 contract name 就可以在部署的代码中执行这个合约
  <ul>
</details>

## 💡 Overall Design

### Game

-   游戏过程中服务端与客户端之间的通信建立在 [Socket.io](https://socket.io/) 上，服务端主要负责计算小车、子弹的状态并同步到客户端，客户端主要负责渲染游戏画面并捕获玩家的按键控制信息
-   游戏包含三种模式，竞技 (Competitive)、娱乐 (Fun)、单人 (Single)
    ||竞技|娱乐|单人|
    |-|-|-|-|
    |玩家数量|4|—|1|
    |限时|8 min|—|—|
    |入场券|需要|—|—|
    |奖励|有|—|—|

-   一种游戏模式对应服务端一种 Room 实现，当 Room 中的玩家数量达到最大限制时，新的 Room 会被创建
-   除非玩家手动退出房间，或房间中已经没有任何玩家，否则服务端将保留玩家的游戏状态，当玩家重新加入房间时会自动恢复

### Rchain

-   在服务端上使用 Docker 部署 RChain 网络，包含一个 Validator 节点和一个 Observer (只读)节点。Validator 节点提供了 Deploy、Propose 等 HTTP API，Observer 节点提供了可用来查询 REV 余额的 explore-deploy HTTP API，见 [rnode-api-spec](https://web.archive.org/web/20210120073115/https://developer.rchain.coop/rnode-api)。
-   参考 [tgrospic/rnode-http-js](https://github.com/tgrospic/rnode-http-js) 和 [tgrospic/rnode-client-js-dev-test](https://github.com/tgrospic/rnode-client-js-dev-test) 开发 rnode web client。客户端的 Deploy 请求会通过服务端代理部署到 rchain 上。
-   客户端通过 [MetaMask](https://metamask.io/) 钱包的浏览器扩展对部署内容进行签名 ([personal_sign](https://docs.metamask.io/wallet/reference/personal_sign/))，再让后端服务器代理 Deploy。并通过 MetaMask 获取用户的 ETH 地址 ([eth_accounts](https://docs.metamask.io/wallet/reference/eth_accounts/))，将其转换成 REV 地址以用于交易或余额查询。

### REV System

-   初次启动时，固定数量的 REV 会被供应到 RChain 网络上。
-   对于新注册的玩家，会通过智能合约 ["Faucet"](./contracts/faucet.rho) 给予一定数量的 REV。
-   玩家若想参与竞技模式，则需要消耗特定数量的 REV。这些 REV 的一部分被用来预付服务器代理 Deploy 的费用，另一部分则用于对战结束后的奖励分配 (依据积分排名)，具体规则见智能合约 ["CarBrawl"](./contracts/game.rho)。
-   玩家若没有足够的 REV 参与对战，则可以通过私下交易的形式与从其他玩家处获取（游戏平台提供了 REV 转账功能，见智能合约 ["Transfer"](./contracts/transfer.rho)）。

## 🚩 Roadmap
- [x] 实现 Rchain HTTP client
- [x] 实现基本的智能合约
- [x] 实现基本的游戏服务器 & 客户端
- [ ] 连接 Metamask 钱包和完善账户功能
- [ ] 在竞技模式中加入 Rchain 交互，实现 REV 系统
- [ ] 美化 UI
- [ ] ...

## 🛠️ Development

### Node.js v18.x

[Download for Windows](https://nodejs.org/en)

[Install Node.js on Linux](https://github.com/nodesource/distributions#installation-instructions)


### VS Code

克隆仓库到本地后，在 VS Code 中打开项目文件夹，在扩展面板中搜索 `@recommended` 安装扩展插件

### Install dependencies

```bash
# 启用 pnpm
corepack enable pnpm

# 安装依赖
pnpm install
```

### Run & Build
```bash
# 开发模式
pnpm dev # http://localhost:<port>，其中 <port> 在 .env 文件中定义

# 构建
pnpm build # 输出目录为 .output
```

### Run rnode

[Install Docker Desktop on Windows](https://docs.docker.com/desktop/install/windows-install/)

[Install Docker Engine on Ubuntu](https://docs.docker.com/engine/install/ubuntu/)

```bash
# 运行 Windows Docker Desktop
# 或在 Ubuntu 上开启 docker service
sudo service docker start

# 启动
docker compose up

# 终止
docker compose down

```
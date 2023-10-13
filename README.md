# rchain-game

🚧 **Working in progress**

## Learning
<ul>
  <li><img src="https://i.ibb.co/Qcs9FJD/js.png" alt="js" border="0"><a href="https://zh.javascript.info/"> JavaScript</a></li>
  <li><img src="https://www.typescriptlang.org/favicon-32x32.png?v=8944a05a8b601855de116c8a56d3b3ae" width=15><a href="https://www.typescriptlang.org/docs/"> TypeScript</a></li>
  <li><img src="https://cn.vuejs.org/logo.svg" width=15> <a href='https://cn.vuejs.org/guide/introduction.html'>Vue.js</a></li>
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
    <li>要想执行 Deploy，部署者需要提供自己的身份信息，且必须为所消耗的计算资源支付一定的费用</li>
    <li>任何拥有有效身份信息的人都可以成为部署者，这个身份信息一般指一个唯一公钥或地址</li>
    <li>在执行 Deploy 后，代码程序还没有被真正放到 RChain 区块链的区块上</li>
    <li>还需要一个验证者 (Validator) 节点 (RNode) 验证其有效性，然后由这个节点执行区块提议 (Propose)</li>
    <li>节点网络上的其他验证者接收到这个提议，并达成共识之后，新区块才会被创建，而代码程序就部署在上面</li>
  <ul>
</details>

## Overall Design
### Back-end
- 使用 Docker 部署 RChain 网络，包含一个 Validator 节点和一个 Observer (只读)节点。Validator 节点提供了 Deploy、Propose 等 HTTP API，Observer 节点提供了可用来查询 REV 余额的 HTTP API
- 采用 Nuxt 框架默认提供的 [Server Engine](https://nuxt.com/docs/guide/concepts/server-engine)，代理来自客户端的 Deploy 请求
- 

### Front-end
- 通过 [MetaMask](https://metamask.io/) 浏览器扩展获取用户的身份信息，用于发起 Deploy 请求。具体而言，会通过扩展提供的 API 获取用户的 ETH 地址 (会被转换为 REV 地址) 或对部署的内容进行签名
- 

### REV System
- 初次启动时，固定数量的 REV 会被供应到 RChain 网络上
- 对于新注册的玩家，会通过智能合约给予一定数量的 REV
- 玩家若想参与在线对战模式，则需要消耗特定数量的 REV。这些 REV 的一部分被用来预付服务器代理 Deploy 的费用，另一部分则用于对战结束后的奖励分配。
- 对战结束后，将根据玩家的积分排名分配 REV 奖励
- 玩家若没有足够的 REV 参与对战，则可以通过私下交易的形式与从其他玩家处获取（游戏平台提供了 REV 转账功能）

## Development

### Run rnode

[Install Docker Desktop on Windows](https://docs.docker.com/desktop/install/windows-install/)

[Install Docker Engine on Ubuntu](https://docs.docker.com/engine/install/ubuntu/)


```bash
# 运行 Windows Docker Desktop 
# 或在 Ubuntu 上开启 docker service
sudo service docker start

# 运行 rnode
docker compose up -d

# 显示 rnode 日志
docker compose logs -f

# 停止运行
docker compose down
```

### Node.js v18.x

[Download for Windows](https://nodejs.org/en)

[Install Node.js on Linux](https://github.com/nodesource/distributions#installation-instructions)

### VS Code
克隆仓库到本地后，在 VS Code 中打开项目文件夹，根据提示安装工作区建议的扩展，也可直接在扩展面板中搜索`@recommended`

### Install dependencies

```bash
# 启用 pnpm
corepack enable pnpm

# 安装依赖
pnpm install
```
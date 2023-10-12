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
    注意：<code>dcoker run</code> 命令创建的容器是一次性的，在运行命令的终端中按下 <code>Ctrl+C</code> 可以停止并删除容器。需要再次运行 rnode 时，先打开 Docker Desktop 应用，然后从第 4 步骤开始即可
  </div>
</details>

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

<details>
  <summary>More Details</summary>
    Docker 中运行了一对 peer rnode (boot 和 read)，其配置文件在项目根目录下，以 .conf 结尾
    <ul>
      <li>boot node 具有 validator 身份，可执行 Deploy 和 Propose，它以 standalone 模式运行，会携带上 genesis 的一些信息</li>
      <li>read node 负责执行 explore-deploy (查询 Balance 时需要用到)，其 bootstrap 参数被配置为 boot node 的地址</li>
    </ul>
    对本项目而言，用户本身不直接与 rnode 进行通信，而是由服务器进行代理。.env 文件中配置了 rnode 的访问 IP，如果 rnode 只与服务器进行通信，将 RNODE_HOST 配置为 127.0.0.1 即可。
</details>

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
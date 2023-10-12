# rchain-game

🚧 **Working in progress**

## Learning
<ul>
  <li><svg role="img" width=14 viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>JavaScript</title><path fill=#F7DF1E d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z"/></svg><a href="https://zh.javascript.info/"> JavaScript</a></li>
  <li><svg role="img" width=14 viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>TypeScript</title><path fill=#3178C6 d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z"/></svg><a href="https://www.typescriptlang.org/docs/"> TypeScript</a></li>
  <li><svg role="img" width=14 viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Vue.js</title><path fill=#4FC08D d="M24,1.61H14.06L12,5.16,9.94,1.61H0L12,22.39ZM12,14.08,5.16,2.23H9.59L12,6.41l2.41-4.18h4.43Z"/></svg> <a href='https://cn.vuejs.org/guide/introduction.html'>Vue.js</a></li>
  <li><img width=14 src="https://s2.coinmarketcap.com/static/img/coins/64x64/2021.png"/><a href="https://github.com/JoshOrndorff/LearnRholangByExample/blob/master/README_CN.md"> Rholang</a></li>
</ul>

<details>
  <summary>搭建本地 Rholang 执行环境</summary>
  <ol>
    <li>在 Windows 上安装 <a href="https://docs.docker.com/desktop/install/windows-install/">Docker</a> 并打开</li>
    <li>拉取 rnode 镜像 <code>docker pull rchain/rnode:v0.12.8</code></li>
    <li>创建 docker network <code>docker network create rnode-net</code></li>
    <li>运行 rnode 节点 <code>docker run -u root -it --rm --network rnode-net --name rnode -v "%cd%/":/data rchain/rnode:v0.12.8 run -s</code>，在当前终端中会显示 rnode 日志</li>
    <li>新建一个终端，创建命令别名 <code>doskey rnode=docker exec rnode /opt/docker/bin/rnode $*</code></li>
    <li>执行 .rho 文件 <code>rnode eval "file_path"</code> (路径格式：假如当前目录有个 hello.rho 文件，那么应该执行 <code>rnode eval /data/hello.rho</code>)</li>
    <li>在显示 rnode 日志的终端中可以看到执行结果</li>
  </ol>
  注意：<code>dcoker run</code> 命令创建的容器是一次性的，在运行命令的终端中按下 <code>Ctrl+C</code> 可以停止并删除容器。而 docker network 只需要创建一次。需要再次运行 rnode 时，先打开 Docker Desktop 应用，然后从第 4 步骤开始即可
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

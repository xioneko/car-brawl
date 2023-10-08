# rchain-game

🚧 **Working in progress**

## Environment
### Ubuntu 22.04

```bash
# 获取 Linux 发行版信息
lsb_release -a

# 更新 Ubuntu 软件包
sudo apt update && sudo apt upgrade
```

### Node.js v18.18.0
[install](https://github.com/nodesource/distributions#installation-instructions)

```bash
# 检查 node.js 版本
node -v
```

### rnode v0.12.8
通过 [链接](https://github.com/rchain/rchain/releases/download/v0.12.8/rnode_0.12.8_all.deb) 下载 rnode 安装包

or

```bash
wget https://github.com/rchain/rchain/releases/download/v0.12.8/rnode_0.12.8_all.deb
```

then

```bash
sudo apt install ./rnode_0.12.8_all.deb
```

## Development

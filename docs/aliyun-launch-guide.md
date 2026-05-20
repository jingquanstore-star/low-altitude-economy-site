# 阿里云上线指南

这份文档按“小白第一次上线”的方式写。目标是把网站放到阿里云服务器上，并让资讯大约每 1 小时自动更新一次。

## 先选哪种阿里云产品

推荐先用：阿里云轻量应用服务器。

原因：

- 这个网站既要展示页面，也要定时抓取资讯。
- 轻量应用服务器可以同时放网页、运行抓取脚本、绑定域名。
- 第一版访问量不会特别大时，轻量应用服务器足够用。

不建议第一版只用 OSS 静态网站托管，因为 OSS 只能方便托管静态页面，不能直接跑资讯抓取脚本。

## 购买建议

在阿里云控制台购买：

- 产品：轻量应用服务器
- 系统：Ubuntu 22.04 或 Ubuntu 24.04
- 配置：2 核 2G 起步即可
- 地域：
  - 主要给中国大陆用户看：选中国大陆地域，但域名需要备案
  - 想先快速上线测试：选中国香港或新加坡，通常不用备案
- 开放端口：80、443、22

## 域名和备案怎么理解

如果你买的是中国大陆服务器，网站用自己的域名正式访问前，一般需要 ICP 备案。

如果你买的是中国香港、新加坡等非中国大陆服务器，通常可以先不备案，直接绑定域名上线。

建议路径：

1. 先用香港或新加坡服务器快速上线测试。
2. 网站内容和商业方向确定后，再考虑中国大陆服务器和备案。

## 服务器初始化

登录服务器后，先安装基础环境。

```bash
sudo apt update
sudo apt install -y nginx git curl unzip rsync
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

看到 Node.js 和 npm 的版本号，就说明基础环境装好了。

## 上传项目

推荐把整个项目上传到服务器这个目录：

```bash
/opt/low-altitude-economy-site
```

如果你用压缩包上传，服务器上可以这样解压：

```bash
sudo mkdir -p /opt/low-altitude-economy-site
sudo unzip low-altitude-economy-site.zip -d /opt/low-altitude-economy-site
cd /opt/low-altitude-economy-site
sudo npm install
```

如果解压后多了一层文件夹，就进入真正有 `package.json` 的那一层。

## 第一次生成网站

在项目目录执行：

```bash
cd /opt/low-altitude-economy-site
npm run collect:news
npm run build
sudo mkdir -p /var/www/low-altitude-economy-site
sudo rsync -a --delete dist/ /var/www/low-altitude-economy-site/
```

这一步会：

- 抓取一次资讯
- 生成正式网站文件
- 把网站文件放到 Nginx 可以访问的位置

## 配置 Nginx

复制项目里的配置模板：

```bash
sudo cp /opt/low-altitude-economy-site/deploy/nginx.low-altitude.conf /etc/nginx/sites-available/low-altitude-economy-site
sudo ln -s /etc/nginx/sites-available/low-altitude-economy-site /etc/nginx/sites-enabled/low-altitude-economy-site
sudo nginx -t
sudo systemctl reload nginx
```

如果你已经有域名，把配置文件里的 `your-domain.com` 换成你的域名。

```bash
sudo nano /etc/nginx/sites-available/low-altitude-economy-site
sudo nginx -t
sudo systemctl reload nginx
```

## 浏览器访问

如果还没有域名，先访问：

```text
http://服务器公网IP
```

如果有域名，并且已经解析到服务器，就访问：

```text
http://你的域名
```

## 设置每小时左右自动更新资讯

先把刷新脚本放到服务器固定位置：

```bash
sudo cp /opt/low-altitude-economy-site/scripts/server-refresh-news.sh /usr/local/bin/low-altitude-refresh
sudo chmod +x /usr/local/bin/low-altitude-refresh
```

打开定时任务：

```bash
sudo crontab -e
```

加入这一行：

```cron
17 * * * * /usr/local/bin/low-altitude-refresh >> /var/log/low-altitude-refresh.log 2>&1
```

说明：

- 这表示每小时第 17 分钟触发一次，不在整点。
- 脚本里还会随机等待 0 到 11 分钟左右，避免总是在固定分钟访问来源网站。
- 日志会写到 `/var/log/low-altitude-refresh.log`。

## 绑定 HTTPS

正式上线建议开启 HTTPS。

可以在阿里云控制台申请免费或付费 SSL 证书，然后选择 Nginx 类型下载证书，根据阿里云控制台提示配置。

如果你先只是测试，可以先用 HTTP，等域名确定后再加 HTTPS。

## 日常维护

常用检查：

```bash
sudo systemctl status nginx
tail -n 80 /var/log/low-altitude-refresh.log
```

手动刷新一次资讯：

```bash
sudo /usr/local/bin/low-altitude-refresh
```

重新发布网站：

```bash
cd /opt/low-altitude-economy-site
npm run build
sudo rsync -a --delete dist/ /var/www/low-altitude-economy-site/
```

## 第一版上线建议

你可以先按这个顺序走：

1. 买香港或新加坡轻量应用服务器。
2. 上传项目并跑通网站。
3. 用公网 IP 先确认能访问。
4. 买域名并解析到服务器。
5. 绑定 HTTPS。
6. 后续如果主要面向中国大陆用户，再做备案和国内服务器迁移。

# GitHub Pages 小白上线步骤

这份说明适合完全不会代码的人。你只需要注册 GitHub，然后用 GitHub Desktop 上传项目。

## 你会得到什么

上线后，网站地址大概是：

```text
https://你的用户名.github.io/low-altitude-economy-site/
```

网站会在 GitHub 上自动发布，并且大约每小时自动刷新一次资讯。

## 第一步：注册 GitHub

1. 打开 https://github.com
2. 点击右上角 Sign up
3. 用邮箱注册账号
4. 记住你的用户名

## 第二步：安装 GitHub Desktop

1. 打开 https://desktop.github.com
2. 下载并安装 GitHub Desktop
3. 打开 GitHub Desktop
4. 用刚才注册的 GitHub 账号登录

GitHub Desktop 是图形界面工具，可以避免你敲命令。

## 第三步：把项目放进 GitHub Desktop

1. 打开 GitHub Desktop
2. 点击顶部菜单 File
3. 点击 Add Local Repository
4. 选择这个项目文件夹：

```text
/Users/jingquan/Documents/New project/low-altitude-economy-site
```

5. 如果它提示这不是 Git 仓库，点击 create a repository
6. 仓库名称建议填：

```text
low-altitude-economy-site
```

7. 点击 Create Repository

## 第四步：发布到 GitHub

1. 在 GitHub Desktop 左下角写一句说明，比如：

```text
Initial website
```

2. 点击 Commit to main
3. 点击 Publish repository
4. 弹窗里不要勾选 Keep this code private
5. 点击 Publish Repository

等它上传完成。

## 第五步：打开 GitHub Pages

1. 打开 https://github.com
2. 进入刚刚发布的仓库
3. 点击 Settings
4. 左侧点击 Pages
5. 找到 Build and deployment
6. Source 选择 GitHub Actions

如果已经显示 GitHub Actions，就不用改。

## 第六步：等待自动发布

1. 点击仓库顶部的 Actions
2. 你会看到一个叫 Deploy GitHub Pages 的任务
3. 等它从黄色变成绿色
4. 再回到 Settings > Pages
5. 页面上会显示你的网址

如果网址还没出现，等 1 到 3 分钟刷新一下。

## 第七步：以后怎么更新网站

以后我帮你改完网站后，你只需要：

1. 打开 GitHub Desktop
2. 左下角写一句更新说明，比如：

```text
Update website
```

3. 点击 Commit to main
4. 点击 Push origin

GitHub 会自动重新发布。

## 资讯会怎么更新

项目里已经加了自动发布任务：

- 每次你上传新版本，会自动发布
- 大约每小时会自动抓取一次资讯并重新发布
- 触发时间不是整点，避免过于规律

注意：GitHub 的定时任务不是百分百准点，偶尔会延迟。这对测试版资讯站一般可以接受。

## 国内访问提醒

GitHub Pages 国内可以访问，但速度和稳定性不如国内服务器。

建议：

1. 先用 GitHub Pages 快速上线测试。
2. 如果后续主要给国内用户正式访问，再迁移到阿里云、腾讯云或其他国内服务器。


# eRealm Travel Guide 部署指南

## 项目概述

这是一个基于Three.js的交互式3D旅行指南静态网页应用，包含以下核心文件：
- `index.html` - 主页面结构
- `style.css` - 样式文件
- `script.js` - JavaScript交互逻辑

## 1. 准备部署环境

### 1.1 本地环境检查

确保本地项目能正常运行：

```bash
# 检查项目文件完整性
ls -la

# 使用本地HTTP服务器测试
python3 -m http.server 8000
# 或使用Node.js的http-server
npx http-server -p 8000
```

访问 `http://localhost:8000` 确认项目能正常加载和运行。

### 1.2 环境准备清单

- 本地开发环境（已完成）
- 部署目标平台账号（根据选择的部署方式）
- 域名（可选，用于自定义访问地址）
- SSL证书（可选，用于HTTPS访问）

## 2. 静态网页部署

### 2.1 GitHub Pages 部署

**操作流程：**

1. **创建GitHub仓库**
   - 登录GitHub，创建新仓库 `erealm-travel-guide`
   - 将本地项目推送到GitHub

2. **配置GitHub Pages**
   - 进入仓库Settings → Pages
   - 选择分支：`main` 或 `master`
   - 选择文件夹：`/(root)`
   - 点击「Save」
   - 等待几分钟，GitHub Pages会自动构建部署

3. **访问网站**
   - 部署完成后，可通过 `https://<username>.github.io/erealm-travel-guide/` 访问

**注意事项：**
- GitHub Pages仅支持静态网站
- 每月有100GB带宽限制
- 自定义域名需要在仓库设置中配置

### 2.2 Netlify/Vercel 部署

**Netlify操作流程：**

1. **登录Netlify账号**，点击「New site from Git」
2. **选择GitHub仓库**，授权Netlify访问
3. **配置构建选项**：
   - 构建命令：留空（静态网站不需要构建）
   - 发布目录：`/`
4. **点击「Deploy site」**
5. **自定义域名**（可选）：在Site settings中配置

**Vercel操作流程：**

1. **登录Vercel账号**，点击「New Project」
2. **导入GitHub仓库**
3. **配置项目**：
   - 框架预设：选择「Other」
   - 构建命令：留空
   - 输出目录：`/`
4. **点击「Deploy」**

**注意事项：**
- 两者均提供免费SSL证书
- 自动CI/CD部署（推送代码自动更新）
- Netlify/Vercel提供CDN加速

### 2.3 Nginx 服务器部署

**操作流程：**

1. **购买/租赁服务器**（推荐Ubuntu 20.04+）
2. **安装Nginx**：
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

3. **上传项目文件**：
   ```bash
   # 使用scp上传文件
   scp -r * username@server_ip:/var/www/erealm/
   ```

4. **配置Nginx虚拟主机**：
   ```bash
   sudo nano /etc/nginx/sites-available/erealm
   ```
   
   添加以下配置：
   ```nginx
   server {
       listen 80;
       server_name your_domain.com;
       root /var/www/erealm;
       index index.html;
       
       location / {
           try_files $uri $uri/ =404;
       }
       
       # 启用gzip压缩
       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
       
       # 静态文件缓存
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, max-age=31536000";
       }
   }
   ```

5. **启用配置并重启Nginx**：
   ```bash
   sudo ln -s /etc/nginx/sites-available/erealm /etc/nginx/sites-enabled/
   sudo nginx -t  # 测试配置
   sudo systemctl restart nginx
   ```

**注意事项：**
- 确保服务器防火墙开放80/443端口
- 定期更新Nginx版本
- 配置适当的缓存策略

## 3. 动态网页部署（参考）

如果未来项目扩展为动态网站（如添加后端API），可采用以下方式：

### 3.1 Node.js + Express 部署

1. **创建后端项目结构**：
   ```
   erealm-travel-guide/
   ├── public/          # 静态文件目录
   │   ├── index.html
   │   ├── style.css
   │   └── script.js
   ├── server.js        # Express服务器
   └── package.json
   ```

2. **编写Express服务器**：
   ```javascript
   const express = require('express');
   const app = express();
   const port = process.env.PORT || 3000;
   
   // 静态文件服务
   app.use(express.static('public'));
   
   // API路由（示例）
   app.get('/api/health', (req, res) => {
       res.json({ status: 'ok', message: 'eRealm API is running' });
   });
   
   // 启动服务器
   app.listen(port, () => {
       console.log(`Server running on port ${port}`);
   });
   ```

3. **部署到Heroku**：
   ```bash
   # 安装Heroku CLI
   brew install heroku/brew/heroku
   
   # 登录Heroku
   heroku login
   
   # 创建Heroku应用
   heroku create erealm-travel-guide
   
   # 部署应用
   git push heroku main
   ```

## 4. 容器化部署（Docker）

### 4.1 编写Dockerfile

在项目根目录创建 `Dockerfile`：

```dockerfile
# 使用Nginx作为基础镜像
FROM nginx:alpine

# 将项目文件复制到Nginx的html目录
COPY . /usr/share/nginx/html

# 暴露80端口
EXPOSE 80

# 启动Nginx服务
CMD ["nginx", "-g", "daemon off;"]
```

### 4.2 构建Docker镜像

```bash
# 构建镜像
docker build -t erealm-travel-guide .

# 本地测试镜像
docker run -p 8000:80 erealm-travel-guide
```

### 4.3 部署到Docker Hub

```bash
# 登录Docker Hub
docker login

# 标记镜像
docker tag erealm-travel-guide <username>/erealm-travel-guide

# 推送镜像到Docker Hub
docker push <username>/erealm-travel-guide
```

### 4.4 部署到服务器

```bash
# 在目标服务器上拉取镜像并运行
docker run -d -p 80:80 --name erealm-travel-guide <username>/erealm-travel-guide
```

### 4.5 使用Docker Compose（可选）

创建 `docker-compose.yml`：

```yaml
version: '3'

services:
  web:
    image: erealm-travel-guide
    ports:
      - "80:80"
    volumes:
      - ./:/usr/share/nginx/html
    restart: always
```

启动服务：
```bash
docker-compose up -d
```

## 5. 配置域名和SSL证书

### 5.1 配置自定义域名

**GitHub Pages域名配置：**
1. 在仓库根目录创建 `CNAME` 文件，内容为 `yourdomain.com`
2. 在域名注册商处添加CNAME记录：`www.yourdomain.com` → `<username>.github.io`

**Nginx域名配置：**
1. 在域名注册商处添加A记录：`yourdomain.com` → 服务器IP
2. 修改Nginx配置中的 `server_name` 为 `yourdomain.com`

### 5.2 配置SSL证书

**使用Let's Encrypt（免费）：**

```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx

# 获取SSL证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 设置自动续约
sudo certbot renew --dry-run
```

**Nginx SSL配置：**
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # 其他配置...
}

# HTTP重定向到HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}
```

## 6. 设置文件权限

在Linux服务器上，确保文件权限正确：

```bash
# 设置正确的文件所有者
sudo chown -R www-data:www-data /var/www/erealm

# 设置文件权限
sudo chmod -R 755 /var/www/erealm

# 设置目录权限
sudo find /var/www/erealm -type d -exec chmod 755 {} \;

# 设置文件权限
sudo find /var/www/erealm -type f -exec chmod 644 {} \;
```

## 7. 配置服务器参数

### 7.1 Nginx优化配置

编辑 `/etc/nginx/nginx.conf`，添加以下优化：

```nginx
http {
    # 连接优化
    keepalive_timeout 65;
    keepalive_requests 100;
    
    # 缓存优化
    open_file_cache max=1000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;
    
    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
    
    # 其他配置...
}
```

## 8. 部署测试

### 8.1 功能测试

- 访问网站首页，确认3D场景正常加载
- 测试所有导航按钮：Free Explore、Sea、Flower Gallery、Stairs、Hospital
- 测试交互功能：鼠标效果、菜单切换、设置调整
- 测试键盘控制：WASD/方向键移动

### 8.2 兼容性测试

| 浏览器 | 版本 | 测试内容 |
|--------|------|----------|
| Chrome | 最新 | 全功能测试 |
| Firefox | 最新 | 全功能测试 |
| Safari | 最新 | 全功能测试 |
| Edge | 最新 | 全功能测试 |
| 移动端浏览器 | 最新 | 响应式设计测试 |

### 8.3 性能测试

使用以下工具测试网站性能：

- [Google PageSpeed Insights](https://developers.google.com/speed/pagespeed/insights/)
- [WebPageTest](https://www.webpagetest.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse/)

## 9. 设置监控和日志系统

### 9.1 Nginx日志配置

Nginx默认日志位置：
- 访问日志：`/var/log/nginx/access.log`
- 错误日志：`/var/log/nginx/error.log`

### 9.2 日志分析工具

1. **GoAccess**（实时日志分析）
   ```bash
   sudo apt install goaccess
   goaccess /var/log/nginx/access.log -o /var/www/html/report.html --log-format=COMBINED --real-time-html
   ```

2. **ELK Stack**（企业级日志分析）
   - Elasticsearch + Logstash + Kibana
   - 适合大规模部署

### 9.3 监控工具

1. **UptimeRobot**（免费网站监控）
   - 监控网站可用性
   - 配置邮件/短信告警

2. **New Relic**（应用性能监控）
   - 实时监控网站性能
   - 错误追踪和分析

3. **Prometheus + Grafana**（服务器监控）
   - 监控服务器CPU、内存、磁盘使用情况
   - 可视化监控面板

## 10. 部署方式对比

| 部署方式 | 优点 | 缺点 | 适用场景 |
|----------|------|------|----------|
| GitHub Pages | 免费、简单、自动部署 | 功能有限、带宽限制 | 个人项目、开源项目 |
| Netlify/Vercel | 免费SSL、CDN加速、自动部署 | 免费版有资源限制 | 中小型静态网站 |
| Nginx自建服务器 | 完全控制、高性能 | 需要维护服务器 | 大型网站、高流量项目 |
| Docker容器化 | 环境一致、易于扩展 | 增加部署复杂度 | 微服务架构、多环境部署 |
| Heroku | 简单部署、自动扩展 | 成本较高、资源限制 | 动态网站、API服务 |

## 11. 持续集成/持续部署（CI/CD）

### 11.1 GitHub Actions配置

在项目根目录创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: .
```

### 11.2 Netlify CI/CD

Netlify自动集成GitHub，每次推送代码到main分支都会自动部署：
- 无需额外配置
- 提供部署预览功能
- 支持分支部署和环境变量配置

## 12. 故障排除

### 12.1 常见问题及解决方案

1. **3D模型无法加载**
   - 检查文件路径是否正确
   - 确认Three.js版本兼容性
   - 查看浏览器控制台错误信息

2. **网站加载缓慢**
   - 优化静态资源（压缩图片、JS、CSS）
   - 使用CDN加速
   - 启用Gzip压缩

3. **HTTPS访问问题**
   - 检查SSL证书是否过期
   - 确认域名DNS解析是否正确
   - 检查Nginx SSL配置

4. **移动端适配问题**
   - 检查viewport设置
   - 测试触摸交互功能
   - 优化移动端性能

## 13. 维护建议

1. **定期备份**
   - 备份项目代码（已通过Git实现）
   - 备份服务器配置和数据

2. **安全更新**
   - 定期更新服务器操作系统
   - 更新依赖库和框架
   - 检查安全漏洞

3. **性能优化**
   - 监控网站性能指标
   - 优化3D模型和纹理资源
   - 调整服务器配置

4. **日志审查**
   - 定期检查访问日志
   - 分析用户行为
   - 识别异常流量

## 14. 后续扩展建议

1. **添加分析工具**
   ```javascript
   <!-- Google Analytics -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```

2. **添加PWA支持**
   - 创建 `manifest.json`
   - 添加Service Worker
   - 支持离线访问

3. **多语言支持**
   - 实现i18n国际化
   - 支持中英文切换

---

通过以上部署指南，您可以根据自己的需求选择合适的部署方式，将eRealm Travel Guide成功部署到互联网上。祝您部署顺利！

# 选择node镜像
FROM node:12.6.0-buster-slim

# 安装nginx
RUN apt-get update \
  && apt-get install -y nginx

# 指定工作目录
WORKDIR /app

# 把当前所有目录下文件拷贝到工作目录
COPY . /app/

# 运行时容器提供服务端口
EXPOSE 80

# 1. 安装依赖
# 2. 构建打包
# 3. 把dist目录下文件拷贝到 nginx目录下
# 4. 删除工作目录下的文件 减少镜像体积
RUN npm install --registry=https://registry.npm.taobao.org \
  && npm run docs:build \
  && cp -r docs/.vuepress/dist/* /var/www/html \
  && rm -rf /app

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
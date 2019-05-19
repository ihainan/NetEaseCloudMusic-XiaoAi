# Usage: docker run -d -it --name=xiaoai -e EMAIL="EMAIL" -e PASSWORD="PASSWORD" \
# -e DOMAIN="hk2.ihainan.me" -v "/etc/letsencrypt/archive/ihainan.me:/etc/letsencrypt/archive/ihainan.me" \
# -v "/etc/letsencrypt/live/ihainan.me:/etc/letsencrypt/live/ihainan.me" -p 5000:5000 -p 5001:5001 ihainan/netease-xiaoai:0.1 sh

FROM python:3.7.3-alpine3.9
LABEL maintainer "ihainan72@gmail.com"

# Download code & install dependencies
RUN apk add --update python python-dev py-pip nodejs nodejs-npm \
    && mkdir -p /root/xiaoai \
    && wget https://github.com/Binaryify/NeteaseCloudMusicApi/archive/v3.12.0.zip -P /root/xiaoai \
    && cd /root/xiaoai && unzip v3.12.0.zip && rm -rf v3.12.0.zip \
    # && wget https://github.com/ihainan/NetEaseCloudMusic-XiaoAi/archive/master.zip -P /root/xiaoai \
    && wget http://hk2.ihainan.me/tmp/master.zip -P /root/xiaoai \
    && cd /root/xiaoai && unzip master.zip && rm -rf master.zip \
    && cd /root/xiaoai/NetEaseCloudMusic-XiaoAi-master/node && npm install \
    && cd /root/xiaoai/NeteaseCloudMusicApi-3.12.0 && npm install \
    && cd /root/xiaoai/NetEaseCloudMusic-XiaoAi-master/python/ && pip install requests && pip install flask 

# Configure services
RUN cp /root/xiaoai/NetEaseCloudMusic-XiaoAi-master/node/config.json.template /root/xiaoai/NetEaseCloudMusic-XiaoAi-master/node/config.json \
    && sed -i -e 's/YOUR_SERVICE_IP/localhost/g' /root/xiaoai/NetEaseCloudMusic-XiaoAi-master/python/app.py \
    && sed -i -e 's/SERVICE_PORT/5001/g' /root/xiaoai/NetEaseCloudMusic-XiaoAi-master/python/app.py 

# # Add run script
RUN mkdir -p /var/log/xiaoai \
    && touch /root/run.sh \
    && echo "#!/bin/sh" > /root/run.sh \
    && echo 'export CERTPATH=/etc/letsencrypt/live/$(echo $(ls /etc/letsencrypt/archive/))' >> /root/run.sh \
    && echo 'echo {   \"host\": \"$3\",  \"port\": 5001,  \"api_url\": \"http://localhost:4000\", \"username\": \"$1\",  \"password\": \"$2\"} > /root/xiaoai/NetEaseCloudMusic-XiaoAi-master/node/config.json ' >> /root/run.sh \
    && echo "cd /root/xiaoai/NeteaseCloudMusicApi-3.12.0 && PORT=4000 node app.js  >/var/log/xiaoai/netease-api.log 2&>1 &" >> /root/run.sh \
    && echo "sleep 5" >> /root/run.sh \
    && echo "cd /root/xiaoai/NetEaseCloudMusic-XiaoAi-master/node && node server.js >/var/log/xiaoai/node-api.log 2&>1 &" >> /root/run.sh \
    && echo 'cd /root/xiaoai/NetEaseCloudMusic-XiaoAi-master/python/ && python app.py >/var/log/xiaoai/python-api.log 2&>1 &'  >> /root/run.sh \
    && echo 'while true; do sleep 0; done;'  >> /root/run.sh  \
    && chmod a+x /root/run.sh

# Entrypoint
ENV EMAIL="test@mail.com"
ENV PASSWORD="deom_password"
ENV DOMAIN="demo_domain"
CMD "/root/run.sh" $EMAIL $PASSWORD $DOMAIN

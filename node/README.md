## NetEaseCloudMusic-XiaoAi (Node.js Service)

1. Install requirements

``` bash
npm install
```

2. Create configuration file

Rename `config.json.template` to `config.json`, and then edit this file.

| Field   |      Value      |
|----------|:-------------:|
| host |  The hostname or IP address of your current machine (`0.0.0.0` is not supported) |
| port |  The port you want to use to start this service   |
| api_url | The URL of NetEase Cloud Music API service, you can use `http://hk2.ihainan.me:3000` |
| username | The username of your NetEase Cloud Music account |
| password | The password of your NetEase Cloud Music account |

``` JSON
{
    "host": "YOUR_SERVICE_HOST",
    "port": 4444,
    "api_url": "http://API_HOST:API_PORT",
    "username": "USERNAME_HERE",
    "password": "PASSWORD_HERE"
}
```


3. Run `server.js`

``` bash
node server.js
```

const { env } = require('process');

const target = env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
  env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'http://localhost:5290';

const PROXY_CONFIG = [
  {
    context: [
      "/api/Cities",
      "/api/Cities/IsDupeCity",
      "/api/Countries",
      "/api/Countries/IsDupeField",
      "/api/token/auth",
      "/api/token/externallogin",
      "/api/token/externallogincallback",
      "/api/user/addUser",
      "/api/user/getUser"
   ],
    target: target,
    secure: false,
    headers: {
      Connection: 'Keep-Alive'
    }
  }
]

module.exports = PROXY_CONFIG;

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api', // all requests starting with /api will be proxied
    createProxyMiddleware({
      target: 'http://localhost:5000', // your backend server
      changeOrigin: true,
    })
  );
};

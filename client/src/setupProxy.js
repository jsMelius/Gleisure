const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    `${process.env.REACT_APP_API_PREFIX}`, // You can pass in an array too eg. ['/api', '/another/path']
    createProxyMiddleware({
      target: `${process.env.REACT_APP_API_PROXY}`,
      changeOrigin: true,
    })
  );
};
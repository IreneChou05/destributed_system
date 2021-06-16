module.exports = {
  devServer: {
    proxy: {
        '/api': {
            target: 'http://54.64.87.19:8083/',
            changeOrigin: true,
            ws: false,
            pathRewrite: {
                '^/api': ''
            }
        },
        '/dms':{
          target: 'http://13.230.8.190:8081/',
          changeOrigin: true,
            ws: false,
            pathRewrite: {
                '^/dms': ''
            }
        },
        '/cms':{
          target: 'http://3.113.3.57:8082/',
          changeOrigin: true,
            ws: false,
            pathRewrite: {
                '^/cms': ''
            }
        },
      }
    },
  publicPath: process.env.NODE_ENV === 'production'
    ? '/destributed_system/'
    : '/'
  // presets: [
  //   '@vue/cli-plugin-babel/preset'
  // ]
}

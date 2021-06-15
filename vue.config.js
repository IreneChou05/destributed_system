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
          target: 'http://13.115.91.163:8081/',
          changeOrigin: true,
            ws: false,
            pathRewrite: {
                '^/dms': ''
            }
        }
      }
    },
  publicPath: process.env.NODE_ENV === 'production'
    ? '/destributed_system/'
    : '/'
  // presets: [
  //   '@vue/cli-plugin-babel/preset'
  // ]
}

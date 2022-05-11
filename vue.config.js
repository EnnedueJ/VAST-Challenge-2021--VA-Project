const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  configureWebpack: {
    module: {
      rules: [
          {
              test: /\.js$/,
              loader: 'ify-loader'
          }
      ]
    },
  },
  
  transpileDependencies: true,
})

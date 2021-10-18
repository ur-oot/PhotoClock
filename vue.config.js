module.exports = {
  configureWebpack: {
    devServer: {
      watchOptions: {
        poll: true
      },
    }
  },
  pages: {
    index: {
      entry: 'src/main.js', // 必須パラメータ
      title: 'PhotoClock',
    }
  }
}
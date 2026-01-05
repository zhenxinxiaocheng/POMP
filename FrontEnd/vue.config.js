module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  devServer: {
    port: 8080 // 设置启动端口为8080
  },
  configureWebpack: {
    resolve: {
      alias: {
        'components': '@/components',
        'content': '@/components/content',
        'common': '@/components/common',
        'assets': '@/assets',
        'network': '@/network',
        'views': '@/views',
        'layout':'@/layout',
        'mixin' : '@/mixin',
        'utils' : '@/utils',
        'player' : '@/player'
      }
    }
  },
  chainWebpack: config => {
    // 设置页面标题
    config.plugin('html').tap(args => {
      args[0].title = '个人在线音乐平台';
      return args;
    });
  }
}
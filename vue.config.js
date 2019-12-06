module.exports = {
  css: {
    requireModuleExtension: true,
    loaderOptions: {
      css: {
        modules: {
          localIdentName: 'css-[hash:base64:5]'
        }
      }
    }
  }
}

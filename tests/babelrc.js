module.exports = {
  presets: [],
  plugins: [
    {
      file: {
        request: 'babel-plugin-module-resolver'
      },
      options: {
        root: ['.'],
        alias: {
          actions: './actions',
          reducers: './reducers',
          lib: './lib',
          ClientMain: './src/client/main',
        },
      }
    }
  ]
}

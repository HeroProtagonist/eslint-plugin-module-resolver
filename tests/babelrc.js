module.exports = {
  presets: ['env'],
  plugins: [
    [
      'babel-plugin-module-resolver',
      {
        root: ['.'],
        alias: {
          action: './actions',
          reducer: './reducers',
          ClientMain: './src/client/main'
        },
      },
    ],
  ],
}

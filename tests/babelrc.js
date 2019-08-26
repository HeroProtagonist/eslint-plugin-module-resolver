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
          lib: './lib',
          ClientMain: './src/client/main'
        },
      },
    ],
  ],
}

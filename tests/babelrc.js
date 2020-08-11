module.exports = {
  presets: ['env'],
  plugins: [
    [
      'babel-plugin-module-resolver',
      {
        root: ['.'],
        alias: {
          actions: './actions',
          reducers: './reducers',
          lib: './lib',
          ClientMain: './src/client/main',
        },
      },
    ],
  ],
}

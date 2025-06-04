const path = require('path');

module.exports = [
  // Add support for native node modules
  {
    // We're specifying native_modules in the test because the asset relocator loader generates a
    // "fake" .node file which is really a cjs file.
    test: /native_modules[/\\].+\.node$/,
    use: 'node-loader',
  },
  {
    test: /[/\\]node_modules[/\\].+\.(m?js|node)$/,
    parser: { amd: false },
    use: {
      loader: '@vercel/webpack-asset-relocator-loader',
      options: {
        outputAssetBase: 'native_modules',
      },
    },
  },
  {
    test: /\.jsx?$/,
    use: {
      loader: 'babel-loader',
      options: {
        exclude: /node_modules/,
        presets: ['@babel/preset-react'],
      },
    },
  },
  {
    // loads .css files
    test: /\.css$/,
    include: [path.resolve(__dirname, 'app/src')],
    use: ['style-loader', 'css-loader', 'postcss-loader'],
  },
  {
    // 이미지 파일 로드 추가 (PNG, JPG, JPEG, GIF, SVG)
    test: /\.(png|jpe?g|gif|svg|apng)$/i,
    type: 'asset/resource',
    generator: {
      filename: 'images/[name][ext]', // 빌드시 이미지 저장 경로 설정
    },
  },
  // {
  //   test: /\.(png|svg|jpg|jpeg|gif)$/i,
  //   type: 'asset/resource',
  // },
  // { test: /\.png$/, loader: 'file-loader' },
//{ test: /\.png$/, loader: 'file-loader', option:{name:'[name].[ext]'} },
  // {
  //   // loads .css files
  //   test: /\.(png|jpe?g|gif|svg)$/,
  //   include: [path.resolve(__dirname, 'app/src/assets/images')],
  //   use: ['style-loader', 'css-loader', 'postcss-loader'],
  // },

  // Put your webpack loader rules in this array.  This is where you would put
  // your ts-loader configuration for instance:
  /**
   * Typescript Example:
   *
   * {
   *   test: /\.tsx?$/,
   *   exclude: /(node_modules|.webpack)/,
   *   loaders: [{
   *     loader: 'ts-loader',
   *     options: {
   *       transpileOnly: true
   *     }
   *   }]
   * }
   */
];

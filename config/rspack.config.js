const HtmlRspackPlugin = require('@rspack/plugin-html').default;
const packageJson = require('./package.json');
const path = require('path');

module.exports = {
  entry: './main.js', // Основной файл
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.bundle.js',
    publicPath: ''
  },
  devServer: {
    static: { directory: path.join(__dirname, 'dist') },
    compress: false,
    open: true,
    hot: false,
    liveReload: true,
    port: packageJson.port || 8080,
    client: {
      overlay: false,
      reconnect: 3,
      progress: true
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/i,
        use: 'babel-loader'
      },
      {
        test: /\.(png|jpg|svg|mp3|gif)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: { maxSize: Infinity }
        }
      },
      {
        test: /\.csv$/,
        use: {
          loader: 'csv-loader',
          options: {
            dynamicTyping: true,
            header: false,
            skipEmptyLines: true
          }
        }
      }
    ]
  },
  plugins: [
    new HtmlRspackPlugin({
      inject: false,
      filename: 'index.html',
      templateContent: ({ compilation }) => {
        const js = compilation.assets['main.bundle.js'].source();
        const assets = Object.entries(compilation.assets)
          .filter(([name]) => /\.(png|jpg|svg|mp3|gif)$/i.test(name))
          .map(([name, asset]) => ({
            name,
            content: asset.source()
          }));

        const resources = assets
          .map(
            (asset) =>
              `<script>window['${asset.name}'] = '${Buffer.from(asset.content).toString(
                'base64'
              )}';</script>`
          )
          .join('');

        return `
          <!doctype html>
          <html>
            <head>
              <title>${packageJson.name}</title>
              <meta name = 'description' content = '${packageJson.description}'>
              <meta charset = 'utf-8'>
              <meta name = 'viewport' content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no'>
            </head>
            <body>
              <canvas id = 'game'></canvas>
              ${resources}
              <script type = 'text/javascript'>${js}</script>
            </body>
          </html>
        `;
      }
    })
  ],
  performance: {
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },
  optimization: { minimize: true }
};
import { defineConfig } from '@rspack/cli';
import { rspack } from '@rspack/core';
import { createRequire } from 'node:module';
const HtmlRspackPlugin = rspack.HtmlRspackPlugin;

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const dir = path.resolve(process.env.NODE_DIR),
      port = process.env.PORT || 81,
      title = 'Test',
      description = 'Test description';

export default defineConfig({
  entry: path.resolve(dir, 'index.js'),
  
  output: {
    path: path.resolve(dir, 'dist'),
    filename: 'index.bundle.js',
    publicPath: '/'
  },
  devServer: {
    static: { directory: path.join(dir, 'dist') },
    compress: false,
    hot: false,
    liveReload: true,
    port: port,
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
        test: /\.(png|jpg|svg|mp3|gif|wasm)$/i,
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
    ],
    parser: {
        javascript: {
            url: 'relative',
        }
    }
  },
  experiments: {
    asyncWebAssembly: true
  },
  resolve: {
    fallback: {
      buffer: require.resolve('buffer'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify')
    },
    preferRelative: true
  },
  plugins: [
    new HtmlRspackPlugin({
      inject: false,
      filename: 'index.html',
      templateContent: ({ compilation }) => {
        const js = compilation.assets['index.bundle.js'].source();
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
              <title>${title}</title>
              <meta name = 'description' content = '${description}'>
              <meta charset = 'utf-8'>
              <meta name = 'viewport' content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no'>
            </head>
            <body>
              <canvas id = 'game'></canvas>
              <canvas id = 'text'></canvas>
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
});
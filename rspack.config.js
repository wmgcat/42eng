import { defineConfig } from "@rspack/cli";
import rspack from "@rspack/core";
import path from "path";
import { fileURLToPath } from "url";

const HtmlRspackPlugin = rspack.HtmlRspackPlugin;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.resolve(process.env.NODE_DIR);

const asset_regex = /\.(png|jpg|jpeg|svg|mp3|gif|wav|wasm|webp)$/i;

export default defineConfig({
  entry: path.resolve(dir, "index.js"),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    },
    extensions: [ ".ts", ".js" ]
  },
  devServer: {
    static: {
      directory: path.resolve(dir, "dist")
    },
    compress: false,
    hot: true,
    liveReload: true,
    port: process.env.PORT || 80,
    client: {
      overlay: false,
      reconnect: 3,
      progress: true
    }
  },
  output: {
    path: path.resolve(dir, "dist"),
    filename: "index.bundle.js",
    publicPath: "/"
  },
  module: {
    rules: [
      {
        test: /\.(?:js|mjs|ts)$/i,
        exclude: [ /node_modules/ ],
        options: {
          detectSyntax: "auto"
        },
        loader: "builtin:swc-loader",
        type: "javascript/auto"
      },
      {
        test: asset_regex,
        type: "asset",
        parser: {
          dataUrlCondition: {
            maxSize: Infinity
          }
        }
      }
    ],
    parser: {
      javascript: {
        url: "relative"
      }
    }
  },
  experiments: {
    asyncWebAssembly: true
  },
  plugins: [
    new HtmlRspackPlugin({
      inject: false,
      filename: "index.html",
      templateContent: ({ compilation }) => {
        const js = compilation.assets["index.bundle.js"].source();
        const assets = Object.entries(compilation.assets)
          .filter(([ key ]) => asset_regex.test(key))
          .map(([ key, value ]) => ({
            name: key,
            content: value.source()
          }));
        
        return `
          <!doctype html>
          <html>
            <head>
              <title>${process.env.TITLE || "42eng"}</title>
              <meta name="description" content="${process.env.DESCRIPTION || "42eng.js"}">
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no">
            </head>
            <body>
              <canvas id="game"></canvas>
              <canvas id="text"></canvas>
              ${assets?.map(
                (asset) =>
                  `<script>window['${asset.name}'] = '${Buffer.from(asset.content).toString("base64")}';</script>`
              )
              .join("")}
              <script type="text/javascript">${js}</script>
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
  optimization: {
    minimize: true
  }
});
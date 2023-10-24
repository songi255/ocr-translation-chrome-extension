const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
module.exports = {
  mode: "production",
  entry: {
    service_worker: path.resolve(
      __dirname,
      "./",
      "src/service_worker",
      "service_worker.ts"
    ),
    content: path.resolve(__dirname, "./", "src/content", "content.tsx"),
    offscreen: path.resolve(__dirname, "./", "src/offscreen", "offscreen.ts"),
  },
  output: {
    path: path.join(__dirname, "./build"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".ts", ".js", ".tsx", ".css", ".scss"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" },
          { loader: "sass-loader" },
        ],
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: ".", to: ".", context: "public" },
        {
          from: "./dist/worker.min.js",
          to: "./tesseract",
          context: "node_modules/tesseract.js",
        },
        {
          from: "./tesseract-core.wasm.js",
          to: "./tesseract",
          context: "node_modules/tesseract.js-core",
        },
      ],
    }),
  ],
};

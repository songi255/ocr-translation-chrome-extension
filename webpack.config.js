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
    content: path.resolve(__dirname, "./", "src/content", "content.ts"),
    offscreen: path.resolve(__dirname, "./", "src/offscreen", "offscreen.ts"),
  },
  output: {
    path: path.join(__dirname, "./build"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: ".", to: ".", context: "public" }],
    }),
    new CopyPlugin({
      patterns: [{ from: "./", to: "./tesseract", context: "src/tesseract" }],
    }),
  ],
};

const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

const config = {
  entry: {
    "popup/js/popup": "./src/popup/js/popup.js",
    "content-script": "./src/main.js"
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: '[name].js',
    clean: true
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "./src/popup/popup.html", to: "popup" },
      ],
    }),
  ],
  mode: "production"
};

module.exports = config;

const webpack = require("webpack");
const path = require("path");
module.exports = {
    entry: {
        index: [
            "webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000",
            "./src/index.js"
        ]
    },
    mode: "development",
    output: {
        path: path.resolve(__dirname, "./public"),
        filename: "[name].bundle.js",
        publicPath: "/"
    },
    plugins: [new webpack.HotModuleReplacementPlugin()]
};
const path = require("path");

module.exports = [
    {
        entry: "./viewer/src/index.ts",
        output: {
            path: path.join(__dirname, "build"),
            filename: "index.js",
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    exclude: /node_modules/,
                    loader: "babel-loader",
                },
            ],
        },
        resolve: {
            extensions: ['.ts', '.js'],
        },
        target: "web",
        mode: "development",
        node: {
            __dirname: false,
        },
    }
];
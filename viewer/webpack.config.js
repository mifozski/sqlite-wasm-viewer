/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');

module.exports = [
    {
        mode: 'development',
        target: 'web',
        entry: './src/index.ts',
        output: {
            path: path.join(__dirname, 'dist'),
            filename: 'index.js',
        },
        module: {
            rules: [
                {
                    test: /\.(ts|js)x?$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                        presets: ['@babel/env', '@babel/typescript'],
                    },
                },
                {
                    test: /\.css$/i,
                    use: ['style-loader', 'css-loader'],
                },
            ],
        },
        externals: {
            '@sqlite.org/sqlite-wasm': { root: '@sqlite.org/sqlite-wasm' },
        },
        resolve: {
            extensions: ['.js', '.ts'],
        },
    },
];

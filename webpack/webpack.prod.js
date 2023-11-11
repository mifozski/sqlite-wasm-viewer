/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = [
    {
        target: 'web',
        entry: './tester-app/src/index.ts',
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
        resolve: {
            extensions: ['.ts', '.js'],
            plugins: [
                new TsconfigPathsPlugin({
                    configFile: './tester-app/tsconfig.json',
                }),
            ],
        },
        mode: 'development',
        node: {
            __dirname: false,
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './tester-app/src/index.html',
            }),
        ],
        devServer: {
            static: {
                directory: path.join(__dirname, 'public'),
            },
            compress: true,
            port: 9000,
            historyApiFallback: {
                index: './tester-app/src/index.html',
            },
            headers: [
                {
                    key: 'Cross-Origin-Embedder-Policy',
                    value: 'require-corp',
                },
                {
                    key: 'Cross-Origin-Opener-Policy',
                    value: 'same-origin',
                },
            ],
        },
    },
];

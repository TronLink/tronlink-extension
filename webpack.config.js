const webpack = require('webpack');
const MinifyPlugin = require('babel-minify-webpack-plugin');
const path = require('path');

module.exports = function(env) {
    const config = {
        entry: {
            backgroundScript: './app/backgroundScript/index.js',
            contentScript: './app/contentScript/index.js',
            pageHook: './app/pageHook/index.js'
        },
        output: {
            path: path.join(__dirname, '/dist'),
            filename: '[name].js',
            sourceMapFilename: '[name].js.map'
        },
        devtool: 'source-map',
        module: {
            loaders: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader',
                    query: {
                        presets: [ 
                            'es2015', 
                            'stage-3' 
                        ],
                        plugins: [
                            'transform-runtime'
                        ]
                    }
                },
                {
                    test: /\.css$/,
                    use: [ 'style-loader', 'css-loader' ]
                }
            ]
        },
        resolve: {
            modules: [ './app', './node_modules' ]
        },
        plugins: [
            new webpack.optimize.ModuleConcatenationPlugin(),
            new webpack.DefinePlugin({
                ENVIRONMENT: JSON.stringify(process.env.NODE_ENV || 'development'),
                EXTENSION_ID: JSON.stringify('ibnejdfjmmkpcnlpebklmnkoeoihofec')
            })
        ]
    };

    if(process.env.NODE_ENV == 'production') {
        config.plugins = config.plugins.concat([
            new MinifyPlugin()            
        ]);
    }

    return config;
}
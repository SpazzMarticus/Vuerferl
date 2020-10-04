const path = require('path');
var webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin')

var config = {
    mode: 'development',
    entry: './src/index.js',
    resolve: {
        alias: {
            'Vue$': 'vue/dist/vue.esm.js'
        }
    },
    output: {
        path: path.resolve(__dirname, './docs/assets/js/'),
        filename: 'app.js',
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            // 'process.env.NODE_ENV': JSON.stringify('production')
        }),
        new VueLoaderPlugin()
    ]
};

module.exports = (env,argv)=>{
    if(argv.production)
    {
        config.mode = 'production';
    }

    return config;
};
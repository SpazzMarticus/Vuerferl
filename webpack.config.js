const path = require('path');
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
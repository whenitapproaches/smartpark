const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        home: './resources/js/home.js',
        car: './resources/js/car.js',
        setting: './resources/js/setting.js',
        history: './resources/js/history.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'public/js/')
    },
    watch: true
}
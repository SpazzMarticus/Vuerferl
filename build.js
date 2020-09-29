const sass = require('node-sass');
const fs = require('fs');

sass.render({
    file: './scss/style.scss',
}, function (err, result) {
    if (err) {
        throw err;
    }
    fs.writeFile('./docs/assets/css/style.css', result.css, 'utf8', function (err) {
        if (err) {
            throw err;
        }
    });
});
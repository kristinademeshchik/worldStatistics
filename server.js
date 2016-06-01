var express = require('express'),
	csv = require('express-csv'),
    path = require('path'),
    bodyParser = require("body-parser"),
    exphbs = require('express-handlebars'),
    app = express();

app.use(express.static('public'));

app.engine('handlebars', exphbs({
    partialsDir: 'views'
}));

app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.render('index', {});
});


var server = app.listen(process.env.PORT || 3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});

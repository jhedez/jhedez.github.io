var express = require ('express');

//App setup

var app = express();
var server = app.listen(4200, function(){
    console.log('Listening to requests on port 4200')
});

//Static files

app.use(express.static('public'));
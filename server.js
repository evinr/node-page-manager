var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var expressapp     = express();
var bodyParser = require('body-parser');
var exec = require('child_process').exec;

//Configuring middleware
expressapp.use(bodyParser())

//Maps requests to the ./public folder for static assets
expressapp.use(express.static('public'));

//Maps the assets request to the resources/js file
expressapp.use('/assets', express.static(__dirname + '/public/resources'));

//Demo of Cheerio
expressapp.get('/basicGet', function(req, res){
    console.log('Get made...');
    var $ = cheerio.load('<h1> Congratulaitons you won!');
    res.send( $.html());
})

//Demo of Request to post a form
expressapp.post('/doPost', function(req, res){
    console.log(req);
    console.log('name: ' + req.param('username'));

    res.send('The post was successful: ' + req.param('username'));
})


//How to use the command line from the web
expressapp.get('/commandLine', function (req, res) {
    exec('curl https://www.google.com',
        function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        res.send( stdout);
    });
})


//Dynamically string replacement on a file, rather than creating a new page
//the name and config can be replaced via the proxy request and query string 
//parameters.
expressapp.get('/replaceFile', function(req, res) {
    var file = fs.readFileSync('filepath','UTF-8');

    file = file.replace('https://www.google.com/', req.headers.host);
    file = file.replace('http')


    // these are equivalent to res.send()
    res.write(file);
    res.end();
})


//Dynamic file system management
expressapp.get('/list', function(req, res) { //returns a list of app pages
    //lists the apps via the folder structure
    var list;
    var getApps = function () { 
        return new Promise(function(resolve, reject) { 
            
            exec('for i in $(ls ./public/apps); do echo ${i%%/}; done',
                function (error, stdout, stderr) {
                    list = stdout.split('\n');
                    list.pop() // removes the last element, which is empty
                    
                    console.log(list);
                    // return list;
                    
                    // res.send(list);
            });
            resolve(list);
        });
    }

    Promise.all([getApps(), getApps()])
    .catch(function(err){ return console.error('Error in Promises.all()',err); })
    .then(function(msg) {
        // ^^ 'msg' param is an array of returned values from within the resolve above
        console.log(msg); // array of resolve(msg) from above..
        res.send(JSON.stringify(msg))
        
    });


    //lists the config values for each app

    //take object with apps, names, and keys

    //render the UI dynamically
    var $ = cheerio.load('<h1> Congratulaitons you won!');
    res.send( $.html());
})

expressapp.post('/copy', function(req, res) {
    //var arg = req.param('username'); //maps to the 'name' field on the input
    var target = req.param('fileName');//needs to be read via the req
    var command = 'cp -r ./public/apps/' + target + ' ./public/apps/' + target + '-clone';

    //returns a list of app pages
    exec(command,
        function (error, stdout, stderr) {
            // var list = stdout.split('\n');
            res.send('successful');
    });
})

//rename
expressapp.post('/rename', function(req, res) {
    //var arg = req.param('username'); //maps to the 'name' field on the input
    var target = req.param('filePath');//these values need to be from the req
    var newName = req.param('newName');//these values need to be from the req
    var command = 'mv ./public/apps/' + target + ' ./public/apps/' + newName;
    exec(command,
        function (error, stdout, stderr) {
            res.send('successful');
    });
})

//Sets up the listener for the express app
expressapp.listen('8081')

//Splash screen including the Node JS logo ascii art
console.log('................................................................................\n.....................................=====......................................\n..................................===========...................................\n...............................=================................................\n............................===========.===========.............................\n..........................==========.......==========...........................\n.......................===========...........===========........................\n....................===========.................===========.....................\n.................===========.......................===========..................\n...............==========.............................==========................\n............==========...................................==========.............\n.........===========.......................................===========..........\n.......==========.............................................==========........\n......========...................................................========.......\n......=====.........................................................=====.......\n......=====.........................................................=====.......\n......=====..............======........=================............=====.......\n......=====..............======......=====================..........=====.......\n......=====..............======....=========================........=====.......\n......=====..............======....======............=======........=====.......\n......=====..............======...======...............======.......=====.......\n......=====..............======...======................=====.......=====.......\n......=====..............======...========..........................=====.......\n......=====..............======....================.................=====.......\n......=====..............======.....======================..........=====.......\n......=====..............======........=====================........=====.......\n......=====..............======..............================.......=====.......\n......=====..............======........................=======......=====.......\n......=====..............======..======.................======......=====.......\n......=====..............======..======.................======......=====.......\n......=====..............======...======................======......=====.......\n......=====..............======...=========..........========.......=====.......\n......=====..............======.....========================........=====.......\n......=====..............======.......====================..........=====.......\n......=====..............======...........============..............=====.......\n......======.............======.....................................=====.......\n......========...........======..................................========.......\n.......==========........======...............................==========........\n.........===========...=======.............................===========..........\n............==================..........................===========.............\n...............==============.........................==========................\n..................========.........................==========...................\n................................................==========......................\n.............................=====...........===========........................\n...........................==========.....===========...........................\n.............................==========.==========..............................\n................................===============.................................\n...................................==========...................................\n.....................................=====......................................\n................................................................................\n');
console.log('          Node App Page Management Started at localhost:8081');

exports = module.exports = expressapp;
var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var expressapp     = express();
var bodyParser = require('body-parser');
var exec = require('child_process').exec;
var dive = require('dive');

var listValues = [];
var baseDir = '/apps/'; // this is the folder where the pages/apps live that are being managed

//Configuring middleware
expressapp.use(bodyParser())

//Maps requests to the ./public folder for static assets
expressapp.use(express.static('public'));

//Maps the assets request to the resources/js file
expressapp.use('/mock', express.static(__dirname + '/mock-responses'));

//need to be able to store file structure as a global object
var refreshListValues = function () {
    listValues = [];
    dive(process.cwd() + baseDir, { recursive: false, directories: true, files: false }, function(err, dir) {
          if (err) throw err;
          listValues.push(dir.split(baseDir)[1]);
    }); 
}
refreshListValues(); //gets called when the app is loaded for the first time and any time a change to the file structure is changed


//returns an object that lists the file structure, 
expressapp.get('/list', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({ 'files': listValues });
})

//endpoint for serving up the data that is needed to render a full view 
expressapp.get('/data', function(req, res) { 
    res.setHeader('Content-Type', 'application/json');
    var dataObj = {}
    // loop over each of the apps/folders and do a readfile on each of them
    for (var i=0; i < listValues.length; i++) {
        var file = fs.readFileSync('apps/' + listValues[i] + '/config.json', 'utf8');
        var newKey = listValues[i];
        dataObj[newKey] = JSON.parse(file);
    }
    res.send(dataObj);
})


////////////////////// MENU ENDPOINTS: These are used to manipulate the folders/files /////////////////////////////////////////
// used for copying a folder
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
    refreshListValues(); 
})

// used for renaming a folder
expressapp.post('/rename', function(req, res) {
    //var arg = req.param('username'); //maps to the 'name' field on the input
    var target = req.param('filePath');//these values need to be from the req
    var newName = req.param('newName');//these values need to be from the req
    var command = 'mv ./public/apps/' + target + ' ./public/apps/' + newName;
    exec(command,
        function (error, stdout, stderr) {
            res.send('successful');
    });
    refreshListValues(); 
})

// TODO: Add a way to edit anything: Folder name or config value
expressapp.post('/edit', function(req, res) {
    res.send('In progress...');
})

// TODO: Update API key
// Pass the configs to another endpoint on a different server and recieve a new API key 
expressapp.post('/update', function(req, res) {
    res.send('In progress...');
})

//Sets up the listener for the express app
expressapp.listen('8081')

//Splash screen including the Node JS logo ascii art
console.log('................................................................................\n.....................................=====......................................\n..................................===========...................................\n...............................=================................................\n............................===========.===========.............................\n..........................==========.......==========...........................\n.......................===========...........===========........................\n....................===========.................===========.....................\n.................===========.......................===========..................\n...............==========.............................==========................\n............==========...................................==========.............\n.........===========.......................................===========..........\n.......==========.............................................==========........\n......========...................................................========.......\n......=====.........................................................=====.......\n......=====.........................................................=====.......\n......=====..............======........=================............=====.......\n......=====..............======......=====================..........=====.......\n......=====..............======....=========================........=====.......\n......=====..............======....======............=======........=====.......\n......=====..............======...======...............======.......=====.......\n......=====..............======...======................=====.......=====.......\n......=====..............======...========..........................=====.......\n......=====..............======....================.................=====.......\n......=====..............======.....======================..........=====.......\n......=====..............======........=====================........=====.......\n......=====..............======..............================.......=====.......\n......=====..............======........................=======......=====.......\n......=====..............======..======.................======......=====.......\n......=====..............======..======.................======......=====.......\n......=====..............======...======................======......=====.......\n......=====..............======...=========..........========.......=====.......\n......=====..............======.....========================........=====.......\n......=====..............======.......====================..........=====.......\n......=====..............======...........============..............=====.......\n......======.............======.....................................=====.......\n......========...........======..................................========.......\n.......==========........======...............................==========........\n.........===========...=======.............................===========..........\n............==================..........................===========.............\n...............==============.........................==========................\n..................========.........................==========...................\n................................................==========......................\n.............................=====...........===========........................\n...........................==========.....===========...........................\n.............................==========.==========..............................\n................................===============.................................\n...................................==========...................................\n.....................................=====......................................\n................................................................................\n');
console.log('          Node App Page Management Started at localhost:8081');

exports = module.exports = expressapp;
const http = require('http'); // 1 - Import Node.js core module
const https = require('https');
const express = require("express");
const fs = require("fs");
const app = express();
const path = require("path");

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use(express.static(__dirname+'/public'));
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname,'views')));
app.listen(5001, () => {
    console.log("Application started and Listening on port 5001");
});

// server your css as static
//app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.render("index.html");
});

// cannot work as js is not executed
app.get("/races/42/THM2023", (req, res) => {
    //res.setHeader('Content-Type', 'text/html');
    res.header('Content-Type', 'text/html');
    res.render("index.html");
//    fs.readFile(__dirname + '/views/index.html', 'utf8', (err, text) => {
//     res.send(text);
//    });
});


// var server = http.createServer(function (req, res) {   // 2 - creating server
//        // set response header
//        res.writeHead(200, { 'Content-Type': 'text/html' }); 
        
//        // set response content    
//        //res.write('<html><body><p>This is home Page.</p></body></html>');
//        //res.sendFile("index.html");
//        res.render("sendFile")
//        res.end();
// });

//  server.listen(5000); //3 - listen for any incoming requests

//  console.log('Node.js web server at port 5000 is running..')
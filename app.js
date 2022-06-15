const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const path = require('path');
require('dotenv').config();

const Route = require('./routes/route.js');

const config = require('./config.js');

const PORT = process.env.PORT || 5000;

let app = express();

// Body Parser Middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.static(path.join(__dirname, 'client/build')));


global.appRoot = path.resolve(__dirname);

// routing
app.use('/api/lootbox', Route);
// end routing


app.listen(PORT, () => {
    console.log('Server started on port', PORT);
});


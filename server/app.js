/*jshint esversion: 6 */
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ silent: true });
}
// require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const photo = require('./routes/photo');
const album = require('./routes/album');

const portDecision = process.env.PORT || 5000;

app.get('/', function(req, res) {
    res.sendFile(path.resolve('./public/views/index.html'));
});

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use('/album', album);
app.use('/photo', photo);

app.listen(portDecision, function() {
    console.log("Listening on port: ", portDecision);
});
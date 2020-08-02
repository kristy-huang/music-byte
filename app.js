const express = require('express');
const api = require('./routes/api');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

//Set up .env file
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

// CORS Middleware
app.use(cors());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'angular-src/dist')));

//Body Parser Middleware
app.use(bodyParser.json());

app.get('/', (req, res) => {
     res.sendFile(path.join(__dirname, 'angular-src/dist/index.html'));
});

app.get('/welcome', (req, res) => {
     res.sendFile(path.join(__dirname, 'angular-src/dist/index.html'));
});

app.get('/loading', (req, res) => {
     res.sendFile(path.join(__dirname, 'angular-src/dist/index.html'));
});

//Routing to ./routes/api.js
app.use('/api', api);

app.get('*', (req, res) => {
     res.sendFile(path.join(__dirname, 'angular-src/dist/index.html'));
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
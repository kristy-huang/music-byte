const express = require('express');
const api = require('./routes/api');
const bodyParser = require('body-parser');
const cors = require('cors');

//Set up .env file
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

// CORS Middleware
app.use(cors());

// Set Static Folder
app.use(express.static(__dirname, 'dist', { index: false }));

//Body Parser Middleware
app.use(bodyParser.json());

//Home page, only for testing
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

//Routing to ./routes/api.js
app.use('/api', api);

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
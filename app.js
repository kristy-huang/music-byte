const express = require('express');
const mongoose = require('mongoose');
const configdb = require('./config/database');
const authenticate = require('./routes/authenticate');
const bodyParser = require('body-parser');
const cors = require('cors');

require('dotenv').config();

//Connect to database
mongoose.connect(configdb.database, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

//Connected to database successfully
mongoose.connection.on('connected', () => {
    console.log(`Connected to databse ${configdb.database}`);
});

//Error connecting to database
mongoose.connection.on('error', (err) => {
    console.log(`Database error: ${err}`);
});

const app = express();
const port = process.env.port;

// CORS Middleware
app.use(cors());

//Body Parser Middleware
app.use(bodyParser.json());

//Home page, for testing
app.get('/', (req, res) => {
    res.send('test');
});

//Routing to ./routes/authenticate.js
app.use('/user', authenticate);

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
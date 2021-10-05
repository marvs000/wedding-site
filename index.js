const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
const db = require('./config/connection');
const path = require('path');
const favicon = require('serve-favicon')

// Favicon
app.use(favicon(path.join(__dirname,'public','img','favicon.ico')));

// Handlebars
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Parse JSON bodies for this app
app.use(express.json());

// Redirect default route to /api-docs
app.use('/', require('./routes/index'))

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Testing Database Connection
db.authenticate()
    .then(() => console.log('Database connected'))
    .catch(err => console.log(err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`Server started on port: ${PORT}`))

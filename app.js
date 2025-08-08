// modules
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const eventRoutes = require('./routes/eventRoutes');
const mainRoutes = require('./routes/mainRoutes');
const userRoutes = require('./routes/userRoutes');
const methodOverride = require('method-override');
const session = require('express-session')
const MongoStore = require('connect-mongo');
const User = require('./models/user');
const flash = require('connect-flash');

// create app
const app = express();

// configure app
let port = 3009;
let host = 'localhost';
//let url =;;
app.set('view engine', 'ejs');

// connect to the database
mongoose.connect(url)
.then(() => {
    // start the server
    app.listen(port, host, () =>{
        console.log('Server is running on port', port);
    });
})
.catch(err => console.log(err.message));

// middleware
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));


app.use(session({
    secret:'rtretertret', 
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 60*60*1000},
    store: new MongoStore({mongoUrl: url})
}));

app.use(flash());

// middleware to make user and flash messages available in views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.successMessages = req.flash('success');
    res.locals.errorMessages = req.flash('error');
    next();
});

// routes
app.get('/', (req, res) => {
    res.render('./main/index');
})

app.use('/events', eventRoutes);
app.use('/main', mainRoutes);
app.use('/user', userRoutes);

app.use((req, res, next) => {
    let err = new Error('The server cannot locate ' + req.url);
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    console.log(err.stack);
    if(!err.status) {
        err.status = 500;
        err.message = ("Internal Server Error");
    }
    res.status(err.status);
    res.render('error', {error: err});
});
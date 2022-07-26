const cookieParser = require('cookie-parser');
const express = require('express');
const fileUpload = require('express-fileupload');
require('dotenv')
const morgan = require('morgan')
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const app = express();

// Swagger middleware
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Regular middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));


// Cookies and file middleware
app.use(cookieParser());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
}));

// Just for testing
app.set("view engine","ejs");


// Morgan middlewares
app.use(morgan("tiny"));


// Import all routes here:
const home =  require('./routes/home');
const user = require('./routes/user');
const product = require('./routes/product');
const payment = require('./routes/payment');
const order = require('./routes/order');

app.get('/', async(req, res, next) => {
    res.redirect('/api/v1');
});

// Router middlewares:
app.use('/api/v1', home);
app.use('/api/v1', user);
app.use('/api/v1', product);
app.use('/api/v1', payment);
app.use('/api/v1', order)

app.get('/signuptest', (req, res)=>{
    res.render("signuptest");
});

module.exports = app;
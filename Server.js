const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const dbConfig = require('./config/database.config.js');
const Question = require('./models/question.model.js');

const app = express();
const router = express.Router();
const path = __dirname + '/views/';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');  

// Configuring the database
mongoose.Promise = global.Promise;
// Connecting to the database
mongoose.connect(dbConfig.url)
.then(() => {
    console.log('Successfully connected to the database');    
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...');
    process.exit();
});

// Routes
router.use(function (req,res,next) {
  console.log(`${req.method} request for '${req.url}' - ${JSON.stringify(req.body)}`);
  next();
});

router.get('/',function(req,res){
  res.redirect("/questions");
});

router.get('/groups',function(req,res){
  res.sendFile(path + 'groups.html');
});

router.get('/users',function(req,res){
  res.sendFile(path + 'users.html');
});


app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/',router);

require('./routes/question.routes.js')(app);

app.use('*',function(req,res){
  res.sendFile(path + '404.html');
});

app.listen(3000,function(){
  console.log('Live at Port 3000');
});
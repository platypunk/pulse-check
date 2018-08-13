const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const dbConfig = require('./config/database.config.js');
const jwtConfig = require('./config/jwt.config.js');

const app = express();
const router = express.Router();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('superSecret', jwtConfig.secret);
app.use(cors());

// Configuring the database
mongoose.Promise = global.Promise;
// Connecting to the database
mongoose.connect(dbConfig.url, { useNewUrlParser: true })
.then(() => {
  console.log('Successfully connected to the database');    
}).catch(err => {
  console.log('Could not connect to the database. Exiting now...');
  process.exit();
});

// Routes
app.use(function (req,res,next) {
  console.log(`${req.method} request for '${req.url}' - ${JSON.stringify(req.body)}`);
  next();
});

const users = require('./controllers/user.controller.js');
router.post('/authenticate', users.authenticate);

// JWT
if (jwtConfig.enabled) {
  router.use(function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
      jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
        if (err) {
          return res.json({
            success: false, 
            message: 'Failed to authenticate token.' });    
        } else {
          req.decoded = decoded;    
          next();
        }
      });
    } else {
      return res.status(403).send({ 
        success: false, 
        message: 'No token provided.'
      });
    }
  });
}

// exclude webhook from jwt
require('./routes/fb.ext.routes.js')(app);

app.use('/',router);

require('./routes/fb.routes.js')(app);
require('./routes/question.routes.js')(app);
require('./routes/answer.routes.js')(app);
require('./routes/user.routes.js')(app);


app.listen(3000,function(){
  console.log('Live at Port 3000');
});


const Poller = require('./poller.js');
let poller = new Poller(60000); 
poller.onPoll(() => {
    poller.poll();
});
poller.poll();
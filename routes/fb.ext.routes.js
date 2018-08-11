module.exports = (app) => {
    const fb = require('../controllers/fb.controller.js');

    app.get('/fb/receive', fb.verifyMessage);

    app.post('/fb/receive', fb.receiveMessage);
}
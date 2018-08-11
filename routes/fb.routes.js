module.exports = (app) => {
    const fb = require('../controllers/fb.controller.js');

    app.get('/fb/receive', fb.verifyMessage);

    app.post('/fb/receive', fb.receiveMessage);

    app.post('/fb/send', fb.sendMessage);
    
    app.get('/fb/groups', fb.getGroups);

    app.get('/fb/users', fb.getUsers);
}
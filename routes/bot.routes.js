module.exports = (app) => {
    const bot = require('../controllers/bot.controller.js');

    app.get('/fb/receive', bot.verifyMessage);

    app.post('/fb/receive', bot.receiveMessage);
}
module.exports = (app) => {
    const answer = require('../controllers/answer.controller.js');

    app.post('/answers', answer.create);

    app.get('/answers', answer.findAll);

    app.get('/answers/:answerId', answer.findOne);

    app.put('/answers/:answerId', answer.update);

    app.delete('/answers/:answerId', answer.delete);

    app.get('/answer', answer.findAnswer);
}
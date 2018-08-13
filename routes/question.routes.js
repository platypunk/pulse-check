module.exports = (app) => {
    const questions = require('../controllers/question.controller.js');

    app.post('/questions', questions.create);

    app.get('/questions', questions.findAll);

    app.get('/questions/:questionId', questions.findOne);

    app.put('/questions/:questionId', questions.update);

    app.delete('/questions/:questionId', questions.delete);

    app.get('/question', questions.findQuestion);

}
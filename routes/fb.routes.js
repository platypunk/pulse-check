module.exports = (app) => {
    const fb = require('../controllers/fb.controller.js');

    app.get('/fb/groups', fb.getGroups);

    app.get('/fb/members/:groupId', fb.reqMembers);

    app.get('/fb/member/:memberId', fb.getMember);

    app.get('/fb/send/:questionId', fb.sendQuestionNow);
}
module.exports = {
    url: 'https://graph.facebook.com/v3.0/',
    appId: '419639298543215',
    appSecret: 'fc85cf38b6becb17ec2ea8181fdbf124',
    appPageToken: 'DQVJ1TWlDZA0lubTF3U1lQdW9rb2NYc3RKNlBJa2JOZAVpCTTQweWluN2p6R05iOVk5OTZASTGlEZAUQ3Smd4QUctMTYzU2REdVhQVGNkYjdjSE53NXBNNUMxQnliaFhUNWE2TUNmMVYwYTZAnTmlibTk4ellZALXVKNGcxZADJaR0lFd081N0lOdWJTcWh5MXNWZATc5UTN4S1U1bEVKWEl3bHBEVE9tQjQ1R2hxQV9qMmQxZAERHc1ZAIVDc1dUxLaFVqelFWRm9YSjBR',
    verifyToken: 'cowabunga',
    sendMessage: 'me/messages?access_token=%s',
    getGroups: 'community/groups?fields=id,name,picture,privacy,archived,is_workplace_default&access_token=%s',
    getMembers: '%s/members?access_token=%s',
    getMember: '%s?fields=id,name,picture&access_token=%s',
    auth: 'oauth/access_token?client_id=%s&redirect_uri=%s&client_secret=%s&code=%s',
    authRedirect: 'dummy',
    // messages
    answerReceived: 'Your answer has been recorded, thank you',
    answerReceivedComment: 'Your answer has been recorded, do you have any comments? (Yes/No)',
    noUpdate: 'Thank you for your response',
    askComment: 'Please type your comment',
    commentReceived: 'Your comment has been recorded, thank you',
    answerAlreadyExist: 'You already provided an answer for this question, do you want to update your answer? (Yes/No)',
    answerUpdated: 'Your answer has been updated, thank you',
    hello: 'Hello!',
    bye: 'Bye!',
    welcome: 'You\'re welcome!'
}
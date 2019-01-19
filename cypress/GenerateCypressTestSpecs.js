var fs = require('../node_modules/pn/fs')
//var testListManager = require('./support/TestListManager')
var testListManager = require('../build/TestListManager')

var file = 'C:/repo/ConversationLearner-UI/cypress/integration/toolsX'
fs.access(file, fs.constants.F_OK, (err) => {
  console.log(`${file} ${err ? 'does not exist' : 'exists'}`);
});


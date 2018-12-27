const fs = require('../node_modules/cypress/lib/fs')

const authoringKeys =
[
  '11111111111111111111111111111111',
  '22222222222222222222222222222222',
  '33333333333333333333333333333333',
  '44444444444444444444444444444444',
  '55555555555555555555555555555555',
  '7d7048bb12ec4bc59c988cfa855363de',
]

const envFilePath = '../cl-samples/.env'

fs.readFile(envFilePath, (readFileErr, buffer) => 
{
  if (readFileErr) throw readFileErr
  var dataIn = buffer.toString()
  
  var indexStart = dataIn.indexOf('LUIS_AUTHORING_KEY=')
  if (indexStart < 0) throw '"LUIS_AUTHORING_KEY=" not found in .ENV file.'
  indexStart += 'LUIS_AUTHORING_KEY='.length
  var indexEnd = dataIn.indexOf('\n', indexStart)
  
  var randomIndex = Math.floor(Math.random() * 5) + 1
  var luisAuthoringKey = authoringKeys[randomIndex]

  var dataOut = dataIn.substring(0, indexStart) + luisAuthoringKey + dataIn.substring(indexEnd)
  console.log(`The data to write out...\n${dataOut}`);

  fs.writeFile(envFilePath, dataOut, (writeFileErr) => 
  {
    if (writeFileErr) throw writeFileErr;
    console.log('The file has been saved!');
  })
})


//node_modules\cypress\lib\fs.js

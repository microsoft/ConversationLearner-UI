const fs = require('../node_modules/cypress/lib/fs')

const envFilePath = '../cl-samples/.env'

const authoringKeys =
[
  '11111111111111111111111111111111',
  '22222222222222222222222222222222',
  '33333333333333333333333333333333',
  '44444444444444444444444444444444',
  '55555555555555555555555555555555',
]

// Randomly pick a authoring key from array.
var randomIndex = Math.floor(Math.random() * 5) + 1
var luisAuthoringKey = authoringKeys[randomIndex]

// Format the output string
var dataOut = `LUIS_AUTHORING_KEY=${luisAuthoringKey}\n`

// Rewrite the modified file contents back to the same file.
fs.writeFile(envFilePath, dataOut, (writeFileErr) => 
{
  if (writeFileErr) throw writeFileErr;
  console.log('The .env file has been saved!');
})

// fs.readFile(envFilePath, (readFileErr, buffer) => 
// {
//   if (readFileErr) throw readFileErr
//   var dataIn = buffer.toString()

//   // Parse the boundaries of the existing authoring key.
//   var indexStart = dataIn.indexOf('LUIS_AUTHORING_KEY=')
//   if (indexStart < 0) throw '"LUIS_AUTHORING_KEY=" not found in .ENV file.'
//   indexStart += 'LUIS_AUTHORING_KEY='.length
//   var indexEnd = dataIn.indexOf('\n', indexStart)
  
//   // Randomly pick a authoring key from array.
//   var randomIndex = Math.floor(Math.random() * 5) + 1
//   var luisAuthoringKey = authoringKeys[randomIndex]

//   // Format the output string
//   var dataOut = dataIn.substring(0, indexStart) + luisAuthoringKey + dataIn.substring(indexEnd)
//   console.log(`The data to write out...\n${dataOut}`);

//   // Rewrite the modified file contents back to the same file.
//   fs.writeFile(envFilePath, dataOut, (writeFileErr) => 
//   {
//     if (writeFileErr) throw writeFileErr;
//     console.log('The file has been saved!');
//   })
// })


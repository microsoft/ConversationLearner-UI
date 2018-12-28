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

var logString = ''
function Log(message) { console.log(message); }

function ShowFile(filePath)
{
  var buffer = fs.readFileSync(filePath)
  Log(`\n${filePath}:\n${buffer.toString()}`)
}

// Randomly pick a authoring key from array.
var randomIndex = Math.floor(Math.random() * 5) + 1
var luisAuthoringKey = authoringKeys[randomIndex]

// Format the output string
var dataOut = `LUIS_AUTHORING_KEY=${luisAuthoringKey}\n`

// Rewrite the modified file contents back to the same file.
fs.writeFileSync(envFilePath, dataOut)
Log('The .env file has been saved!');

var loc = process.cwd() //document.location.pathname;
Log(`loc: ${loc}`)

// var dir = loc.substring(0, loc.lastIndexOf('/'));
// Log(`dir: ${dir}`)

var files = fs.readdirSync(loc)
Log(`files: ${files}`)

var samplesDir = `${loc}/../cl-samples`
files = fs.readdirSync(samplesDir)
Log(`cl-samples-files: ${files}`)

// ShowFile(`${samplesDir}/.circleci/config.yml`)
// ShowFile(`${samplesDir}/.env`)

// throw "Aborting so I can see what's up"


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


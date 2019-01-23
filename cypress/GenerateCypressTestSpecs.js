var fs = require('../node_modules/pn/fs')

const pathToTestFiles = './cypress/tests'
var fullTestList = []

main()

function main() {
  // Get the test list file that we MIGHT need to modify
  const pathToTestList = './cypress/TestLists.js'
  var testList_jsContents = fs.readFileSync(pathToTestList, 'ascii')
  // console.log(testList_jsContents)
  // console.log()

  // Get the list of test js files.
  var testFileDirectory = fs.readdirSync(pathToTestFiles)
  // console.log(testFileDirectory);
  // console.log()

  // Parse each test js file.
  testFileDirectory.forEach(fileName => { ParseTestJsFile(fileName); })

  // Finalize our findings by re-writing out the TestList.js file ONLY if it has changed.
  var index = testList_jsContents.indexOf('// *** Generated Code Beyond this Point ***')
  var newFileContents =
    '// *** Generated Code Beyond this Point ***\r\n' +
    '// Do NOT manually alter this file from this point onwards.\r\n' +
    '// Any changes you make will be overridden at runtime.\r\n' +
    'const masterListOfAllTestCases = [\r\n' +
  fullTestList.forEach(testSpecification => { newFileContents += `  '${testSpecification}',\r\n` })
  newFileContents += ']\r\n'

  // Only write the file out if something has changed.
  if (!testList_jsContents.endsWith(newFileContents)) {
    newFileContents = testList_jsContents.substring(0, index) + newFileContents;
    console.log(`NEW FILE CONTENTS ARE:\r\n${newFileContents}`)
    fs.writeFileSync(pathToTestList, newFileContents)
  }
  else console.log('NOTHING HAS CHANGED')
}

function ParseTestJsFile(fileName) {
  var fileContents = fs.readFileSync(`${pathToTestFiles}/${fileName}`, 'ascii')
  //console.log(`File ${fileName}:\r\n${fileContents}`)
  
  var fileLines = fileContents.split('\n')
  
  fileLines.forEach(line => {
    line = line.trim()
    if (line.startsWith('Cypress.TestCase(')) {
      var iStart = line.indexOf("'", 17) + 1
      var iEnd = line.indexOf("'", iStart)
      var groupName = line.substring(iStart, iEnd)
  
      iStart = line.lastIndexOf(",") + 1
      iEnd = line.lastIndexOf(')')
      var testName = line.substring(iStart, iEnd).trim()
  
      //console.log(`groupName: ${groupName} - testName: ${testName} - ${line}`);
      CreateSpecFile(groupName, testName)
      fullTestList.push(`${groupName}.${testName}`)
    }
  });
}

function CreateSpecFile(groupName, testName) {
  var folderPath = `./cypress/integration/${groupName}`;
  if (!fs.existsSync(folderPath)) { fs.mkdirSync(folderPath) }
  
  var filePath = `${folderPath}/${testName}.js`;
  if (!fs.existsSync()) {
    var newFileContents = `require('../../support/TestListManager').AddToCypressTestList('${groupName}.${testName}')`;
    fs.writeFileSync(filePath, newFileContents)
  }
}

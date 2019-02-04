/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

// ----------------------------------------------------------------------
// This code is intended to be run via NODE.js.
// It is intended to be started automatically whenever test cases 
// are being initialized to run by Cypress.
//
// This code parses all .js files in the cypress/tests folder.
// It is looking for lines in the files that look like this:
//  Cypress.TestCase(testGroupName, testDescription, testFunction)
//
// It uses that data to create:
//   1) The group subfolders within "cypress/integration".
//   2) An individual test spec file for each, in that same folder as 
//      expected by Cypress.
//   3) The test list "masterListOfAllTestCases" in cypress/TestList.js
// ----------------------------------------------------------------------

var fs = require('fs')

const pathToTestFiles = './cypress/tests'
const pathToTestSpecFiles = './cypress/integration/'
const CypressTestCase = 'Cypress.TestCase('

var fullTestList = []

console.log('--- Generate Cypress Test Spec When Test .js Files Change ---')
main();
WatchAndRun('./cypress/tests', () => {
  console.log(`\r\nDetected a file change in ${pathToTestFiles}`);
  main()
});

// ----------------------------------------------------------------------
// Watch the a folder for changes and when one is found run a function.
// ----------------------------------------------------------------------

function WatchAndRun(pathToWatch, functionToRun) {
  var timeoutHandle;
  var timeOfLastChange;
  
  fs.watch(pathToWatch, (eventType, filename) => {
    var now = new Date();
    if (timeOfLastChange && now - timeOfLastChange < 1000) { clearTimeout(timeoutHandle); }
    timeOfLastChange = now;
    timeoutHandle = setTimeout(functionToRun, 1000)
  });
}

// ----------------------------------------------------------------------

function main() {
  try {
    fullTestList = []

    // Get the test list file that we MIGHT need to modify.
    const pathToTestList = './cypress/TestLists.js';
    var testList_jsContents = fs.readFileSync(pathToTestList, 'utf8');
    // console.log(testList_jsContents)
    // console.log()

    // Get the list of test js files.
    var testFileDirectory = fs.readdirSync(pathToTestFiles);
    // console.log(testFileDirectory);
    // console.log()

    // Parse each test js file.
    testFileDirectory.forEach(fileName => { ParseTestJsFile(fileName); });

    // Finalize our findings by re-writing out the TestList.js file ONLY if it has changed.
    const generatedCode = '// ************ Generated Code Beyond this Point *************************';
    var index = testList_jsContents.indexOf(generatedCode);
    
    // NOTE: We are not using the `special back-tick quote syntax` because it does not put 
    //       \r (carriage return) in the string yet we need to have them.
    var newFileContents = generatedCode + '\r\n' +
      '// Do NOT manually alter this file from this point onwards.\r\n' +
      '// Any changes you make will be overridden at runtime.\r\n' +
      'export const masterListOfAllTestCases = [\r\n';

    fullTestList.forEach(testSpecification => { newFileContents += `  '${testSpecification}',\r\n` });
    newFileContents += '];\r\n';
    
    // Only write the file out if something has changed.
    if (!testList_jsContents.endsWith(newFileContents)) {
      newFileContents = testList_jsContents.substring(0, index) + newFileContents;
      fs.writeFileSync(pathToTestList, newFileContents, 'utf8');
      console.log(`TestList.js has been re-generated`);
      RemoveUnusedSpecFiles();
    }
    else console.log('NOTHING HAS CHANGED')
  }
  catch(error) { console.log(`Caught an Exception:\r\n${error}`)}
}

// ----------------------------------------------------------------------

function ParseTestJsFile(fileName) {
  var fileContents = fs.readFileSync(`${pathToTestFiles}/${fileName}`, 'utf8')
  //console.log(`File ${fileName}:\r\n${fileContents}`)
  
  var fileLines = fileContents.split('\n')
  
  fileLines.forEach(line => {
    line = line.trim()
    if (line.startsWith(CypressTestCase)) {
      // The line we are parsing will look something like this:
      //    Cypress.TestCase('Tools', 'Visit Home Page', VisitHomePage)
      var iStart = line.indexOf("'", CypressTestCase.length) + 1
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

// ----------------------------------------------------------------------

function CreateSpecFile(groupName, testName) {
  var folderPath = `${pathToTestSpecFiles}/${groupName}`;
  if (!fs.existsSync(folderPath)) { fs.mkdirSync(folderPath) }
  
  var filePath = `${folderPath}/${testName}.js`;
  if (!fs.existsSync(filePath)) {
    var newFileContents = `require('../../support/TestListManager').AddToCypressTestList('${groupName}.${testName}')`;
    fs.writeFileSync(filePath, newFileContents)
    console.log(`New spec file generated: ${filePath}`)
  }
}

// ----------------------------------------------------------------------
// We intentionally skip the root Cypress test spec folder because the 
// root folder contains special hand coded spec files. We only delete
// spec .js files from the group subfolders that are no longer in our 
// list of tests because those folders should only contain generated 
// files.
// ----------------------------------------------------------------------

function RemoveUnusedSpecFiles() {
  var nothingWasDeleted = true
  // Get a list of directory entries for folders under the Cypress test spec file.
  var directoryEntries = fs.readdirSync(pathToTestSpecFiles, {withFileTypes: true});

  directoryEntries = directoryEntries.filter(directoryEntry => directoryEntry.isDirectory());
  
  directoryEntries.forEach(directoryEntry => {
    var workingPath = `${pathToTestSpecFiles}${directoryEntry.name}`;
    var specFileList = fs.readdirSync(workingPath);
    
    specFileList.forEach(specFileName => {
      if(specFileName.endsWith('.js')) {
        var groupFileSpecification = `${directoryEntry.name}.${specFileName.substring(0, specFileName.length - 3)}`;
        if(!fullTestList.find(testSpecification => testSpecification === groupFileSpecification)) {
          fs.unlinkSync(`${workingPath}/${specFileName}`)
          console.log(`Deleted: ${workingPath}/${specFileName}`);
          nothingWasDeleted = false;
        }
      }
    });
  });
  if (nothingWasDeleted) console.log('No spec file was deleted.')
}

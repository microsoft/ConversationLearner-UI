/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

// ----------------------------------------------------------------------
// *** NOTE: Order of "require" statements is important in this file. ***
// ----------------------------------------------------------------------

var fullTestList = new Array()
var testGroups = new Array()

Cypress.TestCase = TestCase
const helpers = require('./Helpers')
//var fs = require('../../node_modules/pn/fs')

const tools = require('../tests/Tools')
const createModels = require('../tests/CreateModels')
const deleteAllTestGeneratedModels = require('../tests/DeleteAllTestGeneratedModels')
const editAndBranching = require('../tests/EditAndBranching')
const log = require('../tests/Log')
const train = require('../tests/Train')

const http = require('http')

// Update the TestList.js file, but only if some part of the masterListOfAllTestCases has changed.
const pathToTestList = 'TestList.js'

http.get('http://127.0.0.1:3000/read?file=./cypress/TestList.js', response =>
{
  var fileContents = [];
  response.on('error', (err) => {
    console.error(err);
  }).on('data', (chunk) => {
    helpers.ConLog('TestListManager', `got a chunk`)
    fileContents.push(chunk);
  }).on('end', () => {
    helpers.ConLog('TestListManager', `Length: ${fileContents.length}`)
    fileContents = Buffer.concat(fileContents).toString();

    helpers.ConLog('TestListManager', `File Contents: ${fileContents}`)

    var index = fileContents.indexOf('// *** Generated Code Beyond this Point ***')
    var newFileContents =
      '// *** Generated Code Beyond this Point ***\r\n' +
      '// Do NOT manually alter this file from this point onwards.\r\n' +
      '// Any changes you make will be overridden at runtime.\r\n' +
      'const masterListOfAllTestCases =\r\n' +
      '[\r\n'
    fullTestList.forEach(testSpecification => { newFileContents += `'${testSpecification}',\r\n` })
    newFileContents += '[\r\n'

    // Only write the file out if something has changed.
    if (!fileContents.endsWith(newFileContents)) 
    {
      newFileContents = fileContents.substring(0, index) + newFileContents
      var request = http.request(`http://127.0.0.1:3000/write?file=./cypress/TestList.js`, {method: 'PUT'}, response => {});
      request.on('error', (error) => {
        throw error;
      });
      request.write(newFileContents);
      request.end();
      helpers.ConLog('TestListManager', 'TestList.js has been re-written')
    }
  });
});


Cypress.testList = require('../TestList').testList

function TestCase(testGroupName, testDescription, testFunction)
{
  helpers.ConLog('TestListManager', `TestCase(${testGroupName}, ${testDescription}, ${testFunction})`)
  
  var testGroup = GetTestGroup(testGroupName)
  if (!testGroup)
  {
    testGroup = { name: testGroupName, tests: new Array() }
    testGroups.push(testGroup)
  }

  var test = { name: testDescription, func: testFunction }
  testGroup.tests.push(test)

  // .func looks something like this, "function FuncName() {..."
  var testFunctionName = testFunction.toString()
  var i = testFunctionName.indexOf('(', 10)
  testFunctionName = testFunctionName.substring(9,i)
  fullTestList.push(`${testGroupName}.${testFunctionName}`)
}


export function AddToCypressTestList(testList) 
{
  var funcName = `AddToCypressTestList()`
  helpers.ConLog(funcName, `List of Tests: ${testList}`)
  
  if (!Array.isArray(testList)) testList = [testList]
  
  var testListIterator = new TestListIterator(testList)
  
  var test = testListIterator.next
  while (test != undefined)
  {
    helpers.ConLog(funcName, `Adding Group: ${test.group}`)
    describe(test.group, () =>
    {
      var currentGroupName = test.group
      while (test != undefined && test.group == currentGroupName)
      {
        helpers.ConLog(funcName, `Adding Test Case: ${test.name}`)
        it(test.name, test.func)
        test = testListIterator.next
      }
    })
  }
}

class TestListIterator
{
  constructor(testList)
  {
    this.testList = testList
    this.index = 0
    this.currentGroup = {name: ''}
  }

  // groupName.testName - 'testName' from 'groupName'
  // TODO: Add support for these wild card versions
  // *.*                - All Groups, All Tests
  // *.testName         - All tests with all groups matching 'testName'
  // groupName.*        - All tests from 'groupName'
  get next()
  {
    if (this.index >= this.testList.length) return undefined

    var x = this.testList[this.index].split('.')
    if (x.length != 2) throw `Invalid item in testList[${this.index}]: "${this.testList[this.index]}" - 'group DOT testName' format is expected`
    var groupName = x[0]
    var testName = x[1]

    if (this.currentGroup.name != groupName)
    {
      this.currentGroup = GetTestGroup(groupName)
      if (this.currentGroup == undefined) throw `Group '${groupName}' NOT found in testGroups`
    }
    
    var test = GetTest(this.currentGroup, testName)
    if (test == undefined) throw `Test '${testName}' NOT found in test group '${groupName}'`

    this.index++
    return {group: this.currentGroup.name, name: test.name, func: test.func}
  }
}

function GetTestGroup(name)
{
  for (var i = 0; i < testGroups.length; i++)
  {
    if (testGroups[i].name == name) 
    {
      return testGroups[i]
    }
  }
  return undefined
}

function GetTest(testGroup, testNameToFind)
{
  for (var i = 0; i < testGroup.tests.length; i++)
  {
    // .func looks something like this, "function FuncName() {..."
    if (`${testGroup.tests[i].func}`.substring(9).startsWith(testNameToFind))
    {
      return testGroup.tests[i]
    }
  }
  return undefined
}



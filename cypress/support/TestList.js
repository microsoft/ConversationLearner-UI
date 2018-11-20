/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const createModels = require('../tests/CreateModels')
const train = require('../tests/Train')
const log = require('../tests/Log')
const editAndBranching = require('../tests/EditAndBranching')
const helpers = require('./Helpers')
const path = require('path')
const pathParse = require('path-parse')

// NOTE: The function name specified by 'func' below must match the root of the
//       file name that calls AddToCypressTestList(). Also the direct parent
//       folder of the caller must match the test group name
export const testGroups =
  [
    {
      name: 'CreateModels', tests:
        [
          { name: "All Entity Types", func: createModels.AllEntityTypes },
          { name: "Disqualifying Entities", func: createModels.DisqualifyingEntities },
          { name: "Wait vs No Wait Action Tests", func: createModels.WaitVsNoWaitActions },
          { name: "What's Your Name", func: createModels.WhatsYourName },
        ]
    },
    {
      name: 'EditAndBranching', tests:
        [
          { name: "Verify Edit Training Controls and Labels", func: editAndBranching.VerifyEditTrainingControlsAndLabels },
          { name: "Branching", func: editAndBranching.Branching },
        ]
    },
    {
      name: 'Log', tests:
        [
          { name: "What's Your Name", func: log.WhatsYourName },
        ]
    },
    {
      name: 'Train', tests:
        [
          { name: "Disqualifying Entities", func: train.DisqualifyingEntities },
          { name: "Wait vs No Wait Action", func: train.WaitVsNoWaitActions },
          { name: "What's Your Name 1", func: train.WhatsYourName1 },
          { name: "What's Your Name 2", func: train.WhatsYourName2 },
        ]
    },
  ]

// This function adds test cases to Cypress' test queue. It uses the file path of the calling 
// function to determine the group name and the test function name. "(All)" is used as a special 
// name that will cause this method to include all tests for that group to be added to Cypress'
// test queue. The folder name "Tests", with the file name "(All)" is reserved to be used to 
// include all groups all test groups to be added to Cypress' test queue.
//
// The parenthesis in "(All)" is intended to keep the "All Tests" option at the top of Cypress'
// test case list since it is produced in alphabetical order.
export function AddToCypressTestList() {
  var funcName = `AddToCypressTestList()`
  //                                                                              test group name--\      /--Test function name
  // callerFileName looks like: http://localhost:5050/__cypress/tests?p=cypress\integration\Tests\Train\WhatsYourName1.js-044
  var callerFileName = GetCallerFileName()
  callerFileName = path.normalize(callerFileName.substring(callerFileName.lastIndexOf("p=") + 2, callerFileName.lastIndexOf("-"))).replace(/\\/g, path.sep)
  helpers.ConLog(funcName, `callerFileName: ${callerFileName}`)

  const parsed = pathParse.posix(callerFileName)
  const testName = parsed.name
  const testGroupName = parsed.dir.substr(parsed.dir.lastIndexOf(path.sep) + 1)

  var allTests = (testName == '(All)')
  var allGroups = (allTests && testGroupName == 'Tests')
  var toFind = `function ${testName}(`
  helpers.ConLog(funcName, `testGroup: ${testGroupName} - testName: ${testName} - allTests: ${allTests} - allGroups ${allGroups} - toFind: ${toFind}`)

  var group
  for (var i = 0; i < testGroups.length; i++) {
    if (allGroups || testGroups[i].name == testGroupName) {
      group = testGroups[i]

      var test
      describe(group.name, () => {
        helpers.ConLog(funcName, `Added Group: ${group.name}`)
        for (var i = 0; i < group.tests.length; i++) {
          if (allTests || `${group.tests[i].func}`.startsWith(toFind)) {
            test = group.tests[i]
            it(test.name, test.func)
            helpers.ConLog(funcName, `Added Test Case: ${test.name}`)
            if (!allTests) break
          }
        }
        if (!test) throw `Cannot find Test: ${testName} in Test Group: ${testGroupName}`
      })

      if (!allGroups) break
    }
  }
  if (!group) throw `Cannot find Test Group: ${testGroupName}`
}

export function AddToCypressTestList2(testList) 
{
  var funcName = `AddToCypressTestList2()`
  helpers.ConLog(funcName, 'Start')
  
  var testIterator = new TestIterator(testList)
  
  var test = testIterator.next
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
        test = testIterator.next
      }
    })
  }
}

class TestIterator
{
  constructor(testList)
  {
    this.testList = testList
    this.index = 0
    this.currentGroup = {name: ''}
  }

  // *.*                - All Groups, All Tests
  // *.testName         - All tests with all groups matching 'testName'
  // groupName.*        - All tests from 'groupName'
  // groupName.testName - 'testName' from 'groupName'
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
  var toFind = `function ${testNameToFind}(`
  for (var i = 0; i < testGroup.tests.length; i++)
  {
    if (`${testGroup.tests[i].func}`.startsWith(toFind)) 
    {
      return testGroup.tests[i]
    }
  }
  return undefined
}

function GetCallerFileName() {
  var funcName = `GetCallerFileName()`
  var originalFunc = Error.prepareStackTrace;
  var callerFileName;

  try {
    var err = new Error();

    Error.prepareStackTrace = function (err, stack) { return stack; };

    var currentFileName = err.stack.shift().getFileName();
    helpers.ConLog(funcName, `currentFileName: ${currentFileName}`)

    while (err.stack.length) {
      callerFileName = err.stack.shift().getFileName();
      helpers.ConLog(funcName, `callerFileName: ${callerFileName}`)
      if (currentFileName !== callerFileName) break;
    }
  } catch (e) { }

  Error.prepareStackTrace = originalFunc;

  return callerFileName;
}


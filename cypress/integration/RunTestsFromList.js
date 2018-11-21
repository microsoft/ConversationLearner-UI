/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const helpers = require('../support/Helpers')
const addToCypressTestList = require('../support/TestList')
const testList = require('/temp/TestsToRun')

addToCypressTestList.AddToCypressTestList2(testList.testList) 

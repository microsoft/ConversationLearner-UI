/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/
const models = require('../../support/Models')
const helpers = require('../../support/Helpers')

if (!window.skipDescribeIt) 
{
  alert('Gonna Describe It!')
  helpers.ConLog(`window.skipDescribeIt`, 'Gonna Describe It!')
  describe('Tools', () => { it('Dummy', Dummy) })
}

helpers.ConLog(`Dummy.js`, 'Between Describe It and Dummy Function Declaration')

export function Dummy()
{
  alert('dummy')
  helpers.ConLog(`Dummy`, 'start')
  models.CreateNewModel('z-Dummy')
}

alert('Dummy.js END')
helpers.ConLog(`Dummy.js`, 'END')

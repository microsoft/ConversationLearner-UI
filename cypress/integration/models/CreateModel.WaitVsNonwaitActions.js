/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../../support/Models')
const actions = require('../../support/Actions')

// Wait Action: After the system takes a "wait" action, it will stop taking actions and wait for user input.
// Non-wait Action: After the system takes a "non-wait" action, it will immediately choose another action (without waiting for user input)
describe('Create Model for Wait vs No Wait Action Tests', () => 
{
  it('Create Model for Wait vs No Wait Action Tests', () => 
  {
    models.CreateNewModel('Model-0wait')
    
    // NOTE: the {enter} in these strings are necessary to triger the entity detection.
    actions.CreateNewAction({response: 'Which animal would you like?'})
    actions.CreateNewAction({response: 'Cows say moo!', uncheckWaitForResponse: true})
    actions.CreateNewAction({response: 'Ducks say quack!', uncheckWaitForResponse: true})
  })
})

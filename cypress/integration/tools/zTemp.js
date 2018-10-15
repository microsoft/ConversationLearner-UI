/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/
const homePage = require('../../support/components/HomePage')
const actions = require('../../support/Actions')

describe('zzTemp test', () =>
{
  it('zzTemp test', () => 
  {
    homePage.Visit()
    cy.pause()
    actions.CreateNewAction({response: 'Hey $name{enter}, what do you really want?', disqualifyingEntities: ['name', 'want']})
  })
})

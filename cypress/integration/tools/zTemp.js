/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/
const homePage = require('../../support/components/HomePage')
const actions = require('../../support/Actions')
const actionsGrid = require('../../support/components/ActionsGrid')

describe('zzTemp test', () =>
{
  it('zzTemp test', () => 
  {
    var response = "Sorry $name{enter} I can't help you $want{enter}"
    response = response.replace(/{enter}/g, '')
    console.log(response)

    homePage.Visit()

    cy.pause()
    actions.CreateNewAction({response: 'Hey $name{enter}, what do you really want?', disqualifyingEntities: ['garbage', 'want']})
    actions.CreateNewAction({response: "Sorry $name{enter} I can't help you $want{enter}"})

    // actionsGrid.SetResponseDetailsRowAlias("Sorry $name I can't help you $want")
    // actionsGrid.ValidateRequiredEntities(['name', 'want', 'newbe'])
  })
})

// var response = "Sorry $name{enter} I can't help you $want{enter}"
// var requiredEntitiesFromResponse = response.match(/(?<=\$)[^ ]+?(?={enter})/g)
// console.log(requiredEntitiesFromResponse)
// if (requiredEntitiesFromResponse == undefined) console.log('Undefined')
// if (requiredEntitiesFromResponse.length == 0) console.log('Zero Length')

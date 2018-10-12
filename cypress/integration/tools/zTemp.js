/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/
const homePage = require('../../support/components/HomePage')
const modelPage = require('../../support/components/ModelPage')
const actions = require('../../support/components/ActionsPage')
const actionsModal = require('../../support/components/ActionsModal')
const entitiesPage = require('../../support/components/EntitiesPage')
const entityModal = require('../../support/components/EntityModal')
const logDialogPage = require('../../support/components/logdialogspage')
const scorerModal = require('../../support/components/MemoryTableComponent')
const memoryTableComponent = require('../../support/components/scorermodal')
const trainDialogPage = require('../../support/components/traindialogspage')
const editDialogModal = require('../../support/components/editdialogmodal')
const helpers = require('../../support/helpers')
const entities = require('../../support/Entities')

describe('zzTemp test', () =>
{
  it('zzTemp test', () => 
  {
    homePage.Visit()
    // homePage.NavigateToModelPage('000-Playground')
    // entityType = 'phonenumber'
    // entities.CreateNewEntity({name: `my-${entityType}`, type: entityType})
  })
})

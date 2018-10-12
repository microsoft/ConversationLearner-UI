/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const helpers = require('../../support/helpers.js')
const actions = require('../../support/components/ActionsPage')
const actionsModal = require('../../support/components/ActionsModal')
const entitiesPage = require('../../support/components/EntitiesPage')
const entityModal = require('../../support/components/EntityModal')
const homePage = require('../../support/components/HomePage')
const modelPage = require('../../support/components/ModelPage')
const models = require('../../support/Models')
const entities = require('../../support/Entities')

const logDialogPage = require('../../support/components/logdialogspage')
const scorerModal = require('../../support/components/scorermodal')
const trainDialogPage = require('../../support/components/traindialogspage')
const editDialogModal = require('../../support/components/editdialogmodal')

describe('Create All Entity Types', () =>
{
  const customEntity01 = "programmaticonlyentity"
  const customEntity02 = "multivaluedentity"
  const customEntity03 = "negatable-entity"

  it('Create Custom and Builtin Entities', () =>
  {
    models.CreateNewModel(`Model-aet-${helpers.ModelNameTime()}`)

    entities.CreateNewEntity({name: 'multiValuedEntity', multiValued: true})
    entities.CreateNewEntity({name: 'negatableEntity', negatable: true})
    
    entities.entityTypes.forEach(entityType => { entities.CreateNewEntity({name: `my-${entityType}`, type: entityType}) })
  })
})

/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const helpers = require('../../support/helpers.js')
const models = require('../../support/Models')
const entities = require('../../support/Entities')

<<<<<<< HEAD
/// Description: Create every entity type possible
/// Verifications: Entity Creation
describe('Create All Entity Types', () =>
{
=======
describe('Create All Entity Types', () =>
{
  after(() => { cy.VerifyMonitorFinds() })
  
>>>>>>> origin/master
  it('Create Custom and Builtin Entities', () =>
  {
    models.CreateNewModel(`Model-aet-${helpers.ModelNameTime()}`)

    entities.CreateNewEntity({name: 'multiValuedEntity', multiValued: true})
    entities.CreateNewEntity({name: 'negatableEntity', negatable: true})
    
    entities.entityTypes.forEach(entityType => { entities.CreateNewEntity({name: `my-${entityType}`, type: entityType}) })
  })
})

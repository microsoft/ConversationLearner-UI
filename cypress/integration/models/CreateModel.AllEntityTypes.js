/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../../support/Models')
const entities = require('../../support/Entities')

/// Description: Create every entity type possible
/// Verifications: Entity Creation
describe('Create All Entity Types', () =>
{
  it('Create Custom and Builtin Entities', () =>
  {
    models.CreateNewModel('Model-aet')

    entities.CreateNewEntity({name: 'multiValuedEntity', multiValued: true})
    entities.CreateNewEntity({name: 'negatableEntity', negatable: true})
    
    entities.entityTypes.forEach(entityType => { entities.CreateNewEntity({name: `my-${entityType}`, type: entityType}) })
  })
})

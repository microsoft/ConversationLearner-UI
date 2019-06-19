/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as entities from '../../../support/Entities'
import * as entitiesGrid from '../../../support/components/EntitiesGrid'
import * as entitiesModal from '../../../support/components/EntityModal'
import * as helpers from '../../../support/Helpers'

describe('Edit and Delete Entities - EntitiesActions', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Should import a model to test against', () => {
      models.ImportModel('z-EditDelete', 'z-disqualifyngEnt.Trained.cl')
    })
  })

  context('"name" Entity', () => {
    it('Should edit an existing entity and verify the Entity Type field is disabled', () => {
      modelPage.NavigateToEntities()
      entitiesGrid.EditEntity('name')
      entitiesModal.VerifyEntityTypeDisabled()
    })

    it('Should verify "Required For Action" tab contains expected Action details', () => {
      x('Hey $name', 'TEXT', ['name'], ['sweets', 'want'], undefined, true)
    })

    it('Should ', () => {
    })

    it('Should ', () => {
    })

    it('Should ', () => {
    })

    it('Should ', () => {
    })

    it('Should ', () => {
    })

  })
})
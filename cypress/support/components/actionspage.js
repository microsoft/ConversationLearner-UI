/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

/** Click on create a new action button */
function createNew() {
  cy
    .get('[data-testid="actions-button-create"]')
    .click();
}
export {createNew};
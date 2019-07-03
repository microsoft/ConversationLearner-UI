export function VerifyExactTitleNoContentClickButton(expectedTitle, buttonSelector) { 
  cy.Get(buttonSelector)
    .parents('div.ms-Dialog-main')
    .find('p.ms-Dialog-title')
    .ExactMatch(expectedTitle)
    .parents('div.ms-Dialog-main')
    .find('.ms-Dialog-content')
    .ExactMatch('')
    .parents('div.ms-Dialog-main')
    .find(buttonSelector)
    .Click() 
}

export function VerifyExactTitleAndContentContainsClickButton(expectedTitle, expectedContent, buttonSelector) { 
  cy.Get(buttonSelector)
    .parents('div.ms-Dialog-main')
    .find('p.ms-Dialog-title')
    .ExactMatch(expectedTitle)
    .parents('div.ms-Dialog-main')
    .find('.ms-Dialog-content')
    .contains(expectedContent)
    .parents('div.ms-Dialog-main')
    .find(buttonSelector)
    .Click() 
}

export function VerifyContentAnyTitleClickButton(expectedContent, buttonSelector) { 
  cy.Get(buttonSelector)
    .parents('div.ms-Dialog-main')
    .find('.ms-Dialog-content')
    .contains(expectedContent)
    .parents('div.ms-Dialog-main')
    .find(buttonSelector)
    .Click() 
}

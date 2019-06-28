export function VerifyExactTitleClickButton(expectedTitle, buttonSelector) { 
  cy.Get(buttonSelector)
    .parents('div.ms-Dialog-main')
    .find('p.ms-Dialog-title')
    .ExactMatch(expectedTitle)
    .parents('div.ms-Dialog-main')
    .find(buttonSelector)
    .Click() 
}

export function VerifyContentClickButton(expectedContent, buttonSelector) { 
  cy.Get(buttonSelector)
    .parents('div.ms-Dialog-main')
    .find('.ms-Dialog-content')
    .contains(expectedContent)
    .parents('div.ms-Dialog-main')
    .find(buttonSelector)
    .Click() 
}

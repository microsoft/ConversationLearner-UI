
export const constants = {
    // TODO: See why setting this as baseUrl in cypress.json doesn't work for cy.visit()
    baseUrl: 'http://localhost:3000',
    spinner: {
        timeout: 120000
    },
    prediction: {
        timeout: 60000
    },
    keys: {
        tab: 9,
        up: 38,
        down: 40,
    },
    events: {
        selectWord: 'Test_SelectWord',
    },
}

export default constants
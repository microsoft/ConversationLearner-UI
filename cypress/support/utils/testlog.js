/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

function logResult(result) {
    console.log(`${now()} - Test ${result.state}...`);
}

function logStep(description) {
    console.log(`${now()} ====>> ${description}...`);
}

function logTestHeader(testName) {
    console.log(`${now()} ${"*".repeat(60)}`);
    console.log(`${now()} <== ${testName} ==>`);
    
}

function logError(err) {
    console.log(`${now()} - ${"-".repeat(30)}>`)
    console.error(`${now()} - ${err.stack} `);
    console.log(`${now()} - <${"-".repeat(30)}`)
}

function now() {
    return Cypress.moment().format("MMMDD-HH:mm.ss");
}

export { now, logResult, logTestHeader, logError, logStep }
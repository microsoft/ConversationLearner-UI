/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

function printResult(result) {
    console.log(`${now()} - Test ${result.state}...`);
}

function printStep(description) {
    console.log(`${now()} ====>> ${description}...`);
}

function testHeader(testName) {
    console.log(`${now()} ${"*".repeat(60)}`);
    console.log(`${now()} <== ${testName} ==>`);
    
}

function reportError(err) {
    console.log(`${now()} - ${"-".repeat(30)}>`)
    console.log(`${now()} - ${err.stack} `);
    console.log(`${now()} - <${"-".repeat(30)}`)
}

function now() {
    return Cypress.moment().format("MMMDD-HH:mm.ss");
}

export { now, printResult, testHeader, reportError, printStep }
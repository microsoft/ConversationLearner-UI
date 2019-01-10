/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const homePage = require('../support/components/HomePage')
const helpers = require('../support/Helpers')

export function DeleteAllTestGeneratedModels() {
  homePage.Visit()
  cy.WaitForStableDOM()

  // We must "Enqueue" this function call so that Cypress will have one "Cypress Command" 
  // still running when the DeleteAllRows function exits. If not for this, only one row will
  // get deleted then test execution will stop.
  cy.Enqueue(DeleteAllTestGeneratedModelRows).then(() => { helpers.ConLog(`Delete All Test Generated Models`, `DONE - All test generated models have been Deleted`) })
}

function xDeleteAllTestGeneratedModelRows() {
  var indexNextPotentialRowToDelete = 0

  function DeleteATestGeneratedModelRow(resolve) {
    var thisFuncName = `DeleteATestGeneratedModelRow`
    helpers.ConLog(thisFuncName, `Trying to find a test generated model to delete...`)

    homePage.DeleteNextTestGeneratedModel(indexNextPotentialRowToDelete).then(indexNextRow => {
      helpers.ConLog(thisFuncName, `returned from homePage.DeleteNextTestGeneratedModel: ${indexNextRow}`)
      if (!indexNextRow) {
        helpers.ConLog(thisFuncName, `DONE - there are no more test generated models to delete`)
        return resolve()
      }

      indexNextPotentialRowToDelete = indexNextRow
      helpers.ConLog(thisFuncName, `nextRow: ${indexNextRow} - nextPotentialRowToDelete: ${indexNextPotentialRowToDelete}`)
      DeleteATestGeneratedModelRow(resolve)
    })
  }

  return new Promise((resolve) => { DeleteATestGeneratedModelRow(resolve) })
}

function DeleteAllTestGeneratedModelRows() {
  var thisFuncName = `DeleteAllTestGeneratedModelRows`
  var modelNameIdList = homePage.GetModelNameIdList()

  modelNameIdList.forEach(model => {

    cy.request({ url: `http://localhost:3978/sdk/app/${model.modelId}`, method: "DELETE", headers: { 'x-conversationlearner-memory-key': 'x' } }).then(resp => { cy.ConLog(resp.status); })

  })

  /*
    for (var i = 0; i < modelNameIdList.length; i++) {
      helpers.ConLog(thisFuncName, `modelName: ${modelNameIdList[i].modelName} - modelId: ${modelNameIdList[i].modelId}`)
      if (modelNameIdList[i].modelName.startsWith('z-')) {
        // var xhttp = new XMLHttpRequest();
        // xhttp.onreadystatechange = () =>
        // {
        //   if (this.readyState == 4 && this.status == 200) {
        //     todo    document.getElementById("demo").innerHTML = this.responseText;
        //   }
        // }
  
        // xhttp.open(`DELETE`, `http://localhost:3978/sdk/app/${modelNameIdList[i].modelId}`);
        // xhttp.setRequestHeader("x-conversationlearner-memory-key", "any value will do");
        // xhttp.send();
  
        cy.request(
          {
            url: `http://localhost:3978/sdk/app/${modelNameIdList[i].modelId}`,
            headers: { 'x-conversationlearner-memory-key': 'x' }
          }).then((resp) => {
            expect(resp.status).to.eq(200)
            helpers.ConLog(thisFuncName, `Delete request completed for modelName: ${modelNameIdList[i].modelName}`)
          })
      }
    }
  */

}

/*
function zapAllModelsFromListview()
{
  document.querySelectorAll(`[data-testid="model-list-model-name"]`).forEach(node =>
  {
    axios({ url:`http://localhost:3978/sdk/app/${node.getAttribute("data-model-id")}`, method:"delete", headers:{ "x-conversationlearner-memory-key":"xx" }})
  });
  setTimeout(function() { window.location.reload(), 2000 })
}
  var ax=document.createElement("script");
  ax.setAttribute("type","text/javascript");
  ax.setAttribute("src", "https://unpkg.com/axios/dist/axios.min.js");
  ax.setAttribute("onload", "zapAllModelsFromListview()");
  document.getElementsByTagName("head")[0].appendChild(ax);
*/
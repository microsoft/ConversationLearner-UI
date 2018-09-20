/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
* Licensed under the MIT License.
*/

describe('zShowDOM', function () {
    it('Shows DOM', () => {
        cy.visit('http://localhost:5050')
        
        /*
        var accumulatorString = ""
        var intervalHandle = setInterval(() => {
            console.log(window.document)
            cy.document().then((doc) => {
                accumulatorString = accumulatorString + "/n" + doc
                return
            })
        }, 200)
        setTimeout(() => {clearInterval(intervalHandle)}, 10000)
        //setTimeout(() => {console.log(accumulatorString)}, 11000)
        */
        var endTime = new Date().getTime() + 10000
        var lastChangeTime = new Date().getTime()
        var lastHtml = Cypress.$('html')[0].outerHTML
        console.log(new Date())
        cy.get('[data-list-index="0"]', {timeout: 15000}).should((obj) => 
        {
            //console.log(new Date().getTime())
            //cy.document().then((doc) => {console.log(doc)})
            //console.log(Cypress.$('html')[0].outerHTML)
            var currentHtml = Cypress.$('html')[0].outerHTML
            if(currentHtml != lastHtml)
            {
                var currentTime = new Date().getTime()
                console.log(new Date())
                console.log("Milliseconds since last change: " + (currentTime - lastChangeTime))
                lastChangeTime = currentTime
                lastHtml = currentHtml
                console.log(currentHtml)
            }
            expect(new Date().getTime()).greaterThan(endTime)
        })
        cy.wait(10000)
      })    
})
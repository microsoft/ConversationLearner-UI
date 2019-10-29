/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as CLM from '@conversationlearner/models'
import * as ObiDialog from './obiDialogParser'
import * as Util from './util'
import * as fs from 'fs-extra'
import * as klaw from 'klaw-sync'
import * as fspath from 'path'

describe('obiDialogParser', () => {
    function pathRelativeToCurrentFile(inputPath: string): string {
        const thisFilePath = module.filename
        const thisFileDir = fspath.dirname(fspath.resolve(thisFilePath))
        return fspath.join(thisFileDir, inputPath)
    }

    /**
     * Given a path __relative to this test file__, returns a `File` object wrapping that file.
     */
    function pathToFileObject(path: string): File {
        const content = fs.readFileSync(path)
        return new File([content], path)
    }

    describe('Dialog reconstruction test', () => {
        /**
         * This tests the reconstruction of a ProductKey dialog that has some complex properties,
         * such as `SwitchCondition` nodes, `ScorerSteps` that need to be appended to previous
         * `TrainDialogRounds`.
         */
        test('Test product key example', async () => {
            // Collect array of input files for the OBI dialog parser.
            const path = pathRelativeToCurrentFile('../_testdata/product_key_dialogs')
            const globResults = klaw(path)
            const dialogFiles: File[] = []
            for (const pathItem of globResults) {
                if (!pathItem.stats.isFile()) {
                    // Skip non-file objects.
                    continue
                }
                dialogFiles.push(pathToFileObject(pathItem.path))
            }
            let numActions = 0
            const fakeCreateActionThunk = (appId: string, action: CLM.ActionBase) => {
                return new Promise<CLM.ActionBase>((resolve) => {
                    // Update the action id and return the action.
                    let outputAction = Util.deepCopy(action)
                    outputAction.actionId = `${numActions}`
                    numActions = numActions + 1
                    resolve(outputAction)
                })
            }
            let numEntities = 0
            const fakeCreateEntityThunk = (appId: string, entity: CLM.EntityBase) => {
                return new Promise<CLM.EntityBase>((resolve) => {
                    // Update the entity id and return the entity.
                    let outputEntity = Util.deepCopy(entity)
                    outputEntity.entityId = `${numEntities}`
                    numEntities = numEntities + 1
                    resolve(outputEntity)
                })
            }
            const parser = new ObiDialog.ObiDialogParser("fake-appid", [], [], fakeCreateActionThunk, fakeCreateEntityThunk)
            const importResults: ObiDialog.ObiDialogParserResult = await parser.parse(dialogFiles)
            // DEBUG
            const resJson = JSON.stringify(importResults)
            console.log(`!!!!!!!!!!!!!! got result ${resJson}`)
            expect(importResults.trainDialogs.length).toEqual(4)
        })
    })
})

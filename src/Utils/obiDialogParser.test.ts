/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as CLM from '@conversationlearner/models'
import * as ObiDialog from './obiDialogParser'
import * as Util from './util'
import * as fs from 'fs-extra'
import * as fspath from 'path'
import * as klaw from 'klaw-sync'

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
            expect(importResults.trainDialogs.length).toEqual(4)
            // Validate 1st TrainDialog.
            {
                const dialog = importResults.trainDialogs[0]
                expect(dialog.rounds.length).toEqual(2)
                const round0 = dialog.rounds[0]
                expect(round0.extractorStep.textVariations.length).toEqual(3)
                expect(round0.extractorStep.textVariations[0].text).toEqual("Download Office with Product Key")
                expect(round0.scorerSteps.length).toEqual(1)
                expect(round0.scorerSteps[0].importText).toEqual("[option14]")
                const round1 = dialog.rounds[1]
                expect(round1.extractorStep.textVariations.length).toEqual(1)
                expect(round1.extractorStep.textVariations[0].text).toEqual("Yes")
                expect(round1.scorerSteps.length).toEqual(3)
                expect(round1.scorerSteps[0].importText).toEqual("[option15]")
                expect(round1.scorerSteps[1].scoredAction!.actionType).toEqual(CLM.ActionTypes.API_LOCAL)
                expect(round1.scorerSteps[2].importText).toEqual("[option18]")
            }
            // Validate 2nd TrainDialog.
            {
                const dialog = importResults.trainDialogs[1]
                expect(dialog.rounds.length).toEqual(4)
                const round0 = dialog.rounds[0]
                expect(round0.extractorStep.textVariations.length).toEqual(3)
                expect(round0.extractorStep.textVariations[0].text).toEqual("Download Office with Product Key")
                expect(round0.scorerSteps.length).toEqual(1)
                expect(round0.scorerSteps[0].importText).toEqual("[option14]")
                const round1 = dialog.rounds[1]
                expect(round1.extractorStep.textVariations.length).toEqual(1)
                expect(round1.extractorStep.textVariations[0].text).toEqual("Yes")
                expect(round1.scorerSteps.length).toEqual(3)
                expect(round1.scorerSteps[0].importText).toEqual("[option15]")
                expect(round1.scorerSteps[1].scoredAction!.actionType).toEqual(CLM.ActionTypes.API_LOCAL)
                expect(round1.scorerSteps[2].importText).toEqual("[option19]")
                const round2 = dialog.rounds[2]
                expect(round2.extractorStep.textVariations.length).toEqual(1)
                expect(round2.extractorStep.textVariations[0].text).toEqual("Where_can_I_my_product_key_")
                expect(round2.scorerSteps.length).toEqual(2)
                expect(round2.scorerSteps[0].importText).toEqual("[option20]")
                expect(round2.scorerSteps[1].importText).toEqual("[option21]")
                const round3 = dialog.rounds[3]
                expect(round3.extractorStep.textVariations.length).toEqual(1)
                expect(round3.extractorStep.textVariations[0].text).toEqual("Yes")
                expect(round3.scorerSteps.length).toEqual(3)
                expect(round3.scorerSteps[0].importText).toEqual("[option15]")
                expect(round3.scorerSteps[1].scoredAction!.actionType).toEqual(CLM.ActionTypes.API_LOCAL)
                expect(round3.scorerSteps[2].importText).toEqual("[option18]")
            }
        })
    })
})

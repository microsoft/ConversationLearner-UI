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
    /**
     * Given a path __relative to this test file__, returns an absolute path to the same file.
     */
    function absolutePathFromPathRelativeToCurrentFile(inputPath: string): string {
        const thisFilePath = module.filename
        const thisFileDir = fspath.dirname(fspath.resolve(thisFilePath))
        return fspath.join(thisFileDir, inputPath)
    }

    /**
     * Given an absolute path or path relative to CWD of test execution, returns a `File` object wrapping that file.
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
        const GUID_LENGTH = "3d560a3f-bfd6-466b-8388-b1bdf93d15de".length
        test('Test product key example', async () => {
            // TODO(thpar) : investigate why this test fails on CircleCI.
            const envOS: string | undefined = process.env.OS
            if (!envOS?.toLocaleLowerCase().startsWith("win")) {
                console.log("Skipping Dialog reconstruction test due to incompatible OS type")
                return
            }

            // Collect array of input files for the OBI dialog parser.
            const path = absolutePathFromPathRelativeToCurrentFile('../__testdata__/product_key_dialogs')
            const globResults = klaw(path)
            const dialogFiles: File[] = []
            for (const pathItem of globResults) {
                if (!pathItem.stats.isFile()) {
                    // Skip non-file objects.
                    continue
                }
                dialogFiles.push(pathToFileObject(pathItem.path))
            }
            const actions: CLM.ActionBase[] = []
            const fakeCreateActionThunk = (appId: string, action: CLM.ActionBase) => {
                return new Promise<CLM.ActionBase>((resolve) => {
                    // Update the action id and return the action.
                    const outputAction = Util.deepCopy(action)
                    outputAction.actionId = `${actions.length}`
                    actions.push(outputAction)
                    resolve(outputAction)
                })
            }
            const entities: CLM.EntityBase[] = []
            const fakeCreateEntityThunk = (appId: string, entity: CLM.EntityBase) => {
                return new Promise<CLM.EntityBase>((resolve) => {
                    // Update the entity id and return the entity.
                    const outputEntity = Util.deepCopy(entity)
                    outputEntity.entityId = `${entities.length}`
                    entities.push(outputEntity)
                    resolve(outputEntity)
                })
            }
            const parser = new ObiDialog.ObiDialogParser("fake-appid", [], [], fakeCreateActionThunk, fakeCreateEntityThunk)
            const importResults: ObiDialog.ObiDialogParserResult = await parser.parse(dialogFiles)
            // Expect that just 1 action and 1 entity were created.
            // Dialogs referencing the same logical API or SwitchCondition should reuse the same action or entity after initial creation.
            expect(actions.length).toEqual(1)
            expect(actions[0].payload).toEqual(JSON.stringify({
                payload: "Replace Here",
                logicArguments: [],
                renderArguments: [],
                isPlaceholder: true
            }))
            expect(entities.length).toEqual(1)
            expect(entities[0].entityType).toEqual(CLM.EntityType.ENUM)
            expect(entities[0].enumValues).toEqual([
                {enumValue: "Office"},
                {enumValue: "Windows"},
                {enumValue: "OfficeTest"}
            ])
            // There are 3 SwitchCondition nodes in the dialogs, so we expect 3 conditions to be imported.
            expect(Object.keys(importResults.conditions).length).toEqual(3)
            for (const key of Object.keys(importResults.conditions)) {
                const conditions = importResults.conditions[key]
                expect(conditions.length).toEqual(1)
                const condition: CLM.Condition = conditions[0]
                expect(condition.condition).toEqual(CLM.ConditionType.EQUAL)
            }

            expect(importResults.trainDialogs.length).toEqual(4)
            // Validate 1st TrainDialog.
            {
                const dialog = importResults.trainDialogs[0]
                expect(dialog.rounds.length).toEqual(3)
                const round0 = dialog.rounds[0]
                expect(round0.extractorStep.textVariations.length).toEqual(3)
                expect(round0.extractorStep.textVariations[0].text).toEqual("Download Office with Product Key")
                expect(round0.scorerSteps.length).toEqual(1)
                expect(round0.scorerSteps[0].importText).toEqual("[option14]")
                const round1 = dialog.rounds[1]
                expect(round1.extractorStep.textVariations.length).toEqual(1)
                expect(round1.extractorStep.textVariations[0].text).toEqual("Yes")
                expect(round1.scorerSteps.length).toEqual(1)
                expect(round1.scorerSteps[0].importText).toEqual("[option15]")
                const round2 = dialog.rounds[2]
                expect(round2.extractorStep.textVariations.length).toEqual(1)
                expect(round2.extractorStep.textVariations[0].text.length).toEqual(GUID_LENGTH)
                expect(round2.scorerSteps.length).toEqual(2)
                expect(round2.scorerSteps[0].scoredAction!.actionType).toEqual(CLM.ActionTypes.API_LOCAL)
                expect(round2.scorerSteps[1].importText).toEqual("[option18]")
            }
            // Validate 2nd TrainDialog.
            {
                const dialog = importResults.trainDialogs[1]
                expect(dialog.rounds.length).toEqual(6)
                const round0 = dialog.rounds[0]
                expect(round0.extractorStep.textVariations.length).toEqual(3)
                expect(round0.extractorStep.textVariations[0].text).toEqual("Download Office with Product Key")
                expect(round0.scorerSteps.length).toEqual(1)
                expect(round0.scorerSteps[0].importText).toEqual("[option14]")
                const round1 = dialog.rounds[1]
                expect(round1.extractorStep.textVariations.length).toEqual(1)
                expect(round1.extractorStep.textVariations[0].text).toEqual("Yes")
                expect(round1.scorerSteps.length).toEqual(1)
                expect(round1.scorerSteps[0].importText).toEqual("[option15]")
                const round2 = dialog.rounds[2]
                expect(round2.extractorStep.textVariations.length).toEqual(1)
                expect(round2.extractorStep.textVariations[0].text.length).toEqual(GUID_LENGTH)
                expect(round2.scorerSteps.length).toEqual(2)
                expect(round2.scorerSteps[0].scoredAction!.actionType).toEqual(CLM.ActionTypes.API_LOCAL)
                expect(round2.scorerSteps[1].importText).toEqual("[option19]")
                const round3 = dialog.rounds[3]
                expect(round3.extractorStep.textVariations.length).toEqual(1)
                expect(round3.extractorStep.textVariations[0].text).toEqual("Where_can_I_my_product_key_")
                expect(round3.scorerSteps.length).toEqual(2)
                expect(round3.scorerSteps[0].importText).toEqual("[option20]")
                expect(round3.scorerSteps[1].importText).toEqual("[option21]")
                const round4 = dialog.rounds[4]
                expect(round4.extractorStep.textVariations.length).toEqual(1)
                expect(round4.extractorStep.textVariations[0].text).toEqual("Yes")
                expect(round4.scorerSteps.length).toEqual(1)
                expect(round4.scorerSteps[0].importText).toEqual("[option15]")
                const round5 = dialog.rounds[5]
                expect(round5.extractorStep.textVariations.length).toEqual(1)
                expect(round5.extractorStep.textVariations[0].text.length).toEqual(GUID_LENGTH)
                expect(round5.scorerSteps.length).toEqual(2)
                expect(round5.scorerSteps[0].scoredAction!.actionType).toEqual(CLM.ActionTypes.API_LOCAL)
                expect(round5.scorerSteps[1].importText).toEqual("[option18]")
            }
            // Validate 3rd TrainDialog.
            {
                const dialog = importResults.trainDialogs[2]
                expect(dialog.rounds.length).toEqual(5)
                const round0 = dialog.rounds[0]
                expect(round0.extractorStep.textVariations.length).toEqual(3)
                expect(round0.extractorStep.textVariations[0].text).toEqual("Download Office with Product Key")
                expect(round0.scorerSteps.length).toEqual(1)
                expect(round0.scorerSteps[0].importText).toEqual("[option14]")
                const round1 = dialog.rounds[1]
                expect(round1.extractorStep.textVariations.length).toEqual(1)
                expect(round1.extractorStep.textVariations[0].text).toEqual("Yes")
                expect(round1.scorerSteps.length).toEqual(1)
                expect(round1.scorerSteps[0].importText).toEqual("[option15]")
                const round2 = dialog.rounds[2]
                expect(round2.extractorStep.textVariations.length).toEqual(1)
                expect(round2.extractorStep.textVariations[0].text.length).toEqual(GUID_LENGTH)
                expect(round2.scorerSteps.length).toEqual(2)
                expect(round2.scorerSteps[0].scoredAction!.actionType).toEqual(CLM.ActionTypes.API_LOCAL)
                expect(round2.scorerSteps[1].importText).toEqual("[option19]")
                const round3 = dialog.rounds[3]
                expect(round3.extractorStep.textVariations.length).toEqual(1)
                expect(round3.extractorStep.textVariations[0].text).toEqual("Where_can_I_my_product_key_")
                expect(round3.scorerSteps.length).toEqual(2)
                expect(round3.scorerSteps[0].importText).toEqual("[option20]")
                expect(round3.scorerSteps[1].importText).toEqual("[option21]")
                const round4 = dialog.rounds[4]
                expect(round4.extractorStep.textVariations.length).toEqual(1)
                expect(round4.extractorStep.textVariations[0].text).toEqual("No")
                expect(round4.scorerSteps.length).toEqual(1)
                expect(round4.scorerSteps[0].importText).toEqual("[option24]")
            }
            // Validate 4th TrainDialog.
            {
                const dialog = importResults.trainDialogs[3]
                expect(dialog.rounds.length).toEqual(4)
                const round0 = dialog.rounds[0]
                expect(round0.extractorStep.textVariations.length).toEqual(3)
                expect(round0.extractorStep.textVariations[0].text).toEqual("Download Office with Product Key")
                expect(round0.scorerSteps.length).toEqual(1)
                expect(round0.scorerSteps[0].importText).toEqual("[option14]")
                const round1 = dialog.rounds[1]
                expect(round1.extractorStep.textVariations.length).toEqual(1)
                expect(round1.extractorStep.textVariations[0].text).toEqual("Yes")
                expect(round1.scorerSteps.length).toEqual(1)
                expect(round1.scorerSteps[0].importText).toEqual("[option15]")
                const round2 = dialog.rounds[2]
                expect(round2.extractorStep.textVariations.length).toEqual(1)
                expect(round2.extractorStep.textVariations[0].text.length).toEqual(GUID_LENGTH)
                expect(round2.scorerSteps.length).toEqual(2)
                expect(round2.scorerSteps[0].scoredAction!.actionType).toEqual(CLM.ActionTypes.API_LOCAL)
                expect(round2.scorerSteps[1].importText).toEqual("[option19]")
                const round3 = dialog.rounds[3]
                expect(round3.extractorStep.textVariations.length).toEqual(1)
                expect(round3.extractorStep.textVariations[0].text).toEqual("I_prefer_to_talk_to_a_Microsoft_Customer_Service_representative")
                expect(round3.scorerSteps.length).toEqual(1)
                expect(round3.scorerSteps[0].importText).toEqual("[option25]")
            }
        })
    })
})

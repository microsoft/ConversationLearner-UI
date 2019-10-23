/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import * as BB from 'botbuilder'
import * as ObiTypes from '../types/obiTypes'
import * as ObiUtils from './obiUtils'
import { deepCopy, RecursivePartial } from './util'

describe('obiUtils', () => {

    describe('areTranscriptEqual', () => {

        // Note: Transcripts are partials of partials of BB.Activity, so need to use "any"
        const baseTranscript: RecursivePartial<BB.Activity>[] = [
            {
                "conversation": {
                    "id": "8/tCDSvmPu6ItjCdBedNXMpAXfg="
                },
                "type": "message",
                "from": {
                    "name": "user",
                    "role": "user"
                },
                "text": "windows"
            },
            {
                "conversation": {
                    "id": "8/tCDSvmPu6ItjCdBedNXMpAXfg="
                },
                "type": "message",
                "timestamp": "2019-03-27T12:46:21.3406967+00:00",
                "from": {
                    "name": "bot",
                    "role": "bot"
                },
                "text": "\n\n\nHow can I help you with Windows 10 language settings?\nInstall a new language;Change my display language;Add a keyboard language;Change my keyboard language"
            },
            {
                "type": "message",
                "from": {
                    "name": "user",
                    "role": "user"
                },
                "text": "change my display language"
            },
            {
                "conversation": {
                    "id": "8/tCDSvmPu6ItjCdBedNXMpAXfg="
                },
                "type": "message",
                "timestamp": "2019-03-27T12:46:41.2634319+00:00",
                "from": {
                    "name": "bot",
                    "role": "bot"
                },
                "text": "\n\nChange display language preferences in Windows 10\r\nTo change your display language in Windows 10, follow these steps:\r\nGo to  <strong>Start</strong>   Windows logo Start button &nbsp;&gt;&nbsp; <strong>Settings</strong>   Gear-shaped Settings icon &nbsp;&gt;&nbsp; <strong>Time &amp; Language</strong>  &gt;  <strong>Language</strong> \r\nChoose a language from the  <strong>Windows display language </strong> menu.&nbsp;\r\n<br>Want a quick walk-through? Watch this short video.\r\nOpen language settings\r\n\n"
            },
            {
                "conversation": {
                    "id": "8/tCDSvmPu6ItjCdBedNXMpAXfg="
                },
                "type": "message",
                "timestamp": "2019-03-27T12:46:41.2634319+00:00",
                "from": {
                    "name": "bot",
                    "role": "bot"
                },
                "text": "Were you able to change your display language?\nYes;No"
            }
        ]

        const makeTransript = (channelName: string) => {
            const transcript = deepCopy(baseTranscript)
            transcript.forEach(activity => {
                activity.channelId = channelName
            })
            return transcript
        }

        test('validMatch', () => {
            const t1 = makeTransript("channel1")
            const t2 = makeTransript("channel2")

            expect(ObiUtils.areTranscriptsEqual(t1 , t2)).toEqual(true)
        })

        test('typeMismatch', () => {
            const t1 = makeTransript("channel1")
            const t2 = makeTransript("channel2")
            t2[2].from = {
                "name": "bot",
                "role": "bot"
            }
            expect(ObiUtils.areTranscriptsEqual(t1 , t2)).toEqual(false)
        })

        test('botResponseMismatch', () => {
            const t1 = makeTransript("channel1")
            const t2 = makeTransript("channel2")
            t2[1].text = "CHANGED BOT RESPONSE"
            expect(ObiUtils.areTranscriptsEqual(t1 , t2)).toEqual(false)
        })

        test('sameChannel', () => {
            const t1 = makeTransript("channel1")
            const t2 = makeTransript("channel1")

            expect(() => ObiUtils.areTranscriptsEqual(t1 , t2)).toThrow()
        })

        test('noTurns', () => {
            const t1: any[] = []
            const t2: any[] = []

            expect(() => ObiUtils.areTranscriptsEqual(t1 , t2)).toThrow()
        })

        test('missingFrom', () => {
            const t1 = makeTransript("channel1")
            const t2 = makeTransript("channel2")
            delete t2[3].from
            expect(() => ObiUtils.areTranscriptsEqual(t1 , t2)).toThrow()
        })

        test('missingConversation', () => {
            const t1 = makeTransript("channel1")
            const t2 = makeTransript("channel2")
            delete t1[0].conversation
            expect(() => ObiUtils.areTranscriptsEqual(t1 , t2)).toThrow()
        })

        test('differentLength', () => {
            const t1 = makeTransript("channel1")
            const t2 = makeTransript("channel2")
            t2.pop()

            expect(ObiUtils.areTranscriptsEqual(t1 , t2)).toEqual(false)
        })

        test('differentUserText', () => {
            const t1 = makeTransript("channel1")
            const t2 = makeTransript("channel2")
            t2[2] = {
                "type": "message",
                "from": {
                    "name": "user",
                    "role": "user"
                },
                "text": "DIFFERENT USER UTTERANCE"
            }

            expect(() => ObiUtils.areTranscriptsEqual(t1 , t2)).toThrow()
        })
    })
    // Test cases for parsing conditions from Microsoft.SwitchCondition statements.
    describe('ConditionParsing', () => {
        let entityConditions: { [key: string]: Set<string> } = {}
        test('Test single condition', () => {
            let testData: ObiTypes.Case = {
                value: "$foo == bar"
            }
            const entityAndCondition = ObiUtils.parseEntityConditionFromDialogCase(testData, entityConditions)
            expect(entityAndCondition).toEqual({
                entity: "$foo",
                value: "bar"
            })
            expect(entityConditions.$foo).toEqual(new Set(["bar"]))
        })
        test('Test multiple conditions', () => {
            // Set up an existing condition.
            entityConditions.$foo = new Set(["one"])
            let testData: ObiTypes.Case = {
                value: "$foo == two"
            }
            const entityAndCondition = ObiUtils.parseEntityConditionFromDialogCase(testData, entityConditions)
            expect(entityAndCondition).toEqual({
                entity: "$foo",
                value: "two"
            })
            expect(entityConditions.$foo).toEqual(new Set(["one", "two"]))
        })
        test('Missing condition token', () => {
            for (const value of ["$foo ==", "== bar", "=="]) {
                let testData: ObiTypes.Case = { value }
                try {
                    ObiUtils.parseEntityConditionFromDialogCase(testData, entityConditions)
                    fail("Did not get expected exception")
                }
                catch (err) {
                    expect(err instanceof Error).toBe(true)
                    expect(Error(err).message).toBe("Error: SwitchCondition entity and value must be non-empty")
                }
            }
        })
        test('Missing ==', () => {
            let testData: ObiTypes.Case = { value: "foo" }
            try {
                ObiUtils.parseEntityConditionFromDialogCase(testData, entityConditions)
                fail("Did not get expected exception")
            }
            catch (err) {
                expect(err instanceof Error).toBe(true)
                expect(Error(err).message).toBe("Error: SwitchCondition case is expected to have format 'x == y'")
            }
        })
    })
})

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { doesTrainDialogMatch } from './dialogUtils'
import { makeTrainDialog } from './testDataUtil'

import * as CLM from '@conversationlearner/models'

describe('dialogUtils', () => {

    describe('findMatchingTrainDialog', () => {

        // Create training dialogs for test
        const baseDialog = makeTrainDialog(
            [
                {
                    textVariations: [{
                        "entity1_id": "entity1_value",
                        "entity2_id": "entity2_value"
                    }],
                    // Round with one scorer step
                    scorerSteps: { 
                        "action1": ["entity1_id", "entity2_id"]
                    }
                },
                {
                    textVariations: [{
                        "entity3_id": "entity3_value"
                    }],
                    // Rounds without scorer step
                    scorerSteps: undefined
                },
                {
                    textVariations: [{
                        "entity3_id": "entity3_value"
                    }],
                    // Round with multiple scorer steps
                    scorerSteps: { 
                        "action2_id": ["entity1_id", "entity3_id"],
                        "action1_id": ["entity1_id"]
                    }
                },
                {
                    textVariations: [{
                        "entity1_id": "entity1_value"
                    }],
                    // End Round with multiple scorer steps
                    scorerSteps: { 
                        "action4_id": ["entity1_id", "entity3_id"],
                        "action1_id": ["entity1_id"]
                    }
                }
            ]
        )


        test('exactMatch', () => {
            const result = doesTrainDialogMatch(baseDialog, baseDialog)
            expect(result).toEqual(true)
        })

        test('extraRound', () => {
            const shortDialog: CLM.TrainDialog = JSON.parse(JSON.stringify(baseDialog))
            shortDialog.rounds.pop()
            
            let result = doesTrainDialogMatch(shortDialog, baseDialog)
            expect(result).toEqual(true)

            result = doesTrainDialogMatch(baseDialog, shortDialog)
            expect(result).toEqual(true)
        })

        test('extraScorerStepLastRound', () => {
            const shortDialog: CLM.TrainDialog = JSON.parse(JSON.stringify(baseDialog))
            shortDialog.rounds[shortDialog.rounds.length - 1].scorerSteps.pop()
            
            let result = doesTrainDialogMatch(shortDialog, baseDialog)
            expect(result).toEqual(true)

            result = doesTrainDialogMatch(baseDialog, shortDialog)
            expect(result).toEqual(true)
        })

        test('extraScorerStepNotLastRound', () => {
            const shortDialog: CLM.TrainDialog = JSON.parse(JSON.stringify(baseDialog))
            shortDialog.rounds[shortDialog.rounds.length - 2].scorerSteps.pop()
            
            let result = doesTrainDialogMatch(shortDialog, baseDialog)
            expect(result).toEqual(false)

            result = doesTrainDialogMatch(baseDialog, shortDialog)
            expect(result).toEqual(false)
        })

        test('differentAction', () => {
            const changedDialog: CLM.TrainDialog = JSON.parse(JSON.stringify(baseDialog))
            const lastRound = changedDialog.rounds[changedDialog.rounds.length - 1]
            const lastScorerStep = lastRound.scorerSteps[lastRound.scorerSteps.length - 1]
            lastScorerStep.labelAction = "CHANGED"

            let result = doesTrainDialogMatch(changedDialog, baseDialog)
            expect(result).toEqual(false)

            result = doesTrainDialogMatch(baseDialog, changedDialog)
            expect(result).toEqual(false)
        })

        test('changedFilledEntities', () => {

            const changedDialog: CLM.TrainDialog = JSON.parse(JSON.stringify(baseDialog))
            const lastRound = changedDialog.rounds[changedDialog.rounds.length - 1]
            const lastScorerStep = lastRound.scorerSteps[lastRound.scorerSteps.length - 1]
            lastScorerStep.input.filledEntities.pop()

            let result = doesTrainDialogMatch(changedDialog, baseDialog)
            expect(result).toEqual(false)

            result = doesTrainDialogMatch(baseDialog, changedDialog)
            expect(result).toEqual(false)
        })

    })
})

/*
const entityValues = [
    {
        "userText": "userText",
        "displayText": "displayText",
        "builtinType": null,
        "resolution": {}
    }
]

const baseDialogOLD: CLM.TrainDialog = {
    "tags": [],
    "description": "",
    "trainDialogId": "35cc15a7-8431-496f-9f29-6,cebeed4b9bd",
    "version": 0, 
    "packageCreationId": 0, 
    "packageDeletionId": 0, 
    "sourceLogDialogId": "",
    "rounds": [
        {
            "extractorStep": {
                "textVariations": [
                    {
                        "text": "place an order",
                        "labelEntities": [
                        ]
                    }
                ]
            },
            "scorerSteps": [
                {
                    "input": {
                        "filledEntities": [
                        ],
                        "context": {
                        },
                        "maskedActions": [
                        ]
                    },
                    "labelAction": "0dbb27ad-3d49-4808-9797-5b40971b6496",
                    "logicResult": undefined,
                    "scoredAction": undefined
                }
            ]
        },
        {
            "extractorStep": {
                "textVariations": [
                    {
                        "text": "cheese",
                        "labelEntities": [
                            {
                                "entityId": "267a89dd-be0a-4079-84ba-369eeb81f8cf",
                                "startCharIndex": 0,
                                "endCharIndex": 5,
                                "entityText": "cheese",
                                "resolution": {},
                                "builtinType": ""
                            }
                        ]
                    }
                ]
            },
            "scorerSteps": [
                {
                    "input": {
                        "filledEntities": [
                            {
                                "entityId": "267a89dd-be0a-4079-84ba-369eeb81f8cf",
                                "values": entityValues
                            }
                        ],
                        "context": {
                        },
                        "maskedActions": [
                        ]
                    },
                    "labelAction": "6ca0abf4-89db-454a-9e7a-21b100d0c076",
                    "logicResult": undefined,
                    "scoredAction": undefined
                },
                {
                    "input": {
                        "filledEntities": [
                            {
                                "entityId": "267a89dd-be0a-4079-84ba-369eeb81f8cf",
                                "values": entityValues
                            }
                        ],
                        "context": {
                        },
                        "maskedActions": [
                        ]
                    },
                    "labelAction": "36a2fafa-3ca5-4e3f-a391-fe6479c3cc19",
                    "logicResult": undefined,
                    "scoredAction": undefined
                }
            ]
        },
        {
            "extractorStep": {
                "textVariations": [
                    {
                        "text": "add peppers and mushrooms",
                        "labelEntities": [
                            {
                                "entityId": "267a89dd-be0a-4079-84ba-369eeb81f8cf",
                                "startCharIndex": 4,
                                "endCharIndex": 10,
                                "entityText": "peppers",
                                "resolution": {},
                                "builtinType": ""
                            },
                            {
                                "entityId": "267a89dd-be0a-4079-84ba-369eeb81f8cf",
                                "startCharIndex": 16,
                                "endCharIndex": 24,
                                "entityText": "mushrooms",
                                "resolution": {},
                                "builtinType": ""
                            }
                        ]
                    }
                ]
            },
            "scorerSteps": [
                {
                    "input": {
                        "filledEntities": [
                            {
                                "entityId": "267a89dd-be0a-4079-84ba-369eeb81f8cf",
                                "values": entityValues
                            }
                        ],
                        "context": {
                        },
                        "maskedActions": [
                        ]
                    },
                    "labelAction": "6ca0abf4-89db-454a-9e7a-21b100d0c076",
                    "logicResult": undefined,
                    "scoredAction": undefined
                },
                {
                    "input": {
                        "filledEntities": [
                            {
                                "entityId": "267a89dd-be0a-4079-84ba-369eeb81f8cf",
                                "values": entityValues
                            }
                        ],
                        "context": {
                        },
                        "maskedActions": [
                        ]
                    },
                    "labelAction": "36a2fafa-3ca5-4e3f-a391-fe6479c3cc19",
                    "logicResult": undefined,
                    "scoredAction": undefined
                }
            ]
        },
        {
            "extractorStep": {
                "textVariations": [
                    {
                        "text": "remove the peppers and add yam",
                        "labelEntities": [
                            {
                                "entityId": "afa189d2-47e3-47bf-971d-6a78abfe2bb0",
                                "startCharIndex": 11,
                                "endCharIndex": 17,
                                "entityText": "peppers",
                                "resolution": {},
                                "builtinType": ""
                            },
                            {
                                "entityId": "267a89dd-be0a-4079-84ba-369eeb81f8cf",
                                "startCharIndex": 27,
                                "endCharIndex": 29,
                                "entityText": "yam",
                                "resolution": {},
                                "builtinType": ""
                            }
                        ]
                    }
                ]
            },
            "scorerSteps": [
                {
                    "input": {
                        "filledEntities": [
                            {
                                "entityId": "267a89dd-be0a-4079-84ba-369eeb81f8cf",
                                "values": entityValues
                            },
                            {
                                "entityId": "b2001cd7-42be-4366-b774-f629441cb81b",
                                "values": entityValues
                            }
                        ],
                        "context": {
                        },
                        "maskedActions": [
                        ]
                    },
                    "labelAction": "2196c0ab-4b3c-4315-9428-c11a84a1771b",
                    "scoredAction": undefined,
                    "logicResult": {
                        "logicValue": "[\"yam\"]",
                        "changedFilledEntities": [
                            {
                                "entityId": "b2001cd7-42be-4366-b774-f629441cb81b",
                                "values": [
                                ]
                            }
                        ]
                    }
                },
                {
                    "input": {
                        "filledEntities": [
                            {
                                "entityId": "267a89dd-be0a-4079-84ba-369eeb81f8cf",
                                "values": entityValues
                            }
                        ],
                        "context": {
                        },
                        "maskedActions": [
                        ]
                    },
                    "labelAction": "36a2fafa-3ca5-4e3f-a391-fe6479c3cc19",
                    "logicResult": undefined,
                    "scoredAction": undefined
                }
            ]
        },
        {
            "extractorStep": {
                "textVariations": [
                    {
                        "text": "no thanks",
                        "labelEntities": [
                        ]
                    }
                ]
            },
            "scorerSteps": [
                {
                    "input": {
                        "filledEntities": [
                            {
                                "entityId": "267a89dd-be0a-4079-84ba-369eeb81f8cf",
                                "values": entityValues
                            }
                        ],
                        "context": {
                        },
                        "maskedActions": [
                        ]
                    },
                    "labelAction": "4df39065-97b0-40cb-8e63-eedaae5e5fb0",
                    "scoredAction": undefined,
                    "logicResult": {
                        "logicValue": undefined,
                        "changedFilledEntities": [
                            {
                                "entityId": "267a89dd-be0a-4079-84ba-369eeb81f8cf",
                                "values": [
                                ]
                            },
                            {
                                "entityId": "931a7300-c0dd-458c-ba2b-f9dde7ae3a93",
                                "values": entityValues
                            }
                        ]
                    }
                }
            ]
        },
        {
            "extractorStep": {
                "textVariations": [
                    {
                        "text": "order more pizza",
                        "labelEntities": [
                        ]
                    }
                ]
            },
            "scorerSteps": [
                {
                    "input": {
                        "filledEntities": [
                            {
                                "entityId": "931a7300-c0dd-458c-ba2b-f9dde7ae3a93",
                                "values": entityValues
                            }
                        ],
                        "context": {
                        },
                        "maskedActions": [
                        ]
                    },
                    "labelAction": "7f5fd019-78eb-487b-986b-5ebd44d41ffd",
                    "logicResult": undefined,
                    "scoredAction": undefined
                }
            ]
        },
        {
            "extractorStep": {
                "textVariations": [
                    {
                        "text": "yes",
                        "labelEntities": [
                        ]
                    }
                ]
            },
            "scorerSteps": [
                {
                    "input": {
                        "filledEntities": [
                            {
                                "entityId": "931a7300-c0dd-458c-ba2b-f9dde7ae3a93",
                                "values": entityValues
                            }
                        ],
                        "context": {
                        },
                        "maskedActions": [
                        ]
                    },
                    "labelAction": "79a5acc2-c223-4b4a-9c3d-d7d68825265b",
                    "scoredAction": undefined,
                    "logicResult": {
                        "logicValue": undefined,
                        "changedFilledEntities": [
                            {
                                "entityId": "931a7300-c0dd-458c-ba2b-f9dde7ae3a93",
                                "values": [
                                ]
                            },
                            {
                                "entityId": "267a89dd-be0a-4079-84ba-369eeb81f8cf",
                                "values": entityValues
                            }
                        ]
                    }
                },
                {
                    "input": {
                        "filledEntities": [
                            {
                                "entityId": "267a89dd-be0a-4079-84ba-369eeb81f8cf",
                                "values": entityValues
                            }
                        ],
                        "context": {
                        },
                        "maskedActions": [
                        ]
                    },
                    "labelAction": "6ca0abf4-89db-454a-9e7a-21b100d0c076",
                    "logicResult": undefined,
                    "scoredAction": undefined
                },
                {
                    "input": {
                        "filledEntities": [
                            {
                                "entityId": "267a89dd-be0a-4079-84ba-369eeb81f8cf",
                                "values": entityValues
                            }
                        ],
                        "context": {
                        },
                        "maskedActions": [
                        ]
                    },
                    "labelAction": "36a2fafa-3ca5-4e3f-a391-fe6479c3cc19",
                    "logicResult": undefined,
                    "scoredAction": undefined
                }
            ]
        }
    ],
    "initialFilledEntities": [],
    "createdDateTime": "",
    "lastModifiedDateTime": ""
}
*/
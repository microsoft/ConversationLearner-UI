{
    "trainDialogs": [
        {
            "tags": [],
            "description": "nonTerminal",
            "trainDialogId": "ccb56266-af23-4bfc-a02c-86c71e3d2153",
            "rounds": [
                {
                    "extractorStep": {
                        "textVariations": [
                            {
                                "text": "start dialog",
                                "labelEntities": []
                            }
                        ]
                    },
                    "scorerSteps": [
                        {
                            "input": {
                                "filledEntities": [],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "6efd56ab-1609-4bae-813a-1237467b8ed1",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.009582042694091797,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        }
                    ]
                },
                {
                    "extractorStep": {
                        "textVariations": [
                            {
                                "text": "input non-terminal",
                                "labelEntities": []
                            }
                        ]
                    },
                    "scorerSteps": [
                        {
                            "input": {
                                "filledEntities": [],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "255fbd3f-37b0-4a7b-9f35-15fb276eeeff",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.03512930870056152,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        },
                        {
                            "input": {
                                "filledEntities": [],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "6efd56ab-1609-4bae-813a-1237467b8ed1",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.009043693542480469,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        }
                    ]
                }
            ],
            "initialFilledEntities": [],
            "createdDateTime": "2019-05-14T09:09:32.97237-07:00",
            "lastModifiedDateTime": "2019-05-14T16:09:32+00:00"
        },
        {
            "tags": [],
            "description": "setEntity",
            "trainDialogId": "bb228705-7c7d-4bcc-ac73-e0cc2e07a440",
            "rounds": [
                {
                    "extractorStep": {
                        "textVariations": [
                            {
                                "text": "start dialog",
                                "labelEntities": []
                            }
                        ]
                    },
                    "scorerSteps": [
                        {
                            "input": {
                                "filledEntities": [],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "6efd56ab-1609-4bae-813a-1237467b8ed1",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.01190185546875,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        }
                    ]
                },
                {
                    "extractorStep": {
                        "textVariations": [
                            {
                                "text": "input set entity",
                                "labelEntities": []
                            }
                        ]
                    },
                    "scorerSteps": [
                        {
                            "input": {
                                "filledEntities": [],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "321a5fcd-b067-4144-9095-d98fc8c3275f",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.012544631958007812,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        },
                        {
                            "input": {
                                "filledEntities": [
                                    {
                                        "entityId": "f69975f2-c161-4fbc-8fa9-7be5c3a2f4f4",
                                        "values": [
                                            {
                                                "userText": "THREE",
                                                "displayText": "THREE",
                                                "builtinType": null,
                                                "enumValueId": "9af05a26-b1d7-4938-b980-03aff57029ed",
                                                "resolution": null
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "6efd56ab-1609-4bae-813a-1237467b8ed1",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.006397724151611328,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        }
                    ]
                }
            ],
            "initialFilledEntities": [],
            "createdDateTime": "2019-05-14T09:09:32.9723865-07:00",
            "lastModifiedDateTime": "2019-05-14T16:09:32+00:00"
        },
        {
            "tags": [],
            "description": "terminalText1",
            "trainDialogId": "6e49ca0f-acb4-4c2e-9943-84898848eda3",
            "rounds": [
                {
                    "extractorStep": {
                        "textVariations": [
                            {
                                "text": "start dialog",
                                "labelEntities": []
                            }
                        ]
                    },
                    "scorerSteps": [
                        {
                            "input": {
                                "filledEntities": [],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "6efd56ab-1609-4bae-813a-1237467b8ed1",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.007595539093017578,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        }
                    ]
                },
                {
                    "extractorStep": {
                        "textVariations": [
                            {
                                "text": "input 2",
                                "labelEntities": []
                            }
                        ]
                    },
                    "scorerSteps": [
                        {
                            "input": {
                                "filledEntities": [],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "c2234586-1cb9-4d4a-bd39-89455b0e4d80",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.010689020156860352,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        }
                    ]
                },
                {
                    "extractorStep": {
                        "textVariations": [
                            {
                                "text": "end dialog",
                                "labelEntities": []
                            }
                        ]
                    },
                    "scorerSteps": [
                        {
                            "input": {
                                "filledEntities": [],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "6efd56ab-1609-4bae-813a-1237467b8ed1",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.017838478088378906,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        }
                    ]
                }
            ],
            "initialFilledEntities": [],
            "createdDateTime": "2019-05-14T09:09:32.9723278-07:00",
            "lastModifiedDateTime": "2019-05-14T16:11:41+00:00"
        },
        {
            "tags": [],
            "description": "terminalText2",
            "trainDialogId": "f99b967f-88c2-4fd4-9780-6e54940e7b58",
            "rounds": [
                {
                    "extractorStep": {
                        "textVariations": [
                            {
                                "text": "start dialog",
                                "labelEntities": []
                            }
                        ]
                    },
                    "scorerSteps": [
                        {
                            "input": {
                                "filledEntities": [],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "6efd56ab-1609-4bae-813a-1237467b8ed1",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.010732173919677734,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        }
                    ]
                },
                {
                    "extractorStep": {
                        "textVariations": [
                            {
                                "text": "input 1",
                                "labelEntities": []
                            }
                        ]
                    },
                    "scorerSteps": [
                        {
                            "input": {
                                "filledEntities": [],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "b6cb2485-0228-46af-a16e-2a7571ab866b",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.02174663543701172,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        }
                    ]
                },
                {
                    "extractorStep": {
                        "textVariations": [
                            {
                                "text": "end dialog",
                                "labelEntities": []
                            }
                        ]
                    },
                    "scorerSteps": [
                        {
                            "input": {
                                "filledEntities": [],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "6efd56ab-1609-4bae-813a-1237467b8ed1",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.01236104965209961,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        }
                    ]
                }
            ],
            "initialFilledEntities": [],
            "createdDateTime": "2019-05-14T09:09:32.9723596-07:00",
            "lastModifiedDateTime": "2019-05-14T16:12:18+00:00"
        },
        {
            "tags": [],
            "description": "preserveValidity",
            "trainDialogId": "2ae75d4a-5796-4918-9dea-3842cc9e9d3b",
            "rounds": [
                {
                    "extractorStep": {
                        "textVariations": [
                            {
                                "text": "start dialog",
                                "labelEntities": []
                            }
                        ]
                    },
                    "scorerSteps": [
                        {
                            "input": {
                                "filledEntities": [],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "6efd56ab-1609-4bae-813a-1237467b8ed1",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.00593876838684082,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        }
                    ]
                },
                {
                    "extractorStep": {
                        "textVariations": [
                            {
                                "text": "input sequence of text",
                                "labelEntities": []
                            }
                        ]
                    },
                    "scorerSteps": [
                        {
                            "input": {
                                "filledEntities": [],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "e1dcaea2-9c13-4cdf-9eea-911487f099d5",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.011970281600952148,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        },
                        {
                            "input": {
                                "filledEntities": [],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "b2a5cd38-a552-477d-8f1a-800d6004637b",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.007764101028442383,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        }
                    ]
                },
                {
                    "extractorStep": {
                        "textVariations": [
                            {
                                "text": "another input",
                                "labelEntities": []
                            }
                        ]
                    },
                    "scorerSteps": [
                        {
                            "input": {
                                "filledEntities": [],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "6efd56ab-1609-4bae-813a-1237467b8ed1",
                            "metrics": {
                                "predictMetrics": null
                            }
                        }
                    ]
                }
            ],
            "initialFilledEntities": [],
            "createdDateTime": "2019-05-14T09:09:32.9723986-07:00",
            "lastModifiedDateTime": "2019-05-14T16:09:33+00:00"
        },
        {
            "tags": [],
            "description": "terminalText3",
            "trainDialogId": "fba377bf-4667-44f1-a52c-6411e110778c",
            "rounds": [
                {
                    "extractorStep": {
                        "textVariations": [
                            {
                                "text": "start dialog",
                                "labelEntities": []
                            }
                        ]
                    },
                    "scorerSteps": [
                        {
                            "input": {
                                "filledEntities": [],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "6efd56ab-1609-4bae-813a-1237467b8ed1",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.007595539093017578,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        }
                    ]
                },
                {
                    "extractorStep": {
                        "textVariations": [
                            {
                                "text": "input 2",
                                "labelEntities": []
                            }
                        ]
                    },
                    "scorerSteps": [
                        {
                            "input": {
                                "filledEntities": [],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "b2a5cd38-a552-477d-8f1a-800d6004637b",
                            "metrics": {
                                "predictMetrics": null
                            }
                        }
                    ]
                }
            ],
            "initialFilledEntities": [],
            "createdDateTime": "2019-05-14T09:10:42.3476554-07:00",
            "lastModifiedDateTime": "2019-05-14T16:11:14+00:00"
        }
    ],
    "actions": [
        {
            "actionId": "c2234586-1cb9-4d4a-bd39-89455b0e4d80",
            "createdDateTime": "2019-05-14T09:09:32.9722728-07:00",
            "actionType": "TEXT",
            "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Terminal Text 1\",\"marks\":[]}]}]}]}}}",
            "isTerminal": true,
            "requiredEntitiesFromPayload": [],
            "requiredEntities": [],
            "negativeEntities": [],
            "requiredConditions": [],
            "negativeConditions": []
        },
        {
            "actionId": "255fbd3f-37b0-4a7b-9f35-15fb276eeeff",
            "createdDateTime": "2019-05-14T09:09:32.9722919-07:00",
            "actionType": "TEXT",
            "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Non-terminal Text 1\",\"marks\":[]}]}]}]}}}",
            "isTerminal": false,
            "requiredEntitiesFromPayload": [],
            "requiredEntities": [],
            "negativeEntities": [],
            "requiredConditions": [],
            "negativeConditions": []
        },
        {
            "actionId": "321a5fcd-b067-4144-9095-d98fc8c3275f",
            "createdDateTime": "2019-05-14T09:09:32.9722995-07:00",
            "actionType": "SET_ENTITY",
            "payload": "{\"entityId\":\"f69975f2-c161-4fbc-8fa9-7be5c3a2f4f4\",\"enumValueId\":\"9af05a26-b1d7-4938-b980-03aff57029ed\"}",
            "isTerminal": false,
            "requiredEntitiesFromPayload": [],
            "requiredEntities": [],
            "negativeEntities": [],
            "requiredConditions": [],
            "negativeConditions": [],
            "entityId": "f69975f2-c161-4fbc-8fa9-7be5c3a2f4f4",
            "enumValueId": "9af05a26-b1d7-4938-b980-03aff57029ed"
        },
        {
            "actionId": "b6cb2485-0228-46af-a16e-2a7571ab866b",
            "createdDateTime": "2019-05-14T09:09:32.9723041-07:00",
            "actionType": "TEXT",
            "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Terminal Text 2\",\"marks\":[]}]}]}]}}}",
            "isTerminal": true,
            "requiredEntitiesFromPayload": [],
            "requiredEntities": [],
            "negativeEntities": [],
            "requiredConditions": [],
            "negativeConditions": []
        },
        {
            "actionId": "6efd56ab-1609-4bae-813a-1237467b8ed1",
            "createdDateTime": "2019-05-14T09:09:32.9723075-07:00",
            "actionType": "TEXT",
            "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Filler response\",\"marks\":[]}]}]}]}}}",
            "isTerminal": true,
            "requiredEntitiesFromPayload": [],
            "requiredEntities": [],
            "negativeEntities": [],
            "requiredConditions": [],
            "negativeConditions": []
        },
        {
            "actionId": "b2a5cd38-a552-477d-8f1a-800d6004637b",
            "createdDateTime": "2019-05-14T09:09:32.9723119-07:00",
            "actionType": "TEXT",
            "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Terminal Text 3\",\"marks\":[]}]}]}]}}}",
            "isTerminal": true,
            "requiredEntitiesFromPayload": [],
            "requiredEntities": [],
            "negativeEntities": [],
            "requiredConditions": [],
            "negativeConditions": []
        },
        {
            "actionId": "e1dcaea2-9c13-4cdf-9eea-911487f099d5",
            "createdDateTime": "2019-05-14T09:09:32.9723157-07:00",
            "actionType": "TEXT",
            "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Non-terminal Text 2\",\"marks\":[]}]}]}]}}}",
            "isTerminal": false,
            "requiredEntitiesFromPayload": [],
            "requiredEntities": [],
            "negativeEntities": [],
            "requiredConditions": [],
            "negativeConditions": []
        },
        {
            "actionId": "9e1632c3-e8de-473c-be58-81af71319320",
            "createdDateTime": "2019-05-14T09:10:31.589189-07:00",
            "actionType": "TEXT",
            "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Terminal Text 4\",\"marks\":[]}]}]}]}}}",
            "isTerminal": true,
            "requiredEntitiesFromPayload": [],
            "requiredEntities": [],
            "negativeEntities": [],
            "requiredConditions": [],
            "negativeConditions": []
        }
    ],
    "entities": [
        {
            "entityId": "f69975f2-c161-4fbc-8fa9-7be5c3a2f4f4",
            "createdDateTime": "2019-05-14T09:09:32.972243-07:00",
            "entityName": "myEnum",
            "entityType": "ENUM",
            "isMultivalue": false,
            "isNegatible": false,
            "enumValues": [
                {
                    "enumValueId": "cc7e8fcd-ece0-4eab-9cc0-9baeb3fb492d",
                    "enumValue": "ONE"
                },
                {
                    "enumValueId": "cfea476c-0526-4dd8-b468-44af5083548f",
                    "enumValue": "TWO"
                },
                {
                    "enumValueId": "9af05a26-b1d7-4938-b980-03aff57029ed",
                    "enumValue": "THREE"
                }
            ]
        }
    ],
    "packageId": "f6c3fced-6b09-4dc7-95f0-e626b9cfef76"
}
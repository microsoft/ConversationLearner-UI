{
    "trainDialogs": [
        {
            "tags": [],
            "description": "",
            "trainDialogId": "19c82187-2e53-48f6-b940-1feb286d5834",
            "rounds": [
                {
                    "extractorStep": {
                        "textVariations": [
                            {
                                "text": "I have 3 fruits and 4 vegetables",
                                "labelEntities": [
                                    {
                                        "entityId": "f9d18809-e7ca-42c1-8f93-eb5f86584e2d",
                                        "startCharIndex": 7,
                                        "endCharIndex": 7,
                                        "entityText": "3",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "3"
                                        },
                                        "builtinType": "builtin.number"
                                    },
                                    {
                                        "entityId": "f9d18809-e7ca-42c1-8f93-eb5f86584e2d",
                                        "startCharIndex": 20,
                                        "endCharIndex": 20,
                                        "entityText": "4",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "4"
                                        },
                                        "builtinType": "builtin.number"
                                    },
                                    {
                                        "entityId": "542a99de-fee3-4b6a-83c7-2bd60f852e30",
                                        "startCharIndex": 7,
                                        "endCharIndex": 7,
                                        "entityText": "3",
                                        "resolution": {},
                                        "builtinType": "LUIS"
                                    },
                                    {
                                        "entityId": "17b7d7ce-3136-490c-a427-03f8f694de22",
                                        "startCharIndex": 20,
                                        "endCharIndex": 20,
                                        "entityText": "4",
                                        "resolution": {},
                                        "builtinType": "LUIS"
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
                                        "entityId": "542a99de-fee3-4b6a-83c7-2bd60f852e30",
                                        "values": [
                                            {
                                                "userText": "3",
                                                "displayText": "3",
                                                "builtinType": "builtin.number",
                                                "resolution": {
                                                    "subtype": "integer",
                                                    "value": "3"
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        "entityId": "17b7d7ce-3136-490c-a427-03f8f694de22",
                                        "values": [
                                            {
                                                "userText": "4",
                                                "displayText": "4",
                                                "builtinType": "builtin.number",
                                                "resolution": {
                                                    "subtype": "integer",
                                                    "value": "4"
                                                }
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "f2b1e5f2-08c7-4fad-974d-e00f3c100546",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.012084007263183594,
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
                                "text": "I have 7 fruits and 8 vegetables",
                                "labelEntities": [
                                    {
                                        "entityId": "f9d18809-e7ca-42c1-8f93-eb5f86584e2d",
                                        "startCharIndex": 7,
                                        "endCharIndex": 7,
                                        "entityText": "7",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "7"
                                        },
                                        "builtinType": "builtin.number"
                                    },
                                    {
                                        "entityId": "f9d18809-e7ca-42c1-8f93-eb5f86584e2d",
                                        "startCharIndex": 20,
                                        "endCharIndex": 20,
                                        "entityText": "8",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "8"
                                        },
                                        "builtinType": "builtin.number"
                                    },
                                    {
                                        "entityId": "542a99de-fee3-4b6a-83c7-2bd60f852e30",
                                        "startCharIndex": 7,
                                        "endCharIndex": 7,
                                        "entityText": "7",
                                        "resolution": {},
                                        "builtinType": "LUIS"
                                    },
                                    {
                                        "entityId": "17b7d7ce-3136-490c-a427-03f8f694de22",
                                        "startCharIndex": 20,
                                        "endCharIndex": 20,
                                        "entityText": "8",
                                        "resolution": {},
                                        "builtinType": "LUIS"
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
                                        "entityId": "542a99de-fee3-4b6a-83c7-2bd60f852e30",
                                        "values": [
                                            {
                                                "userText": "7",
                                                "displayText": "7",
                                                "builtinType": "builtin.number",
                                                "resolution": {
                                                    "subtype": "integer",
                                                    "value": "7"
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        "entityId": "17b7d7ce-3136-490c-a427-03f8f694de22",
                                        "values": [
                                            {
                                                "userText": "8",
                                                "displayText": "8",
                                                "builtinType": "builtin.number",
                                                "resolution": {
                                                    "subtype": "integer",
                                                    "value": "8"
                                                }
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "f2b1e5f2-08c7-4fad-974d-e00f3c100546",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.013524770736694336,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        }
                    ]
                }
            ],
            "clientData": {
                "importHashes": []
            },
            "initialFilledEntities": [],
            "createdDateTime": "2019-09-23T21:19:36.770002+00:00",
            "lastModifiedDateTime": "2019-09-23T21:21:15+00:00"
        }
    ],
    "actions": [
        {
            "actionId": "f2b1e5f2-08c7-4fad-974d-e00f3c100546",
            "createdDateTime": "2019-09-23T21:20:18.4648565+00:00",
            "actionType": "TEXT",
            "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"You have \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"542a99de-fee3-4b6a-83c7-2bd60f852e30\",\"name\":\"fruits\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$fruits\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\" fruits and \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"17b7d7ce-3136-490c-a427-03f8f694de22\",\"name\":\"vegetables\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$vegetables\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\" vegetables\",\"marks\":[]}]}]}]}}}",
            "isTerminal": true,
            "requiredEntitiesFromPayload": [
                "542a99de-fee3-4b6a-83c7-2bd60f852e30",
                "17b7d7ce-3136-490c-a427-03f8f694de22"
            ],
            "requiredEntities": [
                "542a99de-fee3-4b6a-83c7-2bd60f852e30",
                "17b7d7ce-3136-490c-a427-03f8f694de22"
            ],
            "negativeEntities": [],
            "requiredConditions": [],
            "negativeConditions": [],
            "clientData": {
                "importHashes": []
            }
        }
    ],
    "entities": [
        {
            "doNotMemorize": true,
            "entityId": "f9d18809-e7ca-42c1-8f93-eb5f86584e2d",
            "createdDateTime": "2019-09-23T21:19:19.1875064+00:00",
            "entityName": "builtin-number",
            "entityType": "number",
            "isMultivalue": false,
            "isNegatible": false,
            "isResolutionRequired": false
        },
        {
            "entityId": "542a99de-fee3-4b6a-83c7-2bd60f852e30",
            "createdDateTime": "2019-09-23T21:19:18.4842925+00:00",
            "entityName": "fruits",
            "entityType": "LUIS",
            "isMultivalue": false,
            "isNegatible": false,
            "resolverType": "number",
            "isResolutionRequired": false
        },
        {
            "entityId": "17b7d7ce-3136-490c-a427-03f8f694de22",
            "createdDateTime": "2019-09-23T21:19:31.5000127+00:00",
            "entityName": "vegetables",
            "entityType": "LUIS",
            "isMultivalue": false,
            "isNegatible": false,
            "resolverType": "number",
            "isResolutionRequired": true
        }
    ],
    "packageId": "cf3a8450-362f-49ae-8eda-a122076ada28"
}
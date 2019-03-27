{
    "trainDialogs": [
        {
            "tags": [],
            "description": "",
            "trainDialogId": "3a1bf669-05b8-43cd-b70d-3a1abb373828",
            "rounds": [
                {
                    "extractorStep": {
                        "textVariations": [
                            {
                                "text": "test input 1",
                                "labelEntities": [
                                    {
                                        "entityId": "bff3a12d-e2f4-42bf-9a6c-0e564a9ef694",
                                        "startCharIndex": 0,
                                        "endCharIndex": 3,
                                        "entityText": "test",
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
                                        "entityId": "bff3a12d-e2f4-42bf-9a6c-0e564a9ef694",
                                        "values": [
                                            {
                                                "userText": "test",
                                                "displayText": "test",
                                                "builtinType": "LUIS",
                                                "resolution": {}
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "894b5bbf-a360-48dc-80f7-692ff3cce850",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.010682106018066406,
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
                                "text": "test input 2",
                                "labelEntities": [
                                    {
                                        "entityId": "bff3a12d-e2f4-42bf-9a6c-0e564a9ef694",
                                        "startCharIndex": 0,
                                        "endCharIndex": 3,
                                        "entityText": "test",
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
                                        "entityId": "bff3a12d-e2f4-42bf-9a6c-0e564a9ef694",
                                        "values": [
                                            {
                                                "userText": "test",
                                                "displayText": "test",
                                                "builtinType": "LUIS",
                                                "resolution": {}
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "894b5bbf-a360-48dc-80f7-692ff3cce850",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.01224827766418457,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        }
                    ]
                }
            ],
            "initialFilledEntities": [],
            "createdDateTime": "2019-03-26T18:54:38.0204489+00:00",
            "lastModifiedDateTime": "2019-03-26T18:54:56+00:00"
        }
    ],
    "actions": [
        {
            "actionId": "894b5bbf-a360-48dc-80f7-692ff3cce850",
            "createdDateTime": "2019-03-26T18:54:35.365418+00:00",
            "actionType": "TEXT",
            "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"The only response\",\"marks\":[]}]}]}]}}}",
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
            "entityId": "bff3a12d-e2f4-42bf-9a6c-0e564a9ef694",
            "createdDateTime": "2019-03-26T18:54:27.3957325+00:00",
            "entityName": "testEntity",
            "entityType": "LUIS",
            "isMultivalue": false,
            "isNegatible": false,
            "resolverType": "none"
        }
    ],
    "packageId": "5ee7ee7a-498a-4a52-8426-972c73b621ac"
}
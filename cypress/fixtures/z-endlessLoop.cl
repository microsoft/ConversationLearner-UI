{
    "trainDialogs": [
        {
            "trainDialogId": "963bd504-818b-4eb9-a317-e7c02367c3c8",
            "rounds": [
                {
                    "extractorStep": {
                        "textVariations": [
                            {
                                "text": "hi",
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
                            "labelAction": "e5dd64a5-4309-4d42-afbc-c07e0de5d6aa",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.01105952262878418,
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
                            "labelAction": "07de8b0e-11b8-4451-ba90-dcc8b3e6949c",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.009424209594726562,
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
                            "labelAction": "be1d87f5-b318-4663-acf3-5794c88423b6",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.01318216323852539,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        }
                    ]
                }
            ],
            "initialFilledEntities": [],
            "createdDateTime": "2018-12-14T02:18:14.3321773+00:00",
            "lastModifiedDateTime": "2018-12-14T02:18:45+00:00"
        },
        {
            "trainDialogId": "9dc00309-aa80-49fe-b15a-e0b80b7a656f",
            "rounds": [
                {
                    "extractorStep": {
                        "textVariations": [
                            {
                                "text": "howdy",
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
                            "labelAction": "07de8b0e-11b8-4451-ba90-dcc8b3e6949c",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.006388425827026367,
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
                            "labelAction": "be1d87f5-b318-4663-acf3-5794c88423b6",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.011663675308227539,
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
                            "labelAction": "e5dd64a5-4309-4d42-afbc-c07e0de5d6aa",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.0054128170013427734,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        }
                    ]
                }
            ],
            "initialFilledEntities": [],
            "createdDateTime": "2018-12-14T02:18:48.6580236+00:00",
            "lastModifiedDateTime": "2018-12-14T02:19:17+00:00"
        },
        {
            "trainDialogId": "4f0e0831-6537-4b4e-aff6-4fdfd1487251",
            "rounds": [
                {
                    "extractorStep": {
                        "textVariations": [
                            {
                                "text": "namaste",
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
                            "labelAction": "be1d87f5-b318-4663-acf3-5794c88423b6",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.00977182388305664,
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
                            "labelAction": "07de8b0e-11b8-4451-ba90-dcc8b3e6949c",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.011548519134521484,
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
                            "labelAction": "e5dd64a5-4309-4d42-afbc-c07e0de5d6aa",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.005757570266723633,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        }
                    ]
                }
            ],
            "initialFilledEntities": [],
            "createdDateTime": "2018-12-14T02:19:21.1766538+00:00",
            "lastModifiedDateTime": "2018-12-14T02:20:00+00:00"
        }
    ],
    "actions": [
        {
            "actionId": "e5dd64a5-4309-4d42-afbc-c07e0de5d6aa",
            "createdDateTime": "2018-12-14T02:17:48.151487+00:00",
            "actionType": "TEXT",
            "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Action One\",\"marks\":[]}]}]}]}}}",
            "isTerminal": false,
            "requiredEntitiesFromPayload": [],
            "requiredEntities": [],
            "negativeEntities": []
        },
        {
            "actionId": "07de8b0e-11b8-4451-ba90-dcc8b3e6949c",
            "createdDateTime": "2018-12-14T02:17:58.7846802+00:00",
            "actionType": "TEXT",
            "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Action Two\",\"marks\":[]}]}]}]}}}",
            "isTerminal": false,
            "requiredEntitiesFromPayload": [],
            "requiredEntities": [],
            "negativeEntities": []
        },
        {
            "actionId": "be1d87f5-b318-4663-acf3-5794c88423b6",
            "createdDateTime": "2018-12-14T02:18:08.0473613+00:00",
            "actionType": "TEXT",
            "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Action Three\",\"marks\":[]}]}]}]}}}",
            "isTerminal": false,
            "requiredEntitiesFromPayload": [],
            "requiredEntities": [],
            "negativeEntities": []
        }
    ],
    "entities": [],
    "packageId": "10590cb2-b475-4275-91b9-dc92a530d40d"
}
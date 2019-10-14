{
    "trainDialogs": [
        {
            "tags": [],
            "description": "",
            "trainDialogId": "5ef51e90-3fc1-49c1-b9ed-bdcfdb85da23",
            "rounds": [
                {
                    "extractorStep": {
                        "textVariations": [
                            {
                                "text": "Set the enum value!",
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
                            "labelAction": "0260c4f9-5727-419a-9acc-b04e32ce9e9b",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.006607770919799805,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        },
                        {
                            "input": {
                                "filledEntities": [
                                    {
                                        "entityId": "54b660a5-40e8-4d4e-940b-2ce3138c28cd",
                                        "values": [
                                            {
                                                "userText": "TWO",
                                                "displayText": "TWO",
                                                "builtinType": null,
                                                "enumValueId": "9cd1a6e1-82ac-4df3-b211-703fa0e66dc6",
                                                "resolution": null
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "76ac728c-a5d7-4a7d-8df4-2dec2f85a369",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.006268978118896484,
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
            "createdDateTime": "2019-10-14T15:42:02.7510116-07:00",
            "lastModifiedDateTime": "2019-10-14T22:42:02+00:00"
        },
        {
            "tags": [],
            "description": "",
            "trainDialogId": "911281ea-9215-4867-a439-eaecef30946b",
            "rounds": [
                {
                    "extractorStep": {
                        "textVariations": [
                            {
                                "text": "lets talk about fruits",
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
                            "labelAction": "6d32a052-b12a-4a71-bcc8-00adfdc2f289",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.015887975692749023,
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
                                "text": "i like avocados, blueberries, and cucumbers",
                                "labelEntities": [
                                    {
                                        "entityId": "ba50584b-244c-4c73-83fe-b0bf04498714",
                                        "startCharIndex": 7,
                                        "endCharIndex": 14,
                                        "entityText": "avocados"
                                    },
                                    {
                                        "entityId": "ba50584b-244c-4c73-83fe-b0bf04498714",
                                        "startCharIndex": 17,
                                        "endCharIndex": 27,
                                        "entityText": "blueberries"
                                    },
                                    {
                                        "entityId": "ba50584b-244c-4c73-83fe-b0bf04498714",
                                        "startCharIndex": 34,
                                        "endCharIndex": 42,
                                        "entityText": "cucumbers",
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
                                        "entityId": "ba50584b-244c-4c73-83fe-b0bf04498714",
                                        "values": [
                                            {
                                                "userText": "avocados",
                                                "displayText": "avocados",
                                                "builtinType": null,
                                                "resolution": null
                                            },
                                            {
                                                "userText": "blueberries",
                                                "displayText": "blueberries",
                                                "builtinType": null,
                                                "resolution": null
                                            },
                                            {
                                                "userText": "cucumbers",
                                                "displayText": "cucumbers",
                                                "builtinType": "LUIS",
                                                "resolution": {}
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "d87ed8d4-dfbd-41cd-9c41-1f4acee1ff02",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.012417078018188477,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        },
                        {
                            "input": {
                                "filledEntities": [
                                    {
                                        "entityId": "ba50584b-244c-4c73-83fe-b0bf04498714",
                                        "values": [
                                            {
                                                "userText": "avocados",
                                                "displayText": "avocados",
                                                "builtinType": null,
                                                "resolution": null
                                            },
                                            {
                                                "userText": "blueberries",
                                                "displayText": "blueberries",
                                                "builtinType": null,
                                                "resolution": null
                                            },
                                            {
                                                "userText": "cucumbers",
                                                "displayText": "cucumbers",
                                                "builtinType": "LUIS",
                                                "resolution": {}
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "6d32a052-b12a-4a71-bcc8-00adfdc2f289",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.012477874755859375,
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
                                "text": "i also each cranberries, peaches, and passion fruit",
                                "labelEntities": [
                                    {
                                        "entityId": "ba50584b-244c-4c73-83fe-b0bf04498714",
                                        "startCharIndex": 12,
                                        "endCharIndex": 22,
                                        "entityText": "cranberries",
                                        "resolution": {},
                                        "builtinType": "LUIS"
                                    },
                                    {
                                        "entityId": "ba50584b-244c-4c73-83fe-b0bf04498714",
                                        "startCharIndex": 25,
                                        "endCharIndex": 31,
                                        "entityText": "peaches"
                                    },
                                    {
                                        "entityId": "ba50584b-244c-4c73-83fe-b0bf04498714",
                                        "startCharIndex": 38,
                                        "endCharIndex": 50,
                                        "entityText": "passion fruit",
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
                                        "entityId": "ba50584b-244c-4c73-83fe-b0bf04498714",
                                        "values": [
                                            {
                                                "userText": "avocados",
                                                "displayText": "avocados",
                                                "builtinType": null,
                                                "resolution": null
                                            },
                                            {
                                                "userText": "blueberries",
                                                "displayText": "blueberries",
                                                "builtinType": null,
                                                "resolution": null
                                            },
                                            {
                                                "userText": "cucumbers",
                                                "displayText": "cucumbers",
                                                "builtinType": "LUIS",
                                                "resolution": {}
                                            },
                                            {
                                                "userText": "cranberries",
                                                "displayText": "cranberries",
                                                "builtinType": "LUIS",
                                                "resolution": {}
                                            },
                                            {
                                                "userText": "peaches",
                                                "displayText": "peaches",
                                                "builtinType": null,
                                                "resolution": null
                                            },
                                            {
                                                "userText": "passion fruit",
                                                "displayText": "passion fruit",
                                                "builtinType": "LUIS",
                                                "resolution": {}
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "e436b289-e382-4a09-bb4a-977c4b0b7976",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.012506246566772461,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        },
                        {
                            "input": {
                                "filledEntities": [
                                    {
                                        "entityId": "ba50584b-244c-4c73-83fe-b0bf04498714",
                                        "values": [
                                            {
                                                "userText": "avocados",
                                                "displayText": "avocados",
                                                "builtinType": null,
                                                "resolution": null
                                            },
                                            {
                                                "userText": "blueberries",
                                                "displayText": "blueberries",
                                                "builtinType": null,
                                                "resolution": null
                                            },
                                            {
                                                "userText": "cucumbers",
                                                "displayText": "cucumbers",
                                                "builtinType": "LUIS",
                                                "resolution": {}
                                            },
                                            {
                                                "userText": "cranberries",
                                                "displayText": "cranberries",
                                                "builtinType": "LUIS",
                                                "resolution": {}
                                            },
                                            {
                                                "userText": "peaches",
                                                "displayText": "peaches",
                                                "builtinType": null,
                                                "resolution": null
                                            },
                                            {
                                                "userText": "passion fruit",
                                                "displayText": "passion fruit",
                                                "builtinType": "LUIS",
                                                "resolution": {}
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "6d32a052-b12a-4a71-bcc8-00adfdc2f289",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.006430864334106445,
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
            "createdDateTime": "2019-10-14T15:42:02.7508869-07:00",
            "lastModifiedDateTime": "2019-10-14T22:42:02+00:00"
        },
        {
            "tags": [],
            "description": "",
            "trainDialogId": "2bf1a467-54e2-4c04-9f24-ccd043ee6900",
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
                            "labelAction": "c8de0a6b-f0e2-4a74-b06e-184dfcfee7e5",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.012739181518554688,
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
                                "text": "100",
                                "labelEntities": [
                                    {
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "startCharIndex": 0,
                                        "endCharIndex": 2,
                                        "entityText": "100",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "100"
                                        },
                                        "builtinType": "builtin.number"
                                    },
                                    {
                                        "entityId": "0f07bf29-e6b3-4fcc-877c-04b7df609f20",
                                        "startCharIndex": 0,
                                        "endCharIndex": 2,
                                        "entityText": "100",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "100"
                                        },
                                        "builtinType": "builtin.number"
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
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "values": [
                                            {
                                                "userText": "100",
                                                "displayText": "100",
                                                "builtinType": "builtin.number",
                                                "resolution": {
                                                    "subtype": "integer",
                                                    "value": "100"
                                                }
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "07745c2f-cb58-478a-8b03-af584e1d24f6",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.00571441650390625,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        },
                        {
                            "input": {
                                "filledEntities": [
                                    {
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "values": [
                                            {
                                                "userText": "100",
                                                "displayText": "100",
                                                "builtinType": "builtin.number",
                                                "resolution": {
                                                    "subtype": "integer",
                                                    "value": "100"
                                                }
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "c8de0a6b-f0e2-4a74-b06e-184dfcfee7e5",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.011363983154296875,
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
                                "text": "3",
                                "labelEntities": [
                                    {
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "startCharIndex": 0,
                                        "endCharIndex": 0,
                                        "entityText": "3",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "3"
                                        },
                                        "builtinType": "builtin.number"
                                    },
                                    {
                                        "entityId": "0f07bf29-e6b3-4fcc-877c-04b7df609f20",
                                        "startCharIndex": 0,
                                        "endCharIndex": 0,
                                        "entityText": "3",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "3"
                                        },
                                        "builtinType": "builtin.number"
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
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
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
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "8745f0d3-4044-4c5d-974f-71c979494429",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.007410526275634766,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        },
                        {
                            "input": {
                                "filledEntities": [
                                    {
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
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
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "c8de0a6b-f0e2-4a74-b06e-184dfcfee7e5",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.009434223175048828,
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
                                "text": "8",
                                "labelEntities": [
                                    {
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "startCharIndex": 0,
                                        "endCharIndex": 0,
                                        "entityText": "8",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "8"
                                        },
                                        "builtinType": "builtin.number"
                                    },
                                    {
                                        "entityId": "0f07bf29-e6b3-4fcc-877c-04b7df609f20",
                                        "startCharIndex": 0,
                                        "endCharIndex": 0,
                                        "entityText": "8",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "8"
                                        },
                                        "builtinType": "builtin.number"
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
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
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
                            "labelAction": "09825831-f220-4a42-9a5b-27f48773ae8a",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.012062311172485352,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        },
                        {
                            "input": {
                                "filledEntities": [
                                    {
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
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
                            "labelAction": "c8de0a6b-f0e2-4a74-b06e-184dfcfee7e5",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.006615400314331055,
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
            "createdDateTime": "2019-10-14T15:42:02.7509452-07:00",
            "lastModifiedDateTime": "2019-10-14T22:42:02+00:00"
        },
        {
            "tags": [],
            "description": "",
            "trainDialogId": "638d3d36-eef2-4190-abfc-0170d53c5f78",
            "rounds": [
                {
                    "extractorStep": {
                        "textVariations": [
                            {
                                "text": "Hi",
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
                            "labelAction": "c8de0a6b-f0e2-4a74-b06e-184dfcfee7e5",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.011181354522705078,
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
                                "text": "28",
                                "labelEntities": [
                                    {
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "startCharIndex": 0,
                                        "endCharIndex": 1,
                                        "entityText": "28",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "28"
                                        },
                                        "builtinType": "builtin.number"
                                    },
                                    {
                                        "entityId": "0f07bf29-e6b3-4fcc-877c-04b7df609f20",
                                        "startCharIndex": 0,
                                        "endCharIndex": 1,
                                        "entityText": "28",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "28"
                                        },
                                        "builtinType": "builtin.number"
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
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "values": [
                                            {
                                                "userText": "28",
                                                "displayText": "28",
                                                "builtinType": "builtin.number",
                                                "resolution": {
                                                    "subtype": "integer",
                                                    "value": "28"
                                                }
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "09825831-f220-4a42-9a5b-27f48773ae8a",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.008887529373168945,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        },
                        {
                            "input": {
                                "filledEntities": [
                                    {
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "values": [
                                            {
                                                "userText": "28",
                                                "displayText": "28",
                                                "builtinType": "builtin.number",
                                                "resolution": {
                                                    "subtype": "integer",
                                                    "value": "28"
                                                }
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "c8de0a6b-f0e2-4a74-b06e-184dfcfee7e5",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.0059146881103515625,
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
                                "text": "3",
                                "labelEntities": [
                                    {
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "startCharIndex": 0,
                                        "endCharIndex": 0,
                                        "entityText": "3",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "3"
                                        },
                                        "builtinType": "builtin.number"
                                    },
                                    {
                                        "entityId": "0f07bf29-e6b3-4fcc-877c-04b7df609f20",
                                        "startCharIndex": 0,
                                        "endCharIndex": 0,
                                        "entityText": "3",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "3"
                                        },
                                        "builtinType": "builtin.number"
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
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
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
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "8745f0d3-4044-4c5d-974f-71c979494429",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.005614042282104492,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        },
                        {
                            "input": {
                                "filledEntities": [
                                    {
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
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
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "c8de0a6b-f0e2-4a74-b06e-184dfcfee7e5",
                            "metrics": {
                                "predictMetrics": null
                            }
                        }
                    ]
                }
            ],
            "clientData": {
                "importHashes": []
            },
            "initialFilledEntities": [],
            "createdDateTime": "2019-10-14T15:42:02.7507392-07:00",
            "lastModifiedDateTime": "2019-10-14T22:42:02+00:00"
        },
        {
            "tags": [],
            "description": "",
            "trainDialogId": "266f9bdf-2ac1-4a47-ab29-5f3970e5c18a",
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
                            "labelAction": "c8de0a6b-f0e2-4a74-b06e-184dfcfee7e5",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.011990547180175781,
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
                                "text": "6",
                                "labelEntities": [
                                    {
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "startCharIndex": 0,
                                        "endCharIndex": 0,
                                        "entityText": "6",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "6"
                                        },
                                        "builtinType": "builtin.number"
                                    },
                                    {
                                        "entityId": "0f07bf29-e6b3-4fcc-877c-04b7df609f20",
                                        "startCharIndex": 0,
                                        "endCharIndex": 0,
                                        "entityText": "6",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "6"
                                        },
                                        "builtinType": "builtin.number"
                                    }
                                ]
                            },
                            {
                                "text": "7",
                                "labelEntities": [
                                    {
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "startCharIndex": 0,
                                        "endCharIndex": 0,
                                        "entityText": "7",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "7"
                                        },
                                        "builtinType": "builtin.number"
                                    },
                                    {
                                        "entityId": "0f07bf29-e6b3-4fcc-877c-04b7df609f20",
                                        "startCharIndex": 0,
                                        "endCharIndex": 0,
                                        "entityText": "7",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "7"
                                        },
                                        "builtinType": "builtin.number"
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
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "values": [
                                            {
                                                "userText": "6",
                                                "displayText": "6",
                                                "builtinType": "builtin.number",
                                                "resolution": {
                                                    "subtype": "integer",
                                                    "value": "6"
                                                }
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "09825831-f220-4a42-9a5b-27f48773ae8a",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.01236271858215332,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        },
                        {
                            "input": {
                                "filledEntities": [
                                    {
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "values": [
                                            {
                                                "userText": "6",
                                                "displayText": "6",
                                                "builtinType": "builtin.number",
                                                "resolution": {
                                                    "subtype": "integer",
                                                    "value": "6"
                                                }
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "c8de0a6b-f0e2-4a74-b06e-184dfcfee7e5",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.011654853820800781,
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
                                "text": "100",
                                "labelEntities": [
                                    {
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "startCharIndex": 0,
                                        "endCharIndex": 2,
                                        "entityText": "100",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "100"
                                        },
                                        "builtinType": "builtin.number"
                                    },
                                    {
                                        "entityId": "0f07bf29-e6b3-4fcc-877c-04b7df609f20",
                                        "startCharIndex": 0,
                                        "endCharIndex": 2,
                                        "entityText": "100",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "100"
                                        },
                                        "builtinType": "builtin.number"
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
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "values": [
                                            {
                                                "userText": "100",
                                                "displayText": "100",
                                                "builtinType": "builtin.number",
                                                "resolution": {
                                                    "subtype": "integer",
                                                    "value": "100"
                                                }
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "07745c2f-cb58-478a-8b03-af584e1d24f6",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.00574040412902832,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        },
                        {
                            "input": {
                                "filledEntities": [
                                    {
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "values": [
                                            {
                                                "userText": "100",
                                                "displayText": "100",
                                                "builtinType": "builtin.number",
                                                "resolution": {
                                                    "subtype": "integer",
                                                    "value": "100"
                                                }
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "c8de0a6b-f0e2-4a74-b06e-184dfcfee7e5",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.00557398796081543,
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
                                "text": "2",
                                "labelEntities": [
                                    {
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "startCharIndex": 0,
                                        "endCharIndex": 0,
                                        "entityText": "2",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "2"
                                        },
                                        "builtinType": "builtin.number"
                                    },
                                    {
                                        "entityId": "0f07bf29-e6b3-4fcc-877c-04b7df609f20",
                                        "startCharIndex": 0,
                                        "endCharIndex": 0,
                                        "entityText": "2",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "2"
                                        },
                                        "builtinType": "builtin.number"
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
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "values": [
                                            {
                                                "userText": "2",
                                                "displayText": "2",
                                                "builtinType": "builtin.number",
                                                "resolution": {
                                                    "subtype": "integer",
                                                    "value": "2"
                                                }
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "8745f0d3-4044-4c5d-974f-71c979494429",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.009526729583740234,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        },
                        {
                            "input": {
                                "filledEntities": [
                                    {
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "values": [
                                            {
                                                "userText": "2",
                                                "displayText": "2",
                                                "builtinType": "builtin.number",
                                                "resolution": {
                                                    "subtype": "integer",
                                                    "value": "2"
                                                }
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "c8de0a6b-f0e2-4a74-b06e-184dfcfee7e5",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.008112430572509766,
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
            "createdDateTime": "2019-10-14T15:42:02.7507953-07:00",
            "lastModifiedDateTime": "2019-10-14T22:42:02+00:00"
        },
        {
            "tags": [],
            "description": "",
            "trainDialogId": "5697488f-7671-4ca0-be07-f41f2075249c",
            "rounds": [
                {
                    "extractorStep": {
                        "textVariations": [
                            {
                                "text": "lets do different things based on number of labels",
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
                            "labelAction": "6d32a052-b12a-4a71-bcc8-00adfdc2f289",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.01158905029296875,
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
                                "text": "i like apples",
                                "labelEntities": [
                                    {
                                        "entityId": "ba50584b-244c-4c73-83fe-b0bf04498714",
                                        "startCharIndex": 7,
                                        "endCharIndex": 12,
                                        "entityText": "apples",
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
                                        "entityId": "ba50584b-244c-4c73-83fe-b0bf04498714",
                                        "values": [
                                            {
                                                "userText": "apples",
                                                "displayText": "apples",
                                                "builtinType": "LUIS",
                                                "resolution": {}
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "e7ec68f7-75ff-4e14-8d4c-b0248bb88a69",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.010613679885864258,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        },
                        {
                            "input": {
                                "filledEntities": [
                                    {
                                        "entityId": "ba50584b-244c-4c73-83fe-b0bf04498714",
                                        "values": [
                                            {
                                                "userText": "apples",
                                                "displayText": "apples",
                                                "builtinType": "LUIS",
                                                "resolution": {}
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "6d32a052-b12a-4a71-bcc8-00adfdc2f289",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.008808135986328125,
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
                                "text": "i like oranges and grapes",
                                "labelEntities": [
                                    {
                                        "entityId": "ba50584b-244c-4c73-83fe-b0bf04498714",
                                        "startCharIndex": 7,
                                        "endCharIndex": 13,
                                        "entityText": "oranges",
                                        "resolution": {},
                                        "builtinType": "LUIS"
                                    },
                                    {
                                        "entityId": "ba50584b-244c-4c73-83fe-b0bf04498714",
                                        "startCharIndex": 19,
                                        "endCharIndex": 24,
                                        "entityText": "grapes",
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
                                        "entityId": "ba50584b-244c-4c73-83fe-b0bf04498714",
                                        "values": [
                                            {
                                                "userText": "apples",
                                                "displayText": "apples",
                                                "builtinType": "LUIS",
                                                "resolution": {}
                                            },
                                            {
                                                "userText": "oranges",
                                                "displayText": "oranges",
                                                "builtinType": "LUIS",
                                                "resolution": {}
                                            },
                                            {
                                                "userText": "grapes",
                                                "displayText": "grapes",
                                                "builtinType": "LUIS",
                                                "resolution": {}
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "d87ed8d4-dfbd-41cd-9c41-1f4acee1ff02",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.0067501068115234375,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        },
                        {
                            "input": {
                                "filledEntities": [
                                    {
                                        "entityId": "ba50584b-244c-4c73-83fe-b0bf04498714",
                                        "values": [
                                            {
                                                "userText": "apples",
                                                "displayText": "apples",
                                                "builtinType": "LUIS",
                                                "resolution": {}
                                            },
                                            {
                                                "userText": "oranges",
                                                "displayText": "oranges",
                                                "builtinType": "LUIS",
                                                "resolution": {}
                                            },
                                            {
                                                "userText": "grapes",
                                                "displayText": "grapes",
                                                "builtinType": "LUIS",
                                                "resolution": {}
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "6d32a052-b12a-4a71-bcc8-00adfdc2f289",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.0074765682220458984,
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
                                "text": "i like bananas, pears, plums, and more!",
                                "labelEntities": [
                                    {
                                        "entityId": "ba50584b-244c-4c73-83fe-b0bf04498714",
                                        "startCharIndex": 7,
                                        "endCharIndex": 13,
                                        "entityText": "bananas",
                                        "resolution": {},
                                        "builtinType": "LUIS"
                                    },
                                    {
                                        "entityId": "ba50584b-244c-4c73-83fe-b0bf04498714",
                                        "startCharIndex": 16,
                                        "endCharIndex": 20,
                                        "entityText": "pears",
                                        "resolution": {},
                                        "builtinType": "LUIS"
                                    },
                                    {
                                        "entityId": "ba50584b-244c-4c73-83fe-b0bf04498714",
                                        "startCharIndex": 23,
                                        "endCharIndex": 27,
                                        "entityText": "plums",
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
                                        "entityId": "ba50584b-244c-4c73-83fe-b0bf04498714",
                                        "values": [
                                            {
                                                "userText": "apples",
                                                "displayText": "apples",
                                                "builtinType": "LUIS",
                                                "resolution": {}
                                            },
                                            {
                                                "userText": "oranges",
                                                "displayText": "oranges",
                                                "builtinType": "LUIS",
                                                "resolution": {}
                                            },
                                            {
                                                "userText": "grapes",
                                                "displayText": "grapes",
                                                "builtinType": "LUIS",
                                                "resolution": {}
                                            },
                                            {
                                                "userText": "bananas",
                                                "displayText": "bananas",
                                                "builtinType": "LUIS",
                                                "resolution": {}
                                            },
                                            {
                                                "userText": "pears",
                                                "displayText": "pears",
                                                "builtinType": "LUIS",
                                                "resolution": {}
                                            },
                                            {
                                                "userText": "plums",
                                                "displayText": "plums",
                                                "builtinType": "LUIS",
                                                "resolution": {}
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "e436b289-e382-4a09-bb4a-977c4b0b7976",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.006249189376831055,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        },
                        {
                            "input": {
                                "filledEntities": [
                                    {
                                        "entityId": "ba50584b-244c-4c73-83fe-b0bf04498714",
                                        "values": [
                                            {
                                                "userText": "apples",
                                                "displayText": "apples",
                                                "builtinType": "LUIS",
                                                "resolution": {}
                                            },
                                            {
                                                "userText": "oranges",
                                                "displayText": "oranges",
                                                "builtinType": "LUIS",
                                                "resolution": {}
                                            },
                                            {
                                                "userText": "grapes",
                                                "displayText": "grapes",
                                                "builtinType": "LUIS",
                                                "resolution": {}
                                            },
                                            {
                                                "userText": "bananas",
                                                "displayText": "bananas",
                                                "builtinType": "LUIS",
                                                "resolution": {}
                                            },
                                            {
                                                "userText": "pears",
                                                "displayText": "pears",
                                                "builtinType": "LUIS",
                                                "resolution": {}
                                            },
                                            {
                                                "userText": "plums",
                                                "displayText": "plums",
                                                "builtinType": "LUIS",
                                                "resolution": {}
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "6d32a052-b12a-4a71-bcc8-00adfdc2f289",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.011565446853637695,
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
            "createdDateTime": "2019-10-14T15:42:02.7509155-07:00",
            "lastModifiedDateTime": "2019-10-14T22:42:02+00:00"
        },
        {
            "tags": [],
            "description": "",
            "trainDialogId": "a58ae860-b702-460d-ada2-5cfeec363fba",
            "rounds": [
                {
                    "extractorStep": {
                        "textVariations": [
                            {
                                "text": "Hi",
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
                            "labelAction": "c8de0a6b-f0e2-4a74-b06e-184dfcfee7e5",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.011302947998046875,
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
                                "text": "3",
                                "labelEntities": [
                                    {
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "startCharIndex": 0,
                                        "endCharIndex": 0,
                                        "entityText": "3",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "3"
                                        },
                                        "builtinType": "builtin.number"
                                    },
                                    {
                                        "entityId": "0f07bf29-e6b3-4fcc-877c-04b7df609f20",
                                        "startCharIndex": 0,
                                        "endCharIndex": 0,
                                        "entityText": "3",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "3"
                                        },
                                        "builtinType": "builtin.number"
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
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
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
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "8745f0d3-4044-4c5d-974f-71c979494429",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.012307882308959961,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        },
                        {
                            "input": {
                                "filledEntities": [
                                    {
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
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
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "c8de0a6b-f0e2-4a74-b06e-184dfcfee7e5",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.011409997940063477,
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
                                "text": "15",
                                "labelEntities": [
                                    {
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "startCharIndex": 0,
                                        "endCharIndex": 1,
                                        "entityText": "15",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "15"
                                        },
                                        "builtinType": "builtin.number"
                                    },
                                    {
                                        "entityId": "0f07bf29-e6b3-4fcc-877c-04b7df609f20",
                                        "startCharIndex": 0,
                                        "endCharIndex": 1,
                                        "entityText": "15",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "15"
                                        },
                                        "builtinType": "builtin.number"
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
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "values": [
                                            {
                                                "userText": "15",
                                                "displayText": "15",
                                                "builtinType": "builtin.number",
                                                "resolution": {
                                                    "subtype": "integer",
                                                    "value": "15"
                                                }
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "09825831-f220-4a42-9a5b-27f48773ae8a",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.005852460861206055,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        },
                        {
                            "input": {
                                "filledEntities": [
                                    {
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "values": [
                                            {
                                                "userText": "15",
                                                "displayText": "15",
                                                "builtinType": "builtin.number",
                                                "resolution": {
                                                    "subtype": "integer",
                                                    "value": "15"
                                                }
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "c8de0a6b-f0e2-4a74-b06e-184dfcfee7e5",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.011673450469970703,
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
                                "text": "75",
                                "labelEntities": [
                                    {
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "startCharIndex": 0,
                                        "endCharIndex": 1,
                                        "entityText": "75",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "75"
                                        },
                                        "builtinType": "builtin.number"
                                    },
                                    {
                                        "entityId": "0f07bf29-e6b3-4fcc-877c-04b7df609f20",
                                        "startCharIndex": 0,
                                        "endCharIndex": 1,
                                        "entityText": "75",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "75"
                                        },
                                        "builtinType": "builtin.number"
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
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "values": [
                                            {
                                                "userText": "75",
                                                "displayText": "75",
                                                "builtinType": "builtin.number",
                                                "resolution": {
                                                    "subtype": "integer",
                                                    "value": "75"
                                                }
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "07745c2f-cb58-478a-8b03-af584e1d24f6",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.005656242370605469,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        },
                        {
                            "input": {
                                "filledEntities": [
                                    {
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "values": [
                                            {
                                                "userText": "75",
                                                "displayText": "75",
                                                "builtinType": "builtin.number",
                                                "resolution": {
                                                    "subtype": "integer",
                                                    "value": "75"
                                                }
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "c8de0a6b-f0e2-4a74-b06e-184dfcfee7e5",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.005657672882080078,
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
                                "text": "25",
                                "labelEntities": [
                                    {
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "startCharIndex": 0,
                                        "endCharIndex": 1,
                                        "entityText": "25",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "25"
                                        },
                                        "builtinType": "builtin.number"
                                    },
                                    {
                                        "entityId": "0f07bf29-e6b3-4fcc-877c-04b7df609f20",
                                        "startCharIndex": 0,
                                        "endCharIndex": 1,
                                        "entityText": "25",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "25"
                                        },
                                        "builtinType": "builtin.number"
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
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "values": [
                                            {
                                                "userText": "25",
                                                "displayText": "25",
                                                "builtinType": "builtin.number",
                                                "resolution": {
                                                    "subtype": "integer",
                                                    "value": "25"
                                                }
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "c8de0a6b-f0e2-4a74-b06e-184dfcfee7e5",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.011678218841552734,
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
            "createdDateTime": "2019-10-14T15:42:02.7509763-07:00",
            "lastModifiedDateTime": "2019-10-14T22:42:02+00:00"
        },
        {
            "tags": [],
            "description": "",
            "trainDialogId": "33324f38-de60-42cb-ab72-e651497b9813",
            "rounds": [
                {
                    "extractorStep": {
                        "textVariations": [
                            {
                                "text": "aseras",
                                "labelEntities": []
                            },
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
                            "labelAction": "c8de0a6b-f0e2-4a74-b06e-184dfcfee7e5",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.017904281616210938,
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
                                "text": "3",
                                "labelEntities": [
                                    {
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "startCharIndex": 0,
                                        "endCharIndex": 0,
                                        "entityText": "3",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "3"
                                        },
                                        "builtinType": "builtin.number"
                                    },
                                    {
                                        "entityId": "0f07bf29-e6b3-4fcc-877c-04b7df609f20",
                                        "startCharIndex": 0,
                                        "endCharIndex": 0,
                                        "entityText": "3",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "3"
                                        },
                                        "builtinType": "builtin.number"
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
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
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
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "8745f0d3-4044-4c5d-974f-71c979494429",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.005651712417602539,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        },
                        {
                            "input": {
                                "filledEntities": [
                                    {
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
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
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "c8de0a6b-f0e2-4a74-b06e-184dfcfee7e5",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.011104822158813477,
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
                                "text": "6",
                                "labelEntities": [
                                    {
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "startCharIndex": 0,
                                        "endCharIndex": 0,
                                        "entityText": "6",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "6"
                                        },
                                        "builtinType": "builtin.number"
                                    },
                                    {
                                        "entityId": "0f07bf29-e6b3-4fcc-877c-04b7df609f20",
                                        "startCharIndex": 0,
                                        "endCharIndex": 0,
                                        "entityText": "6",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "6"
                                        },
                                        "builtinType": "builtin.number"
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
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "values": [
                                            {
                                                "userText": "6",
                                                "displayText": "6",
                                                "builtinType": "builtin.number",
                                                "resolution": {
                                                    "subtype": "integer",
                                                    "value": "6"
                                                }
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "09825831-f220-4a42-9a5b-27f48773ae8a",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.006937980651855469,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        },
                        {
                            "input": {
                                "filledEntities": [
                                    {
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "values": [
                                            {
                                                "userText": "6",
                                                "displayText": "6",
                                                "builtinType": "builtin.number",
                                                "resolution": {
                                                    "subtype": "integer",
                                                    "value": "6"
                                                }
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "c8de0a6b-f0e2-4a74-b06e-184dfcfee7e5",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.011712312698364258,
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
                                "text": "20",
                                "labelEntities": [
                                    {
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "startCharIndex": 0,
                                        "endCharIndex": 1,
                                        "entityText": "20",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "20"
                                        },
                                        "builtinType": "builtin.number"
                                    },
                                    {
                                        "entityId": "0f07bf29-e6b3-4fcc-877c-04b7df609f20",
                                        "startCharIndex": 0,
                                        "endCharIndex": 1,
                                        "entityText": "20",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "20"
                                        },
                                        "builtinType": "builtin.number"
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
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "values": [
                                            {
                                                "userText": "20",
                                                "displayText": "20",
                                                "builtinType": "builtin.number",
                                                "resolution": {
                                                    "subtype": "integer",
                                                    "value": "20"
                                                }
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "09825831-f220-4a42-9a5b-27f48773ae8a",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.006045103073120117,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        },
                        {
                            "input": {
                                "filledEntities": [
                                    {
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "values": [
                                            {
                                                "userText": "20",
                                                "displayText": "20",
                                                "builtinType": "builtin.number",
                                                "resolution": {
                                                    "subtype": "integer",
                                                    "value": "20"
                                                }
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "c8de0a6b-f0e2-4a74-b06e-184dfcfee7e5",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.012843847274780273,
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
                                "text": "42",
                                "labelEntities": [
                                    {
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "startCharIndex": 0,
                                        "endCharIndex": 1,
                                        "entityText": "42",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "42"
                                        },
                                        "builtinType": "builtin.number"
                                    },
                                    {
                                        "entityId": "0f07bf29-e6b3-4fcc-877c-04b7df609f20",
                                        "startCharIndex": 0,
                                        "endCharIndex": 1,
                                        "entityText": "42",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "42"
                                        },
                                        "builtinType": "builtin.number"
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
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "values": [
                                            {
                                                "userText": "42",
                                                "displayText": "42",
                                                "builtinType": "builtin.number",
                                                "resolution": {
                                                    "subtype": "integer",
                                                    "value": "42"
                                                }
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "07745c2f-cb58-478a-8b03-af584e1d24f6",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.010656356811523438,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        },
                        {
                            "input": {
                                "filledEntities": [
                                    {
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "values": [
                                            {
                                                "userText": "42",
                                                "displayText": "42",
                                                "builtinType": "builtin.number",
                                                "resolution": {
                                                    "subtype": "integer",
                                                    "value": "42"
                                                }
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "c8de0a6b-f0e2-4a74-b06e-184dfcfee7e5",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.010201215744018555,
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
            "createdDateTime": "2019-10-14T15:42:02.750848-07:00",
            "lastModifiedDateTime": "2019-10-14T22:42:02+00:00"
        },
        {
            "tags": [],
            "description": "",
            "trainDialogId": "9e662ff8-cdec-43fc-8e2a-6995b237291b",
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
                            "labelAction": "c8de0a6b-f0e2-4a74-b06e-184dfcfee7e5",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.011936187744140625,
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
                                "text": "The numbers are 4 and 21",
                                "labelEntities": [
                                    {
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                                        "startCharIndex": 16,
                                        "endCharIndex": 16,
                                        "entityText": "4",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "4"
                                        },
                                        "builtinType": "builtin.number"
                                    },
                                    {
                                        "entityId": "0f07bf29-e6b3-4fcc-877c-04b7df609f20",
                                        "startCharIndex": 16,
                                        "endCharIndex": 16,
                                        "entityText": "4",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "4"
                                        },
                                        "builtinType": "builtin.number"
                                    },
                                    {
                                        "entityId": "0f07bf29-e6b3-4fcc-877c-04b7df609f20",
                                        "startCharIndex": 22,
                                        "endCharIndex": 23,
                                        "entityText": "21",
                                        "resolution": {
                                            "subtype": "integer",
                                            "value": "21"
                                        },
                                        "builtinType": "builtin.number"
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
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
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
                            "labelAction": "8745f0d3-4044-4c5d-974f-71c979494429",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.0058193206787109375,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        },
                        {
                            "input": {
                                "filledEntities": [
                                    {
                                        "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
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
                            "labelAction": "c8de0a6b-f0e2-4a74-b06e-184dfcfee7e5",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.005566120147705078,
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
            "createdDateTime": "2019-10-14T15:49:50.0346423-07:00",
            "lastModifiedDateTime": "2019-10-14T22:52:43+00:00"
        },
        {
            "tags": [],
            "description": "",
            "trainDialogId": "18166f2e-cab3-48d2-abd6-e312a69c6edd",
            "rounds": [
                {
                    "extractorStep": {
                        "textVariations": [
                            {
                                "text": "lets label some fruits",
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
                            "labelAction": "6d32a052-b12a-4a71-bcc8-00adfdc2f289",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.015622854232788086,
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
                                "text": "apples, bananas, grapes, pears, and plums",
                                "labelEntities": [
                                    {
                                        "entityId": "ba50584b-244c-4c73-83fe-b0bf04498714",
                                        "startCharIndex": 0,
                                        "endCharIndex": 5,
                                        "entityText": "apples"
                                    },
                                    {
                                        "entityId": "ba50584b-244c-4c73-83fe-b0bf04498714",
                                        "startCharIndex": 8,
                                        "endCharIndex": 14,
                                        "entityText": "bananas"
                                    },
                                    {
                                        "entityId": "ba50584b-244c-4c73-83fe-b0bf04498714",
                                        "startCharIndex": 17,
                                        "endCharIndex": 22,
                                        "entityText": "grapes"
                                    },
                                    {
                                        "entityId": "ba50584b-244c-4c73-83fe-b0bf04498714",
                                        "startCharIndex": 25,
                                        "endCharIndex": 29,
                                        "entityText": "pears"
                                    },
                                    {
                                        "entityId": "ba50584b-244c-4c73-83fe-b0bf04498714",
                                        "startCharIndex": 36,
                                        "endCharIndex": 40,
                                        "entityText": "plums"
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
                                        "entityId": "ba50584b-244c-4c73-83fe-b0bf04498714",
                                        "values": [
                                            {
                                                "userText": "apples",
                                                "displayText": "apples",
                                                "builtinType": null,
                                                "resolution": null
                                            },
                                            {
                                                "userText": "bananas",
                                                "displayText": "bananas",
                                                "builtinType": null,
                                                "resolution": null
                                            },
                                            {
                                                "userText": "grapes",
                                                "displayText": "grapes",
                                                "builtinType": null,
                                                "resolution": null
                                            },
                                            {
                                                "userText": "pears",
                                                "displayText": "pears",
                                                "builtinType": null,
                                                "resolution": null
                                            },
                                            {
                                                "userText": "plums",
                                                "displayText": "plums",
                                                "builtinType": null,
                                                "resolution": null
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "e436b289-e382-4a09-bb4a-977c4b0b7976",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.01227569580078125,
                                    "contextDialogBlisTime": 0
                                }
                            }
                        },
                        {
                            "input": {
                                "filledEntities": [
                                    {
                                        "entityId": "ba50584b-244c-4c73-83fe-b0bf04498714",
                                        "values": [
                                            {
                                                "userText": "apples",
                                                "displayText": "apples",
                                                "builtinType": null,
                                                "resolution": null
                                            },
                                            {
                                                "userText": "bananas",
                                                "displayText": "bananas",
                                                "builtinType": null,
                                                "resolution": null
                                            },
                                            {
                                                "userText": "grapes",
                                                "displayText": "grapes",
                                                "builtinType": null,
                                                "resolution": null
                                            },
                                            {
                                                "userText": "pears",
                                                "displayText": "pears",
                                                "builtinType": null,
                                                "resolution": null
                                            },
                                            {
                                                "userText": "plums",
                                                "displayText": "plums",
                                                "builtinType": null,
                                                "resolution": null
                                            }
                                        ]
                                    }
                                ],
                                "context": {},
                                "maskedActions": []
                            },
                            "labelAction": "6d32a052-b12a-4a71-bcc8-00adfdc2f289",
                            "metrics": {
                                "predictMetrics": {
                                    "blisTime": 0.011931896209716797,
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
            "createdDateTime": "2019-10-14T15:53:28.3112824-07:00",
            "lastModifiedDateTime": "2019-10-14T22:54:29+00:00"
        }
    ],
    "actions": [
        {
            "actionId": "c8de0a6b-f0e2-4a74-b06e-184dfcfee7e5",
            "createdDateTime": "2019-10-14T15:42:02.7505739-07:00",
            "actionType": "TEXT",
            "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"What is the number?\",\"marks\":[]}]}]}]}}}",
            "isTerminal": true,
            "isEntryNode": false,
            "requiredEntitiesFromPayload": [],
            "requiredEntities": [],
            "negativeEntities": [],
            "requiredConditions": [],
            "negativeConditions": [],
            "suggestedEntity": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
            "clientData": {
                "importHashes": []
            }
        },
        {
            "actionId": "8745f0d3-4044-4c5d-974f-71c979494429",
            "createdDateTime": "2019-10-14T15:42:02.7506041-07:00",
            "actionType": "TEXT",
            "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Your number is low!\",\"marks\":[]}]}]}]}}}",
            "isTerminal": false,
            "isEntryNode": false,
            "requiredEntitiesFromPayload": [],
            "requiredEntities": [],
            "negativeEntities": [],
            "requiredConditions": [
                {
                    "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                    "value": 5,
                    "condition": "LESS_THAN"
                }
            ],
            "negativeConditions": [],
            "clientData": {
                "importHashes": []
            }
        },
        {
            "actionId": "09825831-f220-4a42-9a5b-27f48773ae8a",
            "createdDateTime": "2019-10-14T15:42:02.7506238-07:00",
            "actionType": "TEXT",
            "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Your number is normal.\",\"marks\":[]}]}]}]}}}",
            "isTerminal": false,
            "isEntryNode": false,
            "requiredEntitiesFromPayload": [],
            "requiredEntities": [],
            "negativeEntities": [],
            "requiredConditions": [
                {
                    "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                    "value": 5,
                    "condition": "GREATER_THAN_OR_EQUAL"
                },
                {
                    "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                    "value": 30,
                    "condition": "LESS_THAN"
                }
            ],
            "negativeConditions": [],
            "clientData": {
                "importHashes": []
            }
        },
        {
            "actionId": "07745c2f-cb58-478a-8b03-af584e1d24f6",
            "createdDateTime": "2019-10-14T15:42:02.7506372-07:00",
            "actionType": "TEXT",
            "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Your number is high!\",\"marks\":[]}]}]}]}}}",
            "isTerminal": false,
            "isEntryNode": false,
            "requiredEntitiesFromPayload": [],
            "requiredEntities": [],
            "negativeEntities": [],
            "requiredConditions": [
                {
                    "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
                    "value": 30,
                    "condition": "GREATER_THAN_OR_EQUAL"
                }
            ],
            "negativeConditions": [],
            "clientData": {
                "importHashes": []
            }
        },
        {
            "actionId": "0260c4f9-5727-419a-9acc-b04e32ce9e9b",
            "createdDateTime": "2019-10-14T15:42:02.7506473-07:00",
            "actionType": "SET_ENTITY",
            "payload": "{\"entityId\":\"54b660a5-40e8-4d4e-940b-2ce3138c28cd\",\"enumValueId\":\"9cd1a6e1-82ac-4df3-b211-703fa0e66dc6\"}",
            "isTerminal": false,
            "isEntryNode": false,
            "requiredEntitiesFromPayload": [],
            "requiredEntities": [],
            "negativeEntities": [],
            "requiredConditions": [],
            "negativeConditions": [],
            "entityId": "54b660a5-40e8-4d4e-940b-2ce3138c28cd",
            "enumValueId": "9cd1a6e1-82ac-4df3-b211-703fa0e66dc6",
            "clientData": {
                "importHashes": []
            }
        },
        {
            "actionId": "6d32a052-b12a-4a71-bcc8-00adfdc2f289",
            "createdDateTime": "2019-10-14T15:42:02.750662-07:00",
            "actionType": "TEXT",
            "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"List your favorite fruits.\",\"marks\":[]}]}]}]}}}",
            "isTerminal": true,
            "isEntryNode": false,
            "requiredEntitiesFromPayload": [],
            "requiredEntities": [],
            "negativeEntities": [],
            "requiredConditions": [],
            "negativeConditions": [],
            "clientData": {
                "importHashes": []
            }
        },
        {
            "actionId": "e7ec68f7-75ff-4e14-8d4c-b0248bb88a69",
            "createdDateTime": "2019-10-14T15:42:02.7506711-07:00",
            "actionType": "TEXT",
            "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"You have one fruit: \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"ba50584b-244c-4c73-83fe-b0bf04498714\",\"name\":\"myMultiValueEntity\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$myMultiValueEntity\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]}]}]}}}",
            "isTerminal": false,
            "isEntryNode": false,
            "requiredEntitiesFromPayload": [
                "ba50584b-244c-4c73-83fe-b0bf04498714"
            ],
            "requiredEntities": [
                "ba50584b-244c-4c73-83fe-b0bf04498714"
            ],
            "negativeEntities": [],
            "requiredConditions": [
                {
                    "entityId": "ba50584b-244c-4c73-83fe-b0bf04498714",
                    "value": 1,
                    "condition": "EQUAL"
                }
            ],
            "negativeConditions": [],
            "clientData": {
                "importHashes": []
            }
        },
        {
            "actionId": "d87ed8d4-dfbd-41cd-9c41-1f4acee1ff02",
            "createdDateTime": "2019-10-14T15:42:02.7506858-07:00",
            "actionType": "TEXT",
            "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"You have some fruits: \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"ba50584b-244c-4c73-83fe-b0bf04498714\",\"name\":\"myMultiValueEntity\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$myMultiValueEntity\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]}]}]}}}",
            "isTerminal": false,
            "isEntryNode": false,
            "requiredEntitiesFromPayload": [
                "ba50584b-244c-4c73-83fe-b0bf04498714"
            ],
            "requiredEntities": [
                "ba50584b-244c-4c73-83fe-b0bf04498714"
            ],
            "negativeEntities": [],
            "requiredConditions": [
                {
                    "entityId": "ba50584b-244c-4c73-83fe-b0bf04498714",
                    "value": 1,
                    "condition": "GREATER_THAN"
                },
                {
                    "entityId": "ba50584b-244c-4c73-83fe-b0bf04498714",
                    "value": 3,
                    "condition": "LESS_THEN_OR_EQUAL"
                }
            ],
            "negativeConditions": [],
            "clientData": {
                "importHashes": []
            }
        },
        {
            "actionId": "e436b289-e382-4a09-bb4a-977c4b0b7976",
            "createdDateTime": "2019-10-14T15:42:02.7507009-07:00",
            "actionType": "TEXT",
            "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"You have many fruits: \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"ba50584b-244c-4c73-83fe-b0bf04498714\",\"name\":\"myMultiValueEntity\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$myMultiValueEntity\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]}]}]}}}",
            "isTerminal": false,
            "isEntryNode": false,
            "requiredEntitiesFromPayload": [
                "ba50584b-244c-4c73-83fe-b0bf04498714"
            ],
            "requiredEntities": [
                "ba50584b-244c-4c73-83fe-b0bf04498714"
            ],
            "negativeEntities": [],
            "requiredConditions": [
                {
                    "entityId": "ba50584b-244c-4c73-83fe-b0bf04498714",
                    "value": 3,
                    "condition": "GREATER_THAN"
                }
            ],
            "negativeConditions": [],
            "clientData": {
                "importHashes": []
            }
        },
        {
            "actionId": "76ac728c-a5d7-4a7d-8df4-2dec2f85a369",
            "createdDateTime": "2019-10-14T15:42:02.7507151-07:00",
            "actionType": "TEXT",
            "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Enum Value is set to Two!\",\"marks\":[]}]}]}]}}}",
            "isTerminal": true,
            "isEntryNode": false,
            "requiredEntitiesFromPayload": [],
            "requiredEntities": [],
            "negativeEntities": [],
            "requiredConditions": [
                {
                    "entityId": "54b660a5-40e8-4d4e-940b-2ce3138c28cd",
                    "valueId": "9cd1a6e1-82ac-4df3-b211-703fa0e66dc6",
                    "condition": "EQUAL"
                }
            ],
            "negativeConditions": [],
            "clientData": {
                "importHashes": []
            }
        },
        {
            "actionId": "2c41993e-bbe5-4e5a-b3a8-822b7bc89600",
            "createdDateTime": "2019-10-14T15:42:32.4296538-07:00",
            "actionType": "SET_ENTITY",
            "payload": "{\"entityId\":\"54b660a5-40e8-4d4e-940b-2ce3138c28cd\",\"enumValueId\":\"605e3f9f-ff60-4ed3-9fe9-af4d1826fe63\"}",
            "isTerminal": false,
            "isEntryNode": false,
            "requiredEntitiesFromPayload": [],
            "requiredEntities": [],
            "negativeEntities": [],
            "requiredConditions": [],
            "negativeConditions": [],
            "entityId": "54b660a5-40e8-4d4e-940b-2ce3138c28cd",
            "enumValueId": "605e3f9f-ff60-4ed3-9fe9-af4d1826fe63",
            "clientData": {
                "importHashes": []
            }
        }
    ],
    "entities": [
        {
            "doNotMemorize": true,
            "entityId": "0f07bf29-e6b3-4fcc-877c-04b7df609f20",
            "createdDateTime": "2019-10-14T15:42:02.7502749-07:00",
            "entityName": "builtin-number",
            "entityType": "number",
            "isMultivalue": false,
            "isNegatible": false,
            "isResolutionRequired": false
        },
        {
            "entityId": "4ad26b43-1c3b-40d9-8713-82dbee3b4b15",
            "createdDateTime": "2019-10-14T15:42:02.7503486-07:00",
            "entityName": "myNumber",
            "entityType": "LUIS",
            "isMultivalue": false,
            "isNegatible": false,
            "resolverType": "number",
            "isResolutionRequired": true
        },
        {
            "entityId": "f17455aa-c010-4083-a4d3-57762d658ffa",
            "createdDateTime": "2019-10-14T15:42:02.7503662-07:00",
            "entityName": "myOtherEntity",
            "entityType": "LUIS",
            "isMultivalue": false,
            "isNegatible": false,
            "resolverType": "none",
            "isResolutionRequired": false
        },
        {
            "entityId": "54b660a5-40e8-4d4e-940b-2ce3138c28cd",
            "createdDateTime": "2019-10-14T15:42:02.750382-07:00",
            "entityName": "myEnumEntity",
            "entityType": "ENUM",
            "isMultivalue": false,
            "isNegatible": false,
            "isResolutionRequired": false,
            "enumValues": [
                {
                    "enumValueId": "7fbcf90a-6656-44a1-8467-a168919ee6c1",
                    "enumValue": "ONE"
                },
                {
                    "enumValueId": "9cd1a6e1-82ac-4df3-b211-703fa0e66dc6",
                    "enumValue": "TWO"
                },
                {
                    "enumValueId": "605e3f9f-ff60-4ed3-9fe9-af4d1826fe63",
                    "enumValue": "THREE"
                }
            ]
        },
        {
            "entityId": "ba50584b-244c-4c73-83fe-b0bf04498714",
            "createdDateTime": "2019-10-14T15:42:02.750395-07:00",
            "entityName": "myMultiValueEntity",
            "entityType": "LUIS",
            "isMultivalue": true,
            "isNegatible": false,
            "resolverType": "none",
            "isResolutionRequired": false
        }
    ],
    "packageId": "ce28be78-b001-4f76-ab00-ecd05ade919b"
}
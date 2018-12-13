{
  "trainDialogs": [
    {
      "trainDialogId": "518aef46-f67c-4df7-805a-da557dd2bbb2",
      "rounds": [
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "This is Tag.",
                "labelEntities": [
                  {
                    "entityId": "bae52514-d18e-4b59-be27-a042b4b6eef6",
                    "startCharIndex": 8,
                    "endCharIndex": 10,
                    "entityText": "Tag",
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
                    "entityId": "bae52514-d18e-4b59-be27-a042b4b6eef6",
                    "values": [
                      {
                        "userText": "Tag",
                        "displayText": "Tag",
                        "builtinType": "LUIS",
                        "resolution": {}
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "369d7dc7-cd03-4473-90dc-a6e9abf49342",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.01170969009399414,
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
                "text": "This is Frog and Tag.",
                "labelEntities": [
                  {
                    "entityId": "bae52514-d18e-4b59-be27-a042b4b6eef6",
                    "startCharIndex": 8,
                    "endCharIndex": 11,
                    "entityText": "Frog",
                    "resolution": {},
                    "builtinType": "LUIS"
                  },
                  {
                    "entityId": "bae52514-d18e-4b59-be27-a042b4b6eef6",
                    "startCharIndex": 17,
                    "endCharIndex": 19,
                    "entityText": "Tag"
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
                    "entityId": "bae52514-d18e-4b59-be27-a042b4b6eef6",
                    "values": [
                      {
                        "userText": "Tag",
                        "displayText": "Tag",
                        "builtinType": "LUIS",
                        "resolution": {}
                      },
                      {
                        "userText": "Frog",
                        "displayText": "Frog",
                        "builtinType": "LUIS",
                        "resolution": {}
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "25711d4e-2bef-4ae6-8a1a-474e8ebcf6aa",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.01284933090209961,
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
                "text": "This is Tag and Frog.",
                "labelEntities": [
                  {
                    "entityId": "bae52514-d18e-4b59-be27-a042b4b6eef6",
                    "startCharIndex": 8,
                    "endCharIndex": 10,
                    "entityText": "Tag"
                  },
                  {
                    "entityId": "bae52514-d18e-4b59-be27-a042b4b6eef6",
                    "startCharIndex": 16,
                    "endCharIndex": 19,
                    "entityText": "Frog"
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
                    "entityId": "bae52514-d18e-4b59-be27-a042b4b6eef6",
                    "values": [
                      {
                        "userText": "Tag",
                        "displayText": "Tag",
                        "builtinType": "LUIS",
                        "resolution": {}
                      },
                      {
                        "userText": "Frog",
                        "displayText": "Frog",
                        "builtinType": "LUIS",
                        "resolution": {}
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "25711d4e-2bef-4ae6-8a1a-474e8ebcf6aa",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.010688066482543945,
                  "contextDialogBlisTime": 0
                }
              }
            }
          ]
        }
      ],
      "initialFilledEntities": [],
      "createdDateTime": "2018-12-11T19:36:43.8804223+00:00",
      "lastModifiedDateTime": "2018-12-11T19:36:43+00:00"
    },
    {
      "trainDialogId": "ab5e33ab-555e-4285-998e-01bd564be62f",
      "rounds": [
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "This is Tag.",
                "labelEntities": [
                  {
                    "entityId": "bae52514-d18e-4b59-be27-a042b4b6eef6",
                    "startCharIndex": 8,
                    "endCharIndex": 10,
                    "entityText": "Tag"
                  }
                ]
              },
              {
                "text": "This is Frog and Tag.",
                "labelEntities": [
                  {
                    "entityId": "bae52514-d18e-4b59-be27-a042b4b6eef6",
                    "startCharIndex": 8,
                    "endCharIndex": 11,
                    "entityText": "Frog",
                    "resolution": {},
                    "builtinType": "LUIS"
                  },
                  {
                    "entityId": "bae52514-d18e-4b59-be27-a042b4b6eef6",
                    "startCharIndex": 17,
                    "endCharIndex": 19,
                    "entityText": "Tag"
                  }
                ]
              },
              {
                "text": "This is Tag and Frog.",
                "labelEntities": [
                  {
                    "entityId": "bae52514-d18e-4b59-be27-a042b4b6eef6",
                    "startCharIndex": 8,
                    "endCharIndex": 10,
                    "entityText": "Tag"
                  },
                  {
                    "entityId": "bae52514-d18e-4b59-be27-a042b4b6eef6",
                    "startCharIndex": 16,
                    "endCharIndex": 19,
                    "entityText": "Frog"
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
                    "entityId": "bae52514-d18e-4b59-be27-a042b4b6eef6",
                    "values": [
                      {
                        "userText": "Tag",
                        "displayText": "Tag",
                        "builtinType": null,
                        "resolution": null
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "25711d4e-2bef-4ae6-8a1a-474e8ebcf6aa",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.009115934371948242,
                  "contextDialogBlisTime": 0
                }
              }
            }
          ]
        }
      ],
      "initialFilledEntities": [],
      "createdDateTime": "2018-12-11T19:37:01.6114416+00:00",
      "lastModifiedDateTime": "2018-12-11T19:44:20+00:00"
    }
  ],
  "actions": [
    {
      "actionId": "369d7dc7-cd03-4473-90dc-a6e9abf49342",
      "createdDateTime": "2018-12-11T19:36:43.8804223+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Hello\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": []
    },
    {
      "actionId": "25711d4e-2bef-4ae6-8a1a-474e8ebcf6aa",
      "createdDateTime": "2018-12-11T19:36:43.8804223+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Hi\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": []
    }
  ],
  "entities": [
    {
      "entityId": "bae52514-d18e-4b59-be27-a042b4b6eef6",
      "createdDateTime": "2018-12-11T19:36:43.8804223+00:00",
      "entityName": "multi",
      "entityType": "LUIS",
      "isMultivalue": true,
      "isNegatible": false,
      "resolverType": "none"
    }
  ],
  "packageId": "7ff1dd21-ed52-413c-8716-1ec948859ffb"
}
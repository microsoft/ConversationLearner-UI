{
  "trainDialogs": [
    {
      "tags": [
        "Tag"
      ],
      "description": "Tag Only",
      "trainDialogId": "688d9898-14d6-492f-a2ef-0eb732958db8",
      "rounds": [
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "This is Tag.",
                "labelEntities": [
                  {
                    "entityId": "757d77de-e137-4347-8ad6-3a39bb9fd30d",
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
                    "entityId": "757d77de-e137-4347-8ad6-3a39bb9fd30d",
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
              "labelAction": "9d54124c-8a4f-4b31-b8d8-b6c60a366ee5",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.00574040412902832,
                  "contextDialogBlisTime": 0
                }
              }
            }
          ]
        }
      ],
      "initialFilledEntities": [],
      "createdDateTime": "2019-03-05T03:47:23.6568651+00:00",
      "lastModifiedDateTime": "2019-03-05T03:47:43+00:00"
    },
    {
      "tags": [
        "Tag",
        "Frog"
      ],
      "description": "Both Tag & Frog",
      "trainDialogId": "7ab3ad26-1094-4ef1-bdce-3391c5ce5af3",
      "rounds": [
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "This is Tag.",
                "labelEntities": [
                  {
                    "entityId": "757d77de-e137-4347-8ad6-3a39bb9fd30d",
                    "startCharIndex": 8,
                    "endCharIndex": 10,
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
                    "entityId": "757d77de-e137-4347-8ad6-3a39bb9fd30d",
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
              "labelAction": "9d54124c-8a4f-4b31-b8d8-b6c60a366ee5",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.015116214752197265,
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
                    "entityId": "757d77de-e137-4347-8ad6-3a39bb9fd30d",
                    "startCharIndex": 8,
                    "endCharIndex": 11,
                    "entityText": "Frog"
                  },
                  {
                    "entityId": "757d77de-e137-4347-8ad6-3a39bb9fd30d",
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
                    "entityId": "757d77de-e137-4347-8ad6-3a39bb9fd30d",
                    "values": [
                      {
                        "userText": "Tag",
                        "displayText": "Tag",
                        "builtinType": null,
                        "resolution": null
                      },
                      {
                        "userText": "Frog",
                        "displayText": "Frog",
                        "builtinType": null,
                        "resolution": null
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "822f037b-8c54-4b7f-a074-3ad1cfba5a62",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.0058062076568603515,
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
                    "entityId": "757d77de-e137-4347-8ad6-3a39bb9fd30d",
                    "startCharIndex": 8,
                    "endCharIndex": 10,
                    "entityText": "Tag"
                  },
                  {
                    "entityId": "757d77de-e137-4347-8ad6-3a39bb9fd30d",
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
                    "entityId": "757d77de-e137-4347-8ad6-3a39bb9fd30d",
                    "values": [
                      {
                        "userText": "Tag",
                        "displayText": "Tag",
                        "builtinType": null,
                        "resolution": null
                      },
                      {
                        "userText": "Frog",
                        "displayText": "Frog",
                        "builtinType": null,
                        "resolution": null
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "822f037b-8c54-4b7f-a074-3ad1cfba5a62",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.012478351593017578,
                  "contextDialogBlisTime": 0
                }
              }
            }
          ]
        }
      ],
      "initialFilledEntities": [],
      "createdDateTime": "2019-03-05T03:48:08.9561432+00:00",
      "lastModifiedDateTime": "2019-03-05T03:49:20+00:00"
    }
  ],
  "actions": [
    {
      "actionId": "9d54124c-8a4f-4b31-b8d8-b6c60a366ee5",
      "createdDateTime": "2019-03-05T03:46:43.8688957+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Hello\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": [],
      "requiredConditions": [],
      "negativeConditions": []
    },
    {
      "actionId": "822f037b-8c54-4b7f-a074-3ad1cfba5a62",
      "createdDateTime": "2019-03-05T03:46:50.9070221+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Hi\",\"marks\":[]}]}]}]}}}",
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
      "entityId": "757d77de-e137-4347-8ad6-3a39bb9fd30d",
      "createdDateTime": "2019-03-05T03:46:36.3827084+00:00",
      "entityName": "multi",
      "entityType": "LUIS",
      "isMultivalue": true,
      "isNegatible": false,
      "resolverType": "none"
    }
  ],
  "packageId": "34409548-69bc-4a39-b6eb-863c0a861b40"
}
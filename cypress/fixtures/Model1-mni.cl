{"trainDialogs":[{"trainDialogId":"4d02e9b3-f63f-42e4-af3e-d5c1d4479a45","rounds":[{"extractorStep":{"textVariations":[{"text":"Hello","labelEntities":[]}]},"scorerSteps":[{"input":{"filledEntities":[],"context":{},"maskedActions":[]},"labelAction":"3959904b-7905-49e1-8e6a-7fd24d710b30","metrics":{"predictMetrics":{"blisTime":0.005886077880859375,"contextDialogBlisTime":0}}}]},{"extractorStep":{"textVariations":[{"text":"David","labelEntities":[{"entityId":"251fa360-def4-4a89-aa79-eb487e432f29","startCharIndex":0,"endCharIndex":4,"entityText":"David"}]}]},"scorerSteps":[{"input":{"filledEntities":[{"entityId":"251fa360-def4-4a89-aa79-eb487e432f29","values":[{"userText":"David","displayText":"David","builtinType":null,"resolution":null}]}],"context":{},"maskedActions":[]},"labelAction":"2d846a6e-113e-4302-9877-d0e0a581672b","metrics":{"predictMetrics":{"blisTime":0.013062715530395508,"contextDialogBlisTime":0}}}]}],"initialFilledEntities":[],"createdDateTime":"2018-11-07T23:54:57.1680165+00:00","lastModifiedDateTime":"2018-11-07T23:57:18+00:00"},{"trainDialogId":"da633cee-f534-474c-83d7-71f2bb033069","rounds":[{"extractorStep":{"textVariations":[{"text":"My name is David.","labelEntities":[{"entityId":"251fa360-def4-4a89-aa79-eb487e432f29","startCharIndex":11,"endCharIndex":15,"entityText":"David"}]}]},"scorerSteps":[{"input":{"filledEntities":[{"entityId":"251fa360-def4-4a89-aa79-eb487e432f29","values":[{"userText":"David","displayText":"David","builtinType":null,"resolution":null}]}],"context":{},"maskedActions":[]},"labelAction":"2d846a6e-113e-4302-9877-d0e0a581672b","metrics":{"predictMetrics":{"blisTime":0.011634111404418945,"contextDialogBlisTime":0}}}]},{"extractorStep":{"textVariations":[{"text":"My name is Susan.","labelEntities":[{"entityId":"251fa360-def4-4a89-aa79-eb487e432f29","startCharIndex":11,"endCharIndex":15,"entityText":"Susan"}]}]},"scorerSteps":[{"input":{"filledEntities":[{"entityId":"251fa360-def4-4a89-aa79-eb487e432f29","values":[{"userText":"Susan","displayText":"Susan","builtinType":null,"resolution":null}]}],"context":{},"maskedActions":[]},"labelAction":"2d846a6e-113e-4302-9877-d0e0a581672b","metrics":{"predictMetrics":{"blisTime":0.0055484771728515625,"contextDialogBlisTime":0}}}]}],"initialFilledEntities":[],"createdDateTime":"2018-11-07T23:57:42.6574498+00:00","lastModifiedDateTime":"2018-11-07T23:58:21+00:00"}],"actions":[{"actionId":"3959904b-7905-49e1-8e6a-7fd24d710b30","createdDateTime":"2018-11-07T20:08:07.2572688+00:00","actionType":"TEXT","payload":"{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"What's your name?\",\"marks\":[]}]}]}]}}}","isTerminal":true,"requiredEntitiesFromPayload":[],"requiredEntities":[],"negativeEntities":["251fa360-def4-4a89-aa79-eb487e432f29"],"suggestedEntity":"251fa360-def4-4a89-aa79-eb487e432f29"},{"actionId":"2d846a6e-113e-4302-9877-d0e0a581672b","createdDateTime":"2018-11-07T20:08:14.675811+00:00","actionType":"TEXT","payload":"{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Hello \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"251fa360-def4-4a89-aa79-eb487e432f29\",\"name\":\"name\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$name\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]}]}]}}}","isTerminal":true,"requiredEntitiesFromPayload":["251fa360-def4-4a89-aa79-eb487e432f29"],"requiredEntities":["251fa360-def4-4a89-aa79-eb487e432f29"],"negativeEntities":[]}],"entities":[{"entityId":"251fa360-def4-4a89-aa79-eb487e432f29","createdDateTime":"2018-11-07T20:07:57.8521773+00:00","entityName":"name","entityType":"LUIS","isMultivalue":false,"isNegatible":false}],"packageId":"88873063-e29a-4603-8544-a0cdb4a013fd"}{
  "trainDialogs": [
    {
      "trainDialogId": "4d02e9b3-f63f-42e4-af3e-d5c1d4479a45",
      "rounds": [
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "Hello",
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
              "labelAction": "3959904b-7905-49e1-8e6a-7fd24d710b30",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.005886077880859375,
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
                "text": "David",
                "labelEntities": [
                  {
                    "entityId": "251fa360-def4-4a89-aa79-eb487e432f29",
                    "startCharIndex": 0,
                    "endCharIndex": 4,
                    "entityText": "David"
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
                    "entityId": "251fa360-def4-4a89-aa79-eb487e432f29",
                    "values": [
                      {
                        "userText": "David",
                        "displayText": "David",
                        "builtinType": null,
                        "resolution": null
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "2d846a6e-113e-4302-9877-d0e0a581672b",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.013062715530395507,
                  "contextDialogBlisTime": 0
                }
              }
            }
          ]
        }
      ],
      "initialFilledEntities": [],
      "createdDateTime": "2018-11-07T23:54:57.1680165+00:00",
      "lastModifiedDateTime": "2018-11-07T23:57:18+00:00"
    },
    {
      "trainDialogId": "da633cee-f534-474c-83d7-71f2bb033069",
      "rounds": [
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "My name is David.",
                "labelEntities": [
                  {
                    "entityId": "251fa360-def4-4a89-aa79-eb487e432f29",
                    "startCharIndex": 11,
                    "endCharIndex": 15,
                    "entityText": "David"
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
                    "entityId": "251fa360-def4-4a89-aa79-eb487e432f29",
                    "values": [
                      {
                        "userText": "David",
                        "displayText": "David",
                        "builtinType": null,
                        "resolution": null
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "2d846a6e-113e-4302-9877-d0e0a581672b",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.011634111404418945,
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
                "text": "My name is Susan.",
                "labelEntities": [
                  {
                    "entityId": "251fa360-def4-4a89-aa79-eb487e432f29",
                    "startCharIndex": 11,
                    "endCharIndex": 15,
                    "entityText": "Susan"
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
                    "entityId": "251fa360-def4-4a89-aa79-eb487e432f29",
                    "values": [
                      {
                        "userText": "Susan",
                        "displayText": "Susan",
                        "builtinType": null,
                        "resolution": null
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "2d846a6e-113e-4302-9877-d0e0a581672b",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.0055484771728515625,
                  "contextDialogBlisTime": 0
                }
              }
            }
          ]
        }
      ],
      "initialFilledEntities": [],
      "createdDateTime": "2018-11-07T23:57:42.6574498+00:00",
      "lastModifiedDateTime": "2018-11-07T23:58:21+00:00"
    }
  ],
  "actions": [
    {
      "actionId": "3959904b-7905-49e1-8e6a-7fd24d710b30",
      "createdDateTime": "2018-11-07T20:08:07.2572688+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"What's your name?\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": [
        "251fa360-def4-4a89-aa79-eb487e432f29"
      ],
      "suggestedEntity": "251fa360-def4-4a89-aa79-eb487e432f29"
    },
    {
      "actionId": "2d846a6e-113e-4302-9877-d0e0a581672b",
      "createdDateTime": "2018-11-07T20:08:14.675811+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Hello \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"251fa360-def4-4a89-aa79-eb487e432f29\",\"name\":\"name\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$name\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [
        "251fa360-def4-4a89-aa79-eb487e432f29"
      ],
      "requiredEntities": [
        "251fa360-def4-4a89-aa79-eb487e432f29"
      ],
      "negativeEntities": []
    }
  ],
  "entities": [
    {
      "entityId": "251fa360-def4-4a89-aa79-eb487e432f29",
      "createdDateTime": "2018-11-07T20:07:57.8521773+00:00",
      "entityName": "name",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false
    }
  ],
  "packageId": "88873063-e29a-4603-8544-a0cdb4a013fd"
}
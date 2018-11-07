{
  "trainDialogs": [
    {
      "trainDialogId": "9cdff738-c0b8-49e0-ab6c-59bf13cabf75",
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
              "labelAction": "f37e3c30-29e2-4575-bd3c-77c5943b2f29",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.012908458709716797,
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
                    "entityId": "449ece95-7e73-46ec-b8be-73bbc3296f13",
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
                    "entityId": "449ece95-7e73-46ec-b8be-73bbc3296f13",
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
              "labelAction": "40620c42-87a7-44c5-a81d-8b822302f069",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.007918119430541992,
                  "contextDialogBlisTime": 0
                }
              }
            }
          ]
        }
      ],
      "initialFilledEntities": [],
      "createdDateTime": "2018-11-07T18:45:44.0036755+00:00",
      "lastModifiedDateTime": "2018-11-07T18:46:02+00:00"
    }
  ],
  "actions": [
    {
      "actionId": "f37e3c30-29e2-4575-bd3c-77c5943b2f29",
      "createdDateTime": "2018-10-31T20:49:08.3405635+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"What's your name?\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": [
        "449ece95-7e73-46ec-b8be-73bbc3296f13"
      ],
      "suggestedEntity": "449ece95-7e73-46ec-b8be-73bbc3296f13"
    },
    {
      "actionId": "40620c42-87a7-44c5-a81d-8b822302f069",
      "createdDateTime": "2018-10-31T20:49:14.2989915+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Hello \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"449ece95-7e73-46ec-b8be-73bbc3296f13\",\"name\":\"name\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$name\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [
        "449ece95-7e73-46ec-b8be-73bbc3296f13"
      ],
      "requiredEntities": [
        "449ece95-7e73-46ec-b8be-73bbc3296f13"
      ],
      "negativeEntities": []
    }
  ],
  "entities": [
    {
      "entityId": "449ece95-7e73-46ec-b8be-73bbc3296f13",
      "createdDateTime": "2018-10-31T20:49:02.5881179+00:00",
      "entityName": "name",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false
    }
  ],
  "packageId": "7f96c89a-a517-417f-81fa-dd0e01c410f4"
}
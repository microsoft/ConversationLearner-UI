{
  "trainDialogs": [],
  "actions": [
    {
      "actionId": "4b790d93-867b-4c08-bf63-b9e1ab241e3f",
      "createdDateTime": "2018-11-07T20:06:30.6178719+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"What's your name?\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": [
        "404f9cd3-46ec-4924-9324-226db8823a9b"
      ],
      "suggestedEntity": "404f9cd3-46ec-4924-9324-226db8823a9b"
    },
    {
      "actionId": "b0aa963e-fcb6-438f-93d3-5e6ed233c43f",
      "createdDateTime": "2018-11-07T20:06:41.4086867+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Hey \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"404f9cd3-46ec-4924-9324-226db8823a9b\",\"name\":\"name\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$name\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [
        "404f9cd3-46ec-4924-9324-226db8823a9b"
      ],
      "requiredEntities": [
        "404f9cd3-46ec-4924-9324-226db8823a9b"
      ],
      "negativeEntities": [
        "f823b377-e2a3-4352-a9ce-ab0021e5e04f",
        "5848b1fb-c443-4b92-841d-ba96f0e8c7b3"
      ]
    },
    {
      "actionId": "3fcee609-770b-46af-b9d8-d938c3a0cc5d",
      "createdDateTime": "2018-11-07T20:06:55.0244956+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Hey \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"404f9cd3-46ec-4924-9324-226db8823a9b\",\"name\":\"name\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$name\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\", what do you really want?\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [
        "404f9cd3-46ec-4924-9324-226db8823a9b"
      ],
      "requiredEntities": [
        "404f9cd3-46ec-4924-9324-226db8823a9b"
      ],
      "negativeEntities": [
        "5848b1fb-c443-4b92-841d-ba96f0e8c7b3",
        "f823b377-e2a3-4352-a9ce-ab0021e5e04f"
      ],
      "suggestedEntity": "5848b1fb-c443-4b92-841d-ba96f0e8c7b3"
    },
    {
      "actionId": "f164a42c-6887-402e-9196-0af0028e5ac4",
      "createdDateTime": "2018-11-07T20:07:04.3397569+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Sorry \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"404f9cd3-46ec-4924-9324-226db8823a9b\",\"name\":\"name\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$name\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\", I can't help you get \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"5848b1fb-c443-4b92-841d-ba96f0e8c7b3\",\"name\":\"want\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$want\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [
        "404f9cd3-46ec-4924-9324-226db8823a9b",
        "5848b1fb-c443-4b92-841d-ba96f0e8c7b3"
      ],
      "requiredEntities": [
        "404f9cd3-46ec-4924-9324-226db8823a9b",
        "5848b1fb-c443-4b92-841d-ba96f0e8c7b3"
      ],
      "negativeEntities": []
    }
  ],
  "entities": [
    {
      "entityId": "404f9cd3-46ec-4924-9324-226db8823a9b",
      "createdDateTime": "2018-11-07T20:06:10.3446075+00:00",
      "entityName": "name",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false
    },
    {
      "entityId": "5848b1fb-c443-4b92-841d-ba96f0e8c7b3",
      "createdDateTime": "2018-11-07T20:06:15.3750535+00:00",
      "entityName": "want",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false
    },
    {
      "entityId": "f823b377-e2a3-4352-a9ce-ab0021e5e04f",
      "createdDateTime": "2018-11-07T20:06:20.6169416+00:00",
      "entityName": "sweets",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false
    }
  ],
  "packageId": "bedf0eab-4db3-42b4-9c79-0ebf0c9359d3"
}
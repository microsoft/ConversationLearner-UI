{x
  "trainDialogs": [],
  "actions": [
    {
      "actionId": "1f84dc3d-5d20-4f28-a575-acb8b74fbad8",
      "createdDateTime": "2018-11-01T22:15:58.7400723+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"What's your name?\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": [
        "0b127d90-ddd1-46f9-9e88-d7cb20af2cc9"
      ],
      "suggestedEntity": "0b127d90-ddd1-46f9-9e88-d7cb20af2cc9"
    },
    {
      "actionId": "6b6adbf5-2902-4cf7-a76c-cdc49008f8a1",
      "createdDateTime": "2018-11-01T22:16:05.9567215+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Hello \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"0b127d90-ddd1-46f9-9e88-d7cb20af2cc9\",\"name\":\"name\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$name\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [
        "0b127d90-ddd1-46f9-9e88-d7cb20af2cc9"
      ],
      "requiredEntities": [
        "0b127d90-ddd1-46f9-9e88-d7cb20af2cc9"
      ],
      "negativeEntities": []
    }
  ],
  "entities": [
    {
      "entityId": "0b127d90-ddd1-46f9-9e88-d7cb20af2cc9",
      "createdDateTime": "2018-11-01T22:15:50.3205345+00:00",
      "entityName": "name",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false
    }
  ],
  "packageId": "61afd077-43a5-49f3-a258-783a10a3ff68"
}
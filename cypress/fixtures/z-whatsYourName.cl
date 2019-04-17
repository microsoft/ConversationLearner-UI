{
  "trainDialogs": [],
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
  "packageId": "a1a4a5b5-df32-4e47-b310-373453efee00"
}
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import HtmlSerializer from './htmlSerializer'
import Plain from 'slate-plain-serializer'
import { Value } from 'slate'

/**
 * We can't compare the immutable values or SlateValues since they will always be different.
 * We use serialization for comparison which kind of tests both paths of code implicitly
 * Start from known point, Deserialize, do equivalent operation and both values, then serialize back and compare
 */
// TODO: For some reason deserialization works in browser but not here? Could be test environment issue but don't know why it would be different.
xdescribe('Slate - Html Serializer', () => {
    describe('deserialize', () => {
        test('should deserialize value from HTML the same as default JSON', () => {

            const testString = 'Suffix'
            const testData = {
                expectedHtml: `<p>${testString}This required <b data-id="1f99bb7a-41af-46bb-b2f0-9c5c23404266" data-name="myEntity">$myEntity</b> and <i>[optional <b data-id="7d27f6a3-566a-487f-9345-79ea1db62708" data-name="otherEntity">$otherEntity</b> ]</i> ending.</p>`,
                startHtml: '<p>This required <b data-id="1f99bb7a-41af-46bb-b2f0-9c5c23404266" data-name="myEntity">$myEntity</b> and <i>[optional <b data-id="7d27f6a3-566a-487f-9345-79ea1db62708" data-name="otherEntity">$otherEntity</b> ]</i> ending.</p>',
                json: { "kind": "value", "document": { "kind": "document", "data": {}, "nodes": [{ "kind": "block", "type": "line", "isVoid": false, "data": {}, "nodes": [{ "kind": "text", "leaves": [{ "kind": "leaf", "text": "This required ", "marks": [] }] }, { "kind": "inline", "type": "mention-inline-node", "isVoid": false, "data": { "completed": true, "option": { "id": "1f99bb7a-41af-46bb-b2f0-9c5c23404266", "name": "myEntity" } }, "nodes": [{ "kind": "text", "leaves": [{ "kind": "leaf", "text": "$myEntity", "marks": [] }] }] }, { "kind": "text", "leaves": [{ "kind": "leaf", "text": " and [optional ", "marks": [] }] }, { "kind": "inline", "type": "mention-inline-node", "isVoid": false, "data": { "completed": true, "option": { "id": "7d27f6a3-566a-487f-9345-79ea1db62708", "name": "otherEntity" } }, "nodes": [{ "kind": "text", "leaves": [{ "kind": "leaf", "text": "$otherEntity", "marks": [] }] }] }, { "kind": "text", "leaves": [{ "kind": "leaf", "text": " ] ending.", "marks": [] }] }] }] } }
            }

            // TODO: Deserialization doesn't work for some reason. Same exact html works from browser
            let slateValueFromHtml = HtmlSerializer.deserialize(testData.startHtml)
            let slateValueFromJson = Value.fromJSON(testData.json)

            // const editiedSlateValueFromHtml = slateValueFromHtml.change()
            //     .insertText(testData.text)
            //     .value

            const editiedSlateValueFromJson = slateValueFromJson.change()
                .insertText(testString)
                .value

            const stringFromHtml = Plain.serialize(slateValueFromHtml)
            const stringFromJson = Plain.serialize(editiedSlateValueFromJson)
            const stringFromHtml2 = HtmlSerializer.serialize(slateValueFromHtml)
            const stringFromJson2 = HtmlSerializer.serialize(editiedSlateValueFromJson)

            expect(stringFromJson2).toEqual(testData.expectedHtml)
            expect(stringFromHtml).toEqual(stringFromJson)
            expect(stringFromHtml2).toEqual(stringFromJson2)
        })
    })
})
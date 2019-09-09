import Html from 'slate-html-serializer'
import * as React from 'react'

type SlateValue = any

enum NODE_TYPES {
    OPTIONAL = 'optional-inline-node',
    REQUIRED = 'mention-inline-node'
}

const BLOCK_TAGS = {
    // Note: Think 'line' is required from other serializer that produces line types.
    p: 'line'
}

const INLINES_TAGS = {
    i: NODE_TYPES.OPTIONAL,
    b: NODE_TYPES.REQUIRED,
}

/**
 * Deserialize: HTML(string) -> SlateValue (block, inline, text, marks, etc...)
 * Serialize: SlateValue -> HTML (string)
 *
 * Display: 'This required $myEntity and [optional $otherEntity ] ending.'
 * HTML:
 * <p>This required <b data-id="1f99bb7a-41af-46bb-b2f0-9c5c23404266" data-name="myEntity">$myEntity</b> and <i>[optional <b data-id="7d27f6a3-566a-487f-9345-79ea1db62708" data-name="otherEntity">$otherEntity</b> ]</i> ending.</p>
 *
 * See: https://docs.slatejs.org/walkthroughs/saving-and-loading-html-content
 */
const rules: any[] = [
    {
        deserialize(el: any, next: any): object | void {
            const type = BLOCK_TAGS[el.tagName.toLowerCase()]
            if (type) {
                return {
                    object: 'block',
                    kind: 'block',
                    type: BLOCK_TAGS.p,
                    data: {},
                    nodes: next(el.childNodes),
                }
            }
        },
        serialize(obj: SlateValue, children: any): object | void {
            switch (obj.type) {
                case BLOCK_TAGS.p:
                    return <p>{children}</p>
            }
        },
    },
    {
        deserialize(el: any, next: any): object | void {
            const type = INLINES_TAGS[el.tagName.toLowerCase()]
            if (type == NODE_TYPES.REQUIRED) {
                return {
                    object: 'inline',
                    kind: 'inline',
                    type,
                    data: {
                        completed: true,
                        option: {
                            id: el.getAttribute('data-id'),
                            name: el.getAttribute('data-name'),
                        }
                    },
                    nodes: next(el.childNodes),
                }
            }
            else if (type == NODE_TYPES.OPTIONAL) {
                return {
                    object: 'inline',
                    kind: 'inline',
                    type,
                    data: {},
                    nodes: next(el.childNodes),
                }
            }
        },
        serialize(obj: SlateValue, children: any): object | void {
            switch (obj.type) {
                case NODE_TYPES.OPTIONAL:
                    return <i>{children}</i>
                case NODE_TYPES.REQUIRED: {
                    const option = obj.data.get('option')
                    const { id, name } = option
                    return <b data-id={id} data-name={name}>{children}</b>
                }
            }
        },
    },
]

// Create a new serializer instance with our `rules` from above.
const html = new Html({ rules })

export default html
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import * as OF from 'office-ui-fabric-react';
import { FormattedMessage } from 'react-intl'
import { FM } from '../react-intl-messages'
import { MemoryValue } from 'conversationlearner-models'
import HelpLink from '../components/HelpLink'
import './ToolTips.css'

export enum TipType {
    ACTION_API = 'actionAPI',
    ACTION_ARGUMENTS = 'actionArguments',
    ACTION_CARD = 'actionCard',
    ACTION_ENTITIES = 'actionEntities',
    ACTION_NEGATIVE = 'negativeEntities',
    ACTION_REQUIRED = 'requiredEntities',
    ACTION_RESPONSE = 'actionResponse',
    ACTION_RESPONSE_TEXT = 'actionResponseText',
    ACTION_SCORE = 'actionScore',
    ACTION_SUGGESTED = 'suggestedEntity',
    ACTION_TYPE = 'actionType',
    ACTION_WAIT = 'isTerminal',

    ENTITY_ACTION_REQUIRED = 'entityActionRequired',
    ENTITY_ACTION_DISQUALIFIED = 'entityActionDisqualified',
    ENTITY_EXTRACTOR_HELP = 'entityExtractorHelp',
    ENTITY_EXTRACTOR_WARNING = 'extractorWarning',
    ENTITY_MULTIVALUE = 'isBucketable',
    ENTITY_NAME = 'entityName',
    ENTITY_NEGATABLE = 'isNegatable',
    ENTITY_PROGAMMATIC = 'isProgrammatic',
    ENTITY_TYPE = 'entityType',
    ENTITY_VALUE = 'entityValues',

    LOGGING_TOGGLE = 'loggingToggle',
    LUIS_AUTHORING_KEY = 'luisAuthoringKey',
    LUIS_SUBSCRIPTION_KEY = 'luisSubscriptionKey',

    MEMORY_MANAGER = 'memoryManager',

    PACKAGECREATOR_LIVE_TOGGLE = 'packageCreatorLiveToggle',

    TAG_EDITING = 'tagEditing',
    TAG_LIVE = 'tagLIve'
}

export function onRenderDetailsHeader(detailsHeaderProps: OF.IDetailsHeaderProps, defaultRender: OF.IRenderFunction<OF.IDetailsHeaderProps>) {
    return (
        <div>
            {
                defaultRender({
                    ...detailsHeaderProps,
                    onRenderColumnHeaderTooltip: (tooltipHostProps: OF.ITooltipHostProps) => {
                        let id = tooltipHostProps.id.split('-')[1];
                        let tip = GetTip(id);
                        if (tip) {
                            let ttHP = { ...tooltipHostProps };
                            ttHP.tooltipProps = {
                                onRenderContent: () => { return tip },
                                delay: OF.TooltipDelay.medium,
                                directionalHint: OF.DirectionalHint.topCenter
                            };
                            return <OF.TooltipHost {...ttHP} />
                        } else {
                            return null;
                        }
                    }
                }
                )
            }
        </div>
    )
}

export function onRenderPivotItem(link: OF.IPivotItemProps, defaultRenderer: (link: OF.IPivotItemProps) => JSX.Element): JSX.Element {
    return (
        <OF.TooltipHost
            tooltipProps={{ onRenderContent: () => { return GetTip(link.ariaLabel) } }}
            delay={OF.TooltipDelay.medium}
            directionalHint={OF.DirectionalHint.bottomCenter}
        >
            {defaultRenderer(link)}
        </OF.TooltipHost>
    );
}

export function Wrap(content: JSX.Element, tooltip: string, directionalHint: OF.DirectionalHint = OF.DirectionalHint.topCenter): JSX.Element {
    return (
        <OF.TooltipHost
            tooltipProps={{ onRenderContent: () => { return GetTip(tooltip) } }}
            delay={OF.TooltipDelay.medium}
            directionalHint={directionalHint}
        >
            {content}
        </OF.TooltipHost>
    );
}

let apiCodeSample =
    `CL.AddAPICallback("Multiply", async (memoryManager: ClientMemoryManager, num1string: string, num2string: string) => {

        // convert base and exponent to ints
        var num1int = parseInt(num1string);
        var num2int = parseInt(num2string);
    
        // compute product
        var result = num1int * num2int;
    
        // return result as message
        return num1int.toString() + " * " + num2int.toString() + " = " + result.toString();
    })`;

let memoryManagerSample =
`    // Values in bot memory
    async EntityValueAsync(entityName: string): Promise<string>
    async EntityValueAsPrebuiltAsync(entityName: string): Promise<MemoryValue[]>
    async EntityValueAsListAsync(entityName: string): Promise<string[]>
    async EntityValueAsObjectAsync<T>(entityName: string): Promise<T | null>
    async EntityValueAsBooleanAsync(entityName: string): Promise<boolean | null>
    async EntityValueAsNumberAsync(entityName: string): Promise<boolean | null>

    // Values in memory before new Entity detection
    PrevEntityValue(entityName: string): (string | null)
    PrevEntityValueAsPrebuilt(entityName: string): MemoryValue[]
    PrevEntityValueAsList(entityName: string): string[]
    PrevEntityValueAsObject<T>(entityName: string): (T | null)
    PrevValueAsBoolean(entityName: string): boolean | null
    PrevValueAsNumber(entityName: string): boolean | null

    // Memory manipulation methods
    async RememberEntityAsync(entityName: string, entityValue: string): Promise<void>
    async RememberEntitiesAsync(entityName: string, entityValues: string[]): Promise<void>
    async ForgetEntityAsync(entityName: string, value?: string): Promise<void>
    async ForgetAllEntitiesAsync(saveEntityNames: string[]): Promise<void>
    
    async CopyEntityAsync(entityNameFrom: string, entityNameTo: string): Promise<void>

    async GetFilledEntitiesAsync(): Promise<FilledEntity[]>;
`;

export function GetTip(tipType: string) {
    switch (tipType) {
        case TipType.ACTION_API:
            return (
                <div>
                    {render(FM.TOOLTIP_ACTION_API_TITLE, [FM.TOOLTIP_ACTION_API])}
                    <div><br />cl.APICallback("<i>[API NAME]</i>", async (memoryManager, argArray) => <i>[API BODY]</i>)</div>
                    <div className="cl-tooltop-example"><FormattedMessage id={FM.TOOLTIP_EXAMPLE} /></div>
                    <pre>{apiCodeSample}</pre>
                    <div className="cl-tooltop-example"><FormattedMessage id={FM.TOOLTIP_ACTION_ARGUMENTS_TITLE} /></div>
                    <div>$number1 $number2<br /></div>
                    <div><br />More about the <HelpLink label="Memory Manager" tipType={TipType.MEMORY_MANAGER} /></div>
                </div>
            )
        case TipType.ACTION_ARGUMENTS:
            return render(FM.TOOLTIP_ACTION_ARGUMENTS_TITLE, [FM.TOOLTIP_ACTION_ARGUMENTS])
        case TipType.ACTION_CARD:
            return render(FM.TOOLTIP_ACTION_CARD_TITLE, [FM.TOOLTIP_ACTION_CARD])
        case TipType.ACTION_ENTITIES:
            return (
                <div>
                    <FormattedMessage id={FM.TOOLTIP_ACTION_ENTITIES} defaultMessage="Response" />
                    <dl className="cl-tooltip-example">
                        <dt><span className="cl-entity cl-entity--match">Required</span></dt>
                        <dd><FormattedMessage id={FM.TOOLTIP_ACTION_ENTITIES_REQ} /></dd>
                        <dt><span className="cl-entity cl-entity--match"><del>Disqualifying</del></span></dt>
                        <dd><FormattedMessage id={FM.TOOLTIP_ACTION_ENTITIES_DISQUAL_NOT} /></dd>
                        <dt><span className="cl-entity cl-entity--mismatch">Required</span></dt>
                        <dd><FormattedMessage id={FM.TOOLTIP_ACTION_ENTITIES_REQ_NOT} /></dd>
                        <dt><span className="cl-entity cl-entity--mismatch"><del>Disqualifying</del></span></dt>
                        <dd><FormattedMessage id={FM.TOOLTIP_ACTION_ENTITIES_DISQUAL} /></dd>
                    </dl>
                </div>
            )
        case TipType.ACTION_NEGATIVE:
            return render(
                FM.TOOLTIP_ACTION_DISQUAL_TITLE,
                [FM.TOOLTIP_ACTION_DISQUAL],
                FM.TOOLTIP_EXAMPLE,
                [
                    { key: 'Response:', value: FM.TOOLTIP_ACTION_DISQUAL_ROW1 },
                    { key: 'Disqualifying:', value: FM.TOOLTIP_ACTION_DISQUAL_ROW2 },
                    { key: '--', value: null },
                    { key: 'Response:', value: FM.TOOLTIP_ACTION_DISQUAL_ROW3 },
                    { key: 'Disqualifying:', value: FM.TOOLTIP_ACTION_DISQUAL_ROW4 }
                ]);
        case TipType.ACTION_REQUIRED:
            return render(
                FM.TOOLTIP_ACTION_REQUIRED_TITLE,
                [FM.TOOLTIP_ACTION_REQUIRED],
                FM.TOOLTIP_EXAMPLE,
                [
                    { key: 'Response:', value: FM.TOOLTIP_ACTION_REQUIRED_ROW1 },
                    { key: 'Required:', value: FM.TOOLTIP_ACTION_REQUIRED_ROW2 },
                    { key: '--', value: null },
                    { key: 'Response:', value: FM.TOOLTIP_ACTION_REQUIRED_ROW3 },
                    { key: 'Required:', value: FM.TOOLTIP_ACTION_REQUIRED_ROW4 }
                ]);
        case TipType.ACTION_RESPONSE:
            return (<FormattedMessage id={FM.TOOLTIP_ACTION_RESPONSE} defaultMessage="Response" />)
        case TipType.ACTION_RESPONSE_TEXT:
            return render(
                FM.TOOLTIP_ACTION_RESPONSE_TEXT_TITLE,
                [FM.TOOLTIP_ACTION_RESPONSE_TEXT1, FM.TOOLTIP_ACTION_RESPONSE_TEXT2, FM.TOOLTIP_ACTION_RESPONSE_TEXT3],
                FM.TOOLTIP_EXAMPLE,
                [
                    { key: 'Response:', value: FM.TOOLTIP_ACTION_RESPONSE_ROW1 },
                    { key: '--', value: null },
                    { key: 'Response:', value: FM.TOOLTIP_ACTION_RESPONSE_ROW2 },
                    { key: '--', value: null },
                    { key: 'Response:', value: FM.TOOLTIP_ACTION_RESPONSE_ROW3 }
                ]);
        case TipType.ACTION_SCORE:
            return (
                <div>
                    <FormattedMessage id={FM.TOOLTIP_ACTION_SCORE} defaultMessage="Response" />
                    <dl className="cl-tooltip-example">
                        <dt>%:</dt><dd><FormattedMessage id={FM.TOOLTIP_ACTION_SCORE_PERCENT} /></dd>
                        <dt>Training:</dt><dd><FormattedMessage id={FM.TOOLTIP_ACTION_SCORE_TRAINING} /></dd>
                        <dt>Disqualified:</dt><dd><FormattedMessage id={FM.TOOLTIP_ACTION_SCORE_DISQUALIFIED} /></dd>
                    </dl>
                </div>
            )
        case TipType.ACTION_SUGGESTED:
            return render(
                FM.TOOLTIP_ACTION_SUGGESTED_TITLE,
                [FM.TOOLTIP_ACTION_SUGGESTED],
                FM.TOOLTIP_EXAMPLE,
                [
                    { key: 'Response:', value: FM.TOOLTIP_ACTION_SUGGESTED_ROW1 },
                    { key: 'Expected:', value: FM.TOOLTIP_ACTION_SUGGESTED_ROW2 }
                ]);
        case TipType.ACTION_TYPE:
            return render(
                FM.TOOLTIP_ACTION_TYPE_TITLE,
                [FM.TOOLTIP_ACTION_TYPE],
                null,
                [
                    { key: 'Text:', value: FM.TOOLTIP_ACTION_TYPE_TEXT },
                    { key: 'API_Local:', value: FM.TOOLTIP_ACTION_TYPE_APILOCAL },
                    // { key: 'API_Azure:', value: FM.TOOLTIP_ACTION_TYPE_APIAZURE },
                    { key: 'Card:', value: FM.TOOLTIP_ACTION_TYPE_CARD }
                ]);
        case TipType.ACTION_WAIT:
            return render(FM.TOOLTIP_ACTION_WAIT_TITLE, [FM.TOOLTIP_ACTION_WAIT]);
        case TipType.ENTITY_NAME:
            return (<FormattedMessage id={FM.TOOLTIP_ENTITY_NAME} defaultMessage="Wait" />);
        case TipType.ENTITY_ACTION_DISQUALIFIED:
            return (<FormattedMessage id={FM.TOOLTIP_ENTITY_ACTION_DISQUALIFIED} defaultMessage="Disqualified Actions" />)
        case TipType.ENTITY_ACTION_REQUIRED:
            return (<FormattedMessage id={FM.TOOLTIP_ENTITY_ACTION_REQUIRED} defaultMessage="Required For Actions" />)
        case TipType.ENTITY_EXTRACTOR_WARNING:
            return (<FormattedMessage id={FM.TOOLTIP_ENTITY_EXTRACTOR_WARNING} defaultMessage="Text Variations must contain the same detected Entities and the primary input text." />)
        case TipType.ENTITY_VALUE:
            return (<FormattedMessage id={FM.TOOLTIP_ENTITY_VALUE} defaultMessage="Wait" />);
        case TipType.ENTITY_MULTIVALUE:
            return (
                <div>
                    When checked additional occurences of the Entity add to list of previous values. For non multi-value entites new values replace previous values.<br /><br />
                    <b>Example: Multiple toppings on a pizza</b>
                    <dl className="cl-tooltip-example">
                        <dt>Entity:</dt><dd>toppings</dd>
                        <dt>Phrase:</dt><dd>I would like <i>cheese</i> and <i>pepperoni</i>.</dd>
                        <dt>Memory:</dt><dd>cheese, pepperoni</dd>
                    </dl>
                </div>
            )
        case TipType.ENTITY_NEGATABLE:
            return (
                <div>
                    When checked this creates a corresponding 'negatable' entity that can be used to remove or delete previous memory values.<br /><br />
                    <b>Example: Changing existing pizza order</b>
                    <dl className="cl-tooltip-example">
                        <dt>Entity:</dt><dd>toppings</dd>
                        <dt>Memory:</dt><dd>cheese, pepperoni</dd>
                        <dt>Phrase:</dt><dd>Actually, please add <i>sausage</i> instead of <i>pepperoni</i>.</dd>
                        <dt>Memory:</dt><dd>cheese, <del>pepperoni</del> sausage</dd>
                    </dl>
                </div>
            )
        case TipType.ENTITY_PROGAMMATIC:
            return (
                <div>
                    When checked Entities are not extracted from user utterances.  They are set in code you write for your Bot<br /><br />
                    <b>Example: Restrict Actions for authorized users</b>
                    <dl className="cl-tooltip-example">
                        <dt>Entity:</dt><dd>isLoggedIn</dd>
                    </dl>
                    The "isLoggedIn" Entity is set in code. When not set, it can be used to disqualify Actions that require authorized users
                </div>
            )
        case TipType.ENTITY_TYPE:
            return (<FormattedMessage id={FM.TOOLTIP_ENTITY_TYPE} defaultMessage="Wait" />)
        case TipType.MEMORY_MANAGER:
            return (
                <div>
                    {render(FM.TOOLTIP_MEMORYMANAGER_TITLE, [FM.TOOLTIP_MEMORYMANAGER])}
                    <pre>{memoryManagerSample}</pre>
                </div>
            )
        case TipType.ENTITY_EXTRACTOR_HELP:
            return (
                <div>
                    <h2>Label Text as Entity</h2>
                    <ol>
                        <li>Select text</li>
                        <li>Pick entity from menu</li>
                    </ol>

                    <img src="/entity-extractor-label.gif" width="560px" height="368px" />

                    <h2>Remove Label</h2>
                    <ol>
                        <li>Click on green highlighted text</li>
                        <li>Click on red 'X'</li>
                    </ol>

                    <img src="/entity-extractor-remove-label.gif" width="518px" height="184px" />

                    <h2>Notes:</h2>
                    <ul>
                        <li>Pre-Built entities in blue are not editable</li>
                    </ul>
                </div>
            )
        case TipType.LOGGING_TOGGLE:
            return (<FormattedMessage id={FM.TOOLTIP_LOGGING_TOGGLE} defaultMessage="Logging Enable/Disable" />);
        case TipType.LUIS_AUTHORING_KEY:
        case TipType.LUIS_SUBSCRIPTION_KEY:
            return (
                <div>
                    <h1>LUIS Keys:</h1>
                    <p>There are two different keys for LUIS. The authoring key and the subscription key.</p>
                    
                    <h2>Find your LUIS Authoring Key:</h2>
                    <ol>
                        <li>Go to <a href="https://luis.ai" target="_blank">https://luis.ai</a></li>
                        <li>Sign in if you are not already</li>
                        <li>Click on your name in the top-right corner to open the dropdown menu</li>
                        <li>Select 'settings' from the menu</li>
                        <li>Copy the "Authoring Key"</li>
                    </ol>

                    <img src="https://media.giphy.com/media/vvy3OmwK356vRuPyLa/giphy.gif" />

                    <h2>Find your LUIS Subscription key:</h2>
                    <ol>
                        <li>Go to <a href="http://portal.azure.com" target="_blank">http://portal.azure.com</a></li>
                        <li>Sign in if you are not already</li>
                        <li>Open the Cognitive Services blade</li>
                        <li>Open or create your instance of Language Understanding (LUIS) service</li>
                        <li>Select 'Keys' blade under 'Resource Managment' section</li>
                        <li>Copy the "Key 1" value</li>
                    </ol>

                    <img src="https://media.giphy.com/media/1yTgrvilEWUSB8TkJl/giphy.gif" />

                    <h3>Why does Conversation Learner need my authoring key?</h3>
                    <p>The authoring key is used to access the LUIS authoring APIs and is used by Conversation Learner to manage your LUIS account on your behalf.  As you make changes to your Conversation Learner app such as adding entities and labeling entities during training the Conversation Learner service creates the associated LUIS apps with matching entities and utterance phrases.</p>

                    <h3>What does Conversation Learner need my subscription key?</h3>
                    <p>The subscription key is used to access the LUIS endpoint APIs and is used by Conversation Learner to get predictions from LUIS.  By using the subscription key when possible it avoids using up the quota for your Authoring key which would block further usage of Conversation Learner.</p>
                    <p>When ready to publish your bot you can increase the pricing teir of your subscription key to 50 calls per second instead of 5</p>

                    <p>See official docs on <a href="https://docs.microsoft.com/en-us/azure/cognitive-services/luis/home#accessing-luis" target="_blank">Accessing LUIS</a></p>
                </div>
            )
        case TipType.PACKAGECREATOR_LIVE_TOGGLE:
            return (<FormattedMessage id={FM.TOOLTIP_PACKAGECREATOR_LIVE_TOGGLE} defaultMessage="Make new Tag the live version" />);

        case TipType.TAG_EDITING:
            return (<FormattedMessage id={FM.TOOLTIP_TAG_EDITING} defaultMessage="Tag editing in the UI" />);

        case TipType.TAG_LIVE:
            return (<FormattedMessage id={FM.TOOLTIP_TAG_LIVE} defaultMessage="Tag Version that is Live" />);

        default:
            return (<div>{tipType}</div>);
    }
}

function render(title: FM, body: FM[], example: string = null, tableItems: { key: string, value: FM }[] = []): JSX.Element {
    let key = 0;
    return (
        <div>
            <div className="cl-tooltop-headerText"><FormattedMessage id={title} /></div>
            {body.map(b => { return (<div key={key++}><FormattedMessage id={b} /><br /></div>) })}
            {example &&
                <div className="cl-tooltop-example"><FormattedMessage id={example} /></div>}
            {tableItems.length > 0 ?
                (
                    <dl className="cl-tooltip-example">
                        <dt>{tableItems[0] && tableItems[0].key}</dt><dd>{tableItems[0] && tableItems[0].value && <FormattedMessage id={tableItems[0].value} />}</dd>
                        <dt>{tableItems[1] && tableItems[1].key}</dt><dd>{tableItems[1] && tableItems[1].value && <FormattedMessage id={tableItems[1].value} />}</dd>
                        <dt>{tableItems[2] && tableItems[2].key}</dt><dd>{tableItems[2] && tableItems[2].value && <FormattedMessage id={tableItems[2].value} />}</dd>
                        <dt>{tableItems[3] && tableItems[3].key}</dt><dd>{tableItems[3] && tableItems[3].value && <FormattedMessage id={tableItems[3].value} />}</dd>
                        <dt>{tableItems[4] && tableItems[4].key}</dt><dd>{tableItems[4] && tableItems[4].value && <FormattedMessage id={tableItems[4].value} />}</dd>
                    </dl>
                ) : null
            }
        </div>
    );
}

export function Prebuilt(memoryValue: MemoryValue, content: JSX.Element): JSX.Element {
    if (!memoryValue.builtinType && !memoryValue.resolution) {
        return content;
    }
    return (
        <span>
            <OF.TooltipHost
                tooltipProps={{
                    onRenderContent: () =>
                        <span>
                            <b>{memoryValue.builtinType}</b><br />
                            {memoryValue.resolution && <pre>{JSON.stringify(memoryValue.resolution, null, 2)}</pre>}
                        </span>
                }}
                calloutProps={{ gapSpace: 0 }}
            >
                {content}
            </OF.TooltipHost>
        </span>
    )
}

export function EntityObject(object: Object, content: JSX.Element): JSX.Element {
    return (
        <span>
            <OF.TooltipHost
                tooltipProps={{
                    onRenderContent: () =>
                        <span>
                            {object && <pre>{JSON.stringify(object, null, 2)}</pre>}
                        </span>
                }}
                calloutProps={{ gapSpace: 0 }}
            >
                {content}
            </OF.TooltipHost>
        </span>
    )
}

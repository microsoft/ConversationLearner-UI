/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import * as OF from 'office-ui-fabric-react';
import FormattedMessageId from '../FormattedMessageId'
import { FM } from '../../react-intl-messages'
import { MemoryValue } from '@conversationlearner/models'
import HelpLink from '../HelpLink'
import './ToolTips.css'
import { renderAPIPage1, renderAPIPage2, renderAPIPage3 } from './ToolTipAPI';

export enum TipType {
    NONE = 'NONE',

    ACTION_API1 = 'actionAPI1',
    ACTION_API2 = 'actionAPI2',
    ACTION_API3 = 'actionAPI3',
    ACTION_RENDER = 'actionRender',
    ACTION_ARGUMENTS = 'actionArguments',
    ACTION_CARD = 'actionCard',
    ACTION_END_SESSION = 'actionEndSesion',
    ACTION_ENTITIES = 'actionEntities',
    ACTION_NEGATIVE = 'negativeEntities',
    ACTION_REQUIRED = 'requiredEntities',
    ACTION_RESPONSE = 'actionResponse',
    ACTION_RESPONSE_TEXT = 'actionResponseText',
    ACTION_SCORE = 'actionScore',
    ACTION_SUGGESTED = 'suggestedEntity',
    ACTION_TYPE = 'actionType',
    ACTION_WAIT = 'isTerminal',

    EDITDIALOGMODAL_UNKNOWN_NEED_REPLAY = "EDITDIALOGMODAL_UNKNOWN_NEED_REPLAY",
    EDITDIALOGMODAL_WARNING_NEED_REPLAY = "EDITDIALOGMODAL_WARNING_NEED_REPLAY",

    ENTITY_ACTION_REQUIRED = 'entityActionRequired',
    ENTITY_ACTION_DISQUALIFIED = 'entityActionDisqualified',
    ENTITY_EXTRACTOR_HELP = 'entityExtractorHelp',
    ENTITY_EXTRACTOR_TEXTVARIATION = 'entityExtractorTextVariation',
    ENTITY_EXTRACTOR_WARNING = 'extractorWarning',
    ENTITY_MULTIVALUE = 'isBucketable',
    ENTITY_NAME = 'entityName',
    ENTITY_NEGATABLE = 'isNegatable',
    ENTITY_PROGAMMATIC = 'isProgrammatic',
    ENTITY_TYPE = 'entityType',
    ENTITY_VALUE = 'entityValues',
    ENTITY_RESOLVER = 'entityResolver',

    INVALID_BOT = 'INVALID_BOT',
    LOGGING_TOGGLE = 'loggingToggle',
    LUIS_AUTHORING_KEY = 'luisAuthoringKey',
    LUIS_OVERVIEW = 'luisOverview',
    LUIS_SUBSCRIPTION_KEY = 'luisSubscriptionKey',

    MEMORY_CONVERTER = 'memoryConverter',
    MEMORY_MANAGER = 'memoryManager',

    PACKAGECREATOR_LIVE_TOGGLE = 'packageCreatorLiveToggle',

    REPLAYERROR_DESC_ACTION_AFTER_WAIT = "REPLAYERROR_DESC_ACTION_AFTER_WAIT",
    REPLAYERROR_DESC_TWO_USER_INPUTS = "REPLAYERROR_DESC_TWO_USER_INPUTS",
    REPLAYERROR_DESC_INPUT_AFTER_NONWAIT = "REPLAYERROR_DESC_INPUT_AFTER_NONWAIT",
    REPLAYERROR_DESC_ACTION_UNAVAILABLE = "REPLAYERROR_DESC_ACTION_UNAVAILABLE",
    REPLAYERROR_DESC_ENTITY_UNDEFINED = "REPLAYERROR_DESC_ENTITY_UNDEFINED",
    REPLAYERROR_DESC_ENTITY_EMPTY = "REPLAYERROR_DESC_ENTITY_EMPTY",
    REPLAYERROR_DESC_ENTITY_UNEXPECTED_MULTIVALUE = "REPLAYERROR_DESC_ENTITY_UNEXPECTED_MULTIVALUE",
    REPLAYERROR_DESC_ACTION_UNDEFINED = "REPLAYERROR_DESC_ACTION_UNDEFINED",

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

                        let id = tooltipHostProps.id ? tooltipHostProps.id.split('-')[1] : 'unknown-tip-id'
                        let tip = getTip(id);
                        if (tip) {
                            let ttHP = {
                                ...tooltipHostProps,
                                directionalHint: OF.DirectionalHint.topLeftEdge
                            };
                            ttHP.tooltipProps = {
                                onRenderContent: () => { return tip },
                                delay: OF.TooltipDelay.medium,
                                directionalHint: OF.DirectionalHint.topLeftEdge
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
    const typType = link.ariaLabel ? link.ariaLabel : 'unknown-tip-type'
    return (
        <OF.TooltipHost
            tooltipProps={{ onRenderContent: () => { return getTip(typType) } }}
            delay={OF.TooltipDelay.medium}
            directionalHint={OF.DirectionalHint.bottomCenter}
        >
            {defaultRenderer(link)}
        </OF.TooltipHost>
    )
}

export function wrap(content: JSX.Element, tooltip: string, directionalHint: OF.DirectionalHint = OF.DirectionalHint.topCenter): JSX.Element {
    return (
        <OF.TooltipHost
            tooltipProps={{ onRenderContent: () => { return getTip(tooltip) } }}
            delay={OF.TooltipDelay.medium}
            directionalHint={directionalHint}
        >
            {content}
        </OF.TooltipHost>
    );
}

const renderCodeSample =
    `CL.AddRenderCallback("Multiply", async (memoryManager: ReadOnlyClientMemoryManager, num1string: string, num2string: string, result: string) => {

        // convert base and exponent to ints
        var num1int = parseInt(num1string);
        var num2int = parseInt(num2string);
    
        // compute product
        var result = num1int * num2int;
    
        // save result in entity
        return \`\${num1String} + \${num2string} = \${result}\`
    })`

let memoryConverterSample =
    `
    AS_VALUE_LIST       returns MemoryValue[]
    AS_STRING           returns string
    AS_STRING_LIST      returns string[] 
    AS_NUMBER           returns number 
    AS_NUMBER_LIST      returns  number[]
    AS_BOOLEAN          returns boolean
    AS_BOOLEAN_LIST     returns boolean[]`

let memoryManagerSample =
    `
    // GET - Values currently in bot memory
    memoryManager.Get(entityName: string, converter: (memoryValues: MemoryValue[])
    i.e. memoryManager.Get("counters", ClientMemoryManager.AS_NUMBER_LIST)

    // GET - Values in memory before new Entity detection
    memoryManager.GetPrevious(entityName: string, converter: (memoryValues: MemoryValue[])
    i.e. memoryManager.GetPrevious("location", ClientMemoryManager.AS_VALUE)

    // SET
    memoryManager.Set(entityName: string, true)
    i.e. memoryManager.Set("toppings", ["cheese", "peppers"])
   
    // DELETE
    memoryManager.Delete(entityName: string, value?: string): void
    memoryManager.DeleteAll(saveEntityNames: string[]): void

    // COPY
    memoryManager.Copy(entityNameFrom: string, entityNameTo: string): void

    // Info about the current running Session
    memoryManager.SessionInfo(): SessionInfo`;

export function getTip(tipType: string) {
    switch (tipType) {
        case TipType.ACTION_API1:
            return renderAPIPage1()
        case TipType.ACTION_API2:
            return renderAPIPage2()
        case TipType.ACTION_API3:
            return renderAPIPage3()
        case TipType.ACTION_RENDER:
            return (
                <div>
                    {render(FM.TOOLTIP_ACTION_RENDER_TITLE, [FM.TOOLTIP_ACTION_RENDER])}
                    <div><br />cl.AddRenderCallback("<i>[Render name]</i>", async (memoryManager, argArray) => <i>[Render body]</i>)</div>
                    <div className="cl-tooltop-example"><FormattedMessageId id={FM.TOOLTIP_EXAMPLE} /></div>
                    <pre>{renderCodeSample}</pre>
                    <div className="cl-tooltop-example"><FormattedMessageId id={FM.TOOLTIP_ACTION_ARGUMENTS_TITLE} /></div>
                    <div>$number1 $number2<br /></div>
                    <div><br />More about the <HelpLink label="Memory Manager" tipType={TipType.MEMORY_MANAGER} /></div>
                </div>
            )
        case TipType.ACTION_ARGUMENTS:
            return render(FM.TOOLTIP_ACTION_ARGUMENTS_TITLE, [FM.TOOLTIP_ACTION_ARGUMENTS])
        case TipType.ACTION_CARD:
            return render(FM.TOOLTIP_ACTION_CARD_TITLE, [FM.TOOLTIP_ACTION_CARD])
        case TipType.ACTION_END_SESSION:
            return render(FM.TOOLTIP_ACTION_END_SESSION_TITLE, [FM.TOOLTIP_ACTION_END_SESSION])
        case TipType.ACTION_ENTITIES:
            return (
                <div>
                    <FormattedMessageId id={FM.TOOLTIP_ACTION_ENTITIES} />
                    <dl className="cl-tooltip-example">
                        <dt><span className="cl-entity cl-entity--match">Required</span></dt>
                        <dd><FormattedMessageId id={FM.TOOLTIP_ACTION_ENTITIES_REQ} /></dd>
                        <dt><span className="cl-entity cl-entity--match"><del>Disqualifying</del></span></dt>
                        <dd><FormattedMessageId id={FM.TOOLTIP_ACTION_ENTITIES_DISQUAL_NOT} /></dd>
                        <dt><span className="cl-entity cl-entity--mismatch">Required</span></dt>
                        <dd><FormattedMessageId id={FM.TOOLTIP_ACTION_ENTITIES_REQ_NOT} /></dd>
                        <dt><span className="cl-entity cl-entity--mismatch"><del>Disqualifying</del></span></dt>
                        <dd><FormattedMessageId id={FM.TOOLTIP_ACTION_ENTITIES_DISQUAL} /></dd>
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
            return (<FormattedMessageId id={FM.TOOLTIP_ACTION_RESPONSE} />)
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
                    <FormattedMessageId id={FM.TOOLTIP_ACTION_SCORE} />
                    <dl className="cl-tooltip-example">
                        <dt>%:</dt><dd><FormattedMessageId id={FM.TOOLTIP_ACTION_SCORE_PERCENT} /></dd>
                        <dt>Training:</dt><dd><FormattedMessageId id={FM.TOOLTIP_ACTION_SCORE_TRAINING} /></dd>
                        <dt>Disqualified:</dt><dd><FormattedMessageId id={FM.TOOLTIP_ACTION_SCORE_DISQUALIFIED} /></dd>
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
            return (
                <div>
                    {render(
                        FM.TOOLTIP_ACTION_TYPE_TITLE,
                        [FM.TOOLTIP_ACTION_TYPE],
                        null,
                        [
                            { key: 'TEXT:', value: FM.TOOLTIP_ACTION_TYPE_TEXT },
                            { key: 'API', value: FM.TOOLTIP_ACTION_TYPE_APILOCAL },
                            { key: 'CARD:', value: FM.TOOLTIP_ACTION_TYPE_CARD },
                            { key: 'END_SESSION:', value: FM.TOOLTIP_ACTION_TYPE_ENDSESSION }
                        ])}
                    <div><HelpLink label="API Overview" tipType={TipType.ACTION_API1} /></div>
                </div>
            )
        case TipType.ACTION_WAIT:
            return render(FM.TOOLTIP_ACTION_WAIT_TITLE, [FM.TOOLTIP_ACTION_WAIT]);

        case TipType.EDITDIALOGMODAL_WARNING_NEED_REPLAY:
            return (
                <div>
                    <h2>Replay May be needed</h2>
                    <p>One or more edits to Action or Entity properties, may have invalidated turns in this conversation</p>
                    <p>For example, an Entity that is now multi-value may have only stored one value</p>
                    <p>This can be resolved by Replaying the dialog, including all API callbacks</p>

                    <h4>Before replay:</h4>
                    <img
                        className="cl-panelimage"
                        src="https://blisstorage.blob.core.windows.net/uiimages/ToolTipReplay1.png"
                        width="70%"
                        alt="Replay Before"
                    />

                    <h4>After replay:</h4>
                    <img
                        className="cl-panelimage"
                        src="https://blisstorage.blob.core.windows.net/uiimages/ToolTipReplay2.png"
                        width="70%"
                        alt="Replay After"
                    />
                </div>
            )

        case TipType.EDITDIALOGMODAL_UNKNOWN_NEED_REPLAY:
            return (
                <div>
                    <h2>Replay is needed</h2>
                    <p>One or more edits to Action or Entity properties, may have invalidated turns in this conversation</p>
                    <p>It must be replayed to see if any errors were introduced before it can be used in trianing</p>
                </div>
            )
        case TipType.ENTITY_NAME:
            return (<FormattedMessageId id={FM.TOOLTIP_ENTITY_NAME} />);
        case TipType.ENTITY_ACTION_DISQUALIFIED:
            return (<FormattedMessageId id={FM.TOOLTIP_ENTITY_ACTION_DISQUALIFIED} />)
        case TipType.ENTITY_ACTION_REQUIRED:
            return (<FormattedMessageId id={FM.TOOLTIP_ENTITY_ACTION_REQUIRED} />)
        case TipType.ENTITY_EXTRACTOR_WARNING:
            return (<FormattedMessageId id={FM.TOOLTIP_ENTITY_EXTRACTOR_WARNING} />)
        case TipType.ENTITY_VALUE:
            return (<FormattedMessageId id={FM.TOOLTIP_ENTITY_VALUE} />);
        case TipType.ENTITY_MULTIVALUE:
            return (
                <div>
                    <h2>Multivalue</h2>
                    <p>Determines what happens when multiple instances of an Entity are labeled</p>
                    <img
                        className="cl-panelimage"
                        src="https://blisstorage.blob.core.windows.net/uiimages/ToolTip_ENTITY_MULTIVALUE_1.png"
                        width="40%"
                        alt="Entity Type Custom"
                    />
                    <h3>Multivalue</h3>
                    <p>Additional occurrences of the Entity add to list of previous values.</p>
                    <img
                        className="cl-panelimage"
                        src="https://blisstorage.blob.core.windows.net/uiimages/ToolTip_ENTITY_MULTIVALUE_2.png"
                        width="40%"
                        alt="Entity Type Custom"
                    />
                    <h3>Not Multivalue</h3>
                    <p>Additional occurrences replace previous values.</p>
                    <img
                        className="cl-panelimage"
                        src="https://blisstorage.blob.core.windows.net/uiimages/ToolTip_ENTITY_MULTIVALUE_3.png"
                        width="40%"
                        alt="Entity Type Custom"
                    />
                </div>
            )
        case TipType.ENTITY_NEGATABLE:
            return (
                <div>
                    When checked this creates a corresponding 'negatable' entity that can be used to remove or delete previous memory values.<br /><br />

                    <img
                        className="cl-panelimage"
                        src="https://blisstorage.blob.core.windows.net/uiimages/ToolTip_ENTITY_NEGATABLE_1.png"
                        width="40%"
                        alt="Entity Type Custom"
                    />
                    <br />
                    <img
                        className="cl-panelimage"
                        src="https://blisstorage.blob.core.windows.net/uiimages/ToolTip_ENTITY_NEGATABLE_2.png"
                        width="40%"
                        alt="Entity Type Custom"
                    />
                    <br />
                    <img
                        className="cl-panelimage"
                        src="https://blisstorage.blob.core.windows.net/uiimages/ToolTip_ENTITY_NEGATABLE_3.png"
                        width="60%"
                        alt="Entity Type Custom"
                    />
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
            return (
                <div>
                    <p><b>There are three types of Entities:</b></p>
                    <h3>Pre-Trained</h3>
                    <p>Pre-Trained Entities are entities such as "datetime" or "temperature" that have been pre-trained.  Pre-Trained are labelled automatically and cannot changed</p>
                    <img
                        className="cl-panelimage"
                        src="https://blisstorage.blob.core.windows.net/uiimages/ToolTip_ENTITY_TYPE_PRE_TRAINED.png"
                        width="40%"
                        alt="Entity Type Custom"
                    />
                    <h3>Custom Trained</h3>
                    <p>Custom Entities are entites that are learned through the labelling of examples</p>
                    <img
                        className="cl-panelimage"
                        src="https://blisstorage.blob.core.windows.net/uiimages/ToolTip_ENTITY_TYPE_CUSTOM.png"
                        width="40%"
                        alt="Entity Type Custom"
                    />
                    <div>See also: <HelpLink label="Resolver Type" tipType={TipType.ENTITY_RESOLVER} /></div>

                    <h3>Programmatic</h3>
                    <p>Programmatic Entities are not extracted from user input but rather set in code in the EntityDetectionCallback or other API callbacks</p>
                </div>
            )
        case TipType.ENTITY_RESOLVER:
            return (
                <div>
                    <h3>Resolver Type</h3>
                    <p>Custom Enitites can be associated with a Pre-Trained Entity by assigning a "Resolver Type"</p>
                    <p>This allows associating of Pre-Trained entities with Custom Entities</p>

                    <img
                        className="cl-panelimage"
                        src="https://blisstorage.blob.core.windows.net/uiimages/ToolTip_ENTITY_TYPE_RESOLVER.png"
                        width="40%"
                        alt="Entity Type Custom"
                    />

                    <p>The Resolver will provide the Custom Entity a resolution (when available)</p>
                    <img
                        className="cl-panelimage"
                        src="https://blisstorage.blob.core.windows.net/uiimages/ToolTip_ENTITY_TYPE_MEMORY.png"
                        width="40%"
                        alt="Entity Type Custom"
                    />
                </div>
            )
        case TipType.MEMORY_CONVERTER:
            return (
                <div>
                    {render(FM.TOOLTIP_MEMORYCONVERTER_TITLE, [FM.TOOLTIP_MEMORYCONVERTER])}
                    <pre>{memoryConverterSample}</pre>
                    <div>See also: <HelpLink label="Memory Manager" tipType={TipType.MEMORY_MANAGER} /></div>
                </div>
            )
        case TipType.MEMORY_MANAGER:
            return (
                <div>
                    {render(FM.TOOLTIP_MEMORYMANAGER_TITLE, [FM.TOOLTIP_MEMORYMANAGER])}
                    <pre>{memoryManagerSample}</pre>
                    <div>See also: <HelpLink label="Converter" tipType={TipType.MEMORY_CONVERTER} /></div>
                </div>
            )
        case TipType.ENTITY_EXTRACTOR_HELP:
            return (
                <div>
                    <h2>Label Text as Entity</h2>
                    <ol>
                        <li>Select the text range</li>
                        <li>Select the corresponding Entity from the menu, or create a New Entity</li>
                    </ol>

                    <img src="/entity-extractor-label.gif" width="560px" height="368px" alt="Entity Extractor Label" />

                    <h2>Remove Label</h2>
                    <ol>
                        <li>Click on highlighted text</li>
                        <li>Click the delete icon</li>
                    </ol>

                    <img src="/entity-extractor-remove-label.gif" width="518px" height="184px" alt="Entity Extractor Remove Label" />

                    <h2>Notes:</h2>
                    <ul>
                        <li>Pre-Trained entities in blue are not editable</li>
                    </ul>
                </div>
            )
        case TipType.ENTITY_EXTRACTOR_TEXTVARIATION:
            return (
                <div>
                    <h2>Alternative Inputs</h2>

                    <p>Model performance can be improved by providing examples of alternative ways the user might say the same thing.</p>
                    <p>For example, after the Bot asks: "What is your name?" some alternative inputs might be:</p>
                    <p>For example, after the Bot asks: "What is your name?" some alternive inputs might be:</p>
                    <ul>
                        <li>I go by Joe</li>
                        <li>Call me Joe</li>
                        <li>I'm Joe</li>
                    </ul>
                    <p>Or, for a pizza order:</p>
                    <ul>
                        <li>Remove peppers and add olives</li>
                        <li>Replace the peppers with olives</li>
                        <li>Substitute olives for peppers</li>
                    </ul>
                </div>
            )
        case TipType.INVALID_BOT:
            return (
                <div>
                    <h2>Error: Running Bot not compatible with this Model</h2>
                    <p>The Model contains API Actions that are not supported by the running Bot</p>
                    <p>Ways to fix:</p>
                    <ol>
                        <li>Start the correct Bot and click "Retry" on the Model's Home page</li>
                        <li>Add missing APIs to the running Bot</li>
                        <li>Edit and update the API Actions if the API's name has changed</li>
                        <li>Delete the missing API Actions from the Model</li>
                    </ol>
                </div>
            )
        case TipType.LOGGING_TOGGLE:
            return (<FormattedMessageId id={FM.TOOLTIP_LOGGING_TOGGLE} />);
        case TipType.LUIS_OVERVIEW:
            return (
                <div>
                    <h1>LUIS Keys:</h1>
                    <p>There are two different keys for LUIS. The <b>Authoring</b> key and the <b>Subscription</b> key.</p>

                    <h4>Why does Conversation Learner need my Authoring key?</h4>
                    <p>When building and training your bot, the LUIS_AUTHORING_KEY is by Conversation Learner to manage your LUIS account on your behalf.  As you make changes to your Conversation Learner model such as adding entities and labeling entities during training the Conversation Learner service creates the associated LUIS apps with matching entities and utterance phrases.</p>

                    <h4>What does Conversation Learner need my subscription key?</h4>
                    <p>When you publish your bot, you want to set the LUIS_SUBSCRIPTION_KEY.  When set, the Subscription Key (rather than the Authoring Key) is used by Conversation Learner to get predictions from LUIS.  Using the Subscription Key avoids using up the quota for your Authoring key (which would block further usage of Conversation Learner).</p>
                    <p>You can also increase the pricing tier of your subscription key to 50 calls per second instead of 5</p>
                </div>
            )
        case TipType.LUIS_AUTHORING_KEY:
            return (
                <div>
                    <h2>Find your LUIS Authoring Key:</h2>
                    <ol>
                        <li>Go to <a href="https://www.luis.ai" target="_blank" rel="noopener noreferrer">https://www.luis.ai</a></li>
                        <li>Sign in if you are not already</li>
                        <li>Click on your name in the top-right corner to open the dropdown menu</li>
                        <li>Select 'settings' from the menu</li>
                        <li>Copy the "Authoring Key" and use it as the LUIS_AUTHORING_KEY value for your model</li>
                    </ol>


                    <img
                        className="cl-panelimage"
                        src="https://blisstorage.blob.core.windows.net/uiimages/authoringkey.gif"
                        alt="Authoring Key"
                    />

                    <div><br /><div>
                        <h2>LUIS Keys:</h2>
                        <p>There are two different keys for LUIS. The <b>Authoring</b> key and the <b>Subscription</b> key.</p>

                        <h4>Why does Conversation Learner need my Authoring key?</h4>
                        <p>When building and training your bot, the LUIS_AUTHORING_KEY is by Conversation Learner to manage your LUIS account on your behalf.  As you make changes to your Conversation Learner model such as adding entities and labeling entities during training the Conversation Learner service creates the associated LUIS apps with matching entities and utterance phrases.</p>

                        <h4>What does Conversation Learner need my Subscription key?</h4>
                        <p>When you publish your bot, you want to set the LUIS_SUBSCRIPTION_KEY.  When set, the Subscription Key (rather than the Authoring Key) is used by Conversation Learner to get predictions from LUIS.  Using the Subscription Key avoids using up the quota for your Authoring key (which would block further usage of Conversation Learner).</p>
                        <p>You can also increase the pricing tier of your subscription key to 50 calls per second instead of 5</p>
                    </div></div>
                </div>
            )
        case TipType.LUIS_SUBSCRIPTION_KEY:
            return (
                <div>
                    <h1>LUIS Keys:</h1>
                    <p>There are two different keys for LUIS. The <b>Authoring</b> key and the <b>Subscription</b> key.</p>

                    <h3>When does Conversation Learner need a <b>Subscription key</b>?</h3>
                    <p>When you publish your bot, you want to set the LUIS_SUBSCRIPTION_KEY.  When set, the Subscription Key (rather than the Authoring Key) is used by Conversation Learner to get predictions from LUIS.  Using the Subscription Key avoids using up the quota for your Authoring key (which would block further usage of Conversation Learner).</p>
                    <p>You can also increase the pricing tier of your subscription key to 50 calls per second instead of 5</p>

                    <h2>Find / Set your LUIS Subscription key:</h2>
                    <ol>
                        <li>Click on the "Go to LUIS" button in the Conversation Learner UI.  This will take you to the LUIS application associated with your model.</li>
                        <li>In your LUIS' apps "Keys and Endpoint settings", click on "Assign resource"
                            <img src="https://blisstorage.blob.core.windows.net/uiimages/addkey.PNG" width="50%" alt="Add Key" />
                        </li>
                        <li>If you don't yet have an Azure Subscription key you'll need to <a href="https://docs.microsoft.com/en-us/azure/cognitive-services/luis/azureibizasubscription" target="_blank" rel="noopener noreferrer">Create One</a></li>
                        <li>Then select the subscription and add the key to your LUIS model</li>
                        <img src="https://blisstorage.blob.core.windows.net/uiimages/assignkey.PNG" width="50%" alt="Assign Key" />
                        <li>Click the Key String to copy the key value and use it as the LUIS_SUBSCRIPTION_KEY value for your model
                            <br />
                            <img src="https://blisstorage.blob.core.windows.net/uiimages/getkey.PNG" width="75%" alt="Get Key" />
                        </li>
                    </ol>
                </div>
            )
        case TipType.PACKAGECREATOR_LIVE_TOGGLE:
            return (<FormattedMessageId id={FM.TOOLTIP_PACKAGECREATOR_LIVE_TOGGLE} />);

        case TipType.REPLAYERROR_DESC_ACTION_AFTER_WAIT:
            return (
                <div>
                    <h2>Error: Action follows a Wait Action</h2>
                    <p>Wait Actions must be immediately followed by User Input</p>
                    <p>Ways to fix:</p>
                    <ol>
                        <li>Add User Input before the selected Action</li>
                        <li>Change the preceding Action to be a non-Wait Action</li>
                        <li>Delete the selected Action</li>
                    </ol>
                </div>
            )

        case TipType.REPLAYERROR_DESC_TWO_USER_INPUTS:
            return (
                <div>
                    <h2>Error: Two consecutive User Inputs</h2>
                    <p>Each User Input must be immediately followed by an Action</p>
                    <p>Ways to fix:</p>
                    <ol>
                        <li>Add an Action after the selected User Input</li>
                        <li>Delete the selected User Input</li>
                    </ol>
                </div>
            )

        case TipType.REPLAYERROR_DESC_INPUT_AFTER_NONWAIT:
            return (
                <div>
                    <h2>Error: User Input following a non-Wait Action</h2>
                    <p>Non-Wait Actions must be immediately followed by another Action</p>
                    <p>Ways to fix:</p>
                    <ol>
                        <li>Add a Wait Action before the selected User Input</li>
                        <li>Change the preceding Action to be a Wait Action</li>
                        <li>Delete the selected User Input</li>
                    </ol>
                </div>
            )

        case TipType.REPLAYERROR_DESC_ACTION_UNAVAILABLE:
            return (
                <div>
                    <h2>Error: Action is unavailable</h2>
                    <p>Selected Action is blocked by one or more Required or Disqualifying Entities.</p>
                    <p>Ways to fix:</p>
                    <ol>
                        <li>Replace selected Action with a different Action</li>
                        <li>Tag / Untag Entitities in preceding User Inputs</li>
                        <li>Edit Action to change the Required / Disqualifying Entities</li>
                    </ol>
                </div>
            )

        case TipType.REPLAYERROR_DESC_ENTITY_UNDEFINED:
            return (
                <div>
                    <h2>Error: Entity does not exist</h2>
                    <p>Entity no longer exists on this Model</p>
                    <p>Ways to fix:</p>
                    <ol>
                        <li>Replace selected Entity with a different Entity</li>
                        <li>Create a new Entity</li>
                    </ol>
                </div>
            )

        case TipType.REPLAYERROR_DESC_ENTITY_EMPTY:
            return (
                <div>
                    <h2>Error: Entity missing value</h2>
                    <p>Selected Action refers to an Entity whose value has not been set</p>
                    <p>Ways to fix:</p>
                    <ol>
                        <li>Replace selected Action with a different Action</li>
                        <li>Tag the missing Entity in a preceding User Input</li>
                        <li>If a Programmatic Entity, set it in code callbacks</li>
                        <li>Edit Action to not require the missing Entity</li>
                    </ol>
                </div>
            )

        case TipType.REPLAYERROR_DESC_ENTITY_UNEXPECTED_MULTIVALUE:
            return (
                <div>
                    <h2>Warning: A non-Multi-Value Entity is labeled with multiple values</h2>
                    <p>Ways to fix:</p>
                    <ol>
                        <li>Remove one of the labeled Entities</li>
                        <li>Change the Entity back to a multi-value Entity</li>
                    </ol>
                </div>
            )

        case TipType.REPLAYERROR_DESC_ACTION_UNDEFINED:
            return (
                <div>
                    <h2>Error: Action does not exist</h2>
                    <p>Action no longer exists on this Model</p>
                    <p>Ways to fix:</p>
                    <ol>
                        <li>Replace selected Action with a different Action</li>
                        <li>Create a new Action</li>
                    </ol>
                </div>
            )

        case TipType.TAG_EDITING:
            return (<FormattedMessageId id={FM.TOOLTIP_TAG_EDITING} />);

        case TipType.TAG_LIVE:
            return (<FormattedMessageId id={FM.TOOLTIP_TAG_LIVE} />);

        default:
            return (<div>{tipType}</div>);
    }
}

interface ITableItem {
    key: string
    value: FM | null
}

function render(title: FM, body: FM[], example: FM | null = null, tableItems: ITableItem[] = []): JSX.Element {
    return (
        <div>
            <div className="cl-tooltop-headerText"><FormattedMessageId id={title} /></div>
            {body.map((b, i) => <div key={i}><FormattedMessageId id={b} /><br /></div>)}
            {example &&
                <div className="cl-tooltop-example"><FormattedMessageId id={example} /></div>}
            {tableItems.length > 0 ?
                (
                    <dl className="cl-tooltip-example">
                        {tableItems.map((tableItem, i) =>
                            <React.Fragment key={i}><dt>{tableItem.key}</dt><dd>{tableItem.value && <FormattedMessageId id={tableItem.value} />}</dd></React.Fragment>)}
                    </dl>
                ) : null
            }
        </div>
    );
}

export function prebuilt(memoryValue: MemoryValue, content: JSX.Element): JSX.Element {
    if (!memoryValue.builtinType || Object.keys(memoryValue.resolution).length === 0) {
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

export function entityObject(object: Object, content: JSX.Element): JSX.Element {
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

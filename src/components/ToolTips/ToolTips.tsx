/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import * as OF from 'office-ui-fabric-react';
import { FormattedMessage } from 'react-intl'
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

    ENTITY_ACTION_REQUIRED = 'entityActionRequired',
    ENTITY_ACTION_DISQUALIFIED = 'entityActionDisqualified',
    ENTITY_EXTRACTOR_HELP = 'entityExtractorHelp',
    ENTITY_EXTRACTOR_WARNING = 'extractorWarning',
    ENTITY_MULTIVALUE = 'isBucketable',
    ENTITY_NAME = 'entityName',
    ENTITY_NEGATABLE = 'isNegatable',
    ENTITY_PROGAMMATIC = 'isProgrammatic',
    ENTITY_ALWAYS_EXTRACT = 'alwaysExtract',
    ENTITY_TYPE = 'entityType',
    ENTITY_VALUE = 'entityValues',

    LOGGING_TOGGLE = 'loggingToggle',
    LUIS_AUTHORING_KEY = 'luisAuthoringKey',
    LUIS_OVERVIEW = 'luisOverview',
    LUIS_SUBSCRIPTION_KEY = 'luisSubscriptionKey',

    MEMORY_MANAGER = 'memoryManager',

    PACKAGECREATOR_LIVE_TOGGLE = 'packageCreatorLiveToggle',

    REPLAYERROR_DESC_ACTION_AFTER_WAIT = "REPLAYERROR_DESC_ACTION_AFTER_WAIT",
    REPLAYERROR_DESC_TWO_USER_INPUTS = "REPLAYERROR_DESC_TWO_USER_INPUTS",
    REPLAYERROR_DESC_INPUT_AFTER_NONWAIT = "REPLAYERROR_DESC_INPUT_AFTER_NONWAIT",
    REPLAYERROR_DESC_ACTION_UNAVAILABLE = "REPLAYERROR_DESC_ACTION_UNAVAILABLE",
    REPLAYERROR_DESC_ENTITY_UNDEFINED = "REPLAYERROR_DESC_ENTITY_UNDEFINED",
    REPLAYERROR_DESC_ENTITY_EMPTY = "REPLAYERROR_DESC_ENTITY_EMPTY",
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
                        let tip = GetTip(id);
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
            tooltipProps={{ onRenderContent: () => { return GetTip(typType) } }}
            delay={OF.TooltipDelay.medium}
            directionalHint={OF.DirectionalHint.bottomCenter}
        >
            {defaultRenderer(link)}
        </OF.TooltipHost>
    )
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

const renderCodeSample =
    `CL.AddRenderCallback("Multiply", async (memoryManager: ReadOnlyClientMemoryManager, num1string: string, num2string: string, result: string) => {

        // convert base and exponent to ints
        var num1int = parseInt(num1string);
        var num2int = parseInt(num2string);
    
        // compute product
        var result = num1int * num2int;
    
        // save result in entity
        return \`\${num1String} + \${num2string} = \${result}\`
    })`;

let memoryManagerSample =
    `// Values in bot memory
memoryManager.EntityValue(entityName: string): (string | null)
memoryManager.EntityValueAsPrebuilt(entityName: string): MemoryValue[]
memoryManager.EntityValueAsList(entityName: string): string[]
memoryManager.EntityValueAsObject<T>(entityName: string): (T | null)
memoryManager.EntityValueAsBoolean(entityName: string): (boolean | null)
memoryManager.EntityValueAsNumber(entityName: string): (number | null)
memoryManager.GetFilledEntities(): FilledEntity[]

// Values in memory before new Entity detection
memoryManager.PrevEntityValue(entityName: string): (string | null)
memoryManager.PrevEntityValueAsPrebuilt(entityName: string): MemoryValue[]
memoryManager.PrevEntityValueAsList(entityName: string): string[]
memoryManager.PrevEntityValueAsObject<T>(entityName: string): (T | null)
memoryManager.PrevValueAsBoolean(entityName: string): (boolean | null)
memoryManager.PrevValueAsNumber(entityName: string): (number | null)

// Memory manipulation methods
memoryManager.RememberEntity(entityName: string, entityValue: string): void
memoryManager.RememberEntities(entityName: string, entityValues: string[]): void
memoryManager.ForgetEntity(entityName: string, value?: string): void
memoryManager.ForgetAllEntities(saveEntityNames: string[]): void
memoryManager.CopyEntity(entityNameFrom: string, entityNameTo: string): void
`;

export function GetTip(tipType: string) {
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
                    <div className="cl-tooltop-example"><FormattedMessage id={FM.TOOLTIP_EXAMPLE} /></div>
                    <pre>{renderCodeSample}</pre>
                    <div className="cl-tooltop-example"><FormattedMessage id={FM.TOOLTIP_ACTION_ARGUMENTS_TITLE} /></div>
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
        case TipType.ENTITY_NAME:
            return (<FormattedMessage id={FM.TOOLTIP_ENTITY_NAME} defaultMessage="Wait" />);
        case TipType.ENTITY_ACTION_DISQUALIFIED:
            return (<FormattedMessage id={FM.TOOLTIP_ENTITY_ACTION_DISQUALIFIED} defaultMessage="Disqualified Actions" />)
        case TipType.ENTITY_ACTION_REQUIRED:
            return (<FormattedMessage id={FM.TOOLTIP_ENTITY_ACTION_REQUIRED} defaultMessage="Required For Actions" />)
        case TipType.ENTITY_EXTRACTOR_WARNING:
            return (<FormattedMessage id={FM.TOOLTIP_ENTITY_EXTRACTOR_WARNING} defaultMessage="Text Variations must contain the same detected Entities as the original input text." />)
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
        case TipType.ENTITY_ALWAYS_EXTRACT:
            return (
                <div>
                    When checked a default pre-built entity extractor of the selected entity type will be added to the model. This pre-built entity extractor is a 
                    pre-trained extractor. Once added to the model it will try to extract entities from each user utterance. The extracted entity values from 
                    user utterance are always remembered in memory. <br /><br />
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
        case TipType.LUIS_OVERVIEW:
            return (
                <div>
                    <h1>LUIS Keys:</h1>
                    <p>There are two different keys for LUIS. The <b>Authoring</b> key and the <b>Subscription</b> key.</p>

                    <h4>Why does Conversation Learner need my Authoring key?</h4>
                    <p>When building and training your bot, the LUIS_AUTHORING_KEY is by Conversation Learner to manage your LUIS account on your behalf.  As you make changes to your Conversation Learner model such as adding entities and labeling entities during training the Conversation Learner service creates the associated LUIS apps with matching entities and utterance phrases.</p>

                    <h4>What does Conversation Learner need my subscription key?</h4>
                    <p>When you publish your bot, you want to set the LUIS_SUBSCRIPTION_KEY.  When set, the Subscription Key (rather than the Authoring Key) is used by Conversation Learner to get predictions from LUIS.  Using the Subscription Key avoids using up the quota for your Authoring key (which would block further usage of Conversation Learner).</p>
                    <p>You can also increase the pricing teir of your subscription key to 50 calls per second instead of 5</p>
                </div>
            )
        case TipType.LUIS_AUTHORING_KEY:
            return (
                <div>
                    <h2>Find your LUIS Authoring Key:</h2>
                    <ol>
                        <li>Go to <a href="https://www.luis.ai" target="_blank">https://www.luis.ai</a></li>
                        <li>Sign in if you are not already</li>
                        <li>Click on your name in the top-right corner to open the dropdown menu</li>
                        <li>Select 'settings' from the menu</li>
                        <li>Copy the "Authoring Key" and use it as the LUIS_AUTHORING_KEY value for your model</li>
                    </ol>

                    <img src="https://blisstorage.blob.core.windows.net/uiimages/authoringkey.gif" />

                    <div><br /><div>
                        <h2>LUIS Keys:</h2>
                        <p>There are two different keys for LUIS. The <b>Authoring</b> key and the <b>Subscription</b> key.</p>

                        <h4>Why does Conversation Learner need my Authoring key?</h4>
                        <p>When building and training your bot, the LUIS_AUTHORING_KEY is by Conversation Learner to manage your LUIS account on your behalf.  As you make changes to your Conversation Learner model such as adding entities and labeling entities during training the Conversation Learner service creates the associated LUIS apps with matching entities and utterance phrases.</p>

                        <h4>What does Conversation Learner need my Subscription key?</h4>
                        <p>When you publish your bot, you want to set the LUIS_SUBSCRIPTION_KEY.  When set, the Subscription Key (rather than the Authoring Key) is used by Conversation Learner to get predictions from LUIS.  Using the Subscription Key avoids using up the quota for your Authoring key (which would block further usage of Conversation Learner).</p>
                        <p>You can also increase the pricing teir of your subscription key to 50 calls per second instead of 5</p>
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
                    <p>You can also increase the pricing teir of your subscription key to 50 calls per second instead of 5</p>

                    <h2>Find / Set your LUIS Subscription key:</h2>
                    <ol>
                        <li>Click on the "Go to LUIS" button in the Conversation Learner UI.  This will take you to the LUIS application associated with your model.</li>
                        <li>In your LUIS' apps "Publish Tab", click on "Add Key"
                            <img src="https://blisstorage.blob.core.windows.net/uiimages/addkey.PNG" width="50%" />
                        </li>
                        <li>If you don't yet have an Azure Suscription key you'll need to <a href="https://docs.microsoft.com/en-us/azure/cognitive-services/luis/azureibizasubscription" target="_blank">Create One</a></li>
                        <li>Then select the subscription and add the key to your LUIS model</li>
                        <img src="https://blisstorage.blob.core.windows.net/uiimages/assignkey.PNG" width="50%" />
                        <li>Click the Key String to copy the key value and use it as the LUIS_SUBSCRIPTION_KEY value for your model
                            <br />
                            <img src="https://blisstorage.blob.core.windows.net/uiimages/getkey.PNG" width="75%" />
                        </li>
                    </ol>
                </div>
            )
        case TipType.PACKAGECREATOR_LIVE_TOGGLE:
            return (<FormattedMessage id={FM.TOOLTIP_PACKAGECREATOR_LIVE_TOGGLE} defaultMessage="Make new Tag the live version" />);

        case TipType.REPLAYERROR_DESC_ACTION_AFTER_WAIT:
            return (
                <div>
                    <h2>Error: Action following a Wait Action</h2>
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
                        <li>Add an Action after the seledted User Input</li>
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
                        <li>Add a Wait Action before the seledted User Input</li>
                        <li>Change the preceding Action to be a Wait Action</li>
                        <li>Delete the selected User Input</li>
                    </ol>
                </div>
            )

        case TipType.REPLAYERROR_DESC_ACTION_UNAVAILABLE:
            return (
                <div>
                    <h2>Error: Action is unvailable</h2>
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
            return (<FormattedMessage id={FM.TOOLTIP_TAG_EDITING} defaultMessage="Tag editing in the UI" />);

        case TipType.TAG_LIVE:
            return (<FormattedMessage id={FM.TOOLTIP_TAG_LIVE} defaultMessage="Tag Version that is Live" />);

        default:
            return (<div>{tipType}</div>);
    }
}

interface ITableItem {
    key: string
    value: FM | null
}

function render(title: FM, body: FM[], example: string | null = null, tableItems: ITableItem[] = []): JSX.Element {
    return (
        <div>
            <div className="cl-tooltop-headerText"><FormattedMessage id={title} /></div>
            {body.map((b, i) => <div key={i}><FormattedMessage id={b} /><br /></div>)}
            {example &&
                <div className="cl-tooltop-example"><FormattedMessage id={example} /></div>}
            {tableItems.length > 0 ?
                (
                    <dl className="cl-tooltip-example">
                        {tableItems.map((tableItem, i) =>
                            <React.Fragment key={i}><dt>{tableItem.key}</dt><dd>{tableItem.value && <FormattedMessage id={tableItem.value} />}</dd></React.Fragment>)}
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

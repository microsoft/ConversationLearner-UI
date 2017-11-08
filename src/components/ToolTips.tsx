import * as React from 'react';
import * as OF from 'office-ui-fabric-react';
import { FormattedMessage } from 'react-intl'
import { FM } from '../react-intl-messages'
import { MemoryValue } from 'blis-models'
import HelpLink from '../components/HelpLink'
import './ToolTips.css'

export enum TipType {
    ACTION_API = 'actionAPI',
    ACTION_ARGUMENTS = 'actionArguments',
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
    ENTITY_ACTION_BLOCKED = 'entityActionBlocked',
    ENTITY_EXTRACTOR_WARNING = 'extractorWarning',
    ENTITY_MULTIVALUE = 'isBucketable', 
    ENTITY_NAME = 'entityName',  
    ENTITY_NEGATABLE = 'isNegatable',
    ENTITY_PROGAMMATIC = 'isProgrammatic',
    ENTITY_TYPE = 'entityType', 
    ENTITY_VALUE = 'entityValues',  

    MEMORY_MANAGER = 'memoryManager'
}

export function onRenderDetailsHeader(detailsHeaderProps: OF.IDetailsHeaderProps, defaultRender: OF.IRenderFunction<OF.IDetailsHeaderProps>) {
    return (
        <div>
             {
                defaultRender({...detailsHeaderProps,
                    onRenderColumnHeaderTooltip: (tooltipHostProps: OF.ITooltipHostProps) => {
                            let id = tooltipHostProps.id.split('-')[1];
                            let tip = GetTip(id);
                            if (tip) {
                                    let ttHP = {...tooltipHostProps};
                                    ttHP.tooltipProps =  {
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
            tooltipProps={{onRenderContent: () => { return GetTip(link.ariaLabel) }}}
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
            tooltipProps={{onRenderContent: () => { return GetTip(tooltip) }}}
            delay={OF.TooltipDelay.medium}
            directionalHint={directionalHint}
        >
            {content}
        </OF.TooltipHost>
    );
}

let apiCodeSample = 
`blisdk.APICallback("Multiply", async (memoryManager, argArray) =>
{
    try {
        var num1 = parseInt(argArray[0]);
        var num2 = parseInt(argArray[1]);
        var product = num1*num2;
        return product.toString();
    }
    catch (err)
    {
        return "Invalid number";
    }
})`;

let memoryManagerSample = 
`async RememberEntityAsync(entityName : string, value : string) 
    -> Promise<void> 

async ForgetEntityAsync(entityName : string, value : string = null) 
    -> Promise<void> 
 
async CopyEntityAsync(entityNameFrom : string, entityNameTo: string) 
    -> Promise<void> 
 
async EntityValueAsync(entityName : string) 
    -> Promise<string> 

async EntityValueAsPrebuiltAsync(entityName : string) 
    -> Promise<MemoryValue[]> 

async EntityValueAsListAsync(entityName : string) 
    -> Promise<string[]> 

async GetFilledEntitiesAsync() 
    -> Promise<string[]> 

async AppNameAsync() 
    -> Promise<string> 
`;

export function GetTip(tipType: string) {
    switch (tipType) {
        case TipType.ACTION_API:
        return (
            <div>
                {render(FM.TOOLTIP_ACTION_API_TITLE, [FM.TOOLTIP_ACTION_API])}
                <div><br/>blisdk.APICallback("<i>[API NAME]</i>", async (memoryManager, argArray) => <i>[API BODY]</i>)</div>
                <div className="blis-tooltop-example"><FormattedMessage id={FM.TOOLTIP_EXAMPLE}/></div>
                <pre>{apiCodeSample}</pre>
                <div className="blis-tooltop-example"><FormattedMessage id={FM.TOOLTIP_ACTION_ARGUMENTS_TITLE}/></div>
                <div>$number1 $number2<br/></div>
                <div><br/>More about the <HelpLink label="Memory Manager" tipType={TipType.MEMORY_MANAGER}/></div>
            </div>
            ) 
        case TipType.ACTION_ARGUMENTS:  
            return render(FM.TOOLTIP_ACTION_ARGUMENTS_TITLE, [FM.TOOLTIP_ACTION_ARGUMENTS])     
        case TipType.ACTION_ENTITIES:
            return (
                <div>
                    <FormattedMessage id={FM.TOOLTIP_ACTION_ENTITIES} defaultMessage="Response"/>
                    <dl className="blis-tooltip-example">
                        <dt><span className="blis-entity blis-entity--match">Required</span></dt>
                            <dd><FormattedMessage id={FM.TOOLTIP_ACTION_ENTITIES_REQ}/></dd>
                        <dt><span className="blis-entity blis-entity--match"><del>Blocking</del></span></dt>
                            <dd><FormattedMessage id={FM.TOOLTIP_ACTION_ENTITIES_BLOCK_NOT}/></dd>
                        <dt><span className="blis-entity blis-entity--mismatch">Required</span></dt>
                            <dd><FormattedMessage id={FM.TOOLTIP_ACTION_ENTITIES_REQ_NOT}/></dd>
                        <dt><span className="blis-entity blis-entity--mismatch"><del>Blocking</del></span></dt>
                            <dd><FormattedMessage id={FM.TOOLTIP_ACTION_ENTITIES_BLOCK}/></dd>
                    </dl>
                </div>
            )             
        case TipType.ACTION_NEGATIVE:
            return render(
                FM.TOOLTIP_ACTION_NEGATIVE_TITLE, 
                [FM.TOOLTIP_ACTION_NEGATIVE],
                FM.TOOLTIP_EXAMPLE,
                [
                    {key: 'Response:', value: FM.TOOLTIP_ACTION_NEGATIVE_ROW1},
                    {key: 'Blocking:', value: FM.TOOLTIP_ACTION_NEGATIVE_ROW2},
                    {key: '--', value: null},
                    {key: 'Response:', value: FM.TOOLTIP_ACTION_NEGATIVE_ROW3},
                    {key: 'Blocking:', value: FM.TOOLTIP_ACTION_NEGATIVE_ROW4}
                ]);    
        case TipType.ACTION_REQUIRED:
            return render(
                FM.TOOLTIP_ACTION_REQUIRED_TITLE, 
                [FM.TOOLTIP_ACTION_REQUIRED],
                FM.TOOLTIP_EXAMPLE,
                [
                    {key: 'Response:', value: FM.TOOLTIP_ACTION_REQUIRED_ROW1},
                    {key: 'Required:', value: FM.TOOLTIP_ACTION_REQUIRED_ROW2},
                    {key: '--', value: null},
                    {key: 'Response:', value: FM.TOOLTIP_ACTION_REQUIRED_ROW3},
                    {key: 'Required:', value: FM.TOOLTIP_ACTION_REQUIRED_ROW4}
                ]);     
        case TipType.ACTION_RESPONSE:
            return (<FormattedMessage id={FM.TOOLTIP_ACTION_RESPONSE} defaultMessage="Response"/>)
        case TipType.ACTION_RESPONSE_TEXT:
            return render(
                FM.TOOLTIP_ACTION_RESPONSE_TEXT_TITLE, 
                [FM.TOOLTIP_ACTION_RESPONSE_TEXT1, FM.TOOLTIP_ACTION_RESPONSE_TEXT2, FM.TOOLTIP_ACTION_RESPONSE_TEXT3],
                FM.TOOLTIP_EXAMPLE,
                [
                    {key: 'Response:', value: FM.TOOLTIP_ACTION_RESPONSE_ROW1},
                    {key: '--', value: null},
                    {key: 'Response:', value: FM.TOOLTIP_ACTION_RESPONSE_ROW2},
                    {key: '--', value: null},
                    {key: 'Response:', value: FM.TOOLTIP_ACTION_RESPONSE_ROW3}
                ]);   
        case TipType.ACTION_SCORE: 
            return (
                <div>
                    <FormattedMessage id={FM.TOOLTIP_ACTION_SCORE} defaultMessage="Response"/>
                    <dl className="blis-tooltip-example">
                        <dt>%:</dt><dd><FormattedMessage id={FM.TOOLTIP_ACTION_SCORE_PERCENT}/></dd>
                        <dt>Training:</dt><dd><FormattedMessage id={FM.TOOLTIP_ACTION_SCORE_TRAINING}/></dd>
                        <dt>Disqualified:</dt><dd><FormattedMessage id={FM.TOOLTIP_ACTION_SCORE_DISQUALIFIED}/></dd>
                    </dl>
                </div>
            )      
        case TipType.ACTION_SUGGESTED:
            return render(
                FM.TOOLTIP_ACTION_SUGGESTED_TITLE, 
                [FM.TOOLTIP_ACTION_SUGGESTED],
                FM.TOOLTIP_EXAMPLE,
                [
                    {key: 'Response:', value: FM.TOOLTIP_ACTION_SUGGESTED_ROW1},
                    {key: 'Expected:', value: FM.TOOLTIP_ACTION_SUGGESTED_ROW2}
                ]);   
        case TipType.ACTION_TYPE:
            return render(
                FM.TOOLTIP_ACTION_TYPE_TITLE, 
                [FM.TOOLTIP_ACTION_TYPE],
                null,
                [
                    {key: 'Text:', value: FM.TOOLTIP_ACTION_TYPE_TEXT},
                    {key: 'API_Local:', value: FM.TOOLTIP_ACTION_TYPE_APILOCAL},
                    {key: 'API_Azure:', value: FM.TOOLTIP_ACTION_TYPE_APIAZURE},
                    {key: 'Intent:', value: FM.TOOLTIP_ACTION_TYPE_INTENT},
                    {key: 'Card:', value: FM.TOOLTIP_ACTION_TYPE_CARD}
                ]);
        case TipType.ACTION_WAIT:
            return render(FM.TOOLTIP_ACTION_WAIT_TITLE, [FM.TOOLTIP_ACTION_WAIT]);
        case TipType.ENTITY_NAME:
            return (<FormattedMessage id={FM.TOOLTIP_ENTITY_NAME} defaultMessage="Wait"/>);
        case TipType.ENTITY_ACTION_BLOCKED:
            return (<FormattedMessage id={FM.TOOLTIP_ENTITY_ACTION_BLOCKED} defaultMessage="Blocked Actions"/>)  
        case TipType.ENTITY_ACTION_REQUIRED:
            return (<FormattedMessage id={FM.TOOLTIP_ENTITY_ACTION_REQUIRED} defaultMessage="Required For Actions"/>)  
        case TipType.ENTITY_EXTRACTOR_WARNING:
            return (<FormattedMessage id={FM.TOOLTIP_ENTITY_EXTRACTOR_WARNING} defaultMessage="Blocked Actions"/>)     
        case TipType.ENTITY_VALUE:
            return (<FormattedMessage id={FM.TOOLTIP_ENTITY_VALUE} defaultMessage="Wait"/>);
        case TipType.ENTITY_MULTIVALUE:
            return (
                <div>
                    When checked additional occurences of the Entity add to list of previous values. For non multi-value entites new values replace previous values.<br /><br/>
                    <b>Example: Multiple toppings on a pizza</b>
                    <dl className="blis-tooltip-example">
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
                    <dl className="blis-tooltip-example">
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
                    <dl className="blis-tooltip-example">
                        <dt>Entity:</dt><dd>isLoggedIn</dd>
                    </dl>
                    The "isLoggedIn" Entity is set in code. When not set, it can be used to block Actions that require authorized users
                </div>
            )
        case TipType.ENTITY_TYPE:
            return (<FormattedMessage id={FM.TOOLTIP_ENTITY_TYPE} defaultMessage="Wait"/>)
        case TipType.MEMORY_MANAGER:
            return (
                <div>
                    {render(FM.TOOLTIP_MEMORYMANAGER_TITLE, [FM.TOOLTIP_MEMORYMANAGER])}
                    <pre>{memoryManagerSample}</pre>
                </div>
                ) 
        default:
            return (<div>{tipType}</div>);
    }
}

function render(title: FM, body: FM[], example: string = null, tableItems: {key: string, value: FM}[] = []): JSX.Element {
    let key = 0;
    return (
        <div>
            <div className="blis-tooltop-headerText"><FormattedMessage id={title}/></div> 
            {body.map(b => {return (<div key={key++}><FormattedMessage id={b}/><br/></div>)})}
            {example &&
                <div className="blis-tooltop-example"><FormattedMessage id={example}/></div>}
            {tableItems.length > 0 ? 
                (
                    <dl className="blis-tooltip-example">
                        <dt>{tableItems[0] && tableItems[0].key}</dt><dd>{tableItems[0] && tableItems[0].value && <FormattedMessage id={tableItems[0].value}/>}</dd>
                        <dt>{tableItems[1] && tableItems[1].key}</dt><dd>{tableItems[1] && tableItems[1].value && <FormattedMessage id={tableItems[1].value}/>}</dd>
                        <dt>{tableItems[2] && tableItems[2].key}</dt><dd>{tableItems[2] && tableItems[2].value && <FormattedMessage id={tableItems[2].value}/>}</dd>
                        <dt>{tableItems[3] && tableItems[3].key}</dt><dd>{tableItems[3] && tableItems[3].value && <FormattedMessage id={tableItems[3].value}/>}</dd>
                        <dt>{tableItems[4] && tableItems[4].key}</dt><dd>{tableItems[4] && tableItems[4].value && <FormattedMessage id={tableItems[4].value}/>}</dd>              
                    </dl>
                ) : null
            }
        </div>
    ); 
}

export function Prebuilt(memoryValue: MemoryValue, content: JSX.Element): JSX.Element {
    if (!memoryValue.type && !memoryValue.resolution) {
        return content;
    }
    return (
        <div>
            <OF.TooltipHost 
                tooltipProps={{
                    onRenderContent: () => {
                        let key = 0;
                        return (
                            <div>
                                <span><b>{memoryValue.type}</b><br/><br/></span>
                                {memoryValue.resolution &&
                                <span key={key++}>{JSON.stringify(memoryValue.resolution, null, 2).split('\n')
                                    .map(s => {return (<div key={key++}>{s.split(' ').map(u => {return <span key={key++}>&nbsp;{u}</span>; })}</div>)})}</span>
                                }
                            </div>
                        );
                    }
                }}
                calloutProps={{ gapSpace: 0 }}
            >
                {content}
            </OF.TooltipHost>
        </div>
    )
}
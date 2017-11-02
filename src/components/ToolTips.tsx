import * as React from 'react';
import * as OF from 'office-ui-fabric-react';
import { FormattedMessage } from 'react-intl'
import { FM } from '../react-intl-messages'
import './ToolTips.css'

export enum TipType {
    ACTION_ARGUMENTS = "actionArguments",
    ACTION_ENTITIES = "actionEntities",
    ACTION_NEGATIVE = "negativeEntities",
    ACTION_REQUIRED = "requiredEntities",
    ACTION_RESPONSE = "actionResponse",
    ACTION_SCORE = "actionScore",
    ACTION_SUGGESTED = "suggestedEntity",
    ACTION_TYPE = "actionType",
    ACTION_WAIT = "isTerminal",
    
    ENTITY_MULTIVALUE = "isBucketable", 
    ENTITY_NAME = "entityName",  
    ENTITY_NEGATABLE = "isNegatable",
    ENTITY_PROGAMMATIC = "isProgrammatic",
    ENTITY_TYPE = "entityType", 
    ENTITY_VALUE = "entityValues",         
}

export function onRenderDetailsHeader(detailsHeaderProps: OF.IDetailsHeaderProps, defaultRender: OF.IRenderFunction<OF.IDetailsHeaderProps>) {
    return (
        <div>
             {
                defaultRender({...detailsHeaderProps,
                    onRenderColumnHeaderTooltip:(tooltipHostProps: OF.ITooltipHostProps) => 
                        {
                            let id = tooltipHostProps.id.split('-')[1];
                            let tip = GetTip(id);
                            if (tip) {
                                    let ttHP = {...tooltipHostProps};
                                    ttHP.tooltipProps =  {
                                        onRenderContent: () => { return tip },
                                        delay: OF.TooltipDelay.zero,
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
export function GetTip(text: string) {
    switch (text) {
        case TipType.ACTION_ARGUMENTS:
            return (<FormattedMessage id={FM.TOOLTIP_ACTION_ARGUEMENTS} defaultMessage="Arguements"/>)      
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
            return (<FormattedMessage id={FM.TOOLTIP_ACTION_NEGATIVE} defaultMessage="Negative Entities"/>)     
        case TipType.ACTION_REQUIRED:
            return (<FormattedMessage id={FM.TOOLTIP_ACTION_REQUIRED} defaultMessage="Required Entities"/>)     
        case TipType.ACTION_RESPONSE:
            return (<FormattedMessage id={FM.TOOLTIP_ACTION_RESPONSE} defaultMessage="Response"/>)      
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
            return (<FormattedMessage id={FM.TOOLTIP_ACTION_SUGGESTED} defaultMessage="Suggested"/>); 
        case TipType.ACTION_TYPE:
            return (
                <div>
                    <FormattedMessage id={FM.TOOLTIP_ACTION_TYPE} defaultMessage="Response"/>
                    <dl className="blis-tooltip-example">
                        <dt>Text:</dt><dd><FormattedMessage id={FM.TOOLTIP_ACTION_TEXT}/></dd>
                        <dt>API_Local:</dt><dd><FormattedMessage id={FM.TOOLTIP_ACTION_TYPE_APILOCAL}/></dd>
                        <dt>API_Azure:</dt><dd><FormattedMessage id={FM.TOOLTIP_ACTION_TYPE_APIAZURE}/></dd>
                        <dt>Intent:</dt><dd><FormattedMessage id={FM.TOOLTIP_ACTION_TYPE_INTENT}/></dd>
                        <dt>Card:</dt><dd><FormattedMessage id={FM.TOOLTIP_ACTION_TYPE_CARD}/></dd>
                    </dl>
                </div>
            ) 
        case TipType.ACTION_WAIT:
            return (<FormattedMessage id={FM.TOOLTIP_ACTION_WAIT} defaultMessage="Wait"/>);
        case TipType.ENTITY_NAME:
            return (<FormattedMessage id={FM.TOOLTIP_ENTITY_NAME} defaultMessage="Wait"/>);
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
    }
    return (<div>{text}</div>);
}
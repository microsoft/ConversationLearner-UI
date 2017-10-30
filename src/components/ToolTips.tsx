import * as React from 'react';
import * as OF from 'office-ui-fabric-react';

export enum TipType {
    ENTITYTYPE = "entityName",
    ENTITYVALUE = "entityValues",
    MULTIVALUE = "isBucketable",   
    NEGATABLE = "isNegatable",
    PROGAMMATIC = "isProgrammatic",
    TYPE = "entityType",          
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
                                        delay:OF.TooltipDelay.zero,
                                        directionalHint:OF.DirectionalHint.topCenter
                                    };
                                    return <OF.TooltipHost {...ttHP} />
                                }
                            else {
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
        case TipType.ENTITYTYPE:
            return (
                <div>
                    Name of the Entity
                </div>
            )
        case TipType.ENTITYVALUE:
            return (
                <div>
                    What the Bot currently has in Memory for this Entity
                </div>
            )
        case TipType.MULTIVALUE:
            return (
                <div>
                    When checked additional occurences of the Entity add to list of previous values. For non multi-value entites new values replace previous values.<br /><br/>
                    <b>Example: Multiple toppings on a pizza</b>
                    <dl className="blis-entity-example">
                        <dt>Entity:</dt><dd>toppings</dd>
                        <dt>Phrase:</dt><dd>I would like <i>cheese</i> and <i>pepperoni</i>.</dd>
                        <dt>Memory:</dt><dd>cheese, pepperoni</dd>
                    </dl>
                </div>
            )
        case TipType.NEGATABLE:
            return (                                            
                <div>
                    When checked this creates a corresponding 'negatable' entity that can be used to remove or delete previous memory values.<br /><br />
                    <b>Example: Changing existing pizza order</b>
                    <dl className="blis-entity-example">
                        <dt>Entity:</dt><dd>toppings</dd>
                        <dt>Memory:</dt><dd>cheese, pepperoni</dd>
                        <dt>Phrase:</dt><dd>Actually, please add <i>sausage</i> instead of <i>pepperoni</i>.</dd>
                        <dt>Memory:</dt><dd>cheese, <del>pepperoni</del> sausage</dd>
                    </dl>
                </div>
            )
        case TipType.PROGAMMATIC:
            return (                                            
                <div>
                    When checked Entities are not extracted from user utterances.  They are set in code you write for your Bot<br /><br />
                    <b>Example: Restrict Actions for authorized users</b>
                    <dl className="blis-entity-example">
                        <dt>Entity:</dt><dd>isLoggedIn</dd>
                    </dl>
                    The "isLoggedIn" Entity is set in code. When not set, it can be used to block Actions that require authorized users
                </div>
            )
        case TipType.TYPE:
            return (
                <div>
                    Type of Entity: CUSTOM or name existing of Pre-Built Entity
                </div>
            )
    }
    return (<div>{text}</div>);
}
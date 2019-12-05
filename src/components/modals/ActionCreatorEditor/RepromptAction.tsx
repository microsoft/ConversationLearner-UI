/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import * as Util from '../../../Utils/util'
import { ChoiceGroupOptionWithTestId } from '../../../types'
import * as CLM from '@conversationlearner/models'
import AdaptiveCardViewer from '../AdaptiveCardViewer/AdaptiveCardViewer'
import { FM } from '../../../react-intl-messages'
import { InjectedIntlProps } from 'react-intl'
import { actionListViewRenderer } from '../../ActionRenderers'
import { autobind } from 'core-decorators'

interface ReceivedProps {
    action: CLM.ActionBase | undefined
    selfprompt: boolean,
    entities: CLM.EntityBase[],
    botInfo: CLM.BotInfo,
    onChangeRepromptType: () => void
    onPickAction: () => void
}

type Props = ReceivedProps & InjectedIntlProps

interface ComponentState {
    cardViewerAction: CLM.ActionBase | null
}

class RepromptAction extends React.Component<Props, ComponentState> {

    constructor(p: Props) {
        super(p)

        this.state = { cardViewerAction: null }
    }

    @autobind
    onClickViewCard(action: CLM.ActionBase) {
        this.setState({
            cardViewerAction: action
        })
    }

    onCloseCardViewer = () => {
        this.setState({
            cardViewerAction: null
        })
    }

    render() {
        const actionRender = (!this.props.selfprompt && this.props.action)
            ? actionListViewRenderer(this.props.action,
                this.props.entities,
                [],
                this.props.botInfo.callbacks,
                this.onClickViewCard)
            : undefined

        let template: CLM.Template | undefined
        let renderedActionArguments: CLM.RenderedActionArgument[] = []
        if (this.state.cardViewerAction) {
            const cardAction = new CLM.CardAction(this.state.cardViewerAction)
            const entityMap = Util.getDefaultEntityMap(this.props.entities)
            template = this.props.botInfo.templates.find((t) => t.name === cardAction.templateName)
            renderedActionArguments = cardAction.renderArguments(entityMap, { preserveOptionalNodeWrappingCharacters: true })
        }
        
        const repromptOptions: ChoiceGroupOptionWithTestId[] = [
            {
                key: 'A',
                text: Util.formatMessageId(this.props.intl, FM.REPROMPTACTION_SAME_CHOICE),
                'data-testid': 'action-modal-reprompt-type-a',
            },
            {
                key: 'B',
                text: Util.formatMessageId(this.props.intl, FM.REPROMPTACTION_DIFFERENT_CHOICE),
                'data-testid': 'action-modal-reprompt-type-b',
            },
        ]
    
        return <div className="cl-action-creator-reprompt">
            <OF.ChoiceGroup
                defaultSelectedKey={this.props.selfprompt ? repromptOptions[0].key : repromptOptions[1].key}
                options={repromptOptions}
                onChange={this.props.onChangeRepromptType}
                label={undefined}
                required={true}
            />
            <div className="cl-action-creator-reprompt-box">
                {actionRender}
            </div>
            {!this.props.selfprompt &&
                <OF.PrimaryButton
                    className="cl-action-creator-select-action"
                    onClick={this.props.onPickAction}
                    ariaDescription={Util.formatMessageId(this.props.intl, FM.REPROMPTACTION_SELECTACTION_BUTTON)}
                    text={Util.formatMessageId(this.props.intl, FM.REPROMPTACTION_SELECTACTION_BUTTON)}
                    iconProps={{ iconName: 'AlignJustify' }}
                />
            }
            <AdaptiveCardViewer
                open={this.state.cardViewerAction != null}
                onDismiss={() => this.onCloseCardViewer()}
                template={template}
                actionArguments={renderedActionArguments}
                hideUndefined={true}
            />
        </div>
    }
}

export default RepromptAction
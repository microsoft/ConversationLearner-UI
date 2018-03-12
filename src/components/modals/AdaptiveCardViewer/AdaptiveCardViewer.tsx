import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { Template, RenderedActionArgument } from 'blis-models'
import { State } from '../../../types'
import * as AdaptiveCards from 'adaptivecards';
import { injectIntl, InjectedIntlProps } from 'react-intl'
var hostconfig = require('./AdaptiveCardHostConfig.json')
   
class AdaptiveCardViewer extends React.Component<Props, {}> {
    onDismiss = () => {
        this.props.onDismiss()
    }

    renderOptions(): any {
        return {
            hostConfig: hostconfig
        }
    }

    getTemplate(): any {
        let templateString = JSON.stringify(this.props.template.body);

        // Substitute agrument values
        for (let actionArgument of this.props.actionArguments) {
            if (actionArgument) {
                templateString = templateString.replace(new RegExp(`{{${actionArgument.parameter}}}`, 'g'), actionArgument.value)
            }
        }

        if (this.props.hideUndefined) {
            // Replace unfilled entity refrences with blank
            templateString = templateString.replace(/{{\s*[\w\.]+\s*}}/g, '');
        } else {
            // Now replace any images that haven't been substituted with a dummy image
            for (let templateVar of this.props.template.variables) {
                if (templateVar.type === 'Image') {
                    templateString = templateString.replace(new RegExp(`{{${templateVar.key}}}`, 'g'), 'https://c1.staticflickr.com/9/8287/29517736620_3184b66ec8.jpg');
                }
            }
        }
        return JSON.parse(templateString);
    }

    render() {
        if (!this.props.open || !this.props.template) {
            return null;
        }
        let template = this.getTemplate();
        let card = AdaptiveCards.renderCard(template, this.renderOptions());
        return (
            <Modal
                isOpen={this.props.open}
                onDismiss={this.onDismiss}
                isBlocking={false}
                containerClassName="blis-modal blis-modal--border"
            >
               <div className="blis-wc-disabled wc-app wc-card wc-adaptive-card">
                    <div dangerouslySetInnerHTML={{__html: card.outerHTML}} />
                </div>
            </Modal>
        );
    }
}

interface ReceivedProps {
    open: boolean;
    template: Template;
    actionArguments: RenderedActionArgument[]
    onDismiss: () => void;
    hideUndefined: boolean;
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
    }
}
// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(AdaptiveCardViewer))
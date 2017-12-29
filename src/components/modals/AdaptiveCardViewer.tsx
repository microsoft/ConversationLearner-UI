import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { clearErrorDisplay } from '../../actions/displayActions'
import { ActionArgument, Template } from 'blis-models'
import { State } from '../../types'
import * as AdaptiveCards from 'adaptivecards';
import { injectIntl, InjectedIntlProps } from 'react-intl'

var renderOptions = {
        // a Host Config defines the style and behavior of all cards
        hostConfig: {
            'fontFamily': 'Segoe UI, Helvetica Nue, sans-serif'
        },
    
        // the action handler is invoked when actions are pressed
        onExecuteAction: (action: any) => { alert('Ow!'); },
    
        // For markdown support you need a third-party library
        // E.g., to use markdown-it include the script and add the following:
        // <!-- <script type="text/javascript" src="https://unpkg.com/markdown-it/dist/markdown-it.js"></script> -->
        // processMarkdown: function (text) { return markdownit().render(text); }
    };

interface ReceivedProps {
    open: boolean;
    template: Template;
    actionArguments: ActionArgument[]
    onDismiss: () => void;
}
    
class AdaptiveCardViewer extends React.Component<Props, {}> {
    onDismiss = () => {
        this.props.onDismiss()
    }

    renderTemplate(): any {
        
        let templateString = JSON.stringify(this.props.template.body);

        // Substitute agrument values
        for (let actionArgument of this.props.actionArguments) {
            if (actionArgument) {
                templateString = templateString.replace(new RegExp(`{{${actionArgument.parameter}}}`, 'g'), actionArgument.value);
            }
        }

        // Now replace any images that haven't been substituted with a dummy image
        for (let templateVar of this.props.template.variables) {
            if (templateVar.type === 'Image') {
                templateString = templateString.replace(new RegExp(`{{${templateVar.key}}}`, 'g'), 'https://c1.staticflickr.com/9/8287/29517736620_3184b66ec8.jpg');
            }
        }
        return JSON.parse(templateString);
    }

    render() {
        if (!this.props.open || !this.props.template) {
            return null;
        }
        let template = this.renderTemplate();
        let card = AdaptiveCards.renderCard(template, renderOptions);
        return (
            <Modal
                isOpen={this.props.open}
                onDismiss={this.onDismiss}
                isBlocking={false}
                containerClassName="blis-modal blis-modal--small blis-modal--border"
            >
              <div dangerouslySetInnerHTML={{__html: card.outerHTML}} />
            </Modal>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        clearErrorDisplay
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
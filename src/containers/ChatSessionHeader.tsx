import * as React from 'react';
import { setWebchatDisplay, toggleTrainDialog } from '../actions/updateActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State, TrainDialogState, AppState } from '../types';
import { CommandButton, IIconProps, IIconStyles, CommandBar, IContextualMenuItem } from 'office-ui-fabric-react';

interface Props {
	toggleSessionType: Function,
	sessionType: string
}


class ChatSessionHeader extends React.Component<any, any> {
	constructor(p: Props) {
		super(p);
	}
	render() {
		let items: IContextualMenuItem[] = [
			{
				key: "close",
				iconProps: { iconName: 'Clear' },
				onClick: () => this.props.setWebchatDisplay(false)
			},
			{
				key: "spacer"
			},
			{
				key: "spacer2"
			},
			{
				key: "toggleLeft",
				iconProps: { iconName: 'Back' },
				onClick: () => this.props.toggleTrainDialog(false)
			},
			{
				key: "toggleSession",
				name: "Toggle Session"
			},
			{
				key: "toggleRight",
				iconProps: { iconName: 'Forward' },
				onClick: () => this.props.toggleTrainDialog(true)
			},
			{
				key: "spacer3"
			},
			{
				key: "spacer4"
			},
			{
				key: "sessionType",
				name: this.props.sessionType,
				className: "ms-font-m-plus"
			},
		];
		let chatOperations: IContextualMenuItem[] = [
			{
				key: "saveSession",
				iconProps: { iconName: 'Save' },
				name: "Save Session",
				onClick: () => console.log('session controller will send the session through to service')
			},
			{
				key: "abandonSession",
				iconProps: { iconName: 'Delete' },
				name: "Abandon Session",
				onClick: () => console.log('store current session in the session controllers state and just tell it to reinitialize that value')
			},
			{
				key: "newSession",
				name: "New Session",
				iconProps: { iconName: 'CalculatorAddition' },
				onClick: () => console.log('tell session controller to create a new session')
			},
		]
		let farItems: IContextualMenuItem[] = [
			{
				key: "operations",
				iconProps: { iconName: 'DeveloperTools' },
				items: chatOperations
			}
		]

		return (
			<div className="webchatHeader">
				<CommandBar
					className="ms-font-m"
					items={items}
					farItems={farItems}
					isSearchBoxVisible={false}
				/>
			</div>
		)

	}
}
const mapDispatchToProps = (dispatch: any) => {
	return bindActionCreators({
		setWebchatDisplay: setWebchatDisplay,
		toggleTrainDialog: toggleTrainDialog
	}, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
	return {
		trainDialogs: state.trainDialogs
	}
}
export default connect(mapStateToProps, mapDispatchToProps)(ChatSessionHeader as React.ComponentClass<any>);
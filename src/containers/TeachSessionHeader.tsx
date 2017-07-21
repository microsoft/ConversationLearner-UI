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


class TeachSessionHeader extends React.Component<any, any> {
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
		let farItems: IContextualMenuItem[] = [
			{
				key: "operations",
				iconProps: { iconName: 'DeveloperTools' },
				onClick: () => console.log('clicked operations')
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
export default connect(mapStateToProps, mapDispatchToProps)(TeachSessionHeader as React.ComponentClass<any>);
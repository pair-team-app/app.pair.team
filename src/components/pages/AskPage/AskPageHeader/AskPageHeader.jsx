
import React, { Component } from 'react';
import { connect } from 'react-redux';
// import { withRouter } from 'react-router-dom';
import { toggleTheme } from '../../../../redux/actions';
import SharePopover from '../../PlaygroundPage/SharePopover';
import './AskPageHeader.css';
import UserSettings from '../../PlaygroundPage/PlaygroundHeader/UserSettings';
import { SORT_BY_SCORE, SORT_BY_DATE } from './index';


class AskPageHeader extends Component {
	constructor(props) {
		super(props);

		this.state = {
			popover : false,
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, prevState, this.state);
// 		console.log('%s.componentDidUpdate()', this.constructor.name, { left : shareLink.offsetLeft, top : shareLink.offsetTop });

 		const { popover } = this.props;
 		if (popover && !prevProps.popover && !this.state.popover) {
 			this.setState({ popover });
	  }
	}

	componentWillUnmount() {
// 		console.log('%s.componentWillUnmount()', this.constructor.name);
	}

	handlePopoverClose = ()=> {
//		console.log('%s.handlePopoverClose()', this.constructor.name);

		this.props.onSharePopoverClose();
		this.setState({ popover : false });
	};

	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { darkThemed, sort } = this.props;
		const { popover } = this.state;

		return (<div className="ask-page-header">
			<div className="ask-page-header-col ask-page-header-col-left">
				<div className="sort-by-wrapper">
					<div className="sort-by-link" data-selected={sort === SORT_BY_SCORE} onClick={()=> this.props.onSortClick(SORT_BY_SCORE)}>Top</div>
					<div className="sort-by-link" data-selected={sort === SORT_BY_DATE} onClick={()=> this.props.onSortClick(SORT_BY_DATE)}>New</div>
				</div>
			</div>
			<div className="pask-page-header-col ask-page-header-col-middle">
        <input type="checkbox" checked={darkThemed} value={darkThemed} onChange={this.props.toggleTheme} />
			</div>
			<div className="ask-page-header-col ask-page-header-col-right">
				<PlaygroundShareLink popover={popover} playground={null} onClick={()=> this.setState({ popover : !this.state.popover })} onPopup={this.props.onPopup} onPopoverClose={this.handlePopoverClose} />
				<UserSettings onMenuItem={this.props.onSettingsItem} onLogout={this.props.onLogout} />
			</div>
		</div>);
	}
}


const PlaygroundShareLink = (props)=> {
//   console.log('PlaygroundShareLink()', props);

  const { popover, playground } = props;
	return (<div className="playground-share-link">
    <div className="playground-header-link" onClick={props.onClick}>Share</div>

    {(popover) && (<SharePopover
      playground={playground}
      onPopup={props.onPopup}
      onClose={props.onPopoverClose} />)}
	</div>);
};


const mapDispatchToProps = (dispatch)=> {
  return ({
    toggleTheme : ()=> dispatch(toggleTheme())
  });
};

const mapStateToProps = (state, ownProps)=> {
	return ({
    darkThemed : state.darkThemed,
		devices    : state.devices,
		playground : state.playground,
		typeGroup  : state.typeGroup,
		component  : state.component,
		comment    : state.comment
	});
};


export default connect(mapStateToProps, mapDispatchToProps)(AskPageHeader);
// export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AskPageHeader));

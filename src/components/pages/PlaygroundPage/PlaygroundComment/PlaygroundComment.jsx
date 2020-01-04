
import React, { Component } from 'react';
import './PlaygroundComment.css';

import FontAwesome from 'react-fontawesome';
import { connect } from 'react-redux';

import BasePlaygroundComment from '../PlaygroundBaseComment';
import BasePopover from '../../../overlays/BasePopover';
import { ENTER_KEY } from '../../../../consts/key-codes';


class PlaygroundComment extends Component {
	constructor(props) {
		super(props);

		this.state = {
			outro   : false,
			comment : this.props.comment,
			position : {
				x : 0,
				y : 0
			}
		};
	}

	componentDidMount() {
// 		console.log('%s.componentDidMount()', this.constructor.name, this.props, this.state);

    const { position, comment } = this.props;
		if (comment.id === 0) {
      document.addEventListener('keydown', this.handleKeyDown);
    }

		this.setState({ position });
	}

  componentDidUpdate(prevProps, prevState, snapshot) {
//     console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props , prevState, state : this.state });
  }

	componentWillUnmount() {
//     console.log('%s.componentWillUnmount()', this.constructor.name);

    const { comment } = this.props;
    if (comment.id === 0) {
      document.removeEventListener('keydown', this.handleKeyDown);
    }
	}


	handleAddSubmit = (event)=> {
// 		console.log('%s.handleAddSubmit()', this.constructor.name, event, this.state.comment);
		console.log('%s.handleAddSubmit()', this.constructor.name, event, this.state);
		event.preventDefault();
		event.stopPropagation();

		this.setState({
			outro    : true,
			position : {
				x : this.state.position.x - 2,
				y : this.state.position.y + 10
			}
		}, ()=> {
			const { component } = this.props;
			const { position, comment } = this.state;

			this.props.onAddComment({ position, component,
				content : comment.content
			});
		});
	};

	handleClose = (comment)=> {
		console.log('%s.handleClose()', this.constructor.name, comment);

		if (comment.id === this.props.comment.id) {
			this.props.onClose();
		}
	};

	handleDelete = (event)=> {
// 		console.log('%s.handleDelete()', this.constructor.name, event);
		event.preventDefault();
		event.stopPropagation();

		this.setState({ outro : true }, ()=> {
			const { comment } = this.props;
			this.props.onDelete(comment.id);
		});
	};

	handleKeyDown = (event)=> {
    console.log('%s.handleKeyDown()', this.constructor.name, event, event.keyCode);

    const { comment } = this.state;
    if (event.keyCode === ENTER_KEY && comment.content.length > 0) {
    	this.handleAddSubmit(event);
		}
	};

	handleMarkerClick = (event, comment)=> {
// 		console.log('%s.handleMarkerClick()', this.constructor.name, event, comment);
		event.preventDefault();
		event.stopPropagation();

		this.props.onMarkerClick({ comment });
	};

	handleTextChange = (event)=> {
// 		console.log('%s.handleTextChange()', this.constructor.name, event);

		const { comment } = this.state;
		this.setState({
			comment : { ...comment,
				content : event.target.value
			}
		});
	};


	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);
// 		console.log('%s.render()', this.constructor.name, this.props.component, this.props.comment);

		const { component, comment, ind, activeComment } = this.props;
		const { outro } = this.state;

		const style = {
			top  : `${comment.position.y}px`,
			left : `${comment.position.x}px`
		};

		return (<div className="playground-comment" style={style} data-id={component.id}>
			<PlaygroundCommentMarker ind={ind} comment={comment} onClick={this.handleMarkerClick} />
			{(comment.id === 0)
				? (<PlaygroundCommentAddPopover comment={this.state.comment} outro={outro} onTextChange={this.handleTextChange} onSubmit={this.handleAddSubmit} onClose={this.handleClose} />)
				: ((activeComment && activeComment.id === comment.id) && (<PlaygroundCommentPopover ind={ind} comment={comment} outro={outro} onDelete={this.handleDelete} onClose={this.handleClose} />))
			}
		</div>);
	}
}


const PlaygroundCommentAddPopover = (props)=> {
// 	console.log('PlaygroundCommentAddPopover()', props);

	const { comment, outro } = props;
	const payload = {
		fixed : false
	};

	return (<BasePopover outro={outro} payload={payload} onOutroComplete={()=> props.onClose(comment)}>
		<div className="playground-comment-add-popover">
			<form>
				<textarea placeholder="Add Comment" onChange={props.onTextChange}>
				</textarea>
				<button type="submit" disabled={comment.content.length === 0} onClick={props.onSubmit}>Add Comment</button>
			</form>
		</div>
	</BasePopover>);

};

const PlaygroundCommentMarker = (props)=> {
// 	console.log('PlaygroundCommentMarker()', props);

	const { ind, comment } = props;
	return (<div className="playground-comment-marker" onClick={(event)=> props.onClick(event, comment)} data-id={comment.id}>
			{(comment.id === 0)
				? (<div className="playground-comment-marker-pin">
						<FontAwesome name="map-marker-alt" />
					</div>)
				: (<div className="playground-comment-marker-content-wrapper">
					<div className="playground-comment-marker-content">{ind}</div>
				</div>)
			}
	</div>);
};

const PlaygroundCommentPopover = (props)=> {
// 	console.log('PlaygroundCommentPopover()', props);

	const { ind, comment, outro } = props;
	const payload = {
		fixed : false
	};

	return (<BasePopover outro={outro} payload={payload} onOutroComplete={()=> props.onClose(comment)}>
		<div className="playground-comment-popover">
			<BasePlaygroundComment ind={ind} comment={comment} onDelete={props.onDelete} />
		</div>
	</BasePopover>);
};



const mapStateToProps = (state, ownProps)=> {
	return ({
		activeComment : state.comment
	});
};


export default connect(mapStateToProps)(PlaygroundComment);

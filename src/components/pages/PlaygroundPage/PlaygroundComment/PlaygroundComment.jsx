import React, { Component } from 'react';
import './PlaygroundComment.css';

import FontAwesome from 'react-fontawesome';
import { connect } from 'react-redux';

import PlaygroundBaseComment from '../PlaygroundBaseComment';
import BasePopover from '../../../overlays/BasePopover';
import { ENTER_KEY } from '../../../../consts/key-codes';
import { USER_DEFAULT_AVATAR } from '../../../../consts/uris';

class PlaygroundComment extends Component {
  constructor(props) {
    super(props);

    this.state = {
      outro: false,
      comment: this.props.comment,
      position: {
        x: 0,//-300,
        y: 0,//400
      }
	  };
  }

  componentDidMount() {
    // console.log('%s.componentDidMount()', this.constructor.name, this.props, this.state);

    const { position, comment } = this.props;
    if (comment.id === 0) {
      document.addEventListener('keydown', this.handleKeyDown);
    }

    //  console.log('%s.componentDidMount()', this.constructor.name, { position : comment });
    if (position) {
      this.setState({ position : { ...this.state.position, ...position }}, ()=> {
        console.log('%s.componentDidMount()', this.constructor.name, { position : this.state.position });
      });
      // this.setState({ 
		// position: Maths.geom.pointsAdd(position || { x : 0, y : 0 }, this.state.position),
      // });
    }
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
    // 		console.log('%s.handleAddSubmit()', this.constructor.name, event, this.state);
    event.preventDefault();
    event.stopPropagation();

    const { scale } = this.props;
    const position = {
      x : (this.state.position.x * Math.max(scale.width, scale.height)) - 2,
      y : (this.state.position.y * Math.max(scale.width, scale.height)) - 5
    };

    this.setState({ position,
      outro : true,
    }, ()=> {
      const { component } = this.props;
      const { position, comment } = this.state;

      this.props.onAdd({ position, component, content : comment.content });
    });
  };

  handleClose = (comment)=> {
    console.log('%s.handleClose()', this.constructor.name, { comment, props : this.props.comment });

    if (comment.id === this.props.comment.id) {
      this.props.onClose();
    }
  };

  handleDelete = (event)=> {
    // 		console.log('%s.handleDelete()', this.constructor.name, event);
    event.preventDefault();
    event.stopPropagation();

    this.setState({ outro: true }, ()=> {
      const { comment } = this.props;
      this.props.onDelete(comment);
    });
  };

  handleKeyDown = (event)=> {
    //  console.log('%s.handleKeyDown()', this.constructor.name, event, event.keyCode);

    const { comment } = this.state;
    if (event.keyCode === ENTER_KEY && comment.content.length > 0) {
      this.handleAddSubmit(event);
    }
  };

  handleMarkerClick = (event, comment)=> {
    // 		console.log('%s.handleMarkerClick()', this.constructor.name, event, comment);
    event.preventDefault();
    event.stopPropagation();

    this.setState({comment });
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

  onOutro = (event = null)=> {
    // console.log('%s.onOutro()', this.constructor.name, {
    //   event,
    //   outro: this.state.outro
    // });

    if (event) {
      event.preventDefault();
    }

    if (!this.state.outro) {
      this.setState({ outro: true });
    }
  };

  render() {
    // console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });
    // 		console.log('%s.render()', this.constructor.name, this.props.component, this.props.comment);

    const { component, comment, ind, offset, scale, activeComment } = this.props;
	  const { outro } = this.state;
	

	// const style = {
	// 	top: `${offset.y + ((comment.position.y) / scale.height)}px`,
	// 	left: `${offset.x + ((comment.position.x) / scale.width)}px`
  // };

  //
  // const style = {
	// 	top: `${((comment.position.y - offset.y) / Math.max(scale.height, scale.width))}px`,
	// 	left: `${((comment.position.x - offset.x) / Math.max(scale.width, scale.height))}px`
  // };

  // (0, 0) = top-left actual image
  // const style = {
	// 	top  : `${((comment.position.y) / Math.max(scale.height, scale.width))}px`,
	// 	left : `${((comment.position.x) / Math.max(scale.width, scale.height))}px`
  // };

  const style = {
		top  : `${(comment.position.y / ((comment.id === 0) ? 1 : Math.max(scale.width, scale.height)))}px`,
		left : `${(comment.position.x / ((comment.id === 0) ? 1 : Math.max(scale.width, scale.height)))}px`
  };

    return (<div className="playground-comment" style={style} data-id={component.id} data-pos={JSON.stringify(comment.position)} data-offset={JSON.stringify(offset)} data-scale={JSON.stringify(scale)}>
      <PlaygroundCommentMarker ind={ind} comment={comment} onClick={this.handleMarkerClick} />
      {(comment.id === 0) 
        ? (<PlaygroundCommentAddPopover
            comment={this.state.comment}
            outro={outro}
            onTextChange={this.handleTextChange}
            onOutro={this.onOutro}
            onSubmit={this.handleAddSubmit}
            onClose={this.handleClose}
          />) 
        : ((activeComment && activeComment.id === comment.id) && (<PlaygroundCommentPopover
            ind={ind}
            comment={comment}
            outro={outro}
            onDelete={this.handleDelete}
            onClose={this.handleClose}
          />)
      )}
    </div>);
  }
}

const PlaygroundCommentAddPopover = (props)=> {
  	console.log('PlaygroundCommentAddPopover()', props);

  const { comment, outro } = props;
  const payload = {
    fixed    : false,
    position : {
      x : -3,
      y : -3
    }
  };

  return (<BasePopover outro={outro} payload={payload} onOutroComplete={()=> props.onClose(comment)}>
    <div className="playground-comment-add-popover">
      <div className="header-wrapper">
        <div className="avatar-wrapper">
          <img className="avatar-wrapper-ico"src={!comment.author.avatar ? USER_DEFAULT_AVATAR : comment.author.avatar} alt={comment.author.username} />
        </div>
      </div>
      <form>
        <textarea placeholder="Enter Comment" onChange={props.onTextChange} autoFocus>{comment.content}</textarea>
        <div className="button-wrapper">
          <button className="quiet-button" onClick={(event)=> props.onOutro(event)}>Cancel</button>
          <button type="submit" disabled={!comment.content || comment.content.length === 0} onClick={props.onSubmit}>Submit</button>
        </div>
      </form>
    </div>
  </BasePopover>);
};

const PlaygroundCommentMarker = (props)=> {
  	// console.log('PlaygroundCommentMarker()', props);

  const { ind, comment } = props;
  return (<div className="playground-comment-marker" onClick={(event)=> props.onClick(event, comment)} data-id={comment.id}>
    {(comment.id === 0) 
      ? (<div className="playground-comment-marker-pin"><FontAwesome name="map-marker-alt" /></div>) 
      : (<div className="playground-comment-marker-content-wrapper">
          <div className="playground-comment-marker-content">{ind}</div>
        </div>)}
  </div>
  );
};


const PlaygroundCommentPopover = (props)=> {
  // 	console.log('PlaygroundCommentPopover()', props);

  const { ind, comment, outro } = props;
  const payload = {
    fixed    : false,
    position : {
      x : 1,
      y : 1
    }
  };

  return (<BasePopover outro={outro} payload={payload} onOutroComplete={()=> props.onClose(comment)}>
    <div className="playground-comment-popover">
      <PlaygroundBaseComment ind={ind} comment={comment} onDelete={props.onDelete} />
    </div>
  </BasePopover>);
};


const mapStateToProps = (state, ownProps)=> {
  return {
    activeComment : state.comment
  };
};


export default connect(mapStateToProps)(PlaygroundComment);

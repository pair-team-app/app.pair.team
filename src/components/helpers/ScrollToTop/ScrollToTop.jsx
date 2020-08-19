
import React, { Component } from 'react';
// import { withRouter } from 'react-router-dom';

class ScrollToTop extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  componentDidMount() {
    // console.log('%s.componentDidMount()', this.constructor.name, { props : this.props, state : this.state });
    this.onScroll();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps : prevProps, prevState : prevState, props : this.props, state : this.state });

    const { pathname } = this.props.location;
    if (pathname && pathname !== prevProps.location.pathname) {
      this.onScroll();
    }
  }

  onScroll = ()=> {
    // console.log('%s.onScroll()', this.constructor.name, { offset : window.scrollY });

    setTimeout(()=> {
      if (window.scrollY > 0) {
        window.scrollTo(0, 0);
        window.document.documentElement.scrollTop = 0;
      }
    }, 5);
  };


  render() {
    // console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

    const { children } = this.props;
    // return (children);

    return (<div className="scroll-to-top">{children}</div>);
  }
}


// export default withRouter(ScrollToTop);
export default (ScrollToTop);

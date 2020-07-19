import React, { Component } from 'react';
import './DevicesPopover.css';

import BasePopover from '../../../overlays/BasePopover';
import { connect } from 'react-redux';

class DevicesPopover extends Component {
  constructor(props) {
    super(props);

    this.state = {
	  	outro : false
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });
  }

  render() {
	// console.log('%s.render()', this.constructor.name, this.props, this.state);

	  const { devices, matchPath, deviceIDs } = this.props;
	  const { outro } = this.state;
	  const payload = {
		  fixed  : false,
		  offset : {
			  right  : '50%',
			  bottom : 30
		  }
	  };
    
    return (<BasePopover outro={outro} payload={payload} onOutroComplete={this.props.onClose}>
			<div className="devices-popover">
				<div className="device-item-wrapper">
          {(deviceIDs.map((deviceID)=> (devices.find(({ id })=> (id === deviceID)))).sort((i, ii)=> ((i.title.toUpperCase() < ii.title.toUpperCase()) ? -1 : (i.title.toUpperCase() > ii.title.toUpperCase()) ? 1 : 0)).map((device, i)=> (
            <DeviceItem key={i} device={device} selected={device.slug === matchPath.params.deviceSlug} onClick={this.props.onDeviceClick} />
          )))}
				</div>
			</div>
		</BasePopover>);
  }
}


const DeviceItem = (props)=> {
	// console.log('DeviceItem()', props);

	const { device, selected } = props;
	const { title } = device

	return (<div className="device-item" data-selected={selected} onClick={()=> (!selected) ? props.onClick(device) : null}>
		<div className="device-item-title">{title}</div>
 	</div>);
};

const mapStateToProps = (state, ownProps)=> {
  return {
    devices   : state.devices,
    matchPath : state.matchPath
  };
};

export default connect(mapStateToProps)(DevicesPopover);

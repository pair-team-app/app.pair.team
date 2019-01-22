
import React, { Component } from 'react';
import './InputField.css';

export const INPUTFIELD_STATUS_IDLE = 'INPUTFIELD_STATUS_IDLE';
export const INPUTFIELD_STATUS_ERROR = 'INPUTFIELD_STATUS_ERROR';
export const INPUTFIELD_STATUS_WORKING = 'INPUTFIELD_STATUS_WORKING';

const textfield = React.createRef();


class InputField extends Component {
	constructor(props) {
// 		console.log('InputField.constructor()', props);

		super(props);

		this.state = {
			value  : props.value,
			status : INPUTFIELD_STATUS_IDLE
		};
	}

	componentDidMount() {
// 		console.log('InputField.componentDidMount()', this.props, this.state);
		const { value, status } = this.props;
		this.setState({ value, status });
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		console.log('InputField.componentDidUpdate()', prevProps, this.props, prevState, this.state, snapshot);

		const { value, status } = this.props;
		if (value !== prevProps.value) {
			this.setState({ value });
		}

		if (status !== prevProps.status) {
			this.setState({ status });
		}
	}

	handleBlur = (event)=> {
// 		console.log('InputField.handleBlur()', event.target);
// 		const { value } = this.state;
	};

	handleChange = (event)=> {
// 		console.log('InputField.handleChange()', event.target);

		const { value } = event.target;
		this.setState({ value });
		this.props.onChange(value);
	};

	handleClick = (event)=> {
// 		console.log('InputField.handleClick()', event.target);
		this.setState({
			value  : '',
			status : INPUTFIELD_STATUS_IDLE
		});

// 		setTimeout(()=> {
// 			textfield.current.focus();
// 		}, 69);

		this.props.onClick();
	};

	handleFocus = (event)=> {
// 		console.log('InputField.handleFocus()', event.target);
	};

	handleSubmit = (event)=> {
		console.log('InputField.handleSubmit()', event.target);

		const { value } = this.state;
		this.props.onSubmit(value);
	};


	render() {
		console.log('InputField.render()', this.props, this.state);

		const { type, name, placeholder, button } = this.props;
		const { value, status } = this.state;

		const wrapperClass = `input-wrapper input-field-wrapper${((status === INPUTFIELD_STATUS_ERROR) ? ' input-wrapper-error' : '')}`;
		const textfieldClass = `input-field-textfield${((status === INPUTFIELD_STATUS_ERROR) ? ' is-hidden' : '')}`;
		const errorStyle = { display : ((status === INPUTFIELD_STATUS_ERROR) ? 'block' : 'none') };

		return (
			<div className="input-field">
				<div className={wrapperClass}>
					<input autoFocus type={type} name={name} className={textfieldClass} placeholder={placeholder} value={value} onFocus={this.handleFocus} onChange={this.handleChange} onBlur={this.handleBlur} ref={textfield} />
					<div className="field-error" onClick={this.handleClick} style={errorStyle}>{value}</div>
				</div>
				{(button) && (<button disabled={(value.length === 0)} className="tiny-button input-field-button" onClick={this.handleSubmit}>{button}</button>)}
			</div>
		);
	}
}

export default InputField;

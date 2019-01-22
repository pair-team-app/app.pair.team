
import React, { Component } from 'react';
import './InputField.css';

export const IDLE_STATUS = 'IDLE';
export const ERROR_STATUS = 'ERROR';
export const MODIFY_STATUS = 'MODIFY';
const textfield = React.createRef();


class InputField extends Component {
	constructor(props) {
// 		console.log('InputField.constructor()', props);

		super(props);

		this.state = {
			value  : props.value,
			status : IDLE_STATUS
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
			status : IDLE_STATUS
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

		const wrapperClass = `input-wrapper input-field-wrapper${((status === ERROR_STATUS) ? ' input-wrapper-error' : '')}`;
		const textfieldClass = `input-field-textfield${((status === ERROR_STATUS) ? ' is-hidden' : '')}`;
		const errorStyle = { display : ((status === ERROR_STATUS) ? 'block' : 'none') };

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

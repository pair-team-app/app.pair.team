
import React, { Component } from 'react';
import './InputField.css';

const textfield = React.createRef();

class InputField extends Component {
	constructor(props) {
// 		console.log('InputField.constructor()', props);

		super(props);

		this.state = {
			value  : props.value,
			status : 'IDLE'
		};
	}

	componentDidMount() {
// 		console.log('InputField.componentDidMount()', this.props, this.state);
		const { value, status } = this.props;
		this.setState({ value, status });
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('InputField.componentDidUpdate()', prevProps, this.props, this.state);

		const { value, status } = this.props;
		if (value !== prevProps.value) {
			this.setState({ value });
		}

		if (status !== prevProps.status) {
			this.setState({ status });
		}
	}

	handleBlur = (event)=> {
		console.log('InputField.handleBlur()', event.target);

		const { value } = this.state;
		this.props.onBlur(value);
	};

	handleChange = (event)=> {
		console.log('InputField.handleChange()', event.target);
		this.setState({ value : event.target.value });
	};

	handleClick = (event)=> {
		console.log('InputField.handleClick()', event.target);
		this.setState({
			value  : '',
			status : 'IDLE'
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
// 		console.log('InputField.render()', this.props, this.state);

		const { type, name, placeholder, button } = this.props;
		const { value, status } = this.state;

		const wrapperClass = 'input-wrapper input-field-wrapper' + ((status === 'ERROR') ? ' input-wrapper-error' : '');
		const textfieldClass = 'input-field-textfield' + ((status === 'ERROR') ? ' is-hidden' : '');
		const buttonClass = 'tiny-button input-field-button';
		const errorStyle = { display : ((status === 'error') ? 'block' : 'none') };

		return (
			<div className="input-field">
				<div className={wrapperClass}>
					<input autoFocus type={type} name={name} className={textfieldClass} placeholder={placeholder} value={value} onFocus={(e)=> this.handleFocus(e)} onChange={(e)=> this.handleChange(e)} onBlur={(e)=> this.handleBlur(e)} ref={textfield} />
					<div className="field-error" onClick={this.handleClick} style={errorStyle}>{value}</div>
				</div>
				<button className={buttonClass} onClick={this.handleSubmit}>{button}</button>
			</div>
		);
	}
}

export default InputField;

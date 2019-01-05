
import React, { Component } from 'react';
import './InputField.css';

const textfield = React.createRef();

class InputField extends Component {
	constructor(props) {
// 		console.log('InputField.constructor()', props);

		super(props);

		this.state = {
			org    : '',
			value  : '',
			status : 'idle',

		};
	}

	componentDidMount() {
// 		console.log('InputField.componentDidMount()', this.props, this.state);

		this.setState({
			org    : this.props.value,
			value  : this.props.value,
			status : this.props.status
		});
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('InputField.componentDidUpdate', prevProps, this.props, this.state);

		if (this.props.value !== prevProps.value) {
			this.setState({ value : this.props.value });
		}

		if (this.props.status !== prevProps.status) {
			this.setState({ status : this.props.status });
		}
	}

	handleBlur = (event)=> {
		const { value } = this.state;
		this.props.onBlur(value);
	};

	handleChange = (event)=> {
		this.setState({ value : event.target.value });
	};

	handleClick = ()=> {
		this.setState({
			value  : '',
			status : 'idle'
		});

// 		setTimeout(function() {
// 			textfield.current.focus();
// 		}, 69);

		this.props.onClick();
	};

	handleFocus = (event)=> {
	};

	handleSubmit = ()=> {
		const { value } = this.state;
		this.props.onSubmit(value);
	};


	render() {
		const { type, name, placeholder, button } = this.props;
		const { value, status } = this.state;

		const wrapperClass = 'input-wrapper input-field-wrapper' + ((status === 'error') ? ' input-wrapper-error' : '');
		const textfieldClass = 'input-field-textfield' + ((status === 'error') ? ' is-hidden' : '');
		const buttonClass = 'tiny-button input-field-button';

// 		console.log('InputField.render()', this.props, this.state);

		return (
			<div className="input-field">
				<div className={wrapperClass}>
					<input type={type} name={name} className={textfieldClass} placeholder={placeholder} value={value} onFocus={(e)=> this.handleFocus(e)} onChange={(e)=> this.handleChange(e)} onBlur={(e)=> this.handleBlur(e)} ref={textfield} />
					<div className="field-error" onClick={()=> this.handleClick()} style={{ display : (status === 'error') ? 'block' : 'none' }}>{value}</div>
				</div>
				<button className={buttonClass} onClick={()=> this.handleSubmit()}>{button}</button>
			</div>
		);
	}
}

export default InputField;

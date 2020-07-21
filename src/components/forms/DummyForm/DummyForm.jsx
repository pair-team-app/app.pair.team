
import React from 'react';
import './DummyForm.css';


function DummyForm(props) {
// console.log('DummyForm()', props);

	return (<div className='dummy-form'>
		<input name='email' style={{ display : 'none' }} />
		<input type='password' name='password' style={{ display : 'none' }} />
	</div>);
}


export default (DummyForm);

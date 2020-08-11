

import React from 'react';
import './FormAccessories.css';

import { FormAccessoryAlignment } from '../FormAccessories';


export const PlusFormAccessory = (props)=> {
  // console.log('PlusFormAccessory', { props });

  const { align } = props;
  return (<div className={`form-acc form-acc-${(align || FormAccessoryAlignment.CENTER)} plus-form-accessory`} onClick={props.onClick}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11" fill="white" stroke="#c4c4c4" strokeWidth="2"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M13 7H11V11H7V13H11V17H13V13H17V11H13V7Z" fill="#c4c4c4"/>
    </svg>
  </div>);
};


export const MinusFormAccessory = (props)=> {
  // console.log('MinusFormAccessory', { props });

  const { align } = props;
  return (<div className={`form-acc form-acc-${(align || FormAccessoryAlignment.CENTER)} minus-form-accessory`} onClick={props.onClick}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11" fill="white" stroke="#c4c4c4" strokeWidth="2"/>
      <path d="M7 13V11H17V13H7Z" fill="#c4c4c4"/>
    </svg>
  </div>);
};

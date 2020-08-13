

import React from 'react';
import './FormAccessories.css';

import { FormAccessoryAlignment } from '../FormAccessories';


export const CodeFormAccessory = (props)=> {
  // console.log('CodeFormAccessory', { props });

  const { align } = props;
  return (<div className={`form-acc code-form-accessory`} onClick={props.onClick} data-align={(align || FormAccessoryAlignment.CENTER)}>
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.969 0L6 11.844L5.969 12H8.032L10.001 0.156L10.032 0H7.969V0ZM5 1.813L4.469 2.157L0.469 4.657L0 4.938V7.064L0.469 7.345L4.469 9.845L5 10.189V7.814L2.094 6.001L5 4.188V1.813ZM11 1.813V4.188L13.906 6.001L11 7.814V10.189L11.531 9.845L15.531 7.345L16 7.064V4.938L15.531 4.657L11.531 2.157L11 1.813Z" fill="#CCCCCC"/>
    </svg>
  </div>);
};

export const PlusFormAccessory = (props)=> {
  // console.log('PlusFormAccessory', { props });

  const { align } = props;
  return (<div className={`form-acc plus-form-accessory`} onClick={props.onClick} data-align={(align || FormAccessoryAlignment.CENTER)}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11" fill="white" stroke="#c4c4c4" strokeWidth="2"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M13 7H11V11H7V13H11V17H13V13H17V11H13V7Z" fill="#c4c4c4"/>
    </svg>
  </div>);
};


export const MinusFormAccessory = (props)=> {
  // console.log('MinusFormAccessory', { props });

  const { align } = props;
  return (<div className={`form-acc minus-form-accessory`} onClick={props.onClick} data-align={(align || FormAccessoryAlignment.CENTER)}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11" fill="white" stroke="#c4c4c4" strokeWidth="2"/>
      <path d="M7 13V11H17V13H7Z" fill="#c4c4c4"/>
    </svg>
  </div>);
};

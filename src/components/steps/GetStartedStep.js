
import React, { Component } from 'react';
import './GetStartedStep.css';

import FontAwesome from 'react-fontawesome';
import { Column, Row } from 'simple-flexbox';

import ProjectItem from '../ProjectItem'

class GetStartedStep extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		let buttons = [
			{
				id : 1,
				title : "Project 1",
				image : "https://radishlab.com/wp-content/uploads/2015/08/sketch-app-icon-e1439400898972.png"
			}, {
				id : 2,
				title : "Project 2",
				image : "https://radishlab.com/wp-content/uploads/2015/08/sketch-app-icon-e1439400898972.png"
			}, {
				id : 3,
				title : "Project 3",
				image : "https://radishlab.com/wp-content/uploads/2015/08/sketch-app-icon-e1439400898972.png"
			}, {
				id : 4,
				title : "Project 4",
				image : "https://radishlab.com/wp-content/uploads/2015/08/sketch-app-icon-e1439400898972.png"
			}, {
				id : 5,
				title : "Project 5",
				image : "https://radishlab.com/wp-content/uploads/2015/08/sketch-app-icon-e1439400898972.png"
			}
		];

		let items = buttons.map((item, i, arr) => {
			return (
				<Column key={i}>
					<ProjectItem image={item.image} title={item.title} />
				</Column>
			);
		});

		let faStyle = {
			color: '#0000ff',
			fontSize: '14px',
			marginRight: '5px'
		};

		let lAlignStyle = {
			textAlign: 'left'
		};

		return (
			<Row vertical="start">
				<Column flexGrow={1} horizontal="center">
					<div className="step-header-text">Use AI to design your next <strong>deck</strong></div>
					<div className="step-text">Accelerate your best ideas with Design Engine’s AI powered Premium Design Projects.</div>
					<button className="action-button step-button" onClick={()=> this.props.onClick()}>Get Started</button>
					<img src="/images/macbook.png" className="intro-image" alt="MacBook" />
					<div className="step-header-text">Accelerate your best ideas with AI</div>
					<div className="step-text">Whether you are building a web app or a presentation, use AI to accelerate your ideas.</div>
					<button className="action-button step-button" onClick={()=> this.props.onClick()}>View Projects</button>
					<div className="project-item-wrapper">
						<Row horizontal="center" style={{flexWrap:'wrap'}}>
							{items}
						</Row>
					</div>
					<Row flexGrow={1} className="intro-projects">
						<Column flexGrow={1} horizontal="start">
							<div className="step-subheader-text" style={lAlignStyle}>Professional design using AI.</div>
							<div className="step-text" style={lAlignStyle}>Though the gravity still dragged at him, his muscles were making great efforts to adjust. After the daily classes he no longer collapsed immediately into bed.</div>
							<Row flexGrow={1} vertical="center">
								<Column><FontAwesome name="plus-circle" style={faStyle} /></Column>
								<Column vertical="center">Read More</Column>
								{/*<div><FontAwesome name="plus-circle" style={faStyle} /> Read More</div>*/}
							</Row>
						</Column>
						<Column flexGrow={1}>
							<img src="/images/iphone.png" alt="iPhone" width="300" height="372" />
						</Column>
					</Row>
					<Row flexGrow={1} style={{width:'100%'}}>
						<Column flexGrow={1}>
							<div style={{textAlign:'left', fontWeight:'bold', marginBottom:'10px'}}>Explore Ideas</div>
							<div className="step-text" style={{textAlign:'left', paddingRight:'20px'}}>Decipherment colonies made in the interiors of collapsing stars white dwarf of brilliant.</div>
						</Column>
						<Column flexGrow={1}>
							<div style={{textAlign:'left', fontWeight:'bold', marginBottom:'10px'}}>High-End Templates</div>
							<div className="step-text" style={{textAlign:'left', paddingRight:'20px'}}>Yet, for all that I have set down, we travelled much, always but there were so many millions.</div>
						</Column>
						<Column flexGrow={1}>
							<div style={{textAlign:'left', fontWeight:'bold', marginBottom:'10px'}}>Accelerate</div>
							<div className="step-text" style={{textAlign:'left', paddingRight:'20px'}}>Bits of moving fluff, made in the interiors of collapsing stars decipherment venture.</div>
						</Column>
					</Row>
					<div className="reviews-wrapper">
						<div className="step-subheader-text">What people are saying about Design Engine?</div>
						<div className="step-text">«Though the gravity still dragged at him, his muscles were making great efforts to adjust. After the daily classes he no longer collapsed immediately into bed.»</div>
						<div>Leone Abachio</div>
						<div className="step-text">Vimeo</div>
					</div>
				</Column>
			</Row>
		);
	}
}

export default GetStartedStep;

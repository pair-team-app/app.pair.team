
import React, { Component } from 'react';
import './APIPage.css';

import CopyToClipboard from 'react-copy-to-clipboard';
import { Row } from 'simple-flexbox';

import enabledCopyCodeButton from '../../images/buttons/btn-copy-code_enabled.svg';

class APIPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			codes : [{
				html   : '#block {<br>&nbsp;&nbsp;width: 100%;<br>&nbsp;&nbsp;color: #ffffff;<br>}',
				syntax : '#block {width: 100%; color: #ffffff;}'
			}],
			urls  : [
				'https://earlyaccess.designengine.ai/proj/111/ios-12-design-system/views',
				'https://earlyaccess.designengine.ai/page/111/22/321/tab-bars/views',
			],
		};
	}

	handleCodeCopy = (code)=> {
		this.props.onPopup({
			visible : true,
			content : 'Copied to Clipboard!'
		});
	};

	handleURLCopy = (url)=> {
		this.props.onPopup({
			visible : true,
			content : 'Copied to Clipboard!'
		});
	};

	render() {
		return (
			<div className="page-wrapper api-page-wrapper">
				<div className="page-header">
					<Row horizontal="center"><h1>API Docs</h1></Row>
					<div className="page-header-text">Design Engine’s API provides the ability to GET objects from your organizations design projects pages, artboards, buttons, & more.</div>
					<Row horizontal="center">
						<button className="adjacent-button" onClick={()=> window.open('https://www.github.com/de-ai')}>Github</button>
						<button className="adjacent-button" onClick={()=> window.open('https://join.slack.com/t/designengineai/shared_invite/enQtMzE5ODE0MTA0MzA5LWM2NzcwNTRiNjQzMTAyYTEyNjQ1MjE5NmExNDM1MzAyNWZjMTA0ZWIwNTdmZjYyMjc2M2ExNjAyYWFhZDliMzA')}>Slack</button>
						<button onClick={()=> window.open('https://spectrum.chat/designengine')}>Spectrum</button>
					</Row>
				</div>

				<div className="api-topic-wrapper">
					<h3>Project</h3>
					<p className="api-page-paragraph">Renders entire Design Engine Project in JSON format.</p>
					<div className="api-page-url-box">
						<a href={this.state.urls[0]} target="_blank" rel="noopener noreferrer">{this.state.urls[0]}</a>
						<CopyToClipboard onCopy={()=> this.handleURLCopy()} text={this.state.urls[0]}>
							<button className="api-page-float-button"><img src={enabledCopyCodeButton} alt="Copy" /></button>
						</CopyToClipboard>
					</div>
				</div>

				<div className="api-topic-wrapper">
					<h3>Pages</h3>
					<p className="api-page-paragraph">Renders ALL pages from your Design Engine Project in JSON format.</p>
					<div className="api-page-url-box">
						<a href={this.state.urls[0]} target="_blank" rel="noopener noreferrer">{this.state.urls[0]}</a>
						<CopyToClipboard onCopy={()=> this.handleURLCopy()} text={this.state.urls[0]}>
							<button className="api-page-float-button"><img src={enabledCopyCodeButton} alt="Copy" /></button>
						</CopyToClipboard>
					</div>
				</div>

				<div className="api-topic-wrapper">
					<h3>Artboards</h3>
					<p className="api-page-paragraph">Renders ALL artboards found inside EACH Page from your Design Engine Project in JSON format.</p>
					<div className="api-page-url-box">
						<a href={this.state.urls[1]} target="_blank" rel="noopener noreferrer">{this.state.urls[1]}</a>
						<CopyToClipboard onCopy={()=> this.handleURLCopy(this.state.urls[1])} text={this.state.urls[1]}>
							<button className="api-page-float-button"><img src={enabledCopyCodeButton} alt="Copy" /></button>
						</CopyToClipboard>
					</div>
				</div>

				<div className="api-topic-wrapper">
					<h3>Slices</h3>
					<p className="api-page-paragraph">Renders ALL Slices found inside EACH Artboard from your Design Engine Project in JSON format.</p>
					<div className="api-page-url-box">
						<a href={this.state.urls[0]} target="_blank" rel="noopener noreferrer">{this.state.urls[0]}</a>
						<CopyToClipboard onCopy={()=> this.handleURLCopy(this.state.urls[0])} text={this.state.urls[0]}>
							<button className="api-page-float-button"><img src={enabledCopyCodeButton} alt="Copy" /></button>
						</CopyToClipboard>
					</div>
				</div>

				<div className="api-topic-wrapper">
					<h3>Text Fields</h3>
					<p className="api-page-paragraph">Renders ALL Text Fields found inside EACH Artboard from your Design Engine Project in JSON format.</p>
					<div className="api-page-url-box">
						<a href={this.state.urls[0]} target="_blank" rel="noopener noreferrer">{this.state.urls[0]}</a>
						<CopyToClipboard onCopy={()=> this.handleURLCopy(this.state.urls[0])} text={this.state.urls[0]}>
							<button className="api-page-float-button"><img src={enabledCopyCodeButton} alt="Copy" /></button>
						</CopyToClipboard>
					</div>
				</div>

				<div className="api-topic-wrapper">
					<h3>Backgrounds</h3>
					<p className="api-page-paragraph">Renders ALL Backgrounds found inside EACH Artboard from your Design Engine Project in JSON format.</p>
					<div className="api-page-url-box">
						<a href={this.state.urls[0]} target="_blank" rel="noopener noreferrer">{this.state.urls[0]}</a>
						<CopyToClipboard onCopy={()=> this.handleURLCopy(this.state.urls[0])} text={this.state.urls[0]}>
							<button className="api-page-float-button"><img src={enabledCopyCodeButton} alt="Copy" /></button>
						</CopyToClipboard>
					</div>
				</div>

				<div className="api-topic-wrapper">
					<h3>Buttons</h3>
					<p className="api-page-paragraph">Renders ALL Buttons or Hot Zones found inside EACH Artboard from your Design Engine Project in JSON format.</p>
					<div className="api-page-url-box">
						<a href={this.state.urls[0]} target="_blank" rel="noopener noreferrer">{this.state.urls[0]}</a>
						<CopyToClipboard onCopy={()=> this.handleURLCopy(this.state.urls[0])} text={this.state.urls[0]}>
							<button className="api-page-float-button"><img src={enabledCopyCodeButton} alt="Copy" /></button>
						</CopyToClipboard>
					</div>
				</div>

				{/*<div className="api-topic-wrapper">*/}
					{/*<h3>Code Snippet</h3>*/}
					{/*<p className="api-page-paragraph">Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</p>*/}
					{/*<div className="code-snippet api-page-code-box">*/}
						{/*<span dangerouslySetInnerHTML={{ __html : this.state.codes[0].html }} />*/}
						{/*<CopyToClipboard onCopy={()=> this.handleCodeCopy(this.state.codes[0].syntax)} text={this.state.codes[0].syntax}>*/}
							{/*<button className="api-page-float-button"><img src={enabledCopyCodeButton} alt="Copy" /></button>*/}
						{/*</CopyToClipboard>*/}
					{/*</div>*/}
				{/*</div>*/}

				<div className="updated-timestamp">Last Updated: 10-13-2018</div>
			</div>
		);
	}
}

export default APIPage;

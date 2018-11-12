
import React, { Component } from 'react';
import './APIPage.css';

import CopyToClipboard from 'react-copy-to-clipboard';
import { Row } from 'simple-flexbox';

class APIPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			codes : [{
				html   : '#block {<br>&nbsp;&nbsp;width: 100%;<br>&nbsp;&nbsp;color: #ffffff;<br>}',
				syntax : '#block {width: 100%; color: #ffffff;}'
			}],
			urls  : [
				'https://www.github.com/de-ai'
			]
		};
	}

	handleCodeCopy = (code)=> {
		window.alert('Code copied to clipboard!');
	};

	handleURLCopy = (url)=> {
		window.alert('URL copied to clipboard!');
	};

	render() {
		return (
			<div className="page-wrapper api-page-wrapper">
				<div className="page-header">
					<Row horizontal="center"><h1>Developer API</h1></Row>
					<div className="page-header-text">Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along.</div>
					<Row horizontal="center">
						<button className="adjacent-button" onClick={()=> window.open('https://www.github.com/de-ai')}>Github</button>
						<button className="adjacent-button" onClick={()=> window.open('https://join.slack.com/t/designengineai/shared_invite/enQtMzE5ODE0MTA0MzA5LWM2NzcwNTRiNjQzMTAyYTEyNjQ1MjE5NmExNDM1MzAyNWZjMTA0ZWIwNTdmZjYyMjc2M2ExNjAyYWFhZDliMzA')}>Slack</button>
						<button onClick={()=> window.open('https://spectrum.chat/designengine')}>Spectrum</button>
					</Row>
				</div>

				<div className="api-topic-wrapper">
					<h4>Project</h4>
					<p className="api-page-paragraph">Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</p>
					<div className="api-page-url-box">
						<a href={this.state.urls[0]} target="_blank" rel="noopener noreferrer">{this.state.urls[0]}</a>
						<CopyToClipboard onCopy={()=> this.handleURLCopy()} text={this.state.urls[0]}>
							<button className="api-page-float-button"><img src="/images/copy-code.svg" alt="Copy" /></button>
						</CopyToClipboard>
					</div>
				</div>

				<div className="api-topic-wrapper">
					<h4>Pages</h4>
					<p className="api-page-paragraph">Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</p>
					<div className="api-page-url-box">
						<a href={this.state.urls[0]} target="_blank" rel="noopener noreferrer">{this.state.urls[0]}</a>
						<CopyToClipboard onCopy={()=> this.handleURLCopy()} text={this.state.urls[0]}>
							<button className="api-page-float-button"><img src="/images/copy-code.svg" alt="Copy" /></button>
						</CopyToClipboard>
					</div>
				</div>

				<div className="api-topic-wrapper">
					<h4>Artboards</h4>
					<p className="api-page-paragraph">Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</p>
					<div className="api-page-url-box">
						<a href={this.state.urls[0]} target="_blank" rel="noopener noreferrer">{this.state.urls[0]}</a>
						<CopyToClipboard onCopy={()=> this.handleURLCopy(this.state.urls[0])} text={this.state.urls[0]}>
							<button className="api-page-float-button"><img src="/images/copy-code.svg" alt="Copy" /></button>
						</CopyToClipboard>
					</div>
				</div>

				<div className="api-topic-wrapper">
					<h4>Code Snippet</h4>
					<p className="api-page-paragraph">Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</p>
					<div className="code-snippet api-page-code-box">
						<span dangerouslySetInnerHTML={{ __html : this.state.codes[0].html }} />
						<CopyToClipboard onCopy={()=> this.handleCodeCopy(this.state.codes[0].syntax)} text={this.state.codes[0].syntax}>
							<button className="api-page-float-button"><img src="/images/copy-code.svg" alt="Copy" /></button>
						</CopyToClipboard>
					</div>
				</div>
			</div>
		);
	}
}

export default APIPage;

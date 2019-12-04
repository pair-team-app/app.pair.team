
import React, { Component } from 'react';
import './DocsPage.css';

import { Browsers } from 'lang-js-utils';

import BasePage from '../BasePage';
import pageContent from '../../../assets/json/content-docs-page';
import SectionExpander from '../../iterables/SectionExpander';
import { trackEvent } from '../../../utils/tracking';

class DocsPage extends Component {
	constructor(props) {
		super(props);

		const { title, intro, sections } = (Browsers.isMobile.ANY()) ? pageContent.mobile : pageContent.desktop;
		this.state = { title, intro,
			sections : sections.map((section, i)=> ({ ...section,
				ind : i
			}))
		};
	}


	handleToggleSection = (section)=> {
// 		console.log('%s.handleToggleSection()', this.constructor.name, section, this.state.sections.map((section)=> (section.open)));
		trackEvent((section.open) ? 'collapse' : 'expand', section.event);

		const sections = this.state.sections.map((item, i)=> ({ ...item,
			open : (i === section.ind) ? !item.open : item.open
		}));
		this.setState({ sections });
	};

	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { title, intro, sections } = this.state;
		return (
			<BasePage className="docs-page">
				<h1 dangerouslySetInnerHTML={{ __html : title }} />
				<div className="page-intro-text docs-page-into-text">
					<p dangerouslySetInnerHTML={{ __html : intro }} />
				</div>

				<div className="page-content-wrapper docs-page-content-wrapper">
					<div className="page-section-wrapper docs-page-section-wrapper">
						{(sections.map((section, i)=> {
							return (<SectionExpander
								key={i}
								section={section}
								title={<FeaturesPageSectionHeader section={section} onToggle={this.handleToggleSection} />}>
								<span dangerouslySetInnerHTML={{ __html : section.content }} />
							</SectionExpander>);
						}))}
					</div>
				</div>
			</BasePage>
		);
	}
}


const FeaturesPageSectionHeader = (props)=> {
	const { section } = props;
	return (<div className="docs-page-section-title">
		<h2 onClick={()=> props.onToggle(section)}>{section.header}</h2>
	</div>);
};


export default (DocsPage);

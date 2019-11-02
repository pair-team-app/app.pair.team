
import React, { Component } from 'react';
import './PricingPage.css';

import { Browsers } from 'lang-js-utils';

import BasePage from '../BasePage';
import SectionExpander from '../../iterables/SectionExpander';
import pageContent from '../../../assets/json/content-pricing-page';
import { Modals } from '../../../consts/uris';
import { trackEvent } from '../../../utils/tracking';

class PricingPage extends Component {
	constructor(props) {
		super(props);

		const { title, intro, sections } = (Browsers.isMobile.ANY()) ? pageContent.mobile : pageContent.desktop;
		this.state = { title, intro,
			sections : sections.map((section, i)=> ({ ...section,
				ind : i
			}))
		};
	}

	handleSelectSection = (section)=> {
// 		console.log('%s.handleSelectSection()', this.constructor.name, section);
		trackEvent('button', section.event);
		this.props.onModal(Modals.STRIPE);
// 		const sectionOpened = this.state.sectionOpened.map((toggle, i)=> (i === section.ind));
// 		this.setState({ sectionOpened }, ()=> {
// 			this.props.onModal(Modals.STRIPE);
// 		});
	};

	handleToggleSection = (section)=> {
// 		console.log('%s.handleToggleSection()', this.constructor.name, section, this.state.sectionOpened, this.state.sectionOpened[section.ind]);
// 		console.log('%s.handleToggleSection()', this.constructor.name, section, this.state.sections);
		trackEvent((section.open) ? 'collapse' : 'expand', section.event);

		const sections = this.state.sections.map((item, i)=> ({ ...item,
			open : (i === section.ind) ? !section.open : false
		}));
		this.setState({ sections });
	};

	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { title, intro, sections } = this.state;
		return (
			<BasePage className="pricing-page-wrapper">
				<h1 dangerouslySetInnerHTML={{ __html : title }} />
				<div className="page-intro-text features-page-into-text">
					<p dangerouslySetInnerHTML={{ __html : intro }} />
				</div>

				<div className="page-content-wrapper pricing-page-content-wrapper">
					<div className="page-section-wrapper pricing-page-section-wrapper">
						{(sections.map((section, i)=> {
							return (<SectionExpander
								key={i}
								section={section}
								title={<PricingPageSectionHeader section={section} onToggle={this.handleToggleSection} onSelect={this.handleSelectSection} />}>
								<span dangerouslySetInnerHTML={{ __html : section.content }} />
							</SectionExpander>);
						}))}
					</div>
				</div>
			</BasePage>
		);
	}
}


const PricingPageSectionHeader = (props)=> {
	const { section } = props;

	return (<div className="pricing-page-section-title">
		<h2 onClick={(event)=> props.onToggle(section)}>{section.header}</h2>
		{(!Browsers.isMobile.ANY()) && (<button disabled={true} className="quiet-button" onClick={(event)=> props.onSelect(section)}>Coming Soon</button>)}
	</div>);
};


export default (PricingPage);

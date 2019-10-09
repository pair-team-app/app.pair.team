
import React, { Component } from 'react';
import './PricingPage.css';

import { Browsers } from 'lang-js-utils';

import BasePage from '../BasePage';
import SectionExpander from '../../iterables/SectionExpander';
import pageContent from '../../../assets/json/content-pricing-page';
import { Modals } from '../../../consts/uris';

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
// 		console.log(this.constructor.name, '.handleSelectSection()', section);
		this.props.onModal(Modals.STRIPE, true);
// 		const sectionOpened = this.state.sectionOpened.map((toggle, i)=> (i === section.ind));
// 		this.setState({ sectionOpened }, ()=> {
// 			this.props.onModal(Modals.STRIPE, true);
// 		});
	};

	handleToggleSection = (section)=> {
// 		console.log(this.constructor.name, '.handleToggleSection()', section, this.state.sectionOpened, this.state.sectionOpened[section.ind]);
		console.log(this.constructor.name, '.handleToggleSection()', section, this.state.sections);

		const sections = this.state.sections.map((item, i)=> ({ ...item,
			open : (i === section.ind) ? !section.open : false
		}));
		this.setState({ sections });
	};

	render() {
// 		console.log(this.constructor.name, '.render()', this.props, this.state);

		const { title, intro, sections } = this.state;
		return (
			<BasePage className="pricing-page-wrapper">
				<h1 dangerouslySetInnerHTML={{ __html : title }} />
				<div className="page-intro-text features-page-into-text">
					<p>{intro}</p>
				</div>

				<div className="page-content-wrapper pricing-page-content-wrapper">
					<div className="page-section-wrapper pricing-page-section-wrapper">
						{(sections.map((section, i)=> {
							return (<SectionExpander
								key={i}
								section={section}
								title={<PricingPageSectionHeader section={section} onToggle={this.handleToggleSection} onSelect={this.handleSelectSection} />}>
								{section.content}
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
		{(!Browsers.isMobile.ANY()) && (<button className="quiet-button" onClick={(event)=> props.onSelect(section)}>Select</button>)}
	</div>);
};


export default (PricingPage);

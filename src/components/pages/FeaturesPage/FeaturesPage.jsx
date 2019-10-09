
import React, { Component } from 'react';
import './FeaturesPage.css';

import { Browsers } from 'lang-js-utils';

import BasePage from '../BasePage';
import pageContent from '../../../assets/json/content-features-page';
import SectionExpander from '../../iterables/SectionExpander';


class FeaturesPage extends Component {
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
		console.log(this.constructor.name, '.handleToggleSection()', section, this.state.sections);

		const sections = this.state.sections.map((item, i)=> ({ ...item,
			open : (i === section.ind) ? !section.open : false
		}));
		this.setState({ sections });
	};

	render() {
		console.log(this.constructor.name, '.render()', this.props, this.state);

		const { title, intro, sections } = this.state;
		return (
			<BasePage className="features-page-wrapper">
				<h1 dangerouslySetInnerHTML={{ __html : title }} />
				<div className="page-intro-text features-page-into-text">
					<p>{intro}</p>
				</div>

				<div className="page-content-wrapper features-page-content-wrapper">
					<div className="page-section-wrapper features-page-section-wrapper">
						{(sections.map((section, i)=> {
							return (<SectionExpander
								key={i}
								section={section}
								title={<FeaturesPageSectionHeader section={section} onToggle={this.handleToggleSection} />}>
									{section.content}
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
	return (<div className="features-page-section-title">
		<h2 onClick={(event)=> props.onToggle(section)}>{section.header}</h2>
	</div>);
};


export default (FeaturesPage);

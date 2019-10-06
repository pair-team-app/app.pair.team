
import React, { Component } from 'react';
import './PricingPage.css';

import BasePage from '../BasePage';
import SectionExpander from '../../iterables/SectionExpander';
import { Modals } from '../../../consts/uris';


class PricingPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			sectionOpened : [
				false,
				false,
				false
			]
		};
	}

	componentDidMount() {
// 		console.log(this.constructor.name, '.componentDidMount()', this.props, this.state);
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log(this.constructor.name, '.componentDidUpdate()', prevProps, this.props, prevState, this.state);
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
		const sectionOpened = this.state.sectionOpened.map((toggle, i)=> (i === section.ind) ? !toggle : false);
		this.setState({ sectionOpened });
	};

	render() {
// 		console.log(this.constructor.name, '.render()', this.props, this.state);

		const { sectionOpened } = this.state;
		return (
			<BasePage className="pricing-page-wrapper">
				<h1>Pricing</h1>
				<div className="pricing-page-text">
					<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut felis nibh, lacinia a ullamcorper eget, lacinia nec arcu. Donec condimentum porttitor arcu, sed porta lectus venenatis at. Nunc commodo sagittis libero, ut malesuada turpis vulputate vel. Pellentesque accumsan urna in tortor pharetra fringilla. Phasellus hendrerit a felis in facilisis. Morbi sagittis feugiat sapien id mollis.</p>
				</div>

				<div className="pricing-page-section-wrapper">
					<SectionExpander
						open={sectionOpened[0]}
						title={<PricingPageSectionTitle title="Team $7" section={{ ind : 0 }} onToggle={this.handleToggleSection} onSelect={this.handleSelectSection} />}
						onToggle={()=> this.handleToggleSection({ ind : 0 })}>
						Cras eu fringilla felis, at ullamcorper dolor. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Duis pharetra porta neque, ac pellentesque mauris sodales quis. Nam nec vehicula odio. Phasellus a augue enim. Ut tincidunt quam in erat accumsan elementum. Nullam maximus varius fermentum.
					</SectionExpander>

					<SectionExpander
						open={sectionOpened[1]}
						title={<PricingPageSectionTitle title="Designers $17" section={{ ind : 1 }} onToggle={this.handleToggleSection} onSelect={this.handleSelectSection} />}
						onToggle={()=> this.handleToggleSection({ ind : 1 })}>
						Etiam rhoncus quam eros, efficitur viverra est molestie nec. Donec facilisis accumsan turpis, ac iaculis mi aliquet id. Morbi viverra sagittis porttitor. Vivamus erat sem, imperdiet eu erat at, pharetra condimentum nibh. Proin lobortis dolor et erat consequat pellentesque. Fusce ultricies mi in risus porta, ac mattis eros luctus. Aliquam augue purus, ultricies et nisi sit amet, volutpat rhoncus purus. Praesent eu sollicitudin nisl.
					</SectionExpander>

					<SectionExpander
						open={sectionOpened[2]}
						title={<PricingPageSectionTitle title="Developer $29" section={{ ind : 2 }} onToggle={this.handleToggleSection} onSelect={this.handleSelectSection} />}
						onToggle={()=> this.handleToggleSection({ ind : 2 })}>
						Sed tempus tortor arcu, a auctor justo finibus sit amet. Integer ac lorem diam. Praesent varius convallis enim. Sed accumsan pharetra quam ac accumsan. Vivamus sit amet massa metus. Sed laoreet consequat tincidunt. Aliquam nec egestas augue. Etiam ac ultrices mauris. Fusce est lectus, egestas vel volutpat mattis, faucibus quis nibh.
					</SectionExpander>
				</div>
			</BasePage>
		);
	}
}


const PricingPageSectionTitle = (props)=> {
	const { title, section } = props;

	return (<div className="pricing-page-section-title">
		<h2 onClick={(event)=> props.onToggle(section)}>{title}</h2>
		<button className="quiet-button" onClick={(event)=> props.onSelect(section)}>Select</button>
	</div>);
};


export default (PricingPage);

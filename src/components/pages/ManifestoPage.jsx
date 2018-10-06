
import React, { Component } from 'react';
import './ManifestoPage.css';

import { Column, Row } from 'simple-flexbox';

class ManifestoPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		return (
			<div className="manifesto-page-wrapper">
				<Row vertical="start">
					<Column flexGrow={1} horizontal="center">
						<Row horizontal="center"><div className="step-header-text">Our Design AI<br />Manifesto</div></Row>
						<div>
							<Row><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam luctus vitae massa id porta. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Quisque posuere, elit et pharetra egestas, ligula tellus fermentum purus, at lacinia nisi nibh et libero. Maecenas tristique nulla id lorem semper, non feugiat velit consectetur. Maecenas tristique enim sit amet luctus malesuada. Sed non nunc laoreet, fringilla metus sit amet, scelerisque dolor. Praesent nec dui vulputate libero ultricies condimentum.</p></Row>
							<Row><img src="/images/manifesto.png" className="manifesto-image" alt="Manifesto Garage" /></Row>
							<Row><p>Vestibulum suscipit sem odio, quis interdum purus pharetra at. Aliquam dictum blandit ex ultricies convallis. Quisque venenatis lacus vitae nibh aliquet aliquet. Curabitur ut lacinia dolor. Pellentesque rutrum, nulla auctor laoreet euismod, nisl lorem aliquam lorem, pellentesque interdum felis mauris nec turpis. Ut condimentum, nibh gravida congue pharetra, nibh felis malesuada odio, at tempus tortor risus quis orci. Aenean nisi nulla, mollis eget rutrum ultrices, efficitur eget orci. Nam nec diam pharetra, rhoncus massa id, commodo metus. Mauris accumsan nunc et efficitur accumsan. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam erat volutpat. Aliquam efficitur vulputate purus in volutpat.</p></Row>
							<Row><p>Nullam in massa et nisl posuere tempor non et enim. Morbi erat sem, consectetur vel posuere sit amet, gravida dignissim tellus. Proin feugiat lorem non ante sollicitudin vestibulum. Ut nisl sem, pulvinar tincidunt dui sed, dignissim elementum magna. Donec non fringilla elit. Mauris pretium purus at lacinia sollicitudin. Donec eleifend, ex eget tempus facilisis, nulla lorem scelerisque urna, at ullamcorper ex arcu sed tellus. Maecenas cursus venenatis nisi nec hendrerit. Fusce eget diam et metus dignissim scelerisque quis sed erat. Nam augue mauris, commodo ut ex sit amet, placerat condimentum libero. Mauris faucibus ipsum in metus mollis, in tristique nunc imperdiet. Vestibulum lobortis dictum nulla, at placerat dolor pretium nec. Nulla dapibus mauris ac semper luctus. Morbi lacinia ligula a mi pulvinar lobortis. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur scelerisque quis justo rhoncus blandit.</p></Row>
							<Row><p>Nulla sagittis mi est, sed vulputate metus feugiat nec. Curabitur vel elit eget nulla porta molestie ut id augue. Nam eu orci et nulla sodales sodales. Curabitur tincidunt leo ante, sit amet ultrices risus egestas at. Morbi suscipit nulla nulla, ut vulputate nisl rhoncus et. Phasellus sit amet rutrum nunc. Vestibulum vel sapien tortor. Sed sed sodales enim. Fusce congue non enim nec volutpat. Donec iaculis gravida sem vitae interdum. Suspendisse mauris sem, fermentum tempus hendrerit ac, pharetra eget mauris. Sed tristique lorem sed fringilla fermentum.</p></Row>
							<Row><p>Proin id erat odio. Phasellus ornare eros ante, a facilisis neque blandit ut. In consectetur eu ex quis dapibus. Pellentesque a sollicitudin tortor. Nam hendrerit erat tellus, sed elementum diam porttitor eu. Proin consectetur sodales pharetra. Etiam rhoncus ultricies fermentum.</p></Row>
						</div>
					</Column>
				</Row>
			</div>
		);
	}
}

export default ManifestoPage;

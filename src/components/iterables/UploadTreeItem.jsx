
import React, { Component } from 'react';
import './UploadTreeItem.css';

import { Row } from 'simple-flexbox';

import { isInspectorPage, limitString } from '../../utils/funcs';
import sketchIcon from '../../images/icons/ico-sketch.png';

const UPLOAD_CHAR_LIMIT = 26;
const CATEGORY_CHAR_LIMIT = 23;
const INNER_CHAR_LIMIT = 20;


function CategoryTreeItem(props) {
	const textClass = (props.selected) ? 'tree-item-text tree-item-text-selected' : 'tree-item-text';

	return (
		<div className="category-tree-item">
			<div className={textClass} onClick={()=> props.onClick()}>{limitString(props.title, CATEGORY_CHAR_LIMIT)}</div>
			{(props.selected) && (<div className="category-tree-item-list">
				{props.items.map((item, i)=> {
					return (
						<InnerTreeItem
							key={item.id}
							title={item.title}
							selected={item.selected}
							onClick={()=> props.onInnerClick(props.id, item)} />
					);
				})}
			</div>)}
		</div>
	);
}


function InnerTreeItem(props) {
	const textClass = (props.selected) ? 'tree-item-text tree-item-text-selected' : 'tree-item-text';

	return (
		<div className="inner-tree-item">
			<div className={textClass} onClick={()=> props.onClick()}>{limitString(props.title, INNER_CHAR_LIMIT)}</div>
		</div>
	);
}


class UploadTreeItem extends Component {
	constructor(props) {
		super(props);

		this.state = {
			categories : [{
				id       : 1,
				title    : 'Fonts',
				selected : (window.location.pathname.split('/').pop() === 'fonts'),
				items    : props.fonts
			}, {
				id       : 2,
				title    : 'Colors',
				selected : (window.location.pathname.split('/').pop() === 'colors'),
				items    : props.colors
			}, {
				id       : 3,
				title    : 'Symbols',
				selected : (window.location.pathname.split('/').pop() === 'symbols'),
				items    : props.symbols
			}, {
				id       : 4,
				title    : 'Views',
				selected : (window.location.pathname.split('/').pop() === 'views' || isInspectorPage()),
				items    : props.pages
			}, {
				id       : 5,
				title    : 'Contributors',
				selected : (window.location.pathname.split('/').pop() === 'contributors'),
				items    : props.contributors
			}]
		};
	}

	static getDerivedStateFromProps(nextProps) {
		return ({ title : limitString(nextProps.title, UPLOAD_CHAR_LIMIT) });
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		//console.log('UploadTreeItem.componentDidUpdate()', prevProps, this.props, prevState, this.state, snapshot);

		if (prevProps.fonts !== this.props.fonts) {
			let categories = [...this.state.categories];
			categories.forEach((category)=> {
				if (category.id === 1) {
					category.items = this.props.fonts;
				}
			});

			this.setState({ categories });
		}

		if (prevProps.colors !== this.props.colors) {
			let categories = [...this.state.categories];
			categories.forEach((category)=> {
				if (category.id === 2) {
					category.items = this.props.colors;
				}
			});

			this.setState({ categories });
		}

		if (prevProps.symbols !== this.props.symbols) {
			let categories = [...this.state.categories];
			categories.forEach((category)=> {
				if (category.id === 3) {
					category.items = this.props.symbols;
				}
			});

			this.setState({ categories });
		}

		if (prevProps.pages !== this.props.pages) {
			let categories = [...this.state.categories];
			categories.forEach((category)=> {
				if (category.id === 4) {
					category.items = this.props.pages;
				}
			});

			this.setState({ categories });
		}

		if (prevProps.contributors !== this.props.contributors) {
			let categories = [...this.state.categories];
			categories.forEach((category)=> {
				if (category.id === 5) {
					category.items = this.props.contributors;
				}
			});

			this.setState({ categories });
		}
	}

	handleClick = ()=> {
		console.log('UploadTreeItem.handleClick()');
		let categories = [...this.state.categories];
		categories.forEach((category)=> {
			category.selected = false;//(category.id === 4);
			category.items.forEach((item)=> {
				item.selected = false;
			});
		});

		this.props.onClick();
		this.setState({ categories });
	};

	handleCategoryClick = (category)=> {
		console.log('UploadTreeItem.handleCategoryClick()', category);
		let categories = [...this.state.categories];
		categories.forEach((item)=> {
			if (category.id === item.id) {
				item.selected = !item.selected;

			} else {
				item.selected = false;
				item.items.forEach((i)=> {
					i.selected = false;
				});
			}

			if (!item.selected) {
				item.items.forEach((i)=> {
					i.selected = false;
				});

			} else {
// 				if (category.id === 4 && !isInspectorPage()) {
					this.props.onCategoryClick(category);
// 				}
			}
		});


		this.setState({ categories });
	};

	handleInnerClick = (id, item)=> {
		console.log('UploadTreeItem.handleInnerClick()', id, item);
		item.selected = !item.selected;

		if (id === 1) {
			this.props.onFontClick(item);

		} else if (id === 2) {
			this.props.onColorClick(item);

		} else if (id === 3) {
			this.props.onSymbolClick(item);

		} else if (id === 4) {
			this.props.onPageClick(item);

		} else if (id === 5) {
			this.props.onContributorClick(item);
		}
	};

	render() {
		//console.log('UploadTreeItem.render()',this.props, this.state);

		const { selected } = this.props;
		const { title, categories } = this.state;

		const textClass = (selected) ? 'tree-item-text tree-item-text-selected' : 'tree-item-text';

		return (
			<div className="upload-tree-item">
				<Row vertical="center">
					<img src={sketchIcon} className="upload-tree-item-icon" alt="Icon" />
					<div className={textClass} onClick={()=> this.handleClick()}>{title}</div>
				</Row>
				{(selected) && (<div className="upload-tree-item-list">
					{categories.map((category, i)=> {
						return (
							<CategoryTreeItem
								key={category.id}
								id={category.id}
								title={category.title}
								items={category.items}
								selected={category.selected}
								onClick={()=> this.handleCategoryClick(category)}
								onInnerClick={(id, item)=> this.handleInnerClick(id, item)}
							/>
						);
					})}
				</div>)}
			</div>
		);
	}
}

export default UploadTreeItem;

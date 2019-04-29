
import React from  'react';
import axios from  'axios';

import { API_ENDPT_URL } from '../../../../../consts/uris';

import { CANVAS, SECTIONS } from '../consts';
import { toBootstrap, toCSS, toGridHTML, toReactJS } from './code-generator';
import { fillGroupPartItemSlices, intersectSlices } from './model';


import inspectorTabSets from  '../../../../../assets/json/inspector-tab-sets';

export function resetTabSets(upload, artboards) {
// 		console.log('InspectorPage.resetTabSets()', upload, artboards);

	const { section  } = this.state;
	let tabSets = inspectorTabSets[section];
	if (section === SECTIONS.INSPECT) {
		tabSets = [...tabSets].map((tabSet, i) => {
			if (i === 0) {
				return (tabSet);

			} else {
				return (tabSet.map((tab, ii) => {
					return ((ii === 0) ? Object.assign({}, tab, {
						type     : 'component',
						enabled  : ((upload.state << 0) === 3),
						contents : <SpecsList
							upload={upload}
							slice={null}
							creatorID={0}
							onCopySpec={(msg) => this.handleClipboardCopy('spec', msg)}
						/>
					}) : tab);
				}));
			}
		});

		const activeTabs = (this.state.activeTabs.length === 0) ? tabSets.map((tabSet)=> {
			return ([...tabSet].shift());
		}) : this.state.activeTabs;

		this.setState({ tabSets, activeTabs,
			artboard    : (section === SECTIONS.EDIT && artboards.length > 0) ? artboards[0] : null,
			slice       : null,
			offset      : null,
			hoverSlice  : null,
			hoverOffset : null,
			tooltip     : null,
			linter      : null,
			gist        : null
		});

	} else if (section === SECTIONS.PARTS) {
		tabSets = [...tabSets].map((tabSet, i) => {
			return (tabSet.map((tab, ii) => {
				return (Object.assign({}, tab, {
					enabled  : ((upload.state << 0) === 3),
					contents : <PartsList
						enabled={((upload.state << 0) === 3)}
						contents={null}
						onPartListItem={(slice) => this.handleDownloadPartListItem(slice)} />
				}));
			}));
		});

		const activeTabs = (this.state.activeTabs.length === 0) ? tabSets.map((tabSet)=> {
			return ([...tabSet].shift());
		}) : this.state.activeTabs;

		this.setState({ upload, tabSets, activeTabs,
			artboard : (section === SECTIONS.EDIT && artboards.length > 0) ? artboards[0] : null,
			slice    : null,
			tooltip  : null,
			linter   : null,
			gist     : null
		});

	} else if (section === SECTIONS.EDIT) {
		if (artboards.length > 0) {
			const artboard = (this.state.artboard) ? this.state.artboard : artboards[0];

			let formData = new FormData();
			formData.append('action', 'ARTBOARD_SLICES');
			formData.append('artboard_id', artboard.id);
			axios.post(API_ENDPT_URL, formData)
				.then((response)=> {
					console.log('ARTBOARD_SLICES', response.data);
					artboard.slices = response.data.slices.map((slice)=> {
						const meta = JSON.parse(slice.meta.replace(/\n/g, '\\\\n'));
						return (Object.assign({}, slice, {
							id         : slice.id << 0,
							artboardID : slice.artboard_id << 0,
							meta       : Object.assign({}, meta, {
								orgFrame : meta.frame,
								frame    : (slice.type === 'textfield') ? meta.vecFrame : meta.frame
							}),
							filled     : false,
							children   : []
						}));
					});

					upload.pages = upload.pages.map((page)=> (Object.assign({}, page, {
						artboards : page.artboards.map((item)=> ((item.id === artboard.id) ? artboard : item))
					})));

					const slices = [...intersectSlices(artboard.slices, artboard.meta.frame)];

					const langs = [
						toGridHTML(slices),
						toReactJS(slices),
// 							toSwift(slices, artboard),
						toCSS(slices),
// 							toAndroid(slices, artboard),
						toBootstrap(slices)
					];

					tabSets = [...tabSets].map((tabSet, i) => {
						return (tabSet.map((tab, ii) => {
							if (i === 0) {
								return (Object.assign({}, tab, {
									type     : 'component',
									enabled  : ((upload.state << 0) === 3),
									contents : <CodeEditor lang={tab.lang} syntax={langs[ii].syntax} onEditorChange={this.handleEditorChange} onEditorMounted={this.handleEditorMounted} />,
									syntax   : langs[ii].syntax,
									html     : langs[ii].html
								}));

							} else {
								return (Object.assign({}, tab, {
									enabled  : ((upload.state << 0) === 3),
									contents : <div>Nothing to compile</div>
								}));
							}
						}));
					});

					const activeTabs = tabSets.map((tabSet)=> {
						return ([...tabSet].shift());
					});

// 						console.log(':::::::::::: reset', tabSets, activeTabs);

					this.setState({ upload, tabSets, activeTabs, artboard,
						slice     : [...slices].shift(),
						offset    : artboard.meta.frame.origin,
						tooltip   : null,
						linter    : null,
						gist      : null
					});

					if (!this.canvasInterval) {
						this.canvasInterval = setInterval(()=> this.onCanvasInterval(), CANVAS.marchingAnts.interval);
					}

				}).catch((error)=> {
			});
		}
	}
}

export function replaceTabSets(artboard, slice, offset) {
// 		console.log('InspectorPage.replaceTabSets()', artboard, slice, offset);

	const { profile } = this.props;
	const { section, upload } = this.state;
	let tabSets = [...this.state.tabSets];

	const slices = [...intersectSlices(artboard.slices, slice.meta.frame)];
	const langs = [
		toGridHTML(slices),
		toReactJS(slices),
// 			toSwift(slices, artboard),
		toCSS(slices),
// 			toAndroid(slices, artboard),
		toBootstrap(slices)
	];

	if (section === SECTIONS.INSPECT) {
		tabSets = [...this.state.tabSets].map((tabSet, i)=> {
			if (i === 1) {
				return (tabSet.map((tab, ii)=> {
					return ((ii === 0) ? Object.assign({}, tab, {
						enabled  : true,
						contents : <SpecsList
							upload={upload}
							slice={slice}
							creatorID={(profile) ? profile.id : 0}
							onCopySpec={(msg)=> this.handleClipboardCopy('spec', msg)}
						/>
					}) : tab);
				}));

			} else {
				return (tabSet.map((tab, ii)=> {
					return (Object.assign({}, tab, {
						enabled  : true,
						contents : <CodeEditor lang={tab.lang} syntax={langs[ii].syntax} onEditorChange={this.handleEditorChange} onEditorMounted={this.handleEditorMounted} />,
						syntax   : langs[ii].syntax,
						html     : langs[ii].html
					}));
				}));
			}
		});

	} else if (section === SECTIONS.PARTS) {
		tabSets[0][0].enabled = true;

		if (slice.type === 'symbol') {
			let formData = new FormData();
			formData.append('action', 'SYMBOL_SLICES');
			formData.append('slice_id', slice.id);
			axios.post(API_ENDPT_URL, formData)
				.then((response)=> {
					console.log('SYMBOL_SLICES', response.data);
					slice.children = [...fillGroupPartItemSlices(upload, slice), ...response.data.slices.map((item)=> {
						const meta = JSON.parse(item.meta.replace(/\n/g, '\\\\n'));
						return (Object.assign({}, item, {
							id         : item.id << 0,
							artboardID : item.artboard_id << 0,
							meta       : Object.assign({}, meta, {
								orgFrame : meta.frame,
								frame    : (slice.type === 'textfield') ? meta.vecFrame : meta.frame
							}),
							filled     : false
						}))
					})];
					tabSets[0][0].enabled = true;
					tabSets[0][0].contents = <PartsList
						enabled={true}
						contents={slice.children}
						onPartListItem={(slice)=> this.handleDownloadPartListItem(slice)} />;
					this.setState({ tabSets });
				}).catch((error)=> {
			});

		} else if (slice.type === 'artboard' || slice.type === 'group' || slice.type === 'background') {
			tabSets[0][0].enabled = true;
			tabSets[0][0].contents = <PartsList
				enabled={true}
				contents={fillGroupPartItemSlices(upload, slice)}
				onPartListItem={(slice)=> this.handleDownloadPartListItem(slice)} />;
			this.setState({ tabSets });
		}

	} else if (section === SECTIONS.EDIT) {
		tabSets = [...this.state.tabSets].map((tabSet, i)=> {
			return (tabSet.map((tab, ii)=> {
				if (i === 0) {
					return (Object.assign({}, tab, {
						enabled  : true,
						contents : <CodeEditor lang={tab.lang} syntax={langs[ii].syntax} onEditorChange={this.handleEditorChange} onEditorMounted={this.handleEditorMounted} />,
						syntax   : langs[ii].syntax,
						html     : langs[ii].html
					}));

				} else {
					return (Object.assign({}, tab, {
						enabled  : true,
						contents : <div>Nothing to compile</div>
					}));
				}
			}));
		});
	}

	const activeTabs = [...this.state.activeTabs].map((activeTab, i)=> {
		const tab = tabSets[i].find((item)=> (item.id === activeTab.id));
		return ((tab) ? tab : activeTab);
	});

// 		console.log(':::::::::::: replace', tabSets, activeTabs);

	this.setState({ upload, artboard, tabSets, activeTabs,
		linter : null,
		gist   : null
	});
}

export function restoreTabSets(upload, artboard, slice) {
// 		console.log('InspectorPage.restoreTabSets()', upload, artboard, slice);

	const { profile } = this.props;
	const { section } = this.state;
	let tabSets = [...this.state.tabSets];
// 		let activeTabs = [...this.state.activeTabs];

	const slices = [...intersectSlices(artboard.slices, slice.meta.frame)];
	const langs = [
		toGridHTML(slices),
		toReactJS(slices),
// 			toSwift(slices, artboard),
		toCSS(slices),
// 			toAndroid(slices, artboard),
		toBootstrap(slices)
	];

	if (section === SECTIONS.INSPECT) {
		tabSets = [...this.state.tabSets].map((tabSet, i)=> {
			if (i === 1) {
				return (tabSet.map((tab, ii)=> {
					return ((ii === 0) ? Object.assign({}, tab, {
						enabled  : true,
						contents : <SpecsList
							upload={upload}
							slice={slice}
							creatorID={(profile) ? profile.id : 0}
							onCopySpec={(msg)=> this.handleClipboardCopy('spec', msg)}
						/>
					}) : tab);
				}));

			} else {
				return (tabSet.map((tab, ii)=> {
					return (Object.assign({}, tab, {
						enabled  : true,
						contents : <CodeEditor lang={tab.lang} syntax={langs[ii].syntax} onEditorChange={this.handleEditorChange} onEditorMounted={this.handleEditorMounted} />,
						syntax   : langs[ii].syntax,
						html     : langs[ii].html
					}));
				}));
			}
		});

	} else if (section === SECTIONS.PARTS) {
		if (slice.type === 'symbol') {
			let formData = new FormData();
			formData.append('action', 'SYMBOL_SLICES');
			formData.append('slice_id', slice.id);
			axios.post(API_ENDPT_URL, formData)
				.then((response)=> {
					console.log('SYMBOL_SLICES', response.data);
					slice.children = [...fillGroupPartItemSlices(upload, slice), ...response.data.slices.map((item)=> {
						const meta = JSON.parse(item.meta.replace(/\n/g, '\\\\n'));
						return (Object.assign({}, item, {
							id         : item.id << 0,
							artboardID : item.artboard_id << 0,
							meta       : Object.assign({}, meta, {
								orgFrame : meta.frame,
								frame    : (slice.type === 'textfield') ? meta.vecFrame : meta.frame
							}),
							filled     : false
						}));
					})];
					tabSets[0][0].enabled = true;
					tabSets[0][0].contents = <PartsList
						enabled={true}
						contents={slice.children}
						onPartListItem={(slice)=> this.handleDownloadPartListItem(slice)} />;
					this.setState({ tabSets });
				}).catch((error)=> {
			});

		} else if (slice.type === 'group' || slice.type === 'background') {
			tabSets[0][0].enabled = true;
			tabSets[0][0].contents = <PartsList
				enabled={true}
				contents={fillGroupPartItemSlices(upload, slice)}
				onPartListItem={(slice)=> this.handleDownloadPartListItem(slice)} />;
		}

	} else if (section === SECTIONS.EDIT) {
		tabSets = [...this.state.tabSets].map((tabSet, i)=> {
			return (tabSet.map((tab, ii)=> {
				if (i === 0) {
					return (Object.assign({}, tab, {
						enabled  : true,
						contents : <CodeEditor lang={tab.lang} syntax={langs[ii].syntax} onEditorChange={this.handleEditorChange} onEditorMounted={this.handleEditorMounted} />,
						syntax   : langs[ii].syntax,
						html     : langs[ii].html
					}));

				} else {
					return (Object.assign({}, tab, {
						enabled  : true,
						contents : <div>Nothing to compile</div>
					}));
				}
			}));
		});
	}

	const activeTabs = [...this.state.activeTabs].map((activeTab, i)=> {
		const tab = tabSets[i].find((item)=> (item.id === activeTab.id));
		return ((tab) ? tab : activeTab);
	});

// 		console.log(':::::::::::: restore', tabSets, activeTabs);

	this.setState({ artboard, tabSets, activeTabs,
		hoverSlice  : null,
		hoverOffset : null,
		linter      : null,
		gist        : null
	});
}

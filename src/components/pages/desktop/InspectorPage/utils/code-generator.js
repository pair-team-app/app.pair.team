
import { Colors, Objects, Strings, URIs } from '../../../../../utils/lang';

const TAB = '  ';
// const BAD_CHARS = /[\\/.,_+=:;\-#<>?|@$*&^%![\](){}©°`'"\d↳]/g;
const BAD_CHARS = /[\W_]+/gm;
const DISCLAIMER = '__LANG__ Generator v1.0,\nCode snippets by Design Engine.,\nMade in Mountain View, CA.\n__';


const findSubGroup = (layers, uuid)=> {
	if (layers) {
		for (let i=0; i<layers.length; i++) {
			if (layers[i].uuid === uuid) {
				return (layers[i]);
			}

			const group = findSubGroup(layers[i].layers, uuid);
			if (group) {
				return (group);
			}
		}
	}
};

const fontWeight = (style)=> {
	if (!style || typeof style === 'undefined') {
		return (400);
	}

	if (/thin/i.test(style)) {
		return (100);

	} else if (/(extra|ultra)light/i.test(style)) {
		return (200);

	} else if (/light/i.test(style)) {
		return (300);

	} else if (/book|normal/i.test(style)) {
		return (400);

	} else if (/medium/i.test(style)) {
		return (500);

	} else if (/(semi|demi)bold/i.test(style)) {
		return (600);

	} else if (/(ps)?bold(mt)?/i.test(style)) {
		return (700);

	} else if (/(extra|ultra)bold/i.test(style)) {
		return (800);

	} else if (/black|heavy/i.test(style)) {
		return (900);

	} else {
		return (400);
	}
};


const makeGroupJSX = (layers, slices, names, components, depth=0)=> {
// 	console.log('code-generator.makeGroupJSX()', layers, slices, names, components, depth);

	let syntax = {
		styled : '',
		comps  : []
	};

	if (slices[0].type === 'artboard' && depth === 0) {
		const comp = makeSliceJSX(slices[0], names, depth + 2);
		syntax.styled += comp.styled;
		syntax.comps += comp.comp;
	}

	layers.forEach((layer)=> {
// 		console.log(':::::::::', layer);

		if (Object.keys(layer).indexOf('layers') > -1) {
			const slice = slices.find((slice)=> (slice.uuid === layer.uuid));
// 			console.log(':::::::::', 'grp', slice);

			if (typeof slice !== 'undefined') {
				const unique = uniqueListNames(names, Strings.camelize(slice.title.toLowerCase().replace(BAD_CHARS, '').replace(/^(\d+)/gm, 'N_$1'), null, true));
				names = unique.names;
// 				const componentName = unique.name;
				const componentName = `${Strings.camelize(slice.title.toLowerCase().replace(BAD_CHARS, '').replace(/^(\d+)/gm, 'N_$1'), null, true)}_${slice.uuid.split('-').pop()}`;

				syntax.styled += `const ${componentName} = styled.div\`
  position: absolute;
  top: ${slice.meta.padding.top}px;
  left: ${slice.meta.padding.left}px;
  width: ${slice.meta.frame.size.width}px;
  height: ${slice.meta.frame.size.height}px;
  overflow: hidden;\`
`;

				let subLayers = null;
				if (Objects.hasKey(components, slice.uuid)) {
					const title = Strings.camelize(slice.title.toLowerCase().replace(BAD_CHARS, '').replace(/^(\d+)/gm, 'N_$1'), null, true);

					subLayers = {
						styled : `${components[slice.uuid].syntax.split('\n\n').shift().replace(title, `${title}_0`)}\n`,
						comps  : components[slice.uuid].syntax.split('\n\n').pop().replace('render(<div>', '').replace('</div>);', '').split(`<${title}`).join(`<${title}_0`).split(`/${title}`).join(`/${title}_0`)
					};

				} else {
					subLayers = makeGroupJSX(layer.layers, slices, names, components, depth + 1);
				}


				syntax.styled += subLayers.styled;
				syntax.comps += `<${componentName}>
  ${subLayers.comps}</${componentName}>
`;
			}

		} else {
			const slice = slices.find((slice)=> (slice.uuid === layer));
// 			console.log(':::::::::', 'layer', slice);

			if (typeof slice !== 'undefined') {
				let comp = null;

				if (Objects.hasKey(components, slice.uuid)) {
					//const title = Strings.camelize(slice.title.toLowerCase().replace(BAD_CHARS, '').replace(/^(\d+)/gm, 'N_$1'), null, true);

					comp = {
						styled : `${components[slice.uuid].syntax.split('\n\n').shift()}\n`,
						comp   : components[slice.uuid].syntax.split('\n\n').pop().replace('render(', '').replace(');', '')
					};

				} else {
					comp = makeSliceJSX(slice, names, depth + 2);
				}

				syntax.styled += comp.styled;
				syntax.comps += comp.comp;
			}
		}
	});

	return (syntax);
};


const makeSliceJSX = (slice, names, depth=0)=> {
// 	console.log('code-generator.makeSliceJSX()', slice, names, depth);

	let syntax = {
		styled : '',
		comp   : ''
	};

	const unique = uniqueListNames(names, Strings.camelize(slice.title.toLowerCase().replace(BAD_CHARS, '').replace(/^(\d+)/gm, 'N_$1'), null, true));
	names = unique.names;
// 	const componentName = unique.name;
	const componentName = `${Strings.camelize(slice.title.toLowerCase().replace(BAD_CHARS, '').replace(/^(\d+)/gm, 'N_$1'), null, true)}_${slice.uuid.split('-').pop()}`;

// 	console.log(':::::::::', slice.title, componentName);

	syntax.styled += `const ${componentName} = styled.${(slice.type === 'bitmap' || slice.type === 'svg') ? 'img' : 'div'}\`
  position: absolute;
  top: ${(slice.type === 'artboard') ? 0 : slice.meta.padding.top}px;
  left: ${(slice.type === 'artboard') ? 0 : slice.meta.padding.left}px;`;
	syntax.styled += `
  width: ${slice.meta.orgFrame.size.width}px;
  height: ${slice.meta.orgFrame.size.height}px;`;

	if (slice.type !== 'textfield') {
		if ((typeof slice.meta.fillColor === 'object') || (typeof slice.meta.fillColor === 'string' && slice.meta.fillColor.length > 0)) {
			syntax.styled += `
  background-color: ${(typeof slice.meta.fillColor === 'object') ? Colors.rgbaToHex(slice.meta.fillColor).toUpperCase() : (slice.meta.fillColor.length > 0) ? `${slice.meta.fillColor.toUpperCase()}FF` : ''};`;
		}
	}

	if (slice.meta.fillType === 'gradient') {
		syntax.styled += (slice.meta.gradient.type === 'linear') ? `
  background-image: linear-gradient(${(slice.meta.gradient.angle) ? slice.meta.gradient.angle : 180}deg, ${slice.meta.gradient.colors.map((color)=> (`${Colors.rgbaToHex(color.color).toUpperCase()} ${(color.position * 100) << 0}%`)).join(', ')});` : `
  background-image: radial-gradient(${slice.meta.gradient.colors.map((color)=> (`${Colors.rgbaToHex(color.color).toUpperCase()} ${(color.position * 100) << 0}%`)).join(', ')});`;
	}

	if (slice.meta.rotation !== 0) {
		syntax.styled += `
  transform: rotate(${slice.meta.rotation.toFixed(2)});`;
	}

	if (slice.meta.opacity !== 1) {
		syntax.styled += `
  opacity: ${(slice.meta.opacity * 100) << 0}%;`;
	}

	if (slice.meta.radius > 0) {
		syntax.styled += `
  border-radius: ${slice.meta.radius << 0}px;`;
	}

	if (slice.meta.styles) {
		if (slice.meta.styles.border) {
			syntax.styled += `
  border: ${slice.meta.styles.border.thickness << 0}px solid ${(typeof slice.meta.styles.border.color === 'object') ? Colors.rgbaToHex(slice.meta.styles.border.color).toUpperCase() : `${slice.meta.styles.border.color.toUpperCase()}FF`};`;
		}

		if (slice.meta.styles.shadow) {
			syntax.styled += `
  ${(slice.type !== 'textfield') ? 'box' : 'text'}-shadow: ${slice.meta.styles.shadow.offset.x << 0}px ${slice.meta.styles.shadow.offset.y}px ${slice.meta.styles.shadow.blur}px ${slice.meta.styles.shadow.spread}px ${(typeof slice.meta.styles.shadow.color === 'object') ? Colors.rgbaToHex(slice.meta.styles.shadow.color).toUpperCase() : `${slice.meta.styles.shadow.color.toUpperCase()}FF`};`;
		}

		if (slice.meta.styles.innerShadow) {
			syntax.styled += `
  ${(slice.type !== 'textfield') ? 'box' : 'text'}-shadow: ${slice.meta.styles.innerShadow.offset.x << 0}px ${slice.meta.styles.innerShadow.offset.y}px ${slice.meta.styles.innerShadow.blur}px ${slice.meta.styles.innerShadow.spread}px ${(typeof slice.meta.styles.innerShadow.color === 'object') ? Colors.rgbaToHex(slice.meta.styles.innerShadow.color).toUpperCase() : `${slice.meta.styles.innerShadow.color.toUpperCase()}FF`} inset;`;
		}
	}

	if (slice.type === 'textfield') {
		const font = fontSpecs(slice.meta.font);
		syntax.styled += `
  font-family: "${font.family} ${font.name}", sans-serif;
  font-weight: ${font.weight};
  font-size: ${font.size}px;
  letter-spacing: ${font.kerning.toFixed(2)}px;
  line-height: normal;
  text-align: ${font.alignment.toLowerCase()};
  color: ${(typeof font.color === 'object') ? Colors.rgbaToHex(font.color).toUpperCase() : `${font.color.toUpperCase()}FF`};`;

	} else if (slice.type === 'bitmap' || slice.type === 'svg') {
		syntax.styled += `
  background-image: url('${slice.filename}@1x.${(slice.type === 'bitmap') ? 'png' : 'svg'}');
  background-repeat: no-repeat;`;
	}

	syntax.styled += `\`
`;

	syntax.comp = (slice.type !== 'textfield') ? `<${componentName} data-id="${slice.id}" />
` : `<${componentName} data-id="${slice.id}">${slice.meta.txtVal.replace('\\n', '<br />')}</${componentName}>
`;

	return (syntax);
};


const uniqueListNames = (names, name)=> {
	if (Object.keys(names).indexOf(name) > -1) {
		names[name]++;

	} else {
		names[name] = 0;
	}

	return ({ names,
		name : `${name}__${names[name]}`.replace(/__0$/, '')
	});
};



export function fontSpecs(font) {
	let { name, family, psName, size, lineHeight } = font;

	name = (name) ? name : (family) ? (family.includes(' ')) ? family.split(' ').slice().pop() : family.split('-').slice().pop() : 'Regular';
	family = (family) ? (family.includes(' ')) ? family.split(' ').slice().shift() : family.split('-').slice().shift() : '';
	name = name.replace(family, '').replace(/ +/g, '');
	family = family.replace(name, '').replace(/ +/g, '');
	psName = (psName && !Objects.isEmpty(psName)) ? psName : `${family}-${name}`.replace(/ +/g, '');
	lineHeight = (lineHeight) ? lineHeight : (size) ? (size + (size / 3) << 0) : 0;
	size = (size) ? size : (lineHeight) ? Math.round((lineHeight * 3) * 0.25) : 0;
	const weight = fontWeight(name);

	return (Object.assign({}, font, { family, name, psName, weight, size, lineHeight }));
}


export function toReactJS(artboard, slices, components) {
// 	console.log('code-generator.toReactJS()', artboard, slices, components);

	if (slices.length === 0) {
		return ({
			html   : null,
			syntax : null
		});
	}

	let uNames = {};
	const parentSlice = [...slices].shift();
// 	console.log('---------------', parentSlice);

	let jsx = null;
	if (parentSlice.type === 'artboard') {
		jsx = makeGroupJSX(artboard.layers, [...slices.slice(1)], uNames, components);

	} else if (parentSlice.type === 'group') {
		const { layers } = findSubGroup(artboard.layers, parentSlice.uuid);
// 		console.log('---------------', layers);

		jsx = makeGroupJSX(layers, [...slices.slice(1)], uNames, components);

	} else {
// 		const { layers } = findSubGroup(artboard.layers, (parentSlice.type === 'group') ? parentSlice.uuid : parentSlice.meta.parent_uuid );

		jsx = makeSliceJSX(parentSlice, uNames);
		if (Objects.hasKey(components, parentSlice.uuid)) {
			jsx = {
				styled : `${components[parentSlice.uuid].syntax.split('\n\n').shift()}\n`,
				comp   : components[parentSlice.uuid].syntax.split('\n\n').pop().replace('render(', '').replace(');', '')
			};

		} else {
			jsx = makeSliceJSX(parentSlice, uNames);
		}
	}

	const syntax = `${jsx.styled}

render(${(parentSlice.type === 'artboard' || parentSlice.type === 'group') ? `<div>${jsx.comps}</div>` : jsx.comp.replace(/\n/, '')});`;


	return ({ syntax });
}

/*
`class Counter extends React.Component {
  constructor() {
    super()
    this.state = { count: 0 };
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      this.setState(state => ({ count: state.count + 1 }));
    }, 3333);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (
      <center>
        <h3>
          {this.state.count}
        </h3>
      </center>
    )
  }
}`
 */

export function toAndroid(slices, artboard) {
// 	console.log('code-generator.toAndroid()', slices, artboard);

	const artboardName = Strings.camelize(Strings.slugifyURI(artboard.title).replace(/[-/—]+/g, ' ').replace(BAD_CHARS, ''), null, true);

	let html = '';//`<!-- ${DISCLAIMER.replace('__LANG__', 'XML').replace(/\n__/g, ' -->\n<!-- -!- -!- -!- -!- -!- -!- -!- -!- -!- -!- -!- -!- -->').replace(/,\n/g, ' -->\n<!-- ')}\n\n\n`;
	html += `<?xml version="1.0" encoding="utf-8"?>\n`;
	slices.forEach((slice)=> {
		const sliceName = Strings.camelize(Strings.slugifyURI(slice.title).replace(/[-/—]+/g, ' ').replace(BAD_CHARS, ''), null, true);
		const viewType = (slice.type === 'textfield') ? 'Text View' : 'Image View';
		const caption = viewType;
		html += `<android.support.constraint.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"\n`;
		html += `${TAB}xmlns:app="http://schemas.android.com/apk/res-auto" \n`;
		html += `${TAB}xmlns:tools="http://schemas.android.com/tools" \n`;
		html += `${TAB}android:id="@+id/activity_${artboardName}" \n`;
		html += `${TAB}android:layout_width="match_parent" \n`;
		html += `${TAB}android:layout_height="match_parent" \n`;
		html += `${TAB}android:paddingLeft="${slice.meta.frame.origin.x}px" \n`;
		html += `${TAB}android:paddingTop="${slice.meta.frame.origin.y}px" \n`;
		html += `${TAB}android:paddingRight="${artboard.meta.frame.size.width - slice.meta.frame.size.width}px" \n`;
		html += `${TAB}android:paddingBottom="${artboard.meta.frame.size.height - slice.meta.frame.size.height}px" \n`;
		html += `${TAB}tools:context=".${artboardName}Activity">\n`;
		html += `${TAB}<${viewType.replace(/ /g, '')} \n`;
		html += `${TAB}${TAB}android:id="@+id/${Strings.camelize(viewType)}_${sliceName}" \n`;
		html += `${TAB}${TAB}android:layout_width="wrap_content" \n`;
		html += `${TAB}${TAB}android:layout_height="wrap_content" \n`;
		html += `${TAB}${TAB}android:text="${caption}" \n`;
		html += `${TAB}${TAB}app:layout_constraintBottom_toBottomOf="parent" \n`;
		html += `${TAB}${TAB}app:layout_constraintEnd_toEndOf="parent" \n`;
		html += `${TAB}${TAB}app:layout_constraintStart_toStartOf="parent" \n`;
		html += `${TAB}${TAB}app:layout_constraintTop_toTopOf="parent" />\n`;
		html += '</android.support.constraint.ConstraintLayout>\n\n';
	});

	return ({
		html   : JSON.stringify(html),
		syntax : `${html.replace(TAB, '\t')}`
	})
}

export function toBootstrap(slices) {
// 	console.log('code-generator.toBootstrapJS()', slices);

	if (slices.length === 0) {
		return ({
			html   : null,
			syntax : null
		});
	}

	const parentSlice = slices.shift();
	let html = '';//`/**\n * ${DISCLAIMER.replace('__LANG__', 'Bootstrap').replace(/\n__/g, '\n **//* -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */').replace(/,\n/g, '\n * ')}\n\n\n`;
	if (parentSlice.type === 'background' || parentSlice.type === 'group') {
		html += `$body-bg: ${(typeof parentSlice.meta.fillColor === 'string') ? parentSlice.meta.fillColor.toUpperCase() : `rgba(${parentSlice.meta.fillColor.r}, ${parentSlice.meta.fillColor.g}, ${parentSlice.meta.fillColor.b}, ${parentSlice.meta.fillColor.a})`};\n\n`;
	}
	html += `@import "../node_modules/bootstrap/scss/bootstrap";\n\n`;
	html += `<div class="card" style="width: ${parentSlice.meta.frame.size.width}px">\n`;
	slices.forEach((slice)=> {
		html += `${TAB}<div class="card-body">\n`;
		html += `${TAB}${TAB}<h5 class="card-title">${slice.title}</h5>\n`;
		html += (slice.type === 'textfield') ? `${TAB}${TAB}<p class="card-text">${slice.meta.txtVal}</p>\n` : `${TAB}${TAB}<img class="card-img" src="./images/${URIs.lastComponent(slice.filename)}@1x.png" alt="${slice.title}">\n`;
		html += `${TAB}</div>\n`;
	});
	html += `</div>\n`;

	return ({
		html   : JSON.stringify(html),
		syntax : `${html.replace(/(&nbsp)+;/g, '\t')}`
	});
}

export function toCSS(slices) {
// 	console.log('code-generator.toCSS()', slices);

	let html = '';//`/* ${DISCLAIMER.replace('__LANG__', 'CSS').replace(/\n__/g, ' */\n/* -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */').replace(/,\n/g, ' */\n/* ')}\n\n\n`;
	slices.slice(1).forEach((slice)=> {
		html += `.${Strings.slugifyURI(slice.title)} {\n`;
		html += `${TAB}position: absolute;\n`;
		html += `${TAB}top: ${slice.meta.frame.origin.y}px;\n`;
		html += `${TAB}left: ${slice.meta.frame.origin.x}px;\n`;
		html += `${TAB}width: ${slice.meta.frame.size.width}px;\n`;
		html += `${TAB}height: ${slice.meta.frame.size.height}px;\n`;
		if (slice.type === 'textfield') {
			const font = fontSpecs(slice.meta.font);

			html += `${TAB}font-family: "${`${font.family} ${font.name}`.trim()}", sans-serif;\n`;
			html += `${TAB}font-weight: ${font.weight};\n`;
			html += `${TAB}font-size: ${font.size}px;\n`;
			html += `${TAB}color: ${(typeof font.color === 'string') ? font.color.toUpperCase() : `rgba(${font.color.r}, ${font.color.g}, ${font.color.b}, ${font.color.a})`};\n`;
			html += `${TAB}letter-spacing: ${font.kerning.toFixed(2)}px;\n`;
			html += `${TAB}line-height: ${font.lineHeight}px;\n`;
			html += `${TAB}text-align: ${font.alignment.toLowerCase()};\n`;

		} else if (slice.type === 'slice') {
			html += `${TAB}background: url("${URIs.lastComponent(slice.filename)}@3x.png");\n`;

		} else if (slice.type === 'background' || slice.type === 'group') {
			html += `${TAB}background-color: ${(typeof slice.meta.fillColor === 'string') ? slice.meta.fillColor.toUpperCase() : `rgba(${slice.meta.fillColor.r}, ${slice.meta.fillColor.g}, ${slice.meta.fillColor.b}, ${slice.meta.fillColor.a})`};\n`;
		}
		html += `}\n`;
	});

	return ({
		html   : JSON.stringify(html),
		syntax : `${html.replace(TAB, '\t')}`
	});
}

export function toGridHTML(slices) {
// 	console.log('code-generator.toFlexBoxHTML()', slices);

	if (slices.length === 0) {
		return ({
			html   : null,
			syntax : null
		});
	}

// 	const parentSlice = [...slices].shift();
// 	slices = [...slices].slice(1, Math.min(slices.length, 4));

	let html = '';//`<!-- ${DISCLAIMER.replace('__LANG__', 'HTML').replace(/\n__/g, ' -->\n<!-- -!- -!- -!- -!- -!- -!- -!- -!- -!- -!- -!- -!- -->').replace(/,\n/g, ' -->\n<!-- ')}\n\n\n`;
// 	html += `<style>\n`;
// 	html += `${TAB}.grid-container {\n`;
// 	html += `${TAB}${TAB}display: grid;\n`;
// 	html += `${TAB}${TAB}grid-template-columns:${Strings.repeat(' auto', slices.length)};\n`;
// 	html += `${TAB}${TAB}grid-gap: ${Maths.randomInt(5, 15)}px;\n`;
// 	html += `${(typeof parentSlice.meta.fillColor === 'string') ? parentSlice.meta.fillColor.toUpperCase() : `rgba(${parentSlice.meta.fillColor.r}, ${parentSlice.meta.fillColor.g}, ${parentSlice.meta.fillColor.b}, ${parentSlice.meta.fillColor.a})`} url('${parentSlice.filename}@1x.png') no-repeat`
// 	html += `${TAB}}\n`;
// 	html += `${TAB}.grid-container > div {\n`;
// 	html += `${TAB}${TAB}padding: ${Maths.randomInt(5, 15)}px;\n`;
// 	html += `${TAB}${TAB}text-align: center;\n`;
// 	html += `${TAB}${TAB}vertical-align: middle;\n`;
// 	html += `${TAB}}\n`;
// 	slices.forEach((slice)=> {
// 		if (slice.type === 'textfield') {
// 			const font = fontSpecs(slice.meta.font);
//
// 			html += `${TAB}.${Strings.slugifyURI(slice.title)} {\n`;
// 			html += `${TAB}${TAB}font-family: "${`${font.family} ${font.name}`.trim()}", sans-serif;\n`;
// 			html += `${TAB}${TAB}font-weight: ${font.weight};\n`;
// 			html += `${TAB}${TAB}font-size: ${font.size}px;\n`;
// 			html += `${TAB}${TAB}color: ${(typeof font.color === 'string') ? font.color.toUpperCase() : `rgba(${font.color.r}, ${font.color.g}, ${font.color.b}, ${font.color.a})`};\n`;
// 			html += `${TAB}${TAB}letter-spacing: ${font.kerning.toFixed(2)}px;\n`;
// 			html += `${TAB}${TAB}line-height: ${font.lineHeight}px;\n`;
// 			html += `${TAB}${TAB}text-align: ${font.alignment.toLowerCase()};\n`;
// 			html += `${TAB}}\n`;
// 		}
// 	});
// 	html += `</style>\n\n`;

	html += `<div class="grid-container">\n`;
	slices.forEach((slice)=> {
		html += `${TAB}<div class="grid-cell ${Strings.slugifyURI(slice.title)}">`;
		html += (slice.type === 'textfield') ? `${slice.meta.txtVal}` : `<img src="./images/${URIs.lastComponent(slice.filename)}@1x.png" alt="${slice.title}">`;
		html += `</div>\n`;
	});
	html += `</div>\n`;

	return ({
		html   : JSON.stringify(html),
		syntax : `${html.replace(/(&nbsp)+;/g, '\t')}`
	});

// 	html += `${TAB}${TAB}: ;\n`;
}

export function toReactCSS(slices) {
// 	console.log('code-generator.toReactCSS()', slices);

	if (slices.length === 0) {
		return ({
			html   : null,
			syntax : null
		});
	}

	const html = toCSS(slices).syntax.replace(/: (.+?);/g, ': \'$1\',').replace(/(-.)/g, (c)=> (c[1].toUpperCase())).replace(/,\n}/, ' }').replace(/^.+{\n/, '{').replace(/ +/g, ' ').replace(/\n/g, '');
	return ({
		html   : JSON.stringify(`/* ${DISCLAIMER} */\n\n${html}`),
		syntax : `const styles = ${html};\n`
	});
}


export function toSCSS(upload, slices) {
// 	console.log('code-generator.toSCSS()', upload, slices);

	const html = toCSS(slices);
	const fonts = upload.fonts.map((font, i)=> (`$font-${font.postscript_name.toLowerCase()}: "${font.family} ${font.name}", sans-serif;`)).join('\n');
	return ({
		html   : JSON.stringify(`/* ${DISCLAIMER} */\n\n${html}`),
		syntax : `${fonts}\n\n${html.syntax}`
	});
}


export function toSpecs(upload, slice) {
	let content = `Name             ${slice.title}\n`;
	content += `Type             ${Strings.capitalize(slice.type, true)}\n`;
	content += `Export Size      W: ${slice.meta.frame.size.width}px H: ${slice.meta.frame.size.height}px\n`;
	content += `Position         X: ${slice.meta.frame.origin.x}px Y: ${slice.meta.frame.origin.y}px\n`;
	content += `Rotation         ${slice.meta.rotation}°\n`;
	content += `Opacity          ${slice.meta.opacity * 100}%\n`;
	content += `Blend Mode       ${Strings.capitalize(slice.meta.blendMode, true)}%\n`;
	content += `Radius           ${slice.meta.radius << 0}%\n`;
	content += `Fill Type        ${(slice.meta.fillType) ? Strings.capitalize(slice.meta.fillType, true) : 'Solid'}\n`;
	content += `Fill Color       ${(typeof slice.meta.fillColor === 'object') ? Colors.rgbaToHex(slice.meta.fillColor).toUpperCase() : (slice.meta.fillColor.length > 0) ? `${slice.meta.fillColor.toUpperCase()}FF` : '—'}\n`;
	content += `Fill Opacity     ${(slice.meta.fillColor.a * 100) << 0}%\n`;
	content += `Gradient Type    ${(slice.meta.gradient) ? Strings.capitalize(slice.meta.gradient.type) : '—'}\n`;
	content += `Gradient Colors  ${(slice.meta.gradient) ? slice.meta.gradient.colors.map((color)=> (`${Colors.rgbaToHex(color.color)} (${color.position}%)`)).join(' ') : '—'}\n`;
	content += `Border Color     ${(slice.meta.styles && slice.meta.styles.border) ? (typeof slice.meta.styles.border.color === 'object') ? Colors.rgbaToHex(slice.meta.styles.border.color).toUpperCase() : (slice.meta.styles.border.color.length > 0) ? `${slice.meta.styles.border.color.toUpperCase()}FF` : '—' : '—'}\n`;
	content += `Border Type      ${(slice.meta.styles && slice.meta.styles.border) ? Strings.capitalize(slice.meta.styles.border.position, true) : '—'}\n`;
	content += `Border Width     ${(slice.meta.styles && slice.meta.styles.border) ? `${slice.meta.styles.border.thickness}px` : '—'}\n`;
	content += `Shadows          ${(slice.meta.styles && slice.meta.styles.shadow) ? `X: ${slice.meta.styles.shadow.offset.x} Y: ${slice.meta.styles.shadow.offset.y} B: ${slice.meta.styles.shadow.blur}px S: ${slice.meta.styles.shadow.spread}px ${(typeof slice.meta.styles.shadow.color === 'object') ? Colors.rgbaToHex(slice.meta.styles.shadow.color).toUpperCase() : (slice.meta.styles.shadow.color.length > 0) ? `${slice.meta.styles.shadow.color.toUpperCase()}FF` : '—'}` : '—'}\n`;
	content += `Inner Shadows    ${(slice.meta.styles && slice.meta.styles.innerShadow) ? `X: ${slice.meta.styles.innerShadow.offset.x} Y: ${slice.meta.styles.innerShadow.offset.y} B: ${slice.meta.styles.innerShadow.blur}px S: ${slice.meta.styles.innerShadow.spread}px ${(typeof slice.meta.styles.innerShadow.color === 'object') ? Colors.rgbaToHex(slice.meta.styles.innerShadow.color).toUpperCase() : (slice.meta.styles.innerShadow.color.length > 0) ? `${slice.meta.styles.innerShadow.color.toUpperCase()}FF` : '—'}` : '—'}\n`;
	content += `Blurs            ${(slice.meta.styles && slice.meta.styles.blur) ? '—' : '—'}\n`;
	if (slice.type === 'textfield') {
		const font = fontSpecs(slice.meta.font);

		content += `Text            ${font.family} ${font.name}\n`;
		content += `Text Size       ${font.size}px\n`;
		content += `Text Color      ${(typeof font.color === 'object') ? Colors.rgbaToHex(font.color).toUpperCase() : (font.color.length > 0) ? `${font.color.toUpperCase()}FF` : '—'}\n`;
		content += `Text Paragraph  ${'—'}\n`;
		content += `Text Character  ${font.kerning.toFixed(2)}px\n`;
		content += `Text Line       ${font.lineHeight}px\n`;
		content += `Text H-Align    ${(font.alignment) ? Strings.capitalize(font.alignment) : 'Left'}\n`;
		content += `Text V-Align    ${'Top'}\n`;
		content += `Text Decoration ${'—'}\n`;
		content += `Text Transform  ${'—'}\n`;
	}

	content += `Padding\t\t\t\t\t${slice.meta.padding.top}px ${slice.meta.padding.right}px ${slice.meta.padding.bottom}px ${slice.meta.padding.left}px\n`;
	content += `Date\t\t\t\t\t\t${slice.added.replace(' ', 'T')}Z\n`;
	content += `Owner\t\t\t\t\t\t${upload.creator.username}\n`;
	content += '\n';

	return (content);
}

export function toSwift(slices, artboard) {
// 	console.log('code-generator.toSwift()', slices, artboard);

	const artboardName = Strings.camelize(artboard.title.replace(/[-/—]+/g, ' ').replace(BAD_CHARS, ''), null, true);
	let html = '';//`/**\n * ${DISCLAIMER.replace('__LANG__', 'Swift').replace(/\n__/g, '\n **//* -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */').replace(/,\n/g, '\n * ')}\n\n\n`;
	slices.forEach((slice)=> {
		if (slice.type === 'background' || slice.type === 'group' || slice.type === 'slice' || slice.type === 'symbol' || slice.type === 'textfield') {
			const sliceName = Strings.camelize(Strings.slugifyURI(slice.title).replace(/[-/—]+/g, ' ').replace(BAD_CHARS, ''));

			html += `// Asset\n`;
			html += `enum Asset {\n`;
			html += `${TAB}enum ${artboardName} {\n`;
			html += `${TAB}${TAB}static let ${sliceName}: AssetType = "${artboardName}/${Strings.capitalize(sliceName)}"\n`;
			html += `${TAB}}\n`;
			html += `}\n\n`;
			html += `let ${sliceName}Image = UIImage(asset: Asset.${artboardName}.${sliceName})\n`;
			html += `let alt${sliceName}Image = Asset.${artboardName}.${sliceName}.image\n`;

			if (typeof slice.meta.fillColor === 'string' && slice.meta.fillColor.length > 0) {
				html += `\n\n// Color \n`;
				html += `struct ColorName {\n`;
				html += `${TAB}let rgbaValue: UInt32\n`;
				html += `${TAB}var color: Color { return Color(named: self) }\n`;
				html += `${TAB}static let ${Strings.camelize(slice.title)} = ColorName(rgbaValue: 0x${slice.meta.fillColor.replace('#', '')}ff)\n`;
				html += '\n';
				html += `let ${Strings.camelize(slice.title)}Color = UIColor(named: .${Strings.camelize(slice.title)})\n`;
				html += `let ${Strings.camelize('alt' + slice.title)}Color = ColorName.${Strings.camelize(slice.title)}.color\n`;
			}

		} else if (slice.type === 'textfield') {
			const { family, name, psName } = fontSpecs(slice.meta.font);

			html += `// Font\n`;
			html += `enum FontFamily {\n`;
			html += `${TAB}enum ${family}: String, FontConvertible {\n`;
			html += `${TAB}${TAB}static let ${name.toLowerCase()} = FontConvertible(name: "${family}-${name}", family: "${slice.meta.font.family}", path: "${psName}.otf")\n`;
			html += `${TAB}}\n`;
			html += `}\n\n`;
			html += `let ${Strings.camelize([family, name].join(' '))} = UIFont(font: FontFamily.${family}.${name.toLowerCase()}, size: ${slice.meta.font.size.toFixed(1)})\n`;
			html += `let ${Strings.camelize(['alt', family, name].join(' '))} = FontFamily.${family}.${name.toLowerCase()}, size: ${slice.meta.font.size.toFixed(1)})\n`;
			html += `\n\n`;
			html += `// Color\n`;
			html += `struct ColorName {\n`;
			html += `${TAB}let rgbaValue: UInt32\n`;
			html += `${TAB}var color: Color { return Color(named: self) }\n`;
			html += `${TAB}static let ${Strings.camelize(slice.title)} = ColorName(rgbaValue: 0x${slice.meta.font.color.replace('#', '')}ff)\n`;
			html += `\n`;
			html += `let ${Strings.camelize(slice.title)}Color = UIColor(named: .${Strings.camelize(slice.title)})\n`;
			html += `let ${Strings.camelize('alt' + slice.title)}Color = ColorName.${Strings.camelize(slice.title)}.color\n`;
		}
	});

	return ({
		html   : JSON.stringify(html),
		syntax : `${html.replace(/(&nbsp)+;/g, '\t')}\n`
	});
}

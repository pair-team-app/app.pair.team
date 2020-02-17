
import Octokit from '@octokit/rest';
import axios from 'axios';
import JSZip from 'jszip';
import { Arrays, Strings } from 'lang-js-utils';
import cookie from 'react-cookies';
import { matchPath } from 'react-router-dom';
import { API_ENDPT_URL, Pages } from '../consts/uris';



export function getRoutePaths(pathname) {
// 	console.log('_-_-_-_-_', 'getRoutePaths()', pathname);

	const homePage = matchPath(pathname, { path : Pages.HOME });
	const featuresPage = matchPath(pathname, { path : Pages.FEATURES });
	const pricingPage = matchPath(pathname, { path : Pages.PRICING });
	const privacyPage = matchPath(pathname, { path : Pages.PRIVACY });
	const termsPage = matchPath(pathname, { path : Pages.TERMS });
	const playgroundPage = matchPath(pathname, { path : `${Pages.PLAYGROUND}/:teamSlug([a-z-]+)/:projectSlug([a-z-]+)?/:buildID([0-9]+)?/:deviceSlug([a-z0-9-]+)?/:typeGroupSlug([a-z-]+)?/:componentID([0-9]+)?/:ax(accessibility)?/:comments(comments)?/:commentID([0-9]+)?` });

// 	console.log(':::::::::::::', 'getRoutePaths', pathname, { homePage, featuresPage, pricingPage, privacyPage, termsPage, playgroundPage });

	if (homePage && homePage.isExact) {
		return (homePage);
	}

	if (featuresPage && featuresPage.isExact) {
		return (featuresPage);
	}

	if (pricingPage && pricingPage.isExact) {
		return (pricingPage);
	}

	if (privacyPage && privacyPage.isExact) {
		return (privacyPage);
	}

	if (termsPage && termsPage.isExact) {
		return (termsPage);
	}

	if (playgroundPage && playgroundPage.isExact) {
		return (playgroundPage);
	}
}


export function buildInspectorPath(upload, prefix='/specs', suffix='') {
	return (`${Strings.trimSlashes(prefix)}/${upload.id}/${Strings.slugifyURI(upload.title)}${Strings.trimSlashes(suffix)}`);
}

export function buildInspectorURL(upload, prefix='/specs', suffix='') {
	return (`${window.location.origin}${buildInspectorPath(upload, prefix, suffix)}`);
}

export function createGist(token, filename, contents, description, visible, callback=null) {
	const payload = { description,
		public : visible,
		files  : {
			[filename] : {
				content : contents
			}
		}
	};

	new Octokit({ auth : token }).gists.create(payload).then((result)=> {
		console.log('CREATE_GIST ->', result);

		if (callback) {
			callback(result.data);
		}
	});
}

export function editGist(token, gistID, filename, contents, description, visible, callback=null) {
	const payload = { gistID, description,
		gist_id : gistID,
		public  : visible,
		files   : {
			[filename] : {
				content : contents
			}
		}
	};

	new Octokit({ auth : token }).gists.update(payload).then((result)=> {
		console.log('EDIT_GIST ->', result);

		if (callback) {
			callback(result.data);
		}
	});
}

export function isUserLoggedIn(confirmed=true) {
// 	return ((confirmed) ? cookie.load('user_id') !== '0' : typeof cookie.load('user_id') !== 'undefined');
	return ((confirmed) ? ((cookie.load('user_id') << 0) !== 0) : (typeof cookie.load('user_id') !== 'undefined') << 0 !== 0);
}

export function sendToSlack(channel, message, callback=null) {
	axios.post(API_ENDPT_URL, {
		action  : 'SLACK_MSG',
		payload : { channel, message }
	}).then((response) => {
		console.log('SLACK_MSG', response.data);
		if (callback) {
			callback();
		}
	}).catch((error)=> {
	});
}


export function makeAvatar(name, size=32) {
	const letter = (name.length > 0) ? name.charAt(0).toUpperCase() : '?';

  const bgColor = Arrays.randomElement([
    '#1abc9c',
    '#2ecc71',
    '#3498db',
    '#9b59b6',
    '#34495e',
    '#16a085',
    '#27ae60',
    '#2980b9',
    '#8e44ad',
    '#2c3e50',
    '#f1c40f',
    '#e67e22',
    '#e74c3c',
    '#95a5a6',
    '#f39c12',
    '#d35400',
    '#c0392b',
    '#bdc3c7',
    '#7f8c8d'
  ]);

  const canvas = window.document.createElement('canvas');
  const context = canvas.getContext('2d');

  document.body.appendChild(canvas);
  canvas.width = size;
  canvas.height = size;
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = bgColor;
  context.fillRect(0, 0, size, size);

  context.font = `${(size * 0.5) << 0}px Monaco, monospace`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = `#${(0xffffff ^ parseInt(bgColor.replace('#', ''), 16)).toString(16)}`;
  context.fillText(letter, size * 0.5, size * 0.5);

  const dataURL = canvas.toDataURL();
  canvas.remove();

  return (dataURL);
}


export function unzipData(data) {
//   return (new Promise(((resolve, reject) => {
//     const zip = new JSZip();
//     zip.loadAsync(data, { checkCRC32 : true }).then(({ files })=> {
//       Object.keys(files).forEach((file)=> {
//         zip.file(file).async('binarystring').then((data)=> {
//           resolve (data);
//         });
//       });
//     }, (e)=> (reject(e)));
//   })));


  return ((data) ? new Promise(((resolve, reject) => {
    const zip = new JSZip();
    zip.loadAsync(data, { checkCRC32 : true }).then(({ files })=> {
      Object.keys(files).forEach((file)=> {
        zip.file(file).async('binarystring').then((data)=> {
          resolve (data);
        });
      });
    }, (e)=> (reject(e)));
  })) : new Promise((resolve => (resolve(null)))));
}

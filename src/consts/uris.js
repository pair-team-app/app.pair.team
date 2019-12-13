

const API_VER = '1';

export const Modals = {
	GITHUB   : '/github',
	LOGIN    : '/login',
	RECOVER  : '/recover',
	REGISTER : '/register',
	STRIPE   : '/stripe',
	NETWORK  : '/network',
};

export const Pages = {
	HOME       : '/',
	FEATURES   : '/features',
	LEGAL      : '/legal',
	PLAYGROUND : '/app',
	PRICING    : '/pricing',
	PRIVACY    : '/privacy',
	TERMS      : '/terms',
	WILDCARD   : '*'
};

export const CDN_HOSTNAME = 'http://cdn.designengine.ai';
// export const API_HOSTNAME = 'https://api.designengine.ai';
export const API_HOSTNAME = `https://api.designengine.ai/v${API_VER}`;


export const DEFAULT_AVATAR = `${CDN_HOSTNAME}/profiles/avatar-default.png`;
// export const API_ENDPT_URL = `${API_HOSTNAME}/playgrounds.php`;
export const API_ENDPT_URL = `${API_HOSTNAME}/wait-list.php`;

export const GITHUB_APP_AUTH = 'https://github.com/login/oauth/authorize?client_id=e6f08e86acdc4e4cca38&redirect_uri=https://api.designengine.ai/system.php&scope=gist,user:email&state=__{EPOCH}__';

export const GITHUB_XD_PLUGIN = 'https://github.com/de-ai/designengine-xd';
export const NPM_DE_PLAYGROUND = 'https://www.npmjs.com/package/design-engine-playground';

export const GITHUB_DOCS = 'https://github.com/de-ai/designengine.ai/blob/master/README.md';

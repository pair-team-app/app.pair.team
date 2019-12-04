
export const Modals = {
	COOKIES   : '/cookies',
	DISABLE   : '/disable',
	GITHUB    : '/github',
	LOGIN     : '/login',
	NETWORK   : '/network',
	NO_ACCESS : '/no-access',
	PROFILE   : '/profile',
	RECOVER   : '/recover',
	REGISTER  : '/register',
	STRIPE    : '/stripe'
};

export const Pages = {
	DOCS       : '/docs',
	HOME       : '/',
	FEATURES   : '/features',
	LEGAL      : '/legal',
	PLAYGROUND : '/app',
	PRICING    : '/pricing',
	PRIVACY    : '/privacy',
	TERMS      : '/terms',
	WILDCARD   : '*'
};

export const CDN_HOSTNAME = 'http://cdn.pairurl.com';
export const API_HOSTNAME = 'https://api.designengine.ai';
export const API_ENDPT_URL = `${API_HOSTNAME}/playgrounds.php`;

export const TEAM_DEFAULT_AVATAR = `${CDN_HOSTNAME}/site-assets/avatars/team-default.png`;
export const USER_DEFAULT_AVATAR = `${CDN_HOSTNAME}/site-assets/avatars/user-default.png`;

export const GITHUB_APP_AUTH = 'https://github.com/login/oauth/authorize?client_id=e6f08e86acdc4e4cca38&redirect_uri=https://api.designengine.ai/system.php&scope=gist,user:email&state=__{EPOCH}__';

export const GITHUB_FIGMA_PLUGIN = 'https://github.com/de-ai/designengine-figma';
export const GITHUB_XD_PLUGIN = 'https://github.com/de-ai/designengine-xd';
export const NPM_DE_PLAYGROUND = 'https://www.npmjs.com/package/design-engine-playground';

export const GITHUB_DOCS = 'https://github.com/de-ai/designengine.ai/blob/master/README.md';

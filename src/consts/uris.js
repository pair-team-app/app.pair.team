

import { URLs } from '../utils/lang';

export const HOME = '/';
export const INSPECT = '/inspect';
export const LOGIN = '/login';
export const PARTS = '/parts';
export const PRESENT = '/present';
export const PRIVACY = '/privacy';
export const PROFILE = '/profile';
export const RECOVER = '/recover';
export const REGISTER = '/register';
export const TERMS = '/terms';
export const UPLOAD = '/new';

export const CDN_HOSTNAME = 'http://cdn.designengine.ai';
export const API_HOSTNAME = 'https://api.designengine.ai';
export const TERMINAL_HOSTNAME = 'https://terminal.designengine.ai';

export const DE_LOGO_SMALL = `${CDN_HOSTNAME}/assets/logo-email.png'`;
export const DEFAULT_AVATAR = `${CDN_HOSTNAME}/profiles/avatar-default.png`;

export const API_ENDPT_URL = `${API_HOSTNAME}/system.php`;
// export const API_ENDPT_URL = `${API_HOSTNAME}/dev.php`;
export const CDN_DOWNLOAD_PARTS_URL = `${CDN_HOSTNAME}/download-slices.php'`;
export const CDN_DOWNLOAD_PDF_URL = `${CDN_HOSTNAME}/download-pdf.php'`;
export const CDN_DOWNLOAD_PROJECT_URL = `${CDN_HOSTNAME}/download-project.php'`;
// export const CDN_UPLOAD_URL = `${CDN_HOSTNAME}/upload.php'`;
// export const CDN_UPLOAD_URL = `${window.location.href.replace(window.location.pathname, '')}/php/upload.php`;
export const CDN_UPLOAD_URL = (window.location.hostname.match(/192|local/ig)) ? `${CDN_HOSTNAME}/upload.php` : `${URLs.hostname()}/php/upload.php`;
export const LINTER_UPLOAD_URL = `${TERMINAL_HOSTNAME}/upload.php`;
export const LINTER_ENDPT_URL = `${TERMINAL_HOSTNAME}/services/linter.php`;

export const EXTENSION_CONFIG_URL = 'chrome://?id=kkgccakiccjnlmponcggpmagkgelpbhg';
export const EXTENSION_PUBLIC_HOST = 'chrome-extension://kkgccakiccjnlmponcggpmagkgelpbhg';

export const GITHUB_APP_AUTH = 'https://github.com/login/oauth/authorize?client_id=e6f08e86acdc4e4cca38&redirect_uri=https://api.designengine.ai/system.php&scope=gist,user:email&state=__{EPOCH}__';
export const GITHUB_REPO = 'https://www.github.com/de-ai';
export const GITHUB_ROADMAP = 'https://github.com/de-ai/designengine.ai/projects/1';

export const SLACK_INVITE = 'https://join.slack.com/t/designengineai/shared_invite/enQtMzE5ODE0MTA0MzA5LWM2NzcwNTRiNjQzMTAyYTEyNjQ1MjE5NmExNDM1MzAyNWZjMTA0ZWIwNTdmZjYyMjc2M2ExNjAyYWFhZDliMzA';
export const SPECTRUM_DOCS = 'https://spectrum.chat/designengine';

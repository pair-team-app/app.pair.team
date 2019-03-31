
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

export const DE_LOGO_SMALL = 'http://cdn.designengine.ai/assets/logo-email.png';
export const DEFAULT_AVATAR = 'http://cdn.designengine.ai/profiles/avatar-default.png';

export const API_ENDPT_URL = 'https://api.designengine.ai/system.php';
// export const API_ENDPT_URL = 'https://api.designengine.ai/dev.php';
export const CDN_DOWNLOAD_PARTS_URL = 'http://cdn.designengine.ai/download-slices.php';
export const CDN_DOWNLOAD_PDF_URL = 'http://cdn.designengine.ai/download-pdf.php';
export const CDN_DOWNLOAD_PROJECT_URL = 'http://cdn.designengine.ai/download-project.php';
// export const CDN_UPLOAD_URL = 'http://cdn.designengine.ai/upload.php';
// export const CDN_UPLOAD_URL = `${window.location.href.replace(window.location.pathname, '')}/php/upload.php`;
export const CDN_UPLOAD_URL = (window.location.hostname.includes('localhost')) ? 'http://cdn.designengine.ai/upload.php' : `${window.location.href.replace(window.location.pathname, '')}/php/upload.php`;
export const LINTER_ENDPT_URL = 'https://terminal.designengine.ai/services/linter.php';

export const EXTENSION_CONFIG_URL = 'chrome://?id=kkgccakiccjnlmponcggpmagkgelpbhg';
export const EXTENSION_PUBLIC_HOST = 'chrome-extension://kkgccakiccjnlmponcggpmagkgelpbhg';

export const GITHUB_REPO = 'https://www.github.com/de-ai';
export const GITHUB_ROADMAP = 'https://github.com/de-ai/designengine.ai/projects/1';
export const SLACK_INVITE = 'https://join.slack.com/t/designengineai/shared_invite/enQtMzE5ODE0MTA0MzA5LWM2NzcwNTRiNjQzMTAyYTEyNjQ1MjE5NmExNDM1MzAyNWZjMTA0ZWIwNTdmZjYyMjc2M2ExNjAyYWFhZDliMzA';
export const SPECTRUM_DOCS = 'https://spectrum.chat/designengine';

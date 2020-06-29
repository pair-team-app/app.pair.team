
import { Pages } from '../../../consts/uris';


export const RoutePaths = {
	INVITE  : `${Pages.INVITE}/:teamSlug([a-z-]+)/:inviteID([0-9]+)/:timestamp([0-9])`,
	PROJECT : `${Pages.PROJECT}/:projectSlug([a-z-]+)?/:buildID([0-9]+)?/:deviceSlug([a-z0-9-]+)?/:typeGroupSlug([a-z-]+)?/:componentID([0-9]+)?/:comments(comments)?/:commentID([0-9]+)?`,
	TEAM    : `${Pages.TEAM}/:teamSlug([a-z-]+)?/(comments)?/:commentID([0-9]+)?`
};

export { default } from './Routes';

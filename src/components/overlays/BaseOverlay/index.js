
import { Modals, Popovers } from '../../../consts/uris';


export const OVERLAY_TYPE_AUTO_SCROLL = 'OVERLAY_TYPE_AUTO_SCROLL';
export const OVERLAY_TYPE_AUTO_SIZE = 'OVERLAY_TYPE_AUTO_SIZE';
export const OVERLAY_TYPE_POSITION_OFFSET = 'OVERLAY_TYPE_POSITION_OFFSET';
export const OVERLAY_TYPE_PERCENT_SIZE = 'OVERLAY_TYPE_PERCENT_SIZE';


export const ENTRY_MODALS = [
  Modals.LOGIN,
  Modals.RECOVER,
  Modals.REGISTER
];

export const AUTHORIZED_MODALS = [
  Modals.FILE_DROP,
  Modals.PROFILE,
  Modals.STRIPE
];

export const AUTHORIZED_POPOVERS = [
  Popovers.SETTINGS,
  Popovers.SHARE
];

export { default } from './BaseOverlay';

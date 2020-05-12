
import jsonSize from 'json-size';


export const COMMENT_TIMESTAMP = 'MMM Do @ h:mma';
export const BUILD_TIMESTAMP = 'DD-MMM';
export const TEAM_TIMESTAMP = 'DD-MM-YYYY';
// export const MOMENT_TIMESTAMP = 'DD-MMM-YYYY';
// export const MOMENT_TIMESTAMP = 'DD-MMM-YYYY HH:mm:ss Z';


export const COMPONENT_THUMB_SCALE = 0.25;
export const COMPONENT_THUMB_QUALITY = 6;

// TODO: Move to lang-js module
export const jsonFormatKB = (json, binary=false)=> (`${Math.round(jsonSize(json) * ((binary) ? 0.0009765625 : 0.001).toFixed(3) * 1000) * 0.001}KB`);

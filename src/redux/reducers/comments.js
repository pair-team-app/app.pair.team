
import { BUILD_PLAYGROUNDS_LOADED, COMMENT_ADDED, COMMENT_UPDATED, COMMENT_CREATED, SET_COMMENT, SET_COMMENT_IMAGE, TEAM_COMMENTS_LOADED, SET_COMMENTS_SORT, SET_COMMENTS_FORMAT_FILTER, SET_COMMENTS_DONE_FILTER } from '../../consts/action-types';
import { LOG_REDUCER_POSTFIX, LOG_REDUCER_PREFIX } from '../../consts/log-ascii';
import { CommentSortTypes, CommentFilterTypes } from '../../components/sections/TopNav';


const initialState = {
  // comments     : [],
  // comment      : null,
  preComment   : null,
  imageComment : false,
  sort         : CommentSortTypes.NONE,
  filters      : {
    format : CommentFilterTypes.NONE,
    done   : false
  }
};


const logFormat = (state, action, meta='')=> {
  const { type, payload } = action;
  console.log(LOG_REDUCER_PREFIX, `REDUCER[comments] >> “${type}”`, { state, payload, meta }, LOG_REDUCER_POSTFIX);
};

export default function comments(state=initialState, action) {
  const { type, payload } = action;
  logFormat(state, action);

  if (type === COMMENT_CREATED) {
  // if (type === TEAM_COMMENTS_LOADED) {
    // const { comments } = payload;
    // return (Object.assign({}, state, { comments }));

  // } else if (type === BUILD_PLAYGROUNDS_LOADED) {
    // const { comments, comment } = payload;
    // return (Object.assign({}, state, { comments, comment }));

    // const { comments } = payload;
    // return (Object.assign({}, state, { comments }));

  // } else if (type === COMMENT_ADDED || type === COMMENT_UPDATED) {
    // const { comments, comment } = payload;
    // return (Object.assign({}, state, { comments, comment }));

  // } else if (type === SET_COMMENT) {
    // const { comment } = payload;
    // return (Object.assign({}, state, { comment }));

  // } else if (type === COMMENT_CREATED) {
    const { preComment } = payload;
    return (Object.assign({}, state, { preComment }));

  } else if (type === SET_COMMENT_IMAGE) {
    const { enabled } = payload;
    return (Object.assign({}, state, { imageComment : enabled }));

  } else if (type === SET_COMMENTS_SORT) {
    const { sort } = payload;
    return (Object.assign({}, state, { sort }));

  } else if (type === SET_COMMENTS_FORMAT_FILTER) {
    const { filter : format } = payload;
    return (Object.assign({}, state, { filters : { ...state.filters, format } }));

  } else if (type === SET_COMMENTS_DONE_FILTER) {
    const { filter : done } = payload;
    return (Object.assign({}, state, { filters : { ...state.filters, done } }));

  // } else if (type === '@@router/LOCATION_CHANGE') {
    // const { preComment, comment } = payload;
    // return (Object.assign({}, state, { preComment, comment }));

  } else {
    return (state);
  }
}

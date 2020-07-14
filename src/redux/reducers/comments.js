
import { BUILD_PLAYGROUNDS_LOADED, COMMENT_ADDED, COMMENT_UPDATED, SET_COMMENT, TEAM_COMMENTS_LOADED } from '../../consts/action-types';
import { LOG_REDUCER_POSTFIX, LOG_REDUCER_PREFIX } from '../../consts/log-ascii';



const initialState = {
  comments      : null,
  comment       : null,
  createComment : null
};


const logFormat = (state, action, meta='')=> {
  const { type, payload } = action;
  console.log(LOG_REDUCER_PREFIX, `REDUCER[comments] >> “${type}”`, { state, payload, meta }, LOG_REDUCER_POSTFIX);
};

export default function comments(state=initialState, action) {
  const { type, payload } = action;
  logFormat(state, action);

  if (type === TEAM_COMMENTS_LOADED) {
    const { comments } = payload;
    return (Object.assign({}, state, { comments }));

  } else if (type === BUILD_PLAYGROUNDS_LOADED) {
    const { comments, comment } = payload;
    return (Object.assign({}, state, { comments, comment }));

  } else if (type === COMMENT_ADDED || type === COMMENT_UPDATED) {
    const { comments, comment } = payload;
    return (Object.assign({}, state, { comments, comment }));

  } else if (type === SET_COMMENT) {
    const { comment } = payload;
    return (Object.assign({}, state, { comment }));

  } else {
    return (state);
  }
}


import { INVITE_LOADED, SET_TEAM, SET_COMMENT, TEAM_COMMENTS_LOADED, TEAMS_LOADED, TEAM_CREATED, TEAM_LOGO_LOADED, TEAM_RULES_UPDATED, TEAM_UPDATED, COMMENT_ADDED, COMMENT_UPDATED, COMMENT_VOTED, USER_PROFILE_UPDATED } from '../../consts/action-types';
import { LOG_REDUCER_POSTFIX, LOG_REDUCER_PREFIX } from '../../consts/log-ascii';

const initialState = {
  teams   : null,
  team    : null,
  member  : null,
  invite  : null,
  comment : null
};


const logFormat = (state, action, meta='')=> {
  const { type, payload } = action;
  console.log(LOG_REDUCER_PREFIX, `REDUCER[teams] >> “${type}”`, { state, payload, meta }, LOG_REDUCER_POSTFIX);
};

export default function comments(state=initialState, action) {
  const { type, payload } = action;
  logFormat(state, action);

  if (type === INVITE_LOADED) {
    const { team, invite } = action.payload;
    return (Object.assign({}, state, { team, invite }));

  } else if (type === TEAM_COMMENTS_LOADED) {
    const { team } = payload;
    return (Object.assign({}, state, { team }));

  }  else if (type === TEAM_RULES_UPDATED) {
    const { teams, team } = payload;
    return (Object.assign({}, state, { teams, team }));

  } else if (type === TEAMS_LOADED) {
    const { team, teams, member } = payload;
    return (Object.assign({}, state, { team, teams, member }));

  } else if (type === TEAM_CREATED) {
    const { teams, team, member } = payload;
    return (Object.assign({}, state, { teams, team, member }));

  } else if (type === TEAM_UPDATED) {
    const { team } = payload;
    return (Object.assign({}, state, { team }));

  } else if (type === COMMENT_ADDED) {
    const { teams, team } = payload;
    return (Object.assign({}, state, { teams, team }));

  } else if (type === COMMENT_UPDATED) {
    const { teams, team, comment } = payload;
    return ((comment.types.includes('team')) ? Object.assign({}, state, { teams, team, comment }) : state);

  } else if (type === COMMENT_VOTED) {
    const { teams, team, comment } = payload;
    return ((comment.types.includes('team')) ? Object.assign({}, state, { teams, team, comment }) : state);

  } else if (type === TEAM_LOGO_LOADED) {
    const { team } = payload;
    return (Object.assign({}, state, { team }));

  } else if (type === SET_TEAM) {
    const { teams, team, member } = payload;
    return (Object.assign({}, state, { teams, team, member }));
    // return ({ ...state, teams, team });
    // state.teams = teams;
    // return (state);

  } else if (type === SET_COMMENT) {
    const { comment } = payload;
    return ((!comment || comment.types.includes('team')) ? Object.assign({}, state, { comment }) : state);

  } else if (type === USER_PROFILE_UPDATED) {
    const { profile } = payload;
    return (Object.assign({}, state, (!profile) ? { ...initialState } : state));

  } else if (type === '@@router/LOCATION_CHANGE') {
    const { teams, team, member, comment, imageComment } = payload;

    if (teams && team) {
      return (Object.assign({}, state, { teams, team, member, comment, imageComment }));

    } else {
      return (state);
    }

  } else {
    return (state);
  }

}


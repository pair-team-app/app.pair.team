
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import builds from './builds';
import comments from './comments';
import products from './products';
import stripe from './stripe';
import teams from './teams';
import user from './user';
import path from './path';


const rootReducer = (history)=> combineReducers({
  router : connectRouter(history),
  builds, comments, products, stripe, teams, user, path
});

export default rootReducer;
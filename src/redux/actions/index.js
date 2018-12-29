
import { ADD_ARTICLE } from '../../consts/action-types';

export function addArticle(payload) {
	return ({type : ADD_ARTICLE, payload });
}
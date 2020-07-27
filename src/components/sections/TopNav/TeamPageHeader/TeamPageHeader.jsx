
import React from 'react';
import './TeamPageHeader.css';

import { SORT_BY_DATE, SORT_BY_SCORE } from './index';

function TeamPageHeader(props) {
// console.log('TeamPageHeader()', { props });

  const { sort } = props;
  return (<div className="team-page-header">
    <div className="sort-by-wrapper">
      <div className="sort-by-link" data-selected={sort === SORT_BY_SCORE} onClick={()=> props.onSortClick(SORT_BY_SCORE)}>Top</div>
      <div className="sort-by-link" data-selected={sort === SORT_BY_DATE} onClick={()=> props.onSortClick(SORT_BY_DATE)}>New</div>
    </div>
  </div>);
}


export default (TeamPageHeader);

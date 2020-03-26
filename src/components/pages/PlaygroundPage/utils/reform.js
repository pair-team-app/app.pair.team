
import { Strings } from 'lang-js-utils';
import moment from 'moment';
import { jsonFormatKB } from '../../../../consts/formats';

export const reformComment = (comment, overwrite={})=> {
  // console.log('reformComment()', { comment, overwrite });

  const reformed = { ...comment,
    position : ((typeof comment.position === 'string' && comment.position.charAt(0) === '{') ? JSON.parse(comment.position) : comment.position) || { x: 0, y: 0 },
    content  : (comment.content || null),
    author   : {
      id       : comment.author.id,
      username : comment.author.username,
      email    : comment.author.email,
      avatar   : comment.author.avatar
    },
    votes      : comment.votes.map((vote)=> ({ ...vote,
      score : vote.score << 0
    })),
    score      : comment.votes.reduce((acc, vote)=> (acc + (vote.score << 0)), 0),
    epoch      : (comment.added) ? (moment.utc(comment.added).valueOf() * 0.001) << 0 : 0,
    timestamp  : (comment.added)
      ? moment(comment.added).add(moment().utcOffset() << 0, 'minute')
      : moment.utc(),
    ...overwrite
  }

  return ({ ...reformed, size: jsonFormatKB(reformed) });
};

export const reformComponent = (component, componentTypes=null, overwrite = {})=> {
  // console.log('reformComponent()', { keys : Object.keys(component), component, overwrite });

  const { id, type_id, event_type_id, node_id, title, tag_name, sizes, image_url, html, styles, accessibility, meta, comments } = component;
  const { width, height } = meta.bounds;
  delete component['type_id'];
  delete component['event_type_id'];
  delete component['node_id'];
  delete component['tag_name'];
  delete component['image_url'];
  delete component['root_styles'];
  delete component['image_data'];
  delete component['thumb_data'];

  const reformed = {...component, html,
    id            : id << 0,
    typeID        : type_id << 0,
    eventTypeID   : event_type_id << 0,
    nodeID        : node_id << 0,
    title         : title.length === 0 ? tag_name : title,
    tagName       : tag_name,
    styles        : (styles) ? JSON.parse(styles) : null,
    accessibility : (accessibility) ? JSON.parse(accessibility) : null,
    typeGroup     : componentTypes.find(({ id })=> (id === type_id)),
    sizes         : { ...sizes, o : { width, height } },
    images        : Object.keys(sizes).map((key)=> (`${image_url}_${key}.png`)),
    comments      : comments.map((comment)=> reformComment(comment)).sort((i, ii)=> ((i.epoch > ii.epoch) ? -1 : (i.epoch < ii.epoch) ? 1 : ((i.type === 'bot') ? -1 : (ii.type === 'bot') ? 1 : 0))),
    selected      : false,
    processed     : ((html && accessibility) !== null),
    ...overwrite
  };

  // if ((html && accessibility) !== null) {
  //   console.log('[%s] .::(REFORMED)::.', component.id, { data : { ...reformed, size : jsonFormatKB(reformed) } });

  // } else {
  //   console.log('[%s] .::(INITIAL)::.', component.id, { ...reformed, size : jsonFormatKB(reformed) });
  // }

  return { ...reformed, size: jsonFormatKB(reformed) };
};

export const reformPlayground = (playground, devices=null, componentTypes=null, team=null, overwrite={})=> {
  // console.log('reformPlayground()', { playground, componentTypes });

  const { build_id, team_id, device_id, title, type_groups, components, added, last_visited, selected } = playground;
  delete playground['build_id'];
  delete playground['team_id'];
  delete playground['device_id'];
  delete playground['type_groups'];
  delete playground['last_visited'];

  const reformed = { ...playground,
    teamID      : team_id << 0,
    buildID     : build_id << 0,  
    deviceID    : device_id << 0,
    projectSlug : Strings.slugifyURI(title),
    team        : (!playground.team) ? team : playground.team,
    components  : components.map((component)=> (reformComponent(component, componentTypes))),
    typeGroups  : type_groups.map((typeGroupID)=> (componentTypes.find(({ id })=> ((typeGroupID << 0) === id)))),
    device      : (devices.find(({ id })=> (id === (device_id << 0))) || null),
    lastVisited : moment(last_visited).utc(),
    added       : (playground.added)
      ? moment(added).add(moment().utcOffset() << 0, 'minute')
      : moment.utc(),
    selected    : (typeof selected === 'undefined') ? false : selected,
    ...overwrite
  };

  return ({ ...reformed, size: jsonFormatKB(reformed) });
};


import { Strings } from 'lang-js-utils';
import moment from 'moment';
import { jsonFormatKB } from '../../../../consts/formats';

export const reformComment = (comment, uri, overwrite={})=> {
  console.log('reformComment()', { comment, uri, overwrite }, { position : typeof comment.position });

  const { id, position, content, author, state, votes, types, replies, added } = comment;

  const reformed = { ...comment,
    id       : id << 0,
    position : (typeof position === 'string' && position.charAt(0) === '{') ? JSON.parse(position) : (position || { x : 0, y : 0 }),
    content  : (content || null),
    author   : { ...author },
    votes    : votes.map((vote)=> ({ ...vote,
      score : vote.score << 0
    })),
    types     : types.split(','),
    score     : votes.reduce((acc, vote)=> (acc + (vote.score << 0)), 0),
    uri       : `${uri}/comments/${id}`,
    selected  : false,
    epoch     : (added) ? (moment.utc(added).valueOf() * 0.001) << 0 : 0,
    timestamp : (added) ? moment(added).add(moment().utcOffset() << 0, 'minute') : moment.utc(),
    replies   : (replies) ? replies.map((reply)=> (reformComment(reply, uri))) : [],
    votable   : (state !== 'closed'),
    ...overwrite
  }

  // console.log('reformComment()', { comment, uri, reformed  });
  return ({ ...reformed, size: jsonFormatKB(reformed) });
};

export const reformComponent = (component, uri, componentTypes=null, overwrite={})=> {
  // console.log('reformComponent()', { keys : Object.keys(component), component, uri, componentTypes, overwrite });

  const { id, type_id, event_type_id, node_id, title, tag_name, sizes, image_url, html, styles, accessibility, meta, comments } = component;
  const { width, height } = meta.bounds;
  const scale = 2;//Math.max(1, sizes['f'].width / meta.bounds.width, sizes['f'].height / meta.bounds.height);

  // delete component['type_id'];
  // delete component['event_type_id'];
  // delete component['node_id'];
  // delete component['tag_name'];
  // delete component['image_url'];
  // delete component['root_styles'];
  // delete component['image_data'];
  // delete component['thumb_data'];

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
    // sizes         : { ...sizes, f : { ...sizes.c}, o : { width : width * scale, height : height * scale } },
    sizes         : { ...sizes, f : { width : width * (1 / scale), height : height * (1 / scale) }, o : { width : width * scale, height : height * scale } },
    images        : Object.keys(sizes).map((key)=> (`${image_url}_${key}.png`)),
    comments      : (comments) ? comments.map((comment)=> reformComment(comment, `${uri}/${id}`)).sort((i, ii)=> ((i.epoch > ii.epoch) ? -1 : (i.epoch < ii.epoch) ? 1 : ((i.type === 'bot') ? -1 : (ii.type === 'bot') ? 1 : 0))) : [],
    uri           : `${uri}/${id}`,
    selected      : false,
    processed     : ((html && accessibility) !== null),
    ...overwrite
  };

  // if ((html && accessibility) !== null) {
  //   console.log('[%s] .::(REFORMED)::.', component.id, { data : { ...reformed, size : jsonFormatKB(reformed) } });

  // } else {
  //   console.log('[%s] .::(INITIAL)::.', component.id, { ...reformed, size : jsonFormatKB(reformed) });
  // }

  // console.log('reformComponent()', { component, uri, componentTypes, overwrite, reformed });
  return { ...reformed, size: jsonFormatKB(reformed) };
};

export const reformPlayground = (playground, devices=null, componentTypes=null, team=null, overwrite={})=> {
  console.log('reformPlayground()', { playground, devices, componentTypes, team });

  const { build_id, team_id, device_id, title, type_groups, components, added, last_visited, selected } = playground;

  // delete playground['build_id'];
  // delete playground['team_id'];
  // delete playground['device_id'];
  // delete playground['type_groups'];
  // delete playground['last_visited'];

  const projectSlug = Strings.slugifyURI(title);
  const device = (devices.find(({ id })=> (id === (device_id << 0))) || null);
  const uri = `/app/${team.slug}/${projectSlug}/${build_id}/${device.slug}/views`;

  const reformed = { ...playground, projectSlug, uri,
    teamID      : team_id << 0,
    buildID     : build_id << 0,  
    deviceID    : device_id << 0,
    team        : (!playground.team || playground.team.length === 0) ? team : playground.team,
    components  : (components && components.length > 0) ? components.map((component)=> (reformComponent(component, uri, componentTypes))) : [],
    typeGroups  : type_groups.map((typeGroupID)=> (componentTypes.find(({ id })=> ((typeGroupID << 0) === id)))),
    device      : (device || device_id),
    lastVisited : moment(last_visited).utc(),
    added       : (playground.added)
      ? moment(added).add(moment().utcOffset() << 0, 'minute')
      : moment.utc(),
    selected    : (typeof selected === 'undefined') ? false : selected,
    ...overwrite
  };

  // console.log('reformPlayground()', { playground, devices, componentTypes, team, reformed });
  return ({ ...reformed, size : jsonFormatKB(reformed) });
};

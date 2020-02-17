import Jimp from 'jimp';
import { Images, Strings } from 'lang-js-utils';
import moment from 'moment';
import { jsonFormatKB } from '../../../../consts/formats';
import { unzipData } from '../../../../utils/funcs';
import { convertStyles } from './css';


export const reformComment = (comment, overwrite={})=> {
  console.log('reformComment()', { comment, overwrite });

  const reformed = { ...comment,
    position : ((typeof comment.position === 'string' && comment.position.charAt(0) === '{') ? JSON.parse(comment.position) : comment.position) || { x: 0, y: 0 },
    author   : {
      id       : comment.author.id,
      username : comment.author.username,
      email    : comment.author.email,
      avatar   : comment.author.avatar
    },
    epoch      : (comment.added) ? (moment.utc(comment.added).valueOf() * 0.001) << 0 : 0,
    timestamp  : (comment.added)
      ? moment(comment.added).add(moment().utcOffset() << 0, 'minute')
      : moment.utc(),
    ...overwrite
  }
};

export const reformComponent = async (component, overwrite = {})=> {
  console.log('reformComponent()', { keys : Object.keys(component), component, overwrite });

  const PLACEHOLDER_FILL = {
    r: 128,
    g: 128,
    b: 128,
    a: 0.0
  };

  let {
    type_id,
    event_type_id,
    node_id,
    title,
    tag_name,
    thumb_data,
    image_data,
    html,
    styles,
    accessibility,
    root_styles,
    meta,
    comments,
  } = component;
  const { width, height } = meta.bounds;
  delete component['type_id'];
  delete component['event_type_id'];
  delete component['node_id'];
  delete component['tag_name'];
  delete component['root_styles'];
  delete component['image_data'];
  delete component['thumb_data'];

  const imageData = image_data && image_data.length > 1 ? await unzipData(image_data) : null; //Images.genColor(PLACEHOLDER_FILL, { width, height });
  html = html ? await unzipData(html) : null;
  styles = styles ? JSON.parse(await unzipData(styles)) : null;
  accessibility = accessibility ? JSON.parse(await unzipData(accessibility)) : null;
  const rootStyles = root_styles ? convertStyles(JSON.parse(await unzipData(root_styles))) : null;

  // 	console.log('META: [%s]', JSON.stringify(meta, null, 2));
  //	console.log('ROOT STYLES:', root_styles);
  // 	console.log('META.BOUNDS:', meta.bounds.height, meta.bounds.width);

  //   console.log('::|::', { id : component.id, imageData }, '::|::');
  //   console.log('::|::', { id : component.id, title, imageData }, '::|::');

  const thumbData = thumb_data && thumb_data.length > 1 ? await unzipData(thumb_data) : Images.genColor(PLACEHOLDER_FILL, { width, height });

  const fullSize = ((imageData) ? await Jimp.read(imageData).then( async(image)=> {
    const { data, ...size } = image.bitmap;
    return { ...size };
  }) : { width, height });

  const thumbSize = (thumbData) ? await Jimp.read(thumbData).then(async image=> {
    const { data, ...size } = image.bitmap;
    return { ...size };
  }) : null;

  const reformed = {...component, imageData, thumbData, thumbSize, fullSize, accessibility,
    // html,
    // styles,
    typeID: type_id,
    eventTypeID: event_type_id,
    nodeID: node_id,
    title: title.length === 0 ? tag_name : title,
    tagName: tag_name,
    // rootStyles: rootStyles
    //   ? {
    //       ...rootStyles,
    //       maxWidth  : width > 0 ? `${width}px` : 'fit-content',
    //       minHeight : height > 0 ? `${height}px` : 'fit-content',
    //       minWidth  : width > 0 ? `${width}px` : 'fit-content',
    //       width     : width > 0 ? `${width}px` : 'fit-content'
    //     }
    //   : null,
    comments: comments.map((comment)=> reformComment(comment)).sort((i, j)=> (i.epoch > j.epoch ? -1 : i.epoch < j.epoch ? 1 : 0)),
    selected: false,
    processed: (imageData && fullSize), //(html && styles && rootStyles) !== null,
    ...overwrite
  };

  if (imageData) {
    console.log('[%s] .::(REFORMED)::.', component.id, { data : { ...reformed, size : jsonFormatKB(reformed) } });

  } else {
    console.log('[%s] .::(INITIAL)::.', component.id, { ...reformed, size : jsonFormatKB(reformed) });
  }

  return { ...reformed, size: jsonFormatKB(reformed) };
};

export const reformPlayground = async (playground, summary=false, team=null, overwrite={})=> {
  console.log('reformPlayground()', playground);

  const { build_id, team_id, device_id, title, components, added, last_visited, selected } = playground;
  delete playground['build_id'];
  delete playground['team_id'];
  delete playground['device_id'];
  delete playground['last_visited'];

  const reformed = { ...playground,
    teamID      : team_id << 0,
    buildID     : build_id << 0,  
    deviceID    : device_id << 0,
    projectSlug : Strings.slugifyURI(title),
    team        : (!playground.team) ? team : playground.team,
    // components  : (summary) ? components : components.map(async(component)=> (await reformComponent(component))),
    components  : components,
    lastVisited : moment(last_visited).utc(),
    added       : (playground.added)
      ? moment(added).add(moment().utcOffset() << 0, 'minute')
      : moment.utc(),
    selected    : (typeof selected === 'undefined') ? false : selected,
    ...overwrite
  };

  return ({ ...reformed, size: jsonFormatKB(reformed) });
};

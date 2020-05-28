



import cookie from 'react-cookies';
import ReactGA from 'react-ga';


const UNFURL_HOST = 'https://unfurl.now.sh';
const ORTHODOX_UNFURL_IMAGE = 'data:image/png;base64,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';

const ORTHODOX_UNFURL_META = { url,
  type        : 'N/A (type)',
  title       : 'N/A (title)',
  description : 'N/A (descript)',
  image       : ORTHODOX_UNFURL_IMAGE,
  content     : 'N/A (content)',
  html        : 'N/A (html)'
};


export function extract(url) {
  console.log('{|+|}', 'extract', { url });


  let response = axios.get(UNFURL_HOST, {
    params : { url }
  });
	try {
		response = await response.json();

	} catch (e) {
		console.log('Couldn\'t parse response! %s', e);
	}

  const { other, oembed, ogp } = response;



  const merged = { ...ORTHODOX_UNFURL_META, 
  ...{ ...other, 
    type        : 'URL',
    title       : other.title,
    image       : (other.appleTouchIcon || (other.msapplicationTileImage || (other.shortcutIcon)) || null)
  }, 
  ...{ ...ogp,
    type        : ogp.type,
    title       : ogp.ogTitle,
    description : ogp.ogDescription,
    url         : ogp.ogURL,
    image       : ogp.ogImage
  }, 
  ...{ ...oembed,
    type        : 'URL',
    title       : oembed.title,
    content     : oembed.html,
    html        : oembed.html,
  }};


  const meta = {
    type        : (oembed && oembed.type) ? oembed.type : (ogp && ogp.type) ? ogp.type : 'N/A (type',
    title       : (oembed && oembed.title) ? oembed.title : (ogp && ogp.ogTitle) ? ogp.title : (other && other.title) ? other.title : 'URL',
    description : (ogp && ogp.ogDescription) ? ogp.ogDescription : 'N/A',
    url         : (oembed && oembed.url) ? oembed.url : (ogp && ogp.ogUrl) ? ogp.ogUrl : (other.cannical || url),
    image       : (ogp && ogp.ogImage && ogp.ogImage.length > 0) ? ogp.ogImage.pop() : (other.ogImage && other.ogImage.length > 0) ? other.ogImage.pop() : (other.appleTouchIcon || ORTHODOX_UNFURL_IMAGE),
    content     : (oembed && oembed.html) ? oembed.html : (ogp && ogp.description) ? ogp.description : 'N/A (content)',
    html        : (oembed && oembed.html) ? oembed.html : 'N/A (html)'
  };


  console.log('unfurl -> extract()', { url, merged, })

  return ({ ...meta });
}

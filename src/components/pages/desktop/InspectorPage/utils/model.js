
import { Maths } from '../../../../../utils/lang';


export const artboardForID = (upload, artboardID)=> {
	return (flattenUploadArtboards(upload).find((artboard)=> (artboard.id === artboardID)));
};

export const fillGroupPartItemSlices = (upload, slice)=> {
// 	console.log('fillGroupPartItemSlices()', upload, slice);
	return ([slice, ...artboardForID(upload, slice.artboardID).slices.filter((item)=> (item.type !== 'artboard' && item.id !== slice.id && Maths.geom.frameContainsFrame(slice.meta.frame, item.meta.frame)))]);
};

export const flattenUploadArtboards = (upload, type=null)=> {
// 	console.log('flattenUploadArtboards()', upload, type);
	return ((upload) ? upload.pages.flatMap((page)=> (page.artboards)).filter((artboard)=> ((type) ? (artboard.type === type || artboard.type.includes(type)) : true)).reverse() : []);
};

export const slicesByArea = (slices)=> {
// 	console.log('slicesByArea()', slices);
	return(slices.sort((s1, s2)=> ((Maths.geom.sizeArea(s1.meta.frame.size) < Maths.geom.sizeArea(s2.meta.frame.size)) ? -1 : (Maths.geom.sizeArea(s1.meta.frame.size) > Maths.geom.sizeArea(s2.meta.frame.size)) ? 1 : 0)));
};

export const intersectSlices = (slices, frame)=> {
// 	console.log('interectSlices()', slices, frame);
	return (slices.filter((slice)=> (Maths.geom.frameContainsFrame(frame, slice.meta.frame))));
};

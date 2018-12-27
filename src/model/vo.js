
export function ArtboardVO(json, offset) {
	this.id = json.id;
	this.pageID = json.page_id;
	this.uploadID = json.uploadID;
	this.title = json.title;
	this.filename = json.filename;
	this.meta = JSON.parse(json.meta);
	this.views = json.views;
	this.downloads = json.downloads;
	this.added = json.added;
	this.system = json.system;
	this.offset = (offset) ? offset : { x : 0, y : 0 };
	this.slices = json.slices.map((slice) => { return (new SliceVO(slice)); });
	this.comments = json.comments.map((comment) => { return (new CommentVO(comment)); });;
}

export function CommentVO(json) {

}
//
// export function FileVO(json) {
//
// }

// export function PageVO(json) {
// }

export function SliceVO(json) {
	this.id = json.id;
	this.title = json.title;
	this.type = json.type;
	this.filename = json.filename;
	this.meta = JSON.parse(json.meta);
	this.added = json.added;
}

//
// class UploadVO {
// 	constructor(json) {
//
// 	}
// }
//
//
// class PageVO {
// 	constructor(json, selected) {
// 		this.id = json.id;
// 		this.uploadID = json.upload_id;
// 		this.title = json.title;
// 		this.description = json.description;
// 		this.total = json.total;
// 		this.added = json.added;
// 		this.selected = selected;
// 		this.artboards = json.artboards.map((artboard) => { return (new ArtboardVO(artboard)); });
// 	}
// }

// export default ArtboardVO;
// export default PageVO;
// export default UploadVO;
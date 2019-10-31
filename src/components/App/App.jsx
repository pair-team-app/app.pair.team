
import React, { Component } from 'react';
import './App.css';

import axios from 'axios';
// import crypto from 'crypto';
import { DateTimes, URIs } from 'lang-js-utils';
import cookie from 'react-cookies';
import { connect } from 'react-redux';
import { Route, Switch, withRouter } from 'react-router-dom';

// import AlertDialog from '../overlays/AlertDialog';
import LoginModal from '../overlays/LoginModal';
import PopupNotification from '../overlays/PopupNotification';
import RegisterModal from '../overlays/RegisterModal';
import StripeModal from '../overlays/StripeModal';
import TopNav from '../sections/TopNav';
import BottomNav from '../sections/BottomNav';
import HomePage from '../pages/HomePage';
import FeaturesPage from '../pages/FeaturesPage';
import PlaygroundPage from '../pages/PlaygroundPage';
import PricingPage from '../pages/PricingPage';
import PrivacyPage from '../pages/PrivacyPage';
import Status404Page from '../pages/Status404Page';
import TermsPage from '../pages/TermsPage';

import {
	Modals,
	Pages,
	API_ENDPT_URL,
	GITHUB_APP_AUTH } from '../../consts/uris';
import {
	appendHomeArtboards,
	fetchTeamLookup,
	fetchUserHistory,
	fetchUserProfile,
	updateDeeplink,
	updateUserProfile
} from '../../redux/actions';
// import { idsFromPath } from '../../utils/funcs';
import { initTracker, trackEvent, trackPageview } from '../../utils/tracking';

import { decryptObject, decryptText } from '../pages/PlaygroundPage/utils/crypto';


const wrapper = React.createRef();


class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			authID      : 0,
			darkTheme   : false,
			contentSize : {
				width  : 0,
				height : 0
			},
			popup       : null,
			modals      : {
				login    : false,
				register : false,
				github   : false,
				stripe   : false,
				payload  : null
			}
		};

		this.githubWindow = null;
		this.authInterval = null;

		initTracker(cookie.load('user_id'));
	}

	componentDidMount() {
		console.log('App.componentDidMount()', this.props, this.state);

// 		const encKey = crypto.createCipher('des3', '208b49ab07ed3228bdc23c08463077f1');
// 		let encStr = encKey.update(JSON.stringify(obj), 'utf8', 'hex');
// 		encStr += encKey.final('hex');

// 		const styles = decryptObject('63fecd42550f0a1037fc42ffd91580738f286067e28e28286c8488ad77174baaf3ebae6529f7b4a45660770dd8cea9679367664cd7258b6325426112240fb65c7170af7d18781c53c00bf1d302eed038fc9634dceb6df45e1cd94c2783ac046ef2dbf69e0aee34684f5f403a78288915674801e1ca2aa770ff9a9fdf9e83f0f6f2821d9188e5b7684c8f275489713938231f5ffcc848ba5477293d6024f7d5e1c69b1ac4f64160e64c9768dcd2c3ea3eb7de6721605b5630a5a0a9f520dc77f809a7acbdd210abf95568c6e735638b8d665e73d9c6fffba00546f7b0d49c39c42389fd246480d420331cbbd339a268f512e095505930cd03fb21ef46c4fb49d5cd8a735e6a919e373eb5a941098e804ea1d7702bbad53d4d79e18b76eb4aa69f7ceac8de349cfb428bbdc2db550fa124ac8379ac558426fb7aff7af09cabf0e18c38f20f548fd43e4467fe900e5d571a5410faa1787d18a51dd911174d2c69dc6391ef443c0dfc461287df0927070952a887371a5ec0ab9e4fc0e30a2d7bafaeaa05749c57870dd13647348a577bb37d05d09561b750f2be2f699dfa97853715642ebf586b1a195c0365a170951ccd89ccc4e12587c96ca78fe5d0246a59cbdd102ba76d1a15156598f6ac9c57f728f88ede261b958d296e42b8c09c4f96f73693a051b08c38fed33feeed9321c15384bb5255b6a300b063eeee4a7393e6290c81497ad48ef54b22d512f413593448aed1b3f48d80cbcf21728819df340dbc8b71e2b4de1fc5e32119a7dbbb6f62be6927fa93cbac40e67e9ac9f654fc4a04770eb9e233238cfe23b2d03e065c8ebcea167828387d4a56157776d07d54faac9ae9906a1ec660307c9b0286a1e730f6df640e1206726f7b4c0da88b025a225c3bcd398b77798d0fb8be057ce6c4111f0d2151b2e9b49e8f39dcd0111b6410f78e9b16fe44a9d72875ac7f15c145e18e02c330af074d4694bddeb430f7c6c869383ee3cae1f74a0aeb826b139a6bf1581997cc6d9f29ad35db1ce1e45db073d00efba2ae00571b64a7fb25eff740250e2b043d9778edeaebb55bf82b03377949e0653fa5a43b96bef077d6f970b432bbc6238479da1c4b5fffe853b8db73d234cfe5c1e1429cb605eddcad30da4400d0de7cf9001f363f2c5c19dba46d889544e6dee7debd5c8ca522019d50a1f4a5381c8737e2b37d4ee34a0881acab43407c871df40b00dcfa8da597973aaf22af29a5634b05c4c3b10696bc543a55caf9bf4ebd7ac1f8beb1ffdd29a8de1f55f449b4d4a155582da5091645d4f39e5dcafce7c9440d4207cbb1a719441d9e90c641a6292d0b3df31b543b7ac42d5c7140bb42670e6ef27528e12b791fdfe9c626054fa0ddb580b47715627931d6c65ce80489aa05b7ad093fb4f394d39a2bdacf540d72470ae7259ba7e1875e1d9d4d75dc8edb7494c32b7975e52f066a7412ae85f77680a405517b34595789324ab10790f5a367a8e038a174c32c6f72a9d3d130ff92836279e551dff02717a6610b38329cee68164f8eb5f70ea017bc16a97875b505b84cfea94c1c39bae3ebb296ec52f6d281c73959274499c7630d98cdea8e1374ae2a97beabe36d2489d89760b8c349b4b584c8541e5806d865b9d18f235adbe0279fca8e64674d6031becdce834f70eb1edc6d60ba409025c4c29fc9dcf67a07692a49ea415fb0e2f96513e73828be94cddf8a16fb84f77ecfb9940fc43c350d9f5ace1c0a97430b32f06796259c7a5cdc22eb09a3b3aa7cb728a56627da607812063a266caa836f2b78afdbe9bde018b5a6f660c8643b4871ef28353e8153a8437e70c54eea86bdab9bcdd1088a8354e11c3dd5c60ed40b5fff9342f81cc6df30d7c8bd4adfcd53c16bf5798c3f028e62348d0d75a5ad97eb7363da848ea89c8eb6ad34d04f08a0d86870830477aabe74a79f8279c5b75fa3f6e97a42fdd1a09716e3527878224fb31e7f6b030c8dfc7b6071a4e42e4e9e5b5d7fcc2cc6d96979c46e71a91b08330450fbd31256f8ece84aae0a78e371fb0162a90c2f9698649a24deec0e960f8eeb97d08666b15d5b1d0154c0bfda1177640f5725dcee12afbc84dfc07a2d891c87b963eb56d8e6cd9cf625940afc155841342ceb51a75f037af34ffcc7dac005b9492d561a3269955098a650782bef9153b147bf9c2c136c2eb5b328060866539d4dd591fda746764f0476ee166084e6fbe7745a0bd572bc466c8f23302e54b636e6cd107b800876ea5e13a13e41329962712fde950257f9fad93c4ce85a9ef4707d62283b3a7b5cc71778179df0f925844a116d9ac50019f560e93ca00f9ec35904965a9d3358cff84db37727d3a0e455cd7d07199f69141fcbb476acf535d4fee8e4d8b12c25599dfd4f34683baaaa6b192c23360e61218d2c91f4e5f8dfbe4a2065d6292c08213f5e4559caf7d3433c1255677e53ce567155776bf3b7bdeebea52a8566629b5688050fbd748e8e57f9b4463c93a3b275a50cf914ff012047370e36845bd188e943aba918d9026bf150a661ae887e2e6f2bd8711f46fc038e9c50665edf80f6ba253f9fca6b417a136f8930899e70204288405abb2fdff2a1b7ce13a6b2d4667349adc3a37ced6316b8bcb7eed413beffc1ccc7087f907ced5f0686e655553e9d5032c3a564a4d572cbb963817a5ab9807e0e31c6e993bc9e1e9c85b46cb7589138cbb895f75dca7d554a0cf32c08233a49869918bdea0a7d97edeff42f5f8ac0276dacd03674704a86fce8d17586444ff067af42f02ba29afddc2bb5fa1afae2e253800f54b45165f149e36a558bed765f9b849503feab53459345d4a3012137e2d2d5a539b90379d3949a997cbda8eb9d8abacf3be76622ea87a0ad59dff237a5fbb1d7543af76b7b52c29d178cd0676729bc15c7107fed20999f34ba8787af53951a71c5ca6c3ee614a3be2a8b706df45f0782e852adf58d426b5f8638b0c6242517df42825fa971fbf177fa8fdf74b521423e62df2e45104bd914a293bb91d7a0d5dec7a02b0686bc2f19b71f849393250968d36a9a339d08abba7f39664d642fcfd847a5ef5199825db8004fe8e3be4fcb3414d2df18de700491eeadf590b1157dadc614427f64b5a21866afed6aa2d274a69da0c893c85760784f3f301728c96ee18fa26ccda06c34302d894882147b73bb6bc0135d9ac8c3cf1d35c7039ac7a99914f546bf2bf7013544d832fdd37fada3b6dd589887d035629f5a23f99d1fd70d19ef50d1910614bbf5fc9fa2e5a6c063fcf38a176fbe03f8e3957c8d3d167c6d6c598fc9e1943c29bad3eb5562619b8e0799b5e62bb28f85d5cebb13f677a1645b327e72b496bc557a838315435c04d0930b39c3f60754ce00212fa91d66a74c80807aff49033b215f5f4ddaea3b6a8e39534b313bf8988291e2bde5ee94be2d4a8706e68094709833b0ec8f169894c2d568cdd04631fb52a085bb95c266dd2613101de1b284dd95f638bc661fc227e2dfaf4da817af97032651f440fc30e65ad994e06f0a1dfb8f44e0d8d6c1df88c7da1a04b5f8639b35a8a7345213931b9e6eb2c04d7648caf89ceabd8399e8ff292a49c6826e5cbdb3460fbc47c889cbbfa28c7238495784df18ec94a8a77d9b84b42ffc9e1c1184062e7cf4bce92720a1b999408a2f3d6d88950369a989d432f707392b4ee867cccbd41d96ce71464ed37b1b0148a3759da69da0fd6eb24a258220b13819dc23762c31b0d5d753f07b35614b0a149328c569bc89450e49dc54992458ddaa0ec1d1c972ca04d15df2d581622b3cbe15f433b22fdbf9c79ddc02a87e9941923ac4717a337cc527656466a233e424bcac3f2ee87f399735a1255ff47f3b1a733c368df5194cba9f67341a1fabb1e6a65e5532f1ded561dce2d6c903ff4b71e9464871118ca1997a84353e4655f732d1f6026423b495dcf1ae3552a9858cd67a333f29f9b9eb8c3a0993cd6b232c545e65fdac2aee04ec3318808c0941c7dcfc81ee47de6048b7fa4662d945412a5b194fa56fa6843e98a5faa3b3b7f41674835056c90ba373d1b6ab25aa192c59a4200a6ea0378a9468fcd234943f4c5ac5dc13680626dd0a543ca23a6d76a84e9d0a01e620a2a8a1e615373e5c0aef823c782d3dc85c7a66445d664bd40bf0e05ed3fb1a2d81cb1705fe1186aa46c14ca4989229dc85697e1de7f777c29a7840186b4c8a147f85faa1c3f38b028f1984a1647020c46363790c1294600265c4463a76197fda9cb6494549938781aa4c75cbd3ce58d424319bfdc5758cf72bf6fb55a9fd074ce81bea839963776c719838371e5c28f25be8b9f084680bdced2a0ee8168f32764af5ec1f24dd4b3653fa978a4befab4ab892f4ca13f36f52cfc7896bb0ad71054155252232f5493bbc20253b411bdf686c27e317e9e21e2bef90ccf00d36ad9e2d1c9e519223b161257719604df3047a8f979b10ec2d7c79c0aa39629b5885d97a3797ad8c7b1e6f8beef6df657ddbba2f691f33c59a5ff3f3ae700208172d1aeb7322bb079a1b29aa0fb37d60acded31fda1f18b8fe404f5c82d6986d6fd3d96839786568dc4d88dc42ca24aee83467702e7067c5456ac952fd625fb7c74872db24a47a0e0794f71d49aa36d09a978b07010d5c3e92b870f6aba12baa5ddf9c0341f6faa1ba893771d16ddb52129e3065142940964b5a1de54265040bfa5fee5a09b52093190ecda33a08f0e36778f5a09dcd14f50cf6fc90d1759676c88bef87e3a9fbc2fc7b2737f8d65b8c1cc81f5ec3784f57eaf90f4f460cc220e1769e232f56e55857e7c981ee0f87c867206c3e5e351249dda8ba5a3e06eb8fc4abf3d00c55fb7dfbf2a7c6bfe415c40f6f82fc33598fe4f0742b368cfb532f4f134dda96ee7958823e7be3ca147d999687eadbd49efc5cb16652bb87ef0c7a7f2fd96ca91edab14a6753ef36e0332d50d93c806e18da2571274ac7c464e91d8a92f64ca24d10ea2babbc62c310c1ff33e1baf15065f1f639c4eda050767af074c1df964986a34d76695a1e8e30a38d57db532d562a390ed30d0c2f54b408236dd66bdf749b2c3c7b4fc9d1b383e41701fe0204d58a2c5956c232e90fa5f8d07d2dd9f484e3aaf80cd5cba335e5f2cf47744a858f0380caa118f4134be57b62d019bdfc6c69e2d460fe127089f8c0a8179e65ff5317d776b28142e6c11dcfe754118a4887407ea4af08aacfe137238be97f9895a1702b6e77ee94978f09339ea8ef5c2728641135ba812a606480c5972e9f2221f0ab2176e9a57e663e1a176aa148b104f4bfde41cf7c251d07cd66136a1f1d6aa63ea1932ff8d62dd92065bfe86e508f72d1d9f130b009757067ac67ec162ebce43820dc1a7769e568f343b485a3d3f0ac7230ea1510bdf3302dba3481a36a1ad8d5af88184452daa093926694aadfab0f6a6fdd5dd43bd95bed3ac90786cc5275d5516bd42b6106365e62d7ced78421829bf0df79f74e6742e17f333be47eec459d404c02ecaa6ab53999e09a9fe5331a7181e008e45cb0e3ab1857bd6f008a3d9d946ad4fa8e38c6a314215cc101352e45cbe1e3984ed4255f54931cf6138c866a415dc9bbb35052384670ceeee7c03596f2d5f18e963306e9f9354b567a463d7355a7e3106b14d4dc5d03df3de227a9a818249e1ced417c21706bf4f21364e86e08318316a1ed534791fd2c2152ec3b6e73835ee9d0c78047030c60cd059e1c1102d91e884d679afbbd3018544f687c381f1a73dfaaf2897d8eae9e3b159e1c7455a7c2dacadafe6d7fd3509a816cd6ab9eaf5ef19d0100ead0b467d32ccd6ad51ace1a8f18d2b012b0020315e0effecaef8b761dd29f5356838909f5010ae10cb36ff9ba00efed04356e3ea4aa287171fb48076c4b934e81fc1c10dab52acfc33c6d4b141b6f7a76e051eb612bc5f2b407a1961369d1f8c38bc3ca55ffd2c75d52731cd7bcc3951383076d78a655654e54d1468a7f2ef96fd1794ba553422b95f57e1e20fa9219bb251492c0d694ae5e5934dde372daf1ea08201f0f15891c4d413f4260ec164eb5c2a30d31f8636aea8e73305d3bdba9e6558f3324d34887b2f87460784fdd85dd91ba5d832da0408c1d7cef588a956477d9ca22cd60b99ac0875b2c50309c2a49c46d5e7248c66b05bcd5d90a79ebfa2fe9984b034adb8d84d1d32e2f713ca501233be544f5aea5c252f1bc86d29919705673fe355cf5749acf4b852b592020472fb5f73562802de76348c280e23a87eb4f70d49588916fca0978c5bb8d9741cd0502620a4c87151095f0393d14189af88134b1956728966bae66a09d9c3d51b7d48b5797cf95871ecace3eab4102cc52027f1e3920168f7ce1aadb4147c3455061fb179073087e00a556fe0f3034b3ccf32f48f84f5d01858314c8ee7060268cba1cda9736676ac9124a0b2efd9d90f0e53a0e694074425dacb4f40fde9fd2b46c692741e1889986eab5716148ddf9a6924c9d03eb71dec86c4caccf2b6ce4e2ffa0d019b0f2afca168b369d661d788558e44c093da4866c4ac0e9a9611731b99bcc01c51a3cfc94072305ffe34e0f8d28e10cebfb76a467f039c865daa9915b1f5602b5cb6cfd2c09e4b1b9b021c4e4d3696721c9845023eaab4e3934844fd0d32925d2e0f1a0a0803880b0a034d71a2fc161a17e3b02269aec2466d1c1b51767cdbd048d303e0fcfda99497d9e3dc8b63bba3940e7214711354c1f241a1e9393957704ad86feb0c2f1f200096234f8c4f2f68170a50ffbfce3fe6e9220ac1aab9a9448d1c48ce4c2452b3600ae6bb7e1b8475dc0a397f2a4b4bfb2302c92661b3c26c9f6261a0b628e48fe1c2ed0ad2abb00701ef4205bbbb1244f76e381c35e36fea7c84474ca8c0b98a59c3eb664c10dee9688168dfa406250c32627f937cfd00905e8c59c8d8b56783ec577649e0056303613d9d29413ae194e974edfd1c0913900f60f63f00d606a76bd760f86e324dd032cfee25301b56b610eb8115ad9cb9a1a35efb5636666c06f8550d4a4470fb2c7154e7fd6f80fa0b27f63593750d0c7647fdf810dc6f2cd321fe591e1fce2275bf69164472c1e01d312abc680f074bb9604ee1eb98f104d4443b35f22764534a0ceaf2a9014c49207824f74e4dff288975c0f400e358f88c351f29af16aec3680c140f319d0a9ec55b35472a732f09c77201b5b10b36e78858aef718ffc2a804db9df5e6948660b29d8ca2915c52f88b000401ae0de18d0fc15a4e4ab95f836b34e100cdc6122949724743fbd7c3c237aba6379a1f1e6f8ba29072e8490748455fd5bf82ada377bd351e59eba0bfec9574859f47da2fa225db94c8dfa0922eb6bbe24d4085644662f4d772e01a299b47fb0ed1e01fbaf6f85b0f18abb382c38af6b39bc9315c2a3cc2fecb20628e617f85d016d4d886960750144fb3a3e544cfb769cc506a21767d0ae9767b3745a434294b5066f03971d92a8374f58621f25e84f181741410bd5b0205315b2e2ed28d3d7a013c29791a15c419b7697d256eab0163860f33c735870bae6fdf213c24851503468380afcdcb9a808b0ed11dcd3f2cabc7996bfa5c0491ac7d4f7ee89f0bf4d1df37b5e5013ceeb105267cf2d74df2df737630d26f64a9fa1de7651aacaf73bc84a091e97fea6ae325728869ccc2f1c622008a8');
		const html = decryptText('d889bc8ca263d1237df956fca18563f136ff4ec4160265d2ce64c132da865298506fd343f90df7e72732ba41a1bc75b3db0beb148ca4d14317773bdac4cf9152ebc6a8da522b4ba7592b636575724931');
		console.log(html);

// 		const iv = 'a83d69028f588cf0';//crypto.randomFillSync(Buffer.alloc(8)).toString('hex');
// 		const encStr = 'f3247886f1d7359e8f3a1914c91a3fe18251363d9e61c85c96c817cf52d64e276219dfcfda94f3b43195748f3cd8eb0de79a5b949b304b768f186c69a280e96c0d10b1a1364d7f28064cd5c631c7215f83010a9ec17691f7a0ab9b04fd8e0ce1';
// 		const decKey = crypto.createDecipheriv('aes256', '208b49ab07ed3228bdc23c08463077f1', iv);
// 		let decStr = decKey.update(encStr, 'hex', 'utf8');
// 		decStr += decKey.final('utf8');

// 		const decKey = crypto.createDecipher('des3', iv);
// 		let decStr = decKey.update(encStr, 'hex', 'utf8');
// 		decStr += decKey.final('utf8');

// 		console.log(encStr, (decStr.charAt(0) === '{' || decStr.charAt(0) === '[') ? JSON.parse(decStr, null) : decStr);

		trackEvent('site', 'load');
		trackPageview();

// 		console.log('\n//=-=//-=-//=-=//-=-//=-=//-=-//=-=//', (new Array(20)).fill(null).map((i)=> (Strings.randHex())), '//=-=//-=-//=-=//-=-//=-=//-=-//=-=//\n');
// 		console.log('\n//=-=//-=-//=-=//-=-//=-=//-=-//=-=//', (new Array(20)).fill(null).map((i)=> (parseInt(Maths.randomHex(), 16))), '//=-=//-=-//=-=//-=-//=-=//-=-//=-=//\n');
// 		console.log('\n//=-=//-=-//=-=//-=-//=-=//-=-//=-=//', (URIs.queryString()), '//=-=//-=-//=-=//-=-//=-=//-=-//=-=//\n');


		window.addEventListener('resize', this.handleResize);
		window.addEventListener('scroll', this.handleScroll);
		window.onpopstate = (event)=> {
			console.log('-/\\/\\/\\/\\/\\/\\-', 'window.onpopstate()', '-/\\/\\/\\/\\/\\/\\-', event);
			//this.props.updateDeeplink(idsFromPath());
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('App.componentDidUpdate()', prevProps, this.props, prevState, this.state);

		const { profile } = this.props;
		const { pathname } = this.props.location;

// 		console.log('|:|:|:|:|:|:|:|:|:|:|:|', prevProps.location.pathname, pathname);
		if (prevProps.location.pathname !== pathname) {
// 			console.log('|:|:|:|:|:|:|:|:|:|:|:|', pathname);
			trackPageview();
		}

		if (profile) {
			if (!prevProps.profile) {
				this.props.fetchUserHistory({ profile });
			}

// 			console.log('[:::::::::::|:|:::::::::::] PAY CHECK [:::::::::::|:|:::::::::::]');
// 			console.log('[::] (!payDialog && !stripeModal)', (!payDialog && !stripeModal));
// 			console.log('[::] (!profile.paid && artboards.length > 3)', (!profile.paid && artboards.length > 3));
// 			console.log('[::] (isHomePage(false)', isHomePage(false));
// 			console.log('[::] (isInspectorPage())', isInspectorPage());
// 			console.log('[::] (prevProps.deeplink.uploadID)', prevProps.deeplink.uploadID);
// 			console.log('[::] (this.props.deeplink.uploadID)', deeplink.uploadID);
// 			console.log('[:::::::::::|:|:::::::::::] =-=-=-=-= [:::::::::::|:|:::::::::::]');

			//console.log('||||||||||||||||', payDialog, stripeModal, profile.paid, artboards.length, isHomePage(false), prevProps.deeplink.uploadID, deeplink.uploadID, isInspectorPage());
		}
	}

	componentWillUnmount() {
		console.log('App.componentWillUnmount()');

		if (this.authInterval) {
			clearInterval(this.authInterval);
		}

		if (this.githubWindow) {
			this.githubWindow.close();
		}

		this.authInterval = null;
		this.githubWindow = null;


		window.onpopstate = null;
		window.removeEventListener('resize', this.handleResize);
	}


	handleGithubAuth = ()=> {
		console.log('App.handleGithubAuth()');

		const code = DateTimes.epoch(true);
		axios.post(API_ENDPT_URL, {
			action  : 'GITHUB_AUTH',
			payload : { code }
		}).then((response) => {
			console.log('GITHUB_AUTH', response.data);
			const authID = response.data.auth_id << 0;
			this.setState({ authID }, ()=> {
				if (!this.githubWindow || this.githubWindow.closed || this.githubWindow.closed === undefined) {
					clearInterval(this.authInterval);
					this.authInterval = null;
					this.githubWindow = null;
				}

				const size = {
					width  : Math.min(460, window.screen.width - 20),
					height : Math.min(820, window.screen.height - 25)
				};

				this.githubWindow = window.open(GITHUB_APP_AUTH.replace('__{EPOCH}__', code), '', `titlebar=no, toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${size.width}, height=${size.height}, top=${((((window.screen.height) - size.height) * 0.5) << 0)}, left=${((((window.screen.width) - size.width) * 0.5) << 0)}`);
				this.authInterval = setInterval(()=> {
					this.onAuthInterval();
				}, 1000);
			});

		}).catch((error)=> {
		});
	};

	handleGitHubAuthSynced = (profile, register=true)=> {
		console.log('App.handleGitHubAuthSynced()', profile, register);

		this.props.updateUserProfile(profile);

		axios.post(API_ENDPT_URL, {
			action  : 'REGISTER',
			payload : {
				username : profile.email,
				email    : profile.email,
				type     : 'wait_list'
			}
		}).then((response) => {
			console.log('REGISTER', response.data);

		}).catch((error)=> {
		});
	};

	handleLoggedIn = (profile)=> {
		console.log('App.handleLoggedIn()', profile);
		this.props.updateUserProfile(profile);
		this.props.fetchUserHistory({profile});
	};

	handleLogout = ()=> {
		cookie.save('user_id', '0', { path : '/' });
		trackEvent('user', 'sign-out');

		this.props.updateUserProfile(null);
		this.props.purgeHomeArtboards();
		this.props.history.push(Pages.HOME);
	};

	handlePaidAlert = ()=> {
// 		console.log('App.handlePaidAlert()');

		this.onToggleModal(Modals.STRIPE, true);
	};

	handlePopup = (payload)=> {
// 		console.log('App.handlePopup()', payload);
		this.setState({ popup : payload });
	};

	handlePurchaseSubmitted = (purchase)=> {
// 		console.log('App.handlePurchaseSubmitted()', purchase);

		this.onToggleModal(Modals.STRIPE, false);
		this.props.fetchUserProfile();
	};

	handleRegistered = (profile, github=false)=> {
		console.log('App.handleRegistered()', profile, github);
		this.props.updateUserProfile(profile);
	};

	handleResize = (event)=> {
// 		console.log('App.handleResize()', { width : document.documentElement.clientWidth, height : document.documentElement.clientHeight });

		this.setState({
			contentSize : {
				width  : document.documentElement.clientWidth,
				height : document.documentElement.clientHeight
			}
		})
	};

	handleScroll = (event)=> {
// 		console.log('App.handleScroll()', event);
// 		this.setState({ scrolling : true }, ()=> {
// 			setTimeout(()=> {
// 				this.setState({ scrolling : false });
// 			}, 1000);
// 		});
	};

	onAuthInterval = ()=> {
// 		console.log('App.onAuthInterval()');

		if (!this.githubWindow || this.githubWindow.closed || this.githubWindow.closed === undefined) {

			if (this.authInterval) {
				clearInterval(this.authInterval);
			}
			if (this.githubWindow) {
				this.githubWindow.close();
			}

			this.authInterval = null;
			this.githubWindow = null;

		} else {
			const { authID } = this.state;

			axios.post(API_ENDPT_URL, {
				action  : 'GITHUB_AUTH_CHECK',
				payload : { authID }
			}).then((response) => {
				console.log('GITHUB_AUTH_CHECK', response.data);
				const { user } = response.data;
				if (user) {
					trackEvent('github', 'success');
					clearInterval(this.authInterval);
					this.authInterval = null;
					this.githubWindow.close();
					this.githubWindow = null;
					this.handleGitHubAuthSynced(user);
				}

			}).catch((error)=> {
			});
		}
	};

	onToggleModal = (url, show=true, payload=null)=> {
		console.log('App.onToggleModal()', url, show, payload);
		const { modals } = this.state;

		if (show) {
			this.setState({ modals : { ...modals,
				github   : false,
				login    : (url === Modals.LOGIN),
				register : (url === Modals.REGISTER),
				stripe   : (url === Modals.STRIPE) }
			});

		} else {
			this.setState({ modals : { ...modals,
				github   : (url === Modals.GITHUB_CONNECT) ? false : modals.github,
				login    : (url === Modals.LOGIN) ? false : modals.login,
				register : (url === Modals.REGISTER) ? false : modals.register,
				stripe   : (url === Modals.STRIPE) ? false : modals.stripe }
			});
		}
	};

	handleToggleTheme = (event)=> {
		console.log('App.handleToggleTheme()', event);
		this.setState({ darkTheme : !this.state.darkTheme });
	};


	render() {
//   	console.log('App.render()', this.props, this.state);

		const { profile } = this.props;
  	const { darkTheme, popup, modals } = this.state;

  	const wrapperClass = (URIs.firstComponent() !== 'app') ? 'content-wrapper' : 'playground-wrapper';

  	return (<div className={`site-wrapper${(darkTheme) ? ' site-wrapper-dark' : ''}`}>
		  {(URIs.firstComponent() !== 'app') && (<TopNav darkTheme={darkTheme} onToggleTheme={this.handleToggleTheme} onModal={(url, payload)=> this.onToggleModal(url, true, payload)} />)}
	    <div className={wrapperClass} ref={wrapper}>
		    <Switch>
			    <Route exact path={Pages.HOME} render={()=> <HomePage onModal={(url, payload)=> this.onToggleModal(url, true, payload)} onPopup={this.handlePopup} onRegistered={this.handleRegistered} />} />
			    <Route exact path={Pages.FEATURES} render={()=> <FeaturesPage onModal={(url, payload)=> this.onToggleModal(url, true, payload)} onPopup={this.handlePopup} />} />
			    <Route exact path={`${Pages.PLAYGROUND}/:teamSlug([a-z-]+)/:projectSlug([a-z-]+)?/:playgroundID([0-9]+)?/:componentsSlug([A-Za-z-]+)?/:componentID([0-9]+)?/:commentID([0-9]+)?`} render={(props)=> <PlaygroundPage { ...props } onModal={(url, payload)=> this.onToggleModal(url, true, payload)} onPopup={this.handlePopup} />} />
			    <Route exact path={Pages.PRICING} render={()=> <PricingPage onModal={(url, payload)=> this.onToggleModal(url, true, payload)} onPopup={this.handlePopup} />} />
			    <Route exact path={`/:page(${Pages.LEGAL.slice(1)}|${Pages.PRIVACY.slice(1)})`} render={()=> <PrivacyPage />} />
			    <Route exact path={Pages.TERMS} render={()=> <TermsPage />} />

			    <Route path={Pages.WILDCARD}><Status404Page /></Route>
		    </Switch>
	    </div>
		  {(URIs.firstComponent() !== 'app') && (<BottomNav onModal={(url)=> this.onToggleModal(url, true)} />)}

		  <div className="modal-wrapper">
			  {(popup) && (<PopupNotification
				  payload={popup}
				  onComplete={()=> this.setState({ popup : null })}>
				    {popup.content}
			  </PopupNotification>)}

			  {(modals.login) && (<LoginModal
				  inviteID={null}
				  outro={(profile !== null)}
				  onModal={(url)=> this.onToggleModal(url, true)}
				  onPopup={this.handlePopup}
				  onComplete={()=> this.onToggleModal(Modals.LOGIN, false)}
				  onLoggedIn={this.handleLoggedIn}
			  />)}

			  {(modals.register) && (<RegisterModal
				  inviteID={null}
				  outro={(profile !== null)}
				  onModal={(url)=> this.onToggleModal(url, true)}
				  onPopup={this.handlePopup}
				  onComplete={()=> this.onToggleModal(Modals.REGISTER, false)}
				  onRegistered={this.handleRegistered}
			  />)}

			  {/*{(payDialog) && (<AlertDialog*/}
				  {/*title="Limited Account"*/}
				  {/*message="You must upgrade to an unlimited account to view more"*/}
				  {/*onComplete={this.handlePaidAlert}*/}
			  {/*/>)}*/}

			  {(modals.stripe) && (<StripeModal
				  profile={profile}
				  payload={modals.payload}
				  onPopup={this.handlePopup}
				  onSubmitted={this.handlePurchaseSubmitted}
				  onComplete={()=> this.onToggleModal(Modals.STRIPE, false)}
			  />)}
		  </div>
	  </div>);
  }
}


const mapStateToProps = (state, ownProps)=> {
	return ({
		deeplink  : state.deeplink,
		profile   : state.userProfile,
		artboards : state.homeArtboards,
		team      : state.team
	});
};

const mapDispatchToProps = (dispatch)=> {
	return ({
		purgeHomeArtboards : ()=> dispatch(appendHomeArtboards(null)),
		fetchTeamLookup    : (payload)=> dispatch(fetchTeamLookup(payload)),
		fetchUserHistory   : (payload)=> dispatch(fetchUserHistory(payload)),
		fetchUserProfile   : ()=> dispatch(fetchUserProfile()),
		updateDeeplink     : (navIDs)=> dispatch(updateDeeplink(navIDs)),
		updateUserProfile  : (profile)=> dispatch(updateUserProfile(profile))
	});
};


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));

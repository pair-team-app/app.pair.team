
import React, { Component } from 'react';
import './App.css';

import axios from 'axios';
import crypto from 'crypto';
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

		const obj = {
			id  : 1,
			msg : "Pellentesque eleifend, dui ut consectetur ultrices, justo urna tristique dolor, a ornare nulla enim non felis."
		};

// 		const encKey = crypto.createCipher('des3', '208b49ab07ed3228bdc23c08463077f1');
// 		let encStr = encKey.update(JSON.stringify(obj), 'utf8', 'hex');
// 		encStr += encKey.final('hex');


		const iv = 'a83d69028f588cf0';//crypto.randomFillSync(Buffer.alloc(8)).toString('hex');
		const encStr = '63fecd42550f0a1037fc42ffd91580738f286067e28e28286c8488ad77174baaf3ebae6529f7b4a45660770dd8cea9679367664cd7258b6325426112240fb65c7170af7d18781c53c00bf1d302eed038fc9634dceb6df45e1cd94c2783ac046ee3a60a2c5bbc27a2d87d649e20ee8759016c2ec2c13e9537a0b3b721bd57506c407cfc327c269a6b09a1d27c0457bb0d96ace88be2618f1a1d2288ca7cf70b97235f21781c3138ec3a722682c75727f035322aa0745e7fd659ebed0619b89a191b5ffaa23c8015b7ef3dc4ce334e65a1c2fb5c86bbeae30c1ef52f4155400b09ca8cd934604a9f98062fa9da96a420111a4a9a9d9f1ead073a38f15e4ab708082083ff01a62c01404ed714619c8b41ebf78f9a6f8c60692e72517c6cd0229e523d93248b72f072e72fb920e7794c845ce17312a6804b85e4671cb9352fd10a8da1bef256875fc94713ee7b2fa3d753ed8c7e1124cf28b599bcda1ab3abb0f6d6c71e0d6afa20ea31f099c2495c8a04dece08265995f893ea648a8de2df79385f3be5ba5a023c767b7144d6628732a0ee0414831ca8fb6b0a3d2a8a56e39d5bd5169e1e6a7ee93587fbd87cc3f942a6b903bf513e38c873907c34b428edb42a4702441031170736d7e577ca7fe1b2c8c871b14ac62fca66103851b37c704c2608d3c83ce2af3432691e6b36a4d8656bd43cd093b77497e3f86188c00407a82f73c43f187bd273b6c03e0913a1c5f8fcdd92f5db7a67f34f3929c166971beb7b3a6dcfd42bdea9747a9d87a4a8c393e77b52c13dd4854c64d4696948b3256383bc028492060ff7e708164ec8a62fa8b2cd918cadbc4960d24a06aa9b5f47913daa2fbb4afb5d87bab738893e2f52e7302bf218ac5d9e73820d3365b259e25da2c3900ffb5937194d0121028deae230f08faf20142a8ba638e57239bf4231b2ca90b32be26b6c2428911f01013c048095e0e1e1f8a7dcf243911f3a90ceba4b50bbfc407fd0f7e2093263e4fa52054abaea0fbefd4193961b751e33f17d4c45c902e21e16a0665883ad0af516b7d7b023f018bd865e08cb5fb5b6fe613f4131367d643536895fc4e072d2407c3ee483daae7c72dd45aac31ab009951bf451fd1fa2edf5a227e93f94223527d2b155a3552f1f8af15edd2c03fd771c6f1f90fe722ff41f8ae15763663bcaf122f65717c91e9d5ef501738549ba0a5eb03f3fd4a09d5810b38ee410bbd5695180d85f0d3442e4f551dc0288e0fcaa1a3479189fcb0e272550661272355c4427e5ed953f35aa23c12ac64ba5b7af45d9c696c47d516cccb04aee978437c42ac82040a58e7f2954281c30ac05cedfa89e09f37d5ce48b6d964d61e3372f5d584abd9c8770683ca15e617e4a3c5ac7a53d23936e60daac40c0390551eab242bfefb1fe92313ced32cf9fb1567ae5ab886d260268ba4ed01d555ddda7fe9db8b8d63f73bc39b53c9f8a605151592d6abe561bbee67ac5574224272f0ad5ff22d9047b87767e212773138169bc16ef92ef602d8cf65072e91e4e33da2900b839c065e04bd0d3cf56103a2137f86158275d8f59aa967c7850b6476fb1c4ade1e2598148595d73fe457934ed34bdacaec0aa8db7a5805dea9d1fe24042308d2cf46547416cfbe3364edb30e22569062dda3672a7464c6c930113477a0468472eb45c167d18260390fa5bd162337b910a1c8f5651f716c5f60fd8bf91ba826d1c70c292ed050ce7d4974ae0c18f06653417f4cf4315f7731e4d6004742f48ec0fbfb784c994a6f22a1a1924be197b59cd83de14d77287c1bcacb855725a380d9f920ce86a08a59010c30431e28d316840034234d69d235d0d416b90f784d78f31ef0fdbcde58d0bf00ec5728ce58dd7be89819e14fac43f16866d1479b3e92aaded689f9fcf55bf935d5b7606097738f5bbe82f3f212c86f1319d3550c33c4329856663b12d0b3757da2ac06ed8acfc27d6f3e8af1a1feac421d509d2c341acf5eed0d4c0173113951d4890f00ad7a38efb013729892d664d0c0f93ad7bc2b96b181e120ddf65e753078effc9607cf270049ec9813322c7fb8eb086c93ea61491f0196b636d9ab73c37107f41d984f4ec0ec2e1ee26ca3a5df0cf3c3ab6113cad15c0d13a65c34f7e13d6ab1aafe9395216a7dcbc6ba19b1b66b5174db1954378152583f7899277b55fb0a0f6ddfb1a1c0339d72eff66f9bf311c99bb8abc799e82d08cc89a133bff9459ccb43e10a5155d0b8b68abef59b510cf3d6606a16b0fd71f691b0571e0cee6a503e062f1389d936cec365f55b51b74374840d4ea1584cd0abaad50f8e457da82885a2fa3ad65dae04a70cdafb5bac48c2e796c066721f6ef9706a20ab77af1a3f352614199f394a4b4adf75e24a5bc1bc31ae5b109ad8c041e38d82c76a4df0d21c9e1dd7e39e8fc3db72de66bc23a5ea3e3c15a866354b8cad75cf89d7ba962c906c8dee9eef76e8b27a11561773aa4a5c67bbc0a9ad60662559bb5b4e6d50e041ee0e01f1e47e027f7b43175f94a468f2a737fa4cd5ded6af4eb27179dfc12eec22650252cb648f1ad10673162f7439215e526a599449542977dc2d2780dc00aa73ee88bfeabfa4df03a951009b12f64174dee1c93abe579ae58a2b807498bdb54929ba98ed86e9a4339443ea392c7bab1447a48d2c1ed10a01b88b530ff5187035dbaccd4a0435cc109831c271c7350ed82595d6afa95099d6ee10d873be9bffd93663f028824e9900c9a5979f7eb33e17402626b1d10a8ea3d0989c36023a5a196cc4bb57b42015b3a9cc692dd8cb9b0e959c6be898e4efb6010c33c1a8bcd0a455f79efe256fcd03472094ee471f4d0d866d475e3e6a28ca235164b57bbe4278ab85160ee284f284b039260743d573f2ca8ef03472b3e9f0c4cd91dd9af71f18daad5fc7a55e55f91becde162220a61ccecfbf53f6ca158756ac3a988cc0c66632a5ee2ae1a7b6a2497ba3c55602409b5c4cb5a9a2758a9951bdcaac461846a748823efcc6b31a59b9362024ea4f4bd06c083db1503ad4a611191fd6e5c265204026a7a163c1b3acd12f989a41af4268ed10a1364e2ea94dcf80e61ea506c868c2728b6a004e92f4a761bba41b177a3e7867382524a0462bec4354a69d29cb122d1ae97d60618ab6ee0612d3b7e6f28dbb499802a6f7b80c16af21db7bcfad5b05ce6844cd3488ca39ea39a85dbbbfdf86411b9ac82702ac94f754258a09b022c15b9eed340090e19fe7cc4b7a18a0349f5a411822722aa42a4884d04e415ab7d366902711e772477b512bb35d9a5448c0486ce6b9de20db07f49f73d366504daea6410ad773e9c349b5db6f272ed67986669fe8a3437465a55bbbe6c6f1791ce5b796a0fc2a98ecf825f0a0f71f5e364055b4905e8f88275350e521015f54438c6c76a9e61d32125fd2027fa60213eb3b5e4d764df81a43ec83a0d105ef664b87d5f7fb8bccd341a784acc0ff504fdd47bd002614f4c2e579a1f92643e61a31b39113b0f355a5477e6c1547b1255d02bb854ff29ca7739c37dadfd06175a3ed6e5607d3e403c6b53e2a19af36a701620e123d351d1ffb80c138fb1312bd0fe660850dbf029f6d4ff8334128b8c4b7931597681fc2e4d00dc541a5cd9fdb51b5c825caa2f503cf49ceb3941c34a1572ba9043fe8f23953f6810a4d8359e490d530fe2d284cc614e035ab82e9c910107d6b9912c70f666ae23a2c15a8832ceda679c3548c748d3207144c258681ea0bf60ba5d02d2ec7813f92456a51c079dad2fc8be23333d24485c95cd959cc3e9d6c2fe5406ff6a2fd28d3b058a50e2f868ff1a8db68047656b85259eb166c82c0872d634417ad808a9047effad1a60b075de7492accb8c4f9a57a6ca93b717af7e19467c6f88d592f7b25733d47ad21d889a6131f0f09c5acb084f459c04a14cfc2476b596bffbd09743f02e910882421b6c39f2fce60125cffed31d45cacb1d37635ba45aba68bbbf870d9cebe215e9372208f4c59e4aeff740a6b6cf70794d45cf09bb8f8afda5afd53e7d7ec5d6c3087b0e3950f08e3dabb823b59531afc536811ef7ba644182649b2cbbcba8da57991bf7c8015a95afda6c7d99a46a1b5c70a9551cc7c7ab3f0d8e45c774d78ac25668e2ac32415b5e0181ed0d1dda9b067f149fa2931eaa048575edd743d5b40030cd4867ee8456b1762b06abcd11c1d59442f448f52ea0deb46a136abfa11cc988ed963b8a91433a444daa769bfbb13104c839ae038aabb08b72866b3a0b72fc80a188f6642f59ce69cf417c5f30cbeaa694f140159d8e1937bd1cc5c7e5136e9bb4b8c7f2209f0e77b04cde2e8e719bb3add00c4e24ca2d1c13f2ed4285f1b2e96b019970c127918a41548ab236cf8208f054574a5b2cb75792632a2e55890286a1c8a1b6088a187f76e2fba57b96f19204884fa2a5418da09ba664f96fe03e4d6fa773815ab2946ad4559d5105d6e1a4e7d5afe42b34a07c99199d791f717fe112e245f8b8a6e215155ee823de4aa3c81a8e2520a3331d5e60feed4059ce6f6b34d733cfccb7d1483037223a8a225e091fc09261ab7b72f6a676c8c19ae7c1241cf01d9b803accae8e4a0a24c7bbf1d18aad3e7ea5d101363c3f0d2eda9268a7898c0cb6409ac444b4b0a3f71a97c8430fc73a4c9b7caff6a15960e4db0920137eff231d926824e7d6a52bf82daae1056d25b430de3a563cf64a26ffe3eb296bf001aa583d9b19f4d32db1188aca34410bea0547111cf1675cf40a173422447aac226b00b9513360f7595c770c777d5423912452c0d8d59ae3663e299b6d0c9316c12acd20c4c6c7e8bf51462654a748d0e194ba212d2061f02ece8c3d430ad5349a569e90d6fa5437e60f64d59dc7cb4e698410ccde48ab63a42c6ad24062dd5c7aee7b30778185be7d1aae8c337925f891ea3e4ee1e9ad0cdccad94e1dc6ebbb15fe86e7c8166587ee07a5c8c8469c8cad7603f2c4c5c209166b9d07363868f0eae09d000c32cbbd8969a6338d6addb5758d3b22192b6d2731a077e3212cbc397bbf2c657a4b6c5d6b218acb29d1600ca510eebf20a6bfe3a731ac7260804421810f9cebe38bf5fce0625dd3ccf2f6d52e1191aa9f67463d5256b5caf3538a5f2b7760d99714a01b0fa17919411c5d4633ef2176fdf828c3f0798216d0299c8e985507508f53148ad2aa940073ad457a45fa2bf3fae2860160024436de014006edddec3c8d814b002906d623a786170a7f712a13d64502873942fc8bdc10bfbe7a8aa014796d8915cae6c857fca43ee6e2956a75f6e52b223112e45d96d8551c15f445b0fb628756793beab3c048512a9ae5c2bc931da8fa0bc3129a13fcec1b15dab11b13a5e8f463011457f3c7f0f4f13abeaec28344c49558730bade6eaeed5334f6ebb5278fa080f1fec8078e260b3853e5d7bfa4c8452545b25fa7cad2a208bb67a1ab1a3ad12225dc71d45451cb6d78fba26ae391540b77ce9bc3937be80a8553cfdcbdae8ed30d44acc45faedbfe7dbcecf35d3058878b8104287968dfbb24075115677dd3f53a4d4eeff6b3e2ede35e874f02b6f5fb9ca34938925eb4249a169b5fd81f82a6c6006998e215dd6d7c29663e579eda6bc643183e82121f22d0a434336e802ffca82ac52cca1320afbf98d8c0654d445e41b223a92f8363f32acd2e0f351f773727e9ff80a6c2a14e41dbd53efa599a53e77494aed4263a36ef058798d75b261a0a7a8d8e61c2dc362e6cf35701c0d1f3c894eda6fcf00dabd8edf9d0a3aa8cce08289f62f144522c147b7dd8c6d72c986cdf56a7715b0ee8f3eafb434f0304a162fd9e3966b446a17b5eee73897f658819758e13a1734433b1153facf2259141be4813121360857ec48f93ceeed2f6a4cbd1764b7f632fc888f0cafd0f05275550a809fccdf80c8c938da25a205f1ebc29aad73875e4202f1efe229290894cd669500e1fcc5b3409340d88c1112d4708b9b3cf2fead94c0d4bd8ba8146d29428f8676a755abef30007b1ffab9c1ae7a7c54c45ce839c590c62fdd5ae35341fd415d65e5b0908d7f74c72ab28fdab5f7c82cc2275db1ed2dbfe6514b6c7c9d92af9a6610fd2c921d00e1b310d80e17392258032f1def2a68245ee0501c9cd1c8294b299d32ac43fc6e85459d1c7ff6f45b6a299425da00c13d85840b811e1f07837c6f26a5bb5743c11253ee2cc97be457509562303b0b4c9985bb4c551fbf841b41fc307d6e5c5181ebcc386a10f86962e8c8965cabc5f91b316b76879413e5ad13191bb268fdcebc11589dc504815ee1e99daa6e6878e4ee2952c0c7d6baa4d4fd86e95f0a052b364f6fe22cc0157a0d732b93591f65c8d6bb9df9cfed108b522502b948ec56cebe75ee40608d1b97cd415b0532ce73f3a9a8dec26b7607b8bf1131ac2de7a95db675f21cd6886cd0c16fda29f1c34dfe10f5c7c2cc25b90bbe297312eefc74baca2c5e5f638d212e4e89a7602f65e710f86b6b7ee959658f6f2792c86566496041a7420db45915c7a4c57729179e95a661092bea258aaae06626284331b75e28b64238f54a228f32b0a5ec2fd52ba7560083396dc850a7194bb9cb681c5a9ae2309e9a946c13d840a9704eef66829b8291526eb7c0636051c6578b3f27fe3daf4799fb75ef2ba18bfe3c99dc4e47272d369d774fa165ab7a6b36845b89748d9e606746618074b149638711fe7942ea64aa5ed130819b30cc8768d5ffb377ee8d872409592526c93a83a1439fbcd29fe8cc6e7d5c67b5c72db61b4ca774a07925f088102430d31b384f1d38cf28eb084770869ca9ef7926a57a2009f391d1a20e9598b38b96d7947c570b7401d32dbeccbc7ad13bc87cdd4ea73d45c184428a5af63b927b57e2b8f57005af0fb00aff9f8f001ca32d58f06a7a97be3b328f130674ace439c59f4838ed1dd97703e827bc41e6993cd16fd4e7fcae4a7bc7af837e934cfa1927de119132c986560fe4a848b25e2b5b138f2bb0264561';
		const decKey = crypto.createDecipheriv('aes256', '208b49ab07ed3228bdc23c08463077f1', iv);
		let decStr = decKey.update(encStr, 'hex', 'utf8');
		decStr += decKey.final('utf8');


// 		const decKey = crypto.createDecipher('des3', '208b49ab07ed3228bdc23c08463077f1');
// 		let decStr = decKey.update(encStr, 'hex', 'utf8');
// 		decStr += decKey.final('utf8');

		console.log(encStr, (decStr.charAt(0) === '{' || decStr.charAt(0) === '[') ? JSON.parse(decStr, null) : decStr);
// 		console.log(encStr, decStr);



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

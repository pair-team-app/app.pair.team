
import React, { Component } from 'react';
import './App.css';

import axios from 'axios';
import { Browsers, DateTimes, URIs } from 'lang-js-utils';
import cookie from 'react-cookies';
import { connect } from 'react-redux';
import { Route, Switch, withRouter } from 'react-router-dom';

import AlertDialog from '../overlays/AlertDialog';
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
	updateMouseCoords,
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
				network  : (!Browsers.isOnline()),
				login    : false,
				register : false,
				github   : false,
				stripe   : false,
				payload  : null,

			}
		};

		this.githubWindow = null;
		this.authInterval = null;

		initTracker(cookie.load('user_id'));
	}

	componentDidMount() {
		console.log('App.componentDidMount()', this.props, this.state);

// 		const encChunks = [
// 			'af6a7f6d16995aac3063c9a7bc952c398d570232aca803df7435cbf906cb3966',
// 			'd4733d1cd6f448ce03aa5cecaa09169e1a6bbbe661ec16902ec914d74d6a037d',
// 			'4a69db4190ca293aca9fd817b30f000b625c6e26c49283a2f8ba4db2d8ededa1',
// 			'f1e47c1e39adbafaee3c49825c314efaaa06c28196679c38ba763e87f1712706',
// 			'cd7f07cd3654fbb703f9dd3f9d5a4b4b0e27d5f4af2fe4cb4f4b5d3aa0739d76',
// 			'ba313007bb7edfb5a273321185be66e36d36617e8164fafcc717cd6122c8eb00',
// 			'c4e41f3ed0ec25d5d55914b1694b0213b495f9223bb99ab2b272964cf3a48509',
// 			'69a1875e84990f1bd3c45e8a844cccff1d8801e987818ad99eec0c78b3f587c5',
// 			'8c52336512c6792d1139b841f33ab9e3d6a91615d9a8d74ee5ef84a6f4a01400',
// 			'b6242caa5042c68bf531197b1fd0aac28af1661a12bef4ed2e2ada0b116b3e6a',
// 			'2ae0ceddec5eaf42f1b87962583e73ecd6c6074c91585fa5b1ca5a66e7bb463f',
// 			'a708806d40e914f405ad49232848c44ab87e200e8c1363ceb6fce0bfc7ed5b02',
// 			'86921c7409e51f64c1df9222b3aec1b9c729aa143a533fcac3e4b67277d5280d',
// 			'a4a84042b80ab074ea1b62f2d473ab662f64b7b3fb8415df21ec263d46f831a5',
// 			'15f1677fc4e1568e964180b910346a0ffdd250934e53bfb300e9cdc3a528b8c7',
// 			'93ef31eeec8762c6cd12209855f76263dd59b022ec2a614bceda0bc55739311d',
// 			'c9eb5005459eaa4c255803af6c977dc280285d6ce0d23ccc60ddab3c05ba46db',
// 			'd5331efbe2a7807ebaf5c1b1b406c90dbbe4dd4e1fe9aa7d4cbef77be7755232',
// 			'd6066497daa04469a3b8d1d2392e242f3bd9a4a2d73e3643b6f870a7ec38613b',
// 			'65abc0cd609eba3fb27a1355ee569c1396fbc5b75b6ad3ad9dbcf1244d23ec50',
// 			'6b5369c64122a36b9e82e719c98ca9d4858bd2b9204b8ca3e19422cf93b61b8e',
// 			'2a9cf6407530cb244189eb88808dbfbcd166d56470a65491dd020edc4fe0713d',
// 			'd584b2190e9c04478e20b7940f34dc4e5ec7b45475e9303e7c99ce0807e39c51',
// 			'da994ba5f487095f64a7814c60c04179a7ae226eb148f03586eb5b19720d0a07',
// 			'29fd73ae85a2120985cfbbce2d577ecfcec6b2269d05bec87e89bf8c737e829a',
// 			'c68153d72a0dc0e283c25bca606fbbc692d71f514d7303142ea316a159c1c224',
// 			'9862375f49c14110079ccd127ac528d07114cb6199acd5838e6e8c4095759216',
// 			'f2f1067627047a4ffdcf74f6e331685664a0a1f2bb3e0328b9f804325c65d6f2',
// 			'4c6ef49b72e79a718e2c7a07656af5bf1b5a85e12bc1bbc667c94b5144184f33',
// 			'5b6d3fe24594b23801537314492b4cdb3a2292e4017657fee1f6cc0141dc22e1',
// 			'73e06066252e1d04c12082797f4cfc069ad202eb52146c411404fee5a573c71e',
// 			'279a83da076c159a374a2e11ea75fb00b1ef52934d1b0fb9e952a1eded87bf51',
// 			'a4bd64c2f46d24232992efee98632e7295144b9799b3dd76ce6ba7bf11959cf5',
// 			'bda351d6d59c2fa06f5e2a5b68d60145e477f8b33c2a8dfac3ded16b0aa74461',
// 			'ed2b295c035acd85e770c415a2c89fc0ba28276ccb9834154ffa09ff412f9eff',
// 			'5bd8263bb68a186d9c96b77b1b996c336feed89ca9cdef11fb2457f02418ca87',
// 			'21a1c67f966f1feb9fd74f1e7eca323cb2705cea5244d0a6740a8c4d6c5ad5de',
// 			'69c46e77b9cf2304dbd3ed20f52c9d9c127fce0755633193381cded3f9a8024b',
// 			'bd6ac921050d37b88e7c2c33dd275afa555b2f82eab5817baf71ab7dea3fef18',
// 			'274eb89cfe3da30d1acc949a6d47ebead4b90b71b11e2ce307a9356044129bab',
// 			'213a419a4479bb0bb52f7a203fbc432459742459112993e8176e21a60377cb84',
// 			'13270a6779f2042205c42cb45bbb9fab19b03d672482988f6664612cdfb67dc2',
// 			'bb28d5e8b25a4c03d1314f3ea42a897a161f86bf8148d2254b3d514b00cffc24',
// 			'771ab72fea1b8d51c7021f75eaa18f78c75f333e8dcc530946cd701de3c750dd',
// 			'6f5fbb925f0bf500d0d18c94bdff061c0a01490d04596930d244347521a1c0fb',
// 			'd87b7dee01b89f1fc05b2feb43c34ff7846840dfe6a0f31cd97dc7afbc079630',
// 			'815018ba1492e7041e36da5bfe20da70179f328281cf6644627f0a8c97c304a3',
// 			'a42bd6b8ec695e8ab14be96ad606b44e2b91617af0d638ca46c683038952fc05',
// 			'64ee8b9fccdc5340ec57a9d6ecbffc3102602908d9d3f20470e3a7b6a426966d',
// 			'c416d65c6adc3e19efae9655d44217e33857ebbf0073990edd4293ab99ce321d',
// 			'a4a85cd2d0feb576bb54d888d788dfe5ce1ebdbca811a12240d20c05d91c3ea8',
// 			'1ff751523fb1c8c7f1e67d295ed4391edf7ad28a493637c7b62a4aa78d305c1d',
// 			'7d72b15632604127b3af2a81e1c395e317b50ed52afa324f728439799915b597',
// 			'f5138a8636a885d018d11f7022bf87f350c3d85d066c3cac4810f518f0e7630a',
// 			'b4ba86c8f49c8e9354566ee5c30efc31bc6bf7c6b33a2b60432a24498abb8e70',
// 			'39a3c0c05899f1a884a49f69ea0f4409f163925f182a5b19e38bfad22edc8aa9',
// 			'383e630cd19d637c068c12b9dd3cc0478e7c7a2c0adc970fbe6dac42194deb62',
// 			'958517e72d885a6ba48d4a7827117b787416f9b03eadae99edd565c0392af345',
// 			'0df2812c1179760f07a842e9d0b76811d1ae8c1e0dba750c631246c2c97b0302',
// 			'aaf2dca82e45f50ade1c818562e3a113ffb0ff4d5077907097ae4f2da17e9229',
// 			'9ca668e1cb54a96e75c9fd88e10a1beb01b10e27907581d64918e0c70bdf1da3',
// 			'2398d38558a2110e720d55fc349011df789d8ab60ae2ed41ec27a10457e27ac9',
// 			'3dcbc722a4d21884972871491bee3cffb2b3d6576de946895da51b1617f40bc8',
// 			'739c710e8df7fb63661963d0e9338f1033224e04959b2da4ea5ccdc040188bd9',
// 			'55d7607eb3a4f70dfd682dca7d66fc48968af872797a799ce35648d657e0eaa7',
// 			'7e1611d2d89d0a2e144871f952b5e73bc381cdf04471e8861731074b94982d04',
// 			'e06bbf4cbf1faa9adb87498f01fbfb5e5036c94f8a4219a12cb9fe8f78fabc00',
// 			'a7d0dbb67b0e312551c6ebfadc8a6759abfa8cc05b1032090a7a8e33ab0b70a0',
// 			'fe34b6bcf795aced46803e03606ed78c4bcd2baaa4c2c07139ff1944a48194d9',
// 			'10ca54a9980e039bef121926c23135c6f193e477c16e9b642aa6f7b59f5d787d',
// 			'7f1c7122c464d8e4f9a61151c9fc5435bdf94165571e3dadb8af93bbd44a2ecc',
// 			'c559beb74dea8a3ff4f851dbd7d40da6226394720868c41abdb048c87386b6f3',
// 			'801156d45abba069043ce488bb9de3431154493d23fb5e5624c9cd353924e466',
// 			'836db664ce24a694c1117a9d8415d69b41d1d752ecc6d2a06ea9dc8bd15773b5',
// 			'ab0e7d5b2cfbdc20579724402b40f03cb25425051a8d8cbb769fa3cbf8bd90eb',
// 			'2ab4379f1ff70ee7e1ab17166b356ebf9fe807e7a2d17e1528acee64b1e257d4',
// 			'902a20512be4661d0e189a31598922a5e74accd7f63ae97695de2b5d3597f999',
// 			'7349d050f29b4275a662a5f85e9b025f1651fff79fb091564dcf174dc405c32c',
// 			'9b7576bf6133eafbc82d7c43628a7f3d0daa7ab3b66f7c5964983c4d5733cb78',
// 			'0d7d6032dc3fe72339cbbece8b6cafc90fabd1d29e06d5f50d8d629e0d0d2b81',
// 			'1049c65e75b2250b5d9e4d3a7c1285ef7d47a36aba2ae7b726f5e227b7f88c06',
// 			'33fa2afc9e06d229c38b3ec1d0ad5b0429f435c41573d25383d2e84a32040d98',
// 			'2df4a47e0d167487f12d9f6249bce916269ddd5fe7523664654139bc6cedf048',
// 			'6939b7958944d335f2d3dc74aeafa40da66b75b1cb40f4ddfe223bbebe5a8fd7',
// 			'4865897c0397b04f2f2a68498ddeb59410666a4846c77216aad892374b51d41f',
// 			'6f1331bea44ee90d6ac6de31b69d88385d9283b59a0291a5de3a9a9b39a4be25',
// 			'5eebc9b9ec6296c72b8865f8ee23dfe360a9b309561a362ba869cf2141c3d646',
// 			'1b0a751b15c8adf8af5b788996e065e97a33a129c1a9781a3f387e13b8c94a47',
// 			'4624943821b1889f5c03128624866dab9964b40ea84af19e12c213c8c19f8570',
// 			'3a7827ef863fdbd94e1dc1685080aeed59d6f5b22e9295f12ddf590f36a970a1',
// 			'dfb85943b19f786791208ba91c89a00ca1925e6b26db87f7c6ed1a7cd810feaa',
// 			'be77c42a969444b1be02d46fafc5678d6c80fdc65564e31f97668e72bbf8be91',
// 			'073307159bfc4b267837c5104ae25d8f1b371a835715c13557b3841764ed734a',
// 			'b6159f9ef8dbb166bbfa624f02524a65603e2ef1b455b74020243ca4cbb1e725',
// 			'7edecfaf785a070d68770e54a9bad99111f73c88169f7a2e3e05c2178cfc274d',
// 			'acd87b2f366dddd448aa47de8d0945e9d83de0bcb97e2a93988d66ffdea12e72',
// 			'e5cc4da46da66ca6bb7d36325ea6b8d6a91c46adaea8c7c8c5d72631b0e2df5e',
// 			'8ec9cc37e41901e8c62fd941f41c23f11c3d56c68c0de918c59c1971a8f7f672',
// 			'8d1fd74c11ade22601e16c4250e4ff0cf91622bf8dac57354f1a90e0ce9d7827',
// 			'09c378d9513be97f11f7ef6a771f3787d6b5b1fdcdeeb66fb00971f3e14d9643',
// 			'57e808519033a8c927a99cdb7eed5f6833eb1b529404da12181e9445eb3627da',
// 			'0013986e966aa6dc2b1ada96e27305bc18a23c8248f695dfaf579ba0fc5d39af',
// 			'019c47370736e3ddc6536f5cc9b56d6afd276fd7dd6f45e3debacf3817113aad',
// 			'7dfe7d0de4d43b76bb5760df7b22da59ec9cdf1d856b22969082b9df51adbb23',
// 			'93d8dd2126f494807d914117cc8b25fe6ac85b98a4a238ce3a5c547de4b81b16',
// 			'da05494d4f6577da463d203b770955b731b23f04b35fa39910ee2bab8fb77095',
// 			'd578b4f790f952977f5241c1b63d6a692d6e06ee27e8e6aa49dce37b3daa707c',
// 			'cc3d88e6d99ac94817790b72c91a6bcbe19def1043218859c6cc5ea0ef324dff',
// 			'19621596bae01549c41e5dad233ac3b8b7fc0ed837719fabf86bbb64bf021d29',
// 			'57c25773bc9b5178df6912c45f91a7f1c561b69e08d5a665df4a52d3abf89cc7',
// 			'ea594e132b6c7f6df98ba38865dc491a05c93a10aa0b26f6ad66ff4ccd5f2786',
// 			'b70f6dec708345339e326f7bc5212a4f56557d9b153167a4b324b71cba0713d0',
// 			'3d6381b6265336775ab0f07ed90a3378a0cc4433d11cc0a51e1e95fb4082b761',
// 			'4efcc09feaa9fd7105965a7550fb98aa929ebafdfa903b83fcf169f3a5599926',
// 			'e927875e9c1e5408ce1a084be0b410a876633725b7e5d38517c7153b45175736',
// 			'888829ceb15e981311d985063171644d03c295fd6a21f030da753d20f7306f7b',
// 			'17fef8f1d750b3ce968a9fc25034a6de2e3fb5ea3b8f1cf8e0745091e311fdc7',
// 			'eba0fe121d0f83d29cb66a3d7c886e9aab692be036c0c57e32cfdcf3834cd10f',
// 			'9928b1f7f01320344a5d1e1aea1e9fe445d3dfbc6f04aa31094fa38a8c941371',
// 			'ccdc6a7fb8516bdf64bf2a241787975034da7b0bd79929aab04df213e72e3eb3',
// 			'7bbf27bf7728873f7a057791db0574e0910c78bedb2ec3a91c2856948d4d36ab',
// 			'1df15ca7e5f6a50606ed35e4ff598241c62dcb1da168ec2b4df3583ed28ed5a5',
// 			'ed49abfb55a44ecf313dc566ccd0f04236d1f4b1cada4917ee2d084983ccf3ec',
// 			'4f5fef991edff508547a5edb5d99f6616cdee0241ef0e0beac99dbe118108c36',
// 			'4b0a82cf6814e32bd993cf3914943b34a1cb238cd868fa984a535ab82bd2ee80',
// 			'8ed83594a7886747d281367e269822ed976451ba2d14d9de9a20bd8f3a7c7f8f',
// 			'755aa5c62b478ca8e75243eddf214080ec23b61f5a46f8f3002ef70a9fdf8d6d',
// 			'66a6a681d2756113d30feaaedb49e680dfd061c6f3580abf0bf5ede17a498dc6',
// 			'35a592f31a1d21203b16576ee29d2bc10212578c7950363bbddfcf1efe93cf09',
// 			'cb334ca82ed9bc8c39943a82737384fb5b38b2518e49c4f87345d3eee177a8ca',
// 			'6f03e8b4c18b9c3bc07d9d468414c670d32bce3851d48d7682a5d192493b65d4',
// 			'fd5c125033cdbf4dab5f712bb38a40ae9793e18cee08fe299a714ced8bacbb62',
// 			'c1243af32f5527470ad80e5830e4fd4c5a8b9879f2dcbbe9dc42a70fb93c43d6',
// 			'8c1085b517ee476954cd7199b60a512e5f6a984ff1996384003be6683619c3ad',
// 			'7d57ce090e642af517a043701de46e14b1e2f1902158c240769b20fa3b4d20cc',
// 			'2c53fc1e863f8e15781bcb4638404e5f4757c355d3c1a90908df49cac875ddf7',
// 			'41c21362012aa346b85f768c201947527b221b6222fd542a3cfcfcd046be634f',
// 			'26a2c7238ef1d509126f66058f5212bd5922243c073a3daac98939d048a1b6dd',
// 			'253f20048e2594b9575ee1b61c06ec08dd878ec9c2cb8a970c4402b63d87e43f',
// 			'8037a0d11a65d23f7058c99a25590263f939abf4876ee0a132a79bfe756ea71d',
// 			'cf81b69f9286d4bfa58a25129b45791115fd90f643356fdf9322cb499520fc41',
// 			'ab7a843ead38e3d32f6e14544a90c16e5663de33bdc3cad3bb32c4ae5feabc90',
// 			'b9a620b03717aaf4a668234ac3dd2ee1fabf0dea2541a4f570c9ed2f6cc5bf66',
// 			'3d88ac6e72cb756cf58ab62aa48573ea54151f868646211c320bf1c70bf940fb',
// 			'c260c0c37d11e63c825c70fa64c4ac72a6ead36056aef2377592ad695b38c13a',
// 			'5b2227b7b3d6bc2f75c72d584869c4ce9ae5116a2c3cfde118087f00c6814ad5',
// 			'0c13e19fae6cb15355a0d7da0c98ec40effbfdcaf19e3228c9f4bf6adcac40cd',
// 			'6eff06801741da65bfd641890aca701983b77056eddd060f4c1b01ed10320929',
// 			'5bfe5a26b4b778e56c5cf28b7b742dbb0df371dd3968c5dff3cde9e68893a064',
// 			'2ec05110bec9c9524fa9279bdb9e77177279e1581f4da350c1921da07ef70df8',
// 			'46e60150b914df9568378fe27de2b9e93939e85ec6e6005255c38adc208188b1',
// 			'2e76188316fca3c90739374b462bda7a199a9c666070b3deede138d0d5ec91b0',
// 			'31209555a9c0d31058a2f925b8466bd7f749479f07865e5bc0524c2fac5134d3',
// 			'371e387db35f240e57933dddea6a82b3586dcf8b2e0928ee94c62907e6fb9966',
// 			'a47782a3cc53dbf18285c63a9f3d4bd4c3630a4ad809ee9e2f84855c90328391',
// 			'15e93f69ed41dbeaf1114ff71ca51ef79778e38aba0015d444106ba8b77a1fa8',
// 			'9b50d13258f5ad5f8d16dc458ae733689ba264402517e32987c8c06c1672d50a',
// 			'75a2480fdeb8597b07112379a957cd730d67e82a93921a6295a21c0bdf2671f3',
// 			'97f6217e2474a8b8438c02d907cdba54209a0d00b93441573bbd5a262bb0687f',
// 			'df3b1dca9af9a9bd4e63360a638eae61211508ab1be3a7b302a1af65e76f8c6a',
// 			'e3535e80b8c014f83dd0126958fb969a987237906d79a3e5b9dfd0d22e37e326',
// 			'8bcd88015f66d39878cb738757c6e9627e360ba61053c08450213efd119f45ee',
// 			'af50639120a5672c079e9960cbb97148ab7aad81df113c5be8c439159147e493',
// 			'bccd8a36c2a0e9ded0362ba9c1fa82dc48daa76c7928198b3b14b7b9d8c2b3e2',
// 			'004cc8c321d92f7ac1d25fd1a1516464aa54b1145494bfc776eb5e14f11fe92f',
// 			'f1a1023f35ecb1e483164a457b91cf10de5d8744dc682e8dbad154111eb0e4da',
// 			'287c91a44b4782397ba764e79f9e0708145947737d78d79aad925ff6980ce02d',
// 			'47372daa3c9eb7511f1230e7e2a9dbd724a89b573fbd167692e01b024a353632',
// 			'4086fb442209998458d9aca3ae05788ada385c2579c05ef223bf7ca0c32f6edd',
// 			'b78e8105b47dae05aeacf32f49c23ee5df0ddefdb7b5c525bdd567a5f934d324',
// 			'8aa915e6f46a130d1c14039ed4a9470e8255d227486f86ed4fa6b8ab48caaa38',
// 			'fab44ead221e391e47c5fb9befb1888e58222566a76516a2c82def773280841d',
// 			'7cbccd8448a429d8498c67eb575b3434cc717f1f6378e27528ee6688d6b4639a',
// 			'e4e858755f78425140d36b47cf79fbc83ba68eb77201a28e40cc35f8488f37af',
// 			'c864d64ea8ddb34e42089f22464a21c27079746a2e4cdc3e616d83532ebb31ce',
// 			'5e1db39fd10f1dd2203a8d557be05b873c62ca13c74335eb88ba9ab5db2de61d',
// 			'c0711de422f08dcc941249fb055e25853ffa82e1fefca463ba4bebc9f827fbdd',
// 			'cc4a70414c592070cc696a6d609b65a73bfec43cc24effb80c367d44ea9a4e54',
// 			'bd414d974a363936be88195bcef9474aed8fc28a2c3acb6411a9ae8f6586937e',
// 			'591cd3cdcdd67f6361a30116a59d975cbeb65ee793dbbc0767f9c9ed2087ad64',
// 			'6d996973347ac993648c8704f5e7c1ddfbc800e1d173e79d4296cea9e3bf5396',
// 			'76cd1aa3156f1ba500583b4ce8572dbd2c7b6fb53d86b2d67e544bc048a448c1',
// 			'0c6ef0e0b83174855aac56d3e720a24085667b3353e40f6d99568a94d47267c2',
// 			'5015a3f9a405d5bb2a720fca65b3d8b0b64506372121f6c1c6a17bf6b21a1820',
// 			'f7c1a8bee4f96849a28c013b39c157886b3fe71b4c78a601f929266bf54c7dcb',
// 			'167c0fe8a1f6a10a68937eeca2aa4060a701476b40481f41e01c4a6e356a2bbd',
// 			'66e698992e64749a690b93d70b956bfae1e628ed9f6e03f5f5659ca2fccf2401',
// 			'1bec57d1efc94a2f30ad62eab0d881bdeaf97072fe3600b67aa6e648d2ddd6f9',
// 			'f038131ab57f7e1af7ca06352b4c15d4db389023a04f7c51610d5b0f08b03c8b',
// 			'4a7de78c9b2a2c4726e14b175f10bb205693ac7a4d0a2f2f34bdb54415a3d752',
// 			'c9f12448b9587a44eda3afaa7c8eeee77a0ae4e6c8d4ca2e4d80932347238abd',
// 			'9e84bf436536a4ea42b0f22b0800dcb74fabbfbefab1360cb855b24abce36f95',
// 			'ce5a9bed98e5673384185a97d9f73a458499a5ea536d5be1da32fd1b30b9bd11',
// 			'829565f02035fb5effd913952fc1761538d98d55c3e35ae5045536b3979c8769',
// 			'21c967dcfc016f191b77a6f8afc83869396369176ad0a634712534dd5722462e',
// 			'7453210adcf474ff7d6abebf07c0153ad447b7f5d3a0d63c4a75231ff6900587',
// 			'5aa3779be37e0504f437bf80218be4f2bbcb9a7f687f31020ebd11d25e80122d',
// 			'77494f5a3e6905aabf1351e7bdc584e6facd84451694739b1d9aba015416403d',
// 			'09a34e79d93474cb603d78c737d596dead85ef6480c78ddd7b9d94ba997d10bf',
// 			'b4a4924de84673e3f104a58bdb70d64f033be024694d87a8485eed57b19d45b2',
// 			'2163de09ccb81909253e401a46bb9be0aa9917075d917d19f518149dc07e274e',
// 			'34f8085d99a4fa7c05cde0994142f6f3c50467c70a4d5fe4d839b0bffdb7bddf',
// 			'cfee7773c5a9019ebd33c946833c495f1f3dcebc02b039506ffda0a9ad08d780',
// 			'5dde83bdf5617f821f54bb7f8cc3313ca35ca1a3ca44e620bd96c21d0a585b35',
// 			'32fde11a76038484858b010effda646b4632547964c651064c120751843e9046',
// 			'eb3de10f3047957da037ae100f6b9a6999e5b78535d52eced7a278e14756f1eb',
// 			'07e44fb3306787041161bc112b34b85e90a20d62957fbedcc67658f3cf18a347',
// 			'ff71f56c1ab3634779bced0245fc9c9e3ebaeec8a281cbc8343410bc6dd24796',
// 			'4e7f3b510afc994e2f6c0dc1f43cdf4651cfacd6cea3f7c23d30e107377c4fd7',
// 			'd55f5240333323fe46b7c73ce6425a11b858cb37cc5767a86de19e52520567b9',
// 			'4bdd68831d1a73c605a9ca90948bd79b28ed74024c1697360cfc26cfaef465d3',
// 			'83ac812297014493f4898f3093da121c8a73e13dac59e0c4485953054d2ec660',
// 			'bc4e8b5bb08b6f88713af20167f6c7ac58d13f6682d1f8702afd9d275831bb7a',
// 			'9b50b522832e89b05bfda526590e8263caf1df393353c1c1c77d69243701535b',
// 			'd849357af747e0ce8f556a213eef21f6e99a4211f8286f6689082a42cc1d94ff',
// 			'd34011397dc651855899f66475005f70ebd86286b5b974b3424ba0dc09da1e32',
// 			'9fdb82ac4cc0ad5b4b29d74a912e822cb729af30ce9a8ee8d6c2394904a81f49',
// 			'439faa9a55a9b707035332327e674156'
// 		];

// 		const decStr = decryptText(encChunks.join(''));
// 		console.log(encChunks.join(''), (decStr.charAt(0) === '{' || decStr.charAt(0) === '[') ? JSON.parse(decStr, null) : decStr);

		trackEvent('site', 'load');
		trackPageview();

// 		console.log('\n//=-=//-=-//=-=//-=-//=-=//-=-//=-=//', (new Array(20)).fill(null).map((i)=> (Strings.randHex())), '//=-=//-=-//=-=//-=-//=-=//-=-//=-=//\n');
// 		console.log('\n//=-=//-=-//=-=//-=-//=-=//-=-//=-=//', (new Array(20)).fill(null).map((i)=> (parseInt(Maths.randomHex(), 16))), '//=-=//-=-//=-=//-=-//=-=//-=-//=-=//\n');
// 		console.log('\n//=-=//-=-//=-=//-=-//=-=//-=-//=-=//', (URIs.queryString()), '//=-=//-=-//=-=//-=-//=-=//-=-//=-=//\n');


		document.addEventListener('mousemove', this.handleMouseMove);
		window.addEventListener('resize', this.handleResize);
		window.addEventListener('scroll', this.handleScroll);
		window.onpopstate = (event)=> {
			console.log('-/\\/\\/\\/\\/\\/\\-', 'window.onpopstate()', '-/\\/\\/\\/\\/\\/\\-', event);
			//this.props.updateDeeplink(idsFromPath());
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		console.log('App.componentDidUpdate()', prevProps, this.props, prevState, this.state, Browsers.isOnline());

		const { profile } = this.props;
		const { pathname } = this.props.location;

// 		console.log('|:|:|:|:|:|:|:|:|:|:|:|', prevProps.location.pathname, pathname);
		if (prevProps.location.pathname !== pathname) {
// 			console.log('|:|:|:|:|:|:|:|:|:|:|:|', pathname);
			trackPageview();
		}

		const { modals } = this.state;
		if (!prevState.modals.network && !modals.network && !Browsers.isOnline()) {
			this.onToggleModal(Modals.NETWORK, true);
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

	handleMouseMove = (event)=> {
// 		console.log('%s.handleMouseMove()', this.constructor.name, { x : event.pageX, y : event.pageY });
		this.props.updateMouseCoords({
			x : event.pageX,
			y : event.pageY
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

	onToggleModal = (uri, show=true, payload=null)=> {
		console.log('App.onToggleModal()', uri, show, payload);
		const { modals } = this.state;

		if (show) {
			this.setState({ modals : { ...modals,
				github   : false,
				login    : (uri === Modals.LOGIN),
				network  : (uri === Modals.NETWORK),
				register : (uri === Modals.REGISTER),
				stripe   : (uri === Modals.STRIPE) },
			});

		} else {
			this.setState({ modals : { ...modals,
				github   : (uri === Modals.GITHUB_CONNECT) ? false : modals.github,
				login    : (uri === Modals.LOGIN) ? false : modals.login,
				network  : (uri === Modals.NETWORK) ? false : modals.network,
				register : (uri === Modals.REGISTER) ? false : modals.register,
				stripe   : (uri === Modals.STRIPE) ? false : modals.stripe }
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
		  {(URIs.firstComponent() !== 'app') && (<TopNav darkTheme={darkTheme} onToggleTheme={this.handleToggleTheme} onModal={(uri, payload)=> this.onToggleModal(uri, true, payload)} />)}
	    <div className={wrapperClass} ref={wrapper}>
		    <Switch>
			    <Route exact path={Pages.HOME} render={()=> <HomePage onModal={(uri, payload)=> this.onToggleModal(uri, true, payload)} onPopup={this.handlePopup} onRegistered={this.handleRegistered} />} />
			    <Route exact path={Pages.FEATURES} render={()=> <FeaturesPage onModal={(uri, payload)=> this.onToggleModal(uri, true, payload)} onPopup={this.handlePopup} />} />
			    <Route exact path={`${Pages.PLAYGROUND}/:teamSlug([a-z-]+)/:projectSlug([a-z-]+)?/:playgroundID([0-9]+)?/:componentsSlug([A-Za-z-]+)?/:componentID([0-9]+)?/:commentID([0-9]+)?`} render={(props)=> <PlaygroundPage { ...props } onModal={(uri, payload)=> this.onToggleModal(uri, true, payload)} onPopup={this.handlePopup} />} />
			    <Route exact path={Pages.PRICING} render={()=> <PricingPage onModal={(uri, payload)=> this.onToggleModal(uri, true, payload)} onPopup={this.handlePopup} />} />
			    <Route exact path={`/:page(${Pages.LEGAL.slice(1)}|${Pages.PRIVACY.slice(1)})`} render={()=> <PrivacyPage />} />
			    <Route exact path={Pages.TERMS} render={()=> <TermsPage />} />

			    <Route path={Pages.WILDCARD}><Status404Page /></Route>
		    </Switch>
	    </div>
		  {(URIs.firstComponent() !== 'app') && (<BottomNav onModal={(uri)=> this.onToggleModal(uri, true)} />)}

		  <div className="modal-wrapper">
			  {(popup) && (<PopupNotification
				  payload={popup}
				  onComplete={()=> this.setState({ popup : null })}>
				    {popup.content}
			  </PopupNotification>)}

			  {(modals.login) && (<LoginModal
				  inviteID={null}
				  outro={(profile !== null)}
				  onModal={(uri)=> this.onToggleModal(uri, true)}
				  onPopup={this.handlePopup}
				  onComplete={()=> this.onToggleModal(Modals.LOGIN, false)}
				  onLoggedIn={this.handleLoggedIn}
			  />)}

			  {(modals.register) && (<RegisterModal
				  inviteID={null}
				  outro={(profile !== null)}
				  onModal={(uri)=> this.onToggleModal(uri, true)}
				  onPopup={this.handlePopup}
				  onComplete={()=> this.onToggleModal(Modals.REGISTER, false)}
				  onRegistered={this.handleRegistered}
			  />)}

			  {(modals.network) && (<AlertDialog
				  title="No Internet Connection"
				  onComplete={()=> this.onToggleModal(Modals.NETWORK, false)}>
				  Check your network connection to continue.
			  </AlertDialog>)}

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
		updateMouseCoords  : (payload)=> dispatch(updateMouseCoords(payload)),
		updateDeeplink     : (navIDs)=> dispatch(updateDeeplink(navIDs)),
		updateUserProfile  : (profile)=> dispatch(updateUserProfile(profile))
	});
};


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));


import React from 'react';
import './PrivacyPage.css';

import BasePage from '../BasePage';
import { NavLink } from 'react-router-dom';

import { trackOutbound } from '../../../utils/tracking';


function PrivacyPage(props) {
	const handleURL = (event, url)=> {
// 		console.log('%s.handleURL()', this.constructor.name, event, url);

		if (event) {
			event.preventDefault();
		}

		trackOutbound(url, ()=> {
			window.open(url);
		});

		window.open(url);
	};


	return (
		<BasePage className="privacy-page-wrapper">
			<h1>Privacy Policy</h1>
			<div className="privacy-page-text">
				<div>
					<p>Protecting your privacy is important to us. Accordingly, we&rsquo;re providing this Privacy Policy to explain our practices regarding our online information practices and the information we may collect, and how we intend to use and disclose information that we receive when you use our Services. Our Services include your use of our websites including pairurl.com, designsystems.com and any other websites that we may later own or operate (&ldquo;Site&rdquo; or &ldquo;Sites&rdquo;); mobile applications (&ldquo;App(s)&rdquo;), application program interface(s) (&ldquo;API(s)&rdquo;) and our design tool services and other products and services we may later own or operate (collectively &ldquo;Services&rdquo;) . This Privacy Policy applies to Personal Information that is collected, used or Processed by Pair in the course of our business and applies only to those websites, services and Apps included within &ldquo;Services&rdquo; and doesn&rsquo;t apply to any third-party websites, services or applications, even if they are accessible through our Services. Also, please note that, unless we deﬁne a term in this Privacy Policy, all capitalized words used in this Privacy Policy have the same meanings as in our Terms of Service. Everyone whose responsibilities include the Processing of Personal Information on behalf of Pair are expected to protect that information and data by adhering to this Privacy Policy. This Privacy Policy is intended to meet requirements globally, including those in North America, Europe, APAC, and other jurisdictions.</p>
					<p>This policy applies to all Pair&rsquo;s operating divisions, subsidiaries, affiliates, and branches and any additional subsidiary, affiliate, or branch of Pair that we may later form.</p>
				</div>
				<h5>How we collect and use information</h5>
				<div>
					<p>Our primary goals in collecting information are to provide and improve our Services, to administer your use of the Services (including your account, if you are an account holder), and to enable you to enjoy and easily navigate our Services. The types of Personal Information we may collect (directly from you or from Third-Party sources) and our privacy practices depend on the nature of the relationship you have with Pair and the requirements of applicable law. Some of the ways that Pair may collect Personal Information include:</p>
					<ul>
						<li>You may provide Personal Information directly to Pair by interacting with the Services, participating in surveys, and requesting services.</li>
						<li>As you navigate the Services, certain passive information may also be collected about your visit, including through cookies and similar technologies as described below.</li>
					</ul>
					<p>We endeavor to collect only that information which is relevant for the purposes of Processing. Pair collects certain Personal Information about its current, prospective and former clients, customers, users, visitors, guests and employees (collectively &ldquo;you&rdquo; or &ldquo;Individuals&rdquo;).</p>
				</div>

				<h5>Information You Provide Directly to Us</h5>
				<div>
					<p>When you use the Services or engage in certain activities such as creating an Account with Pair, we may ask you to provide some or all of the following types of information:</p>
					<ul>
						<li><h6>Account Information</h6>  When you create an Account we&rsquo;ll collect certain information that can be used to identify you, such as your name, email address, personal website, and picture (&ldquo;Personally Identiﬁable Information&rdquo; or &ldquo;Personal Information&rdquo;). We may also collect certain information that is not Personal Information because it cannot be used by itself to identify you. </li>
						<li><h6>Information Collected Using Cookies</h6>  We collect certain information through the use of &ldquo;cookies,&rdquo; which are small text ﬁles that are saved by your browser when you access our Services. We may use both session cookies and persistent cookies to identify that you&rsquo;ve logged in to the Services and to tell us how and when you interact with our Services. We may also use cookies to monitor aggregate usage and web trafﬁc routing on our Services and to customize and improve our Services. Unlike persistent cookies, session cookies are deleted when you log off from the Services and close your browser. Although most browsers automatically accept cookies, you can change your browser options to stop automatically accepting cookies or to prompt you before accepting cookies. Please note, however, that if you don&rsquo;t accept cookies, you may not be able to access all portions or features of the Services. Some third-party services providers that we engage (including third-party advertisers) may also place their own cookies on your browser. Note that this Privacy Policy covers only our use of cookies and does not include use of cookies by such third parties. </li>
						<li><h6>Information Related to Use of the Services</h6>  Our servers automatically record certain information about how a person uses our Services (we refer to this information as &ldquo;Log Data&rdquo;), including both Account holders and non-Account holders (either, a &ldquo;User&rdquo;). Log Data may include information such as a User&rsquo;s Internet Protocol (IP) address, browser type, operating system, the web page that a User was visiting before accessing our Services, the pages or features of our Services to which a User browsed and the time spent on those pages or features, search terms, the links on our Services that a User clicked on and other statistics. We use this information to administer the Services and we analyze (and may engage third parties to analyze) this information to improve and enhance the Services by expanding their features and functionality and tailoring them to our Users&rsquo; needs and preferences. We may use a person&rsquo;s IP address to ﬁght spam, malware and identity theft. We also use IP addresses to generate aggregate, non-identifying information about how our Services are used. We may, with your permission, collect information about your operating system&rsquo;s installed fonts in connection with providing the Services to you. Combined with other system information, this information could be used to give your computer a unique ﬁngerprint/signature and enable us to track your usage of our Services after you log out. </li>
						<li><h6>Location Information </h6> In some cases we collect and store information about where you are located, such as by converting your IP address into a rough geolocation. We may use location information to improve and personalize our Services for you. </li>
						<li><h6>Meetups and/or Conferences</h6>  If you participate in conferences or meetup events, whether organized by Pair or a third-party, Pair may collect or obtain, and retain information you provide in connection with signing up and/or participating in that event. </li>
					</ul>
				</div>

				<h5>Sharing with other Service users</h5>
				<div>
					<p>When you use the Services, we share certain information about you with other Service users.</p>
					<ul>
						<li><h6>For collaboration</h6> You can create content, which may contain information about you, and grant permission to others to see, share, edit, copy and download that content based on settings you or your administrator (if applicable) select. Some of the collaboration features of the Services display some or all of your profile information to other Service users when you share or interact with specific content. For example, when you comment, we display your profile picture and name next to your comments so that other users with access to the comment understand who made it. Similarly, when you join a team, your name, profile picture and contact information will be displayed in a list for other team members so they can find and interact with you. Please be aware that some content can be made publicly available, meaning any content posted, including information about you, can be publicly viewed and indexed by and returned in search results of search engines. You can check the settings at any time to confirm whether particular content is public or private. </li>
						<li><h6>Managed accounts and administrators</h6> If you register or access the Services using an email address with a domain that is owned by your employer or organization, or associate that email address with your existing account and such organization wishes to establish a Pair services account, certain information about you including your name, profile picture, contact info, content, and account use may become accessible to that organization&rsquo;s administrator and other Pair service users, as permitted by your administrator, to provide you additional products and services or to integrate with Pair or other products and services. For example, your organization may request that we provide extra security controls around your account to protect information about your organization or your organization may request that we link your Pair account with your organization&rsquo;s account to enhance collaboration and functionality among tools you use. If you are the administrator of a team, organization or enterprise account within the Services, we may share your contact information with current or past Service users, for the purpose of facilitating Service-related requests. </li>
					</ul>
				</div>

				<h5>Information You Submit Through Services</h5>
				<div>
					<p>You agree that Pair is free to use information regarding your use of the Services, for any purpose including developing, manufacturing, and/or marketing goods or Services. Pair does not, however, claim any ownership rights in any User Content (as defined in our Terms of Service) that you make available through the Services and nothing in these privacy policy will be deemed to restrict any rights that you may have to use and exploit your User Content.</p>
				</div>

				<h5>Information From Other Sources</h5>
				<div>
					<p>We may receive information about you from other sources, including through Third-Party services and organizations to supplement information provided by you. For example, if you access our Services through a Third-Party application, such as an App Store or SNS, we may collect information about you from that Third-Party application that you have made public via your privacy settings. Information we collect through App Stores or SNS accounts may include your name, your SNS user identification number, your SNS user name, location, sex, birth date, email, profile picture, and your contacts on the SNS. This supplemental information allows us to verify information that you have provided to Pair and to enhance our ability to provide you with information about our business, products, and Services.</p>
				</div>

				<h5>Third party websites, social media platforms, and software development kits</h5>
				<div>
					<p>The Site may contain links to other websites and other websites may reference or link to our Site or other Services. These other domains and websites are not controlled by us, and Pair does not endorse or make any representations about Third-Party websites or social media platforms. We encourage our users to read the privacy policies of each and every website and application with which they interact. We do not endorse, screen or approve, and are not responsible for the privacy practices or content of such other websites or applications. Visiting these other websites or applications is at your own risk.</p>
					<p>Pair&rsquo;s Services may include publicly accessible blogs, community forums, or private messaging features. The Site and our other Services may also contain links and interactive features with various social media platforms (e.g., widgets). If you already use these platforms, their cookies may be set on your device when using our Site or other Services. You should be aware that Personal Information which you voluntarily include and transmit online in a publicly accessible blog, chat room, social media platform or otherwise online, or that you share in an open forum may be viewed and used by others without any restrictions. We are unable to control such uses of your information when interacting with a social media platform, and by using such services you assume the risk that the Personal Information provided by you may be viewed and used by third parties for any number of purposes.</p>
					<p>We use Third-Party software development kits (&ldquo;SDKs&rdquo;) as part of the functionality of our Services. Third-Party SDKs may allow Third Parties including advertisers to collect your personal information to provide content that is more relevant to you. You may opt out of tracking by following the instructions provided below.</p>
				</div>

				<h5>Third Party Payment Processing</h5>
				<div>
					<p>We may sell services or merchandise through our Services. When you make purchases through the Services, we may process your payments through a Third-Party application, including the Apple App Store, Google Play App Store, Amazon App Store (together with any similar applications, &ldquo;App Stores&rdquo;), Social Networking Sites (&ldquo;SNS&rdquo;) such as Facebook, and/or payment processing services such as Stripe. The Third-Party application may collect certain financial information from you to process a payment on behalf of Pair, including your name, email address, address and other billing information.</p>
				</div>

				<h5>Information we share with Third Parties</h5>
				<div>
					<p>We will not share any Personal Information that we have collected from you except as described below:</p>
				</div>

				<h5>Information Shared with Our Services Providers</h5>
				<div>
					<p>We may engage third party service providers to work with us to administer and provide the Services. These third-party services providers have access to your Personal Information for the purpose of performing services on our behalf. The types of service providers (processors) to whom we entrust Personal Information service providers for: (i) provision of IT and related services; (ii) provision of information and services you have requested; (iii) payment processing; (iv) customer service activities; and (v) in connection with the provision of the Services. Pair has executed appropriate contracts with the service providers that prohibit them from using or sharing Personal Information except as necessary to perform the contracted services on our behalf or to comply with applicable legal requirements</p>
				</div>

				<h5>Information Shared with Business Partners</h5>
				<div>
					<p>We may share Personal Information with our business partners, and affiliates for our and our affiliates&rsquo; internal business purposes or to provide you with a product or service that you have requested. We may also provide Personal Information to business partners with whom we may jointly offer products or services, or whose products or services we believe may be of interest to you. In such cases, our business partner&rsquo;s name will appear, along with Pair&rsquo;s. Pair requires our affiliates and business partners to agree in writing to maintain the confidentiality and security of Personal Information they maintain on our behalf and not to use it for any purpose other than the purpose for which we provided them.</p>
				</div>

				<h5>Information Shared for Marketing</h5>
				<div>
					<p>Through our Services, we may allow Third-Party advertising partners to set tracking tools (e.g., cookies) to collect information regarding your activities (e.g., your IP address, page(s) visited, time of day). We may also share such de-identified information as well as selected Personal Information (such as demographic information and past purchase history) we have collected with Third-Party advertising partners. These advertising partners may use this information (and similar information collected from other websites) for purposes of delivering targeted advertisements to you when you visit non-Pair related websites within their networks. This practice is commonly referred to as &ldquo;interest-based advertising&rdquo; or &ldquo;online behavioral advertising. We may allow access to other data collected by the Site to facilitate transmittal of information that may be useful, relevant, valuable or otherwise of interest to you. If you prefer that we do not share your Personal Information with Third-Party advertising partners, you may opt out of such sharing at no cost by following the instructions below.</p>
				</div>

				<h5>Information Shared with Third Parties</h5>
				<div>
					<p>We may share aggregated information and non-identifying information with third parties for industry analysis, demographic proﬁling and other similar purposes.</p>
				</div>

				<h5>Information Disclosed in Connection with Business Transactions</h5>
				<div>
					<p>Information that we collect from our users, including Personal Information, is considered to be a business asset. As a result, if we go out of business or enter bankruptcy or if we are acquired as a result of a transaction such as a merger, acquisition or asset sale, your Personal Information may be disclosed or transferred to the third-party acquirer in connection with the transaction as permitted by law and/or contract. In such event, we will endeavor to direct the transferee to Personal Information in a manner that is consistent with the Privacy Policy in effect at the time such Personal Information was collected.</p>
				</div>

				<h5>Information Disclosed for Our Protection and the Protection of Others</h5>
				<div>
					<p>It is our policy to protect you from having your privacy violated through abuse of the legal system, whether by individuals, entities or government, and to contest claims that we believe to be invalid under applicable law. However, it is also our policy to cooperate with government and law enforcement ofﬁcials and private parties. Accordingly, we reserve the right to disclose any information about you to government or law enforcement ofﬁcials or private parties as we, in our sole discretion, believe necessary: (i) to satisfy or comply with any applicable law, regulation or legal process or to respond to lawful requests, including subpoenas, warrants or court orders; (ii) to protect our property, rights and safety and the rights, property and safety of third parties or the public in general; and (iii) to prevent or stop activity we consider to be illegal or unethical.</p>
					<p>In addition, from time to time, server logs may be reviewed for security purposes – e.g., to detect unauthorized activity on the Services. In such cases, server log data containing IP addresses may be shared with law enforcement bodies or Third Party service providers in order that they may identify users in connection with their investigation of the unauthorized activities or otherwise assist us with security related activities.</p>
				</div>

				<h5>Information We Disclose With Your Consent or at Your Request</h5>
				<div>
					<p>We will share your Personal Information with third-party sites or platforms if you have expressly consented or requested that we do so.</p>
				</div>

				<h5>Information Displayed to Others Upon Posting of User Content</h5>
				<div>
					<p>In connection with your Posting of User Content, we will share your picture, full legal name, user handle, and Twitter (or other social networking site) handle (to the extent you have provided us with this information). We are not responsible for privacy practices of the other users who may view and use the posted information.</p>
				</div>

				<h5>The Security of Your Information</h5>
				<div>
					<p>We take steps to ensure that your information is treated securely and in accordance with this Privacy Policy. Unfortunately, the Internet cannot be guaranteed to be 100% secure, and we cannot ensure or warrant the security of any information you provide to us. We do not accept liability for unintentional disclosure.</p>
					<p>By using the Site or providing Personal Information to us, you agree that we may communicate with you electronically regarding security, privacy, and administrative issues relating to your use of the Site. If we learn of a security system&rsquo;s breach, we may attempt to notify you electronically by posting a notice on the Site or sending an e-mail to you. You may have a legal right to receive this notice in writing.</p>
				</div>

				<h5>Links to Other Sites</h5>
				<div>
					<p>Our Services may contain links to other websites and services, e.g. to Google&rsquo;s services. Any information that you provide on or to a third- party website or service is provided directly to the owner of the website or service and is subject to that party&rsquo;s privacy policy. Our Privacy Policy does not apply to such websites or services and we&rsquo;re not responsible for the content, privacy or security practices and policies of those websites or services. To protect your information we recommend that you carefully review the privacy policies of other websites and services that you access.</p>
				</div>

				<h5>Modifying Your Information – rights of access, rectification, erasure, and restriction</h5>
				<div>
					<p>You may inquire as to whether we are Processing Personal Information about you, request access to Personal Information, and ask that we correct, amend or delete your Personal Information where it is inaccurate. Where otherwise permitted by applicable law, you may send an e-mail to <NavLink to="mailto:support@pairurl.com" target="_blank" onClick={(event)=> handleURL(event, 'mailto:support@pairurl.com')}>support@pairurl.com</NavLink> or use any of the methods set out in this Privacy Policy to request access to, receive (port), seek rectification, or request erasure of Personal Information held about you by Pair. Please include your full name, email address associated with your Account, and a detailed description of your data request. Such requests will be processed in line with local laws.</p>
					<p>Although we make good faith efforts to provide Individuals with access to their Personal Information, there may be circumstances in which we are unable to provide access, including but not limited to: where the information contains legal privilege, would compromise others&rsquo; privacy or other legitimate rights, where the burden or expense of providing access would be disproportionate to the risks to the Individual&rsquo;s privacy in the case in question or where it is commercially proprietary Personal Information. If we determine that access should be restricted in a particular instance, we will provide you with an explanation of why that determination has been made and a contact point for any further inquiries. To protect your privacy, we will take commercially reasonable steps to verify your identity before granting access to or making any changes to your Personal Information.</p>
				</div>

				<h5>Opt-out (Right to Object to Processing)</h5>
				<div>
					<p>You have the right to object to and opt out of certain uses and disclosures of your Personal Information. Where you have consented to Pair&rsquo;s Processing of your Personal Information or Sensitive Personal Information, you may withdraw that consent at any time and opt out of further Processing by contacting <NavLink to="mailto:support@pairurl.com" target="_blank" onClick={(event)=> handleURL(event, 'mailto:support@pairurl.com')}>support@pairurl.com</NavLink>. Even if you opt out, we may still collect and use non-Personal Information regarding your activities on our Sites and/or information from the advertisements on Third-Party websites for non-interest based advertising purposes, such as to determine the effectiveness of the advertisements.</p>
					<ul>
						<li><h6>Email and telephone communications</h6>  If you receive an unwanted email from us, you can use the unsubscribe link found at the bottom of the email to opt out of receiving future emails. We will process your request within a reasonable time after receipt. Note that you will continue to receive transaction-related emails regarding products or services you have requested. We may also send you certain non-promotional communications regarding Pair and our Services and you will not be able to opt out of those communications (e.g., communications regarding updates to our Terms or this Privacy Policy). We maintain telephone &ldquo;do-not-call&rdquo; and &ldquo;do-not-mail&rdquo; lists as mandated by law. We process requests to be placed on do-not-mail, do-not-phone and do-not-contact lists within 60 days after receipt, or such shorter time as may be required by law .</li>
						<li><h6>Mobile devices</h6>  We may occasionally send you push notifications through our mobile applications with notices that may be of interest to you. You may at any time opt out from receiving these types of communications by changing the settings on your mobile device. We may also collect location-based information if you use our mobile applications. You may opt out of this collection by changing the settings on your mobile device. </li>
						<li><h6>Human resources data</h6>  With regard to Personal Information that Pair receives in connection with the employment relationship, Pair will use such Personal Information only for employment-related purposes as more fully described above. If Pair intends to use this Personal Information for any other purpose, Pair will notify the Individual and provide an opportunity to opt out of such uses .</li>
						<li><h6>&ldquo;DO NOT TRACK&rdquo; </h6> Do Not Track (&ldquo;DNT&rdquo;) is a privacy preference that users can set in certain web browsers. DNT is a way for users to inform websites and services that they do not want certain information about their webpage visits collected over time and across websites or online services. Please note that we do not respond to or honor DNT signals or similar mechanisms transmitted by web browsers. </li>
						<li><h6>Cookies and interest-based advertising </h6> As noted above, you may stop or restrict the placement of cookies on your computer or remove them from your browser by adjusting your web browser preferences. Please note that cookie-based opt-outs are not effective on mobile applications. However, on many mobile devices, application users may opt out of certain mobile ads via their device settings. The online advertising industry also provides websites from which you may opt out of receiving targeted ads from our data partners and our other advertising partners that participate in self-regulatory programs. You can access these, and also learn more about targeted advertising and consumer choice and privacy, at networkadvertising.org/managing/opt_out.asp, or youronlinechoices.eu and aboutads.info/choices. You can also choose not to be included in Google Analytics here. To be clear, whether you are using our opt-out or an online industry opt-out, these cookie-based opt-outs must be performed on each device and browser that you wish to have opted-out. For example, if you have opted-out on your computer browser, that opt-out will not be effective on your mobile device. You must separately opt out on each device. Advertisements on Third-Party websites that contain the AdChoices link and that link to this Privacy Policy may have been directed to you based on anonymous, non-Personal Information collected by advertising partners over time and across websites. These advertisements provide a mechanism to opt out of the advertising partners&rsquo; use of this information for interest-based advertising purposes. </li>
					</ul>
				</div>

				<h5>International Data Transfers</h5>
				<div>
					<p>You agree that all Personal Information collected via or by Pair may be Personal Information transferred to, Processed, and stored anywhere in the world, including but not limited to, United States, the European Union, in the cloud, on our servers, on the servers of our affiliates or the servers of our service providers. Your Personal Information may be accessible to law enforcement or other authorities pursuant to a lawful request. By providing information to Pair, you explicitly consent to the storage of your Personal Information in these locations.</p>
				</div>

				<h5>International Users</h5>
				<div>
					<p>By using the Services, Pair may transfer data to jurisdictions outside of the United States. By choosing to visit the Site, utilize the Services or otherwise provide information to us, you agree that any dispute over privacy or the terms contained in this Privacy Policy will be governed by the laws of California and the adjudication of any disputes arising in connection with Pair or the Site will be in accordance with the Terms.</p>
					<p>If you are visiting from the European Union or other regions with laws governing data collection and use, please note that you are agreeing to the transfer of your information to the United States and to Processing of your data globally. By providing your Personal Information, you consent to any transfer and Processing in accordance with this Policy.</p>
				</div>

				<h5>Data Retention</h5>
				<div>
					<p>We retain the Personal Information we receive as described in this Privacy Policy for as long as you use our Services or as necessary to fulfill the purpose(s) for which it was collected, provide our Services, resolve disputes, establish legal defenses, conduct audits, pursue legitimate business purposes, enforce our agreements, and comply with applicable laws.</p>
				</div>

				<h5>How Long We Keep Information</h5>
				<div>
					<p>How long we keep information we collect about you depends on the type of information, as described in further detail below. After such time, we will either delete or anonymize your information or, if this is not possible (for example, because the information has been stored in backup archives), then we will securely store your information and isolate it from any further use until deletion is possible.</p>
					<ul>
						<li><h6>Account information</h6> We retain your account information until you delete your account. We also retain some of your information as necessary to comply with our legal obligations, to resolve disputes, to enforce our agreements, to support business operations and to continue to develop and improve our Services. Where we retain information for Service improvement and development, we take steps to eliminate information that directly identifies you, and we only use the information to uncover collective insights about the use of our Services, not to specifically analyze personal characteristics about you.</li>
						<li><h6>Information you share on the Services</h6> If your account is deactivated or disabled, some of your information and the content you have provided will remain in order to allow your team members or other users to make full use of the Services. For example, we continue to display comments and other content you provided.</li>
						<li><h6>Managed accounts</h6> If the Services are made available to you through an organization (e.g., your employer), we retain your information as long as required by the administrator of your account. For more information, see &ldquo;Managed accounts and administrators&rdquo; above.</li>
						<li><h6>Marketing information</h6> If you have elected to receive marketing emails from us, we retain information about your marketing preferences unless you specifically ask us to delete such information. We retain information derived from cookies and other tracking technologies for a reasonable period of time from the date such information was created.</li>
					</ul>
				</div>

				<h5>Our Policy Toward Children</h5>
				<div>
					<p>Our Services are not directed to children under 13, or other age as required by local law. We do not knowingly collect Personal Information from children under 13, or other age as required by local law. If you learn that your child has provided us with Personal Information without your consent, you may alert us at support@pairurl.com. If we learn that we have collected any Personal Information from children under 13 (or other age as required by local law), we will promptly take steps to delete such information and terminate the child&rsquo;s account.</p>
				</div>

				<h5>Changes to Privacy Policy</h5>
				<div>
					<p>Any information that we collect is subject to the privacy policy in effect at the time such information is collected. We may, however, modify and revise this Privacy Policy from time to time. You understand and agree that you will be deemed to have accepted the updated Privacy Policy if you use the Services after the updated Privacy Policy is posted on the Services. If at any point you do not agree to any portion of the Privacy Policy then in effect, you must immediately stop using the Services.</p>
					<ul>
						<li><h6>Revision to the Privacy Policy</h6> We may revise this Privacy Policy in our sole discretion, so review it periodically. If you continue to visit this Site and use the services made available to you after such changes have been made, you hereby provide your consent to the changes. </li>
						<li><h6>Posting of Revised Privacy Policy</h6> If there are any material changes to this Privacy Policy, Pair will notify you by email or as otherwise required by applicable law. We will post any adjustments to the Privacy Policy on this web page, and the revised version will be effective immediately when it is posted (or upon notice as applicable). If you are concerned about how your information is used, bookmark this page and read this Privacy Policy periodically. </li>
						<li><h6>New Uses of Personal Information</h6>  Additionally, before we use Personal Information for any new purpose not originally authorized by you, we will endeavor to provide information regarding the new purpose and give you the opportunity to opt out. Where consent of the Individual for the Processing of Personal Information is otherwise required by law or contract, Pair will endeavor to comply with the law or contract.</li>
					</ul>
				</div>

				<h5>California Privacy Rights</h5>
				<div>
					<p>California law permits users who are California residents to request and obtain from us once a year, free of charge, a list of the Third Parties to whom we have disclosed their Personal Information (if any) for their direct marketing purposes in the prior calendar year, as well as the type of Personal Information disclosed to those parties. Except as otherwise provided in this Privacy Policy, Pair does not share Personal Information with Third Parties for their own marketing purposes.</p>
				</div>

				<h5>EU-U.S. Privacy Shield and Swiss-U.S. Privacy Shield</h5>
				<div>
					<p>When transferring data from the European Union, the European Economic Area, and Switzerland, Pair relies upon a variety of legal mechanisms, including contracts with our users. Pair complies with the EU-U.S. Privacy Shield Framework and Swiss-U.S. Privacy Shield Framework as set forth by the U.S. Department of Commerce regarding the collection, use, and retention of personal information transferred from the European Union and Switzerland to the United States. Pair, Inc. has certified to the Department of Commerce that it adheres to the Privacy Shield Principles. If there is any conflict between the terms in this privacy policy and the Privacy Shield Principles, the Privacy Shield Principles shall govern. To learn more about the Privacy Shield program, and to view our certification, please visit <NavLink to="https://www.privacyshield.gov/" target="_blank" onClick={(event)=> handleURL(event, 'https://www.privacyshield.gov/')}>https://www.privacyshield.gov/</NavLink>.</p>
					<p>Pair is subject to oversight by the U.S. Federal Trade Commission. JAMS is the US-based independent organization responsible for reviewing and resolving complaints about our Privacy Shield compliance — free of charge to you. We ask that you first submit any such complaints directly to us via <NavLink to="mailto:privacyshield@pairurl.com" target="_blank" onClick={(event)=> handleURL(event, 'mailto:privacyshield@pairurl.com')}>privacyshield@pairurl.com</NavLink>. If you aren't satisfied with our response, please contact JAMS at <NavLink to="https://www.jamsadr.com/file-an-eu-us-privacy-shield-or-safe-harbor-claim" target="_blank" onClick={(event)=> handleURL(event, 'https://www.jamsadr.com/file-an-eu-us-privacy-shield-or-safe-harbor-claim')}>https://www.jamsadr.com/file-an-eu-us-privacy-shield-or-safe-harbor-claim</NavLink>. In the event your concern still isn't addressed by JAMS, you may be entitled to a binding arbitration under Privacy Shield and its principles.</p>
					<p>Within the scope of our authorization to do so, and in accordance with our commitments under the Privacy Shield, Pair will provide individuals access to personal data about them. Pair also will take reasonable steps to enable individuals to correct, amend, or delete personal data that is demonstrated to be inaccurate.</p>
					<p>Pair is responsible for the processing of personal data it receives, under the Privacy Shield Framework, and subsequently transfers to a third party acting as an agent on its behalf. Pair complies with the Privacy Shield Principles for all onward transfers of personal data from the EU and Switzerland, including the onward transfer liability provisions.</p>
				</div>

				<h5>Definitions</h5>
				<div>
					<p>The following capitalized terms shall have the meanings herein as set forth below.</p>
					<ul>
						<li><h6>&ldquo;Employee&rdquo;</h6> Refers to any current, temporary, permanent, prospective or former employee, director, contractor, worker, or retiree of Pair or its subsidiaries worldwide.</li>
						<li><h6>&ldquo;Personal Information&rdquo;</h6>Is any information relating to an identified or identifiable natural person (&ldquo;Individual&rdquo;). </li>
						<li><h6>&ldquo;Process&rdquo; or &ldquo;Processing&rdquo;</h6> Means any operation which is performed upon Personal Information, whether or not by automatic means, such as collection, recording, organization, structuring, storage, adaptation or alteration, retrieval, consultation, use, disclosure by transmission, dissemination or otherwise making available, alignment or combination, restriction, erasure, or destruction.</li>
						<li><h6>&ldquo;Sensitive Data&rdquo; or &ldquo;Sensitive Personal Information&rdquo;</h6> Is a subset of Personal Information which, due to its nature, has been classified by law or by policy as deserving additional privacy and security protections. Sensitive Personal Information includes Personal Information regarding EU residents that is classified as a &ldquo;Special Category of Personal Data&rdquo; under EU law, which consists of the following data elements: (1) race or ethnic origin; (2) political opinions; (3) religious or philosophical beliefs; (4) trade union membership; (5) genetic data; (6) biometric data where Processed to uniquely identify a person; (6) health information; (7) sexual orientation or information about the Individual&rsquo;s sex life; or (8) information relating to the commission of a criminal offense.</li>
						<li><h6>&ldquo;Third Party&rdquo;</h6> Is any company, natural or legal person, public authority, agency, or body other than the Individual or Pair.</li>
					</ul>
				</div>
			</div>
		</BasePage>
	);
}


export default (PrivacyPage);

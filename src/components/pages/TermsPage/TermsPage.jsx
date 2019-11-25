
import React from 'react';
import './TermsPage.css';

import { NavLink } from 'react-router-dom';

import BasePage from '../BasePage';
import { Pages } from '../../../consts/uris';
import { trackOutbound } from '../../../utils/tracking';

function TermsPage(props) {
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
		<BasePage className="terms-page-wrapper">
			<h1>Terms of Service</h1>
			<div className="terms-page-text">
				<div>
					<p>Welcome to the Pair (&ldquo;Pair&rdquo;) website (www.pairurl.com) (the &ldquo;Site&rdquo;). Please read these Terms of Service (the &ldquo;Terms&rdquo;) carefully because they govern your use of our websites including Pair.com, designsystems.com and any other websites that we may later own or operate (&ldquo;Site&rdquo; or &ldquo;Sites&rdquo;); mobile applications (&ldquo;App(s)&rdquo;), application program interface(s) (&ldquo;API(s)&rdquo;) and our design tool services and other products and services we may later own or operate (collectively called the &ldquo;Services&rdquo;).</p>
				</div>

				<h5>1. Agreement to these Terms</h5>
				<div>
					<p>By using our Services, you agree to be bound by these Terms. If you don&rsquo;t agree to these Terms, do not use the Services. If you are accessing and using the Services on behalf of a company (such as your employer) or other legal entity, you represent and warrant that you have the authority to bind that company or other legal entity to these Terms. In that case, &ldquo;you&rdquo; and &ldquo;your&rdquo; will refer to that company or other legal entity.</p>
				</div>

				<h5>2. Changes to the Terms or Services</h5>
				<div>
					<p>We may modify the Terms at any time, in our sole discretion. If we do so, we&rsquo;ll let you know either by posting the modified Terms on the Site or through other communications. If you continue to use the Services, you are indicating that you agree to the modified Terms. We may change or discontinue all or any part of the Services, at any time and without notice, at our sole discretion.</p>
					<p>ARBITRATION NOTICE: IF YOU ARE ACCESSING AND USING THE SERVICES AS AN INDIVIDUAL (NOT ON BEHALF OF A COMPANY OR OTHER LEGAL ENTITY), UNLESS YOU OPT OUT OF ARBITRATION WITHIN 30 DAYS OF THE DATE YOU FIRST AGREE TO THESE TERMS BY FOLLOWING THE OPT-OUT PROCEDURE SPECIFIED IN THE &ldquo;DISPUTE RESOLUTION FOR INDIVIDUAL CONSUMERS&rdquo; SECTION BELOW, AND YOU AGREE THAT DISPUTES BETWEEN YOU AND Pair WILL BE RESOLVED BY BINDING, INDIVIDUAL ARBITRATION, EXCEPT FOR CERTAIN TYPES OF DISPUTES DESCRIBED IN THAT SECTION, AND YOU ARE WAIVING YOUR RIGHT TO A TRIAL BY JURY OR TO PARTICIPATE AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS ACTION OR REPRESENTATIVE PROCEEDING.</p>
				</div>

				<h5>3. Who May Use the Services</h5>
				<div>
					<p>You may use the Services if you are 13 years or older and are not barred from using the Services under applicable law.</p>
					<p>In order to use certain features of the Services, you must create an account (&ldquo;Account&rdquo;) via the Site and become a registered user (&ldquo;User&rdquo;). As a User, you may use certain features of the Services as described in Section 4 and you may also create and develop Applications that can be made available via and used with the Services, as described in Section 5. You have to provide us with accurate and complete information and keep it up-to-date. You&rsquo;ll notify us immediately of any unauthorized use of your Account and you&rsquo;re responsible for all activities that occur under your Account, whether or not you know about them.</p>
				</div>

				<h5>4. Using the Services</h5>
				<div>
					<ul className="sub-section">
						<li>
							<h6>4.1 General</h6>
							<p>The Services offer a browser based tool for user interface design and editing work, through which users can collaborate with one another in the online design of user interfaces. Each design that you work on through the Services is called a &ldquo;Design&rdquo;. If you are a User, Pair provides you (subject to your compliance with the Terms), access to its proprietary tools and design templates (collectively, the &ldquo;Tools&rdquo;) to help build your Design through the Services. You can create a Design on your own, or base a Design using the Tools made available by Pair through the Services. You may also search for and install certain Applications that are made available via the Services and which can be used in conjunction with the Services.</p>
						</li>
						<li>
							<h6>4.2 Projects and Project Teams</h6>
							<p>You can either work on a Design in your personal space (&ldquo;Personal Space&rdquo;) or you can create a team space (&ldquo;Team Space&rdquo;) that allows you to collaborate on one or more Designs as part of a project (&ldquo;Project&rdquo;) with a group of Users of your choosing (such group, a &ldquo;Project Team&rdquo;). For example, a Project Team might consist of a group of co-workers or even a group of friends that collaboratively work on a Design. Each User that is a member of a Project Team is referred to as a &ldquo;Team Member&rdquo;. You may create one or several Projects with your Project Team, or form different Project Teams for different Projects. Any data or other content associated with a Project, including any Designs, is called &ldquo;Project Content.&rdquo;</p>
							<p>Each Project Team must select a person who will be the administrator of that Project Team (the &ldquo;Admin&rdquo;) or the individual who initially created the Team Space (the &ldquo;Owner&rdquo;), will be considered the Admin. An Owner, Admin or a Team Member marked as having editor permissions (&ldquo;Editor&rdquo;) can add Team Members to the Project Team, make changes to the composition of the Project Team, manage editing rights of Team Members, and otherwise manage the Project Team at whatever level they are set at in the system. An Owner, Admin or Editor who is a member of the Project Team will have access to a separate screen with details about the type of Subscription, payment details, and other details related to the Projects and Project Teams. The Admin will also be responsible for the compliance of these Terms by each Team Member, payment of the Subscription Fee (as defined in Section 5), and all matters related to that Project Teams.</p>
						</li>
						<li>
							<h6>4.3 Sharing and Permissions</h6>
							<p>Any Team Members of a Project Team may freely access and view the Project and any Project Content that is saved in the Team Space. Any Team Members that are given editing permissions can also modify and create derivative works based upon the Project and any Project Content in the Team Space, as permitted by the functionality of the Services. By adding Team Members to your Project Team, you are hereby authorizing us to share all your Projects (whether completed or work in progress), Project Content and other User Content associated with the Project Team, with all the Team Members in that Project Team.</p>
							<p>If you are working in a Team Space and have editing permissions, you can also share Projects or specific Designs with specific Users that are not members of the Project Team or the public through the sharing functionality of the Services. If you are working in Personal Space, you can share individual Designs with specific Users or the public through the sharing functionality of the Services. If you share a Project or Design publicly, please note that the Project or Design can be viewed by anyone, including individuals who are not Users.</p>
							<p>You acknowledge sole responsibility for and assume all risk arising from sharing your Projects or Designs with the Team Members and other individuals. You understand that anyone that has access to your Project or Design can copy and save their own version of the Project Content or Design and privately edit it.</p>
							<p>If you create a Design and/or Project, you hereby grant Pair the rights and licenses necessary to make your Design and/or Project Content available to you, your Team Members, other Users and other visitors to the Services as described above. You hereby grant and agree to grant, or permit Pair to grant, your Team Members, and other Users of the Services the right to copy, distribute, modify and create derivative works based upon your Project and the Project Content as permitted by the functionality of the Services.</p>
						</li>
					</ul>
				</div>

				<h5>5. Developing Applications for Use on the Services</h5>
				<div>
					<ul className="sub-section">
						<li>
							<h6>5.1 Applications, General</h6>
							<p>As a User, you may develop certain types of applications, such as plugins, component libraries, and code components, that can be submitted to and made available via and published to the Services, for use by yourself in your Personal Space, your Team Members in your Team Space, or all other Users of the Services (the &ldquo;Application(s)&rdquo;). Pair provides access to APIs that you may use to develop the Applications, subject to the API terms set forth in Section 4.4 above and any other terms provided by Pair governing use of the API.</p>
						</li>
						<li>
							<h6>5.2 Submitting Applications</h6>
							<p>You may submit an Application to be made available via the Services by uploading the Application through the User portal on the Services. At the time of submission, you may select who will have access to your Application when it is published. Applications may be used by <span className="roman-index">i</span> yourself only, for your own personal use; <span className="roman-index">ii</span> your Team Members on a Project; or <span className="roman-index">iii</span> all other Users of the Services, which access you can designate at the time of submission or otherwise via the functionality of the Services. At any time after publishing an Application to the Services, Pair reserves the right to remove the Application from the Services for any reason, at its sole discretion.</p>
						</li>
					</ul>
				</div>

				<h5>6. Subscriptions and Payment</h5>
				<div>
					<ul className="sub-section">
						<li>
							<h6>6.1 Pricing</h6>
							<p>Subject to these Terms, the Services are provided to you for free up to certain limits and with limited features. In addition, if you are currently enrolled in a school or university and are accessing the Services solely for educational and non-commercial purposes, then you can use our Services for free, without limitation, provided all the Team Members in your Project Team are also students (&ldquo;Educational Use&rdquo;).</p>
							<p>Except for Educational Use, usage over these limits or access to certain features requires you to purchase a subscription (&ldquo;Subscription&rdquo;). Your and your Team Members&rsquo; rights and obligations will be based on the type of Project Team you choose (i.e. free or paid Subscription). Details about the different types of Subscriptions, and the limits and available features associated with the Services, are available at <NavLink to={Pages.PRICING}>www.pairurl.com/pricing</NavLink>.</p>
							<p>You may change the type of Subscription at any time by <span className="roman-index">i</span> emailing us at <NavLink to="mailto:support@pairurl.com" target="_blank" onClick={(event)=> handleURL(event, 'mailto:support@pairurl.com')}>support@pairurl.com</NavLink> and following any instructions, if any, we provide to you in response to your change request or <span className="roman-index">ii</span> initiating a change through your Account settings within the Services.</p>
							<p>Notwithstanding the above, if you use any of your Designs or Projects for commercial purposes, or any of your Team Members stop being a student, then your Project Team will be locked and you will not be able to access any Projects until you pay for a Subscription or reduce your Project Team composition to two Team Members. For details on pricing, please visit <NavLink to={Pages.PRICING}>www.pairurl.com/pricing</NavLink>.</p>
						</li>
						<li>
							<h6>6.2 Payment Terms</h6>
							<p>When you purchase a Subscription (such purchase, a &ldquo;Transaction&rdquo;) you expressly authorize us (or our third party payment processor) to charge you for such Transaction. We may ask you to supply additional information relevant to your Transaction, including, without limitation, your credit-card number, the expiration date of your credit card, and your address(es) for billing (such information, &ldquo;Payment Information&rdquo;). You represent and warrant that you have the legal right to use all payment method(s) represented by any such Payment Information. When you initiate a Transaction, you authorize us to provide your Payment Information to our third party service providers so we can complete your Transaction and to charge your payment method for the type of Transaction you have selected (plus any applicable taxes and other charges). You may need to provide additional information to verify your identity before completing your Transaction (such information is included within the definition of Payment Information).</p>
						</li>
						<li>
							<h6>6.3 Authorization for Recurring Payments</h6>
							<p>If you purchase a Subscription, you will be charged the then-applicable Subscription fee (&ldquo;Subscription Fee&rdquo;) at the beginning of your Subscription and each month, quarter or year thereafter, depending on the term of your Subscription, at the then-current rate. Subscription Fees are outlined at <NavLink to={Pages.PRICING}>www.pairurl.com/pricing</NavLink>. Please note that our Subscription Fees are subject to change, although we will notify you before we effect any change in Subscription Fees.</p>
							<p>By agreeing to these Terms and purchasing a Subscription, you acknowledge that your Subscription has recurring payment features and you accept responsibility for all recurring payment obligations prior to cancellation of your Subscription by you or Pair. We (or our third party payment processor) will automatically charge you in accordance with term of your Subscription (e.g., each month, quarter or year), on the calendar day corresponding to the commencement of your Subscription, using the Payment Information you have provided. In the event your Subscription began on a day not contained in a given month, your payment method will be charged on a day in the applicable month or such other day as we deem appropriate. For example, if you started a monthly Subscription on January 31st, your next payment date is likely to be February 28th, and your payment method would be billed on that date. We may also periodically authorize your payment method in anticipation of applicable fees or related charges. Your Subscription continues until cancelled by you or we terminate your access to or use of the Services or the Subscription in accordance with these Terms.</p>
						</li>
						<li>
							<h6>6.4 Cancelling Subscriptions</h6>
							<p>You may cancel your Subscription at any time but please note that such cancellation will be effective at the end of the then-current Subscription period. YOU WILL NOT RECEIVE A REFUND OF ANY PORTION OF THE SUBSCRIPTION FEE PAID FOR THE THEN CURRENT SUBSCRIPTION PERIOD AT THE TIME OF CANCELLATION. To cancel, you can either <span className="roman-index">i</span> email us at <NavLink to="mailto:support@pairurl.com" target="_blank" onClick={(event)=> handleURL(event, 'mailto:support@pairurl.com')}>support@pairurl.com</NavLink> and follow any instructions, if any, we provide to you in response to your cancellation request, or <span className="roman-index">ii</span> initiate a cancellation through your Account settings within the Services. You will be responsible for all Subscription Fees (plus any applicable taxes and other charges) incurred for the then current Subscription period. If you cancel, we will allow you to access any private Projects associated with such Subscription until the most recently paid-up Subscription period ends. Cancelling your Subscription won&rsquo;t cancel your Account. See Section 14 (Termination) below for information on terminating your Account.</p>
							<p>At the end of the Subscription period, or if you stop paying the Subscription Fee, any Project Team you have created that is subject to purchase of a Subscription will be locked or disabled and you and any other Team Members will no longer be able to access the Project Team and any related Projects. We will not delete your Project Content and User Content, but you and your Team Members will not be able to access it, unless and until you purchase a Subscription again or modify your Project Team such that it meets the limits of a free Project Team. Notwithstanding the foregoing, Pair makes no guarantees regarding the retention of your Project Content and User Content associated with a locked Project Team. You acknowledge sole responsibility for and assume all risk arising from cancellation of your Subscription, including, without limitation, any loss of data associated with a Project.</p>
						</li>
					</ul>
				</div>

				<h5>7. Content and Content Rights</h5>
				<div>
					<p>For purposes of these Terms: <span className="roman-index">i</span> &ldquo;Content&rdquo; means text, graphics, designs, images, music, software, audio, video, works of authorship of any kind, and information or other materials that are posted, generated, provided or otherwise made available through the Services (including without limitation, the Tools); and <span className="roman-index">ii</span> &ldquo;User Content&rdquo; means any Content that Users (including you) provide to be made available through the Services, including without limitation any Designs and Project Content created by a User (other than the Tools and any other Content that we provide to you) as well as modifications a User makes to another User&rsquo;s Designs, digital typefonts or font files (&ldquo;Fonts&ldquo;), and Applications.</p>
					<ul className="sub-section">
						<li>
							<h6>7.1 Ownership and Responsibility of User Content</h6>
							<p>As between you and Pair, you own your User Content. Pair does not claim any ownership rights in any User Content that you make available through the Services and nothing in these Terms will be deemed to restrict any rights that you may have to use and exploit your User Content. Subject to the foregoing, Pair and its licensors exclusively own all right, title and interest in and to the Services and Content, including all associated intellectual property rights. You agree not to remove, alter or obscure any copyright, trademark, service mark or other proprietary rights notices incorporated in or accompanying the Services or Content.</p>
							<p>You are solely responsible for all your User Content. You represent and warrant that you own all your User Content or you have all rights that are necessary to grant us the license rights in your User Content under these Terms. You also represent and warrant that neither your User Content, nor your use and provision of your User Content, nor any use of your User Content by Pair or any other users on or through the Services will infringe, misappropriate or violate a third party&rsquo;s intellectual property rights, or rights of publicity or privacy, or result in the violation of any applicable law or regulation.</p>
						</li>
						<li>
							<h6>7.2 Rights in User Content Granted by You</h6>
							<p>By making any User Content, including Fonts and Applications, available through our Services you hereby grant to Pair a limited, non-exclusive, worldwide, royalty-free, transferable license, with a right to sublicense, to access, view, use, copy, modify, publicly display, publicly perform and distribute your User Content to the extent reasonably needed to operate and provide the Services to you, and other Users as the functionality of the Services permits. For example, we can grant other Users the rights to use your Applications.</p>
							<p>By uploading any Fonts to Pair, the Site or as part of using the Services, and by assenting to a confirmation query that we provide about your rights to use and redistribute Fonts, you are representing and warranting to Pair that (a) you own copyright or title in and to the Fonts, or that the owner of the Fonts has granted you a license to distribute copies of the Fonts to others and to sublicense others to use the Fonts; (b) you understand that compliance with the foregoing may require you or your organization to purchase an &ldquo;extended rights&rdquo; license or other redistribution license from the font owner for the benefit of your organization or other users, for a particular Font before uploading that Font to Pair, the Site or for the Services, and/or for MacOS fonts, inspect restrictions stated in the Font Book/Preview/Show Font Info panel; and (c) you acknowledge that you are solely responsible to determine whether you own or have licensed a scope of rights for Fonts that you upload that permit uploading, redistributing and use of those Fonts by others using the Services and that the failure to do so may expose you to liability to the owner of uploaded Fonts for infringement of any copyright that they own.</p>
							<p>Terms of service for Microsoft system fonts generally prohibit any uploading or redistribution of MS system fonts, but note that some may be subject to &ldquo;extended rights&rdquo; licenses from Monotype. The required &ldquo;internal use server license&rdquo; from Monotype appears to require payment. See <NavLink to="https://docs.microsoft.com/en-us/typography/fonts/font-faq" target="_blank" onClick={(event)=> handleURL(event, 'https://docs.microsoft.com/en-us/typography/fonts/font-faq')}>https://docs.microsoft.com/en-us/typography/fonts/font-faq</NavLink>, <NavLink to="http://catalog.monotype.com/licensing-options" target="_blank" onClick={(event)=> handleURL(event, 'http://catalog.monotype.com/licensing-options')}>http://catalog.monotype.com/licensing-options</NavLink>.</p>
							<p>You understand and agree that you share your User Content (whether your own Designs or your modifications and improvements to another user&rsquo;s Designs) through the Services at your own risk. Pair is not responsible for any ownership or licensing arrangements between you and other Team Members regarding User Content shared within a Project Team, or between you and anyone else that has access to your Designs and/or other User Content on account of your public posting of your Designs and/or User Content. In sharing your Designs and User Content, with other Team Members or through public posting, it&rsquo;s your responsibility to spell out the rights that your Team Members or the general public, as applicable, have in connection with their access to and use of your Designs and User Content. Any disputes regarding ownership or licensing of a Design or modifications thereto that have been shared amongst a Project Team are between you and your Team Members. Any disputes regarding ownership or licensing of a Design or modifications thereto that have been shared via Public Posting are between you and those parties that have access to such Design or modifications on account of your public posting. We are not responsible for resolving any intellectual property or ownership disputes between Team Members or between you and anyone else that has access to your Designs and/or other User Content an account of your public posting, so you should exercise good judgment when deciding whether or not to participate in a Project Team or about the public posting of any of your Designs and/or other User Content.</p>
							<p>You acknowledge sole responsibility for and assume all risk arising from developing, submitting, and publishing Applications to the Services, regardless of whether the Application are made available to only yourself, your Team Members, or all other Users of the Services.</p>
						</li>
						<li>
							<h6>7.3 Rights in Content Granted by Pair</h6>
							<p>If you are not a registered User, subject to your compliance with these Terms, Pair grants you a limited, non-exclusive, non-transferable license to view any Content to which you are permitted access solely for your personal and non-commercial purposes.</p>
							<p>If you are a registered User, subject to your compliance with these Terms, Pair grants you a limited, non-exclusive, worldwide, non-transferable, non-sublicensable license to access and view the Content (including any User Content as applicable) solely in connection with your permitted use of the Services.</p>
							<p>In addition, Pair grants <span className="roman-index">i</span> your Team Members (and by adding any Team Members to your Project Team, you hereby allow Pair to grant to your Team Members) the right to copy, distribute, modify and create derivative works based upon your Project and the Project Content as permitted by the functionality of the Services and <span className="roman-index">ii</span> other Users the right to access and use the Applications that you publish and make available via the Services as permitted by and in accordance with the functionality of the Services.</p>
						</li>
						<li>
							<h6>7.4 Data Maintenance and Backup Procedures</h6>
							<p>In the event of any loss or corruption of any data associated with the Services, Pair will use commercially reasonable efforts to restore the lost or corrupted data from the latest backup of such data maintained by Pair. EXCEPT FOR THE FOREGOING, Pair WILL NOT BE RESPONSIBLE FOR ANY LOSS, DESTRUCTION, ALTERATION, UNAUTHORIZED DISCLOSURE OR CORRUPTION OF ANY SUCH DATA.</p>
						</li>
						<li>
							<h6>7.5 Deleting Content</h6>
							<p>You can remove certain User Content through the Services. However, some of your User Content (including, without limitation, posts or comments that have been made on the Project Content associated with public Projects) may not be removed and copies of your User Content may continue to exist on the Services in archive or backup form. However, we may remove or delete your User Content within a reasonable period of time after the termination or cancellation of your Account in accordance with Section 14 (Termination). We are not responsible or liable for the removal or deletion of (or the failure to remove or delete) any of your User Content.</p>
						</li>
					</ul>
				</div>

				<h5>8. Feedback</h5>
				<div>
					<p>We welcome feedback, comments and suggestions for improvements to the Services (&ldquo;Feedback&rdquo;) by emailing us at <NavLink to="mailto:support@pairurl.com" target="_blank" onClick={(event)=> handleURL(event, 'mailto:support@pairurl.com')}>support@pairurl.com</NavLink> . As we need to be able to freely work with your Feedback to improve the Services, you hereby irrevocably transfer and assign all right, title and interest (including all intellectual property rights, such as copyrights or trade secrets) in and to the Feedback, including any and all &ldquo;moral rights&rdquo; that you might have in such Feedback, and you hereby forever waive and agree never to assert any and all &ldquo;moral rights&rdquo; you may have in the Feedback.</p>
				</div>

				<h5>9. Privacy Policy</h5>
				<div>
					<p>Please refer to our Privacy Policy (www.pairurl.com/privacy) for information on how we collect, use and disclose information from our users.</p>
				</div>

				<h5>10. General Prohibitions</h5>
				<div>
					<p>You agree not to do any of the following:</p>
					<ul className="sub-section">
						<li>Post, upload, publish, submit or transmit any User Content that: <span className="roman-index">i</span> infringes, misappropriates or violates a third party&rsquo;s patent, copyright, trademark, trade secret, moral rights or other intellectual property rights, or rights of publicity or privacy; <span className="roman-index">ii</span> violates, or encourages any conduct that would violate, any applicable law or regulation or would give rise to civil liability; <span className="roman-index">iii</span> is fraudulent, false, misleading or deceptive; <span className="roman-index">iv</span> is defamatory, obscene, pornographic, vulgar or offensive; <span className="roman-index">v</span> promotes discrimination, bigotry, racism, hatred, harassment or harm against any individual or group; <span className="roman-index">vi</span> is violent or threatening or promotes violence or actions that are threatening to any person or entity; or <span className="roman-index">vii</span> promotes illegal or harmful activities or substances.</li>
						<li>Use, display, mirror or frame the Services, or any individual element within the Services, Pair&rsquo;s name, any Pair trademark, logo or other proprietary information, or the layout and design of any page or form contained on a page, without Pair&rsquo;s express written consent;</li>
						<li>Access, tamper with, or use non-public areas of the Services, Pair&rsquo;s computer systems, or the technical delivery systems of Pair&rsquo;s providers;</li>
						<li>Attempt to probe, scan or test the vulnerability of any Pair system or network or breach any security or authentication measures;</li>
						<li>Avoid, bypass, remove, deactivate, impair, descramble or otherwise circumvent any technological measure implemented by Pair or any of Pair&rsquo;s providers or any other third party (including another user) to protect the Services or Content;</li>
						<li>Attempt to access or search the Services or Content or download Content from the Services through the use of any engine, software, tool, agent, device or mechanism (including spiders, robots, crawlers, data mining tools or the like) other than the software and/or search agents provided by Pair or other generally available third party web browsers;</li>
						<li>Send any unsolicited or unauthorized advertising, promotional materials, email, junk mail, spam, chain letters or other form of solicitation;</li>
						<li>Use any meta tags or other hidden text or metadata utilizing a Pair trademark, logo URL or product name without Pair&rsquo;s express written consent;</li>
						<li>Use the Services or Content for any commercial purpose or for the benefit of any third party or in any manner not permitted by these Terms or the functionality of the Services;</li>
						<li>Forge any TCP/IP packet header or any part of the header information in any email or newsgroup posting, or in any way use the Services or Content to send altered, deceptive or false source-identifying information;</li>
						<li>Attempt to decipher, decompile, disassemble or reverse engineer or in any way attempt to derive the source code of any of the software used to provide the Services or Content;</li>
						<li>Interfere with, or attempt to interfere with, the access of any user, host or network, including, without limitation, sending a virus, overloading, flooding, spamming, or mail-bombing the Services;</li>
						<li>Collect or store any personally identifiable information from the Services from other users of the Services without their express permission;</li>
						<li>Impersonate or misrepresent your affiliation with any person or entity;</li>
						<li>Violate any applicable law or regulation; or</li>
						<li>Encourage or enable any other individual to do any of the foregoing.</li>
					</ul>
					<p>Although we&rsquo;re not obligated to monitor access to or use of the Services or Content or to review or edit any Content, we have the right to do so for the purpose of operating the Services, to ensure compliance with these Terms, or to comply with applicable law or other legal requirements. We reserve the right, but are not obligated, to remove or disable access to any Content, including User Content, at any time and without notice, including, but not limited to, if we, at our sole discretion, consider any Content or User Content to be objectionable, in violation of these Terms or the law. We may also consult and cooperate with law enforcement authorities to prosecute users who violate the law.</p>
				</div>

				<h5>11. Copyright Policy</h5>
				<div>
					<p>Pair respects copyright law and expects its users to do the same. It is Pair&rsquo;s policy to terminate in appropriate circumstances Users who repeatedly infringe the rights of copyright holders.</p>
				</div>

				<h5>12. Links to and Integration with Third Party Websites or Resources</h5>
				<div>
					<p>The Services may contain links to third-party websites or resources and may offer integration with such third-party websites or services (For example, we may offer integration with certain Google services). We provide these links and integration functions only as a convenience and are not responsible for the content, products or services on or available from those websites or resources or links displayed on such sites. You acknowledge sole responsibility for, and assume all risk arising from, your use of or integration with any third-party websites or resources.</p>
				</div>

				<h5>13. Publicity</h5>
				<div>
					<p>You agree that Pair may identify you or your company and use your company&rsquo;s logo and trademarks (collectively, the &ldquo;Marks&rdquo;) on the Site and in marketing materials to identify you or your company as a user of the Services, and you hereby grant us a non-exclusive, royalty-free license to do so on our Site or in any media now or later developed in connection with any marketing, promotion or advertising of Pair or the Services. If you do not want to allow us the right to use your Marks or identify you or your company you may opt out such marketing requests by emailing us at <NavLink to="mailto:press@pairurl.com" target="_blank" onClick={(event)=> handleURL(event, 'mailto:press@pairurl.com')}>press@pairurl.com</NavLink>.</p>
				</div>

				<h5>14. Termination</h5>
				<div>
					<p>We may terminate your access to and use of the Services, at our sole discretion, at any time and without notice or liability to you, provided that, if you have paid for a Subscription and the termination is not due to your breach of this Agreement, Pair will refund you any prepaid fees for the period of your Subscription that extends beyond the effective date of such termination. You may cancel your Account at any time by sending an email to us at <NavLink to="mailto:support@pairurl.com" target="_blank" onClick={(event)=> handleURL(event, 'mailto:support@pairurl.com')}>support@pairurl.com</NavLink> . Upon any termination, discontinuation or cancellation of Services or your Account, the following provisions of these Terms will survive: Feedback; Privacy Policy; provisions related to permissions to access Content (to the extent applicable); Content and Content Rights; Content Ownership, Responsibility and Removal; General Prohibitions; Warranty Disclaimers; Indemnity; Limitation of Liability; Governing Law and Dispute Resolution; General Terms.</p>
				</div>

				<h5>15. Warranty Disclaimers</h5>
				<div>
					<p>AS BETWEEN YOU AND Pair, THE SERVICES, CONTENT, AND APPLICATIONS MADE AVAILABLE ON THE SERVICES ARE PROVIDED &ldquo;AS IS,&rdquo; WITHOUT WARRANTY OF ANY KIND. WITHOUT LIMITING THE FOREGOING, WE EXPLICITLY DISCLAIM ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, QUIET ENJOYMENT AND NON-INFRINGEMENT AND ANY WARRANTIES ARISING OUT OF COURSE OF DEALING OR USAGE OF TRADE. We make no warranty that the Services will meet your requirements or be available on an uninterrupted, secure, or error-free basis. We make no warranty regarding the quality, accuracy, timeliness, truthfulness, completeness or reliability of any Content. If you install and use an Application that is made available on the Services, we make no warranty that the Application will perform its intended function or deliver any expected results, and you acknowledge that you assume all risk arising from use of the Applications.</p>
				</div>

				<h5>16. Indemnity</h5>
				<div>
					<p>You will indemnify and hold harmless Pair and its officers, directors, employees and agents, from and against any claims, disputes, demands, liabilities, damages, losses, and costs and expenses, including, without limitation, reasonable legal and accounting fees, arising out of or in any way connected with <span className="roman-index">i</span> your access to or use of the Services or Content; <span className="roman-index">ii</span> your User Content; or <span className="roman-index">iii</span> your violation of these Terms.</p>
				</div>

				<h5>17. Limitation of Liability</h5>
				<div>
					<p>NEITHER Pair NOR ANY OTHER PARTY INVOLVED IN CREATING, PRODUCING, OR DELIVERING THE SERVICES, TOOLS, OR CONTENT WILL BE LIABLE FOR ANY INCIDENTAL, SPECIAL, EXEMPLARY OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS, LOSS OF DATA OR GOODWILL, SERVICE INTERRUPTION, COMPUTER DAMAGE OR SYSTEM FAILURE OR THE COST OF SUBSTITUTE SERVICES ARISING OUT OF OR IN CONNECTION WITH THESE TERMS OR FROM THE USE OF OR INABILITY TO USE THE SERVICES, TOOLS, OR CONTENT, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), PRODUCT LIABILITY OR ANY OTHER LEGAL THEORY, AND WHETHER OR NOT Pair HAS BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGE, EVEN IF A LIMITED REMEDY SET FORTH HEREIN IS FOUND TO HAVE FAILED OF ITS ESSENTIAL PURPOSE. SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF LIABILITY FOR CONSEQUENTIAL OR INCIDENTAL DAMAGES, SO THE ABOVE LIMITATION MAY NOT APPLY TO YOU.</p>
					<p>IN NO EVENT WILL Pair&rsquo;S TOTAL LIABILITY ARISING OUT OF OR IN CONNECTION WITH THESE TERMS, ANY DISPUTE IN RELATION TO INTELLECTUAL PROPERTY RIGHTS IN A DESIGN OR FROM THE USE OF OR INABILITY TO USE THE SERVICES OR CONTENT EXCEED THE AMOUNTS YOU HAVE PAID OR ARE PAYABLE BY YOU TO Pair FOR USE OF THE SERVICES OR CONTENT, OR IF YOU HAVE NOT HAD ANY SUCH PAYMENT OBLIGATIONS, ONE HUNDRED UNITED STATES DOLLARS ($100).</p>
					<p>THE LIMITATIONS OF DAMAGES SET FORTH ABOVE ARE FUNDAMENTAL ELEMENTS OF THE BASIS OF THE BARGAIN BETWEEN Pair AND YOU.</p>
				</div>

				<h5>18. Governing Law</h5>
				<div>
					<p>These Terms and any action related thereto will be governed by the laws of the State of California without regard to its conflict of laws provisions.</p>
					<p>This Section 18 only applies to Claims between us and individual consumers, and is governed by The Federal Arbitration Act.</p>
				</div>

				<h5>19. Dispute Resolution for Individual Consumers</h5>
				<div>
					<p>Our goal is to provide you with great service, so we&rsquo;ll try our best to resolve any disagreements that you have with us. If we can&rsquo;t, then you and we both agree to resolve disputes related to your use of the Services or these Terms (each, a &ldquo;Claim&rdquo;) in binding arbitration instead of court, except that a Claim may be brought in small claims court if it qualifies for it. You and we also agree that either party may bring suit in court to enjoin the infringement or other misuse of intellectual property rights.</p>
					<ul>
						<li><h6 className="intro-question">What is arbitration?</h6> Arbitration does not involve a judge or jury. Instead, a neutral person (the &ldquo;arbitrator&rdquo;) hears each party&rsquo;s side of the dispute, and makes a decision that is finally binding on both parties. The arbitrator can award the same relief as a court could award, including monetary damages. While court review of an arbitration award is limited, if a party fails to comply with the arbitrator&rsquo;s decision, then the other party can have the arbitration decision enforced by a court. If for any reason a Claim proceeds in court rather than in arbitration, you and we each waive any right to a jury trial.</li>
						<li><h6 className="intro-question">Can a Claim be part of a class action or similar proceeding?</h6> No. You agree to resolve your Claims with us solely on an individual basis, and not as part of a class, representative or consolidated action. We agree to do the same. </li>
						<li><h6 className="intro-question">What rules apply in the arbitration?</h6> The arbitration will be conducted under the American Arbitration Association (&ldquo;AAA&rdquo;) Consumer Arbitration Rules (the &ldquo;AAA Rules&rdquo;). The AAA Rules are available at www.adr.org or by calling 1-800-778-7879. </li>
						<li><h6 className="intro-question">How will the arbitration be conducted? & How much does it cost?</h6> The arbitration will be conducted by the AAA or a comparable arbitration body in the event the AAA is unable to conduct the arbitration. Payment of all filing, administration and arbitrator fees will be governed by the AAA Rules. Unless the arbitrator finds your Claim frivolous, we&rsquo;ll pay for all filing, administration and arbitrator fees if your Claim is for less than $10,000, and we won&rsquo;t seek our attorneys&rsquo; fees and costs if we prevail in the arbitration. The arbitration may be conducted in writing, remotely (e.g., by videoconference) or in-person in the county where you live (or at some other location that we both agree to). </li>
						<li><h6 className="intro-question">How do I start an arbitration proceeding?</h6> To begin an arbitration proceeding against us, send a letter requesting arbitration and describing your Claim to <NavLink to="mailto:legal@pairurl.com" target="_blank" onClick={(event)=> handleURL(event, 'mailto:legal@pairurl.com')}>legal@pairurl.com</NavLink>.</li>
					</ul>
					<p><span className="notice-msg">INSTRUCTIONS FOR OPTING-OUT OF ARBITRATION:</span> If you don&rsquo;t want to agree to arbitrate your Claims as explained above, then you can opt-out of this arbitration agreement by notifying us of your decision in writing at <NavLink to="mailto:legal@pairurl.com" target="_blank" onClick={(event)=> handleURL(event, 'mailto:legal@pairurl.com')}>legal@pairurl.com</NavLink>, 116 New Montgomery St, Suite 400, San Francisco, CA 94105. You must opt-out within 30 days of the date you first agree to these Terms or any updated Terms. </p>
				</div>

				<h5>20. Dispute Resolution for Companies</h5>
				<div>
					<p>If you are accessing and using the Services on behalf of a company or other legal entity, any claim, cause of action or dispute between the company or other legal entity and Pair arising out of or relating to these Terms or the Services and Content will be resolved exclusively in the U.S. District Court for the Northern District of California or a state court located in Santa Clara County, and you agree to submit to the personal jurisdiction of such courts for the purpose of litigating all such claims.</p>
				</div>

				<h5>21. General Terms</h5>
				<div>
					<p>These Terms constitute the entire and exclusive understanding and agreement between Pair and you regarding the Services and Content, and these Terms supersede and replace any and all prior oral or written understandings or agreements between Pair and you regarding the Services and Content. If for any reason an arbitrator or court of competent jurisdiction finds any provision of these Terms invalid or unenforceable, that provision will be enforced to the maximum extent permissible and the other provisions of these Terms will remain in full force and effect.</p>
					<p>You may not assign or transfer these Terms, by operation of law or otherwise, without Pair&rsquo;s prior written consent. Any attempt by you to assign or transfer these Terms, without such consent, will be null and of no effect. Pair may freely assign or transfer these Terms without restriction. Subject to the foregoing, these Terms will bind and inure to the benefit of the parties, their successors and permitted assigns.</p>
					<p>Any notices or other communications provided by Pair under these Terms, including those regarding modifications to these Terms, will be given by Pair: <span className="roman-index">i</span> via e-mail; or <span className="roman-index">ii</span> by posting to the Site. For notices made by e-mail, the date of receipt will be deemed the date on which such notice is transmitted.</p>
					<p>Pair&rsquo;s failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. Except as expressly set forth in these Terms, the exercise by either party of any of its remedies under these Terms will be without prejudice to its other remedies under these Terms or otherwise.</p>
				</div>

				<h5>22. Accessing Apps</h5>
				<div>
					<p>The following terms apply to any App accessed through or downloaded from any app store or distribution platform (like the Apple App Store or Google Play) where the App may now or in the future be made available (each an "App Provider"). You acknowledge and agree that:</p>
					<ul>
						<li>These Terms are concluded between you and Pair, and not with the App Provider, and Pair (not the App Provider), is solely responsible for the App.</li>
						<li>The App Provider has no obligation to furnish any maintenance and support services with respect to the App.</li>
						<li>In the event of any failure of the App to conform to any applicable warranty, you may notify the App Provider, and the App Provider will refund the purchase price for the App to you (if applicable) and, to the maximum extent permitted by applicable law, the App Provider will have no other warranty obligation whatsoever with respect to the App. Any other claims, losses, liabilities, damages, costs or expenses attributable to any failure to conform to any warranty will be the sole responsibility of Pair.</li>
						<li>The App Provider is not responsible for addressing any claims you have or any claims of any third party relating to the App or your possession and use of the App, including, but not limited to: <span className="roman-index">i</span> product liability claims; <span className="roman-index">ii</span> any claim that the App fails to conform to any applicable legal or regulatory requirement; and <span className="roman-index">iii</span> claims arising under consumer protection or similar legislation.</li>
						<li>In the event of any third party claim that the App or your possession and use of that App infringes that third party&rsquo;s intellectual property rights, Pair will be solely responsible for the investigation, defense, settlement and discharge of any such intellectual property infringement claim to the extent required by these Terms.</li>
						<li>The App Provider, and its subsidiaries, are third-party beneficiaries of these Terms as related to your license to the App, and that, upon your acceptance of the Terms, the App Provider will have the right (and will be deemed to have accepted the right) to enforce these Terms as related to your license of the App against you as a third-party beneficiary thereof.</li>
						<li>You represent and warrant that <span className="roman-index">i</span> you are not located in a country that is subject to a U.S. Government embargo, or that has been designated by the U.S. Government as a terrorist- supporting country; and <span className="roman-index">ii</span> you are not listed on any U.S. Government list of prohibited or restricted parties. </li>
						<li>You must also comply with all applicable third party terms of service when using the App.</li>
					</ul>
				</div>

				<h5>23. Contact Information</h5>
				<div>
					<p>If you have any questions about these Terms or the Services please contact Pair at: <NavLink to="mailto:support@pairurl.com" target="_blank" onClick={(event)=> handleURL(event, 'mailto:support@pairurl.com')}>support@pairurl.com</NavLink>.</p>
				</div>
			</div>
		</BasePage>
	);
}


export default (TermsPage);

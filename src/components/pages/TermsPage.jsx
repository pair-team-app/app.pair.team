
import React, { Component } from 'react';
import './TermsPage.css';

import BottomNav from '../elements/BottomNav';

class TermsPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		return (
			<div className="page-wrapper terms-page-wrapper">
				<h3>Terms of Service</h3>
				<div className="terms-text">
					<p>Please read these terms of service (&ldquo;Agreement&rdquo;) carefully because it is an agreement between you (&ldquo;you&rdquo;) and Design Engine AI, Inc. (&ldquo;Design Engine&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), and governs your access to and use of Design Engine’s platform, client-side plug-in (the &ldquo;Plug-in&rdquo;) (where applicable), our website located at https://designengine.ai/ (the &ldquo;Site&rdquo;), and related services (Design Engine’s platform, the Terminal application, the macOS application, the Site and related services are collectively referred as the &ldquo;Services&rdquo;).</p>
					<p>If you are accessing and using the Services by or on behalf of a company or other organization, the individual accepting this Agreement represents and warrants that he or she has the authority to bind that company or other organization to this Agreement, and &ldquo;you&rdquo; and &ldquo;your&rdquo; will refer to that company or other organization. Use of and access to the Services is conditioned upon compliance with this Agreement and all applicable local, state, national, and international laws, rules and regulations. By checking the box next to ‘I agree to the Design Engine Terms of Service’, you indicate that you understand and agree to be bound by these terms of service.</p>
					<p>We may modify this Agreement (including any policies we reference), in our sole discretion and at any time, by posting a revised version on the Site or by otherwise notifying you in accordance with Section 10.6. It is important that you review this Agreement whenever we modify it because if you continue to use the Services after we have posted a modified Agreement on the Site or notified you, you are indicating to us that you agree to be bound by the modified Agreement. If you don’t agree to be bound by the modified Agreement, then you may not use the Services anymore. Because our Services are evolving over time we may change or discontinue all or any part of the Services, at any time and without notice, at our sole discretion.</p>

					<h5>FREE TRIAL</h5>
					<p>You can receive a free trial to our Services for the trial period described in our Site (the &ldquo;Trial Period&rdquo;). If you choose to subscribe to a paid subscription plan for the Services at or before the end of the Trial Period, we will preserve your Data (as defined in Section 4.2) for your subscription plan. If you do not subscribe to a paid subscription plan at or before the end of the Trial Period, we reserve the right to delete your Data after the expiration of the Trial Period.</p>

					<h5>USE OF SERVICES</h5>
					<p>2.1 Account<br />In order to access and use the Services, you will need to register with us and create an account (&ldquo;Account&rdquo;). We reserve the right to suspend or terminate your Account if any information provided during the registration process or thereafter is or becomes inaccurate, false or misleading. You are responsible for maintaining the confidentiality of your Account, including the login and passwords for all users who you have authorized to access your Account (&ldquo;Authorized Users&rdquo;). You agree to notify Design Engine if any passwords are lost, stolen, or disclosed to an unauthorized third party, or otherwise may have been compromised. You are responsible for all activities that occur under your Account, including those carried out by any Authorized Users. You will promptly notify Design Engine of any unauthorized use of or access to the Services. You will ensure that your Authorized Users, employees, agents, and representatives comply with all of your obligations under this Agreement.</p>
					<p>2.2 Rights to Use the Services<br />Subject to your compliance with the terms and conditions of this Agreement, during the subscription term or Trial Period (as the case may be), (a) we will make the applicable Services available to you and your Authorized Users; and (b) we hereby grant you and your Authorized Users a limited, non-exclusive, non-transferable, revocable right: (i) if you have a subscription to the Design Engine for recruiting mail platform, to download and install the Plug-in in connection with the Design Engine for recruiting mail platform with which you received the Plug-in; and (ii) to access and use the Services (and in the case of the Plug-in, in object code form), solely for your internal business use. Your rights in the Services will be limited to those expressly granted in this Section 2.2. Design Engine and its licensors reserve all rights and licenses in and to the Services not expressly granted under this Agreement.</p>
					<p>2.3 Prohibitions<br />You will not: (i) sell, resell, license, sublicense, distribute, rent or lease the Services, whether for a fee or not, or use the Services to operate any timesharing, service bureau, or similar business; (ii) copy or prepare derivative works of the Services in whole or in part; (iii) access the Services in order to build a competitive product or service; (iv) reverse engineer, reverse assemble, decompile or otherwise attempt to derive source code from any part of the Services; (v) use the Services in any unlawful manner, for any unlawful purpose, or in any manner inconsistent with this Agreement or applicable documentation; (vi) attempt to gain unauthorized access to any part of the Services or its related systems or networks; (vii) transmit a virus to, overload, flood, spam, or paralyze the Services or take any action or inaction that interferes with the integrity of the Services; (viii) attempt to access or search the Services or download any content from the Services through the use of any engine, software, tool, agent, device or mechanism (including spiders, robots, crawlers, data mining tools or the like) other than the software and/or search agents provided by Design Engine or other generally available third-party web browsers; or (ix) encourage, authorize, or enable anyone to do any of the foregoing.</p>
					<p>2.4 Modifications to Services<br />Because the Services are evolving over time, we may change the features within the Services and/or update the Services from time to time, without prior notice to you.</p>
					<p>2.5 Data Exchange<br />You may elect to participate in the Data Exchange Partnership program where participants to such program (each, a &ldquo;Data Exchange Partner&rdquo;) provide qualified recruiting text and corresponding performance outcomes and statistics (collectively, &ldquo;Exchanged Data&rdquo;). No personally identifiable information should be included in the Exchanged Data provided to us.</p>

					<h5>SUBSCRIPTION, FEES, AND PAYMENT</h5>
					<p>3.1 Fees<br />The Services are purchased as a subscription. The subscription term is as described in Section 5.2 of this Agreement. By subscribing to the Services, you agree to pay Design Engine the fees set forth in the applicable order form that Design Engine presents to you when you purchase your subscription (&ldquo;Order Form&rdquo;). Except as otherwise specified in this Agreement, payment obligations are non-cancelable and fees paid are non-refundable.</p>
					<p>3.2 Invoicing<br />All fees set forth in an Order Form are stated in and are payable in U.S. dollars. Unless stated otherwise in the Order Form, we will issue an invoice to you at the beginning of each subscription term, and invoiced charges are due thirty (30) days from the invoice date. You are responsible for providing complete and accurate billing and contact information to us and notifying us of any changes to such information. All past due amounts will incur interest at a rate of 1.5% per month or the maximum rate permitted by law, whichever is lower.</p>
					<p>3.3 Changes to Fee<br />We reserve the right to change our fees for the Services at any time and we will notify you in advance of such changes becoming effective. Changes to our fees will not apply retroactively and will only apply at the conclusion of your then-current subscription term. If you do not agree with the changes to our fees for the Services then your only recourse is to stop using the Services.</p>
					<p>3.4 Taxes All<br />stated fees are exclusive of taxes or duties of any kind. You will be responsible for, and will promptly pay, all taxes and duties of any kind (including but not limited to sales, use and withholding taxes) associated with this Agreement or your use of the Services, except for taxes based on Design Engine’s net income.</p>
					<p>3.5 Future Functionality<br />You agree that your purchases are not contingent on the delivery of any future functionality or features, or dependent on any oral or written public comments made by us regarding future functionality or features.</p>

					<h5>PROPRIETARY RIGHTS AND DATA LICENSE</h5>
					<p>4.1 Reservation of Rights<br />We and our licensors exclusively own the Services and all enhancements, improvements or derivative works of the Services, including any ideas, concepts, know-how, process, techniques and methodologies developed by Design Engine from performing the Services, and all copyrights, patents, trademarks, and other intellectual property rights therein. You may not remove, alter, or obscure any copyright, trademark, or other proprietary rights notices appearing on the Services.</p>
					<p>4.2 Your Data<br />We do not claim any ownership rights in any data, information or other materials that you provide through the Services, including Exchanged Data (collectively, &ldquo;Data&rdquo;). Nothing in this Agreement will be deemed to restrict any rights that you may have to use and exploit the Data.</p>
					<p>You hereby grant to Design Engine a non-exclusive, sublicenseable, worldwide, transferable, royalty-free license to use, reproduce, modify and make derivative works based upon the Data solely in connection with use of the Services and our provision of the Services to you. You represent and warrant that you or your licensors own all right, title and interest in and to the Data and that you have all rights in the Data that are necessary and sufficient to use this Data in connection with your Account on the Services, and to grant to Design Engine the rights in the Data that you grant to Design Engine under this Agreement.</p>
					<p>Design Engine may store and use certain Data, such as your recruiting text, and Metadata to identify common recruiting patterns and improve Design Engine’s products and services across Design Engine’s customer base. &ldquo;Metadata&rdquo; means metadata associated with your use of the Services, including IP addresses, stored sessions, account credentials, and network metadata. For clarity, Metadata does not include your Data. You agree and consent to access, collection, transmittal, storage, monitoring, copying, processing, analysis and use of the Metadata and your Data by Design Engine in order to administer, develop and improve the Services and Design Engine’s other products and services, and to monitor compliance with this Agreement.</p>
					<p>4.3 Feedback<br />If you provide Design Engine with any suggestions for improvement, comments, or other feedback regarding the Services (&ldquo;Feedback&rdquo;), you grant to us a non-exclusive, worldwide, perpetual, irrevocable, fully-paid, royalty-free, sublicensable and transferable license under any and all intellectual property rights that you own or control to use, copy, modify, create derivative works based upon and otherwise exploit the Feedback for any purpose.</p>

					<h5>TERM AND TERMINATION</h5>
					<p>5.1 Term of Agreement<br />This Agreement will remain in force and effect until the terms of all trials and subscriptions hereunder have expired or have been terminated.</p>
					<p>5.2 Term of Purchased Subscription<br />The initial term of each subscription shall be as specified in the applicable Order Form, as selected via the Site or through the Services. Except as otherwise specified in an Order Form, each subscription will automatically renew for the additional renewal terms equal to the expiring subscription term or one year (whichever is shorter), unless either party gives the other notice of non-renewal at least thirty (30) days before the end of the relevant subscription term. The initial term and any renewal term(s) are individually and collectively referred to in this Agreement as the &ldquo;subscription term.&rdquo;</p>
					<p>5.3 Suspension by Design Engine<br />Design Engine may suspend or terminate your Account and use of the Services immediately and without notice if you have breached any of the terms in this Agreement, or you have acted in a manner that clearly indicates that you do not intend to, or is unable to, comply with the terms of this Agreement. Design Engine will make a good faith effort to provide notice to you in advance of any suspension, and will not exercise its suspension remedy except in good faith and as reasonably necessary to resolve the issue giving rise to the suspension right. In addition, Design Engine may suspend or limit your Account and use of the Services as Design Engine deems appropriate to prevent, investigate or otherwise address (a) any suspected misuse of the Services or (b) any material risk to the security or performance of the Services, the network, or any other Design Engine customer or business partner. You will not be entitled to any compensation or credits unless the suspension was due to Design Engine’s error.</p>
					<p>5.4 Termination<br />Either party may terminate this Agreement upon written notice if the other party materially breaches this Agreement and fails to correct the breach within thirty (30) days following written notice from the non-breaching party specifying the breach; provided that the cure period for any default with respect to payment shall be five (5) business days.</p>
					<p>5.5 Surviving Provisions<br />Your rights under this Agreement will automatically terminate upon the any expiration or termination of this Agreement. The provisions of Sections 2.3, 3, 4, 5.5 and 6 through 10 will survive any expiration or termination of this Agreement. After termination or expiration of this Agreement, we will retain your Data submitted to the Services in accordance with our data retention policy and procedures.</p>

					<h5>CONFIDENTIALITY</h5>
					<p>6.1 &ldquo;Confidential Information&rdquo; means any business or technical information that a party discloses to the other party and designates as &ldquo;confidential&rdquo; or &ldquo;proprietary&rdquo; at the time of disclosure or that, given the nature or the information or the circumstances surrounding the disclosure, would reasonably be considered to be confidential. Your Confidential Information includes the Data. Our Confidential Information includes the Services, features and other information relating to the Services and the Feedback. Confidential Information does not include information that: (i) is or becomes generally known to the public through no fault or breach of this Agreement by the receiving party; (ii) is rightfully known by the receiving party at the time of disclosure; (iii) is independently developed by the receiving party without use of the disclosing party’s Confidential Information; or (iv) is rightfully received by the receiving party from a third party, who has the right to provide such information without breach of a confidentiality obligation owed to the disclosing party.</p>
					<p>6.2 Use and Disclosure Restrictions of Confidential Information<br />Except as permitted in this Agreement, each party will not use any Confidential Information disclosed by the other party except as necessary for the performance or enforcement of this Agreement and will not disclose such Confidential Information to any third party except to those of its employees and subcontractors who have a bona fide need to know such Confidential Information for the performance or enforcement of this Agreement; provided that each such employee and subcontractor is bound by a written agreement that contains use and nondisclosure restrictions consistent with the terms set forth in this Section. Each party will employ all reasonable steps to protect all Confidential Information disclosed by the other party from unauthorized use or disclosure, including, but not limited to, all steps that it takes to protect its own information of like importance. The foregoing obligations will not restrict either party from disclosing such Confidential Information: (i) pursuant to the order or requirement of a court, administrative agency, or other governmental body; provided that the party required to make such a disclosure gives reasonable notice to the other party (if legally permitted) to allow the other party to contest such order or requirement; (ii) to its legal or financial advisors; (iii) as required under applicable securities regulations; and (iv) subject to customary restrictions, to present or future providers of venture capital and/or potential private investors in or acquirers of such party.</p>

					<h5>REPRESENTATIONS, WARRANTIES, EXCLUSIVE REMEDIES AND DISCLAIMERS</h5>
					<p>7.1 Representations<br />Each party represents that it has validly entered into this Agreement and has the legal power to do so.</p>
					<p>7.2 Disclaimers<br />THE SERVICES ARE PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE,&rdquo; WITHOUT WARRANTY OF ANY KIND. WITHOUT LIMITING THE FOREGOING, Design Engine EXPRESSLY DISCLAIMS ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT, AND ANY WARRANTIES ARISING OUT OF COURSE OF DEALING OR USAGE OF TRADE. NO ADVICE OR INFORMATION, WHETHER ORAL OR WRITTEN, OBTAINED FROM Design Engine OR ELSEWHERE WILL CREATE ANY WARRANTY NOT EXPRESSLY STATED IN THIS AGREEMENT.</p>
					<p>Without limiting the foregoing, we make no warranty that the Services will meet your requirements, provide specific results or be available on an uninterrupted, secure, or error-free basis. You acknowledge that the provision of the Services depends on necessary hardware, software, networks, storage, and other products and services provided by third parties which are not controlled by Design Engine, and that we will not be liable for any unavailability of the Services that is due to the outage or failure to perform of any such third party products or services. You assume sole responsibility and liability for any output or results obtained from the use of the Services and for conclusions drawn from such use. We will have no liability for any claims, losses or damage caused by arising out of or in connection with any Data or any other information provided to Design Engine by you in connection with the Services or any actions taken by Design Engine at your direction.</p>

					<h5>INDEMNIFICATION</h5>
					<p>You will indemnify, defend and hold Design Engine and its officers, directors, employees, contractors, representatives and agents, harmless from and against any claims, disputes, demands, liabilities, damages, losses, and costs and expenses, including, without limitation, reasonable legal and other professional fees arising out of or in any way connected with (i) your access to or use of the Services, or (ii) the Data, including but not limited to, the transmission and submission of the Data to the Services, and infringement or misappropriation of any third party proprietary rights by the Data, provided that we: (a) promptly notify you in writing of the claim; (b) grant you sole control of the defense and settlement of the claim; and (c) provide you, at your expense, with all assistance, information and authority reasonably required for the defense and settlement of the claim.</p>

					<h5>LIMITATION OF LIABILITY</h5>
					<p>Design Engine's TOTAL LIABILITY TO YOU AND YOUR AUTHORIZED USERS FROM ALL CAUSES OF ACTION AND UNDER ALL THEORIES OF LIABILITY UNDER THIS AGREEMENT WILL BE LIMITED TO THE AMOUNTS PAID TO Design Engine BY YOU FOR THE SERVICES DURING THE SIX (6)-MONTH PERIOD IMMEDIATELY PRECEDING THE EVENTS GIVING RISE TO THE LIABILITY. WE WILL NOT BE LIABLE TO YOU OR YOUR AUTHORIZED USERS FOR ANY INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, OR FOR COSTS OF SUBSTITUTE GOODS OR SERVICES, OR FOR LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING IN ANY WAY OUT OF THIS AGREEMENT OR RESULTING FROM ACCESS TO, USE OF, OR INABILITY TO ACCESS OR USE THE SERVICES, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE) OR ANY OTHER LEGAL THEORY, WHETHER OR NOT WE HAVE BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGE, AND EVEN IF AN EXCLUSIVE REMEDY SET FORTH HEREIN IS FOUND TO HAVE FAILED OF ITS ESSENTIAL PURPOSE.</p>

					<h5>GENERAL PROVISIONS</h5>
					<p>10.1 Export Control<br />You agree to comply fully with all relevant export laws and regulations of the United States and other applicable jurisdictions to ensure that neither the Services, nor any direct product thereof, are: (i) downloaded or otherwise exported or re-exported directly or indirectly in violation of such export laws and regulations; or (ii) used for any purposes prohibited by the such export laws and regulations, including but not limited to nuclear, chemical, or biological weapons proliferation.</p>
					<p>10.2 U.S. Government End User<br />The Services and its documentation are &ldquo;commercial items&rdquo; as that term is defined in FAR 2.101, consisting of &ldquo;commercial computer software&rdquo; and &ldquo;commercial computer software documentation,&rdquo; respectively, as such terms are used in FAR 12.212, DFARS 227.7202 and other government acquisition regulations, as applicable. If the Services and its documentation are being acquired by or on behalf of the U.S. Government, then, as provided in FAR 12.212 and DFARS 227.7202-1 through 227.7202-4, as applicable, the U.S. Government’s rights in the Services and its documentation will be only those specified in this Agreement.</p>
					<p>10.3 Dispute Resolution<br />This Agreement and any action related thereto will be governed by the laws of the State of Washington without regard to its conflict of laws provisions. You and we irrevocably consent to the jurisdiction of, and venue in, the state or federal courts located in the Western District of the State of Washington for any disputes arising under this Agreement.</p>
					<p>10.4 Publicity<br />You agree that we may identify you as a customer of the Services, and display your name and logo (if any) in connection with such identification, on the Site and in its other published marketing materials. We will use good-faith efforts to comply with any reasonable trademark usage guidelines you provide to Design Engine in connection with your name and logo.</p>
					<p>10.5 Assignment<br />Neither party may assign or transfer any rights or obligations under this Agreement, whether by operation of law or otherwise, without the other party’s prior written consent. Any attempt to assign or transfer this Agreement without such consent will be void. Notwithstanding the foregoing, each party may assign or transfer this Agreement without the other party’s consent to an affiliate or a third party that acquires the assigning party by merger, the sale of the majority of such party’s stock, or the acquisition of all or substantially all of such party’s assets. Subject to the foregoing, this Agreement will bind and inure to the benefit of the parties, their successors and permitted assigns.</p>
					<p>10.6 Notice<br />We may provide any notice to you under this Agreement by: (i) posting a notice on the Site; or (ii) sending a message to the administrative email address(es) then associated with your Account. Notices we provide by posting on the Site will be effective upon posting and notices we provide by email will be effective when we send the email. It is your responsibility to keep your email address(es) current. You will be deemed to have received any email sent to the email address then associated with your account when we send the email, whether or not you actually receive the email. If you have any questions regarding this Agreement please contact us via email at info@DesignEngine.ai.</p>
					<p>10.7 Severability<br />In the event that any provision of this Agreement is held to be invalid or unenforceable, that provision will be enforced to the maximum extent permissible, and the remaining provisions of this Agreement will remain in full force and effect.</p>
					<p>10.8 Waiver<br />A party’s failure to enforce any right or provision of this Agreement will not be considered a waiver of such right or provision. The waiver of any such right or provision will be effective only if in writing and signed by a duly authorized representative of such party.</p>
					<p>10.9 No Election of Remedy<br />Except as expressly set forth in this Agreement, the exercise by the parties of any of their remedies under this Agreement will be without prejudice to their other remedies under this Agreement or otherwise.</p>
					<p>10.10 Force Majeure<br />Neither party will be responsible for any failure or delay in its performance under this Agreement (except for the payment of money) due to causes beyond its reasonable control, including, but not limited to, labor disputes, strikes, lockouts, shortages of or inability to obtain labor, energy, raw materials or supplies, war, acts of terror, riot, acts of God or governmental action.</p>
					<p>10.11 Equitable Relief<br />Each party acknowledges that a breach by the other party of any confidentiality or proprietary rights provision of this Agreement may cause the non-breaching party irreparable damage, for which the award of damages would not be adequate compensation. Consequently, the non-breaching party may seek injunctive relief enjoining any breach or threatened breach of those provisions, in addition to any other relief to which the non-breaching party may be entitled at law or in equity.</p>
					<p>10.12 Entire Agreement<br />This Agreement constitutes the entire agreement between the parties regarding the Services, and it supersedes and replaces any prior agreements and understandings between the parties regarding the Services and it shall take precedence over all terms, conditions, and provisions on any purchase order or other acknowledgment, order release or business form that you may use in connection with the Services.</p>
				</div>
				<BottomNav onPage={(url)=> this.props.onPage(url)} onLogout={()=> this.props.onLogout()} />
			</div>
		);
	}
}

export default TermsPage;

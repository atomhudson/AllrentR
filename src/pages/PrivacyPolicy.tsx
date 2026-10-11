import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Shield, Lock, Eye, Cookie, FileText, Mail } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <SEOHead 
        title="Privacy Policy | AllrentR Secure Rental Platform"
        description="Read our comprehensive Privacy Policy to understand how AllrentR collects, protects, and handles your data, including Google AdSense advertising and cookies."
      />
      <Navbar />

      <main className="container mx-auto px-4 py-24 max-w-4xl flex-grow">
        <div className="mb-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <Shield className="w-3.5 h-3.5" /> Data Security & Compliance
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground mt-2">
            Effective Date: May 03, 2026 | Last Updated: October 2026
          </p>
        </div>

        <div className="prose prose-slate max-w-none text-foreground/80 space-y-8 leading-relaxed">
          <section className="bg-card border border-border p-6 rounded-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> 1. Introduction
            </h2>
            <p>
              Welcome to <strong>AllrentR</strong> (accessible at <a href="https://allrentr.com" className="text-primary hover:underline">https://allrentr.com</a>). 
              AllrentR operates as an online peer-to-peer rental marketplace connecting individuals seeking to rent equipment, gadgets, tools, and lifestyle items with verified local lenders.
            </p>
            <p className="mt-2">
              We respect your privacy and are committed to protecting personally identifiable information you may provide us through our website and services. This Privacy Policy outlines what information may be collected on our site, how we use this information, and under what circumstances we may disclose the information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" /> 2. Information We Collect
            </h2>
            <p>
              When you use AllrentR, we collect several types of information to provide and enhance our marketplace operations:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>
                <strong>Personal Account Details:</strong> Name, verified email address, phone number, location/city, and avatar when you register or sign in using OAuth providers.
              </li>
              <li>
                <strong>Listing Information:</strong> Detailed product descriptions, pricing, specifications, availability schedules, and genuine photographs submitted for item listings.
              </li>
              <li>
                <strong>Communication & Messages:</strong> In-app messages, inquiries, and booking communication exchanged between renters and item owners.
              </li>
              <li>
                <strong>Log & Device Data:</strong> Internet Protocol (IP) addresses, browser type, Internet Service Provider (ISP), date/time stamps, referring/exit pages, and click counts collected automatically through standard server logs.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" /> 3. How We Use Your Information
            </h2>
            <p>The information we collect is utilized strictly for lawful business purposes, including:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Facilitating seamless rental discovery and connections between owners and renters.</li>
              <li>Protecting platform integrity, detecting fraud, and validating genuine community listings.</li>
              <li>Sending transaction notifications, inquiry alerts, security updates, and administrative notices.</li>
              <li>Improving website layout, navigation speed, user experience, and mobile responsiveness.</li>
            </ul>
          </section>

          <section className="bg-primary/5 border border-primary/20 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
              <Cookie className="w-5 h-5 text-primary" /> 4. Google AdSense & Third-Party Cookies
            </h2>
            <p>
              AllrentR partners with third-party advertising networks, primarily <strong>Google AdSense</strong>, to serve advertisements on our web pages.
            </p>
            <div className="space-y-3 mt-3">
              <p>
                <strong>Google DoubleClick Cookies:</strong> Google, as a third-party vendor, uses cookies to serve ads on AllrentR. Google's use of advertising cookies enables it and its partners to serve ads to our users based on their prior visits to AllrentR and other sites on the Internet.
              </p>
              <p>
                <strong>Personalized Advertising Opt-Out:</strong> Users may opt out of personalized advertising by visiting the <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">Google Ad Settings</a> page. Alternatively, you can opt out of third-party vendor cookies for personalized advertising by visiting <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">www.aboutads.info</a> or the <a href="http://www.networkadvertising.org/managing/opt_out.asp" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">Network Advertising Initiative Opt-Out Page</a>.
              </p>
              <p>
                <strong>Third-Party Ad Networks:</strong> Third-party ad servers or ad networks use technologies like cookies, JavaScript, or Web Beacons in their advertisements and links that appear on AllrentR. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of advertising campaigns and personalize the advertising content you see. AllrentR has no direct control over cookies placed by third-party advertisers.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">5. Data Protection & Security</h2>
            <p>
              The security of your Personal Information is critically important to us. AllrentR employs industry-standard SSL/TLS encryption for all data transmitted across the web. Access to user account records is restricted, and we do not sell, rent, or lease personal customer lists or contact info to unaffiliated third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">6. User Privacy Rights (GDPR & CCPA)</h2>
            <p>
              Depending on your location, you hold statutory rights regarding your personal data:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>Right to Access:</strong> You can request a copy of the personal data we hold about you.</li>
              <li><strong>Right to Rectification:</strong> You can request that inaccurate or incomplete information be corrected.</li>
              <li><strong>Right to Erasure:</strong> You can request the deletion of your account and associated listing data.</li>
              <li><strong>Right to Withdraw Consent:</strong> You have the right to withdraw data processing consent at any time.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these privacy rights, please submit a request to our data protection contact at <a href="mailto:allrentr15@gmail.com" className="text-primary font-medium hover:underline">allrentr15@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">7. Children's Privacy</h2>
            <p>
              AllrentR does not knowingly collect or solicit personal identifiable information from anyone under the age of 18. If you are under 18, please do not attempt to register for our platform or send any personal details to us.
            </p>
          </section>

          <section className="bg-card border border-border p-6 rounded-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" /> 8. Contact Information
            </h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data handling practices, please contact us:
            </p>
            <div className="mt-3 space-y-1 text-sm font-medium">
              <p>• <strong>Entity:</strong> AllrentR Platform Team</p>
              <p>• <strong>Email:</strong> <a href="mailto:allrentr15@gmail.com" className="text-primary hover:underline">allrentr15@gmail.com</a></p>
              <p>• <strong>Phone:</strong> +91 79067 44723</p>
              <p>• <strong>Website:</strong> <a href="https://allrentr.com" className="text-primary hover:underline">https://allrentr.com</a></p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;

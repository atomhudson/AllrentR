import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Privacy Policy | Your Data Security Matters"
        description="Read our Privacy Policy to understand how AllRentR collects, uses, and protects your personal information and interaction with our rental platform."
      />
      <Navbar />
      <div className="container mx-auto px-4 py-24 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-foreground">Privacy Policy</h1>
        <div className="prose prose-slate max-w-none text-foreground/80 space-y-6">
          <p>Last updated: May 03, 2026</p>
          
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
            <p>
              Welcome to AllRentR ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website allrentr.com.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
            <p>
              We collect personal information that you voluntarily provide to us when you register on the Website, express an interest in obtaining information about us or our products and services, or otherwise when you contact us.
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>Personal Data:</strong> Name, email address, phone number, and location.</li>
              <li><strong>Listing Data:</strong> Information about the items you list for rent, including descriptions and photos.</li>
              <li><strong>Usage Data:</strong> IP address, browser type, and interaction with our services.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Facilitate account creation and logon process.</li>
              <li>Connect renters with item owners.</li>
              <li>Send administrative information and marketing communications.</li>
              <li>Protect our services and users from fraud or harm.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Google AdSense</h2>
            <p>
              We use Google AdSense to serve advertisements on our website. Google, as a third-party vendor, uses cookies to serve ads based on a user's prior visits to our website or other websites. Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet.
            </p>
            <p className="mt-2">
              Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" className="text-primary hover:underline">Google Ad Settings</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Third-Party Sharing</h2>
            <p>
              We do not sell your personal data. We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Contact Us</h2>
            <p>
              If you have questions or comments about this policy, you may email us at <strong>allrentr15@gmail.com</strong>.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;

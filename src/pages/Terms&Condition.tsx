import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Scale, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";

const TermsAndConditionPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <SEOHead 
        title="Terms & Conditions | AllrentR Rental Marketplace"
        description="Review the terms and conditions, rental agreement guidelines, and community safety policies for AllrentR."
      />
      <Navbar />

      <main className="container mx-auto px-4 py-24 max-w-4xl flex-grow">
        <div className="mb-10 text-center md:text-left">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-4">
              ← Back to Home
            </Button>
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <Scale className="w-3.5 h-3.5" /> Legal Agreement
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-muted-foreground mt-2">
            Effective Date: May 03, 2026 | Last Updated: October 2026
          </p>
        </div>

        <div className="prose prose-slate max-w-none text-foreground/80 space-y-8 leading-relaxed">
          {/* Section 1 */}
          <section className="bg-card border border-border p-6 rounded-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" /> 1. Acceptance of Terms & Eligibility
            </h2>
            <p>
              By accessing, browsing, or registering on <strong>AllrentR</strong> (<a href="https://allrentr.com" className="text-primary hover:underline">https://allrentr.com</a>), you signify that you have read, understood, and agreed to be bound by these Terms and Conditions. If you do not agree, you must immediately cease using the platform.
            </p>
            <p className="mt-2">
              You must be at least 18 years of age or possess legal capacity under your local jurisdiction to create an account, list an item for rent, or enter into a rental transaction.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-primary/5 border border-primary/20 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" /> 2. Platform Role & Marketplace Facilitation
            </h2>
            <p>
              <strong>AllrentR is a peer-to-peer (P2P) discovery and connection platform.</strong> We empower equipment owners ("Lenders" or "Owners") to connect directly with individuals seeking temporary access to equipment ("Renters").
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>AllrentR is not an equipment broker, manufacturer, retailer, or insurer.</li>
              <li>Except where expressly specified, AllrentR does not own, store, inspect, or manage items listed by community members.</li>
              <li>Transactions, physical exchanges, condition verification, and item returns take place directly between Owners and Renters.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">3. Listing Guidelines for Owners / Lenders</h2>
            <p>Community members listing items on AllrentR agree to uphold the following standards:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>Accurate Representation:</strong> All descriptions, specifications, included accessories, and photographs must accurately portray the current physical and functional condition of the item.</li>
              <li><strong>Legitimate Ownership:</strong> You warrant that you legally own the item or have explicit written authority to rent it out. Stolen, encumbered, or counterfeit items are strictly prohibited.</li>
              <li><strong>Safe Working Order:</strong> All mechanical, electrical, and electronic tools or gear must be safe to operate and comply with relevant safety regulations.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">4. Rental Guidelines for Renters</h2>
            <p>Renters borrowing gear through the AllrentR platform agree to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>Pre-Handover Inspection:</strong> Inspect all equipment upon receiving it, test critical functions, and record timestamped photos or video of any pre-existing cosmetic or functional flaws.</li>
              <li><strong>Lawful & Proper Use:</strong> Use the rented items exclusively for their intended, lawful purposes in accordance with manufacturer operating instructions.</li>
              <li><strong>Punctual Return:</strong> Return the rented equipment at the agreed-upon time and location in the exact condition received, normal wear and tear excepted.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="bg-destructive/5 border border-destructive/20 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" /> 5. Damage, Loss & Dispute Resolution
            </h2>
            <p>
              The Renter is strictly liable for damage, destruction, loss, or theft of rented equipment occurring during their rental window.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Owners and Renters are encouraged to agree upon mutually acceptable security deposits or handover checks prior to releasing valuable items.</li>
              <li>In the event of physical damage or failure to return, the Renter agrees to reimburse the Owner for fair repair costs or fair-market replacement value.</li>
              <li>AllrentR facilitates communication and user verification but does not assume direct financial liability for lost or damaged personal property.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">6. Prohibited Items & Conduct</h2>
            <p>The following items may not be listed or requested on AllrentR under any circumstances:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Firearms, weapons, explosives, or ammunition.</li>
              <li>Hazardous chemicals, toxic waste, or controlled pharmaceutical substances.</li>
              <li>Counterfeit goods, pirated intellectual property, or stolen merchandise.</li>
              <li>Adult services, abusive media, or items intended for unlawful acts.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">7. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable law, AllrentR, its founders, and affiliates will not be liable for any indirect, incidental, punitive, or consequential damages resulting from equipment breakdown, personal injury, project delays, or disputes arising between platform users.
            </p>
          </section>

          {/* Section 8 */}
          <section className="bg-card border border-border p-6 rounded-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" /> 8. Inquiries & Support
            </h2>
            <p>
              If you have any questions regarding these Terms & Conditions or wish to report a community policy violation, please reach out to:
            </p>
            <div className="mt-3 space-y-1 text-sm font-medium">
              <p>• <strong>Legal Support:</strong> <a href="mailto:allrentr15@gmail.com" className="text-primary hover:underline">allrentr15@gmail.com</a></p>
              <p>• <strong>Telephone:</strong> +91 79067 44723</p>
              <p>• <strong>Official Address:</strong> AllrentR Operations, India</p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsAndConditionPage;

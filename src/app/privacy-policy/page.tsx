import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Vortix Tech collects, uses, and protects your personal information. Read our full privacy policy.",
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy | Vortix Tech",
    description: "Learn how Vortix Tech collects, uses, and protects your personal information. Read our full privacy policy.",
    url: "https://vortixtech.com/privacy-policy",
  }
};

export default function PrivacyPolicyPage() {
  return (
    <div className="pt-20">
      <section className="relative overflow-hidden bg-background py-24 sm:py-32">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 sm:px-8">
          <span className="text-accent text-sm font-bold uppercase tracking-widest">
            Legal
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 mt-4 mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-500 text-sm mb-12">
            Last updated: August 2026
          </p>

          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-8">
            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                1. Introduction
              </h2>
              <p>
                Vortix Tech (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or
                &ldquo;us&rdquo;) is committed to protecting your privacy. This
                Privacy Policy explains how we collect, use, disclose, and
                safeguard your information when you visit our website
                vortixtech.com (the &ldquo;Site&rdquo;) and use our services.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                2. Information We Collect
              </h2>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Personal Information
              </h3>
              <p className="mb-4">
                When you use our contact form, we collect your name, email
                address, subject, and message content. This information is
                provided voluntarily and is used solely to respond to your
                inquiry.
              </p>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Automatically Collected Information
              </h3>
              <p className="mb-4">
                When you visit our Site, we may automatically collect certain
                information about your device, including your IP address, browser
                type, operating system, referring URLs, and browsing behavior.
                This data is collected only when you consent to analytics cookies
                via our cookie consent banner.
              </p>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Cookies
              </h3>
              <p>
                We use cookies and similar tracking technologies to enhance your
                browsing experience. Our cookie consent banner allows you to
                control which cookies are active:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>
                  <strong>Essential cookies:</strong> Required for the website to
                  function (always active).
                </li>
                <li>
                  <strong>Analytics cookies:</strong> Help us understand how
                  visitors interact with our site (optional).
                </li>
                <li>
                  <strong>Marketing cookies:</strong> Used for targeted content
                  and advertising (optional).
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                3. How We Use Your Information
              </h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Respond to your inquiries and provide requested services</li>
                <li>Improve our website and user experience</li>
                <li>
                  Analyze usage patterns to optimize site performance and content
                </li>
                <li>Send relevant communications (only if you opt in)</li>
                <li>Protect against fraud and ensure site security</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                4. Third-Party Services
              </h2>
              <p>Our Site may use the following third-party services:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>
                  <strong>Google Gemini AI:</strong> Powers our AI chat widget.
                  Chat messages are processed by Google&apos;s AI to provide
                  helpful responses.
                </li>
                <li>
                  <strong>Microsoft Clarity:</strong> Provides analytics,
                  heatmaps, and session recordings to help us understand how
                  visitors use our site.
                </li>
                <li>
                  <strong>Vercel:</strong> Hosts our website and processes web
                  requests.
                </li>
              </ul>
              <p className="mt-4">
                Each third-party service has its own privacy policy governing its
                use of your data.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                5. Data Retention
              </h2>
              <p>
                We retain your personal information only for as long as necessary
                to fulfill the purposes outlined in this policy. Contact form
                submissions are retained for up to 12 months unless you request
                earlier deletion.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                6. Data Security
              </h2>
              <p>
                We implement appropriate technical and organizational security
                measures to protect your personal data against unauthorized
                access, alteration, disclosure, or destruction. However, no
                method of transmission over the internet is 100% secure.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                7. Your Rights
              </h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>
                  Access the personal data we hold about you
                </li>
                <li>
                  Request correction of inaccurate data
                </li>
                <li>
                  Request deletion of your personal data
                </li>
                <li>
                  Withdraw consent for data processing at any time
                </li>
                <li>
                  Object to processing of your personal data
                </li>
                <li>
                  Request data portability
                </li>
              </ul>
              <p className="mt-4">
                To exercise any of these rights, please contact us at{" "}
                <a
                  href="mailto:techvortix@gmail.com"
                  className="text-accent hover:underline"
                >
                  techvortix@gmail.com
                </a>
                .
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                8. Children&apos;s Privacy
              </h2>
              <p>
                Our Site is not intended for children under the age of 13. We do
                not knowingly collect personal information from children. If you
                are a parent or guardian and believe your child has provided us
                with personal data, please contact us to have it removed.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                9. Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. We will
                notify you of any material changes by posting the new policy on
                this page with an updated &ldquo;Last updated&rdquo; date. Your
                continued use of the Site after any changes constitutes
                acceptance of the updated policy.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                10. Contact Us
              </h2>
              <p>
                If you have any questions about this Privacy Policy, please
                contact us:
              </p>
              <ul className="list-none mt-4 space-y-2">
                <li>
                  <strong>Email:</strong>{" "}
                  <a
                    href="mailto:techvortix@gmail.com"
                    className="text-accent hover:underline"
                  >
                    techvortix@gmail.com
                  </a>
                </li>
                <li>
                  <strong>Website:</strong>{" "}
                  <a
                    href="https://vortixtech.com"
                    className="text-accent hover:underline"
                  >
                    vortixtech.com
                  </a>
                </li>
                <li>
                  <strong>Phone:</strong>{" "}
                  <a
                    href="tel:+923351283034"
                    className="text-accent hover:underline"
                  >
                    +92 335 1283034
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

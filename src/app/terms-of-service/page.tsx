import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the terms and conditions governing your use of Vortix Tech services and website.",
  alternates: {
    canonical: "/terms-of-service",
  },
  openGraph: {
    title: "Terms of Service | Vortix Tech",
    description: "Read the terms and conditions governing your use of Vortix Tech services and website.",
    url: "https://vortixtech.com/terms-of-service",
  }
};

export default function TermsOfServicePage() {
  return (
    <div className="pt-20">
      <section className="relative overflow-hidden bg-background py-24 sm:py-32">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 sm:px-8">
          <span className="text-accent text-sm font-bold uppercase tracking-widest">
            Legal
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 mt-4 mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-500 text-sm mb-12">
            Last updated: August 2026
          </p>

          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-8">
            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using the Vortix Tech website
                (vortixtech.com) and services, you agree to be bound by these
                Terms of Service. If you do not agree to these terms, please do
                not use our Site or services.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                2. Services
              </h2>
              <p>
                Vortix Tech provides software development, web and mobile
                application development, AI integration, automation workflows,
                and related technology consulting services. The specific scope,
                deliverables, timeline, and pricing for each project will be
                agreed upon in a separate project proposal or contract.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                3. Project Agreements
              </h2>
              <p>
                Each project engagement will be governed by a separate written
                agreement (a &ldquo;Project Agreement&rdquo;) that outlines:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Project scope and deliverables</li>
                <li>Timeline and milestones</li>
                <li>Payment terms and schedule</li>
                <li>Revision and change request policies</li>
                <li>Communication and reporting protocols</li>
              </ul>
              <p className="mt-4">
                In the event of any conflict between these Terms of Service and
                a specific Project Agreement, the Project Agreement will
                prevail.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                4. Payment Terms
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Payment terms are specified in each Project Agreement. Typical
                  structures include milestone-based payments or hourly billing.
                </li>
                <li>
                  Invoices are due within 14 days of issuance unless otherwise
                  agreed in writing.
                </li>
                <li>
                  Late payments may incur a fee of 1.5% per month on the
                  outstanding balance.
                </li>
                <li>
                  All prices are in USD unless otherwise specified.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                5. Intellectual Property
              </h2>
              <p className="mb-4">
                <strong>Client Ownership:</strong> Upon full payment, the client
                receives full ownership of all custom code, designs, and
                deliverables created specifically for their project, unless
                otherwise stated in the Project Agreement.
              </p>
              <p className="mb-4">
                <strong>Vortix Tech Tools:</strong> We retain ownership of
                proprietary tools, frameworks, libraries, and pre-existing code
                that we use across multiple projects. Clients receive a
                perpetual, non-exclusive license to use these components within
                their project.
              </p>
              <p>
                <strong>Portfolio Rights:</strong> Unless specifically restricted
                in the Project Agreement, Vortix Tech reserves the right to
                showcase completed work in our portfolio and marketing materials.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                6. Confidentiality
              </h2>
              <p>
                Both parties agree to keep confidential any proprietary
                information shared during the course of a project. This includes
                business plans, technical specifications, customer data, and
                trade secrets. This obligation survives the termination of any
                agreement for a period of 2 years.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                7. Warranties and Disclaimers
              </h2>
              <p className="mb-4">
                We warrant that our services will be performed in a professional
                and workmanlike manner consistent with industry standards.
              </p>
              <p className="mb-4">
                <strong>Disclaimer:</strong> Except as expressly stated above,
                our services and website are provided &ldquo;as is&rdquo; and
                &ldquo;as available&rdquo; without warranties of any kind,
                either express or implied, including but not limited to implied
                warranties of merchantability, fitness for a particular purpose,
                or non-infringement.
              </p>
              <p>
                We do not guarantee that the website will be uninterrupted,
                error-free, or completely secure.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                8. Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by law, Vortix Tech shall not
                be liable for any indirect, incidental, special, consequential,
                or punitive damages arising out of or relating to our services
                or these terms, regardless of the cause of action. Our total
                liability shall not exceed the total amount paid by the client
                for the specific project giving rise to the claim.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                9. Termination
              </h2>
              <p className="mb-4">
                Either party may terminate a Project Agreement with 14 days
                written notice. Upon termination:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  The client will pay for all work completed up to the
                  termination date.
                </li>
                <li>
                  Vortix Tech will deliver all completed work and materials.
                </li>
                <li>
                  Any deposits or prepayments for unperformed work will be
                  refunded on a pro-rata basis.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                10. Website Use
              </h2>
              <p>When using our website, you agree not to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>
                  Use the Site for any unlawful purpose or in violation of any
                  applicable laws
                </li>
                <li>
                  Attempt to gain unauthorized access to any part of the Site
                </li>
                <li>
                  Interfere with or disrupt the Site or its infrastructure
                </li>
                <li>
                  Scrape, mine, or otherwise collect data from the Site without
                  permission
                </li>
                <li>
                  Misuse the AI chat feature by submitting harmful,
                  inappropriate, or misleading queries
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                11. Dispute Resolution
              </h2>
              <p>
                Any disputes arising from these Terms or our services will first
                be addressed through good-faith negotiation between the parties.
                If a resolution cannot be reached within 30 days, either party
                may pursue mediation or arbitration in accordance with the laws
                of Pakistan. The language of proceedings shall be English.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                12. Changes to These Terms
              </h2>
              <p>
                We reserve the right to update these Terms of Service at any
                time. Changes will be posted on this page with an updated
                &ldquo;Last updated&rdquo; date. Your continued use of the Site
                or services after changes are posted constitutes acceptance of
                the revised terms.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                13. Contact Us
              </h2>
              <p>
                If you have questions about these Terms of Service, please
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

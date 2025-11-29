export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>

                <div className="prose prose-lg max-w-none">
                    <p className="text-gray-600 mb-6">
                        <strong>Last Updated:</strong> November 29, 2025
                    </p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                        <p className="text-gray-700">
                            By accessing and using LUMIVST, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Use of Service</h2>
                        <p className="text-gray-700 mb-4">
                            You agree to use LUMIVST only for lawful purposes and in accordance with these Terms. You agree not to:
                        </p>
                        <ul className="list-disc pl-6 text-gray-700 space-y-2">
                            <li>Use the service in any way that violates any applicable law or regulation</li>
                            <li>Engage in any conduct that restricts or inhibits anyone's use of the service</li>
                            <li>Attempt to gain unauthorized access to any portion of the service</li>
                            <li>Use any automated system to access the service</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
                        <p className="text-gray-700 mb-4">
                            When you create an account with us, you must provide accurate and complete information. You are responsible for:
                        </p>
                        <ul className="list-disc pl-6 text-gray-700 space-y-2">
                            <li>Maintaining the security of your account</li>
                            <li>All activities that occur under your account</li>
                            <li>Notifying us immediately of any unauthorized use</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Investment Information Disclaimer</h2>
                        <p className="text-gray-700">
                            The information provided on LUMIVST is for informational purposes only and should not be considered as financial advice. We are not responsible for any investment decisions made based on information from our platform.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Intellectual Property</h2>
                        <p className="text-gray-700">
                            The service and its original content, features, and functionality are owned by LUMIVST and are protected by international copyright, trademark, and other intellectual property laws.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Termination</h2>
                        <p className="text-gray-700">
                            We may terminate or suspend your account immediately, without prior notice, for any reason, including if you breach these Terms.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
                        <p className="text-gray-700">
                            In no event shall LUMIVST be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Changes to Terms</h2>
                        <p className="text-gray-700">
                            We reserve the right to modify these terms at any time. We will notify users of any changes by updating the "Last Updated" date.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Us</h2>
                        <p className="text-gray-700">
                            If you have any questions about these Terms, please contact us at{' '}
                            <a href="mailto:legal@lumivst.com" className="text-blue-600 hover:underline">
                                legal@lumivst.com
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

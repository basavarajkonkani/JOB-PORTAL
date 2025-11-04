import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export default function EmployersPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <Navbar />

            <main>
                {/* Hero Section */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center mb-16">
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                            Hire Smarter with
                            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                AI-Powered Recruitment
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                            Transform your hiring process with intelligent candidate matching, automated
                            screening, and powerful analytics. Find the right talent faster.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/signup?type=employer"
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1 text-lg"
                            >
                                Start Free Trial
                            </Link>
                            <Link
                                href="/jobs"
                                className="bg-white text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-50 font-semibold shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 text-lg border border-gray-200"
                            >
                                Browse Talent
                            </Link>
                        </div>
                    </div>

                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
                            <svg
                                className="w-10 h-10 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Employer Features Coming Soon</h2>
                        <p className="text-gray-600 max-w-md mx-auto">
                            We&apos;re building powerful recruitment tools for employers. Contact us to learn
                            more!
                        </p>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                        <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Hiring?</h2>
                        <p className="text-xl mb-8 text-blue-100">
                            Join thousands of companies using AI to build better teams
                        </p>
                        <Link
                            href="/signup?type=employer"
                            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-gray-100 font-semibold shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1 text-lg"
                        >
                            Start Your Free Trial
                        </Link>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}

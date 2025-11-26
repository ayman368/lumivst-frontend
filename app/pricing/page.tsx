'use client';

import { Check } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
    const plans = [
        {
            name: 'Basic',
            price: 'Free',
            description: 'Essential tools for beginners',
            features: [
                'Real-time market data',
                'Basic stock screener',
                'Daily news updates',
                'Portfolio tracking (up to 3)',
            ],
            cta: 'Get Started',
            popular: false,
        },
        {
            name: 'Pro',
            price: '$29',
            period: '/month',
            description: 'Advanced analysis for serious traders',
            features: [
                'Everything in Basic',
                'Advanced technical indicators',
                'Unlimited portfolio tracking',
                'Real-time alerts',
                'AI-powered insights',
            ],
            cta: 'Start Free Trial',
            popular: true,
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            description: 'Tailored solutions for institutions',
            features: [
                'Everything in Pro',
                'API access',
                'Dedicated support',
                'Custom reports',
                'Team collaboration',
            ],
            cta: 'Contact Sales',
            popular: false,
        },
    ];

    return (
        <main className="pt-20 pb-20 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-xl text-slate-600">
                        Choose the plan that fits your trading needs
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative p-8 bg-white rounded-2xl border ${plan.popular
                                    ? 'border-blue-500 shadow-xl scale-105 z-10'
                                    : 'border-slate-200 hover:border-blue-300 hover:shadow-lg'
                                } transition-all duration-300`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                                    Most Popular
                                </div>
                            )}

                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                                <p className="text-slate-500 mb-6">{plan.description}</p>
                                <div className="flex justify-center items-baseline gap-1">
                                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                                    {plan.period && <span className="text-slate-500">{plan.period}</span>}
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-slate-600">
                                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/register"
                                className={`block w-full py-3 px-6 rounded-lg text-center font-semibold transition-colors ${plan.popular
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                                    }`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}

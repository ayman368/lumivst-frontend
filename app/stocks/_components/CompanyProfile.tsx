'use client';

interface CompanyProfileProps {
    profile: {
        description: string;
        sector: string;
        industry: string;
        employees: string;
        founded: string;
        address: string;
        phone: string;
        website: string;
    };
    symbol: string;
    name: string;
}

export function CompanyProfile({ profile, symbol, name }: CompanyProfileProps) {
    if (!profile) return null;

    return (
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-medium text-gray-700">Company Profile</h3>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-xl text-gray-900">{symbol}</span>
                </div>
            </div>

            <p className="text-sm text-gray-800 leading-relaxed mb-8 border-b border-gray-100 pb-8">
                {profile.description} <a href="#" className="text-blue-600 hover:underline">More...</a>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 text-sm">

                {/* Left Col */}
                <div className="space-y-4">
                    <div className="flex justify-between border-b border-gray-50 pb-2">
                        <span className="font-bold text-gray-800 text-xs uppercase">Sector</span>
                        <span className="text-blue-600 font-medium hover:underline cursor-pointer">{profile.sector}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-2">
                        <span className="font-bold text-gray-800 text-xs uppercase">Industry</span>
                        <span className="text-blue-600 font-medium hover:underline cursor-pointer">{profile.industry}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-2">
                        <span className="font-bold text-gray-800 text-xs uppercase">Employees</span>
                        <span className="text-gray-900 font-medium">{profile.employees}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-2">
                        <span className="font-bold text-gray-800 text-xs uppercase">Founded</span>
                        <span className="text-gray-900 font-medium">{profile.founded}</span>
                    </div>
                </div>

                {/* Right Col */}
                <div className="space-y-4 text-right md:text-left">
                    <div className="flex flex-col md:flex-row justify-between border-b border-gray-50 pb-2">
                        <span className="font-bold text-gray-800 text-xs uppercase">Address</span>
                        <span className="text-gray-600 font-medium text-right max-w-[200px]">{profile.address}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-2">
                        <span className="font-bold text-gray-800 text-xs uppercase">Phone Number</span>
                        <span className="text-gray-900 font-medium">{profile.phone}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-2">
                        <span className="font-bold text-gray-800 text-xs uppercase">Website</span>
                        <a href={`https://${profile.website}`} target="_blank" className="text-blue-600 font-medium hover:underline">{profile.website}</a>
                    </div>
                </div>
            </div>
        </div>
    )
}

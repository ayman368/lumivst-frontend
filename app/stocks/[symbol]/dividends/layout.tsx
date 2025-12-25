import { DividendSubTabs } from "../../_components/DividendSubTabs";

export default function DividendsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white min-h-screen pb-10">
            <div className="container mx-auto px-4 lg:px-6 py-4">

                <DividendSubTabs />

                {children}
            </div>
        </div>
    );
}

"use client";

import React from 'react';
import { ScreenerHeader } from './_components/ScreenerHeader';
import { FiltersPanel } from './_components/FiltersPanel';
import { ScreenerTable } from './_components/ScreenerTable';
import { useScreener } from '@/lib/hooks/useScreener';

export default function ScreenerPage() {
    const {
        data,
        loading,
        searchQuery,
        setSearchQuery,
        filters,
        updateFilter,
        sortConfig,
        handleSort
    } = useScreener();

    return (
        <div className="flex flex-col h-screen w-full overflow-hidden bg-white dark:bg-[#131722] text-[#131722] dark:text-[#d1d4dc]">
            {/* 
          As requested: Filters & Search Panel *before* the Header
      */}
            {/* <FiltersPanel
                filters={filters}
                onFilterChange={updateFilter}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            <ScreenerHeader /> */}

            <main className="flex-1 flex flex-col min-h-0 relative">
                <ScreenerTable
                    data={data}
                    loading={loading}
                    sortConfig={sortConfig}
                    onSort={(key) => handleSort(key as any)}
                    count={data.length}
                    onRefresh={() => window.location.reload()}
                />
            </main>
        </div>
    );
}

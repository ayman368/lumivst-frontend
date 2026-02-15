import React from 'react';

type ColumnDef = { key: string; label: string; visibleKey: string };

export default function ColumnSelector({
    show,
    columnDefinitions,
    visibleColumns,
    toggleColumn,
    setVisibleColumns,
    onClose
}: {
    show: boolean;
    columnDefinitions: ColumnDef[];
    visibleColumns: Record<string, boolean>;
    toggleColumn: (key: string) => void;
    setVisibleColumns: (v: Record<string, boolean>) => void;
    onClose: () => void;
}) {
    if (!show) return null;

    return (
        <div
            className="fixed bg-white rounded-md shadow-lg z-[100] border border-gray-200"
            style={{ top: '60px', left: '16px', width: '280px', maxHeight: '70vh', overflowY: 'auto' }}
        >
            <div className="p-3">
                <div className="text-xs font-semibold text-gray-500 mb-2">SELECT COLUMNS</div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {columnDefinitions.map((col) => (
                        <label key={col.key} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                            <input
                                type="checkbox"
                                checked={visibleColumns[col.visibleKey] || false}
                                onChange={() => toggleColumn(col.visibleKey)}
                                className="rounded text-blue-600 border-gray-300"
                            />
                            <span className="text-sm text-gray-700">{col.label}</span>
                        </label>
                    ))}
                </div>
                <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-200">
                    <button
                        onClick={() => {
                            const allVisible: Record<string, boolean> = {};
                            columnDefinitions.forEach(col => { allVisible[col.visibleKey] = true; });
                            setVisibleColumns(allVisible);
                            localStorage.setItem('stocksVisibleColumns', JSON.stringify(allVisible));
                            onClose();
                        }}
                        className="flex-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                    >
                        Show All
                    </button>
                    <button
                        onClick={() => {
                            const defaultVisible: Record<string, boolean> = {};
                            columnDefinitions.forEach((col, index) => { defaultVisible[col.visibleKey] = index < 15; });
                            setVisibleColumns(defaultVisible);
                            localStorage.setItem('stocksVisibleColumns', JSON.stringify(defaultVisible));
                            onClose();
                        }}
                        className="flex-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
}

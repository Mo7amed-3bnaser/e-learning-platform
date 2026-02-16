'use client';

import { ReactNode } from 'react';

interface Column {
    key: string;
    label: string;
    hideOnMobile?: boolean;
    hideOnTablet?: boolean;
    render?: (value: any, row: any) => ReactNode;
}

interface ResponsiveTableProps {
    columns: Column[];
    data: any[];
    keyField: string;
    mobileCardRender?: (row: any, index: number) => ReactNode;
}

export default function ResponsiveTable({
    columns,
    data,
    keyField,
    mobileCardRender,
}: ResponsiveTableProps) {
    return (
        <>
            {/* Desktop/Tablet Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="admin-table">
                    <thead>
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`
                    ${column.hideOnTablet ? 'hidden lg:table-cell' : ''}
                  `}
                                >
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => (
                            <tr key={row[keyField] || index}>
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className={`
                      ${column.hideOnTablet ? 'hidden lg:table-cell' : ''}
                    `}
                                    >
                                        {column.render
                                            ? column.render(row[column.key], row)
                                            : row[column.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {data.map((row, index) =>
                    mobileCardRender ? (
                        <div key={row[keyField] || index}>
                            {mobileCardRender(row, index)}
                        </div>
                    ) : (
                        <div
                            key={row[keyField] || index}
                            className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
                        >
                            {columns
                                .filter((col) => !col.hideOnMobile)
                                .map((column) => (
                                    <div key={column.key} className="mb-3 last:mb-0">
                                        <div className="text-xs text-gray-500 mb-1 font-medium">
                                            {column.label}
                                        </div>
                                        <div className="text-sm text-gray-900">
                                            {column.render
                                                ? column.render(row[column.key], row)
                                                : row[column.key]}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )
                )}
            </div>
        </>
    );
}

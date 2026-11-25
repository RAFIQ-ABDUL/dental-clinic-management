export default function DataTable({ columns, data, keyExtractor, renderActions }) {
    return (
        <div className="table-wrapper">
            <table className="data-table">
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key}>{col.header}</th>
                        ))}
                        {renderActions && <th className="actions-col">Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row) => (
                        <tr key={keyExtractor(row)}>
                            {columns.map((col) => (
                                <td key={col.key} data-label={col.header}>
                                    {col.render ? col.render(row) : row[col.key]}
                                </td>
                            ))}
                            {renderActions && (
                                <td className="actions-cell" data-label="Actions">
                                    {renderActions(row)}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
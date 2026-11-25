export default function EmptyState({ icon = '📋', title, description, action }) {
    return (
        <div className="empty-state">
            <div className="empty-state-icon" aria-hidden="true">{icon}</div>
            <h4>{title}</h4>
            {description && <p>{description}</p>}
            {action && <div className="empty-state-action">{action}</div>}
        </div>
    );
}
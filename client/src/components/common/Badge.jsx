const STATUS_VARIANTS = {
    confirmed: 'info',
    pending: 'warning',
    completed: 'success',
    cancelled: 'danger',
    active: 'success',
    inactive: 'neutral',
};

export default function Badge({ children, variant }) {
    const resolvedVariant =
        variant || STATUS_VARIANTS[String(children).toLowerCase()] || 'neutral';

    return <span className={`badge badge-${resolvedVariant}`}>{children}</span>;
}
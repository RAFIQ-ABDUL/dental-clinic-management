export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    type = 'button',
    loading = false,
    disabled = false,
    className = '',
    ...props
}) {
    return (
        <button
            type={type}
            disabled={disabled || loading}
            className={`btn btn-${variant} btn-${size} ${className}`.trim()}
            {...props}
        >
            {loading ? 'Please wait...' : children}
        </button>
    );
}
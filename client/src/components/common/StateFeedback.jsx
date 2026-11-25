export function LoadingState({ message = 'Loading data...' }) {
    return (
        <div className="loading-state" role="status">
            <div className="spinner" aria-hidden="true" />
            <span>{message}</span>
        </div>
    );
}

export function Alert({ type = 'info', message, onDismiss }) {
    if (!message) return null;

    return (
        <div className={`alert alert-${type}`} role="alert">
            <span>{message}</span>
            {onDismiss && (
                <button
                    type="button"
                    className="alert-dismiss"
                    onClick={onDismiss}
                    aria-label="Dismiss message"
                >
                    ✕
                </button>
            )}
        </div>
    );
}
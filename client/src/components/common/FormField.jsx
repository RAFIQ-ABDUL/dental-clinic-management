export default function FormField({ label, htmlFor, required = false, error, children }) {
    return (
        <div className="form-field">
            {label && (
                <label htmlFor={htmlFor} className="form-label">
                    {label} {required && <span className="required-mark">*</span>}
                </label>
            )}
            {children}
            {error && <span className="form-error">{error}</span>}
        </div>
    );
}
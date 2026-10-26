const Input = ({ label, error, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="label">{label}</label>}
    <input className={`input ${error ? 'border-danger focus:ring-danger' : ''} ${className}`} {...props} />
    {error && <p className="field-error">{error}</p>}
  </div>
)

export default Input

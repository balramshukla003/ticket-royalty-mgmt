const Textarea = ({ label, error, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="label">{label}</label>}
    <textarea
      rows={4}
      className={`input resize-none ${error ? 'border-danger' : ''} ${className}`}
      {...props}
    />
    {error && <p className="field-error">{error}</p>}
  </div>
)

export default Textarea

const Select = ({ label, error, options = [], className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="label">{label}</label>}
    <select className={`input ${error ? 'border-danger' : ''} ${className}`} {...props}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="field-error">{error}</p>}
  </div>
)

export default Select

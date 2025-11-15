import React from 'react';
interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> { error?: string; label?: string; }
export const TextInput: React.FC<TextInputProps> = ({ error, label, ...rest }) => {
  return (
    <div className="field">
      {label && <label className="field-label">{label}</label>}
      <input {...rest} className={`input ${error? 'input-error':''} ${rest.className||''}`.trim()} />
      {error && <div className="field-error">{error}</div>}
    </div>
  );
};

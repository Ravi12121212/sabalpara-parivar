import React from 'react';

interface PhoneInputProps {
  value: string; // full international value e.g. +919876543210
  onChange: (val: string) => void;
  disabled?: boolean;
  error?: string;
}

// For now we only support India (+91). Easily extend with a select later.
export const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, disabled, error }) => {
  const national = value.replace(/^\+?91/, '');
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Keep + prefix and digits only
      let raw = e.target.value.replace(/[^+\d]/g, '');
      if (!raw.startsWith('+')) raw = '+' + raw; // enforce plus
      // If user started typing digits directly assume +91
      if (raw === '+') raw = '+91';
      if (!raw.startsWith('+91')) raw = '+91' + raw.replace(/^\+/, '');
      // Trim to +91 plus 10 digits
      raw = '+91' + raw.replace(/^\+?91/, '').slice(0, 10);
      onChange(raw);
  };
  return (
    <div className="field">
        <input
          type="tel"
          inputMode="numeric"
          className={`input ${error? 'input-error':''}`}
          placeholder="+91XXXXXXXXXX"
          value={value && value.startsWith('+91') ? value : '+91'}
          onChange={handleChange}
          disabled={disabled}
          aria-label="Phone number"
        />
      {error && <div className="field-error">{error}</div>}
    </div>
  );
};

export default PhoneInput;

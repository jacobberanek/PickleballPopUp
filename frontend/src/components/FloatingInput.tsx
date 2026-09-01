import { useState, InputHTMLAttributes } from 'react';

interface FloatingInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export default function FloatingInput({ label, value, onChange, type = 'text', style, ...rest }: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0 || type === 'date';

  return (
    <div style={{ position: 'relative', marginBottom: 30 }}>
      <label style={{
        position: 'absolute', left: 0, pointerEvents: 'none',
        top: floated ? -16 : 8,
        fontSize: floated ? 11 : 15,
        color: floated ? 'var(--green)' : 'var(--gray-500)',
        fontWeight: floated ? 700 : 400,
        letterSpacing: floated ? 0.4 : 0,
        transition: 'all 0.16s ease',
      }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', border: 'none', borderBottom: `2px solid ${focused ? 'var(--yellow)' : 'var(--gray-300)'}`,
          background: 'transparent', fontSize: 15, padding: '7px 0', outline: 'none',
          fontFamily: 'var(--font-body)', color: 'var(--charcoal)', transition: 'border-color 0.16s ease',
          ...style,
        }}
        {...rest}
      />
    </div>
  );
}
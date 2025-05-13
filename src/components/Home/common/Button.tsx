import React from 'react'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export default function Button({
  children,
  variant = 'primary',
  className = '',
  size = 'md',
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-block font-semibold rounded-md transition-all duration-200 cursor-pointer min-w-[140px] text-center'

  const variantClasses = {
    primary:
      'bg-[#a66e4e] text-white border-2 border-[#a66e4e] hover:bg-[#a66963] hover:scale-[1.03]',
    secondary:
      'bg-[#f2e5d5] text-black border border-[#f2e5d5] hover:bg-[#f2e5d5]',
    outline: 'border border-[#282939] text-[#282939]'
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-7 py-3' // 28px horizontal, 12px vertical padding
  }

  // Text size classes based on button size
  const textClasses = {
    sm: 'text-xs font-semibold',
    md: 'text-sm font-semibold',
    lg: 'text-base font-semibold' // 1rem font size
  }

  const flexClasses = size === 'lg' ? 'flex items-center justify-center' : ''

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${
        sizeClasses[size]
      } ${flexClasses} ${className || ''}`}
      style={{ borderRadius: '6px' }}
      {...props}
    >
      <span className={`font-sans ${textClasses[size]}`}>{children}</span>
    </button>
  )
}

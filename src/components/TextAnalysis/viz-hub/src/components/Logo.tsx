import { ReactElement } from 'react'

interface LogoProps {
  darkMode?: boolean
  size?: 'small' | 'medium' | 'large'
}

export default function Logo({
  darkMode = false,
  size = 'medium'
}: LogoProps): ReactElement {
  // Map size prop to text size classes
  const textSizeClasses = {
    small: {
      desktop: 'text-xl',
      mobile: 'text-lg'
    },
    medium: {
      desktop: 'text-2xl',
      mobile: 'text-xl'
    },
    large: {
      desktop: 'text-4xl',
      mobile: 'text-3xl'
    }
  }

  return (
    <div className="relative">
      {/* Desktop and tablet logo */}
      <div
        className={`hidden sm:block ${textSizeClasses[size].desktop} font-bold tracking-tight`}
        style={{ fontFamily: 'var(--font-titillium-web)' }}
      >
        <span className={darkMode ? 'text-blue-100' : 'text-blue-900'}>
          Clio
        </span>
        <span className={darkMode ? 'text-blue-300' : 'text-blue-700'}>X</span>
      </div>

      {/* Mobile logo */}
      <div
        className={`block sm:hidden ${textSizeClasses[size].mobile} font-bold`}
        style={{ fontFamily: 'var(--font-titillium-web)' }}
      >
        <span className={darkMode ? 'text-blue-100' : 'text-blue-900'}>C</span>
        <span className={darkMode ? 'text-blue-300' : 'text-blue-700'}>X</span>
      </div>
    </div>
  )
}

import { ReactElement } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface LogoProps {
  darkMode?: boolean
  size?: 'small' | 'medium' | 'large'
}

export default function Logo({
  darkMode = false,
  size = 'medium'
}: LogoProps): ReactElement {
  // Map size prop to logo dimensions with smaller sizes for vertical logo
  const dimensions = {
    small: { width: 0, height: 30 },
    medium: { width: 0, height: 36 },
    large: { width: 0, height: 44 }
  }

  const unselectable = 'select-none cursor-pointer'

  // Apply a filter in dark mode to make the logo more visible
  const imageStyle = {
    width: 'auto',
    height: `${dimensions[size].height}px`,
    filter: darkMode ? 'brightness(0) invert(1)' : 'none'
  }

  const mobileImageStyle = {
    width: 'auto',
    height: `${dimensions.small.height}px`,
    filter: darkMode ? 'brightness(0) invert(1)' : 'none'
  }

  return (
    <Link href="/" className="relative">
      {/* Desktop and tablet logo */}
      <div className={`hidden sm:block ${unselectable}`}>
        <Image
          src="/cliox_vertical.svg"
          alt="ClioX Logo"
          width={dimensions[size].width}
          height={dimensions[size].height}
          style={imageStyle}
          className="max-w-full"
          priority
        />
      </div>

      {/* Mobile logo */}
      <div className={`block sm:hidden ${unselectable}`}>
        <Image
          src="/cliox_vertical.svg"
          alt="ClioX Logo"
          width={dimensions.small.width}
          height={dimensions.small.height}
          style={mobileImageStyle}
          className="max-w-full"
          priority
        />
      </div>
    </Link>
  )
}

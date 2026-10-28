import { useState } from 'react'

export const IMAGE_EXTS = ['webp', 'png', 'jpg', 'jpeg']

// Pass a path WITHOUT extension (e.g. "/images/cars/mclaren"). It tries .webp, .png, .jpg, .jpeg in turn.
// A missing file never shows a broken icon.
export default function AssetImage({ base, alt = '', className, onState, eager = false, ...rest }) {
  const [i, setI] = useState(0)
  if (!base || i >= IMAGE_EXTS.length) return null
  return (
    <img
      key={i}
      src={`${base}.${IMAGE_EXTS[i]}`}
      alt={alt}
      className={className}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={() => onState?.('loaded')}
      onError={() => {
        if (i + 1 >= IMAGE_EXTS.length) onState?.('missing')
        setI(i + 1)
      }}
      {...rest}
    />
  )
}
import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'white',
          borderRadius: '6px',
        }}
      >
        {/* Parcego logo representation for favicon */}
        <div
          style={{
            width: '24px',
            height: '16px',
            background: '#0091F5',
            borderRadius: '3px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Logo design elements */}
          <div
            style={{
              width: '6px',
              height: '6px',
              background: 'white',
              borderRadius: '50%',
              position: 'absolute',
              left: '3px',
              top: '3px',
            }}
          />
          <div
            style={{
              width: '4px',
              height: '4px',
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '50%',
              position: 'absolute',
              right: '3px',
              bottom: '3px',
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

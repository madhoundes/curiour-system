import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
  width: 192,
  height: 192,
}
export const contentType = 'image/png'

// Image generation
export default function Icon192() {
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
          borderRadius: '24px',
          padding: '24px',
        }}
      >
        {/* High-resolution Parcego logo */}
        <div
          style={{
            width: '144px',
            height: '96px',
            background: '#0091F5',
            borderRadius: '20px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 145, 245, 0.3)',
          }}
        >
          {/* Primary logo elements */}
          <div
            style={{
              width: '60px',
              height: '60px',
              background: 'white',
              borderRadius: '50%',
              position: 'absolute',
              left: '20px',
              top: '18px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            }}
          />
          <div
            style={{
              width: '40px',
              height: '40px',
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '50%',
              position: 'absolute',
              right: '25px',
              bottom: '25px',
            }}
          />
          {/* Secondary accent elements */}
          <div
            style={{
              width: '25px',
              height: '25px',
              background: 'rgba(255, 255, 255, 0.6)',
              borderRadius: '50%',
              position: 'absolute',
              left: '45px',
              top: '55px',
            }}
          />
          <div
            style={{
              width: '20px',
              height: '20px',
              background: 'rgba(255, 255, 255, 0.4)',
              borderRadius: '50%',
              position: 'absolute',
              right: '45px',
              top: '20px',
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

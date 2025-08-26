import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

// Image generation
export default function AppleIcon() {
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
          borderRadius: '40px',
          padding: '20px',
        }}
      >
        {/* Parcego logo for Apple devices */}
        <div
          style={{
            width: '120px',
            height: '80px',
            background: '#0091F5',
            borderRadius: '16px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Main logo elements */}
          <div
            style={{
              width: '50px',
              height: '50px',
              background: 'white',
              borderRadius: '50%',
              position: 'absolute',
              left: '15px',
              top: '15px',
            }}
          />
          <div
            style={{
              width: '30px',
              height: '30px',
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '50%',
              position: 'absolute',
              right: '20px',
              bottom: '20px',
            }}
          />
          {/* Additional accent elements */}
          <div
            style={{
              width: '15px',
              height: '15px',
              background: 'rgba(255, 255, 255, 0.4)',
              borderRadius: '50%',
              position: 'absolute',
              left: '35px',
              top: '45px',
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

import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = "Tracker-invest — Journal de trading & suivi d'investissement";
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#050508',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(ellipse at 30% 40%, rgba(201,169,98,0.10) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(107,158,143,0.07) 0%, transparent 60%)',
          }}
        />
        <div style={{ color: '#c9a962', fontSize: '16px', letterSpacing: '6px', marginBottom: '28px', textTransform: 'uppercase', display: 'flex' }}>
          TRACKER-INVEST
        </div>
        <div
          style={{
            color: '#e8e6e1',
            fontSize: '62px',
            fontWeight: 700,
            textAlign: 'center',
            lineHeight: 1.15,
            marginBottom: '36px',
            maxWidth: '900px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          Journal de trading & suivi d&apos;investissement
        </div>
        <div style={{ color: '#8a8680', fontSize: '26px', textAlign: 'center', letterSpacing: '1px', display: 'flex' }}>
          Mindset · Trading · Investissement · Portfolio
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '44px',
            color: '#c9a962',
            fontSize: '16px',
            letterSpacing: '3px',
            display: 'flex',
          }}
        >
          tracker-invest.com
        </div>
      </div>
    ),
    { ...size }
  );
}

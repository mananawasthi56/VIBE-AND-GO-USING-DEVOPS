'use client'
export default function GradientTitle({ gradient, children, fontSize = '52px' }) {
  return (
    <h1 style={{
      fontFamily: 'var(--font-clash)',
      fontSize: fontSize,
      fontWeight: '700',
      lineHeight: 1.1,
      margin: '0 0 8px 0',
    }}>
      <span style={{
        background: gradient,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        display: 'inline-block',
        transition: 'all 0.8s ease',
      }}>
        {children}
      </span>
    </h1>
  )
}
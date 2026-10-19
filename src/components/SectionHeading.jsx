export default function SectionHeading({ title }) {
  return (
    <div style={{ marginBottom: '48px' }}>
      <h2 
        className="section-title"
        style={{ 
          fontSize: '2.5rem', 
          paddingBottom: '12px', 
          display: 'inline-block',
          position: 'relative',
          borderBottom: '2px solid var(--border-color)'
        }}
      >
        {title}
        {/* Garis aksen animasi saat hover dikontrol lewat CSS inline ini / atau bisa via index.css */}
        <div style={{
          position: 'absolute',
          bottom: '-2px',
          left: '0',
          height: '2px',
          width: '40px',
          backgroundColor: 'var(--color-orange)',
          transition: 'width 0.3s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.width = '100%'}
        onMouseLeave={(e) => e.currentTarget.style.width = '40px'}
        />
      </h2>
    </div>
  );
}
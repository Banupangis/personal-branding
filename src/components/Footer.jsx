export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer style={{ padding: '40px 0', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <p style={{ margin: 0, fontSize: '0.9rem' }}>
          &copy; {currentYear} Dhanu · Portofolio Pribadi
        </p>
        <a href="#hero" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
          Kembali ke atas ↑
        </a>
      </div>
    </footer>
  );
}
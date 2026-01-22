export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="muted">© Аренда квартир в городе Уфа</div>
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <a className="icon-link" href="tel:+789613719141"><span className="icon-circle">📞</span><span>89613719141</span></a>
          <a className="icon-link tg" href="https://t.me/kvartirkaufa02" target="_blank" rel="noreferrer">
            <span>Telegram</span>
          </a>
          <span className="icon-link max"><span>MAX</span></span>
        </div>
      </div>
    </footer>
  );
}

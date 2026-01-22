import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FreshWidget from '../components/FreshWidget';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Navbar />
        <main className="container">{children}</main>
        <Footer />
        <FreshWidget />
      </body>
    </html>
  );
}

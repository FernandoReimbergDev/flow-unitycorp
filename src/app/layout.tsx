import { Montserrat } from "next/font/google";
import "./global.css";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import ClientProviders from './components/ClientProviders';
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "500", "700"],
  style: ["normal"],
  variable: "--font-montserrat",
});

export const metadata = {
  title: 'Seu Título',
  description: 'Descrição do seu site',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${montserrat.variable} w-full font-montserrat`}
      >
        <ClientProviders>
          <Header />
          {children}
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}

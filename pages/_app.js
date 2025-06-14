
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <main className="dark min-h-screen bg-background text-white">
      <Component {...pageProps} />
    </main>
  );
}

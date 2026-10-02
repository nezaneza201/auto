import "./globals.css";

export const metadata = {
  title: "FlowDesk — Business Automation",
  description: "Real lead capture, bookings, follow-ups and business reporting."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
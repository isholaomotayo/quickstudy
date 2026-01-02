// Route segment config to prevent static generation
// This prevents TinyMCE from trying to load browser resources during build
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


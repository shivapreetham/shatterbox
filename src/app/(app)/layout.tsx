import ActiveStatus from '@/components/chat/ActiveStatus';

import Sidebar from '@/components/chat/sidebar/Sidebar';
interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <Sidebar>
    <div className="flex flex-col h-screen pb-5">
      {/* <Navbar /> */}
      {children}
      <ActiveStatus />
    </div>
    </Sidebar>
  );
}
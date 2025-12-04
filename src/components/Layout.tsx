import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  sidebarOpen?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, sidebarOpen = false }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black transition-colors duration-300">
      <div
        className="transition-all duration-300"
        style={{
          width: sidebarOpen ? 'calc(100% - 280px - 20px)' : '100%',
          marginLeft: sidebarOpen ? '280px' : '0',
          marginRight: sidebarOpen ? '20px' : '0'
        }}
      >
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;

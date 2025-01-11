'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { User } from 'next-auth';
import { Home, LayoutDashboard, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { ModeToggle } from '@/components/home&anonymous/ModeToggle';
import Image from 'next/image';

function Navbar() {
  const { data: session } = useSession();
  const user: User = session?.user;
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="px-4 w-full md:px-8 py-3 shadow-2xl bg-background border border-border">
      <div className="container mx-auto flex justify-between items-right">
        {/* Brand Name */}
        
          <ModeToggle />
        </div>
    </nav>
  );
}

export default Navbar;

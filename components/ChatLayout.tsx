'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface ChatLayoutProps {
    children: React.ReactNode;
    sidebar: React.ReactNode;
}

export default function ChatLayout({ children, sidebar }: ChatLayoutProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
            {/* Desktop Sidebar */}
            <aside className="hidden w-80 flex-col border-r border-sidebar-border bg-sidebar md:flex">
                <div className="flex h-full flex-col">
                    {sidebar}
                </div>
            </aside>

            {/* Mobile Sidebar (Drawer) */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Drawer Content */}
                    <div className="relative flex w-4/5 flex-col bg-sidebar p-4 shadow-xl ring-1 ring-border animate-in slide-in-from-left duration-300">
                        <div className="absolute right-4 top-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        {sidebar}
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex flex-1 flex-col overflow-hidden">
                {/* Mobile Header */}
                <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 md:hidden">
                    <span className="font-bold text-foreground">Link Chat</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="text-muted-foreground"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden">
                    {children}
                </div>
            </main>
        </div>
    );
}

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface UnifiedHeaderProps {
  onSidebarToggle?: () => void;
}

export function UnifiedHeader({ onSidebarToggle }: UnifiedHeaderProps) {
  const router = useRouter();
  const [notifications] = useState([
    { id: 1, message: "Shipment ASH-20250101-ABC123 has been delivered", time: "2 min ago", unread: true },
    { id: 2, message: "New invoice available for download", time: "1 hour ago", unread: true },
    { id: 3, message: "Payment received for invoice INV-001", time: "3 hours ago", unread: false }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleLogout = () => {
    // Clear the mock authentication cookie
    document.cookie = "mock-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    // Mock logout - in real app this would clear auth tokens
    router.push('/login');
  };

  const handleProfileClick = () => {
    router.push('/profile');
  };



  const handleHelpClick = () => {
    router.push('/support');
  };

  const handleNotificationsClick = () => {
    router.push('/notifications');
  };

  return (
    <header 
      className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40 shadow-sm"
      id="parcego-unified-header"
    >
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left Section - Logo and Mobile Menu */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden p-2"
            onClick={onSidebarToggle}
            aria-label="Toggle sidebar"
            id="parcego-header-mobile-menu-btn"
          >
            <Icon name="Menu" size={20} />
          </Button>

          {/* Logo */}
          <div className="flex items-center">
            <Image
              src="/Logo/Horizontal-logo.svg"
              alt="Parcego Logo"
              width={150}
              height={30}
              className="h-8 w-auto"
              unoptimized
              priority
            />
          </div>
        </div>

        {/* Right Section - Actions and User Menu */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="relative p-2"
                aria-label="Notifications"
                id="parcego-header-notifications-btn"
              >
                <Icon name="Bell" size={20} />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNotificationsClick}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  View All
                </Button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3">
                    <div className="flex items-start gap-3 w-full">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notification.unread ? 'bg-blue-500' : 'bg-gray-300'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${notification.unread ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <Icon name="Bell" size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No notifications</p>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 p-2"
                aria-label="User menu"
                id="parcego-header-user-menu-btn"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/api/placeholder/32/32" alt="User avatar" />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                    JD
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">John Doe</p>
                  <p className="text-xs text-gray-500">Merchant</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">John Doe</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    john.doe@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                <Icon name="User" size={16} className="mr-2" />
                <span>Profile</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleHelpClick} className="cursor-pointer">
                <Icon name="HelpCircle" size={16} className="mr-2" />
                <span>Help & Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                <Icon name="LogOut" size={16} className="mr-2" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

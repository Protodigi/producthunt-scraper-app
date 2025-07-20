'use client'

import React from 'react'
import {
  Navbar as NextUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
  Link,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  User
} from '@nextui-org/react'
import { usePathname } from 'next/navigation'

interface NavItem {
  label: string
  href: string
  isProtected?: boolean
}

interface NavbarProps {
  user?: {
    id: string
    email: string
    name?: string
    avatarUrl?: string
  }
  navItems?: NavItem[]
  onSignOut?: () => void
  brandName?: string
  brandLogo?: React.ReactNode
}

const defaultNavItems: NavItem[] = [
  { label: 'Products', href: '/products' },
  { label: 'Analysis', href: '/analysis' },
  { label: 'Admin', href: '/admin', isProtected: true }
]

export function Navbar({
  user,
  navItems = defaultNavItems,
  onSignOut,
  brandName = 'ProductHunt Scraper',
  brandLogo
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const pathname = usePathname()

  const filteredNavItems = navItems.filter(item => {
    // Show all items if user is logged in, otherwise only show non-protected items
    return user || !item.isProtected
  })

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <NextUINavbar
      onMenuOpenChange={setIsMenuOpen}
      isMenuOpen={isMenuOpen}
      className="shadow-sm"
      maxWidth="xl"
    >
      {/* Mobile menu toggle */}
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className="sm:hidden"
        />
        <NavbarBrand>
          {brandLogo ? (
            <Link href="/" className="flex items-center gap-2">
              {brandLogo}
              <p className="font-bold text-inherit">{brandName}</p>
            </Link>
          ) : (
            <Link href="/" className="font-bold text-inherit">
              {brandName}
            </Link>
          )}
        </NavbarBrand>
      </NavbarContent>

      {/* Desktop navigation */}
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {filteredNavItems.map((item) => (
          <NavbarItem key={item.href} isActive={isActive(item.href)}>
            <Link
              color={isActive(item.href) ? 'primary' : 'foreground'}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              {item.label}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      {/* User menu / Auth buttons */}
      <NavbarContent justify="end">
        {user ? (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                as="button"
                className="transition-transform"
                color="primary"
                name={user.name || user.email}
                size="sm"
                src={user.avatarUrl}
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="User menu" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2" textValue="Profile">
                <User
                  name={user.name || 'User'}
                  description={user.email}
                  avatarProps={{
                    src: user.avatarUrl,
                    size: 'sm'
                  }}
                />
              </DropdownItem>
              <DropdownItem key="settings" href="/settings">
                Settings
              </DropdownItem>
              <DropdownItem key="help" href="/help">
                Help & Feedback
              </DropdownItem>
              <DropdownItem
                key="logout"
                color="danger"
                onPress={onSignOut}
              >
                Sign Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          <NavbarItem>
            <Button
              as={Link}
              color="primary"
              href="/auth/login"
              variant="flat"
              size="sm"
            >
              Sign In
            </Button>
          </NavbarItem>
        )}
      </NavbarContent>

      {/* Mobile menu */}
      <NavbarMenu>
        {filteredNavItems.map((item, index) => (
          <NavbarMenuItem key={`${item.href}-${index}`}>
            <Link
              color={isActive(item.href) ? 'primary' : 'foreground'}
              className="w-full"
              href={item.href}
              size="lg"
              onPress={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          </NavbarMenuItem>
        ))}
        {user ? (
          <>
            <NavbarMenuItem>
              <Link
                className="w-full"
                href="/settings"
                size="lg"
                onPress={() => setIsMenuOpen(false)}
              >
                Settings
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Link
                color="danger"
                className="w-full"
                size="lg"
                onPress={() => {
                  setIsMenuOpen(false)
                  onSignOut?.()
                }}
              >
                Sign Out
              </Link>
            </NavbarMenuItem>
          </>
        ) : (
          <NavbarMenuItem>
            <Link
              color="primary"
              className="w-full"
              href="/auth/login"
              size="lg"
              onPress={() => setIsMenuOpen(false)}
            >
              Sign In
            </Link>
          </NavbarMenuItem>
        )}
      </NavbarMenu>
    </NextUINavbar>
  )
}

// Sub-navigation component for secondary navigation
export function SubNavbar({
  items,
  className = ''
}: {
  items: { label: string; href: string }[]
  className?: string
}) {
  const pathname = usePathname()

  return (
    <nav className={`flex gap-4 border-b border-divider px-6 ${className}`}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`py-3 border-b-2 transition-colors ${
            pathname === item.href
              ? 'border-primary text-primary'
              : 'border-transparent hover:text-primary'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
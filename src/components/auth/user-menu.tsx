'use client'

import { useRouter } from 'next/navigation'
import { 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem, 
  Avatar,
  User
} from '@nextui-org/react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { 
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface UserMenuProps {
  user: SupabaseUser
}

export default function UserMenu({ user }: UserMenuProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  const getUserDisplayName = () => {
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name
    }
    if (user.email) {
      return user.email.split('@')[0]
    }
    return 'User'
  }

  const getUserAvatar = () => {
    if (user.user_metadata?.avatar_url) {
      return user.user_metadata.avatar_url
    }
    return undefined
  }

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Avatar
          as="button"
          className="transition-transform"
          src={getUserAvatar()}
          name={getUserDisplayName()}
          size="sm"
          showFallback
        />
      </DropdownTrigger>
      <DropdownMenu 
        aria-label="User menu"
        variant="flat"
      >
        <DropdownItem 
          key="profile" 
          className="h-14 gap-2"
          textValue="Profile"
        >
          <User
            name={getUserDisplayName()}
            description={user.email}
            avatarProps={{
              src: getUserAvatar(),
              size: "sm"
            }}
          />
        </DropdownItem>
        <DropdownItem 
          key="dashboard" 
          startContent={<ChartBarIcon className="w-4 h-4" />}
          href="/"
        >
          Dashboard
        </DropdownItem>
        <DropdownItem 
          key="settings" 
          startContent={<Cog6ToothIcon className="w-4 h-4" />}
          href="/settings"
        >
          Settings
        </DropdownItem>
        <DropdownItem 
          key="profile-page" 
          startContent={<UserCircleIcon className="w-4 h-4" />}
          href="/profile"
        >
          My Profile
        </DropdownItem>
        <DropdownItem 
          key="logout" 
          color="danger" 
          startContent={<ArrowRightOnRectangleIcon className="w-4 h-4" />}
          onClick={handleSignOut}
        >
          Sign Out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}
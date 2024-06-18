import { useRegisterActions } from 'kbar'
import { useNavigate } from 'react-router-dom'

import { FaRegFile } from 'react-icons/fa6'

export default function useSettingActions() {
  const navigate = useNavigate()
  const settingActions = [
    {
      id: 'general',
      name: 'General',
      section: 'Organization',
      path: '/vendor/settings?tab=general'
    },
    {
      id: 'users',
      name: 'Users',
      section: 'Organization',
      path: '/vendor/settings?tab=users'
    },
    {
      id: 'roles',
      name: 'Roles',
      section: 'Organization',
      path: '/vendor/settings?tab=roles'
    },
    {
      id: 'feeds',
      name: 'Feeds',
      section: 'Organization',
      path: '/vendor/settings?tab=feeds'
    },
    {
      id: 'checks',
      name: 'Checks',
      section: 'Organization',
      path: '/vendor/settings?tab=checks'
    },
    {
      id: 'lists',
      name: 'Lists',
      section: 'Organization',
      path: '/vendor/settings?tab=lists'
    },
    {
      id: 'legal',
      name: 'Legal',
      section: 'Organization',
      path: '/vendor/settings?tab=legal'
    },
    {
      id: 'connections',
      name: 'Connections',
      section: 'Organization',
      path: '/vendor/settings?tab=connections'
    },
    {
      id: 'personal-details',
      name: 'Personal Details',
      section: 'Personal',
      path: '/vendor/settings?tab=personal-details'
    },
    {
      id: 'organizations',
      name: 'Organizations',
      section: 'Personal',
      path: '/vendor/settings?tab=organizations'
    },
    {
      id: 'security-tokens',
      name: 'Security Tokens',
      section: 'Personal',
      path: '/vendor/settings?tab=security-tokens'
    },
    {
      id: 'notifications',
      name: 'Notifications',
      section: 'Personal',
      path: '/vendor/settings?tab=notifications'
    }
  ]

  let settingsData = []
  settingActions?.map((item) =>
    settingsData?.push({
      id: item?.name,
      name: item?.name,
      parent: 'settings',
      section: item?.section,
      icon: <FaRegFile color='#718096' />,
      perform: () => navigate(item?.path)
    })
  )

  useRegisterActions([
    {
      id: 'settings',
      name: 'Settings',
      icon: <FaRegFile color='#718096' />,
      section: 'navigation'
    },
    ...settingsData
  ])
}

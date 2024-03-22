import {
  Box,
  IconButton,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup
} from "@chakra-ui/react";
import {FaBell} from "react-icons/fa";
import CheckMark from "../Misc/CheckMark";
import {useEffect, useState} from "react";
import {UpdateNotificationPreference} from "graphQL/Mutation";
import {useMutation, useQuery} from "@apollo/client";
import {GetUserNotificationPreferences} from "graphQL/Queries";

const NotificationMenuBell = () => {
  const [updatePreference] = useMutation(UpdateNotificationPreference)
  const { data } = useQuery(GetUserNotificationPreferences, {
    variables: {
      envId: localStorage['activeEnv']
    }
  })

  useEffect(() => {
    if (data) {
      setPreference(data.notificationPreferences || ['none'])
    }
  }, [data])

  const [preference, setPreference] = useState([])
  const notificationPreferences = {
    'Off': 'none',
    'All Activities': 'all',
    'Vulnerabilities': 'vulnerabilities',
    'Licenses': 'licenses',
    'Policies': 'policies',
  }
  const handlePreferenceChange = (newPreference) => {
    if (newPreference.includes('none') || newPreference.includes('all')) {
      newPreference = [newPreference[newPreference.length - 1]] // only allow one status at a time
    }
    //API call to update user's notification preferences
    updatePreference({
      variables: {
        notificationPreferences: newPreference,
        envId: localStorage['activeEnv']
      }
    }).then((res) => {
      setPreference(newPreference)
    })

  }

  const generateMenuItems = (notificationPreferences) => {
    return Object.entries(notificationPreferences).map(([key, value]) => (
      <MenuItemOption
        key={key}
        value={value}
        fontSize={'sm'}
      >
        {key}
      </MenuItemOption>
    ))
  }


  return (
    <Box width={'fit-content'} position={'relative'}>
      <Menu closeOnSelect={false}>
        {preference[0] != 'none' && <CheckMark />}
        <MenuButton>
          <IconButton
            colorScheme='blue'
            icon={<FaBell />}
          />
        </MenuButton>
        <MenuList>
          <MenuOptionGroup
            type='checkbox'
            value={preference}
            onChange={handlePreferenceChange}
          >
            {generateMenuItems(notificationPreferences)}
          </MenuOptionGroup>
        </MenuList>
      </Menu>
    </Box>
  )
}

export default NotificationMenuBell
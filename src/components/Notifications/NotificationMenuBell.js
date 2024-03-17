import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuItem, MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Tooltip
} from "@chakra-ui/react";
import {FaBell, FaFilter} from "react-icons/fa";
import CheckMark from "../Misc/CheckMark";
import {useEffect, useState} from "react";

const NotificationMenuBell = () => {

  useEffect(() => {
    //API call to get user's notification preferences
    setPreference(['none'])
  }, [])

  const [preference, setPreference] = useState([])
  const notificationPreferences = {
    'Off': 'none',
    'All Activities': 'all',
    'Vulnerabilities': 'vulnerabilities',
    'Licenses': 'licenses',
    'Policies': 'policies',
  }
  const handlePreferenceChange = (newPreference) => {
    newPreference = [newPreference[newPreference.length - 1]] // only allow one status at a time

    //Mutation to update user's notification preferences
    setPreference(newPreference)
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
      <Menu closeOnSelect={true}>
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
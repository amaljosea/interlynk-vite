import {
  Menu,
  MenuButton,
  MenuList,
  MenuOptionGroup,
  MenuItemOption,
  Button,
  Flex,
  Box
} from '@chakra-ui/react'
import CheckMark from 'components/Misc/CheckMark'
import GlobalContext from 'context/GlobalContext'
import React, { useContext, useState } from 'react'
import { FaFilter } from 'react-icons/fa'

const ChangelogFilterMenu = ({
  id,
  users,
  actions,
  totalRows,
  setPageIndex,
  refetch
}) => {
  const { prodLogField, prodLogDirection } = useContext(GlobalContext)

  const [selectedType, setSelectedType] = useState([])
  const [selectedUser, setSelectedUser] = useState([])

  const onFilterType = (value) => {
    setSelectedType(value.includes('all') ? [] : value)
    refetch({
      variables: {
        id: id,
        changeType: value.includes('all') ? undefined : value,
        first: totalRows,
        field: prodLogField,
        direction: prodLogDirection
      }
    })
    setPageIndex(1)
  }

  const onFilterUser = (value) => {
    setSelectedUser(value.includes('all') ? [] : value)
    refetch({
      variables: {
        id: id,
        changedBy: value.includes('all') ? undefined : value,
        first: totalRows,
        field: prodLogField,
        direction: prodLogDirection
      }
    })
    setPageIndex(1)
  }

  return (
    <Flex alignItems={'center'} gap={4}>
      {/* TYPE FILTER */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {selectedType.length !== 0 && <CheckMark />}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            Type
          </MenuButton>
          <MenuList minWidth='240px'>
            <MenuOptionGroup
              type='checkbox'
              value={selectedType}
              onChange={onFilterType}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {actions.length > 0 &&
                [...new Set(actions)].map((p, index) => (
                  <MenuItemOption
                    value={p}
                    key={index}
                    fontSize={'sm'}
                    textTransform={'capitalize'}
                  >
                    {p}
                  </MenuItemOption>
                ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* USER FILTER */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {selectedUser.length !== 0 && <CheckMark />}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            User
          </MenuButton>
          <MenuList minWidth='240px'>
            <MenuOptionGroup
              type='checkbox'
              value={selectedUser}
              onChange={onFilterUser}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {users.length > 0 &&
                [...new Set(users)].map((p, index) => (
                  <MenuItemOption value={p} key={index} fontSize={'sm'}>
                    {p}
                  </MenuItemOption>
                ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
    </Flex>
  )
}

export default ChangelogFilterMenu

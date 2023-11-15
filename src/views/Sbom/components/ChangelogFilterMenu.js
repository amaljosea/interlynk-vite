import { CheckIcon } from '@chakra-ui/icons'
import {
  Menu,
  MenuButton,
  MenuList,
  MenuOptionGroup,
  MenuItemOption,
  Button,
  Flex,
  Box,
  Badge
} from '@chakra-ui/react'
import GlobalContext from 'context/GlobalContext'
import React, { useContext, useState } from 'react'
import { FaFilter } from 'react-icons/fa'

const CheckMark = () => {
  return (
    <CheckIcon
      w={5}
      h={5}
      bg={'white'}
      color={'blue.500'}
      border={'1px solid #4299E1'}
      rounded={'full'}
      p={'4px'}
      position={'absolute'}
      right={-1}
      top={-1}
      zIndex={11}
    />
  )
}

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
      projectId: id,
      changeType: value.includes('all') ? undefined : value,
      first: totalRows,
      last: undefined,
      after: undefined,
      last: undefined,
      field: prodLogField,
      direction: prodLogDirection
    })
    setPageIndex(1)
  }

  const onFilterUser = (value) => {
    setSelectedUser(value.includes('all') ? [] : value)
    refetch({
      projectId: id,
      changedBy: value.includes('all') ? undefined : value,
      first: totalRows,
      last: undefined,
      after: undefined,
      last: undefined,
      field: prodLogField,
      direction: prodLogDirection
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

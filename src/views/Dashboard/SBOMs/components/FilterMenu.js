import React, { useState } from 'react'
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
import { FaFilter } from 'react-icons/fa'

const FilterMenu = () => {
  const [filterPurl, setFilterPurl] = useState([])
  const [filterCpe, setFilterCpe] = useState([])
  const [filterResolution, setFilterResolution] = useState([])

  const activePurlCount = filterPurl.length
  const activeCpeCount = filterCpe.length
  const activeResolutionCount = filterResolution.length

  return (
    <Flex alignItems={'center'} gap={4}>
      {/* PURL STATUS */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {activePurlCount > 0 && (
            <Badge
              variant='solid'
              colorScheme='teal'
              position={'absolute'}
              right={-2}
              top={-1.5}
              zIndex={11}
            >
              {activePurlCount}
            </Badge>
          )}

          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize='sm'
            leftIcon={<FaFilter size={16} />}
          >
            PURL Status
          </MenuButton>
          <MenuList minWidth='240px'>
            <MenuOptionGroup
              type='radio'
              onChange={() => window.location.reload()}
            >
              <MenuItemOption value={'All'} fontSize={'sm'}>
                All
              </MenuItemOption>
            </MenuOptionGroup>
            <MenuOptionGroup
              type='checkbox'
              onChange={(value) => setFilterPurl(value)}
            >
              {['Missing', 'Invalid', 'Unmatched', 'Valid'].map((p, index) => (
                <MenuItemOption value={p} key={index} fontSize={'sm'}>
                  {p}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* CPE STATUS */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {activeCpeCount > 0 && (
            <Badge
              variant='solid'
              colorScheme='teal'
              position={'absolute'}
              right={-2}
              top={-1.5}
              zIndex={11}
            >
              {activeCpeCount}
            </Badge>
          )}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize='sm'
            leftIcon={<FaFilter size={16} />}
          >
            CPE Status
          </MenuButton>
          <MenuList minWidth='240px'>
            <MenuOptionGroup
              type='radio'
              onChange={() => window.location.reload()}
            >
              <MenuItemOption value={'All'} fontSize={'sm'}>
                All
              </MenuItemOption>
            </MenuOptionGroup>
            <MenuOptionGroup
              type='checkbox'
              onChange={(value) => setFilterCpe(value)}
            >
              {['Missing', 'Invalid', 'Unmatched', 'Valid'].map((p, index) => (
                <MenuItemOption value={p} key={index} fontSize={'sm'}>
                  {p}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* RESOLUTION */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {activeResolutionCount > 0 && (
            <Badge
              variant='solid'
              colorScheme='teal'
              position={'absolute'}
              right={-2}
              top={-1.5}
              zIndex={11}
            >
              {activeResolutionCount}
            </Badge>
          )}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize='sm'
            leftIcon={<FaFilter size={16} />}
          >
            Resolution
          </MenuButton>
          <MenuList minWidth='240px'>
            <MenuOptionGroup
              type='radio'
              onChange={() => window.location.reload()}
            >
              <MenuItemOption value={'All'} fontSize={'sm'}>
                All
              </MenuItemOption>
            </MenuOptionGroup>
            <MenuOptionGroup
              type='checkbox'
              onChange={(value) => setFilterResolution(value)}
            >
              {['Unresolved', 'Total'].map((p, index) => (
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

export default FilterMenu

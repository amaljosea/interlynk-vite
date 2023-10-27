import { CheckIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Stack
} from '@chakra-ui/react'
import GlobalContext from 'context/GlobalContext'
import { useContext, useState } from 'react'
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

const CompFilterMenu = ({
  refetch,
  productId,
  sbomId,
  setPageIndex,
  totalRows
}) => {
  const { compFilters, compField, compDirection } = useContext(GlobalContext)

  const { ecosystems, kinds, supplierNames, licenses } = compFilters

  const [selectedEcosystem, setSelectedEcosystem] = useState('')
  const [selectedKind, setSelectedKind] = useState('')
  const [selectedLicense, setSelectedLicense] = useState('')
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [selectedType, setSelectedType] = useState('')

  const onFilterEcosystem = (value) => {
    setSelectedEcosystem(value)
    refetch({
      projectId: productId,
      sbomId: sbomId,
      ecosystem: value === 'all' ? undefined : value,
      first: totalRows,
      last: undefined,
      after: undefined,
      last: undefined,
      field: compField,
      direction: compDirection
    })
    setPageIndex(1)
  }

  const onFilterKind = (value) => {
    setSelectedKind(value)
    refetch({
      projectId: productId,
      sbomId: sbomId,
      kind: value === 'all' ? undefined : value,
      first: totalRows,
      last: undefined,
      after: undefined,
      last: undefined,
      field: compField,
      direction: compDirection
    })
    setPageIndex(1)
  }

  const onFilterLicense = (value) => {
    setSelectedLicense(value)
    refetch({
      projectId: productId,
      sbomId: sbomId,
      licenses: value === 'all' ? undefined : value,
      first: totalRows,
      last: undefined,
      after: undefined,
      last: undefined,
      field: compField,
      direction: compDirection
    })
    setPageIndex(1)
  }

  const onFilterSupplier = (value) => {
    setSelectedSupplier(value)
    refetch({
      projectId: productId,
      sbomId: sbomId,
      supplierName: value === 'all' ? undefined : value,
      first: totalRows,
      last: undefined,
      after: undefined,
      last: undefined,
      field: compField,
      direction: compDirection
    })
    setPageIndex(1)
  }

  const onFilterType = (value) => {
    setSelectedType(value)
    refetch({
      projectId: productId,
      sbomId: sbomId,
      primary: value === 'primary' && value !== 'all' ? true : false,
      internal: value === 'internal' && value !== 'all' ? true : false,
      first: totalRows,
      last: undefined,
      after: undefined,
      last: undefined,
      field: compField,
      direction: compDirection
    })
    setPageIndex(1)
  }

  return (
    <Stack direction={'row'} alignItems={'center'} gap={1}>
      {/* ECOSYSTEM */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnBlur={true}>
          {selectedEcosystem !== '' && selectedEcosystem !== 'all' && (
            <CheckMark />
          )}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            Ecosystem
          </MenuButton>
          <MenuList minHeight={'auto'} maxHeight={'300px'} overflow={'hidden'} overflowY={'scroll'}>
            <MenuOptionGroup
              type='radio'
              value={selectedEcosystem}
              onChange={onFilterEcosystem}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {ecosystems?.map((item, index) => (
                <MenuItemOption key={index} value={item} fontSize={'sm'}>
                  {item}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* KIND */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {selectedKind !== '' && selectedKind !== 'all' && <CheckMark />}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            Kind
          </MenuButton>
          <MenuList minHeight={'auto'} maxHeight={'300px'} overflow={'hidden'} overflowY={'scroll'}>
            <MenuOptionGroup
              type='radio'
              value={selectedKind}
              onChange={onFilterKind}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {kinds?.map((item, index) => (
                <MenuItemOption key={index} value={item} fontSize={'sm'}>
                  {item}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* LICENSES */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {selectedLicense !== '' && selectedLicense !== 'all' && <CheckMark />}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            Licenses
          </MenuButton>
          <MenuList minHeight={'auto'} maxHeight={'300px'} overflow={'hidden'} overflowY={'scroll'}>
            <MenuOptionGroup
              type='radio'
              value={selectedLicense}
              onChange={onFilterLicense}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {licenses?.map((item, index) => (
                <MenuItemOption key={index} value={item} fontSize={'sm'}>
                  {item}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* SUPPLIER */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {selectedSupplier !== '' && selectedSupplier !== 'all' && (
            <CheckMark />
          )}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            Suppliers
          </MenuButton>
          <MenuList minHeight={'auto'} maxHeight={'300px'} overflow={'hidden'} overflowY={'scroll'}>
            <MenuOptionGroup
              type='radio'
              value={selectedSupplier}
              onChange={onFilterSupplier}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {supplierNames?.map((item, index) => (
                <MenuItemOption key={index} value={item} fontSize={'sm'}>
                  {item}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* TYPE */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {selectedType !== '' && selectedType !== 'all' && <CheckMark />}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            Type
          </MenuButton>
          <MenuList>
            <MenuOptionGroup
              type='radio'
              value={selectedType}
              onChange={onFilterType}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              <MenuItemOption value='primary' fontSize={'sm'}>
                primary
              </MenuItemOption>
              <MenuItemOption value='internal' fontSize={'sm'}>
                internal
              </MenuItemOption>
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
    </Stack>
  )
}

export default CompFilterMenu

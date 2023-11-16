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
const List = ({ children }) => {
  return (
    <MenuList
      minHeight={'auto'}
      maxHeight={'300px'}
      overflow={'hidden'}
      overflowY={'scroll'}
    >
      {children}
    </MenuList>
  )
}

const CompFilterMenu = ({ refetch, productId, sbomId }) => {
  const customerView = location.pathname.startsWith('/customer')

  const {
    compFilters,
    signedCompFilters,
    compField,
    compDirection,
    signedCompField,
    signedCompDirection,
    setComPageIndex,
    totalRows,
    compEcosystem,
    setCompEcosystem,
    compType,
    setCompType,
    compLicense,
    setCompLicense,
    compSupplier,
    setCompSupplier,
    compScope,
    setCompScope
  } = useContext(GlobalContext)

  const { ecosystems, kinds, supplierNames, licenses } = customerView
    ? signedCompFilters
    : compFilters

  const onFilterEcosystem = (value) => {
    setCompEcosystem(value.includes('all') ? [] : value)
    refetch({
      variables: {
        projectId: productId,
        sbomId: sbomId,
        ecosystem: value.includes('all') ? undefined : value,
        first: totalRows,
        last: undefined,
        after: undefined,
        last: undefined,
        field: customerView ? signedCompField : compField,
        direction: customerView ? signedCompDirection : compDirection
      }
    })
    setComPageIndex(1)
  }

  const onFilterKind = (value) => {
    setCompType(value.includes('all') ? [] : value)
    refetch({
      variables: {
        projectId: productId,
        sbomId: sbomId,
        kind: value.includes('all') ? undefined : value,
        first: totalRows,
        last: undefined,
        after: undefined,
        last: undefined,
        field: customerView ? signedCompField : compField,
        direction: customerView ? signedCompDirection : compDirection
      }
    })
    setComPageIndex(1)
  }

  const onFilterLicense = (value) => {
    setCompLicense(value.includes('all') ? [] : value)
    refetch({
      variables: {
        projectId: productId,
        sbomId: sbomId,
        licenses: value.includes('all') ? undefined : value,
        first: totalRows,
        last: undefined,
        after: undefined,
        last: undefined,
        field: customerView ? signedCompField : compField,
        direction: customerView ? signedCompDirection : compDirection
      }
    })
    setComPageIndex(1)
  }

  const onFilterSupplier = (value) => {
    setCompSupplier(value.includes('all') ? [] : value)
    refetch({
      variables: {
        projectId: productId,
        sbomId: sbomId,
        supplierName: value.includes('all') ? undefined : value,
        first: totalRows,
        last: undefined,
        after: undefined,
        last: undefined,
        field: customerView ? signedCompField : compField,
        direction: customerView ? signedCompDirection : compDirection
      }
    })
    setComPageIndex(1)
  }

  const onFilterType = (value) => {
    setCompScope(value)
    refetch({
      variables: {
        projectId: productId,
        sbomId: sbomId,
        primary: value === 'primary' ? true : undefined,
        internal: value === 'internal' ? true : undefined,
        first: totalRows,
        last: undefined,
        after: undefined,
        last: undefined,
        field: customerView ? signedCompField : compField,
        direction: customerView ? signedCompDirection : compDirection
      }
    })
    setComPageIndex(1)
  }

  return (
    <Stack direction={'row'} alignItems={'center'} gap={1}>
      {/* ECOSYSTEM */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {compEcosystem.length !== 0 && <CheckMark />}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            Ecosystem
          </MenuButton>
          <List>
            <MenuOptionGroup
              type='checkbox'
              value={compEcosystem}
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
          </List>
        </Menu>
      </Box>
      {/* KIND */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {compType.length !== 0 && <CheckMark />}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            Type
          </MenuButton>
          <List>
            <MenuOptionGroup
              type='checkbox'
              value={compType}
              onChange={onFilterKind}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {kinds?.map((item, index) => (
                <MenuItemOption
                  key={index}
                  value={item}
                  fontSize={'sm'}
                  textTransform={'capitalize'}
                >
                  {item}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </List>
        </Menu>
      </Box>
      {/* LICENSES */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {compLicense.length !== 0 && <CheckMark />}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            Licenses
          </MenuButton>
          <List>
            <MenuOptionGroup
              type='checkbox'
              value={compLicense}
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
          </List>
        </Menu>
      </Box>
      {/* SUPPLIER */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {compSupplier.length !== 0 && <CheckMark />}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            Suppliers
          </MenuButton>
          <List>
            <MenuOptionGroup
              type='checkbox'
              value={compSupplier}
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
          </List>
        </Menu>
      </Box>
      {/* TYPE */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {compScope !== '' && compScope !== 'all' && <CheckMark />}
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize={'sm'}
            leftIcon={<FaFilter size={14} />}
          >
            Scope
          </MenuButton>
          <MenuList>
            <MenuOptionGroup
              type='radio'
              value={compScope}
              onChange={onFilterType}
            >
              {['all', 'primary', 'internal'].map((item, index) => (
                <MenuItemOption
                  value={item}
                  key={index}
                  fontSize={'sm'}
                  textTransform={'capitalize'}
                >
                  {item}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
    </Stack>
  )
}

export default CompFilterMenu

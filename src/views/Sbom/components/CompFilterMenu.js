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
import CheckMark from 'components/Misc/CheckMark'
import GlobalContext from 'context/GlobalContext'
import { useContext } from 'react'
import { FaFilter } from 'react-icons/fa'

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
    compSearchInput,
    compEcosystem,
    setCompEcosystem,
    compType,
    setCompType,
    compLicense,
    setCompLicense,
    compSupplier,
    setCompSupplier,
    compScope,
    setCompScope,
    setCompAfter,
    setCompBefore
  } = useContext(GlobalContext)

  const { ecosystems, kinds, supplierNames, licenses } = customerView
    ? signedCompFilters
    : compFilters

  const onFilter = (ecosystem, kind, licenses, suppliers, scope) => {
    refetch({
      variables: {
        projectId: productId,
        sbomId: sbomId,
        first: totalRows,
        search: compSearchInput !== '' ? compSearchInput : undefined,
        ecosystem:
          ecosystem.includes('all') || ecosystem.length === 0
            ? undefined
            : ecosystem,
        kind: kind.includes('all') || kind.length === 0 ? undefined : kind,
        licenses:
          licenses.includes('all') || licenses.length === 0
            ? undefined
            : licenses,
        supplierName:
          suppliers.includes('all') || suppliers.length === 0
            ? undefined
            : suppliers,
        primary: scope === 'primary' ? true : undefined,
        internal: scope === 'internal' ? true : undefined,
        field: customerView ? signedCompField : compField,
        direction: customerView ? signedCompDirection : compDirection
      }
    })
  }

  const onFilterEcosystem = (value) => {
    setCompAfter('')
    setCompBefore('')
    setCompEcosystem(value.includes('all') ? [] : value)
    onFilter(value, compType, compLicense, compSupplier, compScope)
    setComPageIndex(1)
  }

  const onFilterKind = (value) => {
    setCompAfter('')
    setCompBefore('')
    setCompType(value.includes('all') ? [] : value)
    onFilter(compEcosystem, value, compLicense, compSupplier, compScope)
    setComPageIndex(1)
  }

  const onFilterLicense = (value) => {
    setCompAfter('')
    setCompBefore('')
    setCompLicense(value.includes('all') ? [] : value)
    onFilter(compEcosystem, compType, value, compSupplier, compScope)
    setComPageIndex(1)
  }

  const onFilterSupplier = (value) => {
    setCompAfter('')
    setCompBefore('')
    setCompSupplier(value.includes('all') ? [] : value)
    onFilter(compEcosystem, compType, compLicense, value, compScope)

    setComPageIndex(1)
  }

  const onFilterType = (value) => {
    setCompAfter('')
    setCompBefore('')
    setCompScope(value)
    onFilter(compEcosystem, compType, compLicense, compSupplier, value)
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
            Visibility
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

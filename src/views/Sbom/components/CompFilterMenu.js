import {
  Box,
  Flex,
  Menu,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Stack,
  Switch,
  Text
} from '@chakra-ui/react'

import CheckMark from 'components/Misc/CheckMark'
import MenuHeading from 'components/Misc/MenuHeading'

import { useGlobalState } from 'hooks/useGlobalState'

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
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')
  const { prodCompState, dispatch } = useGlobalState()
  const {
    totalRows,
    filters,
    field,
    direction,
    searchInput,
    ecosystems,
    kinds,
    licenses,
    suppliers,
    scope,
    direct
  } = prodCompState
  const { prodCompDispatch } = dispatch

  const {
    ecosystems: filterEcosystem,
    kinds: filterKinds,
    supplierNames: filterSuppliers,
    licenses: filterLicenses
  } = filters

  const onFilter = (ecosystem, kind, licenses, suppliers, scope, direct) => {
    refetch({
      projectId: signedUrlParams ? undefined : productId,
      sbomId: sbomId,
      first: totalRows,
      last: undefined,
      after: undefined,
      before: undefined,
      search: searchInput !== '' ? searchInput : undefined,
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
      direct: direct === true ? true : undefined,
      field: field,
      direction: direction
    })
  }

  const onFilterEcosystem = (value) => {
    onFilter(value, kinds, licenses, suppliers, scope, direct)
    prodCompDispatch({
      type: 'FILTER_ECOSYSTEM',
      payload: value
    })
  }

  const onFilterKind = (value) => {
    onFilter(ecosystems, value, licenses, suppliers, scope, direct)
    prodCompDispatch({
      type: 'FILTER_KIND',
      payload: value
    })
  }

  const onFilterLicense = (value) => {
    onFilter(ecosystems, kinds, value, suppliers, scope, direct)
    prodCompDispatch({
      type: 'FILTER_LICENSE',
      payload: value
    })
  }

  const onFilterSupplier = (value) => {
    onFilter(ecosystems, kinds, licenses, value, scope, direct)
    prodCompDispatch({
      type: 'FILTER_SUPPLIER',
      payload: value
    })
  }

  const onFilterType = (value) => {
    onFilter(ecosystems, kinds, licenses, suppliers, value, direct)
    prodCompDispatch({ type: 'FILTER_SCOPE', payload: value })
  }

  const onFilterDirect = (e) => {
    onFilter(ecosystems, kinds, licenses, suppliers, scope, e.target.checked)
    prodCompDispatch({ type: 'FILTER_DIRECT', payload: e.target.checked })
  }

  return (
    <Stack direction={'row'} alignItems={'center'} gap={1}>
      {/* ECOSYSTEM */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={false}>
          {ecosystems.length !== 0 && <CheckMark />}
          <MenuHeading title={'Ecosystem'} />
          <MenuList>
            <MenuOptionGroup
              type='checkbox'
              value={ecosystems}
              onChange={onFilterEcosystem}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {filterEcosystem?.map((item, index) => (
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
        <Menu closeOnSelect={false}>
          {kinds.length !== 0 && <CheckMark />}
          <MenuHeading title={'Type'} />
          <MenuList>
            <MenuOptionGroup
              type='checkbox'
              value={kinds}
              onChange={onFilterKind}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {filterKinds?.map((item, index) => (
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
          </MenuList>
        </Menu>
      </Box>
      {/* LICENSES */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={false}>
          {licenses.length !== 0 && <CheckMark />}
          <MenuHeading title={'Licenses'} />
          <MenuList
            width={'300px'}
            minH='auto'
            maxH={'350px'}
            overflowY={'scroll'}
          >
            <MenuOptionGroup
              type='checkbox'
              value={licenses}
              onChange={onFilterLicense}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {filterLicenses?.map((item, index) => (
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
        <Menu closeOnSelect={false}>
          {suppliers.length !== 0 && <CheckMark />}
          <MenuHeading title={'Suppliers'} />
          <MenuList>
            <MenuOptionGroup
              type='checkbox'
              value={suppliers}
              onChange={onFilterSupplier}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {filterSuppliers?.map((item, index) => (
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
        <Menu closeOnSelect={false}>
          {scope !== '' && scope !== 'all' && <CheckMark />}
          <MenuHeading title={'Visibility'} />
          <MenuList>
            <MenuOptionGroup type='radio' value={scope} onChange={onFilterType}>
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
      {/* DIRECT */}
      <Flex align='center' gap={2}>
        <Switch id='isDirect' isChecked={direct} onChange={onFilterDirect} />
        <Text>Direct</Text>
      </Flex>
    </Stack>
  )
}

export default CompFilterMenu

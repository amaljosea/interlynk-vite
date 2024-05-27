import { Box, Flex, Menu, Stack, Switch, Text } from '@chakra-ui/react'

import CheckMark from 'components/Misc/CheckMark'
import CustomList from 'components/Misc/CustomList'
import MenuHeading from 'components/Misc/MenuHeading'

import { useGlobalState } from 'hooks/useGlobalState'

const CompFilters = ({ filters, reset }) => {
  const { prodCompState, dispatch } = useGlobalState()
  const { ecosystems, kinds, licenses, suppliers, scope, direct } =
    prodCompState
  const { prodCompDispatch } = dispatch

  const {
    ecosystems: filterEcosystem,
    kinds: filterKinds,
    supplierNames: filterSuppliers,
    licenses: filterLicenses
  } = filters || ''

  const onFilterEcosystem = (value) => {
    prodCompDispatch({
      type: 'FILTER_ECOSYSTEM',
      payload: value
    })
    reset()
  }

  const onFilterKind = (value) => {
    prodCompDispatch({
      type: 'FILTER_KIND',
      payload: value
    })
    reset()
  }

  const onFilterLicense = (value) => {
    prodCompDispatch({
      type: 'FILTER_LICENSE',
      payload: value
    })
    reset()
  }

  const onFilterSupplier = (value) => {
    prodCompDispatch({
      type: 'FILTER_SUPPLIER',
      payload: value
    })
    reset()
  }

  const onFilterType = (value) => {
    prodCompDispatch({ type: 'FILTER_SCOPE', payload: value })
    reset()
  }

  const onFilterDirect = (e) => {
    prodCompDispatch({ type: 'FILTER_DIRECT', payload: e.target.checked })
    reset()
  }

  if (filters) {
    return (
      <Stack direction={'row'} alignItems={'center'} gap={1}>
        {/* ECOSYSTEM */}
        <Box width={'fit-content'} position={'relative'}>
          <Menu closeOnSelect={false}>
            {ecosystems.length !== 0 && <CheckMark />}
            <MenuHeading title={'Ecosystem'} />
            <CustomList
              options={filterEcosystem}
              value={ecosystems}
              onChange={onFilterEcosystem}
            />
          </Menu>
        </Box>
        {/* KIND */}
        <Box width={'fit-content'} position={'relative'}>
          <Menu closeOnSelect={false}>
            {kinds.length !== 0 && <CheckMark />}
            <MenuHeading title={'Type'} />
            <CustomList
              options={kinds}
              value={filterKinds}
              onChange={onFilterKind}
            />
          </Menu>
        </Box>
        {/* LICENSES */}
        <Box width={'fit-content'} position={'relative'}>
          <Menu closeOnSelect={false}>
            {licenses.length !== 0 && <CheckMark />}
            <MenuHeading title={'Licenses'} />
            <CustomList
              options={filterLicenses}
              value={licenses}
              onChange={onFilterLicense}
            />
          </Menu>
        </Box>
        {/* SUPPLIER */}
        <Box width={'fit-content'} position={'relative'}>
          <Menu closeOnSelect={false}>
            {suppliers.length !== 0 && <CheckMark />}
            <MenuHeading title={'Suppliers'} />
            <CustomList
              options={filterSuppliers}
              value={suppliers}
              onChange={onFilterSupplier}
            />
          </Menu>
        </Box>
        {/* TYPE */}
        <Box width={'fit-content'} position={'relative'}>
          <Menu closeOnSelect={false}>
            {scope !== '' && scope !== 'all' && <CheckMark />}
            <MenuHeading title={'Visibility'} />
            <CustomList
              type='radio'
              options={['primary', 'internal']}
              value={scope}
              onChange={onFilterType}
            />
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

  return null
}

export default CompFilters

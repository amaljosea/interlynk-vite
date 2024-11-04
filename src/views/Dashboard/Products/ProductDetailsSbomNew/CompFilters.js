import { gql, useLazyQuery } from '@apollo/client'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { Box, Flex, Menu, Stack, Text } from '@chakra-ui/react'

import CustomList from 'components/Misc/CustomList'
import LynkMenuList from 'components/Misc/LynkMenuList'
import LynkSwitch from 'components/Misc/LynkSwitch'
import MenuHeading from 'components/Misc/MenuHeading'

import { useGlobalState } from 'hooks/useGlobalState'

const GetEcosystems = gql`
  query GetEcosystems($productId: Uuid!, $sbomId: Uuid!) {
    sbom(projectId: $productId, sbomId: $sbomId) {
      filters {
        ecosystems
      }
    }
  }
`

const GetSupplierNames = gql`
  query GetSupplierNames($productId: Uuid!, $sbomId: Uuid!) {
    sbom(projectId: $productId, sbomId: $sbomId) {
      filters {
        supplierNames
      }
    }
  }
`

const GetKinds = gql`
  query GetKinds($productId: Uuid!, $sbomId: Uuid!) {
    sbom(projectId: $productId, sbomId: $sbomId) {
      filters {
        kinds
      }
    }
  }
`

const GetLicenses = gql`
  query GetLicenses($productId: Uuid!, $sbomId: Uuid!) {
    sbom(projectId: $productId, sbomId: $sbomId) {
      filters {
        licenses
      }
    }
  }
`

const CompFilters = ({ reset }) => {
  const params = useParams()
  const productId = params?.productid
  const sbomId = params?.sbomid
  const { prodCompState, dispatch } = useGlobalState()
  const { ecosystems, kinds, licenses, suppliers, scope, direct, include } =
    prodCompState
  const { prodCompDispatch } = dispatch

  const [compEcosystems, setCompEcosystems] = useState(['All'])
  const [compSuppliers, setCompSuppliers] = useState(['All'])
  const [compLicenses, setCompLicenses] = useState(['All'])
  const [compKinds, setCompKinds] = useState(['All'])

  // GET COMPONENT FILTER HEADS
  const [getEcosystems, { loading: ecoLoading }] = useLazyQuery(GetEcosystems)
  const [getSuppliers, { loading: supLoading }] = useLazyQuery(GetSupplierNames)
  const [getKinds, { loading: kindLoading }] = useLazyQuery(GetKinds)
  const [getLicenses, { loading: licLoading }] = useLazyQuery(GetLicenses)

  const variables = {
    productId,
    sbomId
  }

  const onFilterType = (value) => {
    prodCompDispatch({ type: 'FILTER_SCOPE', payload: value })
    reset()
  }

  const onFilterDirect = (e) => {
    prodCompDispatch({ type: 'FILTER_DIRECT', payload: e.target.checked })
    reset()
  }

  const onFilterInclude = (value) => {
    prodCompDispatch({ type: 'FILTER_INCLUDE', payload: value })
    reset()
  }

  const onCheckFilters = (type) => {
    switch (type) {
      case 'Ecosystem':
        getEcosystems({ variables }).then((res) => {
          if (res?.data?.sbom?.filters?.ecosystems?.length > 0) {
            setCompEcosystems(['All', ...res.data.sbom.filters.ecosystems])
          }
        })
        break
      case 'Kind':
        getKinds({ variables }).then((res) => {
          if (res?.data?.sbom?.filters?.kinds?.length > 0) {
            setCompKinds(['All', ...res.data.sbom.filters.kinds])
          }
        })
        break
      case 'Supplier':
        getSuppliers({ variables }).then((res) => {
          if (res?.data?.sbom?.filters?.supplierNames?.length > 0) {
            setCompSuppliers(['All', ...res.data.sbom.filters.supplierNames])
          }
        })
        break
      case 'License':
        getLicenses({ variables }).then((res) => {
          if (res?.data?.sbom?.filters?.licenses?.length > 0) {
            setCompLicenses(['All', ...res.data.sbom.filters.licenses])
          }
        })
        break
    }
  }

  const onFilter = (type, value) => {
    switch (type) {
      case 'Ecosystem':
        prodCompDispatch({
          type: 'FILTER_ECOSYSTEM',
          payload: value
        })
        break
      case 'Kind':
        prodCompDispatch({
          type: 'FILTER_KIND',
          payload: value
        })
        break
      case 'Licenses':
        prodCompDispatch({
          type: 'FILTER_LICENSE',
          payload: value
        })
        break
      case 'Suppliers':
        prodCompDispatch({
          type: 'FILTER_SUPPLIER',
          payload: value
        })
        break
    }
    reset()
  }

  return (
    <Stack direction={'row'} alignItems={'center'} gap={1}>
      {/* ECOSYSTEM */}
      <Box width={'fit-content'}>
        <Menu closeOnSelect={false}>
          <MenuHeading
            title={'Ecosystem'}
            active={ecosystems?.length !== 0}
            onClick={() => onCheckFilters('Ecosystem')}
          />
          <LynkMenuList
            type='Ecosystem'
            value={ecosystems}
            onFilter={onFilter}
            loading={ecoLoading}
            options={compEcosystems}
          />
        </Menu>
      </Box>
      {/* KIND */}
      <Box width={'fit-content'}>
        <Menu closeOnSelect={false}>
          <MenuHeading
            title={'Type'}
            active={kinds?.length !== 0}
            onClick={() => onCheckFilters('Kind')}
          />
          <LynkMenuList
            type='Kind'
            value={kinds}
            onFilter={onFilter}
            options={compKinds}
            loading={kindLoading}
          />
        </Menu>
      </Box>
      {/* LICENSES */}
      <Box width={'fit-content'}>
        <Menu closeOnSelect={false}>
          <MenuHeading
            title={'Licenses'}
            active={licenses?.length !== 0}
            onClick={() => onCheckFilters('License')}
          />
          <LynkMenuList
            type='Licenses'
            value={licenses}
            onFilter={onFilter}
            loading={licLoading}
            options={compLicenses}
          />
        </Menu>
      </Box>
      {/* SUPPLIER */}
      <Box width={'fit-content'}>
        <Menu closeOnSelect={false} isLazy>
          <MenuHeading
            title={'Suppliers'}
            active={suppliers?.length !== 0}
            onClick={() => onCheckFilters('Supplier')}
          />
          <LynkMenuList
            type='Suppliers'
            value={suppliers}
            onFilter={onFilter}
            loading={supLoading}
            options={compSuppliers}
          />
        </Menu>
      </Box>
      {/* TYPE */}
      <Box width={'fit-content'}>
        <Menu closeOnSelect={false}>
          <MenuHeading
            title={'Visibility'}
            active={scope !== '' && scope !== 'all'}
          />
          <CustomList
            type='radio'
            options={['primary', 'internal']}
            value={scope}
            onChange={onFilterType}
          />
        </Menu>
      </Box>
      {/* INCLUDE */}
      <Box width={'fit-content'}>
        <Menu closeOnSelect={false}>
          <MenuHeading
            title={'Include'}
            active={include !== '' && include !== 'all'}
          />
          <CustomList
            type='radio'
            options={['parts']}
            value={include}
            onChange={onFilterInclude}
          />
        </Menu>
      </Box>
      {/* DIRECT */}
      <Flex align='center' gap={2}>
        <LynkSwitch
          id='isDirect'
          isChecked={direct}
          onChange={onFilterDirect}
        />
        <Text>Direct</Text>
      </Flex>
    </Stack>
  )
}

export default CompFilters

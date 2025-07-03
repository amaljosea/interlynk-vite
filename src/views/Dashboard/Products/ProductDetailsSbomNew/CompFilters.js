import { gql, useLazyQuery } from '@apollo/client'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { capitalizeFirstLetter } from 'utils'

import {
  Flex,
  Kbd,
  MenuDivider,
  MenuGroup,
  Skeleton,
  Stack,
  Text
} from '@chakra-ui/react'
import {
  Menu,
  MenuItemOption,
  MenuList,
  MenuOptionGroup
} from '@chakra-ui/react'

import LynkMenuList from 'components/Misc/LynkMenuList'
import LynkSwitch from 'components/Misc/LynkSwitch'
import MenuHeading from 'components/Misc/MenuHeading'

import { useGlobalState } from 'hooks/useGlobalState'
import { useRouteFlags } from 'hooks/useRouteFlags'
import { useThemeColor } from 'hooks/useThemeColors'

import { LuCheck, LuCircleSlash } from 'react-icons/lu'

const GetEcosystems = gql`
  query GetEcosystems(
    $productId: Uuid!
    $sbomId: Uuid!
    $includeParts: Boolean
  ) {
    sbom(projectId: $productId, sbomId: $sbomId) {
      filters {
        ecosystems(includeParts: $includeParts)
      }
    }
  }
`

const GetKinds = gql`
  query GetKinds($productId: Uuid!, $sbomId: Uuid!, $includeParts: Boolean) {
    sbom(projectId: $productId, sbomId: $sbomId) {
      filters {
        kinds(includeParts: $includeParts)
      }
    }
  }
`

const GetLicenses = gql`
  query GetLicenses($productId: Uuid!, $sbomId: Uuid!, $includeParts: Boolean) {
    sbom(projectId: $productId, sbomId: $sbomId) {
      filters {
        licenses(includeParts: $includeParts)
      }
    }
  }
`

const GetShareLynkEcosystems = gql`
  query GetEcosystems($sbomId: Uuid!, $includeParts: Boolean) {
    shareLynkQuery {
      sbom(id: $sbomId) {
        filters {
          ecosystems(includeParts: $includeParts)
        }
      }
    }
  }
`

const GetShareLynkKinds = gql`
  query GetKinds($sbomId: Uuid!, $includeParts: Boolean) {
    shareLynkQuery {
      sbom(id: $sbomId) {
        filters {
          kinds(includeParts: $includeParts)
        }
      }
    }
  }
`

const GetShareLynkLicenses = gql`
  query GetLicenses($sbomId: Uuid!, $includeParts: Boolean) {
    shareLynkQuery {
      sbom(id: $sbomId) {
        filters {
          licenses(includeParts: $includeParts)
        }
      }
    }
  }
`

const licenseTypes = [
  { label: 'All', value: 'all' },
  { label: 'SPDX Single', value: 'standard' },
  { label: 'SPDX Expression', value: 'expression' },
  { label: 'Custom', value: 'custom' },
  { label: 'No License', value: 'blank' }
]

const CompFilters = ({ reset }) => {
  const params = useParams()
  const { isCustomerView } = useRouteFlags()

  const productId = params?.productid
  const sbomId = params?.sbomid
  const { prodCompState, dispatch } = useGlobalState()
  const {
    ecosystems,
    kinds,
    licenses,
    scope,
    direct,
    exclude,
    filterMode,
    licenseType
  } = prodCompState
  const { prodCompDispatch } = dispatch

  const { inverseSecondaryBgColor } = useThemeColor(['inverseSecondaryBgColor'])

  const [compEcosystems, setCompEcosystems] = useState(['All'])
  const [compLicenses, setCompLicenses] = useState(['All'])
  const [compKinds, setCompKinds] = useState(['All'])

  // GET COMPONENT FILTER HEADS
  const [getEcosystems, { loading: ecoLoading }] = useLazyQuery(
    isCustomerView ? GetShareLynkEcosystems : GetEcosystems
  )
  const [getKinds, { loading: kindLoading }] = useLazyQuery(
    isCustomerView ? GetShareLynkKinds : GetKinds
  )
  const [getLicenses, { loading: licLoading }] = useLazyQuery(
    isCustomerView ? GetShareLynkLicenses : GetLicenses
  )

  const variables = isCustomerView
    ? { sbomId, includeParts: exclude?.includes('parts') ? false : true }
    : {
        productId,
        sbomId,
        includeParts: exclude?.includes('parts') ? false : true
      }

  const onFilterType = (value) => {
    prodCompDispatch({ type: 'FILTER_SCOPE', payload: value })
    reset()
  }

  const onFilterDirect = (e) => {
    prodCompDispatch({ type: 'FILTER_DIRECT', payload: e.target.checked })
    reset()
  }

  const onFilterExclude = (value) => {
    prodCompDispatch({ type: 'FILTER_EXCLUDE', payload: value })
    reset()
  }

  const onCheckFilters = (type) => {
    switch (type) {
      case 'Ecosystem':
        getEcosystems({ variables }).then((res) => {
          const result = isCustomerView
            ? res?.data?.shareLynkQuery?.sbom?.filters?.ecosystems
            : res?.data?.sbom?.filters?.ecosystems
          if (result?.length > 0) {
            setCompEcosystems(['All', ...result])
          }
        })
        break
      case 'Kind':
        getKinds({ variables }).then((res) => {
          const result = isCustomerView
            ? res?.data?.shareLynkQuery?.sbom?.filters?.kinds
            : res?.data?.sbom?.filters?.kinds
          if (result?.length > 0) {
            setCompKinds(['All', ...result])
          }
        })
        break
      case 'License':
        getLicenses({ variables }).then((res) => {
          const result = isCustomerView
            ? res?.data?.shareLynkQuery?.sbom?.filters?.licenses
            : res?.data?.sbom?.filters?.licenses
          if (result?.length > 0) {
            setCompLicenses(['All', ...result])
          }
        })
        break
    }
  }

  const onFilter = (type, value) => {
    switch (type) {
      case 'Ecosystem':
        prodCompDispatch({ type: 'FILTER_ECOSYSTEM', payload: value })
        break
      case 'Kind':
        prodCompDispatch({ type: 'FILTER_KIND', payload: value })
        break
      case 'Licenses':
        prodCompDispatch({ type: 'FILTER_LICENSE', payload: value })
        break
      case 'LicenseType':
        prodCompDispatch({
          type: 'FILTER_LICENSE_TYPE',
          payload: value === 'all' ? undefined : value.toUpperCase()
        })
        break
      case 'Suppliers':
        prodCompDispatch({ type: 'FILTER_SUPPLIER', payload: value })
        break
    }
    reset()
  }

  const handleMenuClick = (event, value) => {
    if (event.shiftKey) {
      prodCompDispatch({ type: 'SET_FILTER_MODE', payload: 'AND' })
      prodCompDispatch({ type: 'FILTER_SCOPE', payload: `exclude_${value}` })
    } else {
      prodCompDispatch({ type: 'SET_FILTER_MODE', payload: 'OR' })
      prodCompDispatch({ type: 'FILTER_SCOPE', payload: value })
    }
    reset()
  }

  const Info = () => (
    <Text fontWeight={'normal'}>
      Use <Kbd>⇧</Kbd> + <Kbd>click </Kbd> to exclude
    </Text>
  )

  const checkIcon =
    filterMode === 'AND' ? (
      <LuCircleSlash size={18} color={inverseSecondaryBgColor} />
    ) : (
      <LuCheck size={18} color={inverseSecondaryBgColor} />
    )

  const handleLicenseTypeChange = (value) => {
    onFilter('LicenseType', value)
  }

  const handleLicenseValuesChange = (selected) => {
    if (selected?.includes('All')) {
      onFilter('Licenses', [])
    } else {
      onFilter('Licenses', selected?.length === 0 ? [] : selected)
    }
  }

  // Helper to determine if the license filter is active
  const isLicenseFilterActive = (licenseType, licenses) => {
    return (
      (licenseType !== undefined && licenseType !== 'all') ||
      licenses?.length > 0
    )
  }

  return (
    <Flex gap={2} alignItems={'center'}>
      {/* ECOSYSTEM */}
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
      {/* KIND */}
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
      {/* LICENSES */}
      <Menu closeOnSelect={false}>
        <MenuHeading
          title='Licenses'
          active={isLicenseFilterActive(licenseType, licenses)}
          onClick={() => onCheckFilters('License')}
        />
        <MenuList
          minH={'auto'}
          maxH={'300px'}
          fontSize={'sm'}
          overflow={'hidden'}
          overflowY={'scroll'}
          minW={'250px'}
          maxW={'250px'}
        >
          <MenuOptionGroup
            title='Types'
            type='radio'
            value={licenseType ? licenseType.toLowerCase() : 'all'}
            onChange={handleLicenseTypeChange}
            textAlign={'left'}
          >
            {licenseTypes.map((type) => (
              <MenuItemOption
                key={type.value}
                value={type.value}
                fontSize={'sm'}
              >
                {type.label}
              </MenuItemOption>
            ))}
          </MenuOptionGroup>
          <MenuDivider />
          <MenuOptionGroup
            title='Values'
            type='checkbox'
            value={licenses || []}
            onChange={handleLicenseValuesChange}
            textAlign={'left'}
          >
            {licLoading ? (
              <Stack spacing={2} px={2}>
                {[1, 2, 3, 4, 5].map((item) => (
                  <Skeleton key={item} width={'230px'} height={4} />
                ))}
              </Stack>
            ) : compLicenses && compLicenses.length > 0 ? (
              compLicenses.map((license) => (
                <MenuItemOption key={license} value={license}>
                  {license.replaceAll('_', ' ')}
                </MenuItemOption>
              ))
            ) : (
              <MenuItemOption key={'All'} value={'All'}>
                All
              </MenuItemOption>
            )}
          </MenuOptionGroup>
        </MenuList>
      </Menu>
      {/* VISIBILITY */}
      <Menu closeOnSelect={false}>
        <MenuHeading
          title={'Visibility'}
          active={scope !== '' && scope !== 'all'}
        />
        <MenuList>
          <MenuOptionGroup
            value={scope}
            type={'checkbox'}
            onChange={onFilterType}
          >
            {['all', 'primary', 'internal'].map((item, index) => (
              <MenuItemOption
                key={index}
                value={item}
                fontSize={'sm'}
                icon={checkIcon}
                wordBreak={'break-all'}
                onClick={(e) => handleMenuClick(e, item)}
                isDisabled={filterMode === 'AND' && item === 'all'}
              >
                {capitalizeFirstLetter(item)}
              </MenuItemOption>
            ))}
          </MenuOptionGroup>
          <MenuDivider />
          <MenuGroup title={<Info />}></MenuGroup>
        </MenuList>
      </Menu>
      {/* EXCLUDE */}
      <Menu closeOnSelect={false}>
        <MenuHeading title={'Exclude'} active={exclude?.length !== 0} />
        <MenuList fontSize={'sm'}>
          <MenuOptionGroup
            type='checkbox'
            value={exclude}
            onChange={onFilterExclude}
          >
            <MenuItemOption value={'parts'} fontSize={'sm'}>
              Parts
            </MenuItemOption>
          </MenuOptionGroup>
        </MenuList>
      </Menu>
      {/* DIRECT */}
      <Flex align='center' gap={2}>
        <LynkSwitch
          id='isDirect'
          isChecked={direct}
          onChange={onFilterDirect}
        />
        <Text fontSize='sm'>Direct Only</Text>
      </Flex>
    </Flex>
  )
}

export default CompFilters

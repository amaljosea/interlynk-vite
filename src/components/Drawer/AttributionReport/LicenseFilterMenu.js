import { gql, useLazyQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { truncatedValue } from 'utils'

import {
  Menu,
  MenuDivider,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Skeleton,
  Stack
} from '@chakra-ui/react'

import MenuHeading from 'components/Misc/MenuHeading'

const GetLicenseFilterData = gql`
  query GetLicenseFilterData(
    $projectId: Uuid!
    $sbomId: Uuid!
    $includeParts: Boolean
  ) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      id
      filters {
        licenses(includeParts: $includeParts)
        __typename
      }
      __typename
    }
  }
`
const licenseTypes = {
  All: 'all',
  'SPDX Single': 'standard',
  'SPDX Expression': 'expression',
  Custom: 'custom',
  'No License': 'blank'
}

const generateMenuItems = (availableFilters) => {
  return Object.entries(availableFilters).map(([key, value]) => (
    <MenuItemOption key={key} value={value} fontSize={'sm'}>
      {key}
    </MenuItemOption>
  ))
}

const LicenseFilterMenu = ({ filters, setFilters }) => {
  const params = useParams()

  const [getLicenses, { data, loading }] = useLazyQuery(GetLicenseFilterData, {
    variables: {
      projectId: params?.productid,
      sbomId: params?.sbomid,
      includeParts: true
    },
    skip: !params?.productid || !params?.sbomid
  })

  const licenseOptions = data?.sbom?.filters?.licenses || []

  const allOption = 'All'
  const allLicenseOptions = [allOption, ...licenseOptions]

  const handlelicenseTypeChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      licenseType:
        value.toLowerCase() === 'all' ? undefined : value.toUpperCase()
    }))
  }

  const handleLicenseValuesChange = (selected) => {
    if (selected.includes(allOption)) {
      setFilters((prev) => ({
        ...prev,
        licenses: undefined
      }))
    } else {
      setFilters((prev) => ({
        ...prev,
        licenses: selected.length === 0 ? undefined : selected
      }))
    }
  }

  return (
    <Menu closeOnSelect={false}>
      <MenuHeading
        title='Licenses'
        active={!!filters.licenseType || filters.licenses?.length > 0}
        onClick={() => getLicenses()}
      />
      <MenuList
        minH={'auto'}
        maxH={'300px'}
        fontSize={'sm'}
        overflow={'hidden'}
        overflowY={'scroll'}
      >
        <MenuOptionGroup
          title='Types'
          type='radio'
          value={filters.licenseType?.toLowerCase() || 'all'}
          onChange={handlelicenseTypeChange}
          textAlign={'left'}
        >
          {generateMenuItems(licenseTypes)}
        </MenuOptionGroup>
        <MenuDivider />
        <MenuOptionGroup
          title='Values'
          type='checkbox'
          value={filters.licenses || []}
          onChange={handleLicenseValuesChange}
          textAlign={'left'}
        >
          {loading ? (
            <Stack spacing={2} px={2}>
              {[1, 2, 3, 4, 5].map((item) => (
                <Skeleton key={item} width={'230px'} height={4} />
              ))}
            </Stack>
          ) : (
            allLicenseOptions.map((license) => (
              <MenuItemOption key={license} value={license}>
                {truncatedValue(license?.replaceAll('_', ' '), 24)}
              </MenuItemOption>
            ))
          )}
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  )
}

export default LicenseFilterMenu

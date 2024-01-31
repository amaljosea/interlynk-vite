import {
  Box,
  Menu,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Stack
} from '@chakra-ui/react'
import FilterButton from 'components/Misc/FilterButton'
import CheckMark from 'components/Misc/CheckMark'
import { useLocation, useParams } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { GetProjectGroup } from 'graphQL/Queries'
import { filterEnvList } from 'utils'
import { useGlobalState } from 'hooks/useGlobalState'

const Filters = ({ data, refetch }) => {
  const params = useParams()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const id = queryParams.get('vulnId')

  const { totalRows, compVulnState, dispatch } = useGlobalState()
  const { searchInput, envs, statuses, versions, products } = compVulnState
  const { compVulnDispatch } = dispatch

  const product = JSON.parse(sessionStorage.getItem('product'))

  const { data: project } = useQuery(GetProjectGroup, {
    skip: params?.name ? false : true,
    variables: { id: product?.id }
  })

  const onFilterVesion = async (value) => {
    await refetch({
      id,
      first: totalRows,
      search: searchInput !== '' ? searchInput : undefined,
      projectNames: envs?.length === 0 ? undefined : envs,
      statuses: statuses?.length === 0 ? undefined : statuses,
      versions: value.includes('all') || value.length === 0 ? undefined : value
    }).then(() => compVulnDispatch({ type: 'FILTER_VERSION', payload: value }))
  }

  const onFilterEnv = async (value) => {
    await refetch({
      id,
      first: totalRows,
      search: searchInput !== '' ? searchInput : undefined,
      versions: versions?.length === 0 ? undefined : versions,
      statuses: statuses?.length === 0 ? undefined : statuses,
      projectNames:
        value.includes('all') || value.length === 0 ? undefined : value
    }).then(() => compVulnDispatch({ type: 'FILTER_ENV', payload: value }))
  }

  const onFilterStatus = async (value) => {
    await refetch({
      id,
      first: totalRows,
      search: searchInput !== '' ? searchInput : undefined,
      projectNames: envs?.length === 0 ? undefined : envs,
      versions: versions?.length === 0 ? undefined : versions,
      statuses: value.includes('all') || value.length === 0 ? undefined : value
    }).then(() => compVulnDispatch({ type: 'FILTER_STATUS', payload: value }))
  }

  const envList = project && filterEnvList(project?.projectGroup?.projects)

  return (
    <Stack direction={'row'} alignItems={'center'} gap={1}>
      {/* PRODUCTS */}
      <Box width={'fit-content'} position={'relative'} display={'none'}>
        <Menu closeOnSelect={true}>
          {products.length !== 0 && !products.includes('all') && <CheckMark />}
          <FilterButton>Product</FilterButton>
          <MenuList
            minHeight={'auto'}
            maxHeight={'300px'}
            overflow={'hidden'}
            overflowY={'scroll'}
          >
            <MenuOptionGroup
              type='checkbox'
              value={products}
              onChange={(value) =>
                setProducts(value.includes('all') ? [] : value)
              }
            >
              {[
                'all',
                'amqp-client',
                'commons-text',
                'guava',
                'h2',
                'http2-hpack',
                'http2-server'
              ].map((item, index) => (
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
      {/* VERSIONS */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {versions.length !== 0 && !versions.includes('all') && <CheckMark />}
          <FilterButton>Versions</FilterButton>
          <MenuList
            minHeight={'auto'}
            maxHeight={'300px'}
            overflow={'hidden'}
            overflowY={'scroll'}
          >
            <MenuOptionGroup
              type='checkbox'
              value={versions}
              onChange={onFilterVesion}
            >
              <MenuItemOption value={'all'} fontSize={'sm'}>
                All
              </MenuItemOption>
              {data?.sbomVersions?.length > 0 &&
                data?.sbomVersions.map((item, index) => (
                  <MenuItemOption key={index} value={item} fontSize={'sm'}>
                    {item}
                  </MenuItemOption>
                ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* ENVIRONMENT */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {envs.length !== 0 && !envs.includes('all') && <CheckMark />}
          <FilterButton>Environment</FilterButton>
          <MenuList
            minHeight={'auto'}
            maxHeight={'300px'}
            overflow={'hidden'}
            overflowY={'scroll'}
          >
            <MenuOptionGroup
              type='checkbox'
              value={envs}
              onChange={onFilterEnv}
            >
              <MenuItemOption
                value={'all'}
                fontSize={'sm'}
                textTransform={'capitalize'}
              >
                all
              </MenuItemOption>
              {params?.name
                ? envList.map((item, index) => (
                    <MenuItemOption
                      key={index}
                      value={item.name}
                      fontSize={'sm'}
                      textTransform={'capitalize'}
                    >
                      {item.name}
                    </MenuItemOption>
                  ))
                : ['default', 'development', 'production', 'others'].map(
                    (item, index) => (
                      <MenuItemOption
                        key={index}
                        value={item}
                        fontSize={'sm'}
                        textTransform={'capitalize'}
                      >
                        {item}
                      </MenuItemOption>
                    )
                  )}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* STATUSES */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={true}>
          {statuses.length !== 0 && !statuses.includes('all') && <CheckMark />}
          <FilterButton>Status</FilterButton>
          <MenuList
            minHeight={'auto'}
            maxHeight={'300px'}
            overflow={'hidden'}
            overflowY={'scroll'}
          >
            <MenuOptionGroup
              type='checkbox'
              value={statuses}
              onChange={onFilterStatus}
            >
              {[
                'all',
                'Unspecified',
                'In Triage',
                'Not Affected',
                'False Positive',
                'Affected',
                'Fixed'
              ].map((item, index) => (
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
    </Stack>
  )
}

export default Filters

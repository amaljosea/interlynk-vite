import { useQuery } from '@apollo/client'
import { useLocation, useParams } from 'react-router-dom'
import { filterEnvList } from 'utils'

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

import { GetProjectGroup } from 'graphQL/Queries'

const Filters = ({ data, refetch }) => {
  const params = useParams()
  const id = params.vulnerabilityid

  const { totalRows, compVulnState, dispatch } = useGlobalState()
  const { searchInput, envs, statuses, versions, products, vexComplete } =
    compVulnState
  const { compVulnDispatch } = dispatch

  const product = JSON.parse(localStorage.getItem('product'))

  const { data: project } = useQuery(GetProjectGroup, {
    skip: params?.name ? false : true,
    variables: { id: product?.id }
  })

  const onFilterVesion = async (value) => {
    await refetch({
      id,
      vexComplete,
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
      vexComplete,
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
      vexComplete,
      first: totalRows,
      search: searchInput !== '' ? searchInput : undefined,
      projectNames: envs?.length === 0 ? undefined : envs,
      versions: versions?.length === 0 ? undefined : versions,
      statuses: value.includes('all') || value.length === 0 ? undefined : value
    }).then(() => compVulnDispatch({ type: 'FILTER_STATUS', payload: value }))
  }

  const onFilterComplete = async (e) => {
    await refetch({
      id,
      vexComplete: e.target.checked === true ? true : undefined,
      first: totalRows,
      search: searchInput !== '' ? searchInput : undefined,
      projectNames: envs?.length === 0 ? undefined : envs,
      versions: versions?.length === 0 ? undefined : versions,
      statuses: statuses?.length === 0 ? undefined : statuses
    }).then(() =>
      compVulnDispatch({
        type: 'FILTER_COMPLETE',
        payload: vexComplete === true ? true : undefined
      })
    )
  }

  const envList = project && filterEnvList(project?.projectGroup?.projects)

  return (
    <Stack direction={'row'} alignItems={'center'} gap={2}>
      {/* PRODUCTS */}
      <Box width={'fit-content'} position={'relative'} display={'none'}>
        <Menu closeOnSelect={false}>
          {products.length !== 0 && !products.includes('all') && <CheckMark />}
          <MenuHeading title={'Product'} />
          <MenuList
            minHeight={'auto'}
            maxHeight={'300px'}
            overflow={'hidden'}
            overflowY={'scroll'}
          >
            <MenuOptionGroup
              type='checkbox'
              value={products}
              onChange={(value) => console.log(value)}
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
        <Menu closeOnSelect={false}>
          {versions.length !== 0 && !versions.includes('all') && <CheckMark />}
          <MenuHeading title={'Versions'} />
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
                    {item || 'Unversioned'}
                  </MenuItemOption>
                ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Box>
      {/* ENVIRONMENT */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={false}>
          {envs.length !== 0 && !envs.includes('all') && <CheckMark />}
          <MenuHeading title={'Environment'} />
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
      <Box width={'fit-content'} position={'relative'} hidden>
        <Menu closeOnSelect={false}>
          {statuses.length !== 0 && !statuses.includes('all') && <CheckMark />}
          <MenuHeading title={'Status'} />
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
      {/* INCOMPLETE STATUS */}
      <Flex align='center' gap={2}>
        <Switch
          id='incompleteStatus'
          isChecked={vexComplete}
          onChange={onFilterComplete}
        />
        <Text>Completed</Text>
      </Flex>
    </Stack>
  )
}

export default Filters

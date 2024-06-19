import { useQuery } from '@apollo/client'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
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

import { GetProjectGroup } from 'graphQL/Queries'

const VulnFilters = ({ setFilter, sbomVersions }) => {
  const params = useParams()
  const groupId = params.productgroupid

  const { data: project } = useQuery(GetProjectGroup, {
    skip: params?.name ? false : true,
    variables: { id: groupId }
  })

  const [versions, setVersions] = useState([])
  const onFilterVesion = async (value) => {
    const filterValue = value?.includes('all') ? undefined : value
    setVersions(value?.includes('all') ? [] : value)
    setFilter((oldFilters) => ({
      ...oldFilters,
      versions: filterValue
    }))
  }
  const [envs, setEnvs] = useState([])
  const onFilterEnv = async (value) => {
    const filterValue = value?.includes('all') ? undefined : value
    setEnvs(value?.includes('all') ? [] : value)
    setFilter((oldFilters) => ({
      ...oldFilters,
      projectNames: filterValue
    }))
  }
  const [statuses, setStatuses] = useState([])
  const onFilterStatus = async (value) => {
    const filterValue = value?.includes('all') ? undefined : value
    setStatuses(value?.includes('all') ? [] : value)
    setFilter((oldFilters) => ({
      ...oldFilters,
      statuses: filterValue
    }))
  }
  const [isComplete, setIsComplete] = useState(false)
  const onFilterComplete = async (e) => {
    setIsComplete(e.target.checked)
    setFilter((oldFilters) => ({
      ...oldFilters,
      vexComplete: e.target.checked === true ? true : undefined
    }))
  }

  const envList = project && filterEnvList(project?.projectGroup?.projects)

  return (
    <Stack direction={'row'} alignItems={'center'} gap={2}>
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
              {sbomVersions?.length > 0 &&
                sbomVersions.map((item, index) => (
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
          isChecked={isComplete}
          onChange={onFilterComplete}
        />
        <Text>Completed</Text>
      </Flex>
    </Stack>
  )
}

export default VulnFilters

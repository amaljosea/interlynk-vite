import { useState } from 'react'

import { Box, Flex, Menu, Stack, Text } from '@chakra-ui/react'

import CustomList from 'components/Misc/CustomList'
import LynkSwitch from 'components/Misc/LynkSwitch'
import MenuHeading from 'components/Misc/MenuHeading'

const VulnFilters = ({ setFilter, sbomVersions }) => {
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
      vexComplete: e?.target?.checked ? false : undefined
    }))
  }

  const versionOptions = sbomVersions?.map((item) => item)
  const envOptions = ['default', 'development', 'production', 'others']
  const statusOptions = [
    'Unspecified',
    'In Triage',
    'Not Affected',
    'Affected',
    'Fixed'
  ]

  const getStatus = (category) => {
    switch (category) {
      case 'versions':
        return versions.length !== 0 && !versions.includes('all')
      case 'envs':
        return envs.length !== 0 && !envs.includes('all')
      case 'statuses':
        return statuses.length !== 0 && !statuses.includes('all')
    }
  }

  return (
    <Stack direction={'row'} alignItems={'center'} gap={2}>
      {/* VERSIONS */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={false}>
          <MenuHeading title={'Versions'} active={getStatus('versions')} />
          {sbomVersions?.length > 0 && (
            <CustomList
              value={versions}
              options={versionOptions}
              onChange={onFilterVesion}
            />
          )}
        </Menu>
      </Box>
      {/* ENVIRONMENT */}
      <Box width={'fit-content'} position={'relative'}>
        <Menu closeOnSelect={false}>
          <MenuHeading title={'Environment'} active={getStatus('envs')} />
          <CustomList
            value={envs}
            onChange={onFilterEnv}
            options={envOptions}
          />
        </Menu>
      </Box>
      {/* STATUSES */}
      <Box width={'fit-content'} position={'relative'} hidden>
        <Menu closeOnSelect={false}>
          <MenuHeading title={'Status'} active={getStatus('statuses')} />
          <CustomList
            value={statuses}
            onChange={onFilterStatus}
            options={statusOptions}
          />
        </Menu>
      </Box>
      {/* INCOMPLETE STATUS */}
      <Flex align='center' gap={2}>
        <LynkSwitch
          id='incompleteStatus'
          isChecked={isComplete}
          onChange={onFilterComplete}
        />
        <Text>Incomplete Only</Text>
      </Flex>
    </Stack>
  )
}

export default VulnFilters

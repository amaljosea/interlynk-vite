import React from 'react'
import ExportCsv from 'views/Dashboard/Products/components/ExportCsv'

import { Flex, IconButton, Stack, Tooltip } from '@chakra-ui/react'

import RefreshBtn from 'components/Icons/RefreshBtn'

import { useHasPermission } from 'hooks/useHasPermission'

import { FaPlus } from 'react-icons/fa6'

import Filters from './Filters'

const SubHeader = ({ filters, setFilters, onOpen }) => {
  const isVuln = window.location.pathname === '/vendor/vulnerabilities'

  const editVulns = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'edit_vulnerabilities'
  })

  return (
    <Flex width={'100%'} alignItems={'center'} justifyContent={'space-between'}>
      <Stack spacing={isVuln ? 3 : 1} direction={'row'}>
        <Filters filters={filters} setFilters={setFilters} />
      </Stack>
      <Flex gap={2}>
        {/* EXPORT CSV */}
        <Tooltip label={'Add Custom Vulnerability'}>
          <IconButton
            onClick={onOpen}
            icon={<FaPlus />}
            colorScheme='blue'
            isDisabled={!editVulns}
          />
        </Tooltip>
        <ExportCsv tableType='Vulnerability View' filters={{ ...filters }} />
        <RefreshBtn />
      </Flex>
    </Flex>
  )
}

export default SubHeader

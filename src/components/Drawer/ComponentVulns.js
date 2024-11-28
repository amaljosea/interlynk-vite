import React from 'react'
import DataTable from 'react-data-table-component'
import { customStyles, statusColor } from 'utils'

import { Stack, Tag, TagLabel, Text } from '@chakra-ui/react'
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import CompInfo from 'components/Misc/CompInfo'
import Pagination from 'components/Pagination'

import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetComponentVulns } from 'graphQL/Queries'

const ComponentVulns = ({ data, isOpen, onClose }) => {
  const { headingTextColor, primaryTextColor } = useThemeColor([
    'headingTextColor',
    'primaryTextColor'
  ])

  const { nodes, paginationProps, loading } = usePaginatedQuery(
    GetComponentVulns,
    {
      skip: isOpen ? false : true,
      selector: 'component.vulns',
      variables: { id: data?.id, sbomId: data?.sbomId }
    }
  )

  const columns = [
    {
      id: 'VULN_ID',
      name: 'VULN ID',
      selector: (row) => {
        const { vuln } = row
        return (
          <Text color={primaryTextColor} my={2}>
            {vuln?.vulnId || ''}
          </Text>
        )
      },
      wrap: true
    },
    {
      id: 'VEX_STATUSES_NAME',
      name: 'STATUS',
      selector: (row) => {
        const { vexStatus } = row
        return (
          <Tag
            size='md'
            variant='solid'
            width={'160px'}
            colorScheme={statusColor(
              vexStatus ? vexStatus?.name : 'Unspecified'
            )}
          >
            <TagLabel mx={'auto'}>
              {vexStatus !== null ? vexStatus.name : 'Unspecified'}
            </TagLabel>
          </Tag>
        )
      },
      wrap: true
    }
  ]

  return (
    <Drawer
      size='md'
      isOpen={isOpen}
      placement='right'
      onClose={onClose}
      closeOnOverlayClick={false}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton mt={3} />
        <DrawerHeader borderBottomWidth='1px'>
          <Text mb={1} fontWeight={'medium'}>
            Vulnerabilities
          </Text>
          {data && <CompInfo data={data} />}
        </DrawerHeader>
        <DrawerBody>
          <Stack>
            <DataTable
              responsive
              columns={columns}
              data={nodes || []}
              customStyles={customStyles(headingTextColor)}
              progressPending={loading}
              progressComponent={<CustomLoader />}
              persistTableHead
            />
            <Pagination {...paginationProps} />
          </Stack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default ComponentVulns

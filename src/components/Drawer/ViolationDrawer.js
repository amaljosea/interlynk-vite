import DataTable from 'react-data-table-component'
import { customStyles } from 'utils'

import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Stack,
  Text,
  useColorModeValue
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import Pagination from 'components/Pagination'
import RowComponent from 'components/RowComponent'

import { usePaginatedQuery } from 'hooks/usePaginatedQuery'

import { PolicyRuleViolations } from 'graphQL/Queries'

const ViolationDrawer = ({ policy, activeRow, sbomId, isOpen, onClose }) => {
  const { subject, category, name, operatorWording, value } = activeRow || null
  const headColor = useColorModeValue('#4A5568', '#CBD5E0')
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')

  const { nodes, paginationProps, loading } = usePaginatedQuery(
    PolicyRuleViolations,
    {
      skip: activeRow?.id ? false : true,
      selector: 'policyRuleViolations',
      variables: {
        sbomId,
        policyRuleId: activeRow?.id
      }
    }
  )

  const columns = [
    {
      id: 'COMPONENT',
      name: 'COMPONENT',
      selector: (row) => {
        const { violation, component } = row || ''
        const { primaryComponent } = violation || ''
        return (
          <Box my={2}>
            <RowComponent content={component || primaryComponent || ''} />
          </Box>
        )
      },
      wrap: true
    },
    {
      id: 'VERSION',
      name: 'VERSION',
      selector: (row) => {
        const { violation, component } = row
        return (
          <Text color={textColor} my={2}>
            {component?.version || violation?.primaryComponent?.version || ''}
          </Text>
        )
      },
      wrap: true
    },
    {
      id: 'LICENSE',
      name: 'LICENSE',
      selector: (row) => {
        const { component } = row
        return (
          <Text color={textColor} my={2}>
            {component?.licensesExp || ''}
          </Text>
        )
      },
      omit: category === 'license' ? false : true,
      wrap: true
    },
    {
      id: 'VULN_ID',
      name: 'VULN ID',
      selector: (row) => {
        const { violation } = row
        return (
          <Text color={textColor} my={2}>
            {violation?.vuln?.vulnId || ''}
          </Text>
        )
      },
      wrap: true,
      omit: category === 'vulnerability' ? false : true
    }
  ]

  return (
    <Drawer size={'lg'} isOpen={isOpen} placement='right' onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerBody>
          <Flex
            height={'100%'}
            flexDir={'column'}
            justifyContent={'space-between'}
            width={'100%'}
            pos={'relative'}
            gap={2}
          >
            <Stack spacing={2} direction={'column'}>
              <Text>
                <strong>Policy:</strong> {policy}
              </Text>
              <Text>
                <strong>Condition:</strong>{' '}
                <span style={{ textTransform: 'capitalize' }}>{category}</span>{' '}
                {name} {operatorWording} {value}
              </Text>
              {subject === 'VERSION_AUTHOR' && (
                <Text>
                  <strong>Value:</strong>{' '}
                  <span style={{ textTransform: 'capitalize' }}>{name}</span> -{' '}
                  {value}
                </Text>
              )}
              {subject === 'SBOM_SUPPLIER' && (
                <Text>
                  <strong>Value:</strong>{' '}
                  <span style={{ textTransform: 'capitalize' }}>{name}</span> -{' '}
                  {value}
                </Text>
              )}
              {(subject === 'VERSION_PRIMARY' ||
                subject === 'SBOM_PRIMARY_COMPONENT_RELATIONSHIPS') &&
                nodes?.length > 0 && (
                  <Text>
                    <strong>Value:</strong>{' '}
                    <span style={{ textTransform: 'capitalize' }}>
                      {nodes[0].violation?.primaryComponent?.name}
                    </span>{' '}
                    - {nodes[0].violation?.primaryComponent?.version}
                  </Text>
                )}
              <Text
                fontWeight={'bold'}
                fontSize={'md'}
                hidden={category === 'version'}
              >
                Violations List
              </Text>
            </Stack>
            <Box
              height={'85%'}
              overflowY={'scroll'}
              hidden={category === 'version'}
            >
              <DataTable
                responsive
                columns={columns}
                data={nodes || []}
                customStyles={customStyles(headColor)}
                progressPending={loading}
                progressComponent={<CustomLoader />}
                persistTableHead
              />
            </Box>
            <Box hidden={category === 'version'}>
              <Pagination {...paginationProps} />
            </Box>
          </Flex>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default ViolationDrawer

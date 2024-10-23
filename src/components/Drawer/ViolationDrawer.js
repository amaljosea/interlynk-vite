import DataTable from 'react-data-table-component'
import { customStyles, truncatedValue } from 'utils'

import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay
} from '@chakra-ui/react'
import { Box, Stack, Text } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import Pagination from 'components/Pagination'
import RowComponent from 'components/RowComponent'

import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import { useThemeColor } from 'hooks/useThemeColors'

import { PolicyRuleViolations } from 'graphQL/Queries'

const ViolationDrawer = ({ policy, activeRow, sbomId, isOpen, onClose }) => {
  const { subject, category, name, operatorWording, value } = activeRow || null
  const { headingTextColor, primaryTextColor } = useThemeColor([
    'headingTextColor',
    'primaryTextColor'
  ])

  const { nodes, paginationProps, loading } = usePaginatedQuery(
    PolicyRuleViolations,
    {
      skip: activeRow?.id ? false : true,
      selector: 'policyRuleViolations',
      variables: { sbomId, policyRuleId: activeRow?.id }
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
          <Text color={primaryTextColor} my={2}>
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
          <Text color={primaryTextColor} my={2}>
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
          <Text color={primaryTextColor} my={2}>
            {violation?.vuln?.vulnId || ''}
          </Text>
        )
      },
      wrap: true,
      omit: category === 'vulnerability' ? false : true
    }
  ]

  const supplierExists = subject === 'SBOM_SUPPLIER' && nodes?.length > 0
  const authorExists = subject === 'VERSION_AUTHOR' && nodes?.length > 0

  return (
    <Drawer size={'lg'} isOpen={isOpen} placement='right' onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton mt={1} />
        <DrawerHeader borderBottomWidth='1px'>Violations</DrawerHeader>
        <DrawerBody py={4}>
          <Stack spacing={2} direction={'column'}>
            <Text>
              <strong>Policy:</strong> {truncatedValue(policy, 30)}
            </Text>
            <Text>
              <strong>Condition:</strong>{' '}
              <span style={{ textTransform: 'capitalize' }}>{category}</span>{' '}
              {name} {operatorWording} {value}
            </Text>
            {supplierExists &&
              nodes?.map((item, index) => (
                <Stack key={index} spacing={2}>
                  <Text fontWeight={'semibold'}>Value:</Text>
                  {item?.violation?.suppliers?.map((item, idx) => (
                    <Text key={idx}>
                      {idx + 1}:{' '}
                      {`${item?.contactName || ''} (${item?.contactEmail || ''}) - ${item?.name || ''}`}
                    </Text>
                  ))}
                </Stack>
              ))}
            {authorExists &&
              nodes?.map((item, index) => (
                <Stack key={index} spacing={2}>
                  <Text fontWeight={'semibold'}>Value:</Text>
                  {item?.violation?.authors?.map((item, idx) => (
                    <Text key={idx}>
                      {idx + 1}: {`${item?.name || ''} ${item?.email || ''}`}
                    </Text>
                  ))}
                </Stack>
              ))}
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
              hidden={category === 'version'}
              sx={{ fontSize: 'md', fontWeight: 'bold' }}
            >
              Violations List
            </Text>
          </Stack>
          <Box overflowY={'scroll'} hidden={category === 'version'}>
            <DataTable
              responsive
              columns={columns}
              data={nodes || []}
              customStyles={customStyles(headingTextColor)}
              progressPending={loading}
              progressComponent={<CustomLoader />}
              persistTableHead
            />
          </Box>
          <Box hidden={category === 'version'}>
            <Pagination {...paginationProps} />
          </Box>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default ViolationDrawer

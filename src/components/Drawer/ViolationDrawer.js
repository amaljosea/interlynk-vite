import DataTable from 'react-data-table-component'
import { truncatedValue } from 'utils'
import { customStyles } from 'utils/styleUtils'

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
  const { headingTextColor, primaryTextColor, secondaryTextColor } =
    useThemeColor([
      'headingTextColor',
      'primaryTextColor',
      'secondaryTextColor'
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
      compact: true,
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
      style: { padding: 0, margin: 0 },
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
          <Stack spacing={3} direction={'column'}>
            <Stack spacing={0}>
              <Text color={secondaryTextColor}>Policy:</Text>
              <Text textTransform={'capitalize'}>
                {truncatedValue(policy, 30)}
              </Text>
            </Stack>
            <Stack spacing={0}>
              <Text color={secondaryTextColor}>Condition:</Text>
              <Text textTransform={'capitalize'}>
                {category} {name} {operatorWording} {value}
              </Text>
            </Stack>
            {supplierExists &&
              nodes?.map((item, index) => (
                <Stack key={index} spacing={0}>
                  <Text color={secondaryTextColor}>Value:</Text>
                  {item?.violation?.suppliers?.length > 0 ? (
                    item?.violation?.suppliers?.map((item, idx) => (
                      <Text key={idx}>
                        {`${item?.contactName || ''} (${item?.contactEmail || ''}) - ${item?.name || ''}`}
                      </Text>
                    ))
                  ) : (
                    <Text>Not Available</Text>
                  )}
                </Stack>
              ))}
            {authorExists &&
              nodes?.map((item, index) => (
                <Stack key={index} spacing={0}>
                  <Text color={secondaryTextColor}>Value:</Text>
                  {item?.violation?.authors?.length > 0 ? (
                    item?.violation?.authors?.map((item, idx) => (
                      <Text key={idx}>
                        {idx + 1}: {`${item?.name || ''} ${item?.email || ''}`}
                      </Text>
                    ))
                  ) : (
                    <Text>Not Available</Text>
                  )}
                </Stack>
              ))}
            {(subject === 'VERSION_PRIMARY' ||
              subject === 'SBOM_PRIMARY_COMPONENT_RELATIONSHIPS') &&
              nodes?.length > 0 && (
                <Stack spacing={0}>
                  <Text fontWeight={'semibold'}>Value:</Text>
                  {nodes[0].violation?.primaryComponent?.name ? (
                    <Text style={{ textTransform: 'capitalize' }}>
                      {nodes[0].violation?.primaryComponent?.name}-{' '}
                      {nodes[0].violation?.primaryComponent?.version}
                    </Text>
                  ) : (
                    <Text>Not Available</Text>
                  )}
                </Stack>
              )}
            <Text color={secondaryTextColor} hidden={category === 'version'}>
              Violations List:
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
          <Box hidden={category === 'version' || nodes?.length === 0}>
            <Pagination {...paginationProps} />
          </Box>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default ViolationDrawer

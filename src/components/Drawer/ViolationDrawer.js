import { useCallback, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { customStyles } from 'utils'

import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Stack,
  Text
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import Pagination from 'components/Pagination'

const ViolationDrawer = ({
  policy,
  activeRow,
  data,
  sbomId,
  isOpen,
  onClose,
  refetch
}) => {
  const { id, subject, category, name, operatorWording, value } =
    activeRow || null
  const paginationSizes = [25, 50, 100]
  const [currentPage, setCurrentPage] = useState(1)
  const [totalRows, setTotalRows] = useState(paginationSizes[0])
  const [isPrevActive, setIsPrevActive] = useState(false)
  const [isNextActive, setIsNextActive] = useState(false)

  const setPaginationControl = (data) => {
    setIsPrevActive(data?.pageInfo?.hasPreviousPage)
    setIsNextActive(data?.pageInfo?.hasNextPage)
  }

  const disablePaginationControl = () => {
    setIsPrevActive(false)
    setIsNextActive(false)
  }

  // SET ROW LENGTH
  const handleSetRow = useCallback(
    async (e) => {
      disablePaginationControl()
      setTotalRows(Number(e.target.value))
      await refetch({
        variables: {
          sbomId,
          policyRuleId: id,
          first: Number(e.target.value)
        }
      }).then((res) => {
        if (res?.data) {
          setPaginationControl(res.data.policyRuleViolations)
          setCurrentPage(1)
        }
      })
    },
    [id, refetch, sbomId]
  )

  const handlePreviousPage = useCallback(async () => {
    disablePaginationControl()
    setCurrentPage(currentPage - 1)
    await refetch({
      variables: {
        sbomId: sbomId,
        policyRuleId: id,
        last: totalRows,
        before: data?.pageInfo?.startCursor
      }
    }).then((res) => {
      if (res?.data) {
        setPaginationControl(res.data.policyRuleViolations)
      }
    })
  }, [currentPage, data?.pageInfo?.startCursor, id, refetch, sbomId, totalRows])

  const handleNextPage = useCallback(async () => {
    disablePaginationControl()
    setCurrentPage(currentPage + 1)
    await refetch({
      variables: {
        sbomId: sbomId,
        policyRuleId: id,
        first: totalRows,
        after: data?.pageInfo?.endCursor
      }
    }).then((res) => {
      if (res?.data) {
        setPaginationControl(res.data.policyRuleViolations)
      }
    })
  }, [currentPage, data?.pageInfo?.endCursor, id, refetch, sbomId, totalRows])

  const columns = [
    {
      id: 'COMPONENT',
      name: 'COMPONENT',
      selector: (row) => {
        const { violation, component } = row
        return (
          <Text my={2}>
            {component?.name || violation?.primaryComponent?.name || ''}
          </Text>
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
          <Text my={2}>
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
        return <Text my={2}>{component?.licensesExp || ''}</Text>
      },
      omit: category === 'license' ? false : true,
      wrap: true
    },
    {
      id: 'VULN_ID',
      name: 'VULN ID',
      selector: (row) => {
        const { violation } = row
        return <Text my={2}>{violation?.vuln?.vulnId || ''}</Text>
      },
      wrap: true,
      omit: category === 'vulnerability' ? false : true
    }
  ]

  useEffect(() => {
    if (data) {
      setIsPrevActive(data?.pageInfo?.hasPreviousPage)
      setIsNextActive(data?.pageInfo?.hasNextPage)
    }
  }, [data])

  return (
    <Drawer size={'lg'} isOpen={isOpen} placement='right' onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>
          {/* <Text width={'90%'} mr={'auto'} wordBreak={'break-all'}>
            {policy?.length > 25 ? `${policy?.substring(0, 25)}...` : policy}
          </Text> */}
        </DrawerHeader>
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
                data?.nodes?.length > 0 && (
                  <Text>
                    <strong>Value:</strong>{' '}
                    <span style={{ textTransform: 'capitalize' }}>
                      {data.nodes[0].violation?.primaryComponent?.name}
                    </span>{' '}
                    - {data.nodes[0].violation?.primaryComponent?.version}
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
                data={data?.nodes || []}
                customStyles={customStyles}
                progressPending={data ? false : true}
                progressComponent={<CustomLoader />}
                persistTableHead
              />
            </Box>
            <Box bg='white' hidden={category === 'version'}>
              {data?.pageInfo && (
                <Pagination
                  paginationSizes={paginationSizes}
                  pageIndex={currentPage}
                  totalRows={totalRows}
                  totalCount={data?.totalCount}
                  onPreviousPage={handlePreviousPage}
                  onNextPage={handleNextPage}
                  onSetRow={handleSetRow}
                  hasNextPage={isNextActive}
                  hasPreviousPage={isPrevActive}
                />
              )}
            </Box>
          </Flex>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default ViolationDrawer

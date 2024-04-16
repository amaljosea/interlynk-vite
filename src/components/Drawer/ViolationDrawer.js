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
  Tag,
  Text
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import Pagination from 'components/Pagination'

const ViolationDrawer = ({
  activeRow,
  data,
  sbomId,
  isOpen,
  onClose,
  refetch
}) => {
  const { id, category, name, operatorWording, value } = activeRow || null
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
        const { violation } = row
        return <Text my={2}>{violation?.name || ''}</Text>
      },
      width: '350px',
      wrap: true,
      omit: category === 'license' || category === 'component' ? false : true
    },
    {
      id: 'VERSION',
      name: 'VERSION',
      selector: (row) => {
        const { violation } = row
        return <Text my={2}>{violation?.version || ''}</Text>
      },
      width: '200px',
      wrap: true,
      omit: category === 'license' || category === 'component' ? false : true
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
    <Drawer size='lg' isOpen={isOpen} placement='right' onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Violations List</DrawerHeader>
        <DrawerBody>
          <Flex
            height={'100%'}
            flexDir={'column'}
            width={'100%'}
            pos={'relative'}
            gap={4}
          >
            <Flex flexWrap={'wrap'} alignItems={'center'} gap={2}>
              <Tag
                colorScheme='blue'
                variant='outline'
                textTransform={'capitalize'}
              >
                {category}
              </Tag>
              <Tag variant='solid' colorScheme='blue'>
                {name}
              </Tag>
              <Tag colorScheme={'blue'} textTransform={'capitalize'}>
                {operatorWording}
              </Tag>
              <Tag
                variant='solid'
                hidden={value ? false : true}
                colorScheme={'cyan'}
                textTransform={'capitalize'}
              >
                {value}
              </Tag>
            </Flex>
            <Box height={'85%'} overflowY={'scroll'}>
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
            <Box position={'absolute'} left={0} right={0} bottom={2}>
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

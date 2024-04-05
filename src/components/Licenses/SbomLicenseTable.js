import { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { customStyles } from 'utils'

import { RepeatIcon } from '@chakra-ui/icons'
import {
  Box,
  Flex,
  IconButton,
  Tag,
  TagLabel,
  Text,
  Tooltip
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'

import Pagination from '../Pagination'

const SbomLicenseTable = ({ data, refetch }) => {
  const licenses = data?.nodes

  // PAGINATION
  const paginationSizes = [25, 50, 100]

  const [currentPage, setCurrentPage] = useState(1)
  const [totalRows, setTotalRows] = useState(paginationSizes[0])
  const [isPrevActive, setIsPrevActive] = useState(false)
  const [isNextActive, setIsNextActive] = useState(false)

  useEffect(() => {
    if (data) {
      setIsPrevActive(data?.pageInfo?.hasPreviousPage)
      setIsNextActive(data?.pageInfo?.hasNextPage)
    }
  }, [data])

  const setPaginationControl = (data) => {
    setIsPrevActive(data.sbom?.componentLicenses?.pageInfo?.hasPreviousPage)
    setIsNextActive(data.sbom?.componentLicenses?.pageInfo?.hasNextPage)
  }

  const disablePaginationControl = () => {
    setIsPrevActive(false)
    setIsNextActive(false)
  }

  const handlePreviousPage = useCallback(async () => {
    disablePaginationControl()
    setCurrentPage(currentPage - 1)

    await refetch({
      first: undefined,
      last: totalRows,
      after: undefined,
      before: data.pageInfo.startCursor
    }).then((res) => {
      if (res.data) {
        setPaginationControl(res.data)
      }
    })
  }, [refetch, totalRows, data, currentPage])

  const handleSetRow = useCallback(
    async (e) => {
      const newTotalRows = Number(e.target.value)
      setCurrentPage(1)
      setTotalRows(newTotalRows)
      disablePaginationControl()
      await refetch({
        first: newTotalRows,
        last: undefined,
        after: undefined,
        before: undefined
      }).then((res) => {
        if (res.data) {
          setPaginationControl(res.data)
        }
      })
    },
    [refetch, setTotalRows]
  )

  const handleNextPage = useCallback(async () => {
    disablePaginationControl()
    setCurrentPage(currentPage + 1)

    await refetch({
      first: totalRows,
      last: undefined,
      after: data.pageInfo.endCursor,
      before: undefined
    }).then((res) => {
      if (res.data) {
        setPaginationControl(res.data)
      }
    })
  }, [refetch, totalRows, data, currentPage])

  // PAGINATION END

  const handleRefresh = useCallback(async () => {
    disablePaginationControl()
    await refetch({}).then((res) => {
      if (res.data) {
        setPaginationControl(res.data)
      }
    })
  })

  const subHeaderComponent = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent='flex-end'
        gap={3}
      >
        <Tooltip label='Refresh'>
          <IconButton
            onClick={handleRefresh}
            colorScheme='blue'
            icon={<RepeatIcon />}
          ></IconButton>
        </Tooltip>
      </Flex>
    )
  })

  // COLUMNS
  const columns = [
    // LICENSE EXPRESSION
    {
      id: 'LICENSE_EXPRESSION',
      name: 'LICENSE EXPRESSION',
      width: '20%',
      wrap: true,
      selector: ({ licenseExpression }) => {
        return (
          <Flex direction='row' alignItems={'center'} gap={2}>
            <Text my={3} fontWeight={'medium'}>
              {licenseExpression || 'Not Available'}
            </Text>
          </Flex>
        )
      }
    },
    // COMPONENTS
    {
      id: 'COMPONENTS',
      name: 'COMPONENTS',
      width: '60%',
      wrap: true,
      selector: ({ components }) => {
        let sortedComponents = [...components]
        sortedComponents.sort((a, b) => a.name.localeCompare(b.name))

        return (
          <Flex
            direction='row'
            py={5}
            alignItems={'center'}
            wrap='wrap'
            gap={2}
            onClick={(e) => {
              e.currentTarget.parentElement.click()
            }}
          >
            <Tag variant='subtle'>
              <TagLabel my={1} style={{ whiteSpace: 'normal' }}>
                {sortedComponents[0].name}
              </TagLabel>
            </Tag>
            <Text>
              {sortedComponents.length > 1
                ? `+${sortedComponents.length - 1} more`
                : ''}
            </Text>
          </Flex>
        )
      }
    },
    // STATUS
    {
      id: 'STATUS',
      name: 'STATUS',
      wrap: true,
      sortable: true,
      width: '20%',
      selector: ({ derivedState }) => {
        derivedState = derivedState?.toLowerCase() || 'Not Available'
        return (
          <Tag
            size='md'
            variant='solid'
            colorScheme={
              derivedState === 'approved'
                ? 'green'
                : derivedState === 'rejected'
                  ? 'red'
                  : derivedState === 'unspecified'
                    ? 'orange'
                    : 'blue'
            }
            width={'110px'}
          >
            <TagLabel mx={'auto'} textTransform={'capitalize'}>
              {derivedState}
            </TagLabel>
          </Tag>
        )
      }
    }
  ]

  const ExpandedRow = ({ data: { components } }) => {
    let sortedComponents = [...components]
    sortedComponents.sort((a, b) => a.name.localeCompare(b.name))

    return (
      <Box
        width={'100%'}
        p={5}
        boxShadow='inset 0px -5px 5px rgba(0, 0, 0, 0.08), inset 0px 5px 5px rgba(0, 0, 0, 0.08)'
      >
        <Flex
          direction='row'
          py={5}
          alignItems={'center'}
          wrap='wrap'
          gap={2}
          marginLeft={'350px'}
        >
          {sortedComponents?.map((component, index) => (
            <Tag variant='subtle' key={index}>
              <TagLabel my={1} style={{ whiteSpace: 'normal' }}>
                {component.name}
              </TagLabel>
            </Tag>
          ))}
        </Flex>
      </Box>
    )
  }

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={licenses}
          customStyles={customStyles}
          defaultSortAsc={false}
          defaultSortFieldId={'UPDATED_AT'}
          progressPending={data ? false : true}
          progressComponent={<CustomLoader />}
          subHeader
          subHeaderComponent={subHeaderComponent}
          responsive
          persistTableHead
          expandableRows
          expandOnRowClicked
          expandableRowsComponent={ExpandedRow}
        />
      </Flex>

      {/* PAGINATION */}
      {data?.pageInfo && (
        <Pagination
          paginationSizes={paginationSizes}
          pageIndex={currentPage}
          totalRows={totalRows}
          totalCount={data.totalCount}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
          onSetRow={handleSetRow}
          hasNextPage={isNextActive}
          hasPreviousPage={isPrevActive}
        />
      )}
    </>
  )
}

export default SbomLicenseTable

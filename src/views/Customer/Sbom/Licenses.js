import { useQuery } from '@apollo/client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useLocation, useParams } from 'react-router-dom'
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

import Card from 'components/Card/Card'
import CustomLoader from 'components/CustomLoader'
import Pagination from 'components/Pagination'

import { GetShareLicensesTable } from 'graphQL/Queries'

const Licenses = () => {
  const location = useLocation()
  const params = useParams()
  const sbomId = params.sbomid
  const queryParams = new URLSearchParams(location.search)
  const activeTab = queryParams.get('tab')

  // PAGINATION
  const paginationSizes = [25, 50, 100]
  const [currentPage, setCurrentPage] = useState(1)
  const [totalRows, setTotalRows] = useState(paginationSizes[0])
  const [isPrevActive, setIsPrevActive] = useState(false)
  const [isNextActive, setIsNextActive] = useState(false)

  const { data, refetch, error } = useQuery(GetShareLicensesTable, {
    skip: activeTab === 'licenses' ? false : true,
    variables: {
      sbomId: sbomId,
      first: totalRows
    }
  })

  const { componentLicenses } = data?.shareLynkQuery?.sbom || ''

  useEffect(() => {
    if (componentLicenses) {
      setIsPrevActive(componentLicenses?.pageInfo?.hasPreviousPage)
      setIsNextActive(componentLicenses?.pageInfo?.hasNextPage)
    }
  }, [componentLicenses])

  const setPaginationControl = (data) => {
    setIsPrevActive(
      data?.shareLynkQuery?.sbom?.componentLicenses?.pageInfo?.hasPreviousPage
    )
    setIsNextActive(
      data?.shareLynkQuery?.sbom?.componentLicenses?.pageInfo?.hasNextPage
    )
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
      before: componentLicenses?.pageInfo?.startCursor
    }).then((res) => {
      if (res.data) {
        setPaginationControl(res.data)
      }
    })
  }, [currentPage, refetch, totalRows, componentLicenses])

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
      after: componentLicenses?.pageInfo?.endCursor,
      before: undefined
    }).then((res) => {
      if (res.data) {
        setPaginationControl(res.data)
      }
    })
  }, [currentPage, refetch, totalRows, componentLicenses])

  // PAGINATION END

  const handleRefresh = useCallback(async () => {
    disablePaginationControl()
    await refetch({}).then((res) => {
      if (res.data) {
        setPaginationControl(res.data)
      }
    })
  }, [refetch])

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
  }, [handleRefresh])

  // COLUMNS
  const columns = [
    // LICENSE EXPRESSION
    {
      id: 'LICENSE_EXPRESSION',
      name: 'LICENSE EXPRESSION',
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
        <Flex direction='row' py={5} alignItems={'center'} wrap='wrap' gap={2}>
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

  if (error) {
    return (
      <Card>
        <Text>Something went wrong</Text>
      </Card>
    )
  }

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={componentLicenses?.nodes}
          customStyles={customStyles}
          defaultSortAsc={false}
          defaultSortFieldId={'UPDATED_AT'}
          progressPending={componentLicenses ? false : true}
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
      {componentLicenses?.pageInfo && (
        <Pagination
          paginationSizes={paginationSizes}
          pageIndex={currentPage}
          totalRows={totalRows}
          totalCount={componentLicenses?.totalCount}
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

export default Licenses

import { useCallback, useMemo } from 'react'
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
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import Pagination from 'components/Pagination'

import { usePaginatatedQuery } from 'hooks/usePaginatatedQuery'

import { GetSbomLicensesTable } from 'graphQL/Queries'

const Licenses = () => {
  const location = useLocation()
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid
  const queryParams = new URLSearchParams(location.search)
  const activeTab = queryParams.get('tab')

  const headColor = useColorModeValue('#4A5568', '#CBD5E0')
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')

  const { nodes, paginationProps, loading, refetch } = usePaginatatedQuery(
    GetSbomLicensesTable,
    {
      skip: activeTab === 'licenses' ? false : true,
      selector: 'sbom.componentLicenses',
      variables: {
        projectId: productId,
        sbomId: sbomId
      }
    }
  )

  const handleRefresh = useCallback(() => {
    refetch()
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
      width: '20%',
      wrap: true,
      selector: ({ licenseExpression }) => {
        return (
          <Flex direction='row' alignItems={'center'} gap={2}>
            <Text color={textColor} my={3} fontWeight={'medium'}>
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
      width: '50%',
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
            <Text color={textColor}>
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
      },
      right: 'true'
    }
  ]

  const ExpandedRow = ({ data: { components } }) => {
    let sortedComponents = [...components]
    sortedComponents.sort((a, b) => a.name.localeCompare(b.name))

    return (
      <Box
        p={5}
        width={'100%'}
        boxShadow='inset 0px -5px 5px rgba(0, 0, 0, 0.08), inset 0px 5px 5px rgba(0, 0, 0, 0.08)'
      >
        <Flex direction='row' py={5} alignItems={'center'} wrap='wrap' gap={2}>
          {sortedComponents?.map((component, index) => (
            <Tag key={index}>{component?.name}</Tag>
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
          data={nodes}
          customStyles={customStyles(headColor)}
          defaultSortAsc={false}
          defaultSortFieldId={'UPDATED_AT'}
          progressPending={loading}
          progressComponent={<CustomLoader />}
          subHeader
          subHeaderComponent={subHeaderComponent}
          responsive
          persistTableHead
          expandableRows
          expandOnRowClicked
          expandableRowsComponent={ExpandedRow}
        />
        {/* PAGINATION */}
        <Pagination {...paginationProps} />
      </Flex>
    </>
  )
}

export default Licenses

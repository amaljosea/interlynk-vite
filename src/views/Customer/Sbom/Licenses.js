import { useMemo } from 'react'
import DataTable from 'react-data-table-component'
import { useLocation, useParams } from 'react-router-dom'
import { customStyles } from 'utils'

import {
  Box,
  Flex,
  Tag,
  TagLabel,
  Text,
  useColorModeValue
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CustomLoader from 'components/CustomLoader'
import RefreshBtn from 'components/Icons/RefreshBtn'
import Pagination from 'components/Pagination'

import { usePaginatedQuery } from 'hooks/usePaginatedQuery'

import { GetShareLicensesTable } from 'graphQL/Queries'

const Licenses = () => {
  const location = useLocation()
  const params = useParams()
  const sbomId = params.sbomid
  const queryParams = new URLSearchParams(location.search)
  const activeTab = queryParams.get('tab')

  const headColor = useColorModeValue('#4A5568', '#CBD5E0')
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')

  const { nodes, loading, error, paginationProps } = usePaginatedQuery(
    GetShareLicensesTable,
    {
      skip: activeTab !== 'licenses',
      selector: 'shareLynkQuery.sbom.componentLicenses',
      variables: { sbomId }
    }
  )

  const subHeaderComponent = useMemo(() => (
    <Flex
      width={'100%'}
      alignItems={'center'}
      justifyContent='flex-end'
      gap={3}
    >
      <RefreshBtn />
    </Flex>
  ))

  const columns = [
    {
      id: 'LICENSE_EXPRESSION',
      name: 'LICENSE EXPRESSION',
      wrap: true,
      selector: ({ licenseExpression }) => (
        <Flex direction='row' alignItems={'center'} gap={2}>
          <Text my={3} fontWeight={'medium'} color={textColor}>
            {licenseExpression || 'Not Available'}
          </Text>
        </Flex>
      )
    },
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
            <Text color={textColor}>
              {sortedComponents.length > 1
                ? `+${sortedComponents.length - 1} more`
                : ''}
            </Text>
          </Flex>
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
        <Text color={textColor}>Something went wrong</Text>
      </Card>
    )
  }

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          columns={columns}
          data={nodes || []}
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
      </Flex>

      <Pagination {...paginationProps} />
    </>
  )
}

export default Licenses

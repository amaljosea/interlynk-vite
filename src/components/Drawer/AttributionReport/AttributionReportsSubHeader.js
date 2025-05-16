import { gql } from '@apollo/client'
import { client } from 'context/ApolloWrapper'
import React, { useMemo, useState } from 'react'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import {
  Box,
  Button,
  Flex,
  Menu,
  Radio,
  RadioGroup,
  Stack
} from '@chakra-ui/react'

import CustomList from 'components/Misc/CustomList'
import MenuHeading from 'components/Misc/MenuHeading'

import useCustomToast from 'hooks/useCustomToast'

import { downloadAttributionHtml } from './AttributionHtml'
import { generateAttributionPdf } from './generateAttributionPdf'

export const GetLicensesTable = gql`
  query GetLicensesTable(
    $first: Int
    $after: String
    $last: Int
    $before: String
    $status: [String!]
    $search: String
    $licenseType: [String!]
    $orderBy: OrganizationLicenseOrderByInput
  ) {
    organization {
      licenses(
        first: $first
        last: $last
        after: $after
        before: $before
        status: $status
        search: $search
        licenseType: $licenseType
        orderBy: $orderBy
      ) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
          hasPreviousPage
          startCursor
        }
        nodes {
          id
          content {
            __typename
            ... on License {
              id
              name
              shortId
              text
              comment
              url
            }
            ... on LicenseCustom {
              id
              name
              text
              url
              comment
              spdxId
            }
          }
          __typename
        }
      }
    }
  }
`

const AttributionReportsSubHeader = ({
  compSearch,
  handleSearch,
  handleClear,
  onSearchInputChange,
  setInternal,
  internal,
  query,
  variables,
  selectedRowData,
  productName,
  productVersion
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [downloadType, setDownloadType] = useState('pdf')
  const { showToast } = useCustomToast()

  return useMemo(() => {
    const handleInternalChange = (value) => {
      if (value === 'All except internal') {
        setInternal(true)
      } else {
        setInternal(false)
      }
    }

    const handleDownload = async () => {
      setIsLoading(true)

      try {
        let items = []

        if (selectedRowData.length > 0) {
          items = [...selectedRowData].sort(
            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
          )
        } else {
          // Fetch all components
          let allComponents = []
          let hasNext = true
          let cursor = null

          while (hasNext) {
            const res = await client.query({
              query,
              variables: { ...variables, after: cursor }
            })
            const nodes = res.data.sbom.components.nodes || []
            const pageInfo = res.data.sbom.components.pageInfo

            allComponents.push(...nodes)
            cursor = pageInfo.endCursor
            hasNext = pageInfo.hasNextPage
          }
          items = allComponents
        }

        // Per-component license text lookup
        const finalItems = await Promise.all(
          items.map(async (c) => {
            if (!c.licensesExp) {
              return { ...c, licenseText: '' }
            }
            try {
              const { data } = await client.query({
                query: GetLicensesTable,
                variables: { search: c.licensesExp, first: 1 }
              })
              const licNode = data.organization.licenses.nodes[0]?.content

              return { ...c, licenseText: licNode?.text || '' }
            } catch (err) {
              return { ...c, licenseText: '' }
            }
          })
        )

        // Trigger download
        if (downloadType === 'pdf') {
          await generateAttributionPdf(finalItems, productName, productVersion)
        } else {
          downloadAttributionHtml(finalItems, productName, productVersion)
        }
      } catch (error) {
        showToast({
          description: `Error downloading Attribution ${downloadType.toUpperCase()}. Please try again later.`,
          status: 'error'
        })
      } finally {
        setIsLoading(false)
      }
    }

    return (
      <Flex w={'100%'} justifyContent={'space-between'}>
        <Flex gap={4} flexWrap={'wrap'}>
          {/* SEARCH */}
          <SearchFilter
            id='attribution'
            filterText={compSearch}
            onFilter={handleSearch}
            onClear={handleClear}
            onChange={onSearchInputChange}
          />

          {/* FILTER */}
          <Box width={'fit-content'}>
            <Menu closeOnSelect={false}>
              <MenuHeading title={'Visibility'} active={internal !== false} />
              <CustomList
                type='radio'
                options={['All except internal']}
                value={internal ? 'All except internal' : 'All'}
                onChange={handleInternalChange}
              />
            </Menu>
          </Box>
        </Flex>
        <Flex alignItems='center' gap={4}>
          <RadioGroup value={downloadType} onChange={setDownloadType}>
            <Stack direction='row' spacing={4}>
              <Radio value='pdf'>PDF</Radio>
              <Radio value='html'>HTML</Radio>
            </Stack>
          </RadioGroup>
          <Button
            isLoading={isLoading}
            colorScheme='blue'
            onClick={handleDownload}
          >
            Export
          </Button>
        </Flex>
      </Flex>
    )
  }, [
    compSearch,
    handleSearch,
    handleClear,
    onSearchInputChange,
    internal,
    setInternal,
    query,
    showToast,
    variables,
    isLoading,
    selectedRowData,
    downloadType,
    productName,
    productVersion
  ])
}

export default AttributionReportsSubHeader

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
import { downloadAttributionPdf } from './AttributionPdf'

const AttributionReportsSubHeader = ({
  searchInput,
  handleClear,
  onSearchInputChange,
  setInternal,
  internal,
  query,
  variables,
  selectedRowData
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
      if (selectedRowData.length > 0) {
        const sortedData = [...selectedRowData].sort((a, b) => {
          return new Date(b.updatedAt) - new Date(a.updatedAt)
        })

        if (downloadType === 'pdf') {
          downloadAttributionPdf(sortedData)
        } else {
          downloadAttributionHtml(sortedData)
        }
        setIsLoading(false)
        return
      }

      let allComponents = []
      let componentsHasNextPage = true
      let componentsEndCursor = null

      try {
        while (componentsHasNextPage) {
          if (componentsHasNextPage) {
            const componentsRes = await client.query({
              query,
              variables: {
                ...variables,
                after: componentsEndCursor
              }
            })

            const fetchedComponents =
              componentsRes?.data?.sbom?.components?.nodes || []
            const pageInfo = componentsRes?.data?.sbom?.components?.pageInfo

            allComponents.push(...fetchedComponents)
            componentsEndCursor = pageInfo?.endCursor
            componentsHasNextPage = pageInfo?.hasNextPage
          }
        }

        if (downloadType === 'pdf') {
          downloadAttributionPdf(allComponents)
        } else {
          downloadAttributionHtml(allComponents)
        }

        setIsLoading(false)
      } catch (error) {
        setIsLoading(false)
        showToast({
          description: `Error downloading Attribution ${downloadType === 'pdf' ? 'pdf' : 'HTML'}. Please try again later.`,
          status: 'error'
        })
      }
    }

    return (
      <Flex w={'100%'} justifyContent={'space-between'}>
        <Flex gap={4} flexWrap={'wrap'}>
          {/* SEARCH */}
          <SearchFilter
            id='attribution'
            filterText={searchInput}
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
    searchInput,
    handleClear,
    onSearchInputChange,
    internal,
    setInternal,
    query,
    showToast,
    variables,
    isLoading,
    selectedRowData,
    downloadType
  ])
}

export default AttributionReportsSubHeader

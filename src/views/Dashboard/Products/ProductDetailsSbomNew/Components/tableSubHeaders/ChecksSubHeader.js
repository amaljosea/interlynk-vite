import { useMutation, useQuery } from '@apollo/client'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { Flex, IconButton, Tooltip } from '@chakra-ui/react'

import RefreshBtn from 'components/Icons/RefreshBtn'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import useQueryParam from 'hooks/useQueryParam'

import { recheckHealth } from 'graphQL/Mutation'
import { GetCheckFilterData } from 'graphQL/Queries'

import { LuScanLine } from 'react-icons/lu'

import CheckFilters from '../../CheckFilters'

const ChecksSubHeader = (reset, isArchived) => {
  const { showToast } = useCustomToast()

  const activeTab = useQueryParam('tab')
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid

  const [checkSearch, setCheckSearch] = useState(search || '')

  const editChecks = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'edit_checks'
  })

  const { sbomCheckState, dispatch } = useGlobalState()
  const { sbomCheckDispatch } = dispatch
  const { search } = sbomCheckState

  const [healthRecheck] = useMutation(recheckHealth)

  // GET HEALTH CHECK FILTER HEADS
  const { data: filterHead } = useQuery(GetCheckFilterData, {
    fetchPolicy: 'network-only',
    skip: activeTab === 'checks' ? false : true,
    variables: {
      projectId: productId,
      sbomId
    }
  })

  const subHeader = useMemo(() => {
    const handleReCheck = async () => {
      showToast({
        description: 'Checks rescan is in progress',
        status: 'info'
      })
      await healthRecheck({
        variables: {
          sbomId: sbomId
        }
      }).then((res) => {
        if (res.data) {
          showToast({
            description: 'Health re-check successfully',
            status: 'success'
          })
        }
      })
      reset()
    }

    // ON SEARCH INPUT CHANGE
    const onSearchInputChange = (e) => {
      const { value } = e.target
      if (value === '') {
        handleClear()
      } else {
        setCheckSearch(value)
      }
    }

    // CLEAR SERACH
    const handleClear = () => {
      setCheckSearch('')
      sbomCheckDispatch({ type: 'CLEAR_SEARCH_INPUT' })
      reset()
    }

    // SEARCH COMPONENT
    const handleSearch = (event) => {
      const { value } = event.target
      if (event.key === 'Enter' && value !== '') {
        sbomCheckDispatch({ type: 'CHANGE_SEARCH_INPUT', payload: value })
        reset()
      }
    }

    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Flex gap={2} flexWrap={'wrap'}>
          {/* SEARCH COMPONENTS */}
          <SearchFilter
            id='healthcheck'
            filterText={checkSearch}
            onChange={onSearchInputChange}
            onFilter={handleSearch}
            onClear={handleClear}
          />

          {/* FILTER COMPONENTS BASED ON ECOSYSTEM */}
          {filterHead && (
            <CheckFilters reset={reset} filters={filterHead?.sbom?.filters} />
          )}
        </Flex>

        <Flex gap={2}>
          <Tooltip label='Re-Check'>
            <IconButton
              fontSize={'sm'}
              variant='solid'
              colorScheme='blue'
              fontWeight='normal'
              onClick={handleReCheck}
              hidden={isArchived}
              isDisabled={!editChecks}
              icon={<LuScanLine size={18} />}
            />
          </Tooltip>
          <RefreshBtn />
        </Flex>
      </Flex>
    )
  }, [
    isArchived,
    checkSearch,
    filterHead,
    editChecks,
    reset,
    healthRecheck,
    sbomId,
    showToast,
    sbomCheckDispatch,
    setCheckSearch
  ])

  return subHeader
}

export default ChecksSubHeader

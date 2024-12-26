import { useMemo } from 'react'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { Flex, IconButton, Stack, Tooltip } from '@chakra-ui/react'

import RefreshBtn from 'components/Icons/RefreshBtn'

import { FaCheckDouble } from 'react-icons/fa'

import CheckFilters from '../../CheckFilters'

const ChecksSubHeader = (
  checkSearch,
  filterHead,
  reset,
  isArchived,
  editChecks,
  showToast,
  healthRecheck,
  sbomId,
  setCheckSearch,
  sbomCheckDispatch
) => {
  const subHeader = useMemo(() => {
    const handleReCheck =
      (async () => {
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
      },
      [healthRecheck, sbomId, showToast, reset])

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
        <Stack
          width={'100%'}
          direction={'row'}
          spacing={3}
          alignItems={'flex-start'}
        >
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
        </Stack>

        <Stack spacing={2} direction={'row'}>
          <Tooltip label='Re-Check'>
            <IconButton
              fontSize={'sm'}
              variant='solid'
              colorScheme='blue'
              fontWeight='normal'
              onClick={handleReCheck}
              hidden={isArchived}
              isDisabled={!editChecks}
              icon={<FaCheckDouble size={16} />}
            />
          </Tooltip>
          <RefreshBtn />
        </Stack>
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

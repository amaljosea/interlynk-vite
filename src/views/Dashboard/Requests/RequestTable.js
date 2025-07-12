import { useMutation } from '@apollo/client'
import React, { useCallback, useState } from 'react'

import { Stack, useDisclosure } from '@chakra-ui/react'

import LynkTable from 'components/LynkTable'
import RequestColumns from 'components/columns/RequestColumns'
import RequestHeader from 'components/headers/RequestHeader'

import useCustomToast from 'hooks/useCustomToast'

import { RequestCancel, RequestResend } from 'graphQL/Mutation'

import Pagination from '../../../components/Pagination'
import ConfirmationModal from '../Products/components/ConfirmationModal'
import RequestAcceptModal from './RequestAcceptModal'
import RequestModal from './RequestModal'

const RequestTable = (props) => {
  const { data, loading, filters, setFilters, paginationProps } = props

  const { showToast } = useCustomToast()

  const [resendRequest] = useMutation(RequestResend)
  const [cancelRequest] = useMutation(RequestCancel)

  const { search } = filters

  const REQUEST = useDisclosure()
  const ACCEPT = useDisclosure()
  const WARNING = useDisclosure()

  const [filterText, setFilterText] = useState(search || '')
  const [activeRow, setActiveRow] = useState(null)

  const setSearchFilter = useCallback(
    (value) => {
      setFilters((oldFilter) => ({ ...oldFilter, search: value }))
    },
    [setFilters]
  )

  // CLEAR SERACH
  const handleClear = useCallback(() => {
    setFilterText('')
    setFilters((oldFilter) => ({ ...oldFilter, search: undefined }))
  }, [setFilters])

  // SEARCH COMPONENT
  const handleSearch = useCallback(
    (event) => {
      const { value } = event.target
      if (event?.key === 'Enter') {
        setSearchFilter(value)
      }
    },
    [setSearchFilter]
  )

  const onSearchInputChange = useCallback(
    (e) => {
      const { value } = e.target
      if (value === '') {
        handleClear()
      } else {
        setFilterText(value)
      }
    },
    [handleClear]
  )

  const handleSort = async (column, sortDirection) => {
    if (column && column.id && sortDirection) {
      setFilters((oldFilters) => ({
        ...oldFilters,
        field: column?.id,
        direction: sortDirection.toUpperCase()
      }))
    }
  }

  const handleResend = (row) => {
    resendRequest({ variables: { id: row?.id } }).then((res) => {
      if (res?.data?.requestResend?.errors?.length === 0) {
        showToast({ description: 'Request Resent', status: 'success' })
      }
    })
  }

  const handleCancel = (row) => {
    cancelRequest({ variables: { id: row?.id } }).then((res) => {
      if (res?.data?.requestCancel?.errors?.length === 0) {
        showToast({ description: 'Request Canceled', status: 'success' })
      }
    })
  }

  const action = (type, data) => {
    setActiveRow(data)
    switch (type) {
      case 'request':
        return REQUEST.onOpen()
      case 'accept':
        return ACCEPT.onOpen()
      case 'resend':
        return handleResend(data)
      case 'cancel':
        return WARNING.onOpen()
      default:
        return REQUEST.onOpen()
    }
  }

  const columns = RequestColumns({ action })

  const subHeader = RequestHeader({
    action,
    setFilters,
    filterText,
    handleClear,
    handleSearch,
    onSearchInputChange
  })

  return (
    <>
      <Stack width={'100%'}>
        <LynkTable
          subHeader
          data={data}
          persistTableHead
          columns={columns}
          onSort={handleSort}
          progressPending={loading}
          subHeaderComponent={subHeader}
          defaultSortFieldId='REQUESTS_REQUESTED_AT'
        />

        <Pagination {...paginationProps} />
      </Stack>

      {REQUEST.isOpen && (
        <RequestModal
          data={null}
          isOpen={REQUEST.isOpen}
          onClose={REQUEST.onClose}
        />
      )}

      {ACCEPT.isOpen && (
        <RequestAcceptModal
          data={activeRow}
          isOpen={ACCEPT.isOpen}
          onClose={ACCEPT.onClose}
        />
      )}

      {WARNING.isOpen && (
        <ConfirmationModal
          title='Cancel Request'
          isOpen={WARNING.isOpen}
          onClose={WARNING.onClose}
          description={`This will cancel the request by ${activeRow.email}`}
          onConfirm={() => {
            handleCancel(activeRow)
            WARNING.onClose()
          }}
        />
      )}
    </>
  )
}

export default RequestTable

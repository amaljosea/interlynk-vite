import { useMutation, useQuery } from '@apollo/client'
import React, { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ProductDetailsTabs } from 'utils/TabsObjects'
import DeleteModal from 'views/Dashboard/Policies/DeleteModal'
import PolicyModal from 'views/Dashboard/Policies/PolicyModal'
import WarnModal from 'views/Dashboard/Policies/WarnModal'

import { Stack, useDisclosure } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import GlobalPolicyColumns from 'components/columns/GlobalPolicyColumns'
import GlobalPolicyHeader from 'components/headers/GlobalPolicyHeader'
import LynkTable from 'components/LynkTable'
import Pagination from 'components/Pagination'
import GlobalPolicyExpand from 'components/expand-view/GlobalPolicyExpand'

import useCustomToast from 'hooks/useCustomToast'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { DeletePolicyExclusion, PolicyExclusionCreate } from 'graphQL/Mutation'
import {
  GetPolicies,
  GetProjectPolicies,
  PolicySubjectOperators
} from 'graphQL/Queries'

const PolicyTable = () => {
  const params = useParams()
  const tab = useQueryParam('tab')
  const { showToast } = useCustomToast()

  const productId = params.productid
  const { POLICIES } = ProductDetailsTabs

  const { blurBackground } = useThemeColor(['blurBackground'])

  const POLICY = useDisclosure()
  const STATUS = useDisclosure()
  const DELETE = useDisclosure()

  const [filters, setFilters] = useState({ search: '' })
  const { search } = filters || {}

  const [activeRow, setActiveRow] = useState(null)
  const [filterText, setFilterText] = useState(filters ? search : '')

  const [createExclusion] = useMutation(PolicyExclusionCreate)
  const [deleteExclusion] = useMutation(DeletePolicyExclusion)

  const {
    nodes: policyData,
    paginationProps: policyPaginationProps,
    loading: policyloading
  } = usePaginatedQuery(GetProjectPolicies, {
    skip: tab === POLICIES ? false : true,
    selector: 'projectPolicies',
    variables: {
      projectId: productId
    }
  })

  const {
    nodes: globalData,
    paginationProps: globalPaginationProps,
    loading: globalLoading,
    reset
  } = usePaginatedQuery(GetPolicies, {
    selector: 'policies',
    variables: { ...filters },
    skip: tab === POLICIES ? true : false
  })

  const { data: subOperators } = useQuery(PolicySubjectOperators, {
    skip:
      tab === POLICIES || location?.pathname === '/vendor/policies'
        ? false
        : true
  })

  const handleCreateExclusion = async (id) => {
    await createExclusion({
      variables: { policyId: id, projectId: productId }
    }).then((res) => {
      const errors = res?.data?.policyExclusionCreate?.errors
      if (errors?.length > 0) {
        showToast({
          description: errors[0],
          status: 'error'
        })
      } else {
        showToast({
          description: 'Exclusion updated successfully',
          status: 'success'
        })
      }
    })
  }

  const handleDeleteExclusion = async (id) => {
    await deleteExclusion({
      variables: { policyId: id, projectId: productId }
    }).then((res) => {
      const errors = res?.data?.policyExclusionDelete?.errors
      if (errors?.length > 0) {
        showToast({
          description: errors[0],
          status: 'error'
        })
      } else {
        showToast({
          description: 'Exclusion updated successfully',
          status: 'success'
        })
      }
    })
  }

  const action = (type, data) => {
    setActiveRow(data)
    switch (type) {
      case 'create_policy':
        return POLICY.onOpen()
      case 'edit_policy':
        return POLICY.onOpen()
      case 'update_policy_status':
        return STATUS.onOpen()
      case 'delete_policy':
        return DELETE.onOpen()
      default:
        return POLICY.onOpen()
    }
  }

  const handleApply = (data) =>
    data?.isExcluded
      ? handleDeleteExclusion(data?.id)
      : handleCreateExclusion(data?.id)

  const columns = GlobalPolicyColumns({ action, handleApply })

  const setSearchFilter = useCallback(
    (value) => {
      setFilters((oldFilter) => ({
        ...oldFilter,
        search: value
      }))
      reset()
    },
    [reset]
  )

  const handleClear = useCallback(async () => {
    setFilterText('')
    setFilters((oldFilter) => ({
      ...oldFilter,
      search: undefined
    }))
    reset()
  }, [reset])

  const onSearchInputChange = useCallback(
    (event) => {
      const { value } = event.target
      if (value === '') {
        handleClear()
      } else {
        setFilterText(value)
      }
    },
    [handleClear]
  )

  const handleSearch = useCallback(
    (event) => {
      const {
        key,
        target: { value }
      } = event
      if (key === 'Enter' && value !== '') {
        setSearchFilter(value)
      }
    },
    [setSearchFilter]
  )

  const header = GlobalPolicyHeader({
    action,
    filterText,
    handleClear,
    handleSearch,
    onSearchInputChange
  })

  const formatSubject = (value) => {
    if (subOperators) {
      const result = subOperators.policySubjectOperatorMapping.find(
        (item) => item?.subject === value
      )
      return result
        ? { name: result.name, category: result.category }
        : { name: '', category: '' }
    }
    return { name: '', category: '' }
  }

  const data = tab === POLICIES ? policyData : globalData
  const loading = tab === POLICIES ? policyloading : globalLoading
  const paginationProps =
    tab === POLICIES ? policyPaginationProps : globalPaginationProps

  const conditionalRowStyles = [
    {
      when: (row) => row.isExcluded === true,
      style: {
        backgroundColor: blurBackground,
        '&:hover': { cursor: 'pointer' }
      }
    }
  ]

  return (
    <>
      <Card padding={productId ? '0px' : '22px'}>
        <Stack>
          <LynkTable
            subHeader
            expandableRows
            columns={columns}
            data={data || []}
            expandOnRowClicked
            progressPending={loading}
            subHeaderComponent={header}
            expandableRowsComponent={GlobalPolicyExpand}
            conditionalRowStyles={conditionalRowStyles}
            expandableRowsComponentProps={{ formatSubject }}
          />
          {<Pagination {...paginationProps} />}
        </Stack>
      </Card>

      {POLICY.isOpen && (
        <PolicyModal
          data={activeRow}
          isOpen={POLICY.isOpen}
          onClose={POLICY.onClose}
          plSubjects={subOperators?.policySubjectOperatorMapping || []}
        />
      )}

      {STATUS.isOpen && (
        <WarnModal
          data={activeRow}
          isOpen={STATUS.isOpen}
          onClose={STATUS.onClose}
        />
      )}
      {DELETE.isOpen && (
        <DeleteModal
          data={activeRow}
          isOpen={DELETE.isOpen}
          onClose={DELETE.onClose}
        />
      )}
    </>
  )
}

export default PolicyTable

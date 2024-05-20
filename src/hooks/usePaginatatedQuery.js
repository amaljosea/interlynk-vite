import { useQuery } from '@apollo/client'
import { get } from 'lodash'
import { useState } from 'react'

const PAGINATION_SIZES = [25, 50, 100]
const DEFAULT_PAGINATION_SIZE = PAGINATION_SIZES[0]

export const usePaginatatedQuery = (
  QUERY,
  { skip, selector, variables = {} }
) => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGINATION_SIZE)

  const DEFAULT_PAGINATION_VARIABLES = {
    after: undefined,
    before: undefined,
    first: pageSize,
    last: undefined
  }

  const [paginationVariables, setPaginationVariables] = useState(
    DEFAULT_PAGINATION_VARIABLES
  )
  const { data, loading, previousData, refetch } = useQuery(QUERY, {
    skip: skip,
    variables: {
      ...variables,
      ...paginationVariables
    }
  })

  const resource = get(data || previousData, selector)
  const { hasNextPage, hasPreviousPage, endCursor, startCursor } =
    resource?.pageInfo || {}

  const onPreviousPage = () => {
    setPage(page - 1)
    setPaginationVariables({
      after: undefined,
      before: startCursor,
      first: undefined,
      last: pageSize
    })
  }

  const onNextPage = () => {
    setPage(page + 1)
    setPaginationVariables({
      after: endCursor,
      before: undefined,
      first: pageSize,
      last: undefined
    })
  }

  const onSetRow = (e) => {
    const newPageSize = Number(e.target.value)
    setPageSize(newPageSize)
    setPage(1)
    setPaginationVariables({
      ...DEFAULT_PAGINATION_VARIABLES,
      first: newPageSize
    })
  }

  return {
    nodes: resource?.nodes,
    loading: loading,
    reset: () => {
      setPaginationVariables(DEFAULT_PAGINATION_VARIABLES)
      setPage(1)
    },
    // it is good not to allow any variables for refetch
    // if you need to change the variables, pass it as props, it will rerender
    refetch: () => refetch(),
    paginationProps: {
      loading,
      paginationHidden: !resource,
      paginationSizes: PAGINATION_SIZES,
      totalCount: resource?.totalCount,
      pageIndex: page,
      totalRows: pageSize,
      onPreviousPage,
      onNextPage,
      onSetRow,
      hasNextPage,
      hasPreviousPage
    }
  }
}

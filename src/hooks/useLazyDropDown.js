import { useQuery } from '@apollo/client'
import { get } from 'lodash'
import { truncatedValue } from 'utils'

export const useLazyDropDown = (
  QUERY,
  {
    skip,
    selector,
    selectedItem,
    selectorForActualCount,
    onCompleted,
    variables = {},
    styles,
    onChange,
    components,
    optionLabel,
    optionValue,
    defaultFirstOption,
    isBreadcrumb
  }
) => {
  /* eslint-disable */
  const {
    data,
    loading: isLoading,
    previousData,
    error,
    fetchMore,
    refetch
  } = useQuery(QUERY, {
    skip: skip,
    variables: {
      ...variables
    },
    onCompleted: onCompleted
  })

  const resource = get(data || previousData, selector)
  const totalCountObject = get(data || previousData, selectorForActualCount)
  const totalCountActual = totalCountObject?.totalCount
  const nodes = resource?.nodes || []

  const { hasNextPage, endCursor } = resource?.pageInfo || {}

  const onMenuScrollToBottom = async () => {
    if (!hasNextPage) return
    await fetchMore({
      variables: {
        ...variables,
        after: endCursor // Pagination cursor
      },
      fetchPolicy: 'network-only',
      updateQuery: (previousResult, { fetchMoreResult }) => {
        const newNodes = get(fetchMoreResult, `${selector}.nodes`, [])
        const pageInfo = get(fetchMoreResult, `${selector}.pageInfo`, {})
        const existingNodes = resource?.nodes || []
        // Combine existing nodes and new nodes from the current fetch
        const updatedNodes = [...existingNodes, ...newNodes]
        // Return the updated query result to Apollo
        return {
          ...previousResult,
          [selector]: {
            ...get(previousResult, selector, {}),
            nodes: updatedNodes, // Set updated nodes here
            pageInfo // Update pageInfo with new info
          }
        }
      }
    })
  }

  // Refetch options on input change
  const onInputChange = async (search) => {
    const { data: refetchedData } = await refetch({
      ...variables,
      search: `%${search}%`
    })
    const newNodes = get(refetchedData, `${selector}.nodes`, [])
    return newNodes
  }

  const loadOptions = async (searchValue) => {
    const options = await onInputChange(searchValue)
    return options
  }

  // Filter out the selected item from the nodes list
  const filteredNodes = resource?.nodes?.filter((node) => {
    // Exclude the defaultFirstOption from the rest of the list
    if (defaultFirstOption && node.id === defaultFirstOption.id) return false
    return !Object.values(node).some((value) => value === selectedItem)
  })

  const getOptionValue = optionValue
    ? (item) => item[optionValue]
    : (item) => item?.id

  const getOptionLabel =
    typeof optionLabel === 'function'
      ? optionLabel
      : optionLabel
        ? (item) => item[optionLabel]
        : (item) => item?.name

  const placeholder = truncatedValue(selectedItem, isBreadcrumb ? 18 : 40)

  const defaultOptions = defaultFirstOption
    ? [defaultFirstOption, ...(filteredNodes || [])]
    : filteredNodes || []

  const filterOptions = defaultOptions?.map((item) => ({
    ...item,
    name: truncatedValue(item?.name, 50)
  }))

  return {
    lazyDropDownProps: {
      nodes,
      isLoading,
      error,
      onMenuScrollToBottom,
      onInputChange,
      totalCountActual,
      loadOptions,
      filteredNodes,
      getOptionValue,
      getOptionLabel,
      styles,
      placeholder,
      onChange,
      components,
      defaultOptions: filterOptions
    }
  }
}

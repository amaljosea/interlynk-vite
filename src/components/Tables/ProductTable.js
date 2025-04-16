import { useMutation, useQuery } from '@apollo/client'
import { useTour } from '@reactour/tour'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmationModal from 'views/Dashboard/Products/components/ConfirmationModal'
import GithubAddModal from 'views/Dashboard/Products/components/GithubAddModal'
import ProductModal from 'views/Dashboard/Products/components/ProductModal'
import StatusModal from 'views/Dashboard/Products/components/StatusModal'
import UploadModal from 'views/Dashboard/Products/components/UploadModal'

import { Flex, useDisclosure } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import ShareLynkDrawer from 'components/Drawer/ShareLynkDrawer'
import TagDrawer from 'components/Drawer/TagDrawer'
import LynkTable from 'components/LynkTable'
import BitbucketProjects from 'components/Drawer/BitbucketProjects'
import ProductColumns from 'components/columns/ProductColumns'
import ProductHeader from 'components/headers/ProductHeader'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { useProductUrlContext } from 'hooks/useProductUrlContext'

import { DeleteProjectGroup } from 'graphQL/Mutation'
import {
  GetBitbucketConnection,
  GetLabels,
  GetTotalProduct
} from 'graphQL/Queries'

import Pagination from '../Pagination'

const ProductTable = (props) => {
  const navigate = useNavigate()
  const { setIsOpen } = useTour()
  const { orgView, isFreeTier } = useGlobalQueryContext()
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()

  const { data, reset, loading, paginationProps } = props

  const { data: conn } = useQuery(GetBitbucketConnection, {
    skip: orgView && !isFreeTier ? false : true
  })
  const connections = conn?.organization?.connections?.nodes || []
  const bitbucket = connections?.some(
    (item) => item?.connection?.__typename === 'BitbucketConnection'
  )

  const { data: prodData } = useQuery(GetTotalProduct, {
    skip: orgView && isFreeTier ? false : true,
    variables: { first: 100 }
  })
  const { totalCount } = prodData?.organization?.projectGroups || ''

  // const { headingTextColor, semiTransparentBorder } = useThemeColor([
  //   'headingTextColor',
  //   'semiTransparentBorder'
  // ])

  const { prodState, setEnvName, setClearSelect, dispatch, envName } =
    useGlobalState()
  const { field, searchInput } = prodState

  const environment = envName
  const { prodDispatch } = dispatch

  const [activeRow, setActiveRow] = useState(null)
  const [openTagMenu, setOpenTagMenu] = useState(false)
  const [filterText, setFilterText] = useState(searchInput || '')
  const [selectedTags, setSelectedTags] = useState([])
  const [filterMode, setFilterMode] = useState('OR')

  const PRODUCT = useDisclosure()
  const UPLOAD = useDisclosure()
  const LABEL = useDisclosure()
  const DELETE = useDisclosure()
  const WARNING = useDisclosure()
  const SHARELYNK = useDisclosure()
  const GITHUB = useDisclosure()
  const BITBUCKET = useDisclosure()

  const action = (type, data) => {
    setActiveRow(data)
    switch (type) {
      case 'status_warning':
        return WARNING.onOpen()
      case 'update_product':
        return PRODUCT.onOpen()
      case 'upload_sbom':
        return UPLOAD.onOpen()
      case 'delete_product':
        return DELETE.onOpen()
      case 'view_sharelynk':
        return SHARELYNK.onOpen()
      case 'create_labels':
        return LABEL.onOpen()
      case 'edit_labels':
        setOpenTagMenu(true)
        return
      case 'import_github':
        return GITHUB.onOpen()
      case 'import_bitbucket':
        return BITBUCKET.onOpen()
      default:
        return PRODUCT.onOpen()
    }
  }

  const handleClick = (data) => {
    const { id, projects, defaultProject } = data || {}
    setIsOpen(false)
    setClearSelect(true)
    const env = projects?.find((item) => item.name === environment)
    setEnvName(env ? env?.name : defaultProject?.name)
    prodDispatch({
      type: 'SET_CURRENT_PRODUCT',
      payload: { id: env?.id || defaultProject?.id }
    })
    const link = generateProductDetailPageUrlFromCurrentUrl({
      productgroupid: id,
      productid: env?.id || defaultProject?.id,
      paramsObj: {
        tab: 'versions'
      }
    })
    navigate(link)
  }

  const { data: prodLabels, loading: labelLoading } = useQuery(GetLabels, {
    skip: openTagMenu ? false : true,
    variables: { first: 100 }
  })
  const { nodes: productLabels } = prodLabels?.labels || ''

  const [deleteProjectGroup, { loading: dLLoading }] =
    useMutation(DeleteProjectGroup)

  const onProductDelete = useCallback(async () => {
    await deleteProjectGroup({ variables: { id: activeRow?.id } }).then(
      (res) => res.data && DELETE.onClose()
    )
  }, [deleteProjectGroup, activeRow?.id, DELETE])

  const setSearchFilter = useCallback(
    (value) => {
      prodDispatch({ type: 'CHANGE_SEARCH_INPUT', payload: value })
      reset()
    },
    [prodDispatch, reset]
  )

  const handleClear = useCallback(async () => {
    setFilterText('')
    prodDispatch({ type: 'CLEAR_SEARCH_INPUT', payload: '' })
    reset()
  }, [prodDispatch, reset])

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

  const filteredNodes = data?.filter((node) => {
    const nodeTags = node?.labels?.map((label) => label.name)
    if (filterMode === 'AND') {
      return selectedTags.every((tag) => nodeTags.includes(tag))
    } else if (filterMode === 'OR') {
      return selectedTags.some((tag) => nodeTags.includes(tag))
    }
    return true
  })

  // HEADER
  const subHeaderComponent = ProductHeader({
    action,
    reset,
    filterText,
    onSearchInputChange,
    handleClear,
    handleSearch,
    filterMode,
    setFilterMode,
    setSelectedTags,
    bitbucket,
    totalCount
  })

  // COLUMNS
  const columns = ProductColumns({
    action,
    handleClick,
    openTagMenu,
    setOpenTagMenu,
    activeRow,
    labelLoading,
    productLabels
  })

  const handleSort = (column, sortDirection) => {
    prodDispatch({
      type: 'SET_SORT_ORDER',
      payload: {
        field: column?.id,
        direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
      }
    })
    reset()
  }

  return (
    <>
      <Card pos={'relative'}>
        <Flex flexDir={'column'} width={'100%'}>
          <LynkTable
            subHeader
            columns={columns}
            onSort={handleSort}
            progressPending={loading}
            defaultSortFieldId={field}
            subHeaderComponent={subHeaderComponent}
            data={filterMode === 'AND' ? filteredNodes : data}
          />
          <Pagination {...paginationProps} />
        </Flex>
      </Card>

      {/* UPLOAD SBOM */}
      {UPLOAD.isOpen && (
        <UploadModal
          isOpen={UPLOAD.isOpen}
          onClose={UPLOAD.onClose}
          group={{
            id: activeRow?.id,
            name: activeRow?.name,
            default: activeRow?.defaultProject?.id
          }}
        />
      )}

      {/* UPDATE PRODUCT */}
      {PRODUCT.isOpen && (
        <ProductModal
          data={activeRow}
          isOpen={PRODUCT.isOpen}
          onClose={PRODUCT.onClose}
        />
      )}

      {/* GITHUB ADD PROJECT */}
      {GITHUB.isOpen && (
        <GithubAddModal isOpen={GITHUB.isOpen} onClose={GITHUB.onClose} />
      )}

      {/* DELETE */}
      {DELETE.isOpen && (
        <ConfirmationModal
          isOpen={DELETE.isOpen}
          name={activeRow.name}
          isLoading={dLLoading}
          title='Delete Product'
          onClose={DELETE.onClose}
          onConfirm={onProductDelete}
          description='Deleting this product will:'
          items={[
            'Remove this product, its versions and SBOMs',
            'Remove access to the product for all users',
            'Disable uploads of SBOMs to this product'
          ]}
        />
      )}

      {/* DISABLED */}
      {WARNING.isOpen && (
        <StatusModal
          reset={reset}
          group={activeRow}
          isOpen={WARNING.isOpen}
          onClose={WARNING.onClose}
        />
      )}

      {/* ShareLynks */}
      {SHARELYNK.isOpen && (
        <ShareLynkDrawer
          isOpen={SHARELYNK.isOpen}
          onClose={SHARELYNK.onClose}
          prodData={{ id: activeRow?.id, name: activeRow?.name }}
        />
      )}

      {/* Labels */}
      {LABEL.isOpen && (
        <TagDrawer isOpen={LABEL.isOpen} onClose={LABEL.onClose} />
      )}

      {/* BitBucket Projects */}
      {BITBUCKET.isOpen && (
        <BitbucketProjects
          isOpen={BITBUCKET.isOpen}
          onClose={BITBUCKET.onClose}
        />
      )}
    </>
  )
}

export default ProductTable

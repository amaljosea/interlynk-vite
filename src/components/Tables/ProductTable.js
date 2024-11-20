import { useMutation, useQuery } from '@apollo/client'
import { useTour } from '@reactour/tour'
import { useCallback, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useNavigate } from 'react-router-dom'
import { getFullDateAndTime, timeSince } from 'utils'
import { customStyles, getFormat, getLink, getType } from 'utils'
import { getSignedUrlParams, truncatedValue } from 'utils'
import ConfirmationModal from 'views/Dashboard/Products/components/ConfirmationModal'
import GithubAddModal from 'views/Dashboard/Products/components/GithubAddModal'
import LabelInput from 'views/Dashboard/Products/components/LabelInput'
import ProdFilterMenu from 'views/Dashboard/Products/components/ProdFilterMenu'
import ProductModal from 'views/Dashboard/Products/components/ProductModal'
import StatusModal from 'views/Dashboard/Products/components/StatusModal'
import UploadModal from 'views/Dashboard/Products/components/UploadModal'
import ProductSearchFilter from 'views/Sbom/components/ProductSearchFilter'

import {
  Box,
  Divider,
  Fade,
  Flex,
  IconButton,
  Link as Olink,
  Portal,
  Stack,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'
import { Menu, MenuItem, MenuList } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CustomLoader from 'components/CustomLoader'
import ShareLynkDrawer from 'components/Drawer/ShareLynkDrawer'
import TagDrawer from 'components/Drawer/TagDrawer'
import AddButton from 'components/Icons/AddButton'
import IconBox from 'components/Icons/IconBox'
import RefreshBtn from 'components/Icons/RefreshBtn'
import ProdLabel from 'components/Label/ProdLabel'
import EnvList from 'components/Misc/EnvList'
import LynkAction from 'components/Misc/LynkAction'
import LynkSwitch from 'components/Misc/LynkSwitch'

import useGithubConfigSaved from 'hooks/useGithubConfigSaved'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'
import { useThemeColor } from 'hooks/useThemeColors'

import { DeleteProjectGroup } from 'graphQL/Mutation'
import { GetLabels, GetSharelynks, GetTotalProduct } from 'graphQL/Queries'

import { FaGithub } from 'react-icons/fa'
import { FaTag } from 'react-icons/fa6'

import Pagination from '../Pagination'

const ProductTable = ({
  data,
  reset,
  loading,
  filters,
  setFilters,
  paginationProps
}) => {
  const navigate = useNavigate()
  const { setIsOpen } = useTour()
  const { orgView, isFreeTier } = useGlobalQueryContext()
  const { shouldShowDemoFeatures } = useShouldShowDemoFeatures()
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()
  const signedUrlParams = getSignedUrlParams()

  const { data: prodData } = useQuery(GetTotalProduct, {
    skip: !orgView,
    variables: { first: 100 }
  })
  const { totalCount } = prodData?.organization?.projectGroups || ''

  const {
    primaryBlueText,
    headingTextColor,
    primaryTextColor,
    grayBorderColor,
    secondaryBgColor,
    semiTransparentBorder,
    lightAndDarkBgColor,
    primaryErrorColor
  } = useThemeColor([
    'primaryBlueText',
    'headingTextColor',
    'primaryTextColor',
    'grayBorderColor',
    'secondaryBgColor',
    'semiTransparentBorder',
    'lightAndDarkBgColor',
    'primaryErrorColor'
  ])

  const { search, field } = filters
  const { totalRows } = paginationProps

  const { setEnvName, setClearSelect, setSelectedSbom, dispatch, envName } =
    useGlobalState()

  const environment = envName

  const { prodDispatch } = dispatch

  const [activeRow, setActiveRow] = useState(null)
  const isGithubConfigSaved = useGithubConfigSaved()
  const [openTagMenu, setOpenTagMenu] = useState(false)
  const [filterText, setFilterText] = useState(search || '')

  const [selectedTags, setSelectedTags] = useState([])
  const [filterMode, setFilterMode] = useState('OR')

  const { isOpen, onOpen, onClose } = useDisclosure()

  const {
    isOpen: isOpenUpload,
    onOpen: onOpenUpload,
    onClose: onCloseUpload
  } = useDisclosure()
  const {
    isOpen: isOpenLabel,
    onOpen: onOpenLabel,
    onClose: onCloseLabel
  } = useDisclosure()
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose
  } = useDisclosure()
  const {
    isOpen: isWarningOpen,
    onOpen: onWarningOpen,
    onClose: onWarningClose
  } = useDisclosure()
  const {
    isOpen: isLynkOpen,
    onOpen: onLynkOpen,
    onClose: onLynkClose
  } = useDisclosure()
  const {
    isOpen: isGithubOpen,
    onOpen: onGithubOpen,
    onClose: onGithubClose
  } = useDisclosure()

  const canAddProduct = useHasPermission({
    parentKey: 'view_product_group',
    childKey: 'create_product_group'
  })

  const canEditProduct = useHasPermission({
    parentKey: 'view_product_group',
    childKey: 'update_product_group'
  })

  const canArchiveProduct = useHasPermission({
    parentKey: 'view_product_group',
    childKey: 'archive_product_group'
  })

  const canEditShareynk = useHasPermission({
    parentKey: 'view_product_group',
    childKey: 'edit_share_lynk'
  })

  const canCreateSBOM = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'update_sbom'
  })

  const { data: lynks, error } = useQuery(GetSharelynks, {
    skip: activeRow && isLynkOpen ? false : true,
    fetchPolicy: 'network-only',
    variables: {
      ids: activeRow ? [activeRow?.id] : undefined,
      first: totalRows
    }
  })

  const { data: prodLabels, loading: labelLoading } = useQuery(GetLabels, {
    skip: signedUrlParams || !orgView,
    variables: { first: 100 }
  })
  const { nodes } = prodLabels?.labels || ''

  const [deleteProjectGroup, { loading: dLLoading }] =
    useMutation(DeleteProjectGroup)

  const onProductDelete = useCallback(async () => {
    await deleteProjectGroup({ variables: { id: activeRow.id } }).then(
      (res) => res.data && onDeleteClose()
    )
  }, [deleteProjectGroup, activeRow, onDeleteClose])

  const setSearchFilter = useCallback(
    (value) => {
      setFilters((oldFilter) => ({
        ...oldFilter,
        search: value
      }))
    },
    [setFilters]
  )

  const handleClear = useCallback(async () => {
    setFilterText('')
    setFilters((oldFilter) => ({
      ...oldFilter,
      search: undefined
    }))
  }, [setFilters])

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

  const onSharelynkOpen = (row) => {
    setActiveRow(row)
    onLynkOpen()
  }

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
  const subHeaderComponent = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Stack direction={'row'} spacing={3} alignItems={'center'}>
          {/* SEARCH PRODUCTS */}
          <ProductSearchFilter
            id='product'
            filterText={filterText}
            onChange={onSearchInputChange}
            onClear={handleClear}
            onFilter={handleSearch}
          />
          {/* FILTER PRODUCTS */}
          {!signedUrlParams && (
            <ProdFilterMenu
              filters={filters}
              setFilters={setFilters}
              filterMode={filterMode}
              setFilterMode={setFilterMode}
              setSelectedTags={setSelectedTags}
            />
          )}
        </Stack>
        <Stack direction={'row'} spacing={2} alignItems={'center'}>
          {/* ADD GITHUB PROJECT */}
          {shouldShowDemoFeatures && isGithubConfigSaved && (
            <Tooltip label='Add GitHub Project'>
              <IconButton
                icon={<FaGithub />}
                variant='outline'
                onClick={onGithubOpen}
              />
            </Tooltip>
          )}
          {/* EDIT LABEL */}
          <Tooltip label='Manage Labels'>
            <IconButton
              aria-label='Manage Labels'
              icon={<FaTag />}
              variant='outline'
              onClick={onOpenLabel}
              isDisabled={!canAddProduct}
              hidden={signedUrlParams || isFreeTier}
            />
          </Tooltip>
          {/* REFRESH */}
          <RefreshBtn />
          {/* ADD PRODUCT */}
          <Box position='relative'>
            <Tooltip
              label={
                isFreeTier && totalCount === 5
                  ? 'Limit reached for free tier'
                  : 'Add product'
              }
              isDisabled={false} // Ensure the tooltip is never disabled
            >
              <Box>
                <AddButton
                  aria-label='Add product'
                  onClick={() => {
                    setActiveRow(null)
                    onOpen()
                  }}
                  isDisabled={
                    !canAddProduct || (isFreeTier && totalCount === 5)
                  }
                  hidden={signedUrlParams}
                />
              </Box>
            </Tooltip>
          </Box>
        </Stack>
      </Flex>
    )
  }, [
    filterText,
    onSearchInputChange,
    handleClear,
    handleSearch,
    signedUrlParams,
    filters,
    setFilters,
    filterMode,
    shouldShowDemoFeatures,
    isGithubConfigSaved,
    onGithubOpen,
    canAddProduct,
    onOpenLabel,
    isFreeTier,
    totalCount,
    onOpen
  ])

  // COLUMNS
  const columns = [
    // ACTIVE
    {
      id: 'PROJECT_GROUPS_ENABLED',
      name: 'ACTIVE',
      selector: (row) => {
        const { enabled, name } = row
        return (
          <LynkSwitch
            name={name}
            id={name}
            size='md'
            isChecked={enabled}
            isDisabled={signedUrlParams || !canEditProduct}
            onChange={() => {
              setActiveRow(row)
              onWarningOpen()
            }}
          />
        )
      },
      width: '100px',
      sortable: true
    },
    // PRODUCT
    {
      id: 'PROJECT_GROUPS_NAME',
      name: 'PRODUCT NAME',
      selector: (row, index) => {
        const { id, name, projects, defaultProject, description, labels } = row
        const handleClick = () => {
          setIsOpen(false)
          setClearSelect(true)
          setSelectedSbom([])
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
        return (
          <Flex
            my={3}
            alignItems={'center'}
            gap={shouldShowDemoFeatures ? 3 : 0}
            className={index === 0 ? 'product' : ''}
          >
            <Tooltip label={getFormat(name)} placement='top'>
              <Olink
                href={getLink(name)}
                isExternal={getLink(name) === '#' ? false : true}
              >
                <IconBox
                  h={'40px'}
                  w={'40px'}
                  bg={secondaryBgColor}
                  color={primaryBlueText}
                  hidden={!shouldShowDemoFeatures}
                >
                  {getType(name)}
                </IconBox>
              </Olink>
            </Tooltip>
            <Flex gap={2} flexWrap={'wrap'} flexDirection={'column'}>
              <Flex alignItems={'center'} gap={2} flexWrap={'wrap'}>
                <Text
                  fontSize={16}
                  color={primaryBlueText}
                  cursor={'pointer'}
                  width={'fit-content'}
                  onClick={handleClick}
                  aria-label='product_name'
                  data-testid={`product_${name}`}
                >
                  {name?.length > 54 ? (
                    <Tooltip label={name}>{truncatedValue(name, 54)}</Tooltip>
                  ) : (
                    name
                  )}
                </Text>
                {labels?.map((item, index) => (
                  <ProdLabel key={index} item={item} />
                ))}
              </Flex>
              <Text color={primaryTextColor} pr={32} wordBreak={'break-all'}>
                {description}
              </Text>
            </Flex>
          </Flex>
        )
      },
      width: '54%',
      wrap: true,
      sortable: true
    },
    // UPDATEDAT
    {
      id: 'PROJECT_GROUPS_UPDATED_AT',
      name: 'UPDATED',
      selector: (row) => {
        const { updatedAt } = row
        return (
          <Tooltip label={getFullDateAndTime(updatedAt)} placement={'top'}>
            <Text color={primaryTextColor}>{timeSince(updatedAt)}</Text>
          </Tooltip>
        )
      },
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a.updatedAt)
        const dateB = new Date(b.updatedAt)
        return dateA - dateB
      },
      wrap: true
    },
    // ENVIRONMENT
    {
      id: 'ENVIRONMENTS',
      name: 'ENVIRONMENTS',
      selector: (row) => <EnvList data={row} />,
      width: '20%',
      wrap: true
    },
    // ACTIONS
    {
      id: 'ACTIONS',
      name: '',
      selector: (row) => {
        const { enabled, labels, name } = row
        return (
          <Menu>
            <LynkAction
              data-testid='product-actions'
              onClick={() => setOpenTagMenu(false)}
              aria-label={`dropdown menu for ${name}`}
            />
            <Portal>
              <MenuList fontSize={'sm'}>
                {/* EDIT PRODUCT */}
                <MenuItem
                  onClick={() => {
                    setActiveRow(row)
                    onOpen()
                  }}
                  isDisabled={!enabled || !canEditProduct}
                >
                  Edit Product
                </MenuItem>
                <MenuItem
                  hidden={isFreeTier}
                  position={'relative'}
                  closeOnSelect={false}
                  onMouseEnter={() => {
                    setOpenTagMenu(true)
                    setActiveRow(row)
                  }}
                  aria-label={`add_label`}
                  onMouseLeave={() => setOpenTagMenu(false)}
                  isDisabled={!enabled || !canEditProduct}
                >
                  {labels?.length > 0 ? 'Update' : 'Add'} Label
                </MenuItem>
                {openTagMenu && !labelLoading && (
                  <Fade initialScale={0.9} in={openTagMenu} delay={0.2}>
                    <Box
                      h={'auto'}
                      top={0}
                      right={226}
                      width='220px'
                      borderRadius='md'
                      bg={lightAndDarkBgColor}
                      position='absolute'
                      border={`1px solid ${grayBorderColor}`}
                      onMouseEnter={() => setOpenTagMenu(true)}
                      onMouseLeave={() => setOpenTagMenu(false)}
                    >
                      <LabelInput
                        data={row}
                        nodes={nodes}
                        setOpen={setOpenTagMenu}
                        onOpenLabel={onOpenLabel}
                      />
                    </Box>
                  </Fade>
                )}
                {/* UPLOAD SBOM */}
                <MenuItem
                  aria-label={`upload sbom for ${name}`}
                  onClick={() => {
                    setActiveRow(row)
                    onOpenUpload()
                  }}
                  isDisabled={!enabled || !canCreateSBOM}
                >
                  Upload SBOM
                </MenuItem>
                {/* VIEW SHARELYNK */}
                <MenuItem
                  isDisabled={!enabled || !canEditShareynk}
                  onClick={() => onSharelynkOpen(row)}
                >
                  View ShareLynk
                </MenuItem>
                <Divider />
                {/* ARCHIVE PRODUCT GROUP */}
                <MenuItem
                  data-testid='delete_product'
                  aria-label={`Delete product ${name}`}
                  color={primaryErrorColor}
                  onClick={() => {
                    setActiveRow(row)
                    onDeleteOpen()
                  }}
                  isDisabled={!canArchiveProduct}
                >
                  Delete Product
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        )
      },
      width: '5%',
      right: 'true',
      omit: signedUrlParams
    }
  ]

  const handleSort = (column, sortDirection) => {
    setFilters((oldFilters) => ({
      ...oldFilters,
      field: column?.id,
      direction: sortDirection.toUpperCase()
    }))
  }

  const dataTableProps = {
    columns: columns,
    data: filterMode === 'AND' ? filteredNodes : data,
    onSort: handleSort,
    customStyles: customStyles(headingTextColor, semiTransparentBorder),
    defaultSortFieldId: field,
    defaultSortAsc: false,
    subHeader: true,
    subHeaderComponent: subHeaderComponent,
    progressPending: loading,
    progressComponent: <CustomLoader />,
    responsive: true,
    persistTableHead: true
  }

  return (
    <>
      <Card pos={'relative'}>
        <Flex flexDir={'column'} width={'100%'}>
          <DataTable {...dataTableProps} />
          <Pagination {...paginationProps} />
        </Flex>
      </Card>

      {/* UPLOAD SBOM */}
      {isOpenUpload && (
        <UploadModal
          isOpen={isOpenUpload}
          onClose={onCloseUpload}
          group={{
            id: activeRow?.id,
            name: activeRow?.name,
            default: activeRow?.defaultProject?.id
          }}
        />
      )}

      {/* UPDATE PRODUCT */}
      {isOpen && data && (
        <ProductModal isOpen={isOpen} onClose={onClose} data={activeRow} />
      )}

      {/* GITHUB ADD PROJECT */}
      {isGithubOpen && (
        <GithubAddModal isOpen={isGithubOpen} onClose={onGithubClose} />
      )}

      {/* DELETE */}
      {isDeleteOpen && (
        <ConfirmationModal
          isOpen={isDeleteOpen}
          name={activeRow.name}
          isLoading={dLLoading}
          title='Delete Product'
          onClose={onDeleteClose}
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
      {isWarningOpen && data && (
        <StatusModal
          reset={reset}
          group={activeRow}
          isOpen={isWarningOpen}
          onClose={onWarningClose}
        />
      )}

      {/* ShareLynks */}
      {isLynkOpen && (
        <ShareLynkDrawer
          error={error}
          groupId={activeRow?.id}
          data={lynks?.shareLynks}
          isOpen={isLynkOpen}
          onClose={onLynkClose}
        />
      )}

      {/* Labels */}
      {isOpenLabel && <TagDrawer isOpen={isOpenLabel} onClose={onCloseLabel} />}
    </>
  )
}

export default ProductTable

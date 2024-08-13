import { useMutation, useQuery } from '@apollo/client'
import { useTour } from '@reactour/tour'
import { useCallback, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getFullDateAndTime, hexToRGBA, timeSince } from 'utils'
import { customStyles, getFormat, getLink, getType } from 'utils'
import { truncatedValue } from 'utils'
import ConfirmationModal from 'views/Dashboard/Products/components/ConfirmationModal'
import GithubAddModal from 'views/Dashboard/Products/components/GithubAddModal'
import ProdFilterMenu from 'views/Dashboard/Products/components/ProdFilterMenu'
import ProductModal from 'views/Dashboard/Products/components/ProductModal'
import StatusModal from 'views/Dashboard/Products/components/StatusModal'
import UploadModal from 'views/Dashboard/Products/components/UploadModal'
import ProductSearchFilter from 'views/Sbom/components/ProductSearchFilter'

import { AddIcon } from '@chakra-ui/icons'
import {
  Button,
  Divider,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Link as Olink,
  Portal,
  Stack,
  Switch,
  Tag,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CustomLoader from 'components/CustomLoader'
import LabelDrawer from 'components/Drawer/LabelDrawer'
import ShareLynkDrawer from 'components/Drawer/ShareLynkDrawer'
import IconBox from 'components/Icons/IconBox'

import useGithubConfigSaved from 'hooks/useGithubConfigSaved'
import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'

import { DeleteProjectGroup } from 'graphQL/Mutation'
import { GetSharelynks } from 'graphQL/Queries'

import { FaEllipsisV, FaGithub } from 'react-icons/fa'
import {
  FaCode,
  FaDesktop,
  FaInbox,
  FaRotateRight,
  FaTag
} from 'react-icons/fa6'

import Pagination from '../Pagination'

const ProductTable = ({
  data,
  refetch,
  loading,
  filters,
  setFilters,
  paginationProps
}) => {
  const navigate = useNavigate()
  const { setIsOpen } = useTour()
  const { shouldShowDemoFeatures } = useShouldShowDemoFeatures()
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')

  const headColor = useColorModeValue('#4A5568', '#CBD5E0')
  const textColor = useColorModeValue('#1A202C', '#FFFFFF')
  const bgColor = useColorModeValue('#EDF2F7', '#4D698166')
  const grayColor = useColorModeValue('#1A202C', '#FFFFFF66')
  const iconColor = useColorModeValue('blue.500', 'gray.50')
  const timeColor = useColorModeValue('#1A202C', '#FFFFFF99')
  const borderColor = useColorModeValue('#3182CE66', '#90cdf499')
  const envIconColor = useColorModeValue('#3182CE', '#90cdf4')
  const dividerColor = useColorModeValue('#0000001f', '#ffffff1A')
  const switchColor = useColorModeValue('#ffffff', '#1f2733')

  const { search, enabled, field } = filters
  const { totalRows } = paginationProps

  const params = useParams()
  const productId = params.productid

  const {
    setEnvName,
    setClearSelect,
    setSelectedSbom,
    dispatch,
    envName,
    onChangeEnv
  } = useGlobalState()

  const environment = envName

  const { prodDispatch } = dispatch

  const [filterText, setFilterText] = useState(search || '')
  const [activeRow, setActiveRow] = useState(null)
  const isGithubConfigSaved = useGithubConfigSaved()

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

  const [deleteProjectGroup] = useMutation(DeleteProjectGroup)

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

  const onFilterActive = useCallback(
    (value) => {
      console.log(value)
      setFilters((oldFilter) => ({
        ...oldFilter,
        enabled: value === 'yes' ? true : value === 'no' ? false : undefined
      }))
    },
    [setFilters]
  )

  const onSharelynkOpen = (row) => {
    setActiveRow(row)
    onLynkOpen()
  }

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
            <ProdFilterMenu enabled={enabled} onFilter={onFilterActive} />
          )}
        </Stack>
        <Stack direction={'row'} spacing={3} alignItems={'center'}>
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
          {shouldShowDemoFeatures && (
            <Tooltip label='Edit Label'>
              <IconButton
                icon={<FaTag />}
                variant='outline'
                isDisabled={!canAddProduct}
                hidden={signedUrlParams}
                onClick={onOpenLabel}
              />
            </Tooltip>
          )}
          {/* REFRESH */}
          <Tooltip label='Refresh'>
            <IconButton
              onClick={refetch}
              variant='outline'
              icon={<FaRotateRight />}
            />
          </Tooltip>
          {/* ADD PRODUCT */}
          <Tooltip label='Add product'>
            <IconButton
              icon={<AddIcon />}
              colorScheme='blue'
              isDisabled={!canAddProduct}
              hidden={signedUrlParams}
              onClick={() => {
                setActiveRow(null)
                onOpen()
              }}
            />
          </Tooltip>
        </Stack>
      </Flex>
    )
  }, [
    filterText,
    onSearchInputChange,
    handleClear,
    handleSearch,
    signedUrlParams,
    enabled,
    onFilterActive,
    shouldShowDemoFeatures,
    isGithubConfigSaved,
    onGithubOpen,
    canAddProduct,
    refetch,
    onOpen,
    onOpenLabel
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
          <Switch
            name={name}
            id={name}
            size='md'
            isChecked={enabled}
            isDisabled={signedUrlParams || !canEditProduct}
            onChange={() => {
              setActiveRow(row)
              onWarningOpen()
            }}
            sx={{
              '.chakra-switch__thumb[data-checked]': {
                backgroundColor: switchColor
              }
            }}
          />
        )
      },
      width: '10%',
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
                  bg={bgColor}
                  color={iconColor}
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
                  color={envIconColor}
                  cursor={'pointer'}
                  width={'fit-content'}
                  onClick={handleClick}
                >
                  {truncatedValue(name, 20)}
                </Text>
                {shouldShowDemoFeatures &&
                  labels?.map((item) => (
                    <Tag
                      py={1}
                      size='sm'
                      key={item?.id}
                      width={'fit-content'}
                      borderColor={item?.color}
                      bg={hexToRGBA(item?.color, 0.5)}
                    >
                      {item?.name}
                    </Tag>
                  ))}
              </Flex>
              <Text color={grayColor}>{description}</Text>
            </Flex>
          </Flex>
        )
      },
      width: '50%',
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
            <Text color={timeColor}>{timeSince(updatedAt)}</Text>
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
      selector: (row) => {
        const { projects } = row
        const handleClick = (value) => {
          const env = projects?.find((item) => item.name === value)
          onChangeEnv(env?.name)
          prodDispatch({
            type: 'SET_CURRENT_PRODUCT',
            payload: { id: env?.id }
          })
        }

        const getProjectSbomsCount = (name) => {
          const project = projects?.find((item) => item.name === name)
          return project ? project.sbomsCount : 0
        }

        return (
          <Stack direction={'row'} spacing={2} alignItems={'center'}>
            <Tooltip label='Default'>
              <Link
                to={generateProductDetailPageUrlFromCurrentUrl({
                  productgroupid: row.id,
                  productid: row.defaultProject.id
                })}
                onClick={() => handleClick('default')}
              >
                <Button
                  size='sm'
                  leftIcon={<FaInbox color={envIconColor} />}
                  variant='outline'
                  borderColor={borderColor}
                  color={textColor}
                  fontWeight={400}
                  width={'60px'}
                >
                  {getProjectSbomsCount('default')}
                </Button>
              </Link>
            </Tooltip>
            <Tooltip label='Development'>
              <Link
                to={generateProductDetailPageUrlFromCurrentUrl({
                  productgroupid: row.id,
                  productid: projects?.find(
                    (item) => item.name === 'development'
                  ).id
                })}
                onClick={() => handleClick('development')}
              >
                <Button
                  size='sm'
                  leftIcon={<FaCode color={envIconColor} />}
                  variant='outline'
                  borderColor={borderColor}
                  color={textColor}
                  fontWeight={400}
                  width={'60px'}
                >
                  {getProjectSbomsCount('development')}
                </Button>
              </Link>
            </Tooltip>
            <Tooltip label='Production'>
              <Link
                to={generateProductDetailPageUrlFromCurrentUrl({
                  productgroupid: row.id,
                  productid: projects?.find(
                    (item) => item.name === 'production'
                  ).id
                })}
                onClick={() => handleClick('production')}
              >
                <Button
                  size='sm'
                  leftIcon={<FaDesktop color={envIconColor} />}
                  variant='outline'
                  borderColor={borderColor}
                  color={textColor}
                  fontWeight={400}
                  width={'60px'}
                >
                  {getProjectSbomsCount('production')}
                </Button>
              </Link>
            </Tooltip>
          </Stack>
        )
      },
      width: '20%',
      wrap: true
    },
    // ACTIONS
    {
      id: 'ACTIONS',
      name: '',
      selector: (row) => {
        const { enabled } = row
        return (
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FaEllipsisV />}
              variant='none'
              color='gray.400'
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
                <Divider />
                {/* UPLOAD SBOM */}
                <MenuItem
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
                  color='red'
                  onClick={() => {
                    setActiveRow(row)
                    onDeleteOpen()
                  }}
                  isDisabled={!canArchiveProduct}
                >
                  Archive Product
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
    data: data || [],
    onSort: handleSort,
    customStyles: customStyles(headColor, dividerColor),
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
      <Card>
        <Flex flexDir={'column'} width={'100%'}>
          <DataTable {...dataTableProps} />
          <Pagination {...paginationProps} />
        </Flex>
      </Card>

      {/* UPLOAD SBOM */}
      {isOpenUpload && (
        <UploadModal
          data={activeRow}
          isOpen={isOpenUpload}
          onClose={onCloseUpload}
          activeEnv={productId}
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
          onClose={onDeleteClose}
          onConfirm={onProductDelete}
          name={activeRow.name}
          title='Archive Product'
          description='Archiving this product will:'
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
          isOpen={isWarningOpen}
          onClose={onWarningClose}
          group={activeRow}
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
      {isOpenLabel && (
        <LabelDrawer isOpen={isOpenLabel} onClose={onCloseLabel} />
      )}
    </>
  )
}

export default ProductTable

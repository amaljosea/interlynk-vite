import { useMemo } from 'react'
import {
  getFormat,
  getFullDate,
  getLink,
  getSignedUrlParams,
  timeSince,
  truncatedValue
} from 'utils'
import { getType } from 'utils/styleUtils'
import LabelInput from 'views/Dashboard/Products/components/LabelInput'

import {
  Box,
  Divider,
  Fade,
  Flex,
  Menu,
  MenuItem,
  MenuList,
  Link as Olink,
  Portal,
  Stack,
  Text,
  Tooltip
} from '@chakra-ui/react'

import ExpandableText from 'components/ExpandableText'
import IconBox from 'components/Icons/IconBox'
import ProdLabel from 'components/Label/ProdLabel'
import EnvList from 'components/Misc/EnvList'
import LynkAction from 'components/Misc/LynkAction'
import LynkSwitch from 'components/Misc/LynkSwitch'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useHasPermission } from 'hooks/useHasPermission'
import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'
import { useThemeColor } from 'hooks/useThemeColors'

const ProductColumns = (props) => {
  const {
    action,
    handleClick,
    openTagMenu,
    setOpenTagMenu,
    activeRow,
    labelLoading,
    productLabels
  } = props

  const signedUrlParams = getSignedUrlParams()
  const { isFreeTier } = useGlobalQueryContext()
  const { shouldShowDemoFeatures } = useShouldShowDemoFeatures()

  const {
    primaryBlueText,
    primaryTextColor,
    grayBorderColor,
    secondaryBgColor,
    semiTransparentBorder,
    lightAndDarkBgColor,
    primaryErrorColor
  } = useThemeColor([
    'primaryBlueText',
    'primaryTextColor',
    'grayBorderColor',
    'secondaryBgColor',
    'semiTransparentBorder',
    'lightAndDarkBgColor',
    'primaryErrorColor'
  ])

  const canEditProduct = useHasPermission({
    parentKey: 'view_product_group',
    childKey: 'update_product_group'
  })

  const canArchiveProduct = useHasPermission({
    parentKey: 'view_product_group',
    childKey: 'delete_product_group'
  })

  const canEditShareynk = useHasPermission({
    parentKey: 'view_product_group',
    childKey: 'edit_share_lynk'
  })

  const canCreateSBOM = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'update_sbom'
  })

  return useMemo(() => {
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
              onChange={() => action('status_warning', row)}
            />
          )
        },
        width: '100px',
        sortable: !signedUrlParams
      },
      // PRODUCT
      {
        id: 'PROJECT_GROUPS_NAME',
        name: 'PRODUCT NAME',
        selector: (row, index) => {
          const { name, description, labels } = row

          return (
            <Flex
              my={3}
              alignItems={'center'}
              gap={shouldShowDemoFeatures ? 3 : 0}
              className={index === 0 ? 'product' : ''}
            >
              {shouldShowDemoFeatures && (
                <Tooltip label={getFormat(name)} placement='top'>
                  <Olink
                    href={name ? getLink(name) : ''}
                    isExternal={getLink(name) === '' ? false : true}
                  >
                    <IconBox
                      h={'40px'}
                      w={'40px'}
                      bg={secondaryBgColor}
                      color={primaryBlueText}
                    >
                      {getType(name)}
                    </IconBox>
                  </Olink>
                </Tooltip>
              )}
              <Stack spacing={1}>
                <Flex alignItems={'center'} gap={2} flexWrap={'wrap'}>
                  <Text
                    cursor={'pointer'}
                    wordBreak={'break-all'}
                    color={primaryBlueText}
                    aria-label='product_name'
                    data-testid={`product_${name}`}
                    onClick={() => handleClick(row)}
                    sx={{ w: 'fit-content', fontSize: 14 }}
                  >
                    {truncatedValue(name, 50)}
                  </Text>
                  {labels?.map((item, index) => (
                    <ProdLabel key={index} item={item} />
                  ))}
                </Flex>
                <ExpandableText pr={32} text={description} />
              </Stack>
            </Flex>
          )
        },
        width: '54%',
        wrap: true,
        sortable: !signedUrlParams
      },
      // ENVIRONMENT
      {
        id: 'ENVIRONMENTS',
        name: 'ENVIRONMENTS',
        selector: (row) => <EnvList data={row} />,
        width: '20%',
        wrap: true,
        right: signedUrlParams ? true : false
      },
      // UPDATEDAT
      {
        id: 'PROJECT_GROUPS_UPDATED_AT',
        name: 'UPDATED',
        selector: (row) => {
          const { updatedAt } = row
          return (
            <Tooltip label={getFullDate(updatedAt)} placement={'top'}>
              <Text fontSize={14} color={primaryTextColor}>
                {timeSince(updatedAt)}
              </Text>
            </Tooltip>
          )
        },
        sortable: true,
        sortFunction: (a, b) => {
          const dateA = new Date(a.updatedAt)
          const dateB = new Date(b.updatedAt)
          return dateA - dateB
        },
        wrap: true,
        right: 'true'
      },
      // ACTIONS
      {
        id: 'ACTIONS',
        name: '',
        selector: (row) => {
          const { enabled, name } = row
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
                    onClick={() => action('update_product', row)}
                    onMouseEnter={() => setOpenTagMenu(false)}
                    isDisabled={!enabled || !canEditProduct}
                  >
                    Edit Product
                  </MenuItem>
                  <MenuItem
                    hidden={isFreeTier}
                    position={'relative'}
                    closeOnSelect={false}
                    onMouseEnter={() => action('edit_labels', row)}
                    aria-label={`add_label`}
                    isDisabled={!enabled || !canEditProduct}
                    sx={{
                      bg:
                        openTagMenu && activeRow === row
                          ? semiTransparentBorder
                          : 'inherit'
                    }}
                  >
                    Edit Labels
                  </MenuItem>
                  {openTagMenu && !labelLoading && (
                    <Fade initialScale={0.9} in={openTagMenu} delay={0.2}>
                      <Box
                        bottom={0}
                        h={'auto'}
                        right={226}
                        width='220px'
                        borderRadius='md'
                        position='absolute'
                        bg={lightAndDarkBgColor}
                        border={`1px solid ${grayBorderColor}`}
                        onMouseEnter={() => setOpenTagMenu(true)}
                      >
                        <LabelInput
                          data={row}
                          nodes={productLabels}
                          setOpen={setOpenTagMenu}
                          onOpenLabel={() => action('create_labels', null)}
                        />
                      </Box>
                    </Fade>
                  )}
                  {/* UPLOAD SBOM */}
                  <MenuItem
                    aria-label={`upload sbom for ${name}`}
                    isDisabled={!enabled || !canCreateSBOM}
                    onClick={() => action('upload_sbom', row)}
                    onMouseEnter={() => setOpenTagMenu(false)}
                  >
                    Upload SBOM
                  </MenuItem>
                  {/* VIEW SHARELYNK */}
                  <MenuItem
                    isDisabled={!enabled || !canEditShareynk}
                    onClick={() => action('view_sharelynk', row)}
                    onMouseEnter={() => {
                      setOpenTagMenu(false)
                    }}
                  >
                    View ShareLynk
                  </MenuItem>
                  <Divider />
                  {/* ARCHIVE PRODUCT GROUP */}
                  <MenuItem
                    data-testid='delete_product'
                    aria-label={`Delete product ${name}`}
                    color={primaryErrorColor}
                    onClick={() => action('delete_product', row)}
                    onMouseEnter={() => {
                      setOpenTagMenu(false)
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

    return columns
  }, [
    action,
    activeRow,
    canArchiveProduct,
    canCreateSBOM,
    canEditProduct,
    canEditShareynk,
    grayBorderColor,
    handleClick,
    isFreeTier,
    labelLoading,
    lightAndDarkBgColor,
    openTagMenu,
    primaryBlueText,
    primaryErrorColor,
    primaryTextColor,
    productLabels,
    secondaryBgColor,
    semiTransparentBorder,
    setOpenTagMenu,
    shouldShowDemoFeatures,
    signedUrlParams
  ])
}

export default ProductColumns

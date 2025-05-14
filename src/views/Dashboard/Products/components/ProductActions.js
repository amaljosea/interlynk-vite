import { useMutation } from '@apollo/client'
import { useNavigate, useParams } from 'react-router-dom'
import { getSignedUrlParams } from 'utils'

import { Flex, IconButton, Tooltip, useDisclosure } from '@chakra-ui/react'

import DeleteButton from 'components/Icons/DeleteButton'
import EnvList from 'components/Misc/EnvList'
import NotificationMenuBell from 'components/Notifications/NotificationMenuBell'

import { useHasPermission } from 'hooks/useHasPermission'
import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'

import { DeleteProjectGroup } from 'graphQL/Mutation'

import {
  LuChartBar,
  LuPower,
  LuPowerOff,
  LuSquarePen,
  LuUpload
} from 'react-icons/lu'

import ProductProgressModal from '../ProductGraphs/ProductProgressModal'
import ConfirmationModal from './ConfirmationModal'
import ProductModal from './ProductModal'
import StatusModal from './StatusModal'
import UploadModal from './UploadModal'

const ProductActions = ({ data }) => {
  const params = useParams()
  const navigate = useNavigate()
  const signedUrlParams = getSignedUrlParams()
  const { shouldShowDemoFeatures } = useShouldShowDemoFeatures()

  const [projectDelete, { loading }] = useMutation(DeleteProjectGroup)

  const { id, name, description, enabled, defaultProject } = data || ''

  const PRODUCT = useDisclosure()
  const UPLOAD = useDisclosure()
  const WARNING = useDisclosure()
  const DELETE = useDisclosure()
  const PROGRESS = useDisclosure()

  const updateProduct = useHasPermission({
    parentKey: 'view_product_group',
    childKey: 'update_product_group'
  })
  const archiveProduct = useHasPermission({
    parentKey: 'view_product_group',
    childKey: 'archive_product_group'
  })
  const canCreateSBOM = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'update_sbom'
  })

  // DELETE PRODUCT
  const onProductDelete = async () => {
    await projectDelete({
      variables: { id: params?.productgroupid }
    })
      .then((res) => res.data && DELETE.onClose())
      .finally(() => navigate('/vendor/products'))
  }
  return (
    <>
      <Flex alignItems={'flex-end'} flexDir={'column'} gap={3}>
        <EnvList data={data} />
        <Flex direction={'row'} gap={2} justifyContent='flex-end' ml={'auto'}>
          {/* VIEW PRODUCT PROGRESS */}
          {shouldShowDemoFeatures && (
            <Tooltip label='View Product TrailLynk'>
              <IconButton
                icon={<LuChartBar fontSize={18} />}
                colorScheme='blue'
                onClick={PROGRESS.onOpen}
              />
            </Tooltip>
          )}
          {/* Notifications */}
          <NotificationMenuBell />
          {/* EDIT PRODUCT */}
          <Tooltip label='Edit Product'>
            <IconButton
              isDisabled={!enabled || !updateProduct || signedUrlParams}
              colorScheme='blue'
              aria-label='edit_product'
              onClick={PRODUCT.onOpen}
              icon={<LuSquarePen fontSize={18} />}
            />
          </Tooltip>
          {/* UPLOAD SBOM */}
          <Tooltip label='Upload SBOM'>
            <IconButton
              isDisabled={!enabled || signedUrlParams || !canCreateSBOM}
              colorScheme='blue'
              onClick={UPLOAD.onOpen}
              icon={<LuUpload fontSize={18} />}
            />
          </Tooltip>
          {/* UPDATE PRODUCT STATUS */}
          <Tooltip label={enabled ? 'Disable Product' : 'Enable Product'}>
            <IconButton
              name='change_status'
              colorScheme={'blue'}
              onClick={WARNING.onOpen}
              isDisabled={signedUrlParams || !updateProduct}
              icon={
                enabled ? (
                  <LuPower fontSize={18} />
                ) : (
                  <LuPowerOff fontSize={18} />
                )
              }
            />
          </Tooltip>
          {/* ARCHIVE PRODUCT */}
          <DeleteButton
            variant={'solid'}
            aria-label='delete_product'
            onClick={DELETE.onOpen}
            isDisabled={!archiveProduct || signedUrlParams}
            tooltip={'Delete Product'}
          />
        </Flex>
      </Flex>

      {/* CREATE PRODUCT */}
      {PRODUCT.isOpen && (
        <ProductModal
          onClose={PRODUCT.onClose}
          isOpen={PRODUCT.isOpen}
          data={{ id, name, description }}
        />
      )}

      {/* VIEW PRODUCT PROGRESS */}
      {PROGRESS.isOpen && (
        <ProductProgressModal
          onClose={PROGRESS.onClose}
          isOpen={PROGRESS.isOpen}
          name={name}
        />
      )}

      {/* UPLOAD SBOM */}
      {UPLOAD.isOpen && (
        <UploadModal
          isOpen={UPLOAD.isOpen}
          onClose={UPLOAD.onClose}
          group={{ id, name, default: defaultProject?.id }}
        />
      )}

      {/* DISABLED */}
      {WARNING.isOpen && (
        <StatusModal
          isOpen={WARNING.isOpen}
          onClose={WARNING.onClose}
          group={{ id, enabled, name }}
        />
      )}

      {/* DELETE */}
      {DELETE.isOpen && (
        <ConfirmationModal
          name={name}
          isLoading={loading}
          title='Delete Product'
          isOpen={DELETE.isOpen}
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
    </>
  )
}

export default ProductActions

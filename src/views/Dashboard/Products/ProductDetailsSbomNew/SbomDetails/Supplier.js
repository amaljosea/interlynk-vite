import { useMutation } from '@apollo/client'
import { useState } from 'react'
import PriSupplierModal from 'views/Sbom/components/PriSupplierModal'

import { Flex, useDisclosure } from '@chakra-ui/react'

import ActiveBtn from 'components/Misc/ActiveBtn'
import SupplierTag from 'components/SupplierTag'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useThemeColor } from 'hooks/useThemeColors'

import { supplierDelete } from 'graphQL/Mutation'

import ConfirmationModal from '../../components/ConfirmationModal'

const Supplier = ({ data, permission }) => {
  const { isFreeTier } = useGlobalQueryContext()
  const { primaryBlueText, sameSecondaryText } = useThemeColor([
    'primaryBlueText',
    'sameSecondaryText'
  ])

  const SUPPLIER = useDisclosure()
  const DELETE_SUPPLIER = useDisclosure()

  const [deleteSupplier, { loading }] = useMutation(supplierDelete, {
    refetchQueries: ['SingleSbomScore', 'GetProductData']
  })

  const [activeTool, setActiveTool] = useState(null)

  const onDeleteSup = (item) => {
    setActiveTool(item)
    DELETE_SUPPLIER?.onOpen()
  }

  const handleSupRemove = async (id) => {
    await deleteSupplier({ variables: { id: id } })
      .then((res) => res.data)
      .finally(() => DELETE_SUPPLIER?.onClose())
  }

  const supplierExists = data?.length > 0

  return (
    <>
      <Flex flexWrap={'wrap'} alignItems={'center'} gap={2}>
        {supplierExists &&
          data?.map((item, index) => (
            <SupplierTag
              key={index}
              item={item}
              editable={true}
              onDelete={() => onDeleteSup(item)}
            />
          ))}
        <ActiveBtn
          hidden={permission}
          label={'supplier_edit'}
          onClick={SUPPLIER?.onOpen}
          editable={supplierExists ? true : false}
          title={supplierExists ? 'Update' : 'Add Supplier'}
          color={supplierExists ? sameSecondaryText : primaryBlueText}
        />
      </Flex>

      {/* SUPPLIER MODAL */}
      {SUPPLIER?.isOpen && (
        <PriSupplierModal
          activeRow={data}
          isFreeTier={isFreeTier}
          isOpen={SUPPLIER?.isOpen}
          onClose={SUPPLIER?.onClose}
          ruleExists={true}
        />
      )}

      {/* SUPPLIER DELETE MODAL */}
      {DELETE_SUPPLIER?.isOpen && (
        <ConfirmationModal
          isLoading={loading}
          name={activeTool?.name}
          title={'Remove Supplier'}
          isOpen={DELETE_SUPPLIER?.isOpen}
          onClose={DELETE_SUPPLIER?.onClose}
          onConfirm={() => handleSupRemove(activeTool?.id)}
          description={`You are about to delete the Supplier : ${activeTool?.name} from this version.`}
        />
      )}
    </>
  )
}

export default Supplier

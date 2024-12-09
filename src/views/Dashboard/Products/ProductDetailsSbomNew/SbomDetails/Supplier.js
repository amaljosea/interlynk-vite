import { useMutation } from '@apollo/client'
import { useState } from 'react'
import PriSupplierModal from 'views/Sbom/components/PriSupplierModal'

import { useDisclosure } from '@chakra-ui/react'

import ActiveBtn from 'components/Misc/ActiveBtn'
import SupplierTag from 'components/SupplierTag'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useThemeColor } from 'hooks/useThemeColors'

import { supplierDelete } from 'graphQL/Mutation'

import ConfirmationModal from '../../components/ConfirmationModal'

const Supplier = ({ data, permission }) => {
  const { isFreeTier } = useGlobalQueryContext()
  const { primaryBlueText } = useThemeColor(['primaryBlueText'])

  const SUPPLIER = useDisclosure()
  const DELETE_SUPPLIER = useDisclosure()

  const [deleteSupplier, { loading }] = useMutation(supplierDelete)

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

  return (
    <>
      {data?.length > 0 ? (
        data?.map((item, index) => (
          <SupplierTag
            key={index}
            item={item}
            editable={true}
            premission={permission}
            onEdit={SUPPLIER?.onOpen}
            onDelete={() => onDeleteSup(item)}
          />
        ))
      ) : (
        <ActiveBtn
          title=' Add Supplier'
          color={primaryBlueText}
          onClick={SUPPLIER?.onOpen}
        />
      )}

      {/* SUPPLIER MODAL */}
      <PriSupplierModal
        activeRow={data}
        isFreeTier={isFreeTier}
        isOpen={SUPPLIER?.isOpen}
        onClose={SUPPLIER?.onClose}
      />

      {/* SUPPLIER DELETE MODAL */}
      <ConfirmationModal
        isLoading={loading}
        name={activeTool?.name}
        title={'Remove Supplier'}
        isOpen={DELETE_SUPPLIER?.isOpen}
        onClose={DELETE_SUPPLIER?.onClose}
        onConfirm={() => handleSupRemove(activeTool?.id)}
        description={`You are about to delete the Supplier : ${activeTool?.name} from this version.`}
      />
    </>
  )
}

export default Supplier

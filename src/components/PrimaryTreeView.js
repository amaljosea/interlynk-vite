import { useLazyQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { getSignedUrlParams } from 'utils'

import { IconButton, Tooltip, useDisclosure } from '@chakra-ui/react'

import { useGlobalState } from 'hooks/useGlobalState'

import { GetPrimaryComponent } from 'graphQL/Queries'

import { PiTreeStructure } from 'react-icons/pi'

import TreeView from './TreeView'

const PrimaryTreeView = ({ updateSboms, status, noPrimaryComp }) => {
  const params = useParams()
  const { prodCompState } = useGlobalState()
  const signedUrlParams = getSignedUrlParams()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { field, direction } = prodCompState

  const [getPrimaryComp, { data, loading }] = useLazyQuery(GetPrimaryComponent)

  const { nodes } = data?.sbom?.components || ''

  const handleClick = async () => {
    await getPrimaryComp({
      variables: {
        projectId: signedUrlParams ? undefined : params.productid,
        sbomId: params?.sbomid,
        primary: true,
        field,
        direction
      }
    }).then((res) => res?.data && onOpen())
  }

  return (
    <>
      <Tooltip label={'Relationships'}>
        <IconButton
          colorScheme='blue'
          isLoading={loading}
          onClick={handleClick}
          hidden={signedUrlParams}
          icon={<PiTreeStructure size={18} />}
          isDisabled={status === 'signed' || !updateSboms || noPrimaryComp}
        />
      </Tooltip>

      {isOpen && data && (
        <TreeView
          isOpen={isOpen}
          onClose={onClose}
          component={nodes?.length > 0 ? nodes[0] : null}
        />
      )}
    </>
  )
}

export default PrimaryTreeView

import { useLazyQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { getSignedUrlParams } from 'utils'

import { IconButton, Tooltip, useDisclosure } from '@chakra-ui/react'

import { useGlobalState } from 'hooks/useGlobalState'

import { GetPrimaryComponent, GetSharPrimartComp } from 'graphQL/Queries'

import { PiTreeStructure } from 'react-icons/pi'

import TreeView from './TreeView'

const PrimaryTreeView = ({ updateSboms, status, noPrimaryComp }) => {
  const params = useParams()
  const { prodCompState } = useGlobalState()
  const signedUrlParams = getSignedUrlParams()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { field, direction } = prodCompState

  const [getPrimaryComp, { data, loading }] = useLazyQuery(
    signedUrlParams ? GetSharPrimartComp : GetPrimaryComponent
  )

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
      <Tooltip label={'Graph View'}>
        <IconButton
          colorScheme='blue'
          isLoading={loading}
          onClick={handleClick}
          icon={<PiTreeStructure size={20} />}
          display={signedUrlParams ? 'none' : 'flex'}
          isDisabled={status === 'signed' || !updateSboms || noPrimaryComp}
        />
      </Tooltip>

      {isOpen && data && (
        <TreeView
          isOpen={isOpen}
          onClose={onClose}
          compId={nodes?.length > 0 ? nodes[0].id : null}
        />
      )}
    </>
  )
}

export default PrimaryTreeView

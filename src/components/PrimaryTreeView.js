import { useLazyQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { getSignedUrlParams } from 'utils'

import { IconButton, Tooltip, useDisclosure } from '@chakra-ui/react'

import { GetPrimaryComponent } from 'graphQL/Queries'

import { LuNetwork } from 'react-icons/lu'

import TreeView from './TreeView'

const PrimaryTreeView = ({ updateSboms, status, noPrimaryComp }) => {
  const params = useParams()
  const signedUrlParams = getSignedUrlParams()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [getPrimaryComp, { data, loading }] = useLazyQuery(GetPrimaryComponent)

  const { nodes } = data?.sbom?.components || {}

  const handleClick = async () => {
    await getPrimaryComp({
      variables: {
        projectId: signedUrlParams ? undefined : params.productid,
        sbomId: params?.sbomid,
        primary: true
      }
    }).then((res) => res?.data && onOpen())
  }

  return (
    <>
      <Tooltip label={'View Relationships'}>
        <IconButton
          colorScheme='blue'
          isLoading={loading}
          onClick={handleClick}
          hidden={signedUrlParams}
          icon={<LuNetwork size={18} />}
          isDisabled={status === 'signed' || !updateSboms || noPrimaryComp}
        />
      </Tooltip>

      {isOpen && nodes?.length > 0 && (
        <TreeView isOpen={isOpen} onClose={onClose} component={nodes[0]} />
      )}
    </>
  )
}

export default PrimaryTreeView

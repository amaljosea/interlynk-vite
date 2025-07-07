import { useMutation, useQuery } from '@apollo/client'
import { useRef, useState } from 'react'

import { Flex, useDisclosure } from '@chakra-ui/react'

import LynkTable from 'components/LynkTable'
import SecurityTokenColumns from 'components/columns/SecurityTokenColumns'
import SecurityTokenHeader from 'components/headers/SecurityTokenHeader'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import useQueryParam from 'hooks/useQueryParam'

import { deleteApiToken, updateApiToken } from 'graphQL/Mutation'
import { GetApiKeys } from 'graphQL/Queries'

import TokenModal from './TokenModal'

const TokenInfo = () => {
  const activetab = useQueryParam('tab')
  const { orgView } = useGlobalQueryContext()
  const TOKEN = useDisclosure()

  const tokenRef = useRef(null)
  const [activeRow, setActiveRow] = useState(null)

  const [deleteToken] = useMutation(deleteApiToken, {
    refetchQueries: ['GetApiKeys']
  })
  const [updateToken] = useMutation(updateApiToken, {
    refetchQueries: ['GetApiKeys']
  })

  const { data, loading } = useQuery(GetApiKeys, {
    skip: !orgView || activetab !== 'security tokens'
  })
  const { apiKeys } = data?.organization?.currentUser || {}

  const handleDelete = () => {
    deleteToken({ variables: { apiKeyId: activeRow?.id } }).then(
      (res) => res && TOKEN.onClose()
    )
  }

  const handleRevoked = (id) => {
    updateToken({
      variables: { id: id, revoked: new Date().toISOString() }
    }).then((res) => res?.data && TOKEN.onClose())
  }

  const action = (type, data) => {
    setActiveRow(data)
    switch (type) {
      case 'revoke_token':
        return handleRevoked(data?.id)
      case 'update_token':
        return TOKEN.onOpen()
      case 'delete_token':
        return handleDelete()
      default:
        return TOKEN.onOpen()
    }
  }

  // HEADER
  const subHeader = SecurityTokenHeader({ action, tokenRef })

  // COLUMNS
  const columns = SecurityTokenColumns({ action })

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <LynkTable
          subHeader
          columns={columns}
          data={apiKeys || []}
          progressPending={loading}
          defaultSortFieldId={'updated'}
          subHeaderComponent={subHeader}
        />
      </Flex>

      {TOKEN.isOpen && (
        <TokenModal
          data={activeRow}
          isOpen={TOKEN.isOpen}
          onClose={TOKEN.onClose}
        />
      )}
    </>
  )
}

export default TokenInfo

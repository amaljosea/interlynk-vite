import { useMutation } from '@apollo/client'
import { useMemo, useState } from 'react'
import ConfirmationModal from 'views/Dashboard/Products/components/ConfirmationModal'

import { Flex, Tooltip, useDisclosure } from '@chakra-ui/react'
import { IconButton } from '@chakra-ui/react'

import RefreshBtn from 'components/Icons/RefreshBtn'
import LynkTable from 'components/LynkTable'
import CustomVuln from 'components/Modal/CustomVuln'
import Pagination from 'components/Pagination'
import CustomVulnColumns from 'components/columns/CustomVulnColumns'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import useQueryParam from 'hooks/useQueryParam'

import { CustomVulnDelete } from 'graphQL/Mutation'
import { GetCustomVulns } from 'graphQL/Queries'

import { LuCirclePlus } from 'react-icons/lu'

const CustomVulnTable = () => {
  const tab = useQueryParam('tab')
  const { showToast } = useCustomToast()
  const { isFreeTier } = useGlobalQueryContext()

  const editVulns = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'edit_vulnerabilities'
  })

  const EDIT = useDisclosure()
  const DELETE = useDisclosure()
  const [activeRow, setActiveRow] = useState(null)

  const [deleteVuln, { loading: deleteLoading }] = useMutation(CustomVulnDelete)
  const { nodes, paginationProps, loading } = usePaginatedQuery(
    GetCustomVulns,
    {
      skip: tab === 'customVulnerabilities' && editVulns ? false : true,
      selector: 'organization.customVulns'
    }
  )

  const handleWarning = (row) => {
    setActiveRow(row)
    DELETE.onOpen()
  }

  const handleRemove = (id) => {
    deleteVuln({ variables: { id: id } }).then((res) => {
      if (res?.data?.customVulnDelete?.errors?.length > 0) {
        showToast({
          description: res?.data?.customVulnDelete?.errors[0],
          status: 'error'
        })
      } else {
        showToast({
          description: 'Vulnerability removed successfully',
          status: 'success'
        })
        DELETE.onClose()
      }
    })
  }

  const SubHeader = useMemo(() => {
    return (
      <Flex gap={2} alignItems={'center'} justifyContent={'flex-end'}>
        {!isFreeTier && (
          <Tooltip label={'Add Custom Vulnerability'}>
            <IconButton
              onClick={EDIT.onOpen}
              icon={<LuCirclePlus size={18} />}
              colorScheme='blue'
              isDisabled={!editVulns}
            />
          </Tooltip>
        )}
        <RefreshBtn queries={['GetCustomVulns']} />
      </Flex>
    )
  }, [editVulns, isFreeTier, EDIT.onOpen])

  const columns = CustomVulnColumns({ handleWarning })

  return (
    <>
      {/* TABLE */}
      <Flex flexDir={'column'} width={'100%'}>
        <LynkTable
          subHeader
          data={nodes}
          keyField='key'
          columns={columns}
          progressPending={loading}
          subHeaderComponent={SubHeader}
        />
        <Pagination {...paginationProps} />
      </Flex>

      {/* EDIT CUSTOM VULNS */}
      {EDIT.isOpen && (
        <CustomVuln isOpen={EDIT.isOpen} onClose={EDIT.onClose} />
      )}

      {/* DELETE CUSTOM VULN */}
      {DELETE.isOpen && (
        <ConfirmationModal
          name={activeRow?.name}
          isOpen={DELETE?.isOpen}
          onClose={DELETE?.onClose}
          isLoading={deleteLoading}
          title={'Remove Vulnerability'}
          onConfirm={() => handleRemove(activeRow?.id)}
          description={`You are about to delete the custom vulnerability`}
        />
      )}
    </>
  )
}

export default CustomVulnTable

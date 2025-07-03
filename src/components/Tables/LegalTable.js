import { useMutation, useQuery } from '@apollo/client'
import React, { useState } from 'react'
import ConfirmationModal from 'views/Dashboard/Products/components/ConfirmationModal'
import LegalModal from 'views/Dashboard/Profile/components/LegalModal'

import { Flex, useDisclosure } from '@chakra-ui/react'

import LynkTable from 'components/LynkTable'
import ManufacturerColumns from 'components/columns/ManufacturerColumns'
import ManufacturerHeader from 'components/headers/ManufacturerHeader'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import useQueryParam from 'hooks/useQueryParam'

import { OrganizationManufacturerDelete } from 'graphQL/Mutation'
import { GetOrgManufacturers } from 'graphQL/Queries'

const LegalTable = () => {
  const { showToast } = useCustomToast()
  const activetab = useQueryParam('tab')
  const { orgView } = useGlobalQueryContext()

  const [activeRow, setActiveRow] = useState(null)

  const { data, loading } = useQuery(GetOrgManufacturers, {
    skip: !orgView ? true : activetab === 'legal' ? false : true
  })

  const { nodes } = data?.organizationManufacturers || {}

  const EDIT = useDisclosure()
  const ARCHIVE = useDisclosure()

  const existingData = data?.nodes?.map((item) =>
    item?.organizationName?.toLowerCase()
  )

  const [deleteMfc] = useMutation(OrganizationManufacturerDelete, {
    refetchQueries: ['GetOrgManufacturers']
  })

  const handleDelete = async (id) => {
    await deleteMfc({
      variables: {
        id
      }
    }).then((res) => {
      const errors = res?.data?.organizationManufacturerDelete?.errors
      if (errors?.length > 0) {
        showToast({
          description: errors[0],
          status: 'error'
        })
      } else {
        ARCHIVE.onClose()
      }
    })
  }

  const handleUpdate = (row) => {
    setActiveRow(row)
    EDIT.onOpen()
  }

  const handleArchive = (row) => {
    setActiveRow(row)
    ARCHIVE.onOpen()
  }

  // SUB HEADER
  const subHeader = ManufacturerHeader({ handleUpdate })

  // COLUMNS
  const columns = ManufacturerColumns({ handleUpdate, handleArchive })

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <LynkTable
          subHeader
          columns={columns}
          data={nodes || []}
          progressPending={loading}
          subHeaderComponent={subHeader}
        />
      </Flex>

      {EDIT.isOpen && (
        <LegalModal
          data={activeRow}
          isOpen={EDIT.isOpen}
          onClose={EDIT.onClose}
          orgs={existingData}
        />
      )}

      {/* ARCHIVE CONFIRMTION MODAL */}
      {ARCHIVE.isOpen && (
        <ConfirmationModal
          isOpen={ARCHIVE.isOpen}
          onClose={ARCHIVE.onClose}
          onConfirm={() => handleDelete(activeRow?.id)}
          name={activeRow?.organizationName}
          title='Archive Manufacturer'
          description='This action will archive this Manufacturer'
        />
      )}
    </>
  )
}

export default LegalTable

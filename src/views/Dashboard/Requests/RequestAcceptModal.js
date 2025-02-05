import { useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'
import { truncatedValue } from 'utils'

import { Flex, FormControl, FormLabel, Select } from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'

import { RequestAccept } from 'graphQL/Mutation'
import { GetProductNamesForRequest } from 'graphQL/Queries'

import { FaCheckToSlot } from 'react-icons/fa6'

const RequestAcceptModal = ({ data, isOpen, onClose }) => {
  const { showToast } = useCustomToast()

  const [acceptRequest, { loading }] = useMutation(RequestAccept)

  const { data: productNames } = useQuery(GetProductNamesForRequest)

  const [projectId, setProjectId] = useState('')
  const [productName, setProductName] = useState('')
  const [projectIds, setProjectIds] = useState([])

  const handleAccept = async () => {
    await acceptRequest({
      variables: {
        id: data?.id,
        projectId: projectId
      }
    }).then((res) => {
      if (res?.data?.requestAccept?.errors?.length === 0) {
        showToast({
          description: `SBOM copied into Product ${productName}`,
          status: 'success'
        })
        onClose()
      } else {
        showToast({
          description: "Couldn't accept request",
          status: 'error'
        })
      }
    })
  }

  const handleProductChange = (e) => {
    const projectGroupId = e.target.value
    setProductName(e.target.options[e.target.selectedIndex].text)

    const projectGroup = productNames?.organization?.projectGroups?.nodes?.find(
      (group) => group.id === projectGroupId
    )

    if (projectGroup) {
      setProjectIds(
        projectGroup.projects.map((project) => ({
          id: project.id,
          name: project.name
        }))
      )
    } else {
      setProjectIds([])
    }
  }

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      title={'Accept SBOM'}
      buttonText='Accept'
      isLoading={loading}
      onSubmit={handleAccept}
      Icon={FaCheckToSlot}
    >
      <Flex width={'100%'} direction={'column'} gap={4}>
        <FormControl isRequired>
          <FormLabel>Product</FormLabel>
          <Select fontSize={'sm'} onChange={handleProductChange}>
            <option value=''>-- Select --</option>
            {productNames?.organization?.projectGroups?.nodes?.map(
              (item, index) => (
                <option key={index} value={item.id}>
                  {truncatedValue(item.name, 24)}
                </option>
              )
            )}
          </Select>
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Environment</FormLabel>
          <Select
            fontSize={'sm'}
            onChange={(e) => {
              setProjectId(e.target.value)
            }}
            value={projectId}
            textTransform={'capitalize'}
          >
            <option value=''>Select Environment</option>
            {projectIds
              ?.sort((a, b) => a?.name?.localeCompare(b?.name))
              ?.map((item, index) => (
                <option key={index} value={item.id}>
                  {truncatedValue(item.name, 24)}
                </option>
              ))}
          </Select>
        </FormControl>
      </Flex>
    </LynkModal>
  )
}

export default RequestAcceptModal

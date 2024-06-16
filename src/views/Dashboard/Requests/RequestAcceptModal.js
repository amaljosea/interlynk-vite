import { useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'

import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  useToast
} from '@chakra-ui/react'

import { RequestAccept } from 'graphQL/Mutation'
import { GetProductNamesForRequest } from 'graphQL/Queries'

const RequestAcceptModal = ({ data, isOpen, onClose }) => {
  const toast = useToast()

  const [acceptRequest] = useMutation(RequestAccept)

  const { data: productNames } = useQuery(GetProductNamesForRequest)

  const [projectId, setProjectId] = useState('')
  const [productName, setProductName] = useState('')
  const [projectIds, setProjectIds] = useState([])

  const handleAccept = async (e) => {
    e.preventDefault()

    const res = await acceptRequest({
      variables: {
        id: data?.id,
        projectId: projectId
      }
    })

    if (!res?.data?.requestAccept?.errors?.length > 0) {
      toast({
        description: `SBOM copied into Product ${productName}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top'
      })
      onClose()
    } else {
      toast({
        title: 'Error',
        description: "Couldn't accept request",
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top'
      })
    }
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
    <Modal
      size='lg'
      isOpen={isOpen}
      onClose={onClose}
      motionPreset='slideInBottom'
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <ModalOverlay />
      <form onSubmit={handleAccept}>
        <ModalContent>
          <ModalHeader>Accept SBOM</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex width={'100%'} direction={'column'} gap={4}>
              <FormControl isRequired>
                <FormLabel>Product</FormLabel>
                <Select bg={'white'} onChange={handleProductChange}>
                  <option value=''>Select Product</option>
                  {productNames?.organization?.projectGroups?.nodes?.map(
                    (item, index) => (
                      <option key={index} value={item.id}>
                        {item.name}
                      </option>
                    )
                  )}
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Environment</FormLabel>
                <Select
                  bg={'white'}
                  onChange={(e) => {
                    setProjectId(e.target.value)
                  }}
                  value={projectId}
                  textTransform={'capitalize'}
                >
                  <option value=''>Select Environment</option>
                  {projectIds.map((item, index) => (
                    <option key={index} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='gray' mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme='blue' type='submit'>
              Accept
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  )
}

export default RequestAcceptModal

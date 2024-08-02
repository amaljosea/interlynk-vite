import { useMutation } from '@apollo/client'
import { useState } from 'react'

import {
  Button,
  Flex,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Stack,
  Tag,
  Text,
  UnorderedList,
  useToast
} from '@chakra-ui/react'

import { useGlobalState } from 'hooks/useGlobalState'

import { sbomDelete } from 'graphQL/Mutation'

const DeleteSbom = ({ isOpen, onClose, data, refetch }) => {
  const toast = useToast()
  const { id, projectVersion } = data || ''
  const { setClearSelect, setSelectedSbom } = useGlobalState()

  const [deleteSbom] = useMutation(sbomDelete)

  const [isLoading, setIsLoading] = useState(false)

  const onDelete = () => {
    setIsLoading(true)
    deleteSbom({
      variables: {
        id: id
      }
    }).then((res) => {
      const { errors } = res?.data?.sbomDelete || ''
      if (errors?.length > 0) {
        toast({
          description: errors[0],
          position: 'top',
          status: 'error',
          duration: 3000
        })
      } else {
        setIsLoading(false)
        setClearSelect(true)
        setSelectedSbom([])
        refetch()
        onClose()
      }
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Delete Version</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Tag py={1} colorScheme='blue' mb={3} wordBreak={'break-all'}>
            {projectVersion}
          </Tag>
          <Text>Deleting this version will: </Text>
          <UnorderedList>
            <Flex flexDir={'column'} gap={1} mt={4}>
              {[
                'remove this versions and its SBOM',
                'remove access to this version for all users'
              ].map((item, index) => (
                <ListItem key={index}>{item}</ListItem>
              ))}
            </Flex>
          </UnorderedList>
          <Text mt={10}>Are you sure you wish to continue?</Text>
        </ModalBody>
        <ModalFooter>
          <Flex
            width={'100%'}
            alignItems={'center'}
            justifyContent={'space-between'}
            gap={4}
          >
            <Stack>{isLoading && <Spinner color='red.500' />}</Stack>
            <Stack direction='row' alignItems='center' gap={1}>
              <Button onClick={onClose}>No</Button>
              <Button colorScheme='red' onClick={onDelete} disabled={isLoading}>
                {isLoading ? 'Deleting...' : 'Yes'}
              </Button>
            </Stack>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default DeleteSbom

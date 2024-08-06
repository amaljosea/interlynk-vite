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

import { sbomUpdate } from 'graphQL/Mutation'

const ArchiveSbom = ({ isOpen, onClose, data }) => {
  const toast = useToast()
  const { id, spec, lifecycle, projectVersion } = data || ''
  const { setClearSelect, setSelectedSbom } = useGlobalState()

  const isArchived = lifecycle === 'archived'

  const [updateSbom] = useMutation(sbomUpdate)

  const [isLoading, setIsLoading] = useState(false)

  const onArchive = () => {
    setIsLoading(true)
    updateSbom({
      variables: {
        id,
        spec,
        archived: isArchived ? false : true
      }
    }).then((res) => {
      const { errors } = res?.data?.sbomUpdate || ''
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
        onClose()
      }
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{isArchived ? 'Restore' : 'Archive'} Version</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Tag py={1} colorScheme='blue' mb={3} wordBreak={'break-all'}>
            {projectVersion}
          </Tag>
          <Text>Archiving this version will: </Text>
          <UnorderedList>
            <Flex flexDir={'column'} gap={1} mt={4}>
              {[
                `${isArchived ? 'Add' : 'Remove'} this version to the list`,
                `${isArchived ? 'Enable' : 'Disable'} access to the version for all users`,
                `${isArchived ? 'Enable' : 'Disable'} checks, monitoring and notifications for this version`
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
              <Button
                onClick={onArchive}
                disabled={isLoading}
                colorScheme={isArchived ? 'green' : 'red'}
              >
                {isLoading ? 'Updating...' : 'Yes'}
              </Button>
            </Stack>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ArchiveSbom

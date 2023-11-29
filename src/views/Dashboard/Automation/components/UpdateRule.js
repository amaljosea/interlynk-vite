import { useMutation } from '@apollo/client'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  FormControl,
  FormLabel,
  Select,
  Input,
  Button
} from '@chakra-ui/react'
import { UpdateAutomation } from 'graphQL/Mutation'
import { useState, useEffect } from 'react'

const UpdateRule = ({ isOpen, onClose, data, getData, productId }) => {
  const [compName, setCompName] = useState('')
  const [compVersion, setCompVersion] = useState('')
  const [condition, setCondition] = useState('')

  const [updateAutoCheck] = useMutation(UpdateAutomation)

  useEffect(() => {
    if (data) {
      // console.log('data', data)
      setCompName(
        data.applicability === 'component' ? data.lookup.comp_name : ''
      )
      setCompVersion(
        data.applicability === 'component' ? data.lookup.comp_version : ''
      )
      setCondition(data.condition)
    }
  }, [data])

  const handleUpdate = async () => {
    await updateAutoCheck({
      variables: {
        id: data.id,
        projectId: productId,
        condition: condition,
        enabled: true,
        compName: compName,
        compVersion: compVersion
      }
    })
      .then(
        (res) =>
          res.data &&
          getData({
            variables: {
              id: productId,
              first: 25
            }
          })
      )
      .finally(() => onClose())
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Update Rule</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack alignItems={'flex-start'} spacing={3}>
            {/* COMPONENT NAME */}
            <FormControl
              display={data.applicability === 'component' ? 'block' : 'none'}
            >
              <FormLabel htmlFor='compName'>Component Name</FormLabel>
              <Input
                id='compName'
                name='compName'
                value={compName}
                onChange={(e) => setCompName(e.target.value)}
                placeholder='Add component name'
              />
            </FormControl>

            {/* COMPONENT VERSION */}
            <FormControl
              display={data.applicability === 'component' ? 'block' : 'none'}
            >
              <FormLabel htmlFor='compVersion'>Component Version</FormLabel>
              <Input
                id='compVersion'
                name='compVersion'
                value={compVersion}
                onChange={(e) => setCompVersion(e.target.value)}
                placeholder='Add component version'
              />
            </FormControl>

            {/* CONDITION */}
            <FormControl>
              <FormLabel htmlFor='condition'>Condition</FormLabel>
              <Select
                id='condition'
                name='condition'
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              >
                <option value=''>-- Select --</option>
                <option value='missing'>Missing</option>
                <option value='always'>Always</option>
              </Select>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            Close
          </Button>
          <Button colorScheme='blue' onClick={handleUpdate}>
            Update
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default UpdateRule

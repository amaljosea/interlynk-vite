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
  Button,
  Text,
  AlertDescription,
  AlertIcon,
  Alert
} from '@chakra-ui/react'
import { UpdateAutomation } from 'graphQL/Mutation'
import { useState, useEffect } from 'react'

const UpdateRule = ({ isOpen, onClose, data, refetch, productId }) => {
  const [value, setValue] = useState('')
  const [condition, setCondition] = useState('')
  const [error, setError] = useState([])

  const [updateAutoCheck] = useMutation(UpdateAutomation)

  useEffect(() => {
    if (data) {
      setValue(data.setTo.value || '')
      setCondition(data.condition)
    }
  }, [])

  const handleUpdate = async () => {
    await updateAutoCheck({
      variables: {
        id: data.id,
        projectId: productId,
        condition: condition,
        enabled: data.enabled,
        set: JSON.stringify({ value: value })
      }
    }).then((res) => {
      if (res.data.autoCheckUpdate.errors.length === 0) {
        refetch({ variables: { id: productId } })
        onClose()
      } else {
        setError(res.data.autoCheckUpdate.errors)
      }
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Update Rule</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack alignItems={'flex-start'} spacing={3}>
            {error?.length > 0 && (
              <Alert status='error' borderRadius={4} my={2}>
                <AlertIcon />
                <AlertDescription>
                  {error.map((item, index) => (
                    <Text fontSize={'sm'} key={index}>
                      {item}
                    </Text>
                  ))}
                </AlertDescription>
              </Alert>
            )}

            {/* VALUE */}
            <FormControl>
              <FormLabel htmlFor='value'>Value</FormLabel>
              <Input
                id='value'
                name='value'
                value={value}
                onChange={(e) => {
                  setValue(e.target.value)
                  setError([])
                }}
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

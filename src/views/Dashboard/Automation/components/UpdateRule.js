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
  const [applicability, setApplicability] = useState('')
  const [compName, setCompName] = useState('')
  const [compVersion, setCompVersion] = useState('')
  const [condition, setCondition] = useState('')
  const [attribute, setAttribute] = useState('')

  const [updateAutoCheck] = useMutation(UpdateAutomation)

  console.log('data', data)

  useEffect(() => {
    if (data) {
      setApplicability(data.applicability)
      setCompName(data.lookup.comp_name)
      setCompVersion(data.lookup.comp_version)
      setCondition(data.condition)
      setAttribute(data.attrName)
    }
  }, [data])

  const handleUpdate = async () => {
    await updateAutoCheck({
      variables: {
        autoCheckId: data.id,
        projectId: productId,
        applicable: applicability,
        condition: condition,
        attr: attribute,
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
            {/* APPLICABILITY */}
            <FormControl>
              <FormLabel htmlFor='applicability'>Rule Applies To</FormLabel>
              <Select
                id='applicability'
                name='applicability'
                value={applicability}
                onChange={(e) => setApplicability(e.target.value)}
              >
                <option value=''>-- Select --</option>
                <option value='document'>Document</option>
                <option value='component'>Component</option>
              </Select>
            </FormControl>
            {/* COMPONENT NAME */}
            {applicability === 'component' && (
              <FormControl>
                <FormLabel htmlFor='compName'>Component Name</FormLabel>
                <Input
                  id='compName'
                  name='compName'
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  placeholder='Add component name'
                />
              </FormControl>
            )}
            {/* COMPONENT VERSION */}
            {applicability === 'component' && (
              <FormControl>
                <FormLabel htmlFor='compVersion'>Component Version</FormLabel>
                <Input
                  id='compVersion'
                  name='compVersion'
                  value={compVersion}
                  onChange={(e) => setCompVersion(e.target.value)}
                  placeholder='Add component version'
                />
              </FormControl>
            )}
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
            {/* ATTRIBUTE */}
            <FormControl>
              <FormLabel htmlFor='attribute'>Attribute</FormLabel>
              <Select
                id='attribute'
                name='attribute'
                value={attribute}
                onChange={(e) => setAttribute(e.target.value)}
              >
                <option value=''>-- Select --</option>
                <option value='author'>Author</option>
                <option value='name'>Name</option>
                <option value='cpe'>CPE</option>
                <option value='kind'>Kind</option>
                <option value='license_spdx'>License {`(SPDX)`}</option>
                <option value='license_custom'>License {`(Custom)`}</option>
                <option value='license_exp'>License {`(Expression)`}</option>
                <option value='perl'>PERL</option>
                <option value='primary'>Primary</option>
                <option value='uniq_serial'>Unique Serial</option>
                <option value='supplier'>Supplier</option>
                <option value='tool'>Tool</option>
                <option value='version'>Version</option>
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

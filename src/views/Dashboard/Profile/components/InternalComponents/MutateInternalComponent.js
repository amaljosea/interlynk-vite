import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'

import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Switch,
  Text,
  UnorderedList,
  useToast
} from '@chakra-ui/react'

import { updateOrgComp } from 'graphQL/Mutation'
import { createOrgComp } from 'graphQL/Mutation'
import { getInternalComponents } from 'graphQL/Queries'

import { TextRegex } from './TestRegex'

const checkIfRegexError = (text) => text.includes('not a valid regex')
const checkIfDuplicateError = (text) =>
  text.includes('str has already been taken')

export const UpdateInternalComponent = ({ onClose, internalComponent }) => {
  const isEdit = !!internalComponent
  const [matchStr, setMatchStr] = useState(internalComponent?.matchStr || '')
  const [errorText, setErrorText] = useState(null)
  const [ignoreCase, setIgnoreCase] = useState(!!internalComponent?.ignoreCase)
  const [enabled, setEnabled] = useState(!!internalComponent?.enabled)
  const toast = useToast()
  const mutateText = isEdit ? 'Update' : 'Tag'

  const [mutate, { loading }] = useMutation(
    isEdit ? updateOrgComp : createOrgComp,
    {
      refetchQueries: [getInternalComponents],
      onCompleted: (res) => {
        const isRegexError =
          res?.organizationComponentCreate?.errors?.some(checkIfRegexError)
        const isDuplicateError = res?.organizationComponentCreate?.errors?.some(
          checkIfDuplicateError
        )
        if (isRegexError) {
          setErrorText('Invalid regular expression')
        } else if (isDuplicateError) {
          setErrorText('Regular expression already present')
        } else {
          onClose()
          toast({
            description: `Internal component ${mutateText.toLowerCase()} successful!`,
            status: 'success',
            position: 'top',
            duration: 3000
          })
        }
      }
    }
  )

  useEffect(() => {
    setErrorText(null)
  }, [matchStr])

  const handleSubmit = (e) => {
    e.preventDefault()
    mutate({
      variables: {
        id: internalComponent?.id,
        matchStr,
        ignoreCase,
        enabled
      }
    })
  }

  return (
    <Modal isOpen={true} onClose={onClose} size='xl'>
      <ModalOverlay />
      <form onSubmit={handleSubmit}>
        <ModalContent>
          <ModalHeader>{mutateText} Internal Component</ModalHeader>
          <ModalCloseButton />
          <ModalBody as={Flex} flexDir='column'>
            <FormControl isInvalid={!!errorText} isRequired>
              <FormLabel>Regular Expression</FormLabel>
              <Input
                required
                autoFocus
                value={matchStr}
                placeholder='orgname'
                onChange={(e) => setMatchStr(e.target.value)}
              />
              {!!errorText && <FormErrorMessage>{errorText}</FormErrorMessage>}
            </FormControl>
            <FormControl mt={3}>
              <Checkbox
                defaultChecked={ignoreCase}
                onChange={() => {
                  setIgnoreCase(!ignoreCase)
                }}
              >
                Case insensitive
              </Checkbox>
            </FormControl>
            <FormControl display='flex' alignItems='center' mt={3}>
              <FormLabel marginBlock={0}>Active</FormLabel>
              <Switch
                isChecked={enabled}
                onChange={() => {
                  setEnabled(!enabled)
                }}
              />
            </FormControl>
            <Box py={3}>
              <Text fontWeight='bold'>Tips:</Text>
              <UnorderedList mx={10}>
                <li>{'// are not required'}</li>
                <li>
                  <strong>^myname</strong> matches components whose name{' '}
                  <strong>start with myname</strong>
                </li>
                <li>
                  <strong>myname$</strong> matches components whose name{' '}
                  <strong>ends with myname</strong>
                </li>
                <li>
                  <strong>myname </strong> matches components whose name
                  <strong> includes myname</strong>
                </li>
              </UnorderedList>
              <Text fontWeight='bold'>Note:</Text>
              <UnorderedList mx={10}>
                <li>All existing and future components will be tagged</li>
              </UnorderedList>
            </Box>
            <TextRegex regex={matchStr} ignoreCase={ignoreCase} />
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              type='submit'
              isLoading={loading}
              fontWeight={'medium'}
              colorScheme='blue'
            >
              {mutateText}
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  )
}

import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'

import {
  Box,
  Button,
  Checkbox,
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

  const handleSubmit = () => {
    mutate({
      variables: {
        id: internalComponent?.id,
        matchStr,
        ignoreCase
      }
    })
  }

  return (
    <Modal isOpen={true} onClose={onClose} size='6xl'>
      <ModalOverlay />
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        <ModalContent>
          <ModalHeader>{mutateText} Internal Component</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div>
              <div>
                <FormControl isInvalid={!!errorText} isRequired>
                  <FormLabel>Regular Expression</FormLabel>
                  <Input
                    autoFocus
                    placeholder='orgname'
                    required
                    value={matchStr}
                    onChange={(e) => setMatchStr(e.target.value)}
                    bg={'white'}
                  />
                  {!!errorText && (
                    <FormErrorMessage>{errorText}</FormErrorMessage>
                  )}
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
              </div>
              <TextRegex regex={matchStr} ignoreCase={ignoreCase} />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='gray' mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              isLoading={loading}
              type='submit'
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

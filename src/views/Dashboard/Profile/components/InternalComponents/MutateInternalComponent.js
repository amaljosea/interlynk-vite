import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'

import {
  Box,
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Text,
  UnorderedList
} from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'
import LynkSwitch from 'components/Misc/LynkSwitch'

import useCustomToast from 'hooks/useCustomToast'

import { createOrgComp, updateOrgComp } from 'graphQL/Mutation'


import { TextRegex } from './TestRegex'
import { LuPackage2 } from 'react-icons/lu'

const checkIfRegexError = (text) => text.includes('not a valid regex')
const checkIfDuplicateError = (text) =>
  text.includes('str has already been taken')

export const UpdateInternalComponent = ({ onClose, internalComponent }) => {
  const isEdit = !!internalComponent
  const [matchStr, setMatchStr] = useState(internalComponent?.matchStr || '')
  const [errorText, setErrorText] = useState(null)
  // FIXME: Change the below default value back to !!internalComponent?.ignoreCase when migration for setting the default value to true has been merged in the backend.
  const [ignoreCase, setIgnoreCase] = useState(true)
  const [enabled, setEnabled] = useState(
    isEdit ? !!internalComponent?.enabled : true
  )
  const { showToast } = useCustomToast()
  const mutateText = isEdit ? 'Update' : 'Tag'

  const [mutate, { loading }] = useMutation(
    isEdit ? updateOrgComp : createOrgComp,
    {
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
          showToast({
            description: `Internal component ${mutateText.toLowerCase()} successful!`,
            status: 'success'
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
    <LynkModal
      isOpen={true}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={`${mutateText} Internal Component`}
      Icon={LuPackage2}
      buttonText={mutateText}
      isLoading={loading}
    >
      <Flex flexDirection={'column'} gap={5}>
        <Box>
          <Text fontWeight={600} fontSize={12}>
            Tips:
          </Text>
          <UnorderedList
            ml={8}
            fontSize={16}
            fontWeight={300}
            lineHeight={'30px'}
          >
            <li>
              <strong style={{ fontWeight: 500 }}>{'//'}</strong> are not
              required
            </li>
            <li>
              <strong style={{ fontWeight: 500 }}>^myname</strong> matches
              components whose name{' '}
              <strong style={{ fontWeight: 500 }}>start with myname</strong>
            </li>
            <li>
              <strong style={{ fontWeight: 500 }}>myname$</strong> matches
              components whose name{' '}
              <strong style={{ fontWeight: 500 }}>ends with myname</strong>
            </li>
            <li>
              <strong style={{ fontWeight: 500 }}>myname </strong> matches
              components whose name
              <strong style={{ fontWeight: 500 }}> includes myname</strong>
            </li>
          </UnorderedList>
        </Box>
        <Box>
          <Text fontWeight={600} fontSize={12}>
            Note:
          </Text>
          <UnorderedList
            ml={8}
            fontSize={16}
            fontWeight={300}
            lineHeight={'30px'}
          >
            <li>All existing and future components will be tagged</li>
          </UnorderedList>
        </Box>
        <Flex direction={'column'} gap={3}>
          <FormControl isInvalid={!!errorText} isRequired>
            <FormLabel>Regular Expression</FormLabel>
            <Input
              required
              autoFocus
              value={matchStr}
              placeholder='Org name'
              onChange={(e) => setMatchStr(e.target.value)}
              fontSize={14}
            />
            {!!errorText && <FormErrorMessage>{errorText}</FormErrorMessage>}
          </FormControl>
          <FormControl>
            <Checkbox
              defaultChecked={!ignoreCase}
              onChange={() => {
                setIgnoreCase(!ignoreCase)
              }}
            >
              Case sensitive
            </Checkbox>
          </FormControl>
          <FormControl display='flex' alignItems='center'>
            <FormLabel>Active</FormLabel>
            <LynkSwitch
              isChecked={enabled}
              onChange={() => {
                setEnabled(!enabled)
              }}
            />
          </FormControl>
        </Flex>
        <TextRegex regex={matchStr} ignoreCase={ignoreCase} />
      </Flex>
    </LynkModal>
  )
}

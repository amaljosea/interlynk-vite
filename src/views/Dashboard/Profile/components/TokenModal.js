import { useMutation } from '@apollo/client'
import { isValid } from 'date-fns'
import { useEffect, useState } from 'react'
import { truncatedValue } from 'utils'

import { CopyIcon } from '@chakra-ui/icons'
import {
  IconButton,
  Progress,
  Stack,
  Text,
  Tooltip,
  useClipboard
} from '@chakra-ui/react'
import { Checkbox, Input } from '@chakra-ui/react'
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react'

import LynkDate from 'components/LynkDate'
import LynkModal from 'components/LynkModal'

import { useThemeColor } from 'hooks/useThemeColors'

import { createApiToken } from 'graphQL/Mutation'
import { updateApiToken } from 'graphQL/Mutation'

import { BiCheck, BiShieldQuarter } from 'react-icons/bi'

const TokenModal = ({ data, isOpen, onClose }) => {
  const { grayBorderColor } = useThemeColor(['headingTextColor'])

  const defaultDate = new Date()
  defaultDate.setDate(defaultDate.getDate() + 90)

  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [keyName, setKeyName] = useState('')
  const [noExpire, setNoExpire] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidDate, setIsValidDate] = useState(true)
  const [selectedDate, setSelectedDate] = useState(defaultDate)

  const [generateToken] = useMutation(createApiToken)
  const [updateToken] = useMutation(updateApiToken)

  const key = useClipboard(token)

  const modalTitle = data
    ? truncatedValue(data?.tokenName, 20)
    : 'Create Security Token'

  const handleDateChange = (newDate) => {
    const isValidDate = newDate && !isNaN(newDate)
    setSelectedDate(newDate._d)
    if (isValidDate) {
      setIsValidDate(true)
    } else {
      setIsValidDate(false)
    }
  }

  const handleChange = (event) => {
    const { value } = event.target
    setKeyName(value)
    setError('')
  }

  const onTokenBlur = () => {
    if (keyName.length < 4 || keyName.length > 128) {
      setError('Input must be between 4 and 128 characters')
    } else {
      setError('')
    }
  }

  const handleExpireChange = (e) => {
    const defaultDate = new Date()
    defaultDate.setDate(defaultDate.getDate() + 90)
    const { checked } = e.target
    setNoExpire(checked)
    setIsValidDate(true)
    if (checked === true) {
      setSelectedDate('')
    } else {
      setSelectedDate(defaultDate)
    }
  }

  const handleSubmit = () => onClose()

  const handleCreate = () => {
    setIsLoading(true)
    generateToken({
      variables: {
        tokenName: keyName,
        expiresAt: selectedDate
          ? selectedDate.toISOString().replace(/\.\d{3}Z$/, 'Z')
          : null
      }
    }).then((res) => {
      if (res?.data?.apiTokenCreate?.errors?.length > 0) {
        setError(res?.data?.apiTokenCreate?.errors[0])
        setIsLoading(false)
      } else {
        setTimeout(() => {
          setToken(res.data.apiTokenCreate.apiKey.rawToken)
          setIsLoading(false)
        }, 3000)
      }
    })
  }

  const handleUpdate = () => {
    updateToken({
      variables: {
        id: data?.id,
        expires: noExpire === true ? null : selectedDate
      }
    }).then((res) => {
      if (res?.data?.apiTokenUpdate?.errors?.length > 0) {
        setError(res?.data?.apiTokenUpdate?.errors[0])
      } else {
        onClose()
      }
    })
  }

  const onSubmit =
    token !== '' ? handleSubmit : data ? handleUpdate : handleCreate

  const buttonName =
    token !== ''
      ? 'Done'
      : data
        ? 'Update'
        : isLoading
          ? 'Creating...'
          : 'Create'

  const isButtonDisabled =
    token !== ''
      ? token === ''
      : data
        ? !isValidDate
        : !keyName ||
          (selectedDate !== '' && !isValid(selectedDate)) ||
          isLoading ||
          error !== '' ||
          !isValidDate

  useEffect(() => {
    if (data) {
      setKeyName(data?.tokenName)
      setSelectedDate(new Date(data?.expiresAt))
      setNoExpire(data?.expiresAt === null ? true : false)
    }
  }, [data])

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      title={modalTitle}
      Icon={BiShieldQuarter}
      disabled={isButtonDisabled}
      buttonText={buttonName}
    >
      {!data && (
        <FormControl
          mb={5}
          isRequired
          isInvalid={keyName !== '' && error !== ''}
        >
          <FormLabel htmlFor='keyName'>Token Name</FormLabel>
          <Input
            type='text'
            id='keyName'
            name='keyName'
            value={keyName}
            minLength={4}
            maxLength={128}
            onBlur={onTokenBlur}
            onChange={handleChange}
            isDisabled={token !== ''}
          />
          <FormErrorMessage>{error}</FormErrorMessage>
        </FormControl>
      )}
      {!noExpire && (
        <FormControl mb={5} isRequired isInvalid={!isValidDate}>
          <FormLabel htmlFor='expire'>Expiration Date</FormLabel>
          <LynkDate value={selectedDate} onChange={handleDateChange} />
          {!isValidDate && (
            <FormErrorMessage>Please enter a valid datetime</FormErrorMessage>
          )}
        </FormControl>
      )}
      <FormControl mb={5}>
        <Checkbox
          isChecked={noExpire}
          onChange={handleExpireChange}
          isDisabled={token !== ''}
        >
          <Text fontSize={12}>No Expiration</Text>
        </Checkbox>
      </FormControl>
      {isLoading && <Progress size='xs' isIndeterminate />}
      {token !== '' && (
        <Stack direction={'row'} alignItems={'center'}>
          <FormControl>
            <Input type={'text'} defaultValue={token} readOnly />
          </FormControl>
          {/* ACTION */}
          <Tooltip
            label={key.hasCopied ? 'Copied!' : 'Copy'}
            closeOnClick={false}
            hasArrow
            placement='top'
          >
            <IconButton
              border='1px solid'
              borderColor={grayBorderColor}
              onClick={() => key.onCopy()}
              icon={key.hasCopied ? <BiCheck /> : <CopyIcon />}
            />
          </Tooltip>
        </Stack>
      )}
    </LynkModal>
  )
}

export default TokenModal

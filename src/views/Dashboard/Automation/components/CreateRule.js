import { useEffect, useState } from 'react'
import { ruleSubjectOperatorMapping } from 'variables/general'

import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Tag,
  Text
} from '@chakra-ui/react'

import { FaPlus, FaTrash } from 'react-icons/fa6'

const CreateRule = ({ data, rules, isOpen, onClose, setRules }) => {
  const sortedData = ruleSubjectOperatorMapping.sort((a, b) =>
    a?.category.localeCompare(b?.category)
  )
  const compCategory = ruleSubjectOperatorMapping
    ?.filter((item) => item?.category === 'Component')
    .map((item) => item?.subject)
  const versionCategory = ruleSubjectOperatorMapping
    ?.filter((item) => item?.category === 'Version')
    .map((item) => item?.subject)

  const categories = [...new Set(sortedData?.map((item) => item.category))]
  const optionsByCategory = categories.reduce((acc, category) => {
    const options = ruleSubjectOperatorMapping
      .filter((item) => item.category === category)
      .map((item) => (
        <option value={item.subject} key={item?.subject}>
          {`${item?.category} ${item.name}`}
        </option>
      ))
    acc[category] = options
    return acc
  }, {})

  const [error, setError] = useState('')
  const [ruleName, setRuleName] = useState('')
  const [conditions, setConditions] = useState([
    {
      id: 1,
      subject: '',
      operator: '',
      value: '',
      list: [],
      subError: '',
      opError: '',
      valError: ''
    }
  ])
  const [then, setThen] = useState('')
  const [newValue, setNewValue] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [authorEmail, setAuthorEmail] = useState('')
  const [orgName, setOrgName] = useState('')
  const [orgUrl, setOrgUrl] = useState('')
  const [supName, setSupName] = useState('')
  const [supEmail, setSupEmail] = useState('')
  const [compName, setCompName] = useState('')
  const [compVersion, setCompVersion] = useState('')

  const placeholderMsg = () => {
    switch (then) {
      case 'Component License':
        return 'Add license'
      case 'Component Version':
        return 'Add Component version'
      default:
        return 'Add value'
    }
  }

  const checkDataValidity = (data) => {
    for (let i = 0; i < data.length; i++) {
      const { subject, operator, value, subError, opError, valError } = data[i]
      if (
        subject === '' ||
        operator === '' ||
        value === '' ||
        subError !== '' ||
        opError !== '' ||
        valError !== ''
      ) {
        return 'Error: Some properties are empty'
      }
    }
    return null
  }

  const errorMessage = checkDataValidity(conditions)

  const hasSimilarRow = (data) => {
    for (let i = 0; i < data.length; i++) {
      for (let j = i + 1; j < data.length; j++) {
        if (
          data[i].subject === data[j].subject &&
          data[i].operator === data[j].operator &&
          data[i].value === data[j].value
        ) {
          return true
        }
      }
    }
    return false
  }

  const addRow = () => {
    if (hasSimilarRow(conditions)) {
      setError(
        `A row with the empty or same values already exists. Please update or remove it before continue.`
      )
    } else {
      setError('')
      const newId = conditions?.length + 1
      setConditions([
        ...conditions,
        {
          id: newId,
          subject: '',
          operator: '',
          value: '',
          list: [],
          subError: '',
          opError: '',
          valError: ''
        }
      ])
    }
  }

  const deleteRow = (rule) => {
    setError('')
    const rules = []
    const newData = conditions?.filter((item) => item.id !== rule?.id)
    newData?.map((item, index) =>
      rules?.push({
        id: index + 1,
        subject: item?.subject,
        operator: item?.operator,
        value: item?.value,
        list: item?.list,
        subError: item?.subError,
        opError: item?.opError,
        valError: item?.valError
      })
    )
    setConditions(rules)
  }

  const onNameChange = (e) => setRuleName(e.target.value)

  const onSubjectBlur = (rule) => {
    const newData = conditions.map((item) => {
      if (item.id === rule?.id) {
        if (rule?.subject === '') {
          return { ...item, subError: 'Select any subject' }
        } else {
          return { ...item, subError: '' }
        }
      }
      return item
    })
    setConditions(newData)
  }

  const onOperatorBlur = (rule) => {
    const newData = conditions.map((item) => {
      if (item.id === rule?.id) {
        if (rule?.operator === '') {
          return { ...item, opError: 'Select any operator' }
        } else {
          return { ...item, opError: '' }
        }
      }
      return item
    })
    setConditions(newData)
  }

  const handleChange = (value, id, field) => {
    setError('')
    const newData = conditions.map((item) => {
      if (item.id === id) {
        if (field === 'subject' && value !== '') {
          const result = ruleSubjectOperatorMapping?.find(
            (item) => item?.subject === value
          )
          return { ...item, [field]: value, list: result?.operators }
        } else if (
          field === 'operator' &&
          (value === 'Exists' || value === 'Not Exists')
        ) {
          return { ...item, [field]: value, value: 'Defined' }
        } else {
          return { ...item, [field]: value }
        }
      }
      return item
    })
    setConditions(newData)
  }

  const isAuthor = then === 'Version Author'
  const isSupplier =
    then === 'Version Supplier' || then === 'Component Supplier'
  const isPrimaryComp = then === 'Version Primary Component'
  const author = { author_name: authorName, author_email: authorEmail }
  const supplier = {
    organization: orgName,
    url: orgUrl,
    contact_name: supName,
    contact_email: supEmail
  }
  const primaryComponent = {
    component_name: compName,
    component_version: compVersion
  }
  const ruleValue = isAuthor
    ? author
    : isSupplier
      ? supplier
      : isPrimaryComp
        ? primaryComponent
        : { value: newValue }

  const handleCreate = () => {
    setRules((prev) => [
      {
        id: rules?.length + 1,
        active: true,
        rule: ruleName,
        when: conditions,
        then: then,
        value: ruleValue
      },
      ...prev
    ])
    onClose()
  }

  const handleUpdate = () => {
    const updatedRules = rules.map((rule) =>
      rule.id === data?.id
        ? {
            ...rule,
            rule: ruleName,
            when: conditions,
            then: then,
            value: ruleValue
          }
        : rule
    )
    setRules(updatedRules)
    onClose()
  }

  useEffect(() => {
    if (data) {
      const { rule, then, when, value } = data
      setRuleName(rule)
      setConditions(when?.length > 0 ? when : [])
      setThen(then)
      setNewValue(value?.value || '')
      setAuthorName(value?.author_name || '')
      setAuthorEmail(value?.author_email || '')
      setOrgName(value?.organization || '')
      setOrgUrl(value?.url || '')
      setSupName(value?.contact_name || '')
      setSupEmail(value?.contact_email || '')
      setCompName(value?.component_name || '')
      setCompVersion(value?.component_version || '')
    }
  }, [data])

  return (
    <Modal
      size='5xl'
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
      motionPreset='slideInBottom'
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Rule</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex flexDir={'column'} alignItems={'flex-start'} gap={4}>
            <FormControl as={Flex} alignItems='flex-start' isRequired>
              <FormLabel htmlFor='ruleName'>Name</FormLabel>
              <Input
                type='text'
                name='ruleName'
                fontSize={'sm'}
                placeholder='Enter rule name'
                value={ruleName}
                onChange={onNameChange}
              />
            </FormControl>
            {/* WHEN */}
            <Heading
              fontWeight={'medium'}
              fontFamily={'inherit'}
              fontSize={'md'}
            >
              When the following conditions are met:
            </Heading>
            <Flex
              width={'100%'}
              justifyContent={'space-between'}
              alignItems={'center'}
            >
              <Tag colorScheme='blue'>Conditions</Tag>
              <IconButton
                colorScheme='blue'
                icon={<FaPlus />}
                onClick={addRow}
              />
            </Flex>
            {/* CONDITIONS */}
            {conditions?.length > 0 &&
              conditions?.map((item, index) => (
                <Flex
                  gap={4}
                  key={index}
                  width={'100%'}
                  alignItems={'flex-start'}
                  justifyContent={'space-bewteen'}
                >
                  <FormControl width={'40%'} isInvalid={item?.subError !== ''}>
                    <Select
                      value={item?.subject}
                      onChange={(e) =>
                        handleChange(e.target.value, item.id, 'subject')
                      }
                      onBlur={() => onSubjectBlur(item)}
                      placeholder='-- Subject --'
                      fontSize='sm'
                      onBlurCapture={() => onSubjectBlur(item)}
                      textTransform={'capitalize'}
                      // pointerEvents={
                      //   conditions?.length - 1 === index ? 'auto' : 'none'
                      // }
                    >
                      {conditions?.length > 1 &&
                      conditions?.some((item) =>
                        item?.subject?.includes('Component')
                      )
                        ? [...categories]
                            ?.filter((item) => item !== 'Version')
                            .map((category) => (
                              <optgroup key={category} label={category}>
                                {optionsByCategory[category]}
                              </optgroup>
                            ))
                        : conditions?.length > 1 &&
                            conditions?.some((item) =>
                              item?.subject?.includes('Version')
                            )
                          ? [...categories]
                              ?.filter((item) => item !== 'Component')
                              .map((category) => (
                                <optgroup key={category} label={category}>
                                  {optionsByCategory[category]}
                                </optgroup>
                              ))
                          : categories.map((category) => (
                              <optgroup key={category} label={category}>
                                {optionsByCategory[category]}
                              </optgroup>
                            ))}
                    </Select>
                    <FormErrorMessage>{item?.subError}</FormErrorMessage>
                  </FormControl>
                  <FormControl width={'20%'} isInvalid={item?.opError !== ''}>
                    <Select
                      id='operator'
                      name='operator'
                      value={item?.operator}
                      onChange={(e) =>
                        handleChange(e.target.value, item.id, 'operator')
                      }
                      fontSize='sm'
                      placeholder='-- Opeator --'
                      onBlur={() => onOperatorBlur(item)}
                    >
                      {item?.list?.map((option) => (
                        <option value={option} key={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>{item?.opError}</FormErrorMessage>
                  </FormControl>
                  <Flex width={'50%'} alignItems={'center'} gap={4}>
                    <Input
                      type={'text'}
                      fontSize='sm'
                      placeholder='Value'
                      value={item?.value}
                      onChange={(e) =>
                        handleChange(e.target.value, item.id, 'value')
                      }
                      hidden={
                        item?.operator === 'Exists' ||
                        item?.operator === 'Not Exists'
                      }
                    />
                    <Flex gap={4} justifyContent={'space-between'}>
                      {conditions?.length > 1 &&
                        conditions?.length - 1 !== index && (
                          <Text pt={2}>and</Text>
                        )}
                      <IconButton
                        ml={'auto'}
                        colorScheme='red'
                        icon={<FaTrash />}
                        onClick={() => deleteRow(item)}
                      />
                    </Flex>
                  </Flex>
                </Flex>
              ))}
            <Divider />
            <FormControl as={Flex} alignItems='flex-start'>
              <FormLabel width='80px'>Then Set</FormLabel>
              <Select
                fontSize='sm'
                value={then}
                onChange={(e) => setThen(e.target.value)}
                placeholder='-- Subject --'
                textTransform={'capitalize'}
                isDisabled={errorMessage || conditions?.length === 0}
              >
                {conditions?.some((item) =>
                  compCategory?.includes(item?.subject)
                )
                  ? [...categories]
                      ?.filter((item) => item !== 'Version')
                      .map((category) => (
                        <optgroup key={category} label={category}>
                          {optionsByCategory[category]}
                        </optgroup>
                      ))
                  : [...categories]
                      ?.filter((item) => item !== 'Component')
                      .map((category) => (
                        <optgroup key={category} label={category}>
                          {optionsByCategory[category]}
                        </optgroup>
                      ))}
              </Select>
            </FormControl>
            {/* VALUES */}
            <Grid
              gap={4}
              width={'100%'}
              templateColumns='repeat(1, 1fr)'
              alignItems={'flex-start'}
            >
              <GridItem
                as={Flex}
                alignIterms='flex-start'
                display={isAuthor ? 'flex' : 'none'}
              >
                <FormLabel width={'120px'}>Author Name</FormLabel>
                <Input
                  type={'text'}
                  fontSize='sm'
                  placeholder={'Author Name'}
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                />
              </GridItem>
              <GridItem
                as={Flex}
                alignIterms='flex-start'
                display={isAuthor ? 'flex' : 'none'}
              >
                <FormLabel width={'120px'}>Author Email</FormLabel>
                <Input
                  type={'text'}
                  fontSize='sm'
                  placeholder={'Author Email'}
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                />
              </GridItem>
              <GridItem
                as={Flex}
                alignIterms='flex-start'
                display={isSupplier ? 'flex' : 'none'}
              >
                <FormLabel width={'180px'}>Organization Name</FormLabel>
                <Input
                  type={'text'}
                  fontSize='sm'
                  placeholder={'Enter organization name'}
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </GridItem>
              <GridItem
                as={Flex}
                alignIterms='flex-start'
                display={isSupplier ? 'flex' : 'none'}
              >
                <FormLabel width={'40px'}>URL</FormLabel>
                <Input
                  type={'text'}
                  fontSize='sm'
                  placeholder={'Enter URL'}
                  value={orgUrl}
                  onChange={(e) => setOrgUrl(e.target.value)}
                />
              </GridItem>
              <GridItem
                as={Flex}
                alignIterms='flex-start'
                display={isSupplier ? 'flex' : 'none'}
              >
                <FormLabel width={'120px'}>Contact Name</FormLabel>
                <Input
                  type={'text'}
                  fontSize='sm'
                  placeholder={'Enter contact name'}
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                />
              </GridItem>
              <GridItem
                as={Flex}
                alignIterms='flex-start'
                display={isSupplier ? 'flex' : 'none'}
              >
                <FormLabel width={'120px'}>Contact Email</FormLabel>
                <Input
                  type={'text'}
                  fontSize='sm'
                  placeholder={'Enter contact email'}
                  value={supEmail}
                  onChange={(e) => setSupEmail(e.target.value)}
                />
              </GridItem>
              <GridItem
                as={Flex}
                alignIterms='flex-start'
                display={isPrimaryComp ? 'flex' : 'none'}
              >
                <FormLabel width={'160px'}>Comopnent Name</FormLabel>
                <Input
                  type={'text'}
                  fontSize='sm'
                  placeholder={'Enter component name'}
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                />
              </GridItem>
              <GridItem
                as={Flex}
                alignIterms='flex-start'
                display={isPrimaryComp ? 'flex' : 'none'}
              >
                <FormLabel width={'175px'}>Comopnent Version</FormLabel>
                <Input
                  type={'text'}
                  fontSize='sm'
                  placeholder={'Enter component version'}
                  value={compVersion}
                  onChange={(e) => setCompVersion(e.target.value)}
                />
              </GridItem>
              <GridItem
                as={Flex}
                alignIterms='flex-start'
                display={isSupplier ? 'flex' : 'none'}
              >
                <FormLabel width={'120px'}>Contact Email</FormLabel>
                <Input
                  type={'text'}
                  fontSize='sm'
                  placeholder={'Enter contact email'}
                  value={supEmail}
                  onChange={(e) => setSupEmail(e.target.value)}
                />
              </GridItem>
              <GridItem
                as={Flex}
                alignIterms='flex-start'
                hidden={isAuthor || isSupplier || isPrimaryComp}
              >
                <FormLabel width={'50px'}>Value</FormLabel>
                <Input
                  type={'text'}
                  fontSize='sm'
                  placeholder={placeholderMsg()}
                  isDisabled={errorMessage || conditions?.length === 0}
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                />
              </GridItem>
            </Grid>
            {/* ERROR HANDLING */}
            {error !== '' && (
              <Alert status='error' borderRadius={4}>
                <AlertIcon />
                <AlertDescription fontSize={'sm'} pr={2}>
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </Flex>
        </ModalBody>
        <ModalFooter mt={2}>
          <Button colorScheme='gray' mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme='blue'
            isDisabled={
              errorMessage ||
              error !== '' ||
              ruleName === '' ||
              then === '' ||
              (isAuthor && (authorName === '' || authorEmail === '')) ||
              (isSupplier && orgName === '') ||
              (!isAuthor && !isSupplier && !isPrimaryComp && newValue === '')
            }
            onClick={data ? handleUpdate : handleCreate}
          >
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default CreateRule

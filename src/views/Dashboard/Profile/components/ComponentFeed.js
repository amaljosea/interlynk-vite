// Chakra imports
import {
  Flex,
  Text,
  useColorModeValue,
  FormControl,
  Input,
  Stack,
  Button,
  TagLabel,
  TagCloseButton,
  Code,
  Tag,
  FormErrorMessage
} from '@chakra-ui/react'
// Custom components
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import { useState } from 'react'

const re2Regex =
  /^(?:(?:[a-zA-Z0-9]+[._-]?)+[a-zA-Z0-9]@(?:[a-zA-Z0-9]+[.-]?)+[a-zA-Z]{2,}|(?:[a-zA-Z0-9]+[.-]?)+[a-zA-Z0-9]+\.[a-zA-Z]{2,}|(?:\d{1,3}\.){3}\d{1,3}|(?:0[1-9]|1[0-2])\/(?:0[1-9]|[12][0-9]|3[01])\/(?:19|20)\d{2}|[a-zA-Z0-9]+)$/

const validateRe2 = (re2) => {
  return re2Regex.test(re2)
}

const ComponentFeed = () => {
  const textColor = useColorModeValue('gray.700', 'white')

  const [compName, setCompName] = useState('')
  const [compNameList, setCompNameList] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [isMatch, setIsMatch] = useState(true)

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && isMatch) {
      if (activeId !== null) {
        const data = [...compNameList]
        data[activeId] = compName
        setCompNameList(data)
        setCompName('')
        setActiveId(null)
      } else {
        setCompNameList([...compNameList, compName])
        setCompName('')
      }
    }
  }

  const handleUpdate = (value, index) => {
    setCompName(value)
    setActiveId(index)
  }

  const deleteComp = (index) => {
    const updatedItems = compNameList.filter((_, i) => i !== index)
    setCompNameList(updatedItems)
  }

  const handleChange = (e) => {
    const { value } = e.target
    setCompName(value)

    try {
      const re = new RegExp(value)
      console.log('Valid regex', re)
      setIsMatch(true)
    } catch (error) {
      console.error('Invalid regex:', error.message)
      setIsMatch(false)
    }
  }

  return (
    <Card p={0}>
      <CardHeader p='12px 0' mb='8px'>
        <Text fontSize='lg' color={textColor} fontWeight='bold'>
          Internal Components
        </Text>
      </CardHeader>
      <CardBody px='5px'>
        <Flex flexDirection={'column'} alignItems={'flex-start'} gap={6}>
          <FormControl isInvalid={!isMatch && compName !== ''}>
            <Input
              placeholder='*mystring*'
              width={'500px'}
              value={compName}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              bg={'white'}
            />
            {compName !== '' && !isMatch && (
              <FormErrorMessage>
                This is not a valid name regex
              </FormErrorMessage>
            )}
            <Text fontSize={'xs'} mt={2}>
              Press <Code colorScheme='blue'>enter</Code> to add name regex
            </Text>
          </FormControl>

          {compNameList.length > 0 && (
            <Flex
              flexDirection={'row'}
              flexWrap={'wrap'}
              spacing={2}
              gap={2}
              mt={2}
            >
              {compNameList.map((item, index) => (
                <Tag key={index} variant='solid' colorScheme={'blue'}>
                  <TagLabel onClick={() => handleUpdate(item, index)}>
                    {item}
                  </TagLabel>
                  <TagCloseButton onClick={() => deleteComp(index)} />
                </Tag>
              ))}
            </Flex>
          )}

          <Stack direction={'row'} spacing={4} alignItems={'center'}>
            <Button fontWeight={'medium'} variant='solid' colorScheme='blue'>
              Apply
            </Button>
          </Stack>
        </Flex>
      </CardBody>
    </Card>
  )
}

export default ComponentFeed

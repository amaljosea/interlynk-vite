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

const validateRe2 = (re2) => {
  const re2Regex =
    /(?:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})|(https?|ftp):\/\/[^\s/$.?#].[^\s]*|\d{4}-\d{2}-\d{2}|(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/

  return re2Regex.test(re2)
}

const ComponentFeed = () => {
  const textColor = useColorModeValue('gray.700', 'white')

  const [compName, setCompName] = useState('')
  const [compNameList, setCompNameList] = useState([])
  const [activeId, setActiveId] = useState(null)

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && validateRe2(compName)) {
      if (activeId) {
        const data = [...compNameList]
        data[activeId] = compName
        setCompNameList(data)
        setCompName('')
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

  return (
    <Card p={0}>
      <CardHeader p='12px 0' mb='8px'>
        <Text fontSize='lg' color={textColor} fontWeight='bold'>
          Internal Components
        </Text>
      </CardHeader>
      <CardBody px='5px'>
        <Flex flexDirection={'column'} alignItems={'flex-start'} gap={6}>
          <FormControl isInvalid={!validateRe2(compName) && compName !== ''}>
            <Input
              placeholder='*mystring*'
              width={'100%'}
              value={compName}
              onChange={(e) => setCompName(e.target.value)}
              onKeyDown={handleKeyDown}
              bg={'white'}
            />
            {compName !== '' && !validateRe2(compName) && (
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

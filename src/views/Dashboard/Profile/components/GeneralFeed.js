// Chakra imports
import {
  Flex,
  Text,
  useColorModeValue,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Button,
  TagLabel,
  TagCloseButton,
  Code,
  Tag
} from '@chakra-ui/react'
// Custom components
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import { useState } from 'react'

const GeneralFeed = () => {
  const textColor = useColorModeValue('gray.700', 'white')

  const [namespace, setNamespace] = useState('')
  const [compName, setCompName] = useState('')
  const [compNameList, setCompNameList] = useState([])

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      setCompNameList([...compNameList, compName])
      setCompName('')
    }
  }

  const deleteComp = (index) => {
    const updatedItems = compNameList.filter((_, i) => i !== index)
    setCompNameList(updatedItems)
  }

  return (
    <Card p='16px'>
      <CardHeader p='12px 5px' mb='8px'>
        <Text fontSize='lg' color={textColor} fontWeight='bold'>
          General
        </Text>
      </CardHeader>
      <CardBody px='5px'>
        <Flex flexDirection={'column'} alignItems={'flex-start'} gap={6}>
          <Text fontSize={'sm'}>
            Internal components will be excluded from vulnerability scans and
            version checks that rely on external systems. Note that the regular
            expressions below must be compliant with Java's regex syntax. The
            regex must match the whole string. To match all namespaces with
            'example' in it, write '.*example.*'.
          </Text>
          <FormControl>
            <FormLabel fontSize={'sm'}>Component namespace regex</FormLabel>
            <Input
              size='sm'
              placeholder='.*example*.'
              value={namespace}
              onChange={(e) => setNamespace(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel fontSize={'sm'}>Component name regex</FormLabel>
            <Input
              size='sm'
              placeholder='*mystring*'
              value={compName}
              onChange={(e) => setCompName(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Text fontSize={'xs'} mt={2}>
              Press <Code>enter</Code> to add name regex
            </Text>
            <Flex
              flexDirection={'row'}
              flexWrap={'wrap'}
              spacing={2}
              gap={2}
              mt={2}
            >
              {compNameList.map((item, index) => (
                <Tag
                  size='sm'
                  key={index}
                  borderRadius='full'
                  variant='solid'
                  colorScheme={'blue'}
                >
                  <TagLabel>{item}</TagLabel>
                  <TagCloseButton onClick={() => deleteComp(index)} />
                </Tag>
              ))}
            </Flex>
          </FormControl>
          <Stack direction={'row'} spacing={4} alignItems={'center'}>
            <Button
              size='sm'
              fontWeight={'medium'}
              variant='outline'
              colorScheme='blue'
            >
              Update
            </Button>
            <Button
              size='sm'
              fontWeight={'medium'}
              variant='outline'
              colorScheme='blue'
            >
              Perform Identification
            </Button>
          </Stack>
        </Flex>
      </CardBody>
    </Card>
  )
}

export default GeneralFeed

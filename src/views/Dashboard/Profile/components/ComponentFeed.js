import { useMutation } from '@apollo/client'
import { useState } from 'react'

import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  Input,
  Stack,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  useColorModeValue
} from '@chakra-ui/react'

// Custom components
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'

import { createOrgComp, deleteOrgComp, updateOrgComp } from 'graphQL/Mutation'

const ComponentFeed = ({ data, refetch }) => {
  const textColor = useColorModeValue('gray.700', 'white')

  const [compName, setCompName] = useState('')
  const [activeId, setActiveId] = useState(null)
  const [isMatch, setIsMatch] = useState(true)

  const [createComp] = useMutation(createOrgComp)
  const [updateComp] = useMutation(updateOrgComp)
  const [deleteComp] = useMutation(deleteOrgComp)

  const handleAdd = () => {
    if (activeId !== null) {
      updateComp({
        variables: {
          id: activeId,
          match: compName
        }
      })
        .then((res) => res.data && refetch())
        .finally(() => {
          setCompName('')
          setActiveId(null)
        })
    } else {
      createComp({
        variables: {
          match: compName
        }
      })
        .then((res) => res.data && refetch())
        .finally(() => setCompName(''))
    }
  }

  const handleUpdate = (item) => {
    setCompName(item.matchStr)
    setActiveId(item.id)
  }

  const handleDeleteComp = (id) => {
    deleteComp({
      variables: {
        id: id
      }
    }).then((res) => res.data && refetch())
  }

  const handleChange = (e) => {
    const { value } = e.target
    setCompName(value)
    try {
      const re = new RegExp(value)
      // console.log('Valid regex', re)
      setIsMatch(true)
    } catch (error) {
      // console.error('Invalid regex:', error.message)
      setIsMatch(false)
    }
  }

  return (
    <Card p={0}>
      <CardHeader p='12px 0' mb='8px' as={Flex} flexDirection='column'>
        <Text fontSize='lg' color={textColor} fontWeight='bold'>
          Internal Components
        </Text>
        <Text fontSize={'sm'}>
          Clicking on apply will mark the component name matching this list as
          internal.
        </Text>
      </CardHeader>
      <CardBody px='5px' display={data ? 'block' : 'none'}>
        <Stack direction={'column'} alignItems={'flex-start'} gap={2}>
          <Flex alignItems={'center'} gap={1}>
            <FormControl isInvalid={!isMatch && compName !== ''}>
              <Input
                placeholder='*mystring*'
                width={'500px'}
                value={compName}
                onChange={handleChange}
                bg={'white'}
              />
              {compName !== '' && !isMatch && (
                <FormErrorMessage>Invalid regular expression</FormErrorMessage>
              )}
            </FormControl>
            <Button
              fontWeight={'medium'}
              colorScheme='blue'
              onClick={handleAdd}
            >
              Apply
            </Button>
          </Flex>
          <Flex flexDirection={'row'} flexWrap={'wrap'} spacing={2} gap={2}>
            {data?.length > 0 &&
              data?.map((item, index) => (
                <Tag key={index} variant='subtle' colorScheme={'blue'}>
                  <TagLabel onClick={() => handleUpdate(item)}>
                    {item.matchStr}
                  </TagLabel>
                  <TagCloseButton onClick={() => handleDeleteComp(item.id)} />
                </Tag>
              ))}
          </Flex>
        </Stack>
      </CardBody>
    </Card>
  )
}

export default ComponentFeed

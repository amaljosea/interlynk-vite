// Chakra imports
import {
  Flex,
  Text,
  useColorModeValue,
  FormControl,
  FormLabel,
  Input,
  Button,
  HStack,
  useClipboard
} from '@chakra-ui/react'
// Custom components
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import { useEffect, useState } from 'react'

const GeneralFeed = ({ orgInfo }) => {
  const textColor = useColorModeValue('gray.700', 'white')

  const [orgName, setOrgName] = useState('')
  const [orgId, setOrgId] = useState('')

  useEffect(() => {
    if (orgInfo) {
      console.log(`orgInfo`, orgInfo)
      setOrgName(orgInfo.organization.name)
      setOrgId(orgInfo.organization.id)
    }
  }, [orgInfo])

  const id = useClipboard(orgId)

  return (
    <Card p={0}>
      <CardHeader p='12px 0' mb='12px'>
        <Text fontSize='lg' color={textColor} fontWeight='bold'>
          Organization
        </Text>
      </CardHeader>
      <CardBody px='5px'>
        <Flex
          width={'100%'}
          flexDirection={'column'}
          alignItems={'flex-start'}
          gap={6}
        >
          {/* NAME */}
          <FormControl>
            <FormLabel>Name</FormLabel>
            <HStack spacing={2}>
              <Input
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
              <Button variant='solid' colorScheme={'blue'}>
                Update
              </Button>
            </HStack>
          </FormControl>
          {/* ID */}
          <FormControl>
            <FormLabel>Interlynk ID</FormLabel>
            <HStack spacing={2}>
              <Input
                value={orgId}
                onChange={(e) => setOrgId(e.target.value)}
                readOnly
              />
              <Button
                variant='solid'
                colorScheme={'blue'}
                onClick={() => id.onCopy()}
              >
                {id.hasCopied ? 'Copied!' : 'Copy'}
              </Button>
            </HStack>
          </FormControl>
        </Flex>
      </CardBody>
    </Card>
  )
}

export default GeneralFeed

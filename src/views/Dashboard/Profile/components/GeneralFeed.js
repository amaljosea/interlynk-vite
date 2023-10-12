// Chakra imports
import { useMutation } from '@apollo/client'
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
import { orgUpdate } from 'graphQL/Mutation'
import { useEffect, useState } from 'react'

const GeneralFeed = ({ orgInfo, refetch, getOrgInfo }) => {
  const textColor = useColorModeValue('gray.700', 'white')

  const [orgName, setOrgName] = useState('')
  const [orgId, setOrgId] = useState('')
  const [message, setMessage] = useState('Update')

  const [updateOrg] = useMutation(orgUpdate)

  useEffect(() => {
    if (orgInfo) {
      setOrgName(orgInfo.organization.name)
      setOrgId(orgInfo.organization.id)
    }
  }, [orgInfo])

  const id = useClipboard(orgId)

  const handleUpdate = async () => {
    if (orgName !== '') {
      try {
        await updateOrg({
          variables: {
            name: orgName
          }
        })
          .then((res) => {
            if (res) {
              setMessage('Saving....')
              setTimeout(() => {
                setMessage('Update')
              }, 2000)
            }
          })
          .finally(() => {
            refetch()
          })
      } catch (error) {
        console.log(`Error`, error)
      }
    } else {
      alert('Fields are required')
    }
  }

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
            <Input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
            <Button
              mt={3}
              variant='solid'
              colorScheme={'blue'}
              onClick={handleUpdate}
              disabled={message === 'Saving....'}
            >
              {message}
            </Button>
          </FormControl>
          {/* ID */}
          <FormControl>
            <FormLabel>Interlynk ID</FormLabel>
            <Input
              value={orgId}
              onChange={(e) => setOrgId(e.target.value)}
              readOnly
            />
            <Button
              mt={3}
              variant='solid'
              colorScheme={'blue'}
              onClick={() => id.onCopy()}
            >
              {id.hasCopied ? 'Copied!' : 'Copy'}
            </Button>
          </FormControl>
        </Flex>
      </CardBody>
    </Card>
  )
}

export default GeneralFeed

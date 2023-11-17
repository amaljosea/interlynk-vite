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
  useToast
} from '@chakra-ui/react'
// Custom components
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import { orgUpdate } from 'graphQL/Mutation'
import { useEffect, useState } from 'react'

const GeneralFeed = ({ orgInfo, refetch }) => {
  const toast = useToast()
  const textColor = useColorModeValue('gray.700', 'white')
  const [orgName, setOrgName] = useState('')
  const [message, setMessage] = useState('Update')

  const [updateOrg] = useMutation(orgUpdate)

  useEffect(() => {
    if (orgInfo) {
      setOrgName(orgInfo.organization.name)
    }
  }, [orgInfo])

  const handleUpdate = async () => {
    try {
      await updateOrg({
        variables: {
          name: orgName
        }
      })
        .then((res) => {
          if (res.data.organizationUpdate.errors.length === 0) {
            setMessage('Saving....')
            setTimeout(() => {
              setMessage('Update')
              toast({
                description: 'Organization name updated successfully',
                status: 'success',
                position: 'top',
                duration: 2000
              })
            }, 2000)
          }
        })
        .finally(() => {
          refetch()
        })
    } catch (error) {
      console.log(`Error`, error)
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
          <FormControl isRequired>
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
              disabled={message === 'Saving....' || orgName === ''}
            >
              {message}
            </Button>
          </FormControl>
        </Flex>
      </CardBody>
    </Card>
  )
}

export default GeneralFeed

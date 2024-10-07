import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'

import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text
} from '@chakra-ui/react'

// Custom components
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import { useThemeColor } from 'hooks/useThemeColors'

import { orgUpdate } from 'graphQL/Mutation'

const GeneralFeed = () => {
  const { organization } = useGlobalState()

  const updateOrgs = useHasPermission({
    parentKey: 'view_organization',
    childKey: 'update_organization'
  })

  const { showToast } = useCustomToast()
  const { inverseSecondaryBgColor } = useThemeColor(['inverseSecondaryBgColor'])

  const [orgName, setOrgName] = useState('')
  const [message, setMessage] = useState('Update')

  const [updateOrg] = useMutation(orgUpdate)

  const handleUpdate = async () => {
    await updateOrg({
      variables: {
        name: orgName
      }
    }).then((res) => {
      if (res.data.organizationUpdate.errors.length === 0) {
        setMessage('Saving....')
        setTimeout(() => {
          setMessage('Update')
          showToast({
            description: 'Organization name updated successfully',
            status: 'success'
          })
        }, 2000)
      }
    })
  }

  useEffect(() => {
    if (organization) {
      setOrgName(organization?.name)
    }
  }, [organization])

  return (
    <Card p={0}>
      <CardHeader p='12px 0' mb='12px'>
        <Text fontSize='lg' color={inverseSecondaryBgColor} fontWeight='bold'>
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
          <FormControl isRequired width={400}>
            <FormLabel>Name</FormLabel>
            <Input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              readOnly={!updateOrgs}
            />
            {updateOrgs && (
              <Button
                mt={3}
                variant='solid'
                colorScheme={'blue'}
                onClick={handleUpdate}
                disabled={message === 'Saving....' || orgName === ''}
              >
                {message}
              </Button>
            )}
          </FormControl>
        </Flex>
      </CardBody>
    </Card>
  )
}

export default GeneralFeed

import { useMutation } from '@apollo/client'
import { getSignedUrlParams } from 'utils'

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  Flex,
  SkeletonText,
  Stack,
  Text,
  useDisclosure
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'

import useCustomToast from 'hooks/useCustomToast'

import { sbomUpdate } from 'graphQL/Mutation'

import { LuFilePen } from 'react-icons/lu'

import ConfirmationModal from '../components/ConfirmationModal'
import SbomDetails from './SbomDetails/index'

const SbomInfo = ({ data, error, loading }) => {
  const LIFECYCLE = useDisclosure()
  const { showToast } = useCustomToast()
  const signedUrlParams = getSignedUrlParams()

  const [updateSbom, { loading: updating }] = useMutation(sbomUpdate)

  const updateLifecycle = () => {
    updateSbom({
      variables: { id: data?.id, created: true, spec: data?.spec }
    }).then((res) => {
      if (res?.data?.sbomUpdate?.errors?.length > 0) {
        showToast({
          description: res?.data?.sbomUpdate?.errors[0],
          status: 'warning'
        })
      } else {
        showToast({
          description: 'SBOM lifecycle updated successfully',
          status: 'success'
        })
        LIFECYCLE.onClose()
      }
    })
  }

  if (error) {
    return (
      <Card>
        <Text>Something went wrong</Text>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <SkeletonText width={'100%'} noOfLines={2} skeletonHeight={'22px'} />
      </Card>
    )
  }

  return (
    <>
      <Stack spacing={5}>
        {data?.lifecycle === 'draft' && (
          <Alert status='warning' py={5} borderRadius={'15px'}>
            <Flex
              w='100%'
              alignItems={'center'}
              justifyContent={'space-between'}
            >
              <Flex alignItems={'center'}>
                <AlertIcon />
                <Stack spacing={0}>
                  <AlertTitle>Draft Mode</AlertTitle>
                  <AlertDescription>
                    This version was created manually and is currently in draft
                    mode until it is finalized.
                  </AlertDescription>
                </Stack>
              </Flex>
              <Button
                colorScheme='blue'
                leftIcon={<LuFilePen />}
                hidden={signedUrlParams}
                onClick={() => LIFECYCLE.onOpen()}
              >
                Finalize
              </Button>
            </Flex>
          </Alert>
        )}
        <Card className='version' pb={7}>
          <CardBody>
            <SbomDetails sbomData={data} />
          </CardBody>
        </Card>
      </Stack>

      {/* UPDATE LIFECYCLE */}
      {LIFECYCLE.isOpen && (
        <ConfirmationModal
          isLoading={updating}
          isOpen={LIFECYCLE.isOpen}
          onClose={LIFECYCLE.onClose}
          onConfirm={updateLifecycle}
          name={`${data?.project?.projectGroup?.name} - ${data?.projectVersion}`}
          title='Finalize Draft'
          description='Finalizing this draft will:'
          items={[
            'Create the new product version',
            'Trigger import actions, including checks, automation, and analysis'
          ]}
        />
      )}
    </>
  )
}

export default SbomInfo

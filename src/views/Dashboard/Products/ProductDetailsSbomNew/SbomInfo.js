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
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'

import { sbomUpdate } from 'graphQL/Mutation'

import { LuFilePen } from 'react-icons/lu'

import ConfirmationModal from '../components/ConfirmationModal'
import SbomDetails from './SbomDetails/index'

const SbomInfo = ({ data, error, loading }) => {
  const LIFECYCLE = useDisclosure()
  const { showToast } = useCustomToast()
  const signedUrlParams = getSignedUrlParams()
  const { isFreeTier } = useGlobalQueryContext()

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
          <Alert status='info' py={5} borderRadius={'15px'}>
            <Flex
              w='100%'
              alignItems={'center'}
              justifyContent={'space-between'}
            >
              <Flex alignItems={'center'}>
                <AlertIcon />
                <Stack spacing={0}>
                  <AlertTitle>
                    This version has been created manually and is currently in
                    the Draft mode.
                  </AlertTitle>
                  <AlertDescription>
                    Import actions will run on this version once it is
                    finalized.
                  </AlertDescription>
                </Stack>
              </Flex>
              <Button
                colorScheme='blue'
                leftIcon={<LuFilePen />}
                onClick={() => LIFECYCLE.onOpen()}
                hidden={signedUrlParams || isFreeTier}
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
          title='Finalize SBOM Build'
          description='Finalizing this SBOM will:'
          items={[
            'Create a new version',
            'Prevent any further edits (you will not be able to revert it to draft)'
          ]}
        />
      )}
    </>
  )
}

export default SbomInfo

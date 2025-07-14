import { gql, useQuery } from '@apollo/client'
import microsoftIntraIdPng from 'assets/img/Microsoft_Entra_ID.png'

import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  Image,
  SimpleGrid,
  SkeletonText,
  Stack,
  Text,
  useDisclosure
} from '@chakra-ui/react'

import { useHasPermission } from 'hooks/useHasPermission'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { LuCircleCheckBig } from 'react-icons/lu'

import SSOConfigModal from './SSOConfigModal'

const getAzureConfig = gql`
  query getAzureConfig {
    organization {
      samlConfig {
        id
        enabled
        tenant
        metadataUrl
        idpSsoServiceUrl
        assertionConsumerServiceUrl
        issuer
        nameIdentifierFormat
        attributeStatements
        createdAt
        updatedAt
      }
    }
  }
`

const SSOConnection = () => {
  const AZURE = useDisclosure()
  const activeTab = useQueryParam('tab')

  const canUpdate = useHasPermission({
    parentKey: 'view_connections',
    childKey: 'edit_connections'
  })

  const { primaryTextColor, secondaryTextInverse } = useThemeColor([
    'primaryTextColor',
    'secondaryTextInverse'
  ])

  const onConfigure = () => AZURE.onOpen()

  const { data, loading } = useQuery(getAzureConfig, {
    skip: activeTab === 'SSO' ? false : true
  })

  const { samlConfig } = data?.organization || {}
  const isConnected = samlConfig?.tenant

  if (loading) {
    return (
      <SkeletonText
        spacing='4'
        noOfLines={4}
        skeletonHeight='4'
        sx={{ mx: '2', mt: 4 }}
      />
    )
  }

  return (
    <>
      <Stack spacing={6}>
        <Box>
          <Text fontSize='lg' color={primaryTextColor} fontWeight='bold'>
            Enterprise SSO Intergration
          </Text>
          <Text fontSize={'sm'}>
            Manage integration with other applications to streamline workflows
            and notifications
          </Text>
        </Box>
        <SimpleGrid columns={4} gap={4}>
          <Card variant={'outline'}>
            <CardHeader pb={0}>
              <Flex gap={4} alignItems={'center'}>
                <Image
                  height='40px'
                  width={'40px'}
                  src={microsoftIntraIdPng}
                  alt={`Microsoft Entra ID`}
                />
                <Text fontSize='lg' fontWeight='500' color={primaryTextColor}>
                  Azure Active Directory
                </Text>
              </Flex>
            </CardHeader>
            <CardBody pb={0}>
              <Text fontSize={'sm'} color={secondaryTextInverse}>
                It is a cloud-based identity and access management {`(IAM)`}{' '}
                solution that helps organizations secure and manage identities
                across cloud and on-premises environments
              </Text>
            </CardBody>
            <CardFooter>
              <Button
                fontSize='sm'
                title='Configure'
                width={'fit-content'}
                onClick={onConfigure}
                isDisabled={!canUpdate}
                colorScheme={isConnected ? 'blue' : 'gray'}
                leftIcon={isConnected && <LuCircleCheckBig size={18} />}
              >
                {isConnected ? 'Configured' : 'Configure'}
              </Button>
            </CardFooter>
          </Card>
        </SimpleGrid>
      </Stack>

      {AZURE.isOpen && (
        <SSOConfigModal
          data={samlConfig}
          isOpen={AZURE.isOpen}
          onClose={AZURE.onClose}
        />
      )}
    </>
  )
}

export default SSOConnection

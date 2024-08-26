import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure
} from '@chakra-ui/react'
import { useColorModeValue } from '@chakra-ui/react'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'

import FeatureGroup from './FeatureGroupTable'

const PlanTable = () => {
  const { isFreeTier } = useGlobalQueryContext()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const headerBgColor = useColorModeValue('white', 'gray.700')
  const usageData = [
    { feature: 'Users', val1: '5', val2: 'Custom' },
    { feature: 'Products', val1: '10', val2: 'Unlimited' }
  ]

  const sbomFeatures = [
    { feature: 'SBOM Management', val1: true, val2: true },
    { feature: 'SBOM Manual Build', val1: true, val2: true },
    { feature: 'SBOM Editor', val1: true, val2: true },
    { feature: 'SBOM Quality Scoring', val1: true, val2: true },
    { feature: 'SBOM Compliance Assessment', val1: true, val2: true },
    { feature: 'SBOM ShareLynk', val1: true, val2: true },
    { feature: 'SBOM Automation Rules', val1: false, val2: true },
    { feature: 'SBOM Parts Composition', val1: false, val2: true },
    { feature: 'SBOM In-Place Signing', val1: false, val2: true },
    { feature: 'SBOM Component Privacy', val1: false, val2: true }
  ]

  const riskManagementFeatures = [
    { feature: 'Vulnerability Management', val1: true, val2: true },
    { feature: 'Exploitability Editor (VEX)', val1: true, val2: true },
    {
      feature: 'End-of-life / End-of-service Detection',
      val1: false,
      val2: true
    },
    { feature: 'Open Source Risk Scoring', val1: false, val2: true },
    { feature: 'OpenSSF Scorecard Risk Scoring', val1: false, val2: true }
  ]

  const managementAndReportingFeatures = [
    { feature: 'Policy Management', val1: true, val2: true },
    { feature: 'Role Based Access Control (RBAC)', val1: false, val2: true },
    { feature: 'Custom Roles', val1: false, val2: true },
    { feature: 'Integrated License Manager', val1: false, val2: true },
    { feature: 'Analytics', val1: false, val2: true }
  ]

  const supportFeatures = [
    { feature: 'Product Support', val1: 'Email', val2: 'Chat, Slack, Email' }
  ]

  const integrationsFeatures = [
    {
      feature: 'Workflow Integrations',
      val1: false,
      val2: 'JIRA, Teams, Slack, GitHub'
    }
  ]

  return (
    <Box p={8}>
      {/* Plan Overview Section */}
      <Grid templateColumns='repeat(4, 1fr)' gap={8} mb={6}>
        <GridItem>
          <Text fontWeight='bold'>Plan</Text>
          <Text>
            {isFreeTier ? 'Free Forever' : 'Enterprise'}
          </Text>
        </GridItem>
        <GridItem>
          <Text fontWeight='bold'>Products</Text>
          <Text>{isFreeTier ? '10' : 'Unlimited'}</Text>
        </GridItem>
        <GridItem>
          <Text fontWeight='bold'>Users</Text>
          <Text>{isFreeTier ? '5' : 'Unlimited'}</Text>
        </GridItem>
        <GridItem>
          <Text fontWeight='bold'>Renewal Date</Text>
          <Text>N/A</Text>
        </GridItem>
      </Grid>

      {/* Upgrade Modal */}
      {isFreeTier && (
        <Flex justify='left' marginTop={'40px'}>
          <Button colorScheme='blue' onClick={onOpen}>
            Upgrade Plan
          </Button>
        </Flex>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size='lg'>
        <ModalOverlay />
        <ModalContent maxW='800px' h='80vh'>
          {' '}
          <ModalHeader>Upgrade to Enterprise Plan</ModalHeader>
          <ModalCloseButton />
          <Table>
            <Thead bg={headerBgColor}>
              <Tr
                textColor={'gray.500'}
                textAlign={'left'}
                textTransform={'uppercase'}
              >
                <Th paddingLeft={'45px'} w={'190px'}>
                  Feature
                </Th>
                <Th w={'5px'}>Free</Th>
                <Th w={'50px'}>Enterprise</Th>
              </Tr>
            </Thead>
          </Table>
          <Box as={ModalBody} overflowY='auto' maxH='calc(80vh - 120px)'>
            <Table variant='simple'>
              <Tbody>
                <FeatureGroup title='Usage' features={usageData} />
                <FeatureGroup title='SBOM Features' features={sbomFeatures} />
                <FeatureGroup
                  title='Risk Management'
                  features={riskManagementFeatures}
                />
                <FeatureGroup
                  title='Management & Reporting'
                  features={managementAndReportingFeatures}
                />
                <FeatureGroup
                  title='Integrations'
                  features={integrationsFeatures}
                />
                <FeatureGroup title='Support' features={supportFeatures} />
              </Tbody>
            </Table>
          </Box>
          <ModalFooter
            justifyContent='flex-end'
            gap={'20px'}
            marginLeft={'10px'}
          >
            <Button
              colorScheme='white'
              textColor={'blue.400'}
              onClick={() => onClose()}
            >
              Cancel
            </Button>
            <Button
              colorScheme='blue'
              onClick={() =>
                (window.location.href = 'mailto:sales@interlynk.io')
              }
            >
              Contact Us
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default PlanTable

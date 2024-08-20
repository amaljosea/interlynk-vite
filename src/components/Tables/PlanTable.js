import { useState } from 'react'

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
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure
} from '@chakra-ui/react'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'

const PlanTable = () => {
  const { isFreeTier } = useGlobalQueryContext()
  const [showAll, setShowAll] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Box p={8}>
      {/* Plan Overview Section */}
      <Grid templateColumns='repeat(4, 1fr)' gap={8} mb={6}>
        <GridItem>
          <Text fontWeight='bold'>Plan</Text>
          <Text color='blue.500'>
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

      {/* Upgrade Button */}
      {isFreeTier && (
        <Flex justify='left' marginTop={'40px'}>
          <Button colorScheme='blue' onClick={onOpen}>
            Upgrade Plan
          </Button>
        </Flex>
      )}

      {/* Upgrade Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent maxW={'800px'}>
          <ModalHeader>Upgrade to Enterprise Plan</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Table variant='simple'>
              <Thead>
                <Tr>
                  <Th w={'500px'}>Feature</Th>
                  <Th w={'150px'}>Free</Th>
                  <Th w={'150px'}>Enterprise</Th>
                </Tr>
              </Thead>
              <Tbody>
                {/* Initial rows */}
                <Tr>
                  <Td>Users</Td>
                  <Td>5</Td>
                  <Td>Custom</Td>
                </Tr>
                <Tr>
                  <Td>Products</Td>
                  <Td>10</Td>
                  <Td>Unlimited</Td>
                </Tr>
                <Tr>
                  <Td>SBOM Management</Td>
                  <Td>Yes</Td>
                  <Td>Yes</Td>
                </Tr>
                <Tr>
                  <Td>SBOM Manual Build</Td>
                  <Td>Yes</Td>
                  <Td>Yes</Td>
                </Tr>
                <Tr>
                  <Td>SBOM Editor</Td>
                  <Td>Yes</Td>
                  <Td>Yes</Td>
                </Tr>
                <Tr>
                  <Td>SBOM Quality Scoring</Td>
                  <Td>Yes</Td>
                  <Td>Yes</Td>
                </Tr>
                <Tr>
                  <Td>SBOM Compliance Assessment</Td>
                  <Td>Yes</Td>
                  <Td>Yes</Td>
                </Tr>
                <Tr>
                  <Td>Vulnerability Management</Td>
                  <Td>Yes</Td>
                  <Td>Yes</Td>
                </Tr>
                <Tr>
                  <Td>Exploitability Editor (VEX)</Td>
                  <Td>Yes</Td>
                  <Td>Yes</Td>
                </Tr>
                <Tr>
                  <Td>Policy Management</Td>
                  <Td>Yes</Td>
                  <Td>Yes</Td>
                </Tr>
                {/* Conditionally rendered rows */}
                {showAll && (
                  <>
                    <Tr>
                      <Td>SBOM ShareLynk</Td>
                      <Td>Yes</Td>
                      <Td>Yes</Td>
                    </Tr>
                    <Tr>
                      <Td>Role Based Access Control (RBAC)</Td>
                      <Td>No</Td>
                      <Td>Yes</Td>
                    </Tr>
                    <Tr>
                      <Td>Custom Roles</Td>
                      <Td>No</Td>
                      <Td>Yes</Td>
                    </Tr>
                    <Tr>
                      <Td>SBOM Automation Rules</Td>
                      <Td>No</Td>
                      <Td>Yes</Td>
                    </Tr>
                    <Tr>
                      <Td>SBOM Parts Composition</Td>
                      <Td>No</Td>
                      <Td>Yes</Td>
                    </Tr>
                    <Tr>
                      <Td>SBOM In-Place Signing</Td>
                      <Td>No</Td>
                      <Td>Yes</Td>
                    </Tr>
                    <Tr>
                      <Td>SBOM Component Privacy</Td>
                      <Td>No</Td>
                      <Td>Yes</Td>
                    </Tr>
                    <Tr>
                      <Td>End-of-life / End-of-service Detection</Td>
                      <Td>No</Td>
                      <Td>Yes</Td>
                    </Tr>
                    <Tr>
                      <Td>Open Source Risk Scoring</Td>
                      <Td>No</Td>
                      <Td>Yes</Td>
                    </Tr>
                    <Tr>
                      <Td>OpenSSF Scorecard Risk Scoring</Td>
                      <Td>No</Td>
                      <Td>Yes</Td>
                    </Tr>
                    <Tr>
                      <Td>Integrated License Manager</Td>
                      <Td>No</Td>
                      <Td>Yes</Td>
                    </Tr>
                    <Tr>
                      <Td>Analytics</Td>
                      <Td>No</Td>
                      <Td>Yes</Td>
                    </Tr>
                    <Tr>
                      <Td>Workflow Integrations</Td>
                      <Td>Email</Td>
                      <Td>Email, JIRA, Teams, Slack, GitHub</Td>
                    </Tr>
                  </>
                )}
              </Tbody>

              {/* Add more rows as needed */}
            </Table>
          </ModalBody>
          <ModalFooter
            justifyContent='flex-start'
            gap={'20px'}
            marginLeft={'10px'}
          >
            <Button
              colorScheme='white'
              textColor={'blue.400'}
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : 'Show More'}
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

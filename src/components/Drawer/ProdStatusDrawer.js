import { useMutation, useQuery } from '@apollo/client'
import {
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  FormLabel,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Tbody,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  Flex,
  DrawerFooter
} from '@chakra-ui/react'
import VulLinkRow from 'components/Tables/VulLinkRow'
import { updateCompVulnVex } from 'graphQL/Mutation'
import { getVexStatuses, getVexJustifications } from 'graphQL/Queries'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const ProdStatusDrawer = ({
  isOpen,
  onClose,
  btnRef,
  data,
  textColor,
  refetch,
  filteredData
}) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

  const email = window.localStorage.getItem('email')

  const { vuln, vexStatus, id, componentVulnLogs, vexJustification } = data

  const [statusTitle, setStatusTitle] = useState('')
  const [statusName, setStatusName] = useState('')
  const [justification, setJustification] = useState('')
  const [justificationName, setJustificationName] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [notes, setNotes] = useState('')

  const [statusResults, setStatusResults] = useState([])
  const [newVulnLogs, setNewVulnLogs] = useState([])

  const { data: allVexStatus } = useQuery(getVexStatuses)
  const { data: allVexJustify } = useQuery(getVexJustifications)

  const [compVexCreate] = useMutation(updateCompVulnVex)

  const handleStatusChange = (e) => {
    const { value } = e.target
    setStatusTitle(value)
    setStatusName(e.target.options[e.target.selectedIndex].text)
  }

  const handleJustifyChange = (e) => {
    const { value } = e.target
    setJustification(value)
    setJustificationName(e.target.options[e.target.selectedIndex].text)
  }

  const handleAdd = () => {
    setNewVulnLogs([
      {
        changedBy: email,
        id: id,
        justification: justificationName,
        notes: notes,
        status: statusName,
        updatedAt: new Date().toISOString()
      },
      ...newVulnLogs
    ])
  }

  const handleSave = async () => {
    try {
      await compVexCreate({
        variables: {
          compVulnId: id,
          notes: notes,
          sbomId: sbomId,
          vexStatusId: statusTitle,
          vexJustificationId: justification
        }
      }).then((res) => {
        if (res.data) {
          refetch({
            projectId: productId,
            sbomId: sbomId,
            first: 10,
            last: undefined,
            field: 'UPDATED_AT',
            direction: 'DESC'
          })
          onClose()
        }
      })
    } catch (error) {
      console.log('Mutation error', error)
    }
  }

  useEffect(() => {
    if (vexStatus) {
      setStatusTitle(vexStatus.id)
      setStatusName(vexStatus.name)
    }

    if (componentVulnLogs) {
      const sortedData =
        componentVulnLogs &&
        [...componentVulnLogs].sort((a, b) => {
          const dateA = new Date(a.updatedAt).getTime()
          const dateB = new Date(b.updatedAt).getTime()
          return dateB - dateA
        })
      setStatusResults(sortedData)
    }

    if (vexJustification) {
      setJustification(vexJustification.id)
    }
  }, [data])

  return (
    <Drawer
      isOpen={isOpen}
      placement='right'
      onClose={onClose}
      finalFocusRef={btnRef}
      // closeOnOverlayClick={false}
      size={location.pathname.startsWith('/customer') ? 'sm' : 'xl'}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton
        //  onClick={() => refetch !== null && refetch()}
        />
        <DrawerHeader borderBottomWidth='1px' color='gray.600'>
          {vuln.vulnId} Status
        </DrawerHeader>
        <DrawerBody>
          <Stack spacing='24px'>
            <Box>
              <SimpleGrid row={5} spacing={4}>
                {location.pathname.startsWith('/customer') ? (
                  ''
                ) : (
                  <>
                    <Box>
                      <FormLabel
                        htmlFor='product'
                        fontSize='sm'
                        color='gray.600'
                      >
                        Status
                      </FormLabel>
                      <Select
                        id='product'
                        size='sm'
                        color='gray.500'
                        value={statusTitle}
                        onChange={handleStatusChange}
                      >
                        <option value=''>-- Select Status --</option>
                        {allVexStatus ? (
                          allVexStatus.vexStatuses.map((st, idx) => (
                            <option key={idx} value={st.id}>
                              {st.name}
                            </option>
                          ))
                        ) : (
                          <option value={''}>No data found</option>
                        )}
                      </Select>
                    </Box>
                    {statusName === 'Not Affected' ? (
                      <Box>
                        <FormLabel
                          py='4px'
                          htmlFor='product'
                          fontSize='sm'
                          color='gray.600'
                        >
                          Justification
                        </FormLabel>
                        <Select
                          id='justification'
                          value={justification}
                          onChange={handleJustifyChange}
                          size='sm'
                          color='gray.500'
                        >
                          {allVexJustify ? (
                            allVexJustify.vexJustifications.map(
                              (justify, idx) => (
                                <option key={idx} value={justify.id}>
                                  {justify.name}
                                </option>
                              )
                            )
                          ) : (
                            <option value={''}>No data found</option>
                          )}
                        </Select>
                      </Box>
                    ) : (
                      ''
                    )}
                    {statusName === 'Fixed' ? (
                      <Box>
                        <FormLabel
                          py='4px'
                          htmlFor='product'
                          fontSize='sm'
                          color='gray.600'
                        >
                          Version
                        </FormLabel>
                        <Select
                          id='tag'
                          value={selectedTag}
                          onChange={(e) => setSelectedTag(e.target.value)}
                          size='sm'
                          color='gray.500'
                        >
                          {filteredData && filteredData.length > 0 ? (
                            filteredData.map((item, index) => (
                              <option
                                key={index}
                                value={item.id}
                                name={item.version}
                              >
                                {item.version}
                              </option>
                            ))
                          ) : (
                            <option value=''>-- --</option>
                          )}
                        </Select>
                      </Box>
                    ) : (
                      ''
                    )}
                  </>
                )}
                <Box>
                  <Textarea
                    placeholder='Notes'
                    size='sm'
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </Box>
                {location.pathname.startsWith('/customer') ? (
                  <Flex dir='row' gap={2} width={'100%'}>
                    <Button colorScheme='red' width={'100%'}>
                      Request Status
                    </Button>
                    <Button colorScheme='green' width={'100%'}>
                      Accept Status
                    </Button>
                  </Flex>
                ) : (
                  <Button
                    width={'fit-content'}
                    colorScheme='blue'
                    onClick={handleAdd}
                    disabled={statusTitle === ''}
                  >
                    Add
                  </Button>
                )}
                <Flex flexDir={'column'}>
                  <Text size='md' my={2}>
                    Status History
                  </Text>
                  {(componentVulnLogs.length > 0 || newVulnLogs.length > 0) && (
                    <Table variant='simple' color={textColor} size='sm' mt={4}>
                      <Thead>
                        <Tr my='.8rem'>
                          <Th color='gray.400' pl={0}>
                            Username
                          </Th>
                          <Th color='gray.400'>Status</Th>
                          <Th color='gray.400'>Justification</Th>
                          <Th color='gray.400'>Timestamp</Th>
                          <Th color='gray.400'>Note</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {newVulnLogs.length > 0 &&
                          newVulnLogs.map((item) => (
                            <VulLinkRow
                              key={item.id}
                              id={item.id}
                              username={item.changedBy}
                              justification={item.justification}
                              status={item.status}
                              timestamp={item.updatedAt}
                              notes={item.note}
                            />
                          ))}

                        {statusResults.length > 0 &&
                          statusResults.map((item) => (
                            <VulLinkRow
                              key={item.id}
                              id={item.id}
                              username={item.changedBy}
                              justification={item.justification}
                              status={item.status}
                              timestamp={item.updatedAt}
                              notes={item.note}
                            />
                          ))}
                      </Tbody>
                    </Table>
                  )}

                  {componentVulnLogs.length === 0 &&
                    newVulnLogs.length === 0 && (
                      <Text mt={4} color={'darkgrey'}>
                        No status history found
                      </Text>
                    )}
                </Flex>
              </SimpleGrid>
              <Divider />
            </Box>
          </Stack>
        </DrawerBody>
        <DrawerFooter>
          <Button mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme='blue'
            onClick={handleSave}
            disabled={newVulnLogs.length === 0}
          >
            Save
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default ProdStatusDrawer

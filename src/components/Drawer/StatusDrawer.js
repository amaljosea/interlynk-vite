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
  useToast
} from '@chakra-ui/react'
import VulLinkRow from 'components/Tables/VulLinkRow'
import GlobalContext from 'context/GlobalContext'
import { VexVulnCreate } from 'graphQL/Mutation'
import {
  getVexStatuses,
  getVexJustifications,
  getVexLogs
} from 'graphQL/Queries'
import React, { useContext } from 'react'
import { useEffect } from 'react'
import { useState } from 'react'

const StatusDrawer = ({
  isOpen,
  onClose,
  btnRef,
  cve,
  status,
  component,
  version,
  imgVersionId,
  imageInfo,
  textColor,
  id,
  vulnRefetch,
  setVulData,
  filteredData
}) => {
  const toast = useToast()

  const { productVulData, setProductVulData } = useContext(GlobalContext)

  const [statusTitle, setStatusTitle] = useState('')
  const [statusName, setStatusName] = useState('')
  const [justification, setJustification] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [notes, setNotes] = useState('')

  const [statusResults, setStatusResults] = useState([])

  const { data: allVexStatus } = useQuery(getVexStatuses, {})
  const { data: allVexJustify } = useQuery(getVexJustifications, {})
  const { data: allVexLogs, refetch } = useQuery(getVexLogs, {
    variables: {
      imageVersionId: imgVersionId,
      cveId: cve,
      compName: component,
      version: version
    }
  })

  const [vexVulnCreate] = useMutation(VexVulnCreate, {
    onCompleted: refetch
  })

  const handleStatusChange = (e) => {
    const { value } = e.target
    setStatusTitle(value)
    setStatusName(e.target.options[e.target.selectedIndex].text)
  }

  const getFormattedDate = (year, month, day) => {
    // Create a new Date object with the specified year, month, and day
    const date = new Date(year, month - 1, day)

    // Use the toDateString() method to get the formatted date string
    const formattedDate = date.toDateString()

    return formattedDate
  }

  const handleAdd = async () => {
    // console.log(`Status title`, statusTitle)
    if (statusTitle !== '') {
      const updatedItems = productVulData.map((item) => {
        if (item.id === id) {
          return { ...item, status: statusTitle }
        }
        return item
      })
      setProductVulData(updatedItems)
      onClose()
    } else {
      toast({
        description: 'Please select status',
        status: 'error',
        duration: 3000,
        position: 'top'
      })
    }
  }

  useEffect(() => {
    if (allVexLogs) {
      const sortedData =
        allVexLogs.vexLogs &&
        [...allVexLogs.vexLogs].sort((a, b) => {
          const dateA = new Date(a.updatedAt).getTime()
          const dateB = new Date(b.updatedAt).getTime()
          return dateB - dateA
        })
      setStatusResults(sortedData)
    }
  }, [allVexLogs])

  useEffect(() => {
    if (cve === 'CVE-2019-8457') {
      setVulData((prev) => [
        {
          username: 'surendra',
          justification,
          status: status,
          timestamp: new Date().toDateString(),
          notes: notes
        }
      ])
    }

    if (cve === 'CVE-2023-27534') {
      location.pathname.startsWith('/customer')
        ? setVulData((prev) => [
            {
              username: 'IBM',
              justification: '',
              status: 'Must-Address',
              timestamp: getFormattedDate('2023', '6', '20'),
              notes: notes
            }
          ])
        : setVulData((prev) => [
            {
              username: 'Uber',
              justification: '',
              status: 'Accepted',
              timestamp: getFormattedDate('2023', '6', '21'),
              notes: notes
            },
            {
              username: 'IBM',
              justification: '',
              status: 'Must-Address',
              timestamp: getFormattedDate('2023', '6', '20'),
              notes: notes
            },
            {
              username: 'Oracle',
              justification: '',
              status: 'Must-Address',
              timestamp: getFormattedDate('2023', '6', '19'),
              notes: notes
            }
          ])
    }
  }, [cve, status])

  useEffect(() => {
    setStatusTitle(status)
  }, [status])

  return (
    <Drawer
      isOpen={isOpen}
      placement='right'
      onClose={onClose}
      finalFocusRef={btnRef}
      // closeOnOverlayClick={false}
      size={location.pathname.startsWith('/customer') ? 'sm' : 'md'}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton
          onClick={() => vulnRefetch !== null && vulnRefetch()}
        />
        <DrawerHeader borderBottomWidth='1px' color='gray.600'>
          {cve} Status
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
                            <option key={idx} value={st.name}>
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
                          onChange={(e) => setJustification(e.target.value)}
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
                  <Button colorScheme='blue' onClick={handleAdd}>
                    Add
                  </Button>
                )}
                <Flex flexDir={'column'} display={'none'}>
                  <Text size='md' my={2}>
                    Status History
                  </Text>
                  {allVexLogs &&
                  allVexLogs.vexLogs &&
                  allVexLogs.vexLogs.length > 0 ? (
                    <Table variant='simple' color={textColor} size='sm' mt={4}>
                      <Thead>
                        <Tr my='.8rem' pl='0px'>
                          <Th color='gray.400'>Username</Th>
                          <Th color='gray.400'>Status</Th>
                          <Th color='gray.400'>Justification</Th>
                          <Th color='gray.400'>Timestamp</Th>
                          <Th color='gray.400'>Note</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {statusResults &&
                          statusResults.map((item) => (
                            <VulLinkRow
                              key={item.id}
                              id={item.id}
                              username={item.user.name}
                              justification={item.vexJustification?.name}
                              status={item.vexStatus.name}
                              timestamp={item.updatedAt}
                              notes={item.note}
                            />
                          ))}
                      </Tbody>
                    </Table>
                  ) : (
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
      </DrawerContent>
    </Drawer>
  )
}

export default StatusDrawer

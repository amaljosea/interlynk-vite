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
import { updateCompVulnVex } from 'graphQL/Mutation'
import { VexVulnCreate } from 'graphQL/Mutation'
import {
  getVexStatuses,
  getVexJustifications,
  getVexLogs
} from 'graphQL/Queries'
import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'

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
  refetch,
  setVulData,
  filteredData
}) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

  const [statusTitle, setStatusTitle] = useState('')
  const [statusName, setStatusName] = useState('')
  const [justification, setJustification] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [notes, setNotes] = useState('')

  const [statusResults, setStatusResults] = useState([])

  const { data: allVexStatus } = useQuery(getVexStatuses)
  const { data: allVexJustify } = useQuery(getVexJustifications)
  const { data: allVexLogs, refetch: vexLogsRefetch } = useQuery(getVexLogs, {
    variables: {
      imageVersionId: imgVersionId,
      cveId: cve,
      compName: component,
      version: version
    }
  })

  const [vexVulnCreate] = useMutation(VexVulnCreate)

  const [compVexCreate] = useMutation(updateCompVulnVex)

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
    if (status) {
      setStatusTitle(status.id)
    }
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
        //  onClick={() => refetch !== null && refetch()}
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
                  <Button
                    colorScheme='blue'
                    onClick={handleAdd}
                    disabled={statusTitle === ''}
                  >
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

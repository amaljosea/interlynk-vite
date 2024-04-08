import { useMutation, useQuery } from '@apollo/client'
import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'

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
  Flex,
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
  chakra,
  useToast
} from '@chakra-ui/react'

import VulLinkRow from 'components/Tables/VulLinkRow'

import { VexVulnCreate } from 'graphQL/Mutation'
import {
  getVexJustifications,
  getVexLogs,
  getVexStatuses
} from 'graphQL/Queries'

const MultiStatusDrawer = ({
  isOpen,
  onClose,
  btnRef,
  imgVersionId,
  imageInfo,
  checkedRows,
  setCheckedRows,
  vulnRefetch
}) => {
  const toast = useToast()

  const [statusTitle, setStatusTitle] = useState('')
  const [statusName, setStatusName] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [notes, setNotes] = useState('')

  const { data: allVexStatus } = useQuery(getVexStatuses)

  const [vexVulnCreate] = useMutation(VexVulnCreate)

  const handleStatusChange = (e) => {
    const { value } = e.target
    setStatusTitle(value)
    setStatusName(e.target.options[e.target.selectedIndex].text)
  }

  const handleAdd = () => {
    try {
      checkedRows.length > 0 &&
        checkedRows.map(async (item) => {
          await vexVulnCreate({
            variables: {
              imageVersionID: imgVersionId,
              cveID: item.cve,
              compName: item.component,
              compVersion: item.version,
              notes: notes,
              vexStatusID: statusTitle,
              fixedVersionID: selectedTag
            }
          })
            .then(() => {
              vulnRefetch()
              setNotes('')
              setCheckedRows([])
            })
            .finally(() => {
              onClose()
            })
        })
    } catch (error) {
      console.error('Status update error: ', error)
      toast({
        description:
          'An error occured while setting vulnerability status. Please retry in few minutes.',
        status: 'error',
        duration: 2000,
        position: 'top'
      })
    }
  }

  return (
    <Drawer
      isOpen={isOpen}
      placement='right'
      onClose={onClose}
      closeOnOverlayClick={false}
      size={location.pathname.startsWith('/customer') ? 'sm' : 'lg'}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton onClick={onClose} />
        <DrawerHeader borderBottomWidth='1px' color='gray.600'>
          Status
        </DrawerHeader>
        <DrawerBody>
          <Box mb={6}>
            <Flex gap={2} alignItems={'center'} fontSize={'sm'}>
              <Text>Apply status for - </Text>
              {checkedRows.map((item, index) => (
                <Text key={index} fontSize={'xs'}>
                  {item.cve}
                  {checkedRows.length > 1 ? ',' : ''}
                </Text>
              ))}
            </Flex>
          </Box>
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
                          allVexStatus.vexStatuses
                            .filter(
                              (item) =>
                                item.name !== 'Not Affected' &&
                                item.name !== 'Affected'
                            )
                            .map((st, idx) => (
                              <option key={idx} value={st.id}>
                                {st.name}
                              </option>
                            ))
                        ) : (
                          <option value={''}>No data found</option>
                        )}
                      </Select>
                    </Box>
                    {statusName === 'Fixed' ? (
                      <Box>
                        <FormLabel
                          py='4px'
                          htmlFor='product'
                          fontSize='sm'
                          color='gray.600'
                        >
                          Tag
                        </FormLabel>
                        <Select
                          id='tag'
                          value={selectedTag}
                          onChange={(e) => setSelectedTag(e.target.value)}
                          size='sm'
                          color='gray.500'
                        >
                          <option value={'select'}>--Select--</option>
                          {imageInfo && imageInfo.length > 0 ? (
                            imageInfo.map((img, index) => (
                              <option key={index} value={img.id}>
                                {img.name}
                              </option>
                            ))
                          ) : (
                            <option value={''}>No data found</option>
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
              </SimpleGrid>
              <Divider />
            </Box>
          </Stack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default MultiStatusDrawer

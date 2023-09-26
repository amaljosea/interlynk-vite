import { useState } from 'react'
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  Flex,
  Text,
  FormControl,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Table,
  Icon,
  Select,
  useToast,
  FormLabel,
  Input
} from '@chakra-ui/react'
import { DeleteIcon } from '@chakra-ui/icons'

const LinksDrawer = ({ isOpen, onClose, btnRef, component }) => {
  const [type, setType] = useState('')
  const [link, setLink] = useState('')
  const [linksData, setLinksData] = useState([])

  const urlPattern = new RegExp(
    '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?'
  )

  const toast = useToast()

  const handleLinkAdd = (e) => {
    e.preventDefault()
    if (urlPattern.test(link)) {
      setLinksData((prev) => [{ link, type }, ...prev])
      setType('')
      setLink('')
    } else {
      toast({
        description: `Invalid URL`,
        duration: 2000,
        position: 'top',
        status: 'error'
      })
    }
  }

  const handleLinkRemove = (id) => {
    const updatedList = linksData.filter((_, index) => index !== id)
    setLinksData(updatedList)
  }

  const handleSave = () => {
    console.log('Form submitted')
    onClose()
  }

  return (
    <>
      <Drawer
        isOpen={isOpen}
        placement='right'
        onClose={onClose}
        finalFocusRef={btnRef}
        size='md'
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader fontSize={16} fontWeight={'medium'}>
            Link
          </DrawerHeader>
          <DrawerBody>
            <form onSubmit={handleLinkAdd}>
              <Flex direction={'column'} alignItems={'flex-start'} gap={3}>
                <FormControl isRequired>
                  <FormLabel>Type</FormLabel>
                  <Select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value=''>-- Select --</option>
                    {[
                      'vcs',
                      'issue-tracker',
                      'website',
                      'advisories',
                      'bom',
                      'mailing-list',
                      'social',
                      'chat',
                      'documentation',
                      'support',
                      'distribution',
                      'license',
                      'build-meta',
                      'build-system',
                      'release-notes',
                      'other'
                    ].map((item, index) => (
                      <option key={index} value={item}>
                        {item}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Link</FormLabel>
                  <Input
                    placeholder='Add URL'
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                  />
                </FormControl>

                <Button colorScheme='blue' type='submit'>
                  Add
                </Button>

                <Flex width={'100%'} flexDir={'column'}>
                  <Text size='md' my={2}>
                    Link History
                  </Text>
                  {linksData.length > 0 ? (
                    <Table variant='simple' size='sm' mt={4}>
                      <Thead>
                        <Tr my='.8rem'>
                          <Th pl={0}>Link</Th>
                          <Th pl={0}>Type</Th>
                          <Th pl={0}></Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {linksData.map((item, index) => (
                          <Tr key={index}>
                            <Td pl={0} fontSize={'xs'}>
                              {item.link}
                            </Td>
                            <Td pl={0} fontSize={'xs'}>
                              {item.type}
                            </Td>
                            <Td>
                              <Icon
                                as={DeleteIcon}
                                color={'red'}
                                cursor={'pointer'}
                                onClick={() => handleLinkRemove(index)}
                              />
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  ) : (
                    <Text mt={4} color={'darkgrey'}>
                      No links specified
                    </Text>
                  )}
                </Flex>
              </Flex>
            </form>
          </DrawerBody>
          <DrawerFooter>
            <Button variant='outline' mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme='blue' onClick={handleSave}>
              Save
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default LinksDrawer

import { useEffect, useState } from 'react'
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
  FormLabel,
  Input,
  FormErrorMessage
} from '@chakra-ui/react'
import { DeleteIcon } from '@chakra-ui/icons'
import { useMutation } from '@apollo/client'
import { UpdateCompLinks } from 'graphQL/Mutation'
import { useContext } from 'react'
import GlobalContext from 'context/GlobalContext'

const LinksDrawer = ({
  isOpen,
  onClose,
  btnRef,
  component,
  sbomId,
  productId,
  refetch,
  totalRows
}) => {
  const [type, setType] = useState('')
  const [link, setLink] = useState('')
  const [linksData, setLinksData] = useState([])

  const { id, externalUrls } = component

  const { compDirection, compField } = useContext(GlobalContext)

  const [updateLinks] = useMutation(UpdateCompLinks)

  const urls = []

  useEffect(() => {
    externalUrls?.map((item) => {
      urls.push({
        name: item.name,
        url: item.url
      })
    })
    setLinksData(urls)
  }, [externalUrls])

  const urlPattern = new RegExp(
    '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?'
  )

  console.log('linksData', linksData)

  const handleLinkAdd = async (e) => {
    e.preventDefault()
    setLinksData((prev) => [{ url: link, name: type }, ...prev])
    setType('')
    setLink('')
  }

  const handleLinkRemove = (id) => {
    const updatedList = linksData.filter((_, index) => index !== id)
    setLinksData(updatedList)
  }

  const handleSave = async () => {
    await updateLinks({
      variables: {
        id: id,
        sbomId: sbomId,
        urls: linksData
      }
    })
      .then((res) => {
        if (res.data) {
          refetch({
            projectId: productId,
            sbomId: sbomId,
            first: totalRows,
            last: undefined,
            field: compField,
            direction: compDirection
          })
        }
      })
      .finally(() => onClose())
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
          <DrawerHeader borderBottomWidth='1px' color='gray.600'>
            Edit Links
          </DrawerHeader>
          <DrawerBody>
            <form onSubmit={handleLinkAdd}>
              <Flex direction={'column'} alignItems={'flex-start'} gap={3}>
                {/* NAME */}
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
                {/* URL */}
                <FormControl isRequired>
                  <FormLabel>Link</FormLabel>
                  <Input
                    placeholder='Add URL'
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                  />
                  {link !== '' && !urlPattern.test(link) && (
                    <FormErrorMessage>URL is invalid</FormErrorMessage>
                  )}
                </FormControl>
                {/* ACTIONS */}
                <Button
                  colorScheme='blue'
                  type='submit'
                  isDisabled={!urlPattern.test(link)}
                >
                  Add
                </Button>
                {/* TABLE */}
                <Flex width={'100%'} flexDir={'column'}>
                  <Text size='md' my={2}>
                    Existing Links
                  </Text>
                  {linksData.length > 0 ? (
                    <Table variant='simple' size='sm' mt={4}>
                      <Thead>
                        <Tr my='.8rem'>
                          <Th pl={0} width={'300px'}>
                            Link
                          </Th>
                          <Th pl={0}>Type</Th>
                          <Th pl={0}></Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {linksData.map((item, index) => (
                          <Tr key={index}>
                            <Td
                              pl={0}
                              fontSize={'xs'}
                              width={'300px'}
                              wordBreak={'break-all'}
                            >
                              {item.url}
                            </Td>
                            <Td pl={0} fontSize={'xs'}>
                              {item.name}
                            </Td>
                            <Td pl={0}>
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
                      No existing links
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

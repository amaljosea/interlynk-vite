import { useMutation } from '@apollo/client'
import { EditIcon, QuestionIcon } from '@chakra-ui/icons'
import {
  Button,
  Flex,
  HStack,
  Icon,
  Link,
  Stack,
  Tag,
  TagCloseButton,
  TagLabel,
  Td,
  Text,
  Tooltip,
  Tr
} from '@chakra-ui/react'
import { supplierDelete } from 'graphQL/Mutation'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { timeSince } from 'utils'
import { licenseOptions } from 'variables/licenses'

const GeneralDataRow = ({
  onOpen,
  data,
  setSelectedKey,
  status,
  licenseBtn,
  onSbomOpen,
  onSupOpen,
  refetch
}) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

  const customerView = location.pathname.startsWith('/customer')

  const { creationAt, updatedAt, tools, authors, licenses, suppliers } = data

  const [filteredLicense, setFilteredLicense] = useState([])

  const [deleteSupplier] = useMutation(supplierDelete)

  useEffect(() => {
    if (licenses !== null && licenses.length > 0) {
      // console.log(`license item`, licenses)
      const filtered = licenseOptions.filter((item) =>
        licenses.includes(item.licenseId)
      )
      // console.log(`filtered item`, filtered)
      setFilteredLicense(filtered)
    }
  }, [licenses])

  const handleSupRemove = async (id) => {
    try {
      await deleteSupplier({
        variables: {
          supplierId: suppliers[0].id,
          sbomId: sbomId
        }
      }).then((res) => {
        if (res) {
          refetch({
            productId: productId,
            sbomId: sbomId
          })
        }
      })
    } catch (error) {
      console.log(`Mutation error`, error)
    }
  }

  const handleClick = (ref) => {
    setSelectedKey(ref)
    onOpen()
  }

  return (
    <>
      <Tr>
        <Td pl={0} fontWeight={'medium'}>
          <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
            <Text>Creation Tool(s)</Text>
            <Tooltip label='Creator Tool(s) identify all the software tools and their versions used in building the SBOM. Interlynk is automatically added as one of the tools'>
              <Icon as={QuestionIcon} color={'blue.500'} />
            </Tooltip>
          </Flex>
        </Td>
        <Td pl={0}>
          <Flex flexDirection={'column'} alignItems={'flex-start'} gap={2.5}>
            {tools &&
              tools.map((item, index) => (
                <Text pl={0} fontSize={'sm'} key={index}>
                  {item.name} - {item.version}
                </Text>
              ))}
          </Flex>
        </Td>
        <Td pl={0}>
          {!customerView && (
            <Button
              size='sm'
              isDisabled={status === 'signed'}
              onClick={() => handleClick('tools')}
            >
              <Icon as={EditIcon} color={'blue.500'} cursor={'pointer'} />
            </Button>
          )}
        </Td>
      </Tr>
      <Tr>
        <Td pl={0} fontWeight={'medium'}>
          Created At
        </Td>
        <Td pl={0}>
          {new Date(creationAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            timeZone: 'America/Los_Angeles'
          })}{' '}
          {new Date(creationAt).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: 'America/Los_Angeles'
          })}
        </Td>
        <Td pl={0}></Td>
      </Tr>
      <Tr>
        <Td pl={0} fontWeight={'medium'}>
          Updated At
        </Td>
        <Td pl={0}>{timeSince(updatedAt)}</Td>
        <Td pl={0}></Td>
      </Tr>
      <Tr>
        <Td pl={0} fontWeight={'medium'}>
          <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
            <Text>Author(s)</Text>
            <Tooltip label='In case of non-automated SBOM generation, Author(s) identifies the name and email of persons invovlved in building the SBOM.'>
              <Icon as={QuestionIcon} color={'blue.500'} />
            </Tooltip>
          </Flex>
        </Td>
        <Td pl={0}>
          <Stack spacing={2} direction={'column'}>
            {authors &&
              authors.length > 0 &&
              authors.map((item, index) => (
                <Tag
                  size={'md'}
                  key={index}
                  variant='subtle'
                  colorScheme='blue'
                  width={'fit-content'}
                >
                  <TagLabel>
                    {item.name} - {item.email}
                  </TagLabel>
                </Tag>
              ))}
          </Stack>
        </Td>
        <Td pl={0}>
          {!customerView && (
            <Button
              size='sm'
              isDisabled={status === 'signed'}
              onClick={() => handleClick('author')}
            >
              <Icon as={EditIcon} color={'blue.500'} cursor={'pointer'} />
            </Button>
          )}
        </Td>
      </Tr>
      <Tr>
        <Td pl={0} fontWeight={'medium'}>
          <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
            <Text>Supplier(s)</Text>
            <Tooltip label='Supplier(s) identify the name and email of the organization that built, distributed or package the application. For Open-source components, it can refer to the name of the project or entity distributing the project.'>
              <Icon as={QuestionIcon} color={'blue.500'} />
            </Tooltip>
          </Flex>
        </Td>
        <Td pl={0}>
          <HStack spacing={4}>
            {suppliers &&
              suppliers.map((item, index) => (
                <Tag
                  size={'md'}
                  key={index}
                  variant='subtle'
                  colorScheme='orange'
                >
                  <TagLabel>
                    {item.name} - {item.email}
                  </TagLabel>
                  <TagCloseButton onClick={handleSupRemove} />
                </Tag>
              ))}
          </HStack>
        </Td>
        <Td pl={0}>
          {!customerView && (
            <Button
              size='sm'
              isDisabled={status === 'signed'}
              onClick={onSupOpen}
            >
              <Icon as={EditIcon} color={'blue.500'} cursor={'pointer'} />
            </Button>
          )}
        </Td>
      </Tr>
      <Tr>
        <Td pl={0} fontWeight={'medium'}>
          License
        </Td>
        <Td pl={0}>
          <Flex alignItems={'center'} gap={2} flexWrap={'wrap'}>
            {filteredLicense.length > 0 &&
              filteredLicense.map((item, index) => (
                <Tooltip key={index} label={item.name} placement={'top'}>
                  <Link href={item.reference} target='_blank'>
                    <Tag
                      size={'md'}
                      key={index}
                      variant='subtle'
                      colorScheme='green'
                      width={'fit-content'}
                    >
                      <TagLabel>{item.licenseId}</TagLabel>
                    </Tag>
                  </Link>
                </Tooltip>
              ))}
          </Flex>
        </Td>
        <Td pl={0}>
          {!customerView && (
            <Button
              size='sm'
              ref={licenseBtn}
              isDisabled={status === 'signed'}
              onClick={onSbomOpen}
            >
              <Icon as={EditIcon} color={'blue.500'} cursor={'pointer'} />
            </Button>
          )}
        </Td>
      </Tr>
    </>
  )
}

export default GeneralDataRow

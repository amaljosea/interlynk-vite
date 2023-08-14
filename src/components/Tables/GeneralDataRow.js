import {
  Button,
  Flex,
  Tag,
  TagLabel,
  Td,
  Text,
  Tr,
  chakra
} from '@chakra-ui/react'
import { useLocation } from 'react-router-dom'

const GeneralDataRow = ({ onOpen, data, setSelectedKey }) => {
  const location = useLocation()

  const customerView = location.pathname.startsWith('/sharelynk')

  const {
    createdAt,
    lastUpdatedAt,
    authors,
    orgs,
    emails,
    supplierName,
    product,
    license,
    cpe,
    purl,
    swid,
    md5,
    sha
  } = data

  const handleClick = (ref) => {
    setSelectedKey(ref)
    onOpen()
  }

  return (
    <>
      <Tr>
        <Td pl={0}>Create At</Td>
        <Td pl={0}>{createdAt}</Td>
        <Td pl={0}></Td>
      </Tr>
      <Tr>
        <Td pl={0}>Last Modified At</Td>
        <Td pl={0}>{lastUpdatedAt}</Td>
        <Td pl={0}></Td>
      </Tr>
      <Tr>
        <Td pl={0}>Author's</Td>
        <Td pl={0}>
          <Flex flexDir={'row'} alignItems={'self-start'} gap={2}>
            <Text>Name:</Text>
            <Tag borderRadius='full' colorScheme={'blue'}>
              <TagLabel>{authors}</TagLabel>
            </Tag>
          </Flex>
          <Flex mt={3} flexDir={'row'} alignItems={'self-start'} gap={2}>
            <Text>Organization:</Text>
            <Tag borderRadius='full' colorScheme={'blue'} variant='outline'>
              <TagLabel>{orgs}</TagLabel>
            </Tag>
          </Flex>
          <Flex mt={3} flexDir={'row'} alignItems={'center'} gap={2}>
            <Text>Email:</Text>
            <chakra.span
              display={'flex'}
              flex={'row'}
              alignItems={'center'}
              gap={2}
            >
              {emails.length > 0 &&
                emails.map((item) => (
                  <Tag key={item} borderRadius='full' colorScheme={'green'}>
                    <TagLabel>{item}</TagLabel>
                  </Tag>
                ))}
            </chakra.span>
          </Flex>
        </Td>
        <Td pl={0}>
          {!customerView && (
            <Button size='sm' onClick={() => handleClick('author')}>
              Update
            </Button>
          )}
        </Td>
      </Tr>
      <Tr>
        <Td pl={0}>Supplier's</Td>
        <Td pl={0}>
          <Flex mt={2} flexDir={'column'} alignItems={'self-start'} gap={4}>
            <Text>
              Name -{' '}
              <Tag borderRadius='full' colorScheme={'blue'}>
                <TagLabel>{supplierName}</TagLabel>
              </Tag>
            </Text>
            <Text>
              Product -{' '}
              <Tag borderRadius='full' colorScheme={'blue'} variant='outline'>
                <TagLabel>{product}</TagLabel>
              </Tag>
            </Text>
          </Flex>
        </Td>
        <Td pl={0}>
          {!customerView && (
            <Button
              size='sm'
              id='supplier'
              onClick={() => handleClick('supplier')}
            >
              Update
            </Button>
          )}
        </Td>
      </Tr>
      <Tr>
        <Td pl={0}>Product License</Td>
        <Td pl={0}>{license}</Td>
        <Td pl={0}>
          {!customerView && (
            <Button
              size='sm'
              id='license'
              onClick={() => handleClick('license')}
            >
              Update
            </Button>
          )}
        </Td>
      </Tr>
      <Tr>
        <Td pl={0}>Identifier's</Td>
        <Td pl={0}>
          <Flex mt={2} flexDir={'column'} alignItems={'self-start'} gap={2}>
            <Text>{cpe}</Text>
            <Text>{purl}</Text>
            <Text>{swid}</Text>
          </Flex>
        </Td>
        <Td pl={0}>
          {!customerView && (
            <Button
              size='sm'
              id='identifier'
              onClick={() => handleClick('identifier')}
            >
              Update
            </Button>
          )}
        </Td>
      </Tr>
      <Tr>
        <Td pl={0}>Hashe's</Td>
        <Td pl={0}>
          <Flex mt={2} flexDir={'column'} alignItems={'self-start'} gap={2}>
            <Text>MD5: {md5}</Text>
            <Text>SHA: {sha}</Text>
          </Flex>
        </Td>
        <Td pl={0}>
          {!customerView && (
            <Button size='sm' id='hashes' onClick={() => handleClick('hashes')}>
              Update
            </Button>
          )}
        </Td>
      </Tr>
      <Tr>
        <Td pl={0}>Copyright</Td>
        <Td pl={0}>Copyright Interlynk Inc 2023</Td>
      </Tr>
    </>
  )
}

export default GeneralDataRow

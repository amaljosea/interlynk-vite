import { EditIcon, QuestionIcon } from '@chakra-ui/icons'
import { Button, Flex, Icon, Td, Text, Tooltip, Tr } from '@chakra-ui/react'
import { useLocation } from 'react-router-dom'
import { timeSince } from 'utils'

const GeneralDataRow = ({ onOpen, data, setSelectedKey, status }) => {
  const location = useLocation()

  const customerView = location.pathname.startsWith('/customer')

  const {
    creationAt,
    updatedAt,
    cpes,
    purl,
    tools,
    authors,
    licenses,
    suppliers
  } = data

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
            <Tooltip label='Creation tools'>
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
            <Tooltip label='Authors'>
              <Icon as={QuestionIcon} color={'blue.500'} />
            </Tooltip>
          </Flex>
        </Td>
        <Td pl={0}>
          <Flex flexDirection={'column'} alignItems={'flex-start'} gap={3}>
            {authors &&
              authors.length > 0 &&
              authors.map((item, index) => (
                <Text pl={0} fontSize={'sm'} key={index}>
                  {item.name} - {item.email}
                </Text>
              ))}
          </Flex>
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
            <Tooltip label='Suppliers'>
              <Icon as={QuestionIcon} color={'blue.500'} />
            </Tooltip>
          </Flex>
        </Td>
        <Td pl={0}>
          <Flex flexDirection={'column'} alignItems={'flex-start'} gap={4}>
            {suppliers &&
              suppliers.map((item, index) => (
                <Text pl={0} fontSize={'sm'} key={index}>
                  {item.name} - {item.email}
                </Text>
              ))}
          </Flex>
        </Td>
        <Td pl={0}>
          {!customerView && (
            <Button
              size='sm'
              isDisabled={status === 'signed'}
              onClick={() => handleClick('supplier')}
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
          <Flex flexDirection={'column'} alignItems={'flex-start'} gap={4}>
            {licenses.length > 0 ? licenses.join(', ') : ''}
          </Flex>
        </Td>
        <Td pl={0}></Td>
      </Tr>
      <Tr>
        <Td pl={0} fontWeight={'medium'}>
          Identifier(s)
        </Td>
        <Td pl={0}>
          <Flex mt={2} flexDir={'column'} alignItems={'self-start'} gap={2}>
            <Flex flexDirection={'row'} alignItems={'center'} gap={4}>
              {cpes.length > 0 ? cpes.join(', ') : ''}
            </Flex>
            <Text>{purl}</Text>
          </Flex>
        </Td>
        <Td pl={0}></Td>
      </Tr>
      {/* <Tr>
        <Td pl={0} fontWeight={'medium'}>
          Hash(es)
        </Td>
        <Td pl={0}>
          <Flex mt={2} flexDir={'column'} alignItems={'self-start'} gap={2}>
            <Text>MD5: ABCDEFGHI</Text>
            <Text>SHA: 23434354443</Text>
          </Flex>
        </Td>
        <Td pl={0}></Td>
      </Tr>
      <Tr>
        <Td pl={0} fontWeight={'medium'}>
          Copyright Text
        </Td>
        <Td pl={0}>Copyright Interlynk Inc 2023</Td>
      </Tr> */}
    </>
  )
}

export default GeneralDataRow

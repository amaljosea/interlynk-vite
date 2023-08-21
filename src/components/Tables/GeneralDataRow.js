import { EditIcon } from '@chakra-ui/icons'
import { Flex, Icon, Td, Text, Tr } from '@chakra-ui/react'
import { useLocation } from 'react-router-dom'

const GeneralDataRow = ({
  onOpen,
  data,
  setSelectedKey,
  tools,
  authors,
  suppliers,
  license
}) => {
  const location = useLocation()

  const customerView = location.pathname.startsWith('/sharelynk')

  const { createdAt, lastUpdatedAt, cpe, purl, swid, md5, sha } = data

  const handleClick = (ref) => {
    setSelectedKey(ref)
    onOpen()
  }

  return (
    <>
      <Tr>
        <Td pl={0} fontWeight={'medium'}>
          Creation Tools
        </Td>
        <Td pl={0}>
          <Flex flexDirection={'column'} alignItems={'flex-start'} gap={4}>
            {tools.map((item, index) => (
              <Text pl={0} fontSize={'sm'} key={index}>
                {item.name}-{item.version} {`(Interlynk Inc)`}
              </Text>
            ))}
          </Flex>
        </Td>
        <Td pl={0}>
          {!customerView && (
            <Icon
              as={EditIcon}
              color={'blue.500'}
              cursor={'pointer'}
              onClick={() => handleClick('tools')}
            />
          )}
        </Td>
      </Tr>
      <Tr>
        <Td pl={0} fontWeight={'medium'}>
          Create At
        </Td>
        <Td pl={0}>{createdAt}</Td>
        <Td pl={0}></Td>
      </Tr>
      <Tr>
        <Td pl={0} fontWeight={'medium'}>
          Last Modified At
        </Td>
        <Td pl={0}>{lastUpdatedAt}</Td>
        <Td pl={0}></Td>
      </Tr>
      <Tr>
        <Td pl={0} fontWeight={'medium'}>
          Author's
        </Td>
        <Td pl={0}>
          <Flex flexDirection={'column'} alignItems={'flex-start'} gap={4}>
            {authors.map((item, index) => (
              <Flex key={index} flexDir={'row'} alignItems={'center'} gap={4}>
                <Text pl={0} fontSize={'sm'}>
                  {item.name ? item.name : ''}
                </Text>
                <Text pl={0} fontSize={'sm'}>
                  {item.email ? item.email : ''}
                </Text>
                <Text pl={0} fontSize={'sm'}>
                  {item.organization ? `(${item.organization})` : ''}
                </Text>
              </Flex>
            ))}
          </Flex>
        </Td>
        <Td pl={0}>
          {!customerView && (
            <Icon
              as={EditIcon}
              color={'blue.500'}
              cursor={'pointer'}
              onClick={() => handleClick('author')}
            />
          )}
        </Td>
      </Tr>
      <Tr>
        <Td pl={0} fontWeight={'medium'}>
          Supplier's
        </Td>
        <Td pl={0}>
          <Flex flexDirection={'column'} alignItems={'flex-start'} gap={4}>
            {suppliers.map((item, index) => (
              <Flex key={index} flexDir={'row'} alignItems={'center'} gap={4}>
                <Text pl={0} fontSize={'sm'}>
                  {item.name ? item.name : ''}
                </Text>
                <Text pl={0} fontSize={'sm'}>
                  {item.email ? item.email : ''}
                </Text>
                <Text pl={0} fontSize={'sm'}>
                  {item.organization ? `(${item.organization})` : ''}
                </Text>
              </Flex>
            ))}
          </Flex>
        </Td>
        <Td pl={0}>
          {!customerView && (
            <Icon
              as={EditIcon}
              color={'blue.500'}
              cursor={'pointer'}
              onClick={() => handleClick('supplier')}
            />
          )}
        </Td>
      </Tr>
      <Tr>
        <Td pl={0} fontWeight={'medium'}>
          Product License
        </Td>
        <Td pl={0}>
          <Flex flexDirection={'column'} alignItems={'flex-start'} gap={4}>
            {license?.map((item, index) => (
              <Text pl={0} fontSize={'sm'} key={index}>
                {item.name}
              </Text>
            ))}
          </Flex>
        </Td>
        <Td pl={0}>
          {!customerView && (
            <Icon
              as={EditIcon}
              color={'blue.500'}
              cursor={'pointer'}
              onClick={() => handleClick('license')}
            />
          )}
        </Td>
      </Tr>
      <Tr>
        <Td pl={0} fontWeight={'medium'}>
          Identifier's
        </Td>
        <Td pl={0}>
          <Flex mt={2} flexDir={'column'} alignItems={'self-start'} gap={2}>
            <Text>{cpe}</Text>
            <Text>{purl}</Text>
            <Text>{swid}</Text>
          </Flex>
        </Td>
        <Td pl={0}>
          {!customerView && (
            <Icon
              as={EditIcon}
              color={'blue.500'}
              cursor={'pointer'}
              onClick={() => handleClick('identifier')}
            />
          )}
        </Td>
      </Tr>
      <Tr>
        <Td pl={0} fontWeight={'medium'}>
          Hashe's
        </Td>
        <Td pl={0}>
          <Flex mt={2} flexDir={'column'} alignItems={'self-start'} gap={2}>
            <Text>MD5: {md5}</Text>
            <Text>SHA: {sha}</Text>
          </Flex>
        </Td>
        <Td pl={0}></Td>
      </Tr>
      <Tr>
        <Td pl={0} fontWeight={'medium'}>
          Copyright
        </Td>
        <Td pl={0}>Copyright Interlynk Inc 2023</Td>
      </Tr>
    </>
  )
}

export default GeneralDataRow

import {
  Tag,
  Flex,
  Td,
  Text,
  Tr,
  useColorModeValue,
  Icon,
  Stack,
  useDisclosure
} from '@chakra-ui/react'
import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import ComponentDrawer from 'components/Drawer/ComponentDrawer'
import ComponentModal from 'views/Sbom/components/ComponentModal'

function SBOMComponentRow(props) {
  const {
    logo,
    component,
    version,
    dependsOn,
    license,
    updated,
    redacted
  } = props
  const location = useLocation()

  const customerView = location.pathname.startsWith('/sharelynk')

  const compBtn = useRef(null)

  const textColor = useColorModeValue('gray.700', 'white')
  const bgStatus = useColorModeValue('gray.400', '#1a202c')
  const colorStatus = useColorModeValue('white', 'gray.400')

  const [contains, setcontains] = useState({})

  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isDelOpen,
    onOpen: onDelOpen,
    onClose: onDelClose
  } = useDisclosure()

  useEffect(() => {
    const containsData = window.localStorage.getItem('contains')
    setcontains(JSON.parse(containsData))
  }, [])

  return (
    <Tr>
      <Td minWidth={{ sm: '250px' }} pl='0px'>
        <Flex align='center' py='.8rem' minWidth='100%' flexWrap='nowrap'>
          <Flex direction='row'>
            <Icon as={logo} h={'24px'} w={'24px'} me='18px' />
            <Flex direction='column' gap='5px'>
              <Text fontSize='sm' color={textColor} minWidth='100%'>
                {contains && contains.redactions && redacted
                  ? 'Redacted-DC...gM='
                  : component}
              </Text>
              {redacted ? (
                <Tag
                  colorScheme='red'
                  size='sm'
                  variant='outline'
                  width={'fit-content'}
                >
                  REDACTED
                </Tag>
              ) : null}
            </Flex>
          </Flex>
        </Flex>
      </Td>
      <Td>
        <Flex direction='column'>
          <Text fontSize='sm' color={textColor}>
            {version}
          </Text>
        </Flex>
      </Td>
      <Td>{dependsOn}</Td>
      <Td>{license}</Td>
      <Td>{updated}</Td>
      <Td>
        {!customerView && (
          <Stack direction={'row'} spacing='24px'>
            <Icon
              as={EditIcon}
              color={'blue.500'}
              cursor={'pointer'}
              onClick={onOpen}
            />
            <Icon
              as={DeleteIcon}
              color={'red.500'}
              cursor={'pointer'}
              onClick={onDelOpen}
            />
          </Stack>
        )}
        <ComponentDrawer
          isOpen={isOpen}
          onClose={onClose}
          btnRef={compBtn}
          component={component}
          version={version}
          license={license}
        />
        <ComponentModal isOpen={isDelOpen} onClose={onDelClose} />
      </Td>
    </Tr>
  )
}

export default SBOMComponentRow

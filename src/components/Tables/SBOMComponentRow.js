import {
  Tag,
  Flex,
  Td,
  Text,
  Tr,
  useColorModeValue,
  Icon,
  Stack,
  useDisclosure,
  Box
} from '@chakra-ui/react'
import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import ComponentDrawer from 'components/Drawer/ComponentDrawer'
import ComponentModal from 'views/Sbom/components/ComponentModal'
import { timeSince } from 'utils'

function SBOMComponentRow(props) {
  const {
    id,
    component,
    version,
    purl,
    licenses,
    updatedAt,
    cpes,
    type,
    refetch
  } = props
  const location = useLocation()

  const customerView = location.pathname.startsWith('/sharelynk')

  const compBtn = useRef(null)

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
      <Td width={'350px'} pl='0px'>
        <Box py='.8rem'>{component}</Box>
      </Td>
      <Td width={'300px'}>
        <Box>{version}</Box>
      </Td>
      <Td width={'250px'}>{purl}</Td>
      <Td>
        {cpes.length > 0 &&
          cpes.map((item, i) => (
            <Flex gap={2} alignItems={'center'} key={i}>
              <Text>{item}</Text>
            </Flex>
          ))}
      </Td>
      <Td>
        {licenses.length > 0 &&
          licenses.map((item, i) => (
            <Flex gap={2} alignItems={'center'} key={i}>
              <Text>{item}</Text>
            </Flex>
          ))}
      </Td>
      <Td>
        <Box>{timeSince(updatedAt)}</Box>
      </Td>
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

        {isOpen && (
          <ComponentDrawer
            id={id}
            isOpen={isOpen}
            onClose={onClose}
            btnRef={compBtn}
            component={component}
            version={version}
            license={licenses}
            type={type}
            refetch={refetch}
            cpes={cpes}
            purl={purl}
          />
        )}

        {isDelOpen && (
          <ComponentModal
            isOpen={isDelOpen}
            onClose={onDelClose}
            id={id}
            refetch={refetch}
          />
        )}
      </Td>
    </Tr>
  )
}

export default SBOMComponentRow

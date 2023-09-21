import {
  Flex,
  Td,
  Text,
  Tr,
  useDisclosure,
  Box,
  IconButton,
  Menu,
  MenuButton,
  Portal,
  MenuList,
  MenuItem,
  Stack,
  Tag,
  TagLabel,
  Image
} from '@chakra-ui/react'
import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import ComponentDrawer from 'components/Drawer/ComponentDrawer'
import ComponentModal from 'views/Sbom/components/ComponentModal'
import { timeSince } from 'utils'
import { FaEllipsisV } from 'react-icons/fa'
import SupplierModal from 'views/Sbom/components/SupplierModal'
import { ViewIcon } from '@chakra-ui/icons'
import { getConImg } from 'utils'

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
    primary,
    internal,
    suppliers,
    refetch,
    lifecycle,
    status
  } = props
  const location = useLocation()

  const customerView = location.pathname.startsWith('/customer')

  const compBtn = useRef(null)

  const [contains, setcontains] = useState({})

  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isDelOpen,
    onOpen: onDelOpen,
    onClose: onDelClose
  } = useDisclosure()

  const {
    isOpen: isSupOpen,
    onOpen: onSupOpen,
    onClose: onSupClose
  } = useDisclosure()

  useEffect(() => {
    const containsData = window.localStorage.getItem('contains')
    setcontains(JSON.parse(containsData))
  }, [])

  return (
    <Tr>
      <Td pl='0px'>
        <Stack py='.8rem' direction={'row'} alignItems={'flex-start'} gap={1}>
          {purl !== null && purl !== '' && (
            <Image
              width={'8'}
              height={'8'}
              src={getConImg(purl.split('/')[0])}
              alt={purl.split('/')[0]}
            />
          )}
          <Stack direction={'column'} gap={0.5}>
            <Text wordBreak={'break-all'}>{component}</Text>
            {primary && (
              <Tag
                width={'fit-content'}
                size={'sm'}
                variant='subtle'
                colorScheme='blue'
              >
                <TagLabel textTransform={'capitalize'}>Primary</TagLabel>
              </Tag>
            )}

            {internal && (
              <Tag
                width={'fit-content'}
                size={'sm'}
                variant='outline'
                colorScheme='blue'
              >
                <TagLabel textTransform={'capitalize'}>Internal</TagLabel>
              </Tag>
            )}
          </Stack>
        </Stack>
      </Td>
      <Td>
        <Box>{version}</Box>
      </Td>
      <Td>{purl}</Td>
      <Td>
        {suppliers.length > 0 && `${suppliers[0].name} - ${suppliers[0].email}`}
      </Td>
      <Td>{licenses.join(', ')}</Td>
      <Td>
        <Box>{timeSince(updatedAt)}</Box>
      </Td>
      <Td>
        {!customerView ? (
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label='Options'
              icon={<FaEllipsisV />}
              variant='none'
              color='gray.400'
            />
            <Portal>
              <MenuList size='sm'>
                <MenuItem onClick={onSupOpen} isDisabled={status === 'signed'}>
                  {suppliers.length > 0 ? 'Update' : 'Add'} Supplier
                </MenuItem>
                <MenuItem onClick={onOpen} isDisabled={status === 'signed'}>
                  Edit
                </MenuItem>
                {primary === false && (
                  <MenuItem
                    onClick={onDelOpen}
                    isDisabled={status === 'signed'}
                  >
                    Delete
                  </MenuItem>
                )}
              </MenuList>
            </Portal>
          </Menu>
        ) : (
          <IconButton size='sm' icon={<ViewIcon />} onClick={onOpen} />
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
            primary={primary}
            internal={internal}
            suppliers={suppliers}
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

        {isSupOpen && (
          <SupplierModal
            id={id}
            refetch={refetch}
            isOpen={isSupOpen}
            onClose={onSupClose}
            suppliers={suppliers}
          />
        )}
      </Td>
    </Tr>
  )
}

export default SBOMComponentRow

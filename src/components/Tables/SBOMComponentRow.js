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
  Link,
  Tooltip,
  Badge
} from '@chakra-ui/react'
import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import ComponentDrawer from 'components/Drawer/ComponentDrawer'
import ComponentModal from 'views/Sbom/components/ComponentModal'
import { timeSince } from 'utils'
import {
  FaDiceD6,
  FaEllipsisV,
  FaGlobe,
  FaHouseUser,
  FaLightbulb,
  FaSitemap
} from 'react-icons/fa'
import SupplierModal from 'views/Sbom/components/SupplierModal'
import { ViewIcon } from '@chakra-ui/icons'
import { BsFillPatchQuestionFill, BsPatchQuestion } from 'react-icons/bs'
import { CgWebsite } from 'react-icons/cg'
import { GetIcon } from 'utils'
import { licenseOptions } from 'variables/licenses'

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
    status,
    group
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

  const [filteredLicense, setFilteredLicense] = useState([])

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

  return (
    <Tr>
      <Td pl='0px' width={'350px'}>
        <Stack
          width={'100%'}
          px={0}
          py='.8rem'
          direction={'row'}
          alignItems={'flex-center'}
        >
          <Box width={'50px'}>
            {purl !== null && purl !== '' ? (
              <IconButton
                isRound={true}
                variant='solid'
                colorScheme='gray'
                icon={GetIcon(purl.split('/')[0])}
              />
            ) : (
              <IconButton
                isRound={true}
                variant='solid'
                colorScheme='gray'
                icon={<BsFillPatchQuestionFill color='#4299E1' fontSize={24} />}
              />
            )}
          </Box>
          <Box
            display={'flex'}
            flexWrap={'wrap'}
            flexDirection={'column'}
            gap={2}
            width={'250px'}
            wordBreak={'break-all'}
          >
            {/* COMPONENT NAME */}
            <Text fontSize={'14px'}>{component}</Text>

            {/* EXTERNAL REFERENCE */}
            <Stack direction={'row'} alignItems={'center'}>
              {/* WEBSITE */}
              <Tooltip placement='top' label='github.com/mypackage'>
                <IconButton
                  type='button'
                  size='xs'
                  variant='solid'
                  colorScheme='gray'
                  icon={<FaGlobe fontSize={16} />}
                />
              </Tooltip>
              {/* DISTRIBUTION */}
              <Tooltip placement='top' label='github.com/distribution'>
                <IconButton
                  type='button'
                  size='xs'
                  variant='solid'
                  colorScheme='gray'
                  icon={<FaSitemap fontSize={16} />}
                />
              </Tooltip>
              {/* ADVISORIES */}
              <Tooltip placement='top' label='ghcr.io/advisory'>
                <IconButton
                  type='button'
                  size='xs'
                  variant='solid'
                  colorScheme='gray'
                  icon={<FaHouseUser fontSize={16} />}
                />
              </Tooltip>
              {/* SUPPORT */}
              <Tooltip placement='top' label='github.com/support-url'>
                <IconButton
                  type='button'
                  size='xs'
                  variant='solid'
                  colorScheme='gray'
                  icon={<FaLightbulb fontSize={16} />}
                />
              </Tooltip>
            </Stack>

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

            {/* COMPONENT TYPE */}
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
          </Box>
        </Stack>
      </Td>
      <Td width={'150px'}>{version}</Td>
      <Td width={'300px'}>
        {purl !== null && purl !== '' ? (
          <Tooltip placement='top' label={purl}>{`${purl.substring(
            0,
            25
          )}...`}</Tooltip>
        ) : (
          ''
        )}
      </Td>
      <Td width={'250px'}>
        {suppliers.length > 0 && `${suppliers[0].name} - ${suppliers[0].email}`}
      </Td>
      <Td>
        <Flex alignItems={'center'} gap={2} flexWrap={'wrap'}>
          {filteredLicense.length > 0 &&
            filteredLicense.map((item, index) => (
              <Tooltip key={index} label={item.name} placement={'top'}>
                <Link href={item.reference} target='_blank' isExternal>
                  <Badge variant='subtle' colorScheme='green'>
                    {item.licenseId}
                  </Badge>
                </Link>
              </Tooltip>
            ))}
        </Flex>
      </Td>
      <Td width={'300px'}>
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
            shortDesc={null}
            group={group}
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
            shortDesc={null}
          />
        )}
      </Td>
    </Tr>
  )
}

export default SBOMComponentRow

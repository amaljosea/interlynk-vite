// Chakra imports
import { ViewIcon } from '@chakra-ui/icons'
import {
  Flex,
  Text,
  Stack,
  Box,
  IconButton,
  Tooltip,
  MenuButton,
  Menu,
  Portal,
  MenuList,
  MenuItem,
  useDisclosure,
  Tag,
  TagLabel,
  Badge,
  Grid,
  GridItem
} from '@chakra-ui/react'
import DataTable from 'react-data-table-component'
import { BsFillPatchQuestionFill } from 'react-icons/bs'
import {
  FaEllipsisV,
  FaGlobe,
  FaHouseUser,
  FaLightbulb,
  FaSitemap
} from 'react-icons/fa'
import { licenseOptions } from 'variables/licenses'
import { timeSince, GetIcon } from 'utils'
import { useState, useEffect, useRef } from 'react'
import { useLocation, Link } from 'react-router-dom'
import ComponentDrawer from 'components/Drawer/ComponentDrawer'
import ComponentModal from 'views/Sbom/components/ComponentModal'
import SupplierModal from 'views/Sbom/components/SupplierModal'
import LinksDrawer from 'components/Drawer/LinksDrawer'
import styled from '@emotion/styled'

const ExpandedComponent = ({ data }) => {
  const { suppliers, purl, description, cpes } = data

  const CustomText = styled(Text)`
    font-size: 13px;
    font-weight: bold;
    color: #718096;
    text-transform: uppercase;
    letter-spacing: 0.6px;
  `

  return (
    <Box
      width={'100%'}
      p={5}
      boxShadow='inset 0px -5px 5px rgba(0, 0, 0, 0.08), inset 0px 5px 5px rgba(0, 0, 0, 0.08)'
    >
      <Grid
        templateColumns='repeat(2, 1fr)'
        gap={6}
        width={'80%'}
        margin={'0 auto'}
      >
        <GridItem w='100%'>
          <CustomText>Description :</CustomText>
          <Text mt={1} fontSize={14}>
            {description !== null ? description : ''}
          </Text>
        </GridItem>
        <GridItem w='100%'>
          <CustomText>Supplier :</CustomText>
          <Text mt={1} fontSize={14}>
            {suppliers.length > 0 &&
              `${suppliers[0].name} - ${suppliers[0].email}`}
          </Text>
        </GridItem>
        <GridItem w='100%'>
          <CustomText>PURL :</CustomText>
          <Text mt={1} fontSize={14}>
            {purl !== null && purl !== '' ? purl : ''}
          </Text>
        </GridItem>
        <GridItem w='100%'>
          <CustomText>CPES :</CustomText>
          <Flex
            mt={1}
            flexDirection={'column'}
            alignItems={'flex-start'}
            gap={1}
            flexWrap={'wrap'}
          >
            {cpes.length > 0 &&
              cpes.map((item, index) => (
                <Text key={index} fontSize={14}>
                  {item}
                </Text>
              ))}
          </Flex>
        </GridItem>
      </Grid>
    </Box>
  )
}

const customStyles = {
  headCells: {
    style: {
      fontWeight: 'bold',
      color: '#2D3748',
      fontSize: '12px',
      letterSpacing: '1px'
    }
  }
}

const ComponentTable = ({ data, refetch, type }) => {
  const location = useLocation()
  const customerView = location.pathname.startsWith('/customer')

  const [activeRow, setActiveRow] = useState(null)

  const compBtn = useRef(null)
  const linkRef = useRef(null)

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

  const {
    isOpen: isLinkOpen,
    onOpen: onLinkOpen,
    onClose: onLinkClose
  } = useDisclosure()

  const columns = [
    {
      id: 'component',
      name: 'COMPONENT',
      selector: (row) => {
        const { purl, name, primary, internal } = row
        return (
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
                  icon={
                    <BsFillPatchQuestionFill color='#4299E1' fontSize={24} />
                  }
                />
              )}
            </Box>
            <Box
              display={'flex'}
              flexWrap={'wrap'}
              flexDirection={'column'}
              gap={2}
            >
              {/* COMPONENT NAME */}
              <Tooltip placement='top' label={name}>
              <Text fontSize={'14px'}>
                {name.length > 30 ? `${name.substring(0, 30)}...` : name}
              </Text>
              </Tooltip>

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

              {/* COMPONENT TYPE */}

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
            </Box>
          </Stack>
        )
      },
      width: '400px'
    },
    {
      id: 'version',
      name: 'VERSION',
      selector: (row) => row.version,
      width: '200px'
    },
    {
      id: 'purl',
      name: 'PURL',
      selector: (row) => {
        const { purl } = row
        return (
          <>
            {purl !== null && purl !== '' ? (
              <Tooltip placement='top' label={purl}>{`${purl.substring(
                0,
                25
              )}...`}</Tooltip>
            ) : (
              ''
            )}
          </>
        )
      }
    },
    {
      id: 'licenses',
      name: 'LICENSES',
      selector: (row) => {
        const { licenses } = row
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
          <Flex alignItems={'center'} gap={2} flexWrap={'wrap'}>
            {filteredLicense.length > 0 &&
              filteredLicense.map((item, index) => (
                <Tooltip key={index} label={item.name} placement={'top'}>
                  <Link href={item.reference} target='_blank' isexternal>
                    <Badge variant='subtle' colorScheme='green'>
                      {item.licenseId}
                    </Badge>
                  </Link>
                </Tooltip>
              ))}
          </Flex>
        )
      }
    },
    {
      id: 'updatedAt',
      name: 'UPDATED AT',
      selector: (row) => timeSince(row.updatedAt)
    },
    {
      id: 'action',
      name: 'ACTION',
      selector: (row) => {
        const { suppliers, status, primary } = row

        return (
          <>
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
                    <MenuItem
                      onClick={() => {
                        setActiveRow(row)
                        onSupOpen()
                      }}
                      isDisabled={status === 'signed'}
                    >
                      {suppliers.length > 0 ? 'Update' : 'Add'} Supplier
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setActiveRow(row)
                        onOpen()
                      }}
                      isDisabled={status === 'signed'}
                    >
                      Edit Component
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setActiveRow(row)
                        onLinkOpen()
                      }}
                      isDisabled={status === 'signed'}
                    >
                      Edit Links
                    </MenuItem>
                    {primary === false && (
                      <MenuItem
                        onClick={() => {
                          setActiveRow(row)
                          onDelOpen()
                        }}
                        isDisabled={status === 'signed'}
                      >
                        Delete
                      </MenuItem>
                    )}
                  </MenuList>
                </Portal>
              </Menu>
            ) : (
              <IconButton
                size='sm'
                icon={<ViewIcon />}
                onClick={() => {
                  setActiveRow(row)
                  onOpen()
                }}
              />
            )}
          </>
        )
      }
    }
  ]

  return (
    <>
      {data.length > 0 ? (
        <Flex flexDir={'column'} width={'100%'}>
          <DataTable
            columns={columns}
            data={data}
            customStyles={customStyles}
            progressPending={data.length === 0}
            expandableRows
            expandableRowsComponent={ExpandedComponent}
            responsive={true}
          />
        </Flex>
      ) : (
        <Flex
          width={'100%'}
          mt={4}
          alignItems={'center'}
          justifyContent={'center'}
        >
          <Text>No component data found</Text>
        </Flex>
      )}

      {/* ACTIONS */}
      {activeRow !== null && (
        <>
          {isOpen && (
            <ComponentDrawer
              id={activeRow.id}
              isOpen={isOpen}
              onClose={onClose}
              btnRef={compBtn}
              component={activeRow.name}
              version={activeRow.version}
              license={activeRow.licenses}
              type={type}
              refetch={refetch}
              cpes={activeRow.cpes}
              purl={activeRow.purl}
              primary={activeRow.primary}
              internal={activeRow.internal}
              suppliers={activeRow.suppliers}
              shortDesc={null}
              group={activeRow.group}
            />
          )}

          {isDelOpen && (
            <ComponentModal
              isOpen={isDelOpen}
              onClose={onDelClose}
              id={activeRow.id}
              refetch={refetch}
            />
          )}

          {isSupOpen && (
            <SupplierModal
              id={activeRow.id}
              refetch={refetch}
              isOpen={isSupOpen}
              onClose={onSupClose}
              suppliers={activeRow.suppliers}
              shortDesc={null}
            />
          )}

          {isLinkOpen && (
            <LinksDrawer
              component={activeRow.name}
              btnRef={linkRef}
              isOpen={isLinkOpen}
              onClose={onLinkClose}
            />
          )}
        </>
      )}
    </>
  )
}

export default ComponentTable

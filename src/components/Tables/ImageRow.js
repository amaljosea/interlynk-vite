import React, { useState, useEffect } from 'react'
import {
  Flex,
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Skeleton,
  Switch,
  Td,
  Text,
  Tooltip,
  Tr
} from '@chakra-ui/react'
import { AddIcon, DeleteIcon } from '@chakra-ui/icons'
import { Link } from 'react-router-dom'
import { getConImg, scanImage } from 'utils'
import { FaCircleNotch, FaEllipsisV } from 'react-icons/fa'
import { useMutation } from '@apollo/client'
import { ImageUpdate } from 'graphQL/Mutation'
import { useContext } from 'react'
import GlobalContext from 'context/GlobalContext'
import semver from 'semver';

const ImageRow = ({
  item,
  isLoading,
  setSelectedImage,
  setActiveScanners,
  onScanOpen,
  onDeleteOpen,
  filteredScanners
}) => {
  const { setScanEnabled } = useContext(GlobalContext)

  const sortImages = [...item.imageScanners].sort((a, b) =>
    a.company.localeCompare(b.company)
  )

  const [checked, setChecked] = useState(item.scanEnabled ? true : false)
  const [isRefreshed, setIsRefreshed] = useState(false)
  // console.log('filteredScanners', filteredScanners)

  const handleChange = (e) => {
    setChecked(!checked)
    updateImage(e.target.checked)
  }

  const [imageUpdate, { data }] = useMutation(ImageUpdate)

  const updateImage = async (e) => {
    try {
      setIsRefreshed(true)
      await imageUpdate({
        variables: {
          id: item.id,
          scanRefresh: true,
          scanEnabled: e ? true : false
        }
      })
    } catch (error) {
      console.error('Mutation error:', error)
    }
  }

  useEffect(() => {
    if (data?.imageUpdate?.image?.id === item.id) {
      setTimeout(() => {
        setIsRefreshed(false)
      }, 2000)
    }
  }, [data])

  const getMostRecentVersion = () => {
    const sortedVersions = item.imageVersions.slice().sort((a, b) => {
      // If either a or b is 'latest', handle the special case.
      if (a.name === 'latest') {
        return -1;
      } else if (b.name === 'latest') {
        return 1;
      }
      return semver.compare(semver.coerce(b.name), semver.coerce(a.name));
    });

    return sortedVersions.length > 0 ? sortedVersions[0] : null;
  };
  const mostRecentVersion = getMostRecentVersion();

  return (
    <Tr key={item.id}>
      <Td pl={1} width={'160px'}>
        {isLoading || isRefreshed ? (
          <Skeleton height='20px' />
        ) : (
          <Switch id='status' isChecked={checked} onChange={handleChange} />
        )}
      </Td>
      <Td fontSize={'sm'} pl={1}>
      {isLoading || isRefreshed ? (
          <Skeleton height='20px' />
        ) : (
          item.imageVersions.length === 0 ? (
            <Text>
              {item.name}
            </Text>
          ) : (
            <Link
              to={`/vendor/images?v=${mostRecentVersion.id}&id=${item.id}`}
              style={{
                color: '#3182CE',
                textDecoration: 'underline'
              }}
              onClick={() => setScanEnabled(item.scanEnabled ? true : false)}
            >
              {item.name}
            </Link>
          )
        )}
      </Td>
      <Td fontSize={'sm'} pl={1}>
        {isLoading || isRefreshed ? (
          <Skeleton height='20px' />
        ) : (
          <Flex
            direction={'row'}
            alignItems={'center'}
            justifyContent={'start'}
            gap={2}
          >
            <Image
              width='6'
              height='6'
              src={getConImg(item.organizationConnector.connector.name)}
              alt={`${item.organizationConnector.connector.name}`}
            />
            <Text size='sm'>{item.organizationConnector.name}</Text>
          </Flex>
        )}
      </Td>
      <Td fontSize={'sm'} pl={1}>
        {isLoading || isRefreshed ? (
          <Skeleton height='20px' />
        ) : (
          <Text>{item.imageVersions.length}</Text>
        )}
      </Td>
      <Td fontSize={'sm'} pl={1}>
        {isLoading || isRefreshed ? (
          <Skeleton height='20px' />
        ) : (
          <Text>
            {new Date(item.lastPushedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              timeZone: 'America/Los_Angeles'
            })}{' '}
            {new Date(item.lastPushedAt).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
              timeZone: 'America/Los_Angeles'
            })}
          </Text>
        )}
      </Td>
      <Td pl={1}>
        {isLoading || isRefreshed ? (
          <Skeleton height='20px' />
        ) : (
          <Flex direction={'row'} gap={3} alignItems={'center'}>
            {sortImages &&
              sortImages.map((result, index) => (
                <Tooltip
                  key={index}
                  label={`${result.company} - ${result.name}`}
                  placement='top'
                >
                  <Image
                    width={6}
                    objectFit={'contain'}
                    src={`${scanImage(result.name)}`}
                    alt={result}
                  />
                </Tooltip>
              ))}
          </Flex>
        )}
      </Td>
      <Td pl={1}>
        {isLoading ? (
          <Skeleton height='20px' />
        ) : (
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label='Options'
              icon={<FaEllipsisV />}
              variant='none'
              color='gray.400'
              onClick={() => {
                setSelectedImage(item.id)
                setActiveScanners(item.imageScanners)
              }}
            />
            <Portal>
              <MenuList style={{ width: '100px' }}>
                <MenuItem icon={<FaCircleNotch />} onClick={updateImage}>
                  <Text fontSize={'sm'}>Refresh</Text>
                </MenuItem>
                <MenuItem
                  icon={<AddIcon />}
                  onClick={onScanOpen}
                  isDisabled={
                    filteredScanners && filteredScanners.length === 0
                      ? true
                      : false
                  }
                >
                  <Text fontSize={'sm'}>Add Scanner</Text>
                </MenuItem>
                <MenuItem
                  icon={<DeleteIcon />}
                  onClick={onDeleteOpen}
                  isDisabled={
                    filteredScanners && filteredScanners.length === 3
                      ? true
                      : false
                  }
                >
                  <Text fontSize={'sm'}>Delete Scanner</Text>
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        )}
      </Td>
    </Tr>
  )
}

export default ImageRow

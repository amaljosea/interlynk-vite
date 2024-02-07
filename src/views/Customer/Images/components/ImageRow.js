import { useEffect } from 'react'
import {
  Flex,
  Image,
  Skeleton,
  Switch,
  Td,
  Text,
  Tooltip,
  Tr
} from '@chakra-ui/react'
import { getConImg, scanImage } from 'utils'
import { useMutation } from '@apollo/client'
import { ImageUpdate } from 'graphQL/Mutation'
import semver from 'semver'
import { Link } from 'react-router-dom'
import Cookies from 'js-cookie'
import { useGlobalState } from 'hooks/useGlobalState'

const ImageRow = ({ item, refetch }) => {
  const signedParams = Cookies.get(`signedParamId`)

  const { setScanEnabled } = useGlobalState()

  const sortImages = [...item.imageScanners].sort((a, b) =>
    a.company.localeCompare(b.company)
  )

  useEffect(() => {
    setScanEnabled(item.scanEnabled)
  }, [item.scanEnabled])

  const [imageUpdate, { loading }] = useMutation(ImageUpdate)

  const enableImage = async (e) => {
    try {
      await imageUpdate({
        variables: {
          id: item.id,
          scanEnabled: e
        }
      }).then(() =>
        refetch({
          signedParams: signedParams
        })
      )
    } catch (error) {
      console.error('Mutation error:', error)
    }
  }

  const handleChange = (e) => {
    enableImage(e.target.checked)
  }

  const handleRefresh = async () => {
    try {
      await imageUpdate({
        variables: {
          id: item.id,
          scanRefresh: true
        }
      }).then(() =>
        refetch({
          signedParams: signedParams
        })
      )
    } catch (error) {
      console.log(`Error`, error)
    }
  }

  const getMostRecentVersion = () => {
    const sortedVersions = item.imageVersions.slice().sort((a, b) => {
      // If either a or b is 'latest', handle the special case.
      if (a.name === 'latest') {
        return -1
      } else if (b.name === 'latest') {
        return 1
      }
      var coerced_a = semver.valid(semver.coerce(a.name))
      var coerced_b = semver.valid(semver.coerce(b.name))
      if (coerced_a === null || coerced_b === null) {
        return b.name.localeCompare(a.name)
      }
      return semver.compare(coerced_b, coerced_a)
    })

    return sortedVersions.length > 0 ? sortedVersions[0] : null
  }

  const mostRecentVersion = getMostRecentVersion()

  return (
    <Tr key={item.id}>
      <Td pl={1} width={'160px'}>
        {loading ? (
          <Skeleton height='20px' />
        ) : (
          <Switch
            id='status'
            isChecked={item.scanEnabled}
            onChange={handleChange}
          />
        )}
      </Td>
      <Td fontSize={'sm'} pl={1}>
        {loading ? (
          <Skeleton height='20px' />
        ) : item.imageVersions.length === 0 ? (
          <Text>{item.name}</Text>
        ) : (
          <Link
            to={`/customer/images?v=${mostRecentVersion.id}&id=${item.id}`}
            style={{
              color: '#3182CE',
              textDecoration: 'underline'
            }}
            onClick={() => {
              window.localStorage.setItem('Image', item.name)
              setScanEnabled(item.scanEnabled ? true : false)
            }}
          >
            {item.name}
          </Link>
        )}
      </Td>
      <Td fontSize={'sm'} pl={1}>
        {loading ? (
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
        {loading ? (
          <Skeleton height='20px' />
        ) : (
          <Text>{item.imageVersions.length}</Text>
        )}
      </Td>
      <Td fontSize={'sm'} pl={1}>
        {loading ? (
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
      <Td pl={0}>
        {loading ? (
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
    </Tr>
  )
}

export default ImageRow

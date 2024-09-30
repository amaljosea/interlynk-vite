import { IconButton, Link, Tooltip } from '@chakra-ui/react'

const ExternalLink = ({ link, ...rest }) => {
  const { url } = link || ''
  return (
    <Tooltip placement='top' label={link?.name}>
      <Link
        isExternal
        href={url?.startsWith('https') ? `${url}` : `https://${url}`}
      >
        <IconButton
          {...rest}
          size='xs'
          variant='solid'
          colorScheme='gray'
          isDisabled={!url}
        />
      </Link>
    </Tooltip>
  )
}

export default ExternalLink

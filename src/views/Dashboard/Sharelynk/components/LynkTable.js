import { Box, Table, Th, Tbody, Thead, Tr } from '@chakra-ui/react'
import SBOMLinkRow from 'components/Tables/SBOMLinkRow'

const LynkTable = ({ captions, data, refetch }) => {
  return (
    <Table
      __css={{ 'table-layout': 'fixed', width: 'full' }}
      variant='simple'
      size='sm'
    >
      <Thead>
        <Tr my='.8rem' pl='0px'>
          {captions.map((caption, idx) => {
            return (
              <Th key={idx} ps={idx === 0 ? '0px' : null} pb={4}>
                <Box>{caption}</Box>
              </Th>
            )
          })}
        </Tr>
      </Thead>
      <Tbody>
        {data.shareLynks.length > 0 &&
          data.shareLynks.map((item, index) => (
            <SBOMLinkRow
              key={index}
              id={item.id}
              active={item.enabled}
              updatedAt={item.updatedAt}
              shareUsers={item.shareUsers}
              signedUrlParams={item.signedUrlParams}
              refetch={refetch}
            />
          ))}
      </Tbody>
    </Table>
  )
}

export default LynkTable

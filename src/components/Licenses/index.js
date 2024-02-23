import { Flex } from '@chakra-ui/react'
import Card from 'components/Card/Card'
import LicenseTable from './LicenseTable'
import {useQuery} from "@apollo/client";
import {GetLicensesTable} from "../../graphQL/Queries";

const Licenses = () => {
    const { data, refetch } = useQuery(GetLicensesTable, {
        fetchPolicy: 'network-only',
        variables: {
            direction: 'ASC',
            status: "unspecified",
            first: 25
        }
    })

    const licenses = data?.organization?.licenses

    return (
        <Flex
            flexDirection='column'
            pt={{ base: '120px', md: '74px' }}
            pr={2}
            pl={5}
        >
            <Card overflowX={{ sm: 'scroll', xl: 'hidden' }}>
                <LicenseTable data={licenses} refetch={refetch} />
            </Card>
        </Flex>
    )
}

export default Licenses

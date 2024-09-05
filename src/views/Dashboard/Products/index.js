import { TabProvider } from 'context/TabContext'
import { Outlet } from 'react-router-dom'

function Index() {
  return (
    <TabProvider>
      <Outlet />
    </TabProvider>
  )
}

export default Index


import Table from '../../../components/Table'
import { weeklyBillingData } from '../../../components/Data'
import Filters from '../../../components/Filters'

const WeeklyBilling = () => {
    const weeklyBillingColumns = [
        {label:"Bill Namwe", key:"billName"},
        {label:"Contractor", key:"contractor"},
        {label:"Week", key:"week"},
        {label:"Started Date", key:"startedDate"},
        {label:"Site Location", key:"siteLocation"},
        {label:"Bill Amount", key:"billAmount"},
        {label:"Status", key:"status"},
    ]
  return (
   
   <Table
    title={"Site Management"}
    subtitle={"Weekly Billing"}
    pagetitle={"Weekly Billing"}
    endpoint={weeklyBillingData} 
    columns={weeklyBillingColumns}
    EditModal={false}
   ViewModal={true}
    FilterModal={Filters}
  

 
    />
  )
}

export default WeeklyBilling

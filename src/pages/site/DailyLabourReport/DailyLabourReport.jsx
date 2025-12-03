
import React from 'react'
import Filters from '../../../components/Filters'
import Table from '../../../components/Table'
import { dailyLabourData } from '../../../components/Data'
import {  TbPlus } from 'react-icons/tb'
import AddDailyLabourSite from './AddDailyLabourSite'

const DailyLabourReport = () => {
    const dailyLabourColumns = [
        {label:"Name", key:"name"},
        {label:"Repoting To", key:"reportingTo"},
        {label:"SiteLocation", key:"siteLocation"},
        {label:"Type", key:"type"},
        {label:"Date", key:"date"},
        {label:"Time In", key:"timeIn"},
        {label:"Time Out", key:"timeOut"},
    ]
  return (
    <Table
      title={"Daily Labour Report"}
      subtitle={"Labour Report"}
      pagetitle={"Labour Report"}
      endpoint={dailyLabourData} 
      columns={dailyLabourColumns}
      EditModal={false}
      //ViewModal={true}
      routepoint={"viewdailylabourReport"}
      FilterModal={Filters} 
      AddModal={AddDailyLabourSite} 
      addButtonIcon={<TbPlus className="text-2xl text-primary" />}
      addButtonLabel={"Add Daily Labour "}
      
    />
  )
}

export default DailyLabourReport

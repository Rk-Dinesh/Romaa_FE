import React from 'react'
import Table from '../../../components/Table'
import Filters from '../../../components/Filters'
import { TbPencil } from 'react-icons/tb'
import { workDoneData } from '../../../components/Data'
import AddWorkDoneSite from './AddWorkDoneSite'

const WorkDoneSite = () => {
    const workDoneColumns = [
        {label:"WO ID", key:"woId"},
        {label:"Work", key:"work"},
        {label:"WO Date", key:"woDate"},
        {label:"Schedule", key:"schedule"},
        {label:"Date", key:"date"},
        {label:"Contractor", key:"contractor"},
        {label:"Unit Price", key:"unitPrice"},
        {label:"Units", key:"units"},
        {label:"Total", key:"total"},
    ]
  return (
   <Table 
   title={"DPR Work Done"}
    subtitle={"Work Done"}
    pagetitle={"Work Done"}
    columns={workDoneColumns}
    endpoint={workDoneData}
    EditModal={false}
    ViewModal={false}
    FilterModal={Filters}
    AddModal={AddWorkDoneSite}
    addButtonIcon={<TbPencil className="text-2xl text-primary" />}
    addButtonLabel={"Add Work Done"}

   />
  )
}

export default WorkDoneSite

import React, { useEffect, useState } from 'react'
import Table from '../../../components/Table'
import Filters from '../../../components/Filters'
import axios from 'axios'
import { API } from '../../../constant'

const ProjectAsset = () => {
    const [projectAssets, setProjectAssets] = useState([])
    const [loading, setLoading] = useState(false)

    // Retrieve tenderId from localStorage
    const tenderId = localStorage.getItem("tenderId")

    const ProjectAssestColumns = [
        { label: "Asset Name", key: "assetName" },
        { label: "Asset Type", key: "assetType" },
        { label: "Unit", key: "unit" },
        { label: "Alloted To", key: "siteName" ,    render: (item) => `${item.currentSite?.siteName || ""}`,},
        { label: "Site Location", key: "location" ,    render: (item) => `${item.currentSite?.location || ""}`,},
        { label: "Date", key: "date",  render: (item) => `${new Date(item.currentSite?.assignedDate).toLocaleDateString() || ""}`,},
        { label: "Status", key: "status", render: (item) => `${item.currentStatus || "" }`,},
    ]

    // Fetch assets by tenderId
    const fetchAssetsByTender = async () => {
        if (!tenderId) return
        try {
            setLoading(true)
            const res = await axios.get(`${API}/machineryasset/api/machinery-assets/project/${tenderId}`) 
            setProjectAssets(res.data.data)
        } catch (err) {
            console.error("Error fetching assets:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAssetsByTender()
    }, [tenderId])

    return (
        <div>
            <Table
                title={"Site Management"}
                subtitle={"Project Asset"}
                pagetitle={"Project Asset"}
                endpoint={projectAssets}   // pass filtered data
                columns={ProjectAssestColumns}
                EditModal={false}
                routepoint={"viewprojectassest"}
                FilterModal={Filters}
                ViewModal={true}
                loading={loading}
            />
        </div>
    )
}

export default ProjectAsset

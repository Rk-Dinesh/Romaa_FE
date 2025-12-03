import { TbFileInvoice } from "react-icons/tb";

const ProjectDocuments = () => {
  return (
    <>
      <div className="h-11/12">
        <div className="flex flex-col justify-center items-center h-full  text-darkest-blue">
          
            <p className="flex justify-center items-center ">
              <TbFileInvoice size={52} className="stroke-1" />
            </p>
            <p className="font-semibold py-2">Upload Assets</p>
       
        </div>
      </div>
    </>
  );
};

export default ProjectDocuments;

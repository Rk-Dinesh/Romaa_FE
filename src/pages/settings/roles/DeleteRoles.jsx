import Delete_Logo from "../../../assets/images/Delete.png"
import Modal from "../../../components/Modal";



const DeleteRoles = ({onclose}) => {
 
  return (
    <div>
      <Modal
        onclose={onclose}
        title="Delete User"
        child={
          <>
              <div className="w-[320px] py-6 flex flex-col items-center text-center space-y-4">
                <div className=" w-full justify-center flex ">
                    <img src={Delete_Logo} alt="" />
                    
                </div>
            <p className="text-2xl font-semibold text-gray-800">Are you sure?</p>

            <p className="text-sm text-gray-600 px-3">
              Are you sure? Do you want to delete permanently (name)?
            </p>

            <div className="flex justify-between gap-4 mt-4 px-6 w-full">
              <button
                onClick={onclose}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                onClick={onclose}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
            </div>
          </>
        }
      />
    </div>
  );
};

export default DeleteRoles;

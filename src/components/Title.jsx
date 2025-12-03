// import React from "react";
// import { useNavigate } from "react-router-dom";
const Title = ({title, sub_title,page_title,active_title}) => {
  return (
    <div>
      {" "}
      <div className="font-roboto-flex flex flex-col ">
        <p className=" font-light">
           {title}
          {sub_title && ` / ${sub_title}`}
          {active_title && ` / ${active_title}`}
        </p>
        <p className="text-xl  font-semibold ">
          {page_title} {active_title}
        </p>
      </div>
    </div>
  );
};
// const Title = ({ title, sub_title, page_title, active_title }) => {
//   const navigate = useNavigate();
//   // Always expect sub_title as array of {label, to}
//   const breadcrumbs = [{ label: title }, ...(Array.isArray(sub_title) ? sub_title : [])];

//   return (
//     <div>
//       <div className="font-roboto-flex flex flex-col">
//         <p className="font-light">
//           {breadcrumbs.map((crumb, idx) => (
//             <span key={idx}>
//               {crumb.to ? (
//                 <span
//                   className=" cursor-pointer"
//                   onClick={() => navigate(crumb.to)}
//                 >
//                   {crumb.label}
//                 </span>
//               ) : (
//                 <span>{crumb.label}</span>
//               )}
//               {idx < breadcrumbs.length - 1 && <span className="mx-1">/</span>}
//             </span>
//           ))}
//         </p>
//         <p className="text-xl font-semibold">
//           {page_title} {active_title}
//         </p>
//       </div>
//     </div>
//   );
// };

export default Title;
// AdminLpo.jsx
import React from "react";
import { useLpoContext } from "./LpoContext"; // Use the context

const AdminLpo = () => {
  const { lpos } = useLpoContext(); // Access the list of LPOs

  return (
    <div className="p-4">
      <h1>Admin LPO Page</h1>
      {lpos.length > 0 ? (
        <div>
          {lpos.map((lpo, index) => (
            <div key={index} className="border p-4 mb-4">
              <h3>LPO Requisition Number: {lpo.requisitionNumber}</h3>
              <p>Supplier: {lpo.supplier}</p>
              <ul>
                {lpo.items.map((item, idx) => (
                  <li key={idx}>
                    {item.name} - ${item.price}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p>No LPOs created yet.</p>
      )}
    </div>
  );
};

export default AdminLpo;

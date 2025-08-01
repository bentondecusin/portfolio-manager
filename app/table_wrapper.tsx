import React from "react";

const TableWrapper = ({ children }) => {
  return (
    <div className="max-h-[400px] overflow-y-auto border rounded-lg p-2">
      {children}
    </div>
  );
};

export default TableWrapper;

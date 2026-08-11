import React from 'react';
import { TablePagination, Paper } from '@mui/material';

const Pagination = ({
  currentPage = 1,
  pageSize = 10,
  totalRecords = 0,
  onPageChange,
  onPageSizeChange,
}) => {
  // MUI TablePagination uses 0-indexed page numbers (0 = Page 1)
  const handleChangePage = (event, newPage) => {
    onPageChange(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    onPageSizeChange(parseInt(event.target.value, 10));
  };

  return (
    <Paper elevation={2} sx={{ mt: 2, borderRadius: 2 }}>
      <TablePagination
        component="div"
        count={totalRecords}
        page={currentPage - 1} // Convert 1-index to MUI 0-index
        onPageChange={handleChangePage}
        rowsPerPage={pageSize}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
        showFirstButton
        showLastButton
      />
    </Paper>
  );
};

export default Pagination;
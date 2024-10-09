import React, { useState } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import ReactMarkdown from "react-markdown";

const columns = [
  { id: "TraceID", label: "Trace ID", minWidth: 50 },
  { id: "Name", label: "Name", minWidth: 50 },
  { id: "Time", label: "Time", minWidth: 50 },
  { id: "Latency", label: "Latency", minWidth: 50 },
  { id: "TotalTokens", label: "Total Tokens", minWidth: 50 },
  { id: "PromptTokens", label: "Prompt Tokens", minWidth: 50 },
  { id: "CompletionTokens", label: "Completion Tokens", minWidth: 50 },
  { id: "TotalCost", label: "Total Cost", minWidth: 50 },
  { id: "PromptCost", label: "Prompt Cost", minWidth: 50 },
  { id: "CompletionCost", label: "Completion Cost", minWidth: 50 },
];

export default function ColumnGroupingTable({ tableData }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [popoverContent, setPopoverContent] = useState({
    input: "",
    output: "",
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handlePopoverOpen = (event, row) => {
    setAnchorEl(event.currentTarget);

    // Convert input and output to strings if they are objects
   const inputContent = JSON.stringify(row.Input, null, 2); // Pretty-prints JSON
   const outputContent = JSON.stringify(row.Output, null, 2);


    setPopoverContent({ input: inputContent, output: outputContent });
  };


  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Paper sx={{ width: "100%" }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                return (
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={row.ID}
                    onMouseEnter={(event) => handlePopoverOpen(event, row)}
                    onMouseLeave={handlePopoverClose}
                  >
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {column.format && typeof value === "number"
                            ? column.format(value)
                            : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={tableData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <Popover
        id="mouse-over-popover"
        sx={{
          pointerEvents: "none",
          "& .MuiPopover-paper": {
            padding: "16px",
            maxWidth: "75%",
            maxHeight: "60%",
            overflow: "auto",
          },
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <Typography variant="subtitle1" gutterBottom>
          Input:
        </Typography>
        <Typography paragraph>{popoverContent.input}</Typography>
        <Typography variant="subtitle1" gutterBottom>
          Output:
        </Typography>
        <Typography>
          <ReactMarkdown>{popoverContent.output}</ReactMarkdown>
        </Typography>
      </Popover>
    </Paper>
  );
}

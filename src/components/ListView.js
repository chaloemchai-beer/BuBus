import * as React from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { slide as Menu } from "react-burger-menu";
import "../styles/ListView.css";
import busnumber from "../data/busnumber.json";

const ListView = () => {
  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
      backgroundColor: "#fff",
    },
    // hide last border
    "&:last-child td, &:last-child th": {
      border: 0,
    },
  }));
  return (
    <Menu width={"100%"}>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: "100%" }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <TableCell>Number</TableCell>
              <TableCell align="center">At</TableCell>
              <TableCell align="center">To</TableCell>
              <TableCell align="center">Take</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {busnumber.map((data, idx) => (
              <StyledTableRow key={idx}>
                <TableCell component="th" scope="row">
                  {data.Number}
                </TableCell>
                <TableCell align="center">{data.At}</TableCell>
                <TableCell align="center">{data.To}</TableCell>
                <TableCell align="center">{data.Take}</TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Menu>
  );
};

export default ListView;

import React, { Fragment, useEffect, useState } from "react";
// import ReactDOM from "react-dom";
import Chart from "../Chart/Chart";
// import styles from "./Transactions.module.css";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import TextField from "@material-ui/core/TextField";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";
import TableFooter from "@material-ui/core/TableFooter";

import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";

import { makeStyles } from "@material-ui/core/styles";

import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";

import { ColorPicker } from "material-ui-color";

// const domain = "http://localhost";
// const port = 3001;
// const url = `${domain}:${port}/api/logform`;

const useStyles = makeStyles((theme) => ({
  tableHeader: {
    fontSize: "12pt",
    fontWeight: "600",
    color: "black",
    backgroundColor: "#CACACA",
  },
  tableData: {
    fontSize: "10pt",
    color: "black",
  },
  tableFooter: {
    fontSize: "12pt",
    color: "black",
    backgroundColor: "#CACACA",
  },
  container: {
    minHeight: 400,
    maxHeight: 600,
    fontSize: "10pt",
    width: 1200,
  },
  root: {
    flexGrow: 1,
    fontSize: "10pt",
    backgroundColor: "#FAFAFA",
    margin: 10,
  },
}));

const initialState = {
  transactionData: [
    // {
    //   fitid: "",
    //   trntype: "",
    //   dtposted: "",
    //   trnamt: "",
    //   name: "",
    //   memo: "",
    // },
  ],
  payeeData: [
    // {
    //   name: "",
    //   friendlyName: "",
    //   categoryValue: 0,
    // },
  ],
  categoryData: [
    // {
    //   value: "0",
    //   label: "general",
    //   backgroundColor: "#FFFFFF",
    //   borderColor: "#000000",
    // },
  ],
  // chartLabels: [],
  // chartData: [],
  // backgroundColor: [],
  // borderColor: [],
  // showChart01: 0,

  newCategoryColour: "",
};

function Transactions(props) {
  const [state, setstate] = useState(initialState);
  const [colourOptions, setColourOptions] = useState({});
  const [newCategoryColour, setNewCategoryColour] = useState("");

  const getColourOptions = () => {
    fetch("/data/colour-options.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then(function (resp) {
        return resp.json();
      })
      .then(function (rawdata) {
        const myJson = rawdata.borderColor;
        setColourOptions(myJson);
      });
  };

  const getCategoryData = () => {
    fetch("/data/category-data.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then(function (resp) {
        return resp.json();
      })
      .then(function (rawdata) {
        const myJson = rawdata.categoryData;

        setstate((previousState) => {
          return {
            ...previousState,
            categoryData: myJson,
          };
        });
      });
  };

  useEffect(() => {
    getColourOptions();
  }, []);

  useEffect(() => {
    getCategoryData();
  }, []);

  const [checkState, setCheckState] = React.useState({
    transactionList: true,
    payeeList: true,
    categoryList: true,
  });

  const classes = useStyles();

  const onVisualise = (e) => {
    //chart01: line graph of sum(transactionData.trnamt) by date(transactionData.dtposted)
    //chart02: bar graph of sum(transactionData.trnamt) by month(transactionData.dtposted)
    //chart03: pie chart  of sum(transactionData.trnamt) by categoryData.label
    //chart04: line chart of sum(transactionData.trnamt) by categoryData.label and by month(transactionData.dtposted)

    let toggle = 1.0;
    let dtposted = "";
    let transactionData = state.transactionData;

    //chart01: line graph of sum(transactionData.trnamt) by date(transactionData.dtposted)
    let chart01 = {
      rawData: [],
      sumOfIncome: 0.0,
      sumOfExpenses: 0.0,
      runningTotal: 0.0,
      chartLabels: [],
      chartData: [],
      backgroundColor: [],
      borderColor: [],
    };

    //savings (ie credit accounts) = 1.0
    //credit card (ie, debit accounts) = -1.0

    for (let data of transactionData) {
      if (data.trntype === "CREDIT" || data.trnamt >= 0) {
        chart01.sumOfIncome = toggle * data.trnamt;
        chart01.sumOfExpenses = 0.0;
      } else {
        chart01.sumOfIncome = 0.0;
        chart01.sumOfExpenses = toggle * data.trnamt;
      }

      dtposted = data.dtposted;
      let index = chart01.rawData
        .map(function (e) {
          return e.dtposted;
        })
        .indexOf(dtposted);

      if (index >= 0) {
        chart01.rawData[index].dtposted = dtposted;
        chart01.rawData[index].sumOfIncome += chart01.sumOfIncome;
        chart01.rawData[index].sumOfExpenses += chart01.sumOfExpenses;
      } else {
        chart01.rawData.push({
          dtposted: dtposted,
          sumOfIncome: chart01.sumOfIncome,
          sumOfExpenses: chart01.sumOfExpenses,
        });
      }
    }

    chart01.rawData.sort();

    chart01.chartData = chart01.rawData.map((data) => {
      chart01.runningTotal += data.sumOfIncome + data.sumOfExpenses;
      return chart01.runningTotal + toggle * state.balance;
    });

    chart01.chartLabels = chart01.rawData.map((data) => {
      return data.dtposted;
    });
    // .filter((e) => e);

    let showChart01 = 1;

    setstate((previousState) => {
      return {
        ...previousState,
        chart01: chart01,
        showChart01: showChart01,
      };
    });

    //chart03: pie chart  of sum(transactionData.trnamt) by categoryData.label
    let chart03 = {
      rawData: [],
      sumOfIncome: 0.0,
      sumOfExpenses: 0.0,
      runningTotal: 0.0,
      datasets: [],
      chartLabels: [],
    };

    for (let data of transactionData) {
      if (data.trntype === "CREDIT" || data.trnamt >= 0) {
        chart03.category = chart03.sumOfIncome = toggle * data.trnamt;
        chart03.sumOfExpenses = 0.0;
      } else {
        chart03.sumOfIncome = 0.0;
        chart03.sumOfExpenses = toggle * data.trnamt;
      }

      let categorylabel = "uncategorised";
      let backgroundColor = "#CCCCCC";
      let borderColor = "#CCCCCC";
      let payeeValueIndex = null;
      let categoryValueIndex = null;
      let payeeName = data.name;

      payeeValueIndex = state.payeeData
        .map(function (e) {
          return e.name;
        })
        .indexOf(payeeName);

      if (payeeValueIndex && payeeValueIndex >= 0) {
        categoryValueIndex = state.payeeData[payeeValueIndex].categoryValue;
        if (categoryValueIndex && categoryValueIndex >= 0) {
          categorylabel = state.categoryData[categoryValueIndex].label;
          backgroundColor =
            state.categoryData[categoryValueIndex].backgroundColor;
          borderColor = state.categoryData[categoryValueIndex].borderColor;
        }
      }

      let index = chart03.rawData
        .map(function (e) {
          return e.category;
        })
        .indexOf(categorylabel);

      if (index >= 0) {
        chart03.rawData[index].sumOfIncome += chart03.sumOfIncome;
        chart03.rawData[index].sumOfExpenses += chart03.sumOfExpenses;
      } else {
        chart03.rawData.push({
          category: categorylabel,
          backgroundColor: backgroundColor,
          borderColor: borderColor,
          sumOfIncome: chart03.sumOfIncome,
          sumOfExpenses: chart03.sumOfExpenses,
        });
      }
    }

    chart03.datasets.push({
      data: chart03.rawData.map((data) => {
        return data.sumOfExpenses;
      }),
      label: "Expense",
      fill: true,
      backgroundColor: chart03.rawData.map((data) => {
        return data.backgroundColor;
      }),
      borderColor: chart03.rawData.map((data) => {
        return data.borderColor;
      }),
      borderWidth: 1,
    });

    chart03.chartLabels = chart03.rawData.map((data) => {
      return data.category;
    });

    let showChart03 = 1;

    setstate((previousState) => {
      return {
        ...previousState,
        chart03: chart03,
        showChart03: showChart03,
      };
    });

    //chart02: line chart  of sum(transactionData.trnamt) by month(transactionData.dtposted)
    let chart02 = {
      rawData: [],
      sumOfIncome: 0.0,
      sumOfExpenses: 0.0,
      runningTotal: 0.0,
      datasets: [],
      chartLabels: [],
    };

    for (let data of transactionData) {
      if (data.trntype === "CREDIT" || data.trnamt >= 0) {
        chart02.sumOfIncome = toggle * data.trnamt;
        chart02.sumOfExpenses = 0.0;
      } else {
        chart02.sumOfIncome = 0.0;
        chart02.sumOfExpenses = toggle * data.trnamt;
      }

      dtposted = data.dtposted.substring(0, 6);
      let index = chart02.rawData
        .map(function (e) {
          return e.dtposted.substring(0, 6);
        })
        .indexOf(dtposted);

      if (index >= 0) {
        chart02.rawData[index].dtposted = dtposted;
        chart02.rawData[index].sumOfIncome += chart02.sumOfIncome;
        chart02.rawData[index].sumOfExpenses += chart02.sumOfExpenses;
      } else {
        chart02.rawData.push({
          dtposted: dtposted,
          sumOfIncome: chart02.sumOfIncome,
          sumOfExpenses: chart02.sumOfExpenses,
        });
      }
    }

    chart02.rawData.sort();

    chart02.datasets.push({
      data: chart02.rawData.map((data) => {
        return data.sumOfIncome;
      }),
      label: "Income",
      fill: true,
      backgroundColor: "rgba(168, 255, 168, 1)",
      borderColor: "rgba(0, 255, 0, 1)",
      borderWidth: 1,
    });

    chart02.datasets.push({
      data: chart02.rawData.map((data) => {
        return data.sumOfExpenses;
      }),
      label: "Expense",
      fill: true,
      backgroundColor: "rgba(255, 168, 168, 1)",
      borderColor: "rgba(255, 0, 0, 1)",
      borderWidth: 1,
    });

    chart02.chartLabels = chart02.rawData.map((data) => {
      return data.dtposted;
    });

    let showChart02 = 1;

    setstate((previousState) => {
      return {
        ...previousState,
        chart02: chart02,
        showChart02: showChart02,
      };
    });
  };

  const fileSelectorOnChange = (e) => {
    const fileSelector = document.getElementById("file-selector");
    var file = fileSelector.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
      var parser = new DOMParser();
      var xmlDoc = parser.parseFromString(reader.result, "application/xml");

      const transactionData = [];
      const payeeData = [];

      var STMTTRN = xmlDoc.getElementsByTagName("STMTTRN");
      for (var i = 0; i < STMTTRN.length; i++) {
        var item = STMTTRN[i];

        var transactionDatum = {
          fitid: item.getElementsByTagName("FITID")[0].innerHTML,
          trntype: item.getElementsByTagName("TRNTYPE")[0].innerHTML,
          dtposted: item.getElementsByTagName("DTPOSTED")[0].innerHTML,
          trnamt: parseFloat(item.getElementsByTagName("TRNAMT")[0].innerHTML),
          name: item
            .getElementsByTagName("NAME")[0]
            .innerHTML.replace("<![CDATA[", "")
            .replace("]]>", ""),
          memo: item
            .getElementsByTagName("MEMO")[0]
            .innerHTML.replace("<![CDATA[", "")
            .replace("]]>", ""),
        };
        transactionData.push(transactionDatum);

        var payeeDatum = {
          name: item
            .getElementsByTagName("NAME")[0]
            .innerHTML.replace("<![CDATA[", "")
            .replace("]]>", ""),
          categoryValue: "",
        };
        var index = payeeData
          .map(function (e) {
            return e.name;
          })
          .indexOf(payeeDatum.name);
        if (index === -1) payeeData.push(payeeDatum);
      }

      var LEDGERBAL = xmlDoc.getElementsByTagName("LEDGERBAL");
      item = LEDGERBAL[0];
      let balance = parseFloat(
        item.getElementsByTagName("BALAMT")[0].innerHTML
      );

      setstate((previousState) => {
        return {
          ...previousState,
          transactionData: transactionData,
          payeeData: payeeData,
          balance: balance,
        };
      });
    };
    reader.readAsText(file);
  };

  const loadFile = (e) => {
    const fileSelector = document.getElementById("file-selector");
    fileSelector.click();
  };

  // BEGIN EVENTS FOR DISPLAY/HIDE TABLES

  const handleCheckboxChange = (e) => {
    setCheckState({ ...checkState, [e.target.name]: e.target.checked });
    const targetList = document.getElementById(e.target.name);
    if (e.target.checked === true) targetList.style.display = "block";
    else targetList.style.display = "none";
  };

  // END EVENTS FOR DISPLAY/HIDE TABLES

  // BEGIN EVENTS FOR PAGING TABLES

  const [transactionPage, setTransactionPage] = React.useState(0);
  const [rowsPerTransactionPage, setRowsPerTransactionPage] =
    React.useState(10);

  const handleChangeTransactionPage = (event, newTransactionPage) => {
    setTransactionPage(newTransactionPage);
  };

  const handleChangeRowsPerTransactionPage = (event) => {
    setRowsPerTransactionPage(+event.target.value);
    setTransactionPage(0);
  };

  const [payeePage, setPayeePage] = React.useState(0);
  const [rowsPerPayeePage, setRowsPerPayeePage] = React.useState(10);

  const handleChangePayeePage = (event, newPayeePage) => {
    setPayeePage(newPayeePage);
  };

  const handleChangeRowsPerPayeePage = (event) => {
    setRowsPerPayeePage(+event.target.value);
    setPayeePage(0);
  };

  const [categoryPage, setCategoryPage] = React.useState(0);
  const [rowsPerCategoryPage, setRowsPerCategoryPage] = React.useState(10);

  const handleChangeCategoryPage = (event, newCategoryPage) => {
    setCategoryPage(newCategoryPage);
  };

  const handleChangeRowsPerCategoryPage = (event) => {
    setRowsPerCategoryPage(+event.target.value);
    setCategoryPage(0);
  };

  // END EVENTS FOR PAGING TABLES

  // BEGIN EVENTS FOR PAYEE CHANGES
  const handlePayeeCategoryChange = (e) => {
    let { name, value } = e.target;
    let updatedState = [...state.payeeData];
    let obj = updatedState.find((o) => o.name === name);
    obj.categoryValue = value;
    setstate((previousState) => {
      return {
        ...previousState,
        payeeData: [...updatedState],
      };
    });
  };

  const handlePayeeFriendlyNameChange = (e) => {
    let { name, value } = e.target;
    let updatedState = [...state.payeeData];
    let obj = updatedState.find((o) => o.name === name);
    obj.friendlyName = value;
    setstate((previousState) => {
      return {
        ...previousState,
        payeeData: [...updatedState],
      };
    });
  };
  // END EVENTS FOR PAYEE CHANGES

  const handleCategoryChange = (e, index) => {
    let { name, value } = e.target;
    let updatedState = [...state.categoryData];
    updatedState[index][name] = value;
    setstate((previousState) => {
      return {
        ...previousState,
        categoryData: [...updatedState],
      };
    });
  };

  const handleCategoryColorChange = (e, index) => {
    let updatedState = [...state.categoryData];
    updatedState[index]["backgroundColor"] = e.raw;
    setstate((previousState) => {
      return {
        ...previousState,
        categoryData: [...updatedState],
      };
    });
  };

  // This is required for material-ui-color, but the event isn't firing corectly
  const handleNewCategoryColour = (e) => {
    setNewCategoryColour(e.raw);
  };

  const handleAddCategory = (e) => {
    const categoryLabel = document.getElementById("newCategoryLabel").value;
    // const categoryColour = document.getElementById("newCategoryColour").value;
    const categoryColour = newCategoryColour;

    let updatedState = [...state.categoryData];

    let value = updatedState[updatedState.length - 1].value + 1;
    updatedState.push({
      value: value,
      label: categoryLabel,
      backgroundColor: categoryColour,
      borderColor: "#000000",
    });
    setstate((previousState) => {
      return {
        ...previousState,
        categoryData: [...updatedState],
      };
    });
  };

  const handleRemoveCategory = (e, index) => {
    if (index !== -1) {
      let updatedCategoryState = [...state.categoryData];
      let categoryValue = updatedCategoryState[index].value;
      updatedCategoryState.splice(index, 1);
      setstate((previousState) => {
        return {
          ...previousState,
          categoryData: [...updatedCategoryState],
        };
      });

      let updatedPayeeState = [...state.payeeData];
      updatedPayeeState.map(function (e) {
        if (e.categoryValue === categoryValue) e.categoryValue = "";
        return 0;
      });
      setstate((previousState) => {
        return {
          ...previousState,
          payeeData: [...updatedPayeeState],
        };
      });
    }
  };

  return (
    <>
      <h2>Transaction Listing</h2>

      <FormGroup row={false}>
        <FormControlLabel
          control={
            <Checkbox
              checked={checkState.transactionList}
              onChange={handleCheckboxChange}
              name="transactionList"
            />
          }
          label="Show Transactions"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={checkState.payeeList}
              onChange={handleCheckboxChange}
              name="payeeList"
            />
          }
          label="Show Payees"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={checkState.categoryList}
              onChange={handleCheckboxChange}
              name="categoryList"
            />
          }
          label="Show Categories"
        />
      </FormGroup>

      <Paper id="transactionList" className={classes.root}>
        <TableContainer component={Paper} className={classes.container}>
          <Table stickyHeader className={classes.table} size="small">
            <TableHead>
              <TableRow>
                <TableCell className={classes.tableHeader}>fitid</TableCell>
                <TableCell className={classes.tableHeader}>dtposted</TableCell>
                <TableCell className={classes.tableHeader}>trntype</TableCell>
                <TableCell className={classes.tableHeader} align="right">
                  trnamt
                </TableCell>
                <TableCell className={classes.tableHeader}>name</TableCell>
                <TableCell className={classes.tableHeader}>memo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {state.transactionData &&
                state.transactionData.length > 0 &&
                state.transactionData
                  .slice(
                    transactionPage * rowsPerTransactionPage,
                    transactionPage * rowsPerTransactionPage +
                      rowsPerTransactionPage
                  )
                  .map((row, index) => (
                    <TableRow
                      key={index}
                      style={{
                        background: (
                          state.categoryData[
                            state.payeeData[
                              state.payeeData
                                .map(function (e) {
                                  return e.name;
                                })
                                .indexOf(row.name)
                            ].categoryValue
                          ] ?? { backgroundColor: "#FFFFFF" }
                        ).backgroundColor,
                      }}
                    >
                      <TableCell className={classes.tableData} align="left">
                        {row.fitid}
                      </TableCell>
                      <TableCell className={classes.tableData} align="left">
                        {row.dtposted}
                      </TableCell>
                      <TableCell className={classes.tableData} align="left">
                        {row.trntype}
                      </TableCell>
                      <TableCell className={classes.tableData} align="right">
                        {row.trnamt}
                      </TableCell>
                      <TableCell className={classes.tableData} align="left">
                        {row.name}
                      </TableCell>
                      <TableCell className={classes.tableData} align="left">
                        {row.memo}
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          className={classes.tableFooter}
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={state.transactionData.length}
          rowsPerPage={rowsPerTransactionPage}
          page={transactionPage}
          onChangePage={handleChangeTransactionPage}
          onChangeRowsPerPage={handleChangeRowsPerTransactionPage}
        />
      </Paper>

      <Paper id="payeeList" className={classes.root}>
        <TableContainer component={Paper} className={classes.container}>
          <Table stickyHeader className={classes.table} size="small">
            <TableHead>
              <TableRow>
                <TableCell className={classes.tableHeader}>
                  Payee Name
                </TableCell>
                <TableCell className={classes.tableHeader}>
                  Friendly Name
                </TableCell>
                <TableCell className={classes.tableHeader} align="right">
                  Category
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {state.payeeData &&
                state.payeeData.length > 0 &&
                state.payeeData
                  .slice(
                    payeePage * rowsPerPayeePage,
                    payeePage * rowsPerPayeePage + rowsPerPayeePage
                  )
                  .map((row, index) => (
                    <TableRow
                      key={index}
                      style={{
                        background: (
                          state.categoryData[row.categoryValue] ?? {
                            backgroundColor: "#FFFFFF",
                          }
                        ).backgroundColor,
                      }}
                    >
                      <TableCell className={classes.tableData} align="left">
                        {row.name}
                      </TableCell>
                      <TableCell className={classes.tableData} align="left">
                        <TextField
                          name={row.name}
                          value={row.friendlyName}
                          InputProps={{ className: classes.tableData }}
                          onChange={handlePayeeFriendlyNameChange}
                        />
                      </TableCell>
                      <TableCell className={classes.tableData} align="right">
                        <Select
                          name={row.name}
                          value={row.categoryValue}
                          defaultValue=""
                          className={classes.tableData}
                          onChange={handlePayeeCategoryChange}
                        >
                          {state.categoryData &&
                            state.categoryData.length > 0 &&
                            state.categoryData.map((data) => (
                              <MenuItem key={data.value} value={data.value}>
                                {data.label}
                              </MenuItem>
                            ))}
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={state.payeeData.length}
          rowsPerPage={rowsPerPayeePage}
          page={payeePage}
          onChangePage={handleChangePayeePage}
          onChangeRowsPerPage={handleChangeRowsPerPayeePage}
        />
      </Paper>

      <Paper id="categoryList" className={classes.root}>
        <TableContainer component={Paper} className={classes.container}>
          <Table stickyHeader className={classes.table} size="small">
            <TableHead>
              <TableRow>
                <TableCell className={classes.tableHeader}>
                  Category Label
                </TableCell>
                <TableCell className={classes.tableHeader} align="left">
                  Category Colour
                </TableCell>
                <TableCell className={classes.tableHeader} />
              </TableRow>
            </TableHead>
            <TableBody>
              {state.categoryData &&
                state.categoryData.length > 0 &&
                state.categoryData
                  .slice(
                    categoryPage * rowsPerCategoryPage,
                    categoryPage * rowsPerCategoryPage + rowsPerCategoryPage
                  )
                  .map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className={classes.tableData} align="left">
                        <TextField
                          InputProps={{ className: classes.tableData }}
                          name="label"
                          value={row.label}
                          onChange={(e) => handleCategoryChange(e, index)}
                        />
                      </TableCell>
                      <TableCell className={classes.tableData} align="left">
                        <ColorPicker
                          name="backgroundColor"
                          value={row.backgroundColor}
                          palette={colourOptions}
                          onChange={(e) => handleCategoryColorChange(e, index)}
                          hideTextfield
                        />
                      </TableCell>
                      <TableCell className={classes.tableData} align="right">
                        <Button
                          variant="contained"
                          color="primary"
                          type="button"
                          onClick={(e) => handleRemoveCategory(e, index)}
                        >
                          <RemoveIcon />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TableCell align="left">
                  <TextField id="newCategoryLabel" />
                </TableCell>
                <TableCell align="left">
                  <ColorPicker
                    id="newCategoryColour"
                    value={newCategoryColour}
                    palette={colourOptions}
                    onChange={(e) => handleNewCategoryColour(e)}
                    hideTextfield
                  />
                </TableCell>
                <TableCell align="right">
                  <Button
                    variant="contained"
                    color="primary"
                    type="button"
                    onClick={(e) => handleAddCategory(e)}
                  >
                    <AddIcon />
                  </Button>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={state.categoryData.length}
          rowsPerPage={rowsPerCategoryPage}
          page={categoryPage}
          onChangePage={handleChangeCategoryPage}
          onChangeRowsPerPage={handleChangeRowsPerCategoryPage}
        />
      </Paper>

      <span>
        <input
          type="file"
          id="file-selector"
          onChange={(e) => fileSelectorOnChange(e)}
          style={{ display: "none" }}
        />
        <Button
          variant="contained"
          color="primary"
          type="button"
          name="loadFile"
          onClick={loadFile}
        >
          Load OFX File
        </Button>
      </span>

      <span>
        <Button
          variant="contained"
          color="primary"
          type="button"
          name="btnVisualise"
          onClick={onVisualise}
        >
          Visualise
        </Button>
      </span>

      {state.showChart01 && state.showChart01 > 0 ? <Chart {...state} /> : null}
    </>
  );
}

export default Transactions;

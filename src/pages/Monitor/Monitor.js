
import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Card, CardContent, Typography, Grid, Box } from "@mui/material";
import infobellImg from "../../assets/Images/infobellLogo.png";
import DoughnutChart from "./DoughnutChart";
import ColumnGroupingTable from "./table_data";
import axios from "axios";
import ShimmerUI from "./ShimmerUI";
// Register the necessary Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const DataDashboard = () => {
  const [data, setData] = useState(null);
  const [analytics, setAnalytics] = useState(null);

useEffect(() => {
  // Fetch data for charts
  axios
    .get("https://streamlit-test.thankfulriver-bb957f46.koreacentral.azurecontainerapps.io/data")
    .then((response) => setData(response.data))
    .catch((error) => {
      console.error("Error fetching data:", error);
      console.error("Error details:", error.message);
    });

  // Fetch data for analytics
  axios
    .get("https://streamlit-test.thankfulriver-bb957f46.koreacentral.azurecontainerapps.io/analytics")
    .then((response) => setAnalytics(response.data))
    .catch((error) => console.error("Error fetching analytics:", error));
}, []);


  
  console.log(analytics);
  console.log(data);

  if ( !data || !analytics) {
    return <ShimmerUI />;
  }

  const {
    pieChartDataStatus,
    pieChartDataNamesCount,
    pieChartDataRunTypesCount,
    tableData,
  } = data;
  console.log(
    pieChartDataStatus,
    pieChartDataNamesCount,
    pieChartDataRunTypesCount,
    tableData
  );

  const {
    averageTokensPerQuestion,
    averageCostPerQuestion,
    totalCost,
    averageLatencyPerQuestion,
  } = analytics;

  const modified_tableData = tableData.map(({Input,Output, ...rest}) => (rest));
  console.log(modified_tableData);

  return (
    <Grid
      container
      spacing={3}
      style={{ padding: "20px", backgroundColor: "#f5f5f5" }}
    >
      {/* Header with Logo */}
      <Grid item xs={12}>
        <Box
          display="flex"
          justifyContent="flex-start"
          alignItems="center"
          style={{ marginBottom: "20px" }}
        >
          <img
            alt="InfoBell Logo"
            src={infobellImg}
            style={{ height: "3rem" }}
          />
        </Box>
      </Grid>

      {/* Analytics Cards */}
      <Grid item xs={12} md={3}>
        <Card style={{ height: "100%" }}>
          <CardContent>
            <Typography variant="h6">Average Tokens per Question</Typography>
            <Typography variant="h4">
              {averageTokensPerQuestion.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card style={{ height: "100%" }}>
          <CardContent>
            <Typography variant="h6">Average Cost per Question</Typography>
            <Typography variant="h4">
              ${averageCostPerQuestion.toFixed(4)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card style={{ height: "100%" }}>
          <CardContent>
            <Typography variant="h6">Total Cost</Typography>
            <Typography variant="h4">${totalCost}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card style={{ height: "100%" }}>
          <CardContent>
            <Typography variant="h6">Average Latency per Question</Typography>
            <Typography variant="h4">
              {averageLatencyPerQuestion.toFixed(2)} ms
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Doughnut Charts */}
      <Grid item xs={12} md={4}>
        <Typography
          variant="h6"
          style={{ marginBottom: "10px", fontWeight: "bold" }}
        >
          Status Distribution
        </Typography>
        <DoughnutChart
          percentages={pieChartDataStatus.map((item) => item.value)}
          labels={pieChartDataStatus.map((item) => item.name)}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Typography
          variant="h6"
          style={{ marginBottom: "10px", fontWeight: "bold" }}
        >
          Names Count
        </Typography>
        <DoughnutChart
          percentages={pieChartDataNamesCount.map((item) => item.value)}
          labels={pieChartDataNamesCount.map((item) => item.name)}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Typography
          variant="h6"
          style={{ marginBottom: "10px", fontWeight: "bold" }}
        >
          Run Types Count
        </Typography>
        <DoughnutChart
          percentages={pieChartDataRunTypesCount.map((item) => item.value)}
          labels={pieChartDataRunTypesCount.map((item) => item.name)}
        />
      </Grid>
       {/* Table */}
      <ColumnGroupingTable tableData={tableData} />  
    </Grid>
  );
};

export default DataDashboard;

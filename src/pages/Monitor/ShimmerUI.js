import React from "react";
import { Grid, Box, Skeleton } from "@mui/material";

const ShimmerUI = () => {
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
          <Skeleton variant="rectangular" width={120} height={40} />
        </Box>
      </Grid>

      {/* Analytics Cards */}
      {[...Array(4)].map((_, index) => (
        <Grid item xs={12} md={3} key={index}>
          <Skeleton variant="rectangular" height={100} />
        </Grid>
      ))}

      {/* Doughnut Charts */}
      {[...Array(3)].map((_, index) => (
        <Grid item xs={12} md={4} key={index}>
          <Skeleton
            variant="text"
            width="60%"
            height={30}
            style={{ marginBottom: "10px" }}
          />
          <Skeleton variant="circular" width={200} height={200} />
        </Grid>
      ))}

      {/* Table */}
      <Grid item xs={12}>
        <Skeleton variant="rectangular" height={300} />
      </Grid>
    </Grid>
  );
};

export default ShimmerUI;

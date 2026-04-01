const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");

app.use(cors());
const db = require("./db");

const productRoutes = require("./routes/products");
const salesRoutes = require("./routes/sales");
const invoiceRoutes = require("./routes/invoices");

app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing form data

app.use("/api/products", productRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/invoices", invoiceRoutes);

app.get("/", (req, res) => {
  res.send("Medical Store POS Backend is running!");
});

app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
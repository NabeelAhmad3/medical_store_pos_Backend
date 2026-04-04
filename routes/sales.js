const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/daily", (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  db.all(
    `SELECT invoices.date,
            COALESCE(invoice_items.product_name, '[Deleted Product]') AS name,
            invoice_items.qty,
            invoice_items.sale_price,
            invoice_items.discount_amount,
            COALESCE(invoice_items.purchase_price, 0) AS purchase_price,
            (invoice_items.sale_price - COALESCE(invoice_items.purchase_price, 0)) * invoice_items.qty - invoice_items.discount_amount AS profit
     FROM invoice_items
     JOIN invoices ON invoices.id = invoice_items.invoice_id
     WHERE date(invoices.date) = date(?)`,
    [today],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

router.get("/weekly", (req, res) => {
  const today = new Date();
  const lastWeek = new Date();
  lastWeek.setDate(today.getDate() - 6);

  db.all(
    `SELECT invoices.date,
            COALESCE(invoice_items.product_name, '[Deleted Product]') AS name,
            invoice_items.qty,
            invoice_items.sale_price,
            invoice_items.discount_amount,
            COALESCE(invoice_items.purchase_price, 0) AS purchase_price,
            (invoice_items.sale_price - COALESCE(invoice_items.purchase_price, 0)) * invoice_items.qty - invoice_items.discount_amount AS profit
     FROM invoice_items
     JOIN invoices ON invoices.id = invoice_items.invoice_id
     WHERE date(invoices.date) BETWEEN date(?) AND date(?)`,
    [lastWeek.toISOString().split("T")[0], today.toISOString().split("T")[0]],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

router.get("/monthly", (req, res) => {
  const today = new Date();

  db.all(
    `SELECT invoices.date,
            COALESCE(invoice_items.product_name, '[Deleted Product]') AS name,
            invoice_items.qty,
            invoice_items.sale_price,
            invoice_items.discount_amount,
            COALESCE(invoice_items.purchase_price, 0) AS purchase_price,
            (invoice_items.sale_price - COALESCE(invoice_items.purchase_price, 0)) * invoice_items.qty - invoice_items.discount_amount AS profit
     FROM invoice_items
     JOIN invoices ON invoices.id = invoice_items.invoice_id
     WHERE strftime('%Y-%m', invoices.date) = strftime('%Y-%m', ?)`,
    [today.toISOString()],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

module.exports = router;

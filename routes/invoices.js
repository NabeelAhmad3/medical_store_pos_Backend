const express = require("express");
const db = require("../db");

const router = express.Router();

router.post("/", (req, res) => {
  const { invoice_number, supplier_address, supplier_name, phone, payment_mode, date, total, items, saleMan_Address, saleMan } = req.body;

  db.run(
    `INSERT INTO invoices(invoice_number, supplier_address, supplier_name, phone, payment_mode, date, total, saleMan_Address, saleMan)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [invoice_number, supplier_address, supplier_name, phone, payment_mode, date, total, saleMan_Address, saleMan],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      const invoiceId = this.lastID;
      let completed = 0;
      let hasError = false;

      if (items.length === 0) {
        return res.json({ message: "Invoice saved", invoiceId });
      }

      items.forEach((item) => {
        db.run(
          `INSERT INTO invoice_items
           (invoice_id, product_id, product_name, purchase_price, batch_number, qty, sale_price, discount_percent, discount_amount, total, gst_percent, gst_amount)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            invoiceId,
            item.product_id,
            item.name,
            item.purchase_price,
            item.batch_number,
            item.qty,
            item.sale_price,
            item.discount_percent,
            item.discount_amount,
            item.total,
            item.gst_percent,
            item.gst_amount,
          ],
          function (err) {
            if (err && !hasError) {
              hasError = true;
              return res.status(500).json({ error: err.message });
            }

            db.run(
              `UPDATE products SET quantity = quantity - ? WHERE id = ?`,
              [item.qty, item.product_id],
              function (err) {
                if (err && !hasError) {
                  hasError = true;
                  return res.status(500).json({ error: err.message });
                }

                completed++;
                if (completed === items.length && !hasError) {
                  res.json({ message: "Invoice saved", invoiceId });
                }
              }
            );
          }
        );
      });
    }
  );
});


router.get("/", (req, res) => {
  db.all(
    `SELECT * FROM invoices ORDER BY id DESC`,
    [],
    (err, invoices) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(invoices);
    }
  );
});

router.get("/pharmacies/list", (req, res) => {
  db.all(
    `SELECT supplier_name, phone, supplier_address
     FROM invoices
     WHERE supplier_name IS NOT NULL AND supplier_name != ''
     GROUP BY supplier_name
     ORDER BY MAX(id) DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

router.get("/salesmen/list", (req, res) => {
  db.all(
    `SELECT saleMan, saleMan_Address
     FROM invoices
     WHERE saleMan IS NOT NULL AND saleMan != ''
     GROUP BY saleMan
     ORDER BY MAX(id) DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});
router.get("/:id", (req, res) => {
  const { id } = req.params;

  db.get(`SELECT * FROM invoices WHERE id = ?`, [id], (err, invoice) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    db.all(
      `SELECT ii.*,
              COALESCE(ii.product_name, p.name, '[Deleted Product]') AS product_name,
              COALESCE(ii.purchase_price, p.purchase_price, 0) AS purchase_price,
               (ii.sale_price - COALESCE(ii.purchase_price, p.purchase_price, 0)) * ii.qty - ii.discount_amount AS profit
       FROM invoice_items ii
       LEFT JOIN products p ON p.id = ii.product_id
       WHERE ii.invoice_id = ?`,
      [id],
      (err, items) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ ...invoice, items });
      }
    );
  });
});
module.exports = router;
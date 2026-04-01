const express = require("express");
const db = require("../db");
const router = express.Router();

router.get("/", (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
     const updated = rows.map(p => {
      const discountAmount = p.sale_price * (p.discount / 100);
      const afterDiscount = p.sale_price - discountAmount;
      const gstAmount = afterDiscount * (p.gst / 100);
      const final_price = afterDiscount + gstAmount;

      return { ...p, final_price };
    });
    res.json(updated);
  });
});

router.get("/:id", (req, res) => {
  db.get("SELECT * FROM products WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Product not found" });
    res.json(row);
  });
});

router.post("/", (req, res) => {
  const { name, batch_number, purchase_price, sale_price, quantity, discount, gst  } = req.body;

  db.run(
    `INSERT INTO products(name, batch_number, purchase_price, sale_price, quantity, discount, gst )
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, batch_number, purchase_price, sale_price, quantity, discount, gst ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

router.put("/:id", (req, res) => {
  const { name, batch_number, purchase_price, sale_price, quantity, discount, gst  } = req.body;

  db.run(
    `UPDATE products 
     SET name = ?, batch_number = ?, purchase_price = ?, sale_price = ?, quantity = ?, discount = ?, gst = ?
     WHERE id = ?`,
    [name, batch_number, purchase_price, sale_price, quantity, discount, gst, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "Product not found" });
      res.json({ updated: this.changes });
    }
  );
});

router.delete("/:id", (req, res) => {
  db.run("DELETE FROM products WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Product not found" });
    res.json({ deleted: this.changes });
  });
});

module.exports = router;
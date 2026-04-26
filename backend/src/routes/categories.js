const router = require("express").Router();
const prisma = require("../utils/prisma");

router.get("/", async (req, res) => {
  const categories = await prisma.category.findMany({
    where:   { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
  res.json(categories);
});

module.exports = router;

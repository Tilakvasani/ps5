const prisma = require("../src/utils/prisma");
prisma.admin.findMany({ select: { id: true, name: true, email: true, number: true, role: true, isActive: true } })
  .then(admins => {
    console.log("Current registered admins:");
    console.log(JSON.stringify(admins, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

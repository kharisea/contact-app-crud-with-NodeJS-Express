const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const {
  loadContact,
  findContact,
  addContact,
  cekDuplikat,
  deleteContact,
  updateContact,
} = require("./utils/contacts");
const { body, validationResult, check, cookie } = require("express-validator");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

const app = express();
const port = 3000;

//gunakan ejs
app.set("view engine", "ejs");
app.set("layout", "layouts/main-layout");

//Third party middleware
app.use(expressLayouts);

//built-in middlware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

//konfigurasi flash
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

app.get("/", (req, res) => {
  // const mahasiswa = [
  //   {
  //     nama: "Kharisma Ewa",
  //     email: "kharismaewaa@gmail.com",
  //   },
  //   {
  //     nama: "Ewa",
  //     email: "ewa07@gmail.com",
  //   },
  // ];
  res.render("index", {
    nama: "Kharis",
    title: "Halaman Home",
    // mahasiswa: mahasiswa,
  });
});
app.get("/about", (req, res) => {
  // res.send("Hello World! About");
  res.render("about", {
    title: "Halaman About",
    layout: "layouts/main-layout",
  });
});
app.get("/contact", (req, res) => {
  const contacts = loadContact();
  res.render("contact", {
    title: "Halaman Contact",
    layout: "layouts/main-layout",
    contacts,
    msg: req.flash("msg"),
  });
});
// Halaman Form Tambah Data
app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    title: "Form Tambah Data",
    layout: "layouts/main-layout",
  });
});

// Proses data kontak
app.post(
  "/contact",
  [
    body("nama").custom((value) => {
      const duplikat = cekDuplikat(value);
      if (duplikat) {
        throw new Error("Nama contact sudah digunakan");
      }
      return true;
    }),
    check("email", "Email tidak valid").isEmail(),
    check("noHP", "No HP tidak valid").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return res.status(400).json({ errors: errors.array() });
      res.render("add-contact", {
        title: "Form Tambah Data",
        layout: "layouts/main-layout",
        errors: errors.array(),
      });
    } else {
      addContact(req.body);
      // kirimkan flash
      req.flash("msg", "Data contact berhasil ditambahkan!");
      res.redirect("/contact");
    }
  }
);

// proses delete kontak
app.get("/contact/delete/:nama", (req, res) => {
  const contacts = findContact(req.params.nama);

  // jika kontak tidak ada
  if (!contacts) {
    res.status(404);
    res.send("<h1>404</h1>");
  } else {
    deleteContact(req.params.nama);
    // kirimkan flash
    req.flash("msg", "Data contact berhasil dihapus!");
    res.redirect("/contact");
  }
});

// halaman form ubah data kontak
app.get("/contact/edit/:nama", (req, res) => {
  const contacts = findContact(req.params.nama);
  res.render("edit-contact", {
    title: "Form Edit Data",
    layout: "layouts/main-layout",
    contacts,
  });
});

// proses ubah data
app.post(
  "/contact/update",
  [
    body("nama").custom((value, { req }) => {
      const duplikat = cekDuplikat(value);
      if (value !== req.body.oldNama && duplikat) {
        throw new Error("Nama contact sudah digunakan");
      }
      return true;
    }),
    check("email", "Email tidak valid").isEmail(),
    check("noHP", "No HP tidak valid").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return res.status(400).json({ errors: errors.array() });
      res.render("edit-contact", {
        title: "Form Ubah Data",
        layout: "layouts/main-layout",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      updateContact(req.body);
      // kirimkan flash
      req.flash("msg", "Data contact berhasil diubah!");
      res.redirect("/contact");
    }
  }
);

// Halaman Detail
app.get("/contact/:nama", (req, res) => {
  const contact = findContact(req.params.nama);
  res.render("Detail", {
    title: "Halaman Detail Contact",
    layout: "layouts/main-layout",
    contact,
  });
});
app.get("/product/:id", (req, res) => {
  res.send(
    `Product ID:  ${req.params.id} <br> Category ID: ${req.query.category}`
  );
});

app.use("/", (req, res) => {
  res.status(404);
  res.send("<h1>404</h1>");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// const http = require("http");
// const fs = require("fs");

// const renderHTML = (path, res) => {
//   fs.readFile(path, (err, data) => {
//     if (err) {
//       res.writeHead(404);
//       res.write("Error: File not found");
//     } else {
//       res.write(data);
//     }
//     res.end();
//   });
// };

// http
//   .createServer((req, res) => {
//     res.writeHead(200, {
//       "Content-Type": "text/html",
//     });

//     const url = req.url;

//     switch (url) {
//       case "/about":
//         renderHTML("./about.html", res);
//         break;
//       case "/contact":
//         renderHTML("./contact.html", res);
//         break;
//       default:
//         renderHTML("./index.html", res);
//         break;
//     }

//     // if (url === "/about") {
//     //   renderHTML("./about.html", res);
//     // } else if (url === "/contact") {
//     //   renderHTML("./contact.html", res);
//     // } else {
//     //   //   res.write("Hello World");
//     //   renderHTML("./index.html", res);
//     // }
//   })
//   .listen(3000, () => {
//     console.log("Server is Listening on port 300...");
//   });

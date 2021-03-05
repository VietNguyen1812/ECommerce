//Khoi tao cac gia tri
const express = require("express");
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const multer = require('multer');
const fs = require('fs');
const paypal = require('paypal-rest-sdk');
var paypalCus = require('paypal-rest-sdk');
require("dotenv").config();
const app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var check;
var roleuser;
var idp;
var IDPAYMENT;
var customeridp;
var sotienp;
var tienlaip;
var ngayguip;
var ngayrutp;
var sotienrutp;
var ischeckp;
var thoihanp;
var typep;

const PORT = process.env.PORT || 3000;

const initializePassport = require("./passportConfig");
initializePassport(passport);
app.use(express.static(__dirname + '/public'));
app.use(express.static('upload'));
app.use("/users/login", express.static('public'));
app.use("/categories/list", express.static('upload'));
// Parses details from a form
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

//Paypal
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
paypal.configure({
    mode: "sandbox", //sandbox or live
    'client_id':
        'AZBLUyX7OzkvodOqTr8vkmv_XnXPsBxwu2kQoANZPLkg7igUmhRNr53_PjdsvFHTUfLXx2kxuahyvkSH',
    'client_secret':
        'EM-qCrie2298qJzr0H81GfkBI16fQUVzH5xMwh9dAy0ynvOg8lq6uOniPJAyy3dG2zNf2EAww51N3Yu3'

});
//-------------------------------------------------PAYPAL PAYMENT CATEGORIES-------------------------------------------//
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        var dir = "./upload";

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        callback(null, dir);
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
        image = file.originalname;
    }
}); //thanhtoan.ejs
app.get("/categories/laisuat/:id", function (req, res) {

    pool1.connect(function (err, client, done) {
        if (err) {
            return console.error('error fetching client from pool', err);
        }
        var id = req.params.id;
        client.query("SELECT * FROM categories WHERE id='" + id + "'", function (err, result) {
            done();

            if (err) {
                res.end();
                return console.error('error running query', err);
            }
            thoihanp = result.rows[0].thoihan;
            typep = result.rows[0].type;

            res.render("thanhtoan.ejs", { ca: result.rows[0] });
        });
    });
});

app.post("/categories/laisuat/:id", (req, res) => {
    let { ketqua, txtId, laisuat, sotien, ngaygui } = req.body;
    let errors = [];
    console.log({
        sotien
    });
    idp = txtId;
    sotienp = sotien;
    tienlaip = ketqua;
    ngayguip = ngaygui;
    ngayrutp = "06/22/2020";
    console.log("(date '" + ngaygui + "' + interval '" + thoihanp + " " + typep + "s')");
    sotienrutp = ketqua;
    ischeckp = false;
    console.log({
        customeridp, idp, sotienp, tienlaip, ngayguip, ngayrutp, sotienrutp, ischeckp
    });
    const create_payment_json = {
        intent: "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success/" + sotien,
            "cancel_url": "http://localhost:3000/cancel/" + sotien
        },
        "transactions": [
            {
                "item_list": {
                    "items": [
                        {
                            "name": "item",
                            "sku": "item",
                            "price": sotien,
                            "currency": "USD",
                            "quantity": 1
                        }
                    ]
                },
                "amount": {
                    "currency": "USD",
                    "total": sotien
                },
                "description": "This is the payment description."
            }
        ]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });
});
app.get('/success/:sotien', (req, res) => {
    var sotien = req.params.sotien;
    var PayerID = req.query.PayerID;
    var paymentId = req.query.paymentId;
    const execute_payment_json = {
        payer_id: PayerID,
        transactions: [
            {
                amount: {
                    currency: "USD",
                    total: sotien
                }
            }
        ]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (
        error,
        payment
    ) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log("Get Payment Response");
            console.log(JSON.stringify(payment));

           var tam="(date '" + ngayguip + "' + interval '" + thoihanp + " " + typep + "s')";
            console.log({
                customeridp, idp, sotienp, tienlaip, ngayguip, ngayrutp, sotienrutp, ischeckp
            });
            pool1.connect(function (err, client, done) {
                if (err) {
                    return console.error('error fetching client from pool', err);
                }
                client.query("INSERT INTO payment(customerid, idp, sotien, tienlai, ngaygui, ngayrut, sotienrut, ischeck) VALUES('"+customeridp+"','"+idp+"','"+sotienp+"','"+tienlaip+"','"+ngayguip+"',(date '" + ngayguip + "' + interval '" + thoihanp + " " + typep + "s'),'"+sotienrutp+"','"+ischeckp+"')", function (err, result) {
                    console.log("INSERT INTO payment(customerid, idp, sotien, tienlai, ngaygui, ngayrut, sotienrut, ischeck) VALUES('"+customeridp+"','"+idp+"','"+sotienp+"','"+tienlaip+"','"+ngayguip+"',(date '" + ngayguip + "' + interval '" + thoihanp + " " + typep + "s'),'"+sotienrutp+"','"+ischeckp+"')");
                    done();    
                    if (err) {
                        res.end();
                        return console.error('error running query', err);
                    }
                });
            });
            
            res.render("success");
        }
    });
});
app.get('/cancel/:sotien', (req, res) => {
    res.render('cancel');
})
//--------------------------------------------------------PAYPAL ACCOUNT------------------------------------------------------//
//account_paypal.ejs
app.get("/users/paymentID", function (req, res) {
    res.render("account_paypal.ejs");
});
app.post("/users/paymentID", async (req, res) => {
    let { id_cus, id_client, id_secret } = req.body;
    let errors = [];

    if (!id_cus || !id_client || !id_secret) {
        errors.push({ message: "Please enter all fields" });
    }

    if (errors.length > 0) {
        res.render("account_paypal", { errors, id_cus, id_client, id_secret });
    } else {

        pool.query(
            `SELECT * FROM paypalcustomer
        WHERE customerid= $1`,
            [id_cus],
            (err, results) => {
                if (err) {
                    console.log(err);
                }
                console.log(results.rows);

                if (results.rows.length > 0) {
                    pool.connect(function (err, client, done) {
                        if (err) {
                            throw err;
                        }
                        client.query("update paypalcustomer set client_id='" + id_client + "' , client_secret= '" + id_secret + "' where customerid=" + id_cus, function (err, result) {
                            done();
                            if (err) {
                                throw err;
                            }
                            res.render("account_paypal.ejs");
                        })
                    })
                } else {
                    pool.query(
                        `INSERT INTO paypalcustomer (customerid, client_id, client_secret)
                VALUES ($1, $2, $3)`,
                        [id_cus, id_client, id_secret],
                        (err, results) => {
                            if (err) {
                                throw err;
                            }
                            res.render("account_paypal.ejs");
                        });
                }
            }
        );
    }

});
//--------------------------------------------------------PAYPAL TRANSACTIONS CATECATEGORIES----------------------------------//
var id_payment;
//thanhtoan.ejs
app.get("/categories/chuyentien/:id_Cus", function (req, res) {
    pool1.connect(function (err, client, done) {
        if (err) {
            return console.error('error fetching client from pool', err);
        }
        var id_Cus = req.params.id_Cus;
        client.query("SELECT * FROM payment WHERE customerid='" + id_Cus + "'", function (err, result) {
            done();

            if (err) {
                res.end();
                return console.error('error running query', err);
            }
            res.render("transaction.ejs", { lichsugiaodich: result });
        });
    });
});
app.get("/categories/chtien/:id_payment", function (req, res) {

    IDPAYMENT = req.params.id_payment;
    var id_payment = req.params.id_payment;
    var ngayruthm="06/26/2020";
    console.log(id_payment);
    pool1.connect(function (err, client, done) {
        if (err) {
            return console.error('error fetching client from pool', err);
        }
        client.query("Select * from payment where id=" + id_payment, function (err, result) {
            console.log(result.rows[0].id);
            console.log(result.rows[0].customerid);
            console.log(result.rows[0].sotien);
            console.log(result.rows[0].tienlai);
            console.log(result.rows[0].ngaygui);
            console.log(result.rows[0].ngayrut);
            idp = result.rows[0].idp;
            customeridp = result.rows[0].customerid;
            sotienp = result.rows[0].sotien;
            tienlaip = result.rows[0].tienlai;
            ngayguip = result.rows[0].ngaygui;
            ngayrutp = result.rows[0].ngayrut;
            sotienrutp = result.rows[0].sotienrut;
            ischeckp = result.rows[0].ischeck;

            done();
            if (err) {
                throw err;
            }

            var tempsecret;
            var tempid;
            console.log({
                customeridp, idp, sotienp, tienlaip, ngayguip, ngayrutp, sotienrutp, ischeckp
            });

            pool1.connect(function (err, client, done) {
                if (err) {
                    return console.error('error fetching client from pool', err);
                }
                client.query("Select * from paypalcustomer where customerid=" + customeridp, function (err, result) {
                    tempid = result.rows[0].client_id;
                    tempsecret = result.rows[0].client_secret;
                    done();
                    if (err)
                        throw err;

                    paypalCus.configure({
                        mode: "sandbox", //sandbox or live
                        'client_id':
                            tempid,
                        'client_secret':
                            tempsecret
                    });
                    const create_payment_json = {
                        intent: "sale",
                        "payer": {
                            "payment_method": "paypal"
                        },
                        "redirect_urls": {
                            "return_url": "http://localhost:3000/successs/" + tienlaip,
                            "cancel_url": "http://localhost:3000/cancels/" + tienlaip
                        },
                        "transactions": [
                            {
                                "item_list": {
                                    "items": [
                                        {
                                            "name": "item",
                                            "sku": "item",
                                            "price": tienlaip,
                                            "currency": "USD",
                                            "quantity": 1
                                        }
                                    ]
                                },
                                "amount": {
                                    "currency": "USD",
                                    "total": tienlaip
                                },
                                "description": "This is the payment description."
                            }
                        ]
                    };

                    paypalCus.payment.create(create_payment_json, function (error, payment) {
                        if (error) {
                            throw error;
                        } else {
                            for (let i = 0; i < payment.links.length; i++) {
                                if (payment.links[i].rel === 'approval_url') {
                                    res.redirect(payment.links[i].href);
                                }
                            }
                        }
                    });

                })
            })
        })
    })

});
app.get('/successs/:tienlai', (req, res) => {
    var tienlai = req.params.tienlai;
    var PayerID = req.query.PayerID;
    var paymentId = req.query.paymentId;
    const execute_payment_json = {
        payer_id: PayerID,
        transactions: [
            {
                amount: {
                    currency: "USD",
                    total: tienlaip
                }
            }
        ]
    };

    paypalCus.payment.execute(paymentId, execute_payment_json, function (
        error,
        payment
    ) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log("Get Payment Response");
            console.log(JSON.stringify(payment));
            console.log({
                customeridp, idp, sotienp, tienlaip, ngayguip, ngayrutp, sotienrutp, ischeckp
            });
            pool.connect(function (err, client, done) {
                if (err) {
                    throw err;
                }
                client.query("update payment set ischeck=true where id=" + IDPAYMENT, function (err, result) {
                    done();
                    if (err) {
                        throw err;
                    }
                    res.render("success.ejs");
                })
            })
        }
    });
});
app.get('/cancels/:tienlai', (req, res) => {
    res.render('cancel.ejs');
})
app.get("/apikhachhang/list", function (req, res) {
    pool1.connect(function (err, client, done) {
        if (err) {
            return console.error('error fetching client from pool', err);
        }
        client.query('SELECT DISTINCT users.id, users.name, users.email, users.password FROM payment INNER JOIN users ON payment.customerid=users.id AND payment.ischeck=false ', function (err, result) {
            done();

            if (err) {
                res.end();
                return console.error('error running query', err);
            }
            //console.log(result.rows[0].email);
            res.render("listapikhachhang.ejs", { danhsachapi: result });
        });
    });
});
//----------------------------------------------------QUẢN LÝ CATEGORY----------------------------------------------//

//categories.ejs
app.get("/categories", async (req, res) => {
    res.render("categories_insert.ejs");
});
app.post("/categories", async (req, res) => {
    let { name, laisuat, time, type } = req.body;
    let errors = [];
    console.log({
        name,
        laisuat,
        time,
        type

    });

    if (!name || !laisuat || !time || !type) {
        errors.push({ message: "Please enter all fields" });
    }

    if (errors.length > 0) {
        res.render("categories", { errors, name, laisuat, time, type });
    } else {

        pool.query(
            `SELECT * FROM categories
        WHERE name = $1`,
            [name],
            (err, results) => {
                if (err) {
                    console.log(err);
                }
                console.log(results.rows);

                if (results.rows.length > 0) {
                    return res.render("categories", {
                        message: "Name already registered"
                    });
                } else {
                    pool.query(
                        `INSERT INTO categories (name, laisuat, time, type)
                VALUES ($1, $2, $3, $4)
                RETURNING id, laisuat`,
                        [name, laisuat, time, type],
                        (err, results) => {
                            if (err) {
                                throw err;
                            }
                            console.log(results.rows);
                            req.flash("success_msg", "Thêm thành công");

                        }
                    );
                }
            }
        );
    }
});
var upload = multer({ storage: storage }).array("files", 12);
var image;
//function upload
app.post('/upload', (req, res, next) => {
    upload(req, res, function (err) {


        if (err) {
            return res.send("Something gone wrong");

        }
        res.send("Upload Completed");
    });
});
//listcategories.ejs
app.get("/categories/list", function (req, res) {
    pool1.connect(function (err, client, done) {
        if (err) {
            return console.error('error fetching client from pool', err);
        }
        client.query('SELECT * FROM categories ORDER BY id ASC', function (err, result) {
            done();

            if (err) {
                res.end();
                return console.error('error running query', err);
            }
            //console.log(result.rows[0].email);
            res.render("listcategories.ejs", { danhsachca: result,roleuser});
        });
    });
});

//categories_insert.ejs
app.get("/categories/them", function (req, res) {
    //show form
    res.render("categories_insert.ejs");
});
app.post("/categories/them", async function (req, res) {

    upload(req, res, function (err) {


        if (err) {
            return res.send("Something gone wrong");

        }

        let { name, laisuat, thoihan, type } = req.body;

        let errors = [];

        console.log({
            name,
            laisuat,
            thoihan,
            type,
            image
        });

        if (!name || !laisuat || !thoihan || !type) {
            errors.push({ message: "Please enter all fields" });
        }

        if (errors.length > 0) {
            res.render("categories_insert", { errors, name, laisuat, thoihan, type });
        } else {
            // Validation passed
            pool.query(
                `SELECT * FROM categories
          WHERE name = $1`,
                [name],
                (err, results) => {
                    if (err) {
                        console.log(err);
                    }
                    console.log(results.rows);

                    pool.query(
                        `INSERT INTO categories (name, laisuat, thoihan, type, image)
                  VALUES ($1, $2, $3, $4, $5)
                  RETURNING id, laisuat`,
                        [name, laisuat, thoihan, type, image],
                        (err, results) => {
                            if (err) {
                                throw err;
                            }
                            console.log(results.rows);
                            res.redirect("/categories/list");
                        }
                    );
                }
            );
        }
    });
});
//categories_edit.ejs
app.get("/categories/sua/:id", function (req, res) {
    pool1.connect(function (err, client, done) {
        if (err) {
            return console.error('error fetching client from pool', err);
        }
        var id = req.params.id;
        client.query("SELECT * FROM categories WHERE id='" + id + "'", function (err, result) {
            done();

            if (err) {
                res.end();
                return console.error('error running query', err);
            }
            console.log(result.rows[0].isadmin);
            res.render("categories_edit.ejs", { ca: result.rows[0] });
        });
    });
});

app.post("/categories/sua", urlencodedParser, function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            return res.send("Something gone wrong");

        }
        pool1.connect(function (err, client, done) {
            if (err) {
                return console.error('error fetching client from pool', err);
            }
            var hoten = req.body.name;
            var laisuat = req.body.laisuat;
            var thoihan = req.body.thoihan;
            var type = req.body.type;
            var id = req.body.txtId;
            console.log("UPDATE categories set name='" + hoten + "', laisuat='" + laisuat + "', thoihan='" + thoihan + "', type='" + type + "', image='" + image + "' WHERE id='" + id + "'");
            client.query("UPDATE categories set name='" + hoten + "', laisuat='" + laisuat + "', thoihan='" + thoihan + "', type='" + type + "', image='" + image + "' WHERE id='" + id + "'", function (err, result) {
                done();

                if (err) {
                    res.end();
                    return console.error('error running query', err);
                }
                res.redirect("/categories/list");
            });
        })
    });
});
//function delete id_category
app.get("/categories/xoa/:id", function (req, res) {
    pool1.connect(function (err, client, done) {
        if (err) {
            return console.error('error fetching client from pool', err);
        }
        var id = req.params.id;

        client.query("DELETE FROM categories WHERE id='" + id + "'", function (err, result) {
            done();

            if (err) {
                res.end();
                return console.error('error running query', err);
            }
            res.redirect("../../categories/list");
        });
    })
});


//---------------------------------------------------------------USERS------------------------------------------------//
app.use(
    session({
        // Key we want to keep secret which will encrypt all of our information
        secret: process.env.SESSION_SECRET,
        // Should we resave our session variables if nothing has changes which we dont
        resave: false,
        // Save empty value if there is no vaue which we do not want to do
        saveUninitialized: false
    })
);
// Funtion inside passport which initializes passport
app.use(passport.initialize());
// Store our variables to be persisted across the whole session. Works with app.use(Session) above
app.use(passport.session());
app.use(flash());

app.get("/", (req, res) => {
    res.render("index");
});
app.get('/about', (req, res) => {
    res.render('about.ejs');
});
app.get("/users/register", checkAuthenticated, (req, res) => {
    res.render("register.ejs");
});
app.post("/users/register", async (req, res) => {
    let { name, email, password, password2, isadmin } = req.body;

    let errors = [];

    console.log({
        name,
        email,
        password,
        password2,
        isadmin
    });

    if (!name || !email || !password || !password2) {
        errors.push({ message: "Please enter all fields" });
    }

    if (password.length < 6) {
        errors.push({ message: "Password must be a least 6 characters long" });
    }

    if (password !== password2) {
        errors.push({ message: "Passwords do not match" });
    }

    if (errors.length > 0) {
        res.render("register", { errors, name, email, password, password2 });
    } else {
        hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);
        // Validation passed
        pool.query(
            `SELECT * FROM users
        WHERE email = $1`,
            [email],
            (err, results) => {
                if (err) {
                    console.log(err);
                }
                console.log(results.rows);

                if (results.rows.length > 0) {
                    return res.render("register", {
                        message: "Email already registered"
                    });
                } else {
                    pool.query(
                        `INSERT INTO users (name, email, password, isadmin)
                VALUES ($1, $2, $3, $4)
                RETURNING id, password`,
                        [name, email, hashedPassword, isadmin],
                        (err, results) => {
                            if (err) {
                                throw err;
                            }
                            console.log(results.rows);
                            req.flash("success_msg", "You are now registered. Please log in");
                            res.redirect("/users/login");
                        }
                    );
                }
            }
        );
    }
});
app.get("/users/login", checkAuthenticated, (req, res) => {
    // flash sets a messages variable. passport sets the error message

    res.render("login.ejs");
});
app.post("/users/login", passport.authenticate("local", {
    successRedirect: "/users/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true
})
);
app.get("/users/dashboard", checkNotAuthenticated, (req, res) => {
    console.log(req.isAuthenticated());
    customeridp = req.user.id;
    roleuser=req.user.isadmin;
    res.render("dashboard", { user: req.user.name, role: req.user.isadmin });
});
app.get("/users/logout", (req, res) => {
    req.logout();
    res.render("index");
});



function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/users/dashboard");
    }
    next();
}
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/users/login");

}
var pg = require('pg');
const { result } = require("underscore");
var config = {
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    max: 10,
    idleTimeoutMillis: 30000,
};
var pool1 = new pg.Pool(config);

app.get("/khachhang/list", function (req, res) {
    pool1.connect(function (err, client, done) {
        if (err) {
            return console.error('error fetching client from pool', err);
        }
        client.query('SELECT * FROM users ORDER BY id ASC', function (err, result) {
            done();

            if (err) {
                res.end();
                return console.error('error running query', err);
            }
            //console.log(result.rows[0].email);
            res.render("listcustomer.ejs", { danhsach: result });
        });
    });

});
app.get("/khachhang/them", function (req, res) {
    //show form
    res.render("customer_insert.ejs");
});
app.post("/khachhang/them", async function (req, res) {
    let { name, email, password, password2, isadmin } = req.body;

    let errors = [];

    console.log({
        name,
        email,
        password,
        password2,
        isadmin
    });

    if (!name || !email || !password || !password2) {
        errors.push({ message: "Please enter all fields" });
    }

    if (password.length < 6) {
        errors.push({ message: "Password must be a least 6 characters long" });
    }

    if (password !== password2) {
        errors.push({ message: "Passwords do not match" });
    }

    if (errors.length > 0) {
        res.render("customer_insert", { errors, name, email, password, password2 });
    } else {
        hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);
        // Validation passed
        pool.query(
            `SELECT * FROM users
        WHERE email = $1`,
            [email],
            (err, results) => {
                if (err) {
                    console.log(err);
                }
                console.log(results.rows);

                if (results.rows.length > 0) {
                    return res.render("customer_insert", {
                        message: "Email already existed"
                    });
                } else {
                    pool.query(
                        `INSERT INTO users (name, email, password, isadmin)
                VALUES ($1, $2, $3, $4)
                RETURNING id, password`,
                        [name, email, hashedPassword, isadmin],
                        (err, results) => {
                            if (err) {
                                throw err;
                            }
                            console.log(results.rows);
                            req.flash("success_msg", "Thêm thành công!");
                            res.redirect("/khachhang/list");
                        }
                    );
                }
            }
        );
    }
});
app.get("/khachhang/sua/:id", function (req, res) {
    pool1.connect(function (err, client, done) {
        if (err) {
            return console.error('error fetching client from pool', err);
        }
        var id = req.params.id;
        client.query("SELECT * FROM users WHERE id='" + id + "'", function (err, result) {
            done();

            if (err) {
                res.end();
                return console.error('error running query', err);
            }
            console.log(result.rows[0].isadmin);
            res.render("customer_edit.ejs", { cus: result.rows[0] });
        });
    });
});
app.post("/khachhang/sua", urlencodedParser, function (req, res) {
    pool1.connect(function (err, client, done) {
        if (err) {
            return console.error('error fetching client from pool', err);
        }
        var hoten = req.body.name;
        var email = req.body.email;
        var password = req.body.password;
        var isadmin = req.body.isadmin;
        var id = req.body.txtId;

        client.query("UPDATE users set name='" + hoten + "', email='" + email + "', password='" + password + "', isadmin='" + isadmin + "' WHERE id='" + id + "'", function (err, result) {
            done();

            if (err) {
                res.end();
                return console.error('error running query', err);
            }
            res.redirect("/khachhang/list");
        });
    })
});
app.get("/khachhang/xoa/:id", function (req, res) {
    pool1.connect(function (err, client, done) {
        if (err) {
            return console.error('error fetching client from pool', err);
        }
        var id = req.params.id;

        client.query("DELETE FROM users WHERE id='" + id + "'", function (err, result) {
            done();

            if (err) {
                res.end();
                return console.error('error running query', err);
            }
            res.redirect("../../khachhang/list");
        });
    })
});

//---------------------------------------------------------------------------------------------//

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const express = require("express");
const app = express()
const mysql = require("mysql")
const bodyParser = require('body-parser')
var path = require('path');
var fileUpload = require('express-fileupload');
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var passport = require('passport');
var flash    = require('connect-flash');

require('./models/passport.js')(passport);
//app.use("/bootstrap",express.static(__dirname+"/bootstrap"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')
app.use(fileUpload());
fs = require('fs');

///app.use(express.bodyParser());
//app.use(express.bodyParser({uploadDir:'./upload_images'}));

con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "sistema"
});


app.listen(3000, function() {
    console.log("Listening on 3000 ...");
});
app.use(session({
    secret: 'kodizimcomisrunning',
    resave: true,
    saveUninitialized: true
 } )); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


// routes ======================================================================
require('./routes.js')(app, passport);
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', indexRouter);
//app.use('/users', usersRouter);


// catch 404 and forward to error handler

app.get('/', function(req, res, next) {
    con.query("SELECT * FROM productos limit 4", function(err, results) {
        res.render('index', { title: 'Express', productos: results });
    })
});

//vista producto
app.get('/productos', function(req, res, next) {
    con.query("SELECT * FROM productos", function(err, results) {
        res.render('productos', { title: 'Productos', productos: results });
        console.log(results);
    })
}); //termina vista productos


app.get('/about', function(req, res, next) {
    res.render('about', { title: 'About' });
});

app.get('/contacto', function(req, res, next) {
    res.render('contacto', { title: 'Contacto' });
});

app.get('/carrito', function(req, res, next) {
    res.render('carrito', { title: 'Carrito' });
});

app.get('/login', function(req, res, next) {
    res.render('login', { title: 'Login' });
});
app.get('/signup', function(req, res, next) {
    res.render('signup', { title: 'Signup' });
});


app.get("/manuales" , function(req, res) {
    //res.send("Hola Mundo");
    //res.sendFile(__dirname+"/index.html");
    con.query("select * from productos", function(e, r) {
        res.render("manuales.ejs", { productos: r });
    });
});
app.post("/addcomen" , function(req, res) {
    var cliente = req.body.comentario.nombre;
    var correo = req.body.comentario.correo;
    var comentario = req.body.comentario.comentario;
    var id = req.body.comentario.id;
    con.query("insert into comentario (cliente,correo,comentario,id) values ('" + cliente + "','" + correo + "','" + comentario + "','" + id + "')", function(e, r) {});
    res.redirect("/productos");
});

//CODIGO PARA EL APARTADO DE COMENTARIOS DE LA PARTE ADMINISTRATIVA
//vista comentarios
app.get('/comentario' ,function(req, res, next) {
    con.query("SELECT * FROM comentario join productos on comentario.id=productos.id", function(err, results) {
        res.render('comentario', { title: 'comentario', comentario: results });
        console.log(results);
    })
});

app.get("/delete_comen/:comentarioid" ,function(req, res) {
    con.query("delete from comentario where id_comen=" + req.params.comentarioid, function(err, results) {});
    res.redirect("/comentario");
});
app.get("/agregar" , function(req, res, next) {
    res.render("agregar.ejs", {});
});
app.post("/save", function(req, res) {
    var nombre = req.body.nombre;
    var descripcion = req.body.descripcion;
    var precio = req.body.precio;
    var cantidad = req.body.cantidad;
    //var imagen= req.body.imagen;
    var autor = req.body.autor;
    var tecnologia = req.body.tecnologia;
    //var archivo= req.body.productos.archivo;
    //ejemplo
    var file = req.files.uploaded_image;
    var image_name = file.name;
    var file = req.files.uploaded_pdf;
    var pdf_name = file.name;

    if (file.mimetype == "application/pdf" || file.mimetype == "image/jpg" || file.mimetype == "image/png" || file.mimetype == "image/jpeg") {

        file.mv('public/images/upload_images/' + file.name, function(err) {

            if (err)

                return res.status(500).send(err);

            con.query("insert into productos (nombre,descripcion,precio,cantidad,imagen,autor,tecnologia,archivo) values ('" + nombre + "','" + descripcion + "','" + precio + "','" + cantidad + "','" + pdf_name + "','" + autor + "','" + tecnologia + "','" + image_name + "')", function(e, r) {});
            res.redirect("/manuales");

        })
    }
});
app.get("/editar/:productosid" , function(req, res, next) {
    con.query("select * from productos where id=" + req.params.productosid, function(e, r) {
        res.render("editar", { title: 'Editar', productos: r[0] });
    });
});

app.post("/update", function(req, res) {
    var id = req.body.id;
    var cantidad = req.body.cantidad;
    var tecnologia = req.body.tecnologia;
    var nombre = req.body.nombre;
    //var imagen= req.body.productos.imagen;
    var descripcion = req.body.descripcion;
    var precio = req.body.precio;
    var autor = req.body.autor;
    //var archivo= req.body.productos.archivo;

    var file = req.files.archivo;
    var image_name = file.name;
    var file = req.files.imagen;
    var pdf_name = file.name;

    if (file.mimetype == "application/pdf" || file.mimetype == "image/jpg" || file.mimetype == "image/png" || file.mimetype == "image/jpeg") {

        file.mv('public/images/upload_images/' + file.name, function(err) {

            if (err)

                return res.status(500).send(err);
            con.query(" update productos set precio=\"" + precio + "\",cantidad=\"" + cantidad + "\",tecnologia=\"" + tecnologia + "\",nombre=\"" + nombre + "\",imagen=\"" + pdf_name + "\",descripcion=\"" + descripcion + "\",autor=\"" + autor + "\",archivo=\"" + image_name + "\" where id=" + id, function(err, results) {});
            res.redirect("/manuales");
        })
    }
});

app.get("/delete/:productosid" , function(req, res) {
    con.query("delete from productos where id=" + req.params.productosid, function(err, results) {});
    res.redirect("/manuales");
});
app.get('/clientes',function(req,res){
  res.render('clientes', { title: 'Clientes' });   
});
app.get('/ventas',function(req,res){
  res.render('ventas', { title: 'Ventas' });   
});

app.get("/descripcion/:productosid", function(req, res, next) {
    con.query("SELECT * FROM productos where id=" + req.params.productosid, function(e, r) {
        res.render('descripcion', { title: 'Descripcion', productos: r[0] }); // , Zapatos:results
    })
});

app.get("/descripcion/:productosid", function(req, res, next) {
    con.query("SELECT * FROM comentario  where id=" + req.params.productosid, function(e, r) {
        res.render('descripcion', { title: 'Descripcion', comentario: r[0] }); // , Zapatos:results
    })
});
app.get('/loginu', function(req, res, next) {
    res.render('loginu', { title: 'Admin' });
  });
  
  
  app.post('/test/submit', function(req, res, next) {
      db.query("SELECT * FROM users where email=" + "'" + req.body.email + "' and password="  + "'" + req.body.pass + "'" ,
               function getValue(erError, aRows, aFields){
               if ( req.body.email == "keren@gmail.com" && req.body.pass =="123" )
               {
                   res.redirect('/');
               }
               else
               {
                   res.redirect('/manuales');
               }
  
                      
      });		
               
               
  });

//TERMINA CODIGO PARA EL APARTADO DE COMENTARIOS DE LA PARTE ADMINISTRATIVA

//module.exports = app;
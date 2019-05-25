const nodeoutlook = require('nodejs-nodemailer-outlook');
const LocalStrategy = require('passport-local');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const favicon = require('serve-favicon');
const passport = require('passport');
const mongoose = require('mongoose');
const express = require('express');
const moment = require('moment');
const Area = require('./models/area');
const State = require('./models/medicento_state');
const Query = require('./models/query');
const path = require('path');
const adminUser = require('./models/adminUser');
const City = require('./models/medicento_city');
const ajaxRoute = require('./routes/ajax');

const Code = require('./models/usercode');

const USer = require('./models/user');

const Order = require('./models/SalesOrder');

const SalesPerson = require('./models/sperson');

const Pharmacy = require('./models/pharmacy');

const SalesOrder = require('./models/SalesOrderItem');

const vpimedicine = require('./models/vpimedicine');

const app = express();

const MONGODB_URI = 'mongodb://GiteshMedi:shastri1@ds263590.mlab.com:63590/medicento';

const serviceAccount = require('./medicentomessaging-firebase-adminsdk-rkrq1-547a4adcde.json');

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://medicentomessaging.firebaseio.com'
});

mongoose.connect(MONGODB_URI);
mongoose.Promise = global.Promise;

app.use(
	require('express-session')({
		secret: 'Gitesh Secret Page',
		resave: false,
		saveUninitialized: false
	})
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(adminUser.authenticate()));
passport.serializeUser(adminUser.serializeUser());
passport.deserializeUser(adminUser.deserializeUser());

app.use(favicon(path.join(__dirname, 'public/assets/img', 'logo.ico')));

app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extended: true
	})
);

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));
app.locals.moment = moment;

var active = 'index';

app.use('/ajax', ajaxRoute);

app.get('/distributor_mapping', (req, res, next) => {
	State.find({})
		.sort({ name: 1 })
		.exec()
		.then((states) => {
			let context = {
				total_distributor: 10,
				unmapped_distributor: 10,
				states: states
			};
			res.render('distributor', { context: context });
		})
		.catch((err) => {
			console.log(err);
			res.redirect('/');
		});
});

app.get('/medicento_area', (req, res, next) => {
	State.find({})
		.sort({ name: 1 })
		.exec()
		.then((states) => {
			City.find({ state: req.query.state_id })
				.exec()
				.then((cities) => {
					let context = {
						states: states,
						cities: cities
					};
					res.render('medicento_area', { context: context });
				})
				.catch((err) => {
					console.log(err);
					res.redirect('/');
				});
		})
		.catch((err) => {
			console.log(err);
			res.redirect('/');
		});
});

app.use('/retriveItems', function(req, res, next) {
	var dict = {};

	function sortProperties(obj) {
		// convert object into array
		var sortable = [];
		for (var key in obj) if (obj.hasOwnProperty(key)) sortable.push([ key, obj[key] ]); // each item is an array in format [key, value]

		// sort items by value
		sortable.sort(function(a, b) {
			var x = a[1],
				y = b[1];
			return x < y ? 1 : x > y ? -1 : 0;
		});
		return sortable; // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
	}
	SalesOrder.find().exec().then(function(order_items) {
		for (var i in order_items) {
			var key = order_items[i].medicento_name;
			var quant = order_items[i].quantity;
			if (typeof dict[key] !== 'undefined') {
				dict[key] = dict[key] + quant;
			} else {
				dict[key] = quant;
			}
		}
		dict = sortProperties(dict);
		res.status(200).json(dict);
	});
});

app.use('/history', (req, res, next) => {
	active = 'history';
	Order.find()
		.populate('pharmacy_id')
		.exec()
		.then((orders) => {
			res.render('history', {
				orders: orders,
				active: active
			});
		})
		.catch((err) => {
			console.log(err);
		});
});

app.get('/allArea', (req, res, next) => {
	console.log('areas');
	Area.find()
		.sort({ _id: -1 })
		.exec()
		.then((areas) => {
			res.render('areas', { areas: areas, moment: moment });
		})
		/* 
  Area.remove({area_state: 'Karnataka', area_city: 'Bangalore Rural' })
  .exec()
  .then(doc => {
    console.log(doc);
      res.redirect('/');
  }) */
		.catch((err) => {
			console.log(err);
			res.redirect('/');
		});
});

app.post('/deleteArea', (req, res, next) => {
	/*  Area.findByIdAndRemove( '5c4cb632ec04c105a2969c82' , (err, doc) => {
      if(err) {
          console.log(err);
          res.status(200).json({message : "error occured"});        
      } else {
          res.status(200).json({message : "document deleted"});
      }
  }); */
});

app.get('/removePharmacy', (req, res, next) => {
	USer.find({ usercode: req.query.usercode, useremail: req.query.useremail })
		.exec()
		.then((doc) => {
			console.log(doc[0]._id);
			SalesPerson.find({ user: doc[0]._id })
				.populate('user')
				.populate('Allocated_Pharma')
				.exec()
				.then((sperson) => {
					console.log(sperson);
					res.status(200).json({ message: 'user found', sperson: sperson[0] });
				})
				.catch((err) => {
					console.log(err);
					res.status(200).json({ message: 'not found' });
				});
		})
		.catch((err) => {
			console.log(err);
			res.status(200).json({ message: 'not found' });
		});
});

app.get('/showPharmacy', (req, res, next) => {
	Pharmacy.find({ area: '5c51d855f846e70257eb1973' })
		.exec()
		.then((doc) => {
			console.log(doc);
			res.status(200).json({ message: 'user found', sperson: doc });
		})
		.catch((err) => {
			console.log(err);
			res.status(200).json({ message: 'err found' });
		});
});

app.get('/updatePharmacy', (req, res, next) => {
	Pharmacy.updateMany(
		{},
		{
			$set: {
				gst_license: '-',
				drug_license: '-',
				email: '-',
				contact: '-',
				owner_name: '-',
				pincode: '-',
				created_at: Date.now(),
				distributor: '-',
				last_updated: Date.now()
			}
		}
	)
		.exec()
		.then((doc) => {
			console.log(doc);
			res.status(200).json({ message: 'updated' });
		})
		.catch((err) => {
			console.log(err);
			res.status(200).json({ message: 'err found' });
		});
});

app.get('/addPharmacy', (req, res, next) => {
	var pharmas = [
		{
			'u.usercode': '',
			'u.useremail': '',
			PharmacyName: 'New Kaveri Medical',
			PharmacyAddress: '#3/7, New No-3, 3rd cross, Madiwala, Hosur Main Road',
			PharmacyPhone1: '',
			PharmacyPhone2: '',
			PharmacyPhone3: '',
			EmailID: '',
			PharmacyPincode: 560068,
			Area: 'BTM',
			TulsiPharmacy: 'YES',
			PharmacyCity: 'Bengaluru',
			PharmacyState: 'Karnataka',
			'D/LNumber': 'KA/B06/20B/111133\nKA/B06/21B/111134',
			'Tin/Pannumber': 29961132638,
			GSTNumber: ''
		}
	];

	for (i = 0; i < pharmas.length; i++) {
		Code.find()
			.exec()
			.then((doc) => {
				var user = new USer({
					useremail: '9886676133',
					phone: '9886676133',
					usercode: doc[0].code
				});
				user.save();
				var pharm = new Pharmacy({
					pharma_name: 'New Kaveri Medical',
					pharma_address: '#3/7, New No-3, 3rd cross, Madiwala, Hosur Main Road',
					gst_license: '29AFJPA4531Q1Z3',
					drug_license: 'KA/Do6/110267',
					distributor: 'tulsi'
				});
				pharm.save();
				var salesPerson = new SalesPerson({
					Name: pharm.pharma_name,
					Allocated_Pharma: pharm,
					user: user
				});
				salesPerson.save();
				console.log(salesPerson);
				doc[0].code = doc[0].code + 1;
				doc[0].save();
				res.status(200).json({ message: 'user created', sperson: salesPerson });
			})
			.catch((err) => {
				console.log(err);
				res.redirect('/');
			});
	}
});

app.get('/addArea', (req, res, next) => {
	var area = new Area({
		area_name: 'Koramangala',
		area_city: 'Bangalore',
		area_state: 'Karnataka',
		area_pincode: '560034'
	});
	area.save();
	res.status(200).json({ message: 'data saved', data: area });
});

app.get('/queries', (req, res, next) => {
	Query.find()
		.exec()
		.then((queries) => {
			res.render('queries', { queries: queries, moment: moment });
		})
		.catch((err) => {
			console.log(err);
			res.redirect('/');
		});
});

app.use('/findPharma', (req, res, next) => {
	SalesPerson.find({ _id: req.body.sid })
		.populate('user')
		.populate('Allocated_Pharma')
		.exec()
		.then((doc) => {
			console.log(doc);
			res.status(200).json(doc);
		})
		.catch((err) => {
			res.redirect('/');
		});
});

app.post('/pharmaandsales', (req, res, next) => {
	SalesPerson.findByIdAndDelete(req.body.sid)
		.exec()
		.then((doc) => {
			Pharmacy.findByIdAndDelete(doc.Allocated_Pharma)
				.exec()
				.then((docp) => {
					res.status(200).json({ s: doc, p: docp });
				})
				.catch((err) => {
					res.status(404).json(err);
				});
		})
		.catch((err) => {
			res.status(404).json(err);
		});
});

app.use('/inventory', (req, res, next) => {
	active = 'inventory';
	vpimedicine
		.find()
		.exec()
		.then((medicines) => {
			res.render('inventory', {
				medicines: medicines,
				active: active
			});
		})
		.catch((err) => {
			console.log(err);
			res.render('inventory');
		});
});

app.use('/marketing', (req, res, next) => {
	active = 'marketing';
	res.render('marketing', {
		active: active
	});
});

app.get('/mailOrder', (req, res, next) => {
	Order.findById(req.query.order_id).populate('pharmacy_id').populate('order_items').exec().then((doc) => {
		SalesPerson.findById(doc.sales_person_id).populate('user').exec().then((salesPerson) => {
			time = moment(doc.created_at).add(30, 'm');
			time1 = moment(time).add(5, 'h');
			var csv = 'Party Code, Item Code, Item Name, Qty\n';
			console.log(doc);
			content = 'Order From ' + doc.pharmacy_id.pharma_name + ' on ' + moment(time1).format('LLLL');
			message =
				'<h3>From Admin Panel :</h3><h3>Pharmacy Name :' +
				doc.pharmacy_id.pharma_name +
				'</h3><h5>Medicine List : </h5>';
			message += '<table border="1"><tr><th>Item Name</th><th><Item Code</th><th>Quantity</th></tr>';
			doc.order_items.forEach((items) => {
				csv +=
					salesPerson.user.useremail +
					',' +
					items.code +
					',' +
					items.medicento_name +
					',' +
					items.quantity +
					'\n';
				message +=
					'<tr><td>' +
					items.medicento_name +
					'</td><td>' +
					items.code +
					'</td><td>' +
					items.quantity +
					'</td></tr>';
			});
			nodeoutlook.sendEmail({
				auth: {
					user: 'Team.medicento@outlook.com',
					pass: 'med4lyf@51'
				},
				from: 'Team.medicento@outlook.com',
				to: 'giteshshastri96@gmail.com',
				subject: content,
				html: message,
				attachments: [
					{
						filename:
							'SalesOrder_Medicento_' + doc.pharma_name + '_' + moment(time1).format('LLL') + '.csv',
						content: csv
					}
				]
			});
		});
		res.status(200).json('Mail Sent');
	});
});

app.post('/changeStatus', (req, res, next) => {
	Order.findById(req.body.order_id).exec().then((doc) => {
		doc.status = req.body.status;
		doc.save();
		res.status(200).json(doc);
	});
});

app.post('/changeSate', function(req, res) {
	Order.findById(req.body.order_id).exec().then((doc) => {
		doc.state = req.body.state;
		doc.save();
		res.status(200).json(doc);
	});
});

app.get('/login', (req, res, next) => {
	res.render('login');
});

app.post('/login', (req, res, next) => {
	if ((req.body.username = 'Medi-Team-Admin' && req.body.password)) {
		res.redirect('/');
	}
});

app.get('/signUp', (req, res, next) => {
	res.render('signup');
});

app.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

app.use('/', (req, res, next) => {
	active = 'index';
	activeOrders = [];
	cancelOrders = [];
	returnsOrders = [];
	deliveredOrders = [];
	unDeliveredOrders = [];
	Order.find()
		.populate('pharmacy_id')
		.populate('order_items')
		.exec()
		.then((orders) => {
			orders.forEach((order) => {
				if (order.status == 'Active') {
					activeOrders.push(order);
				}
				if (order.status == 'Canceled') {
					cancelOrders.push(order);
				}
				if (order.status == 'Delivered') {
					deliveredOrders.push(order);
				}
				if (order.status == 'Returns') {
					returnsOrders.push(order);
				}
				if (order.status == '"Not Delivered') {
					unDeliveredOrders.push(order);
				}
			});
			res.render('index', {
				orders: orders,
				active: active,
				activeOrders: activeOrders,
				cancelOrders: cancelOrders,
				deliveredOrders: deliveredOrders,
				returnsOrders: returnsOrders
			});
		})
		.catch((err) => {
			console.log(err);
		});
});

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
}

module.exports = app;

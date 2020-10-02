const express = require('express');
const router = express.Router();
const {
  check,
  validationResult
} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRole = require('../../middleware/role');
const User = require('../../models/User');
const auth = require('../../middleware/auth');
const nodemailer = require('nodemailer');
const {
  google
} = require('googleapis');
const paginatedUsers = require('../../middleware/paginatedUsers');
const OAuth2 = google.auth.OAuth2;

const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, new Date().getTime() + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {

  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

let userId;
const oauth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});
const accessToken = oauth2Client.getAccessToken();

let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    type: 'OAuth2',
    user: 'trosindia0@gmail.com',
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
    accessToken: accessToken,
  },
});


router.get('/user-profile', auth, async (req, res) => {

  try {
    const foundUser = await User.findById(req.user.id);
    res.json(foundUser);

  } catch (err) {

    res.status(403).json({
      status: "failure",
      error: err.message
    })
  }
});


router.get(
  '/all',
  auth,
  authRole('admin'),
  paginatedUsers(User),
  async (req, res) => {

    const result = res.paginatedUsers;
    await res.json(result);

  }

);


router.get('/:userId', auth, authRole('admin'), async (req, res) => {
  const foundUser = await User.findById(req.params.userId);

  try {
    res.json(foundUser);
  } catch (err) {
    res.status(403).json({
      status: "failure",
      error: err.message
    })
  }
});




router.patch('/update/:userId', auth, authRole('admin'), async (req, res) => {
  const {
    email,
    designation,
    joiningDate,
    assignedUlb,
    active
  } = req.body;

  try {
    const foundUser = await User.findOneAndUpdate({
      _id: req.params.userId
    }, {
      $set: {
        email,
        designation,
        assignedUlb,
        joiningDate,
        active
      }
    });
    if (foundUser) {
      res.status(200).json({
        status: "success",
        message: 'USER_UPDATED'
      });
    }
  } catch (err) {
    res.status(403).json({
      status: "failure",
      error: err.message
    })
  }
});


router.patch(
  '/user-update',
  auth,
  upload.single('profileImage'),
  async (req, res) => {
    const {
      name,
      address,
      qualification,
      dob,
      gender,
      designation,
      phone
    } = req.body;
    if (req.body.role || req.body.joiningDate) {
      res.json({
        status: "failure",
        message: 'ACCESS_IS_DENIED',
      });
    }


    try {

      let photo;
      if (req.file) {
        photo = req.file.path;

        const foundUser = await User.findOneAndUpdate({
          _id: req.user.id
        }, {
          $set: {
            name,
            gender,
            dob,
            designation,
            address,
            qualification,
            phone,
            profileImage: photo,
          },
        });
        if (foundUser) {
          res.status(200).json({
            status: "success",
            message: 'PROFILE_UPDATED'
          });
        }
      } else {

        const foundUser = await User.findOneAndUpdate({
          _id: req.user.id
        }, {
          $set: {
            name,
            gender,
            dob,
            designation,
            address,
            qualification,
            phone
          },
        });
        if (foundUser) {
          res.status(200).json({
            status: "success",
            message: 'PROFILE_UPDATED'
          });
        }
      }
    } catch (err) {
      res.status(403).json({
        status: "failure",
        error: err.message
      })
    }
  }
);

router.patch(
  '/ban/:userId',
  auth,
  authRole('admin'),
  async (req, res) => {
    const {
      password
    } = req.body;
    const currUser = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(password, currUser.password);

    try {
      if (!isMatch) {
        res.json({
          status: "failure",
          error: 'PASSWORD_VERIFICATION_FAILED'
        });
      } else {
        const foundUser = await User.findOneAndUpdate({
          _id: req.params.userId,
        }, {
          banned: true,
        });
        res.json({
          status: "success",
          message: 'USER_DEACTIVATED'
        });
      }
    } catch (err) {
      res.status(403).json({
        status: "failure",
        error: err.message
      })
    }
  }
);

router.patch('/unban/:userId', auth, authRole('admin'), async (req, res) => {
  const {
    password
  } = req.body;
  const currUser = await User.findById(req.user.id);
  const isMatch = await bcrypt.compare(password, currUser.password);
  try {
    if (!isMatch) {
      res.json({

        status: "failure",
        error: 'PASSWORD_VERIFICATION_FAILED'
      });
    } else {
      const foundUser = await User.findOneAndUpdate({
        _id: req.params.userId,
      }, {
        banned: false,
      });
      res.json({
        status: "success",
        message: 'USER_ACTIVATED'
      });
    }
  } catch (err) {
    res.status(403).json({
      status: "failure",
      error: err.message
    })
  }
});


router.patch(
  '/change-password',
  [
    auth,

    check(
      'password',
      'Please enter a password of 8 or more characters'
    ).isLength({
      min: 8,
    }),
    check(
      'oldPassword',
      'Please enter old password of 8 or more characters'
    ).isLength({
      min: 8,
    }),
  ],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      res.status(400).json({
        error: error.array(),
      });
    }

    const {
      password,
      oldPassword
    } = req.body;

    const currUser = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(oldPassword, currUser.password);

    if (!isMatch) {
      res.status(401).json({
        status: "failure",
        error: "OLD_PASSWORD_DONT_MATCH"
      });
    } else {

      try {

        const salt = await bcrypt.genSalt(10);
        const newPassword = await bcrypt.hash(password, salt);

        const foundUser = await User.findOneAndUpdate({
          _id: req.user.id,
        }, {
          password: newPassword,
        });
        if (!foundUser) {
          return res.status(403).json({
            status: "failure",
            error: "PASSWORD_UPDATE_FAILED"
          })
        }
        res.status(200).json({
          status: "success",
          message: "PASSWORD_CHANGED"
        });
      } catch (err) {
        res.status(403).json({
          status: "failure",
          error: err.message
        })
      }
    }
  }



);

router.post('/forgot-password', async (req, res) => {
  let token;
  const {
    email
  } = req.body;

  //Check if email is registered

  try {
    let user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(401).json({
        status: "failure",
        error: 'USER_NOT_REGISTERED'
      });
    }

    userId = user._id;
    const payload = {
      user: {
        id: user._id,
      },
    };
    jwt.sign(
      payload,
      process.env.jwtSecret, {
      expiresIn: 3600,
    },
      (err, token) => {
        if (err) throw err;

        let mailOptions = {
          from: '"Change Password "<lumia3905@gmail.com>',
          to: email,
          subject: 'Change Password Request',
          html: `<h3>Dear ${user.name},\n</h3>
        <h4>You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n</h4>
               <p>Please click on the following link, or paste this into your browser to complete the process:\n\n</p>
               <p>http://localhost:4200/reset-password?token=${token} \n\n</p> 
          <p>If you did not request this, please ignore this email and your password will remain unchanged.\n<p>
        `,
        };

        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            return res.status(500).json({
              status: "failure",
              error: err.message
            })
          }
          res.status(201).json({
            status: "success",
            message: `Reset Link Sent Successfully to ${email} with further instructions.`
          });
        });
      }
    );
  } catch (err) {
    res.status(406).json({
      status: "failure",
      error: err.message
    })
  }
});


router.post(
  '/reset-password/:token',
  check('password', 'Please enter a password of 6 or more characters').isLength({
    min: 8,
  }),
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      res.status(400).json({
        error: error.array(),
      });
    }
    let token = req.params.token;
    try {
      const decoded = jwt.verify(token, process.env.jwtSecret);
      req.user = decoded.user;
      const {
        password
      } = req.body;

      const salt = await bcrypt.genSalt(10);
      const newPassword = await bcrypt.hash(password, salt);

      const foundUser = await User.findOneAndUpdate({
        _id: req.user.id,
      }, {
        password: newPassword,
      });
      try {
        res
          .status(200)
          .json({
            status: "success",
            message: 'Password has been successfully changed.'
          });
      } catch (err) {
        res.status(403).json({
          status: "failure",
          error: err.message
        })
      }
    } catch (err) {
      res.status(403).json({
        status: "failure",
        error: err.message
      })
    }
  }
);


router.delete('/delete/:userId', auth, authRole('admin'), async (req, res) => {
  const {
    password
  } = req.body;
  const currUser = await User.findById(req.user.id);
  const isMatch = await bcrypt.compare(password, currUser.password);

  try {
    if (!isMatch) {
      res.json({
        status: "failure",
        error: 'PASSWORD_VERIFICATION_FAILED'
      });
    } else {

      await User.findByIdAndDelete(req.params.userId);

      res.status(200).json({
        status: "success",
        message: 'USER_DELETED'
      });
    }
  } catch (err) {
    res.status(403).json({
      status: "failure",
      error: err.message
    })
  }
});


router.post(
  '/create',
  [
    auth,
    authRole('admin'),
    check('name', 'Name is required').not().isEmpty(),
    check('phone', 'Phone is required').not().isEmpty(),
    check('designation', 'designation is required').not().isEmpty(),
    check('joiningDate', 'Joining Date is required').not().isEmpty(),
    check('email', 'Please enter a valid email').isEmail(),
    check(
      'password',
      'Please enter a password of 8 or more characters'
    ).isLength({
      min: 8,
    }),
  ],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      res.status(401).json({
        error: error.array()
      });
    }
    const currentUser = await User.findById(req.user.id);

    const {
      name,
      email,
      password,
      gender,
      role,
      assignedUlb,
      accountNo,
      ifsc,
      bankName,
      branch,
      bankAddress,
      accountHolder,
      phone,
      joiningDate,
      designation
    } = req.body;
    try {



      let user = await User.findOne({
        email,
      });

      if (user) {
        return res.status(401).json({
          status: "failure",
          error: 'USER_EXISTS'
        });
      } else {



        user = new User({
          name,
          email,
          password,
          phone,
          role,
          accountNo,
          ifsc,
          bankName,
          branch,
          bankAddress,
          accountHolder,
          assignedUlb,
          gender,
          designation,
          createdBy: currentUser.name,
          profileImage: null,
          joiningDate
        });


        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        const saved = await user.save();
        if (saved) {
          let mailOptions = {
            from: '"Tros Consultancy "<lumia3905@gmail.com>',
            to: email,
            subject: 'Employee Login Credentials',
            html: `<h3>Dear ${user.name},\n</h3>
          <h4>Welcome to Tros Consultancy,\n\n</h4>
                 <p>Your login credentials for your employee account is mentioned below:\n\n</p>
                 <p>email: ${email} \n\n</p> 
                 <p>password: ${password} \n\n</p>
            <p>To login to your tros account you will need to put these as your credentials on the login page.\n<p>
            <h4>Note: ⚠ Kindly change your password after login for safety purposes.</h4>
            <p>Thanks & Regards,</p>
            <p>Tros Consultancy</p>
          `,
          };

          await transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
              return console.log(err.message);
            }
            res.status(201).json({
              status: "success",
              message: `Employee is successfully registered and a email has been sent to user.`
            });
          });
        } else {
          res.status(401).json({
            status: "failure",
            error: "REGISTRATION_FAILED"
          });
        }
      }
    } catch (err) {
      res.status(500).json({
        status: "failure",
        error: err.message
      })
    }
  }
);


router.post(
  '/login',
  [
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {

      res.status(401).json({
        status: "failure",
        error: "INVALID_CREDENTIALS_FORMAT"
      });
    }

    const {
      email,
      password
    } = req.body;

    try {


      let user = await User.findOne({
        email
      });

      if (!user) {
        return res.status(401).json({
          status: "failure",
          error: 'USER_DOES_NOT_EXIST'
        });
      } else {

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return res.status(401).json({
            status: "failure",
            error: 'WRONG_PASSWORD'
          });
        }



        const payload = {
          user: {
            id: user.id
          }
        };

        const expireTime = 36000;

        jwt.sign(payload, process.env.jwtSecret, {
          expiresIn: expireTime
        },

          (err, token) => {

            if (err) throw err;

            if (!user.active) {
              res.status(401).json({
                status: "failure",
                error: "ACCOUNT_SUSPENDED"
              });
            }

            let role = user.role;
            let userAuth = user.isAuthenticated;
            let name = user.name;
            let profileImage = user.profileImage;
            let assignedUlb = user.assignedUlb;

            const refreshToken = jwt.REFRESH_TOKEN;
            let success = "USER_LOGGED_IN";

            res.status(200).json({
              success,
              name,
              profileImage,
              assignedUlb,
              exipiresIn: expireTime,
              role,
              userAuth,
              token
            });
          }
        );
      }
    } catch (err) {
      res.status(500).json({
        status: "failure",
        error: err.message
      });
    }
  }
);

router.get(
  '/all/home-page/key-persons',
  async (req, res) => {
    try {

      const result = await User.find({ role: "admin" }, 'name profileImage qualification designation -_id');
      await res.json(result);

    } catch (err) {

      res.status(500).json({
        status: "failure",
        error: err.message
      });

    }
  }
)

router.get(
  '/all/home-page/employee',
  async (req, res) => {
    try {

      const result = await User.find({ role: { $ne: "admin" } }, 'name profileImage qualification designation -_id');
      await res.json(result);

    } catch (err) {

      res.status(500).json({
        status: "failure",
        error: err.message
      });

    }
  }
);

module.exports = router;

const express = require('express');
const router = express.Router();
const authRole = require('../../middleware/role');
const auth = require('../../middleware/auth');
const Attendance = require('../../models/Attendance');


router.get('/my-all', auth, async (req, res) => {

    try {

        const foundLog = await Attendance.find({
            userId: req.user.id,
            approved: true,
        },
            'createdAt present onLeave approved cause').sort({
                createdAt: 'asc'
            });

        await res.status(200).json(foundLog);

    } catch (err) {

        res.status(403).json({
            status: "failure",
            error: err.message
        });
    }

})


router.get('/my', auth, async (req, res) => {

    var d = new Date();
    const month = d.getMonth();
    const year = d.getFullYear();
    const fromDate = new Date(year, month, 1);
    const toDate = new Date(new Date(fromDate.getFullYear(), fromDate.getMonth() + 1, 0).setHours(23, 59, 59));

    try {

        const foundLog = await Attendance.find({
            userId: req.user.id,
            createdAt: {
                '$gte': fromDate,
                '$lte': toDate
            }
        }, 'createdAt present approved onLeave date cause onLeave').sort({
            createdAt: 'asc'
        });

        await res.status(200).json(foundLog);

    } catch (err) {

        res.status(403).json({
            status: "failure",
            error: err.message
        });
    }

})


router.get('/my/month', auth, async (req, res) => {


    const {
        forMonth,
        forYear
    } = req.query;
    const month = forMonth;
    const year = forYear;
    const fromDate = new Date(year, month, 1);
    const toDate = new Date(new Date(fromDate.getFullYear(), fromDate.getMonth() + 1, 0).setHours(23, 59, 59));

    try {

        const foundLog = await Attendance.find({
            userId: req.user.id,
            approved: true,
            createdAt: {
                '$gte': fromDate,
                '$lte': toDate
            }
        }, 'createdAt present onLeave approved cause').sort({
            createdAt: 'asc'
        });

        await res.status(200).json(foundLog);

    } catch (err) {

        res.status(403).json({
            status: "failure",
            error: err.message
        });
    }

})


router.get('/all-users', auth, authRole("admin"), async (req, res) => {
    try {
        const foundLog = await Attendance.find({
            approved: true
        }, 'createdAt date present onLeave date approved userId user cause').sort({
            createdAt: 'asc'
        });

        if (!foundLog) {
            res.status(400).json({
                status: "failure",
                error: "ATTENDANCE_NOT_FOUND"
            })
        } else {
            res.status(200).json(foundLog);
        }
    } catch (err) {
        res.status(403).json({
            status: "failure",
            error: err.message
        });
    }

})


router.get('/all-users/current-month', auth, authRole("admin", "manager"), async (req, res) => {


    var d = new Date();
    const month = d.getMonth();
    const year = d.getFullYear();
    const fromDate = new Date(year, month, 1);
    const toDate = new Date(new Date(fromDate.getFullYear(), fromDate.getMonth() + 1, 0).setHours(23, 59, 59));

    try {
        const foundLog = await Attendance.find({
            approved: true,
            createdAt: {
                '$gte': fromDate,
                '$lte': toDate
            }
        }, 'createdAt present approved onLeave userId user date cause').sort({
            createdAt: 'asc'
        });

        if (!foundLog) {
            res.status(400).json({
                status: "failure",
                error: "ATTENDANCE_NOT_FOUND"
            })
        } else {
            res.status(200).json(foundLog);
        }
    } catch (err) {
        res.status(403).json({
            status: "failure",
            error: err.message
        });
    }

})


router.get('/all-users/month', auth, authRole("admin", "manager"), async (req, res) => {

    const {
        forMonth,
        forYear
    } = req.query;
    const month = forMonth;
    const year = forYear;
    const fromDate = new Date(year, month, 1);
    const toDate = new Date(new Date(fromDate.getFullYear(), fromDate.getMonth() + 1, 0).setHours(23, 59, 59));

    try {
        const foundLog = await Attendance.find({
            approved: true,
            createdAt: {
                '$gte': fromDate,
                '$lte': toDate
            }
        }, 'createdAt present approved onLeave userId user date cause').sort({
            createdAt: 'asc'
        });

        if (!foundLog) {
            res.status(400).json({
                status: "failure",
                error: "ATTENDANCE_NOT_FOUND"
            })
        } else {
            res.status(200).json(foundLog);
        }
    } catch (err) {
        res.status(403).json({
            status: "failure",
            error: err.message
        });
    }

})



router.get('/user/:userId', auth, authRole("admin", "manager"), async (req, res) => {


    try {
        const foundLog = await Attendance.find({
            userId: req.params.userId,
            approved: true,
        }, 'createdAt present approved onLeave user userId date cause').sort({
            createdAt: 'asc'
        });

        if (!foundLog) {
            res.status(400).json({
                status: "failure",
                error: "ATTENDANCE_NOT_FOUND"
            })
        } else {
            res.status(200).json(foundLog);
        }
    } catch (err) {
        res.status(403).json({
            status: "failure",
            error: err.message
        });
    }

})



router.get('/user/:userId/current-month', auth, authRole("admin", "manager"), async (req, res) => {


    var d = new Date();
    const month = d.getMonth();
    const year = d.getFullYear();
    const fromDate = new Date(year, month, 1);
    const toDate = new Date(new Date(fromDate.getFullYear(), fromDate.getMonth() + 1, 0).setHours(23, 59, 59));

    try {
        const foundLog = await Attendance.find({
            userId: req.params.userId,
            approved: true,
            createdAt: {
                '$gte': fromDate,
                '$lte': toDate
            }
        }, 'createdAt present approved onLeave user userId date').sort({
            createdAt: 'asc'
        });

        if (!foundLog) {
            res.status(400).json({
                status: "failure",
                error: "ATTENDANCE_NOT_FOUND"
            })
        } else {
            res.status(200).json(foundLog);
        }
    } catch (err) {
        res.status(403).json({
            status: "failure",
            error: err.message
        });
    }

})



router.get('/user/:userId/month', auth, authRole("admin", "manager"), async (req, res) => {


    const {
        forMonth,
        forYear
    } = req.query;
    const month = forMonth;
    const year = forYear;
    const fromDate = new Date(year, month, 1);
    const toDate = new Date(new Date(fromDate.getFullYear(), fromDate.getMonth() + 1, 0).setHours(23, 59, 59));

    try {
        const foundLog = await Attendance.find({
            userId: req.params.userId,
            approved: true,
            createdAt: {
                '$gte': fromDate,
                '$lte': toDate
            }
        }, 'createdAt present approved onLeave user userId date').sort({
            createdAt: 'asc'
        });

        if (!foundLog) {
            res.status(400).json({
                status: "failure",
                error: "ATTENDANCE_NOT_FOUND"
            })
        } else {
            res.status(200).json(foundLog);
        }
    } catch (err) {
        res.status(403).json({
            status: "failure",
            error: err.message
        });
    }

})


router.post('/create-attendance', auth, async (req, res) => {
    const currDate = Date.now();
    const {
        isPresent
    } = req.body;
    const currUser = await User.findById(req.user.id);

    const startOfDay = new Date(new Date(currDate).setHours(00, 00, 00));
    const endOfDay = new Date(new Date(currDate).setHours(23, 59, 59));


    const isLoggedToday = await Attendance.findOne({
        createdAt: {
            $gte: startOfDay,
            $lte: endOfDay
        },
        userId: currUser
    });

    let fallsInHoliday = false;
    let fallsInLeave = false;


    const holidays = await Holiday.find({});
    holidays.forEach(holiday => {
        let holidayStart = holiday.from;
        let holidayEnd = holiday.to;
        holidayStart = Date.parse(holidayStart);
        let todayStartOfDay = Date.parse(startOfDay);
        holidayEnd = Date.parse(holidayEnd);
        let todayEndOfDay = Date.parse(endOfDay);


        if (todayStartOfDay >= holidayStart && todayEndOfDay <= holidayEnd) {
            fallsInHoliday = true;
        }

    });


    const leaves = await Leave.find({
        approved: true,
        userId: currUser._id
    });
    leaves.forEach(leave => {
        let leaveStart = leave.from;
        let leaveEnd = leave.to;
        leaveStart = Date.parse(leaveStart);
        let todayStartOfDay = Date.parse(startOfDay);
        leaveEnd = Date.parse(leaveEnd);
        let todayEndOfDay = Date.parse(endOfDay);

        if (todayStartOfDay >= leaveStart && todayEndOfDay <= leaveEnd) {
            fallsInLeave = true;
        }
    });


    if (isLoggedToday) {
        res.status(400).json({
            status: "failure",
            error: "ATTENDANCE_ALREADY_LOGGED"
        })
    } else {
        try {

            if (!fallsInHoliday && !fallsInLeave) {

                if (currUser.role === "manager") {
                    const attn = new Attendance({
                        userId: currUser._id,
                        user: currUser.name,
                        present: isPresent,
                        approved: true
                    })


                    const saved = await attn.save();
                    if (!saved) {
                        res.status(400).json({
                            status: "failure",
                            error: "ATTENDANCE_NOT_LOGGED"
                        })
                    } else {
                        res.status(200).json({
                            status: "success",
                            message: "ATTENDANCE_LOGGED"
                        });
                    }
                } else {
                    const attn = new Attendance({
                        userId: currUser._id,
                        user: currUser.name,
                        present: isPresent
                    })


                    const saved = await attn.save();
                    if (!saved) {
                        res.status(400).json({
                            status: "failure",
                            error: "ATTENDANCE_NOT_LOGGED"
                        })
                    } else {
                        res.status(200).json({
                            status: "success",
                            message: "ATTENDANCE_LOGGED"
                        });
                    }
                }

            } else if (fallsInHoliday) {
                res.status(400).json({
                    status: "failure",
                    error: "TODAY IS A HOLIDAY"
                })

            } else if (fallsInLeave) {
                res.status(400).json({
                    status: "failure",
                    error: "YOU ARE ON LEAVE"
                })
            }

        } catch (err) {
            res.status(403).json({
                status: "failure",
                error: err.message
            });
        }
    }
})



router.get('/range/all-users', auth, authRole("admin", "manager"), async (req, res) => {

    const {
        startDate,
        endDate
    } = req.query;

    const isoStartDate = new Date(new Date(startDate).setHours(00, 00, 00));
    const isoEndDate = new Date(new Date(endDate).setHours(23, 59, 59));


    try {
        const foundLog = await Attendance.find({
            createdAt: {
                $gte: isoStartDate,
                $lte: isoEndDate
            },
            approved: true,
        }, 'createdAt present onLeave approved user userId date').sort({
            createdAt: 'asc'
        });

        if (!foundLog) {
            res.status(400).json({
                status: "failure",
                error: "ATTENDANCE_NOT_FOUND"
            })
        } else {
            res.status(200).json(foundLog);
        }
    } catch (err) {
        res.status(403).json({
            status: "failure",
            error: err.message
        });
    }

})


router.get('/range/loggedUser', auth, async (req, res) => {

    const {
        startDate,
        endDate
    } = req.query;

    const isoStartDate = new Date(new Date(startDate).setHours(00, 00, 00));
    const isoEndDate = new Date(new Date(endDate).setHours(23, 59, 59));


    try {
        const foundLog = await Attendance.find({
            createdAt: {
                $gte: isoStartDate,
                $lte: isoEndDate
            },
            approved: true,
            userId: req.user.id
        }, 'createdAt present onLeave approved user userId').sort({
            createdAt: 'asc'
        });

        if (!foundLog) {
            res.status(400).json({
                status: "failure",
                error: "ATTENDANCE_NOT_FOUND"
            })
        } else {
            res.status(200).json(foundLog);
        }
    } catch (err) {
        res.status(403).json({
            status: "failure",
            error: err.message
        });
    }

})


router.get('/range/:userId', auth, authRole("admin", "manager"), async (req, res) => {

    const {
        startDate,
        endDate
    } = req.query;

    const isoStartDate = new Date(new Date(startDate).setHours(00, 00, 00));
    const isoEndDate = new Date(new Date(endDate).setHours(23, 59, 59));

    try {
        const foundLog = await Attendance.find({
            createdAt: {
                $gte: isoStartDate,
                $lte: isoEndDate
            },
            approved: true,
            userId: req.params.userId
        }, 'createdAt present onLeave approved user userId date').sort({
            createdAt: 'asc'
        });

        if (!foundLog) {
            res.status(400).json({
                status: "failure",
                error: "ATTENDANCE_NOT_FOUND"
            })
        } else {
            res.status(200).json(foundLog);
        }
    } catch (err) {
        res.status(403).json({
            status: "failure",
            error: err.message
        });
    }

})


router.get('/today/:userId', auth, authRole("admin", "manager"), async (req, res) => {

    const date = Date.now();

    const isoStartDate = new Date(new Date(date).setHours(00, 00, 00));
    const isoEndDate = new Date(new Date(date).setHours(23, 59, 59));

    try {
        const foundLog = await Attendance.find({
            createdAt: {
                $gte: isoStartDate,
                $lte: isoEndDate
            },
            approved: true,
            userId: req.params.userId
        }, 'present approved onLeave user userId').sort({
            createdAt: 'asc'
        });

        if (!foundLog) {
            res.status(400).json({
                status: "failure",
                error: "ATTENDANCE_NOT_FOUND"
            })
        } else {
            res.status(200).json(foundLog);
        }
    } catch (err) {
        res.status(403).json({
            status: "failure",
            error: err.message
        });
    }

})



router.post('/date/:userId', auth, authRole("admin"), async (req, res) => {

    const {
        date,
        isPresent
    } = req.query;

    const isoStartDate = new Date(new Date(date).setHours(00, 00, 00));
    const isoEndDate = new Date(new Date(date).setHours(23, 59, 59));
    try {
        const updated = await Attendance.findOneAndUpdate({
            userId: req.params.userId,
            createdAt: {
                $gte: isoStartDate,
                $lte: isoEndDate
            }
        }, {
            $set: {
                present: isPresent
            }
        });

        if (!updated) {
            res.status(400).json({
                status: "failure",
                error: "ATTENDANCE_NOT_UPDATED"
            })
        } else {
            res.status(200).json({
                status: "success",
                message: "ATTENDANCE_UPDATED"
            });
        }
    } catch (err) {
        res.status(403).json({
            status: "failure",
            error: err.message
        });
    }

})



router.get("/manager/deos/all", auth, authRole("manager"), async (req, res) => {

    const deoAttendanceList = [];
    const foundTask = await User.findById(req.user.id, 'assignedUlb -_id');
    console.log(foundTask);

    try {
        const ulbnames = foundTask.assignedUlb.map((ulb) => {
            return ulb;
        })
        console.log(ulbnames);
        const foundDeos = await User.find({
            role: "deo",
            banned: false
        });
        console.log(foundDeos);
        for (const deo of foundDeos) {
            if (ulbnames.includes(deo.assignedUlb[0])) {

                const foundAttendance = await Attendance.find({
                    userId: deo._id,
                    approved: false,
                    present: true
                });
                deoAttendanceList.push(foundAttendance);
            }
        }
        await Promise.all(deoAttendanceList);

        res.json(deoAttendanceList);

    } catch (err) {
        res.status(500).json({
            status: "failure",
            error: err.message
        })
    }

});



router.patch('/manager/deos/approve/:attendanceId', auth, authRole("manager"), async (req, res) => {

    const currUser = await User.findById(req.user.id);
    const {
        approveStatus,
        cause
    } = req.body;
    try {
        if (approveStatus) {
            const approved = await Attendance.findOneAndUpdate({
                _id: req.params.attendanceId
            }, {
                $set: {
                    approved: true,
                    approvedBy: currUser.name
                }
            });
            if (approved) {
                res.status(200).json("ATTENDANCE_APPROVED");
            }
        } else if (!approveStatus) {
            const rejected = await Attendance.findOneAndUpdate({
                _id: req.params.attendanceId
            }, {
                $set: {
                    present: false,
                    approved: true,
                    approvedBy: currUser.name,
                    cause: cause //rejection by manager cause
                }
            });
            if (rejected) {
                res.status(200).json("ATTENDANCE_REJECTED");
            }
        }

    } catch (err) {
        res.status(500).json({
            status: "failure",
            error: err.message
        })
    }
})


module.exports = router;
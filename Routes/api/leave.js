const express = require('express');
const router = express.Router();
const authRole = require('../../middleware/role');
const auth = require('../../middleware/auth');
const Leave = require('../../models/Leave');
const Holiday = require('../../models/Holiday');


router.get('/all', auth, authRole("admin"), async (req, res) => {

    try {
        const foundLeaves = await Leave.find({}, 'user from to reason apprroved approvedBy');
        if (foundLeaves) {
            res.status(200).json(foundLeaves);
        } else {
            res.status(404).json({ status: 'falure', error: "NO_LEAVES_FOUND" })
        }
    } catch (err) {
        res.status(403).json({ status: "failure", error: err.message });
    }

});


router.post('/apply-leave', auth, async (req, res) => {

    const foundUser = await User.findById(req.user.id);
    const {
        from,
        to,
        reason,
        holidayType
    } = req.body;

    const startOfDay = new Date(from).setHours(00, 00, 00);
    const endOfDay = new Date(to).setHours(23, 59, 59);
    const foundHoliday = await Holiday.findOne({
        name: holidayType
    });
    try {
        const leave = new Leave({
            userId: foundUser._id,
            user: foundUser.name,
            from: startOfDay,
            to: endOfDay,
            reason,
            holidayType: foundHoliday.name,
            holidayTypeId: foundHoliday._Id
        });

        const saved = await leave.save();
        if (saved) {
            res.status(200).json({
                status: "success",
                message: "LEAVE_APPLIED"
            });
        } else {
            res.status(403).json({
                status: "failure",
                error: err.message
            });
        }

    } catch (err) {
        res.status(403).json({
            status: "failure",
            error: err.message
        });
    }

})



router.get('/all/applied-leaves', auth, authRole("admin"), async (req, res) => {

    try {
        const foundLeaves = await Leave.find({
            approved: {
                $exists: false
            }
        }, 'user from to reason holidayType approved');
        if (foundLeaves) {
            res.status(200).json(foundLeaves);
        } else {
            res.status(404).json({
                status: 'falure',
                error: "NO_LEAVES_FOUND"
            })
        }
    } catch (err) {
        res.status(403).json({
            status: "failure",
            error: err.message
        });
    }

})



router.get('/all/approved-leaves', auth, authRole("admin"), async (req, res) => {

    try {
        const foundLeaves = await Leave.find({}, 'user from to reason apprroved approvedBy');
        if (foundLeaves) {
            res.status(200).json(foundLeaves);
        } else {
            res.status(404).json({
                status: 'falure',
                error: "NO_LEAVES_FOUND"
            })
        }
    } catch (err) {
        res.status(403).json({
            status: "failure",
            error: err.message
        });
    }

})


router.get('/all/rejected-leaves', auth, authRole("admin"), async (req, res) => {

    try {
        const foundLeaves = await Leave.find({
            approved: false
        }, 'user from to reason apprroved approvedBy');
        if (foundLeaves) {
            res.status(200).json(foundLeaves);
        } else {
            res.status(404).json({
                status: 'falure',
                error: "NO_LEAVES_FOUND"
            })
        }
    } catch (err) {
        res.status(403).json({
            status: "failure",
            error: err.message
        });
    }

})


router.patch('/aprrove-leave/:leaveId', auth, authRole("admin"), async (req, res) => {

    const foundUser = await User.findById(req.user.id);
    const { isApproved } = req.body;

    const reqLeave = await Leave.findById(req.params.leaveId);
    const leaveFrom = reqLeave.from;
    const leaveTo = reqLeave.to;


    const getDates = (startDate, endDate) => {
        var dates = [],
            currentDate = startDate,
            addDays = function (days) {
                var date = new Date(this.valueOf());
                date.setDate(date.getDate() + days);
                return date;
            };
        while (currentDate <= endDate) {
            dates.push(currentDate);
            currentDate = addDays.call(currentDate, 1);
        }
        return dates;
    };

    const dates = getDates(leaveFrom, leaveTo);
    dates.pop();
    dates.push(leaveTo.setHours(23, 59, 59));

    try {

        const approve = await Leave.findByIdAndUpdate(req.params.leaveId, {
            $set: {
                approved: isApproved,
                approvedBy: foundUser.name,
                approvedByUserId: foundUser._id
            }
        });

        if (approve) {

            dates.forEach(async (date) => {
                const entries = await Attendance.create({
                    userId: reqLeave.userId,
                    user: reqLeave.user,
                    present: false,
                    onLeave: true,
                    approved: true,
                    approvedBy: foundUser.name,
                    createdAt: date
                });
            });

            res.status(200).json({
                status: "success",
                message: "LEAVE_APPROVED"
            });

        } else {

            res.status(403).json({
                status: "failure",
                error: "LEAVE_DECLINED"
            });

        }

    } catch (err) {
        res.status(403).json({
            status: "failure",
            error: err.message
        });
    }

})


router.get('/leave-status/logged', auth, async (req, res) => {
    try {
        const foundLeave = await Leave.find({
            userId: req.user.id
        }, 'from to reason approved approvedBy holidayType');
        if (foundLeave) {
            res.status(200).json(foundLeave);
        } else {
            res.status(404).json({
                status: "failure",
                error: "LEAVE_NOT_FOUND"
            })
        }

    } catch (err) {
        res.status(403).json({
            status: "failure",
            error: err.message
        });
    }

})


router.get('/leave-status/:userId', auth, authRole("manager", "admin"), async (req, res) => {
    try {
        const foundLeave = await Leave.find({
            userId: req.params.userId,
            approved: true
        }, 'from to reason approved approvedBy holidayType');
        if (foundLeave) {
            res.status(200).json(foundLeave);
        } else {
            res.status(404).json({
                status: "failure",
                error: "LEAVE_NOT_FOUND"
            })
        }

    } catch (err) {
        res.status(403).json({
            status: "failure",
            error: err.message
        });
    }

})


router.get('/consumed-leaves', auth, async (req, res) => {

    try {
        const totalML = await Holiday.findOne({
            name: "ML"
        });
        const totalEL = await Holiday.findOne({
            name: "EL"
        });
        const totalCL = await Holiday.findOne({
            name: "CL"
        });
        const consumedMl = await Leave.count({
            userId: req.user.id,
            holidayType: 'ML'
        });
        const consumedCl = await Leave.count({
            userId: req.user.id,
            holidayType: 'CL'
        });
        const consumedEl = await Leave.count({
            userId: req.user.id,
            holidayType: 'EL'
        });

        const leftMl = totalML.count - consumedMl;
        const leftCl = totalCL.count - consumedCl;
        const leftEl = totalEL.count - consumedEl;

        res.json({
            ML: {
                Used: consumedMl,
                left: leftMl,
                total: totalML.count
            },
            EL: {
                Used: consumedEl,
                left: leftEl,
                total: totalEL.count
            },
            CL: {
                Used: consumedCl,
                left: leftCl,
                total: totalCL.count
            }
        });

    } catch (err) {
        res.status(403).json({
            status: "failure",
            error: err.message
        });
    }

})


router.get('/consumed-leaves/:userId', auth, authRole("admin"), async (req, res) => {

    try {
        const foundUser = await User.findById(req.params.userId, 'name');
        const totalML = await Holiday.findOne({
            name: "ML"
        });
        const totalEL = await Holiday.findOne({
            name: "EL"
        });
        const totalCL = await Holiday.findOne({
            name: "CL"
        });
        const consumedMl = await Leave.count({
            userId: req.params.userId,
            holidayType: 'ML'
        });
        const consumedCl = await Leave.count({
            userId: req.params.userId,
            holidayType: 'CL'
        });
        const consumedEl = await Leave.count({
            userId: req.params.userId,
            holidayType: 'EL'
        });

        const leftMl = totalML.count - consumedMl;
        const leftCl = totalCL.count - consumedCl;
        const leftEl = totalEL.count - consumedEl;

        res.json({
            User: foundUser,
            ML: {
                Used: consumedMl,
                left: leftMl,
                total: totalML.count
            },
            EL: {
                Used: consumedEl,
                left: leftEl,
                total: totalEL.count
            },
            CL: {
                Used: consumedCl,
                left: leftCl,
                total: totalCL.count
            }
        });

    } catch (err) {
        res.status(403).json({
            status: "failure",
            error: err.message
        });
    }

})

module.exports = router;
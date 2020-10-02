const express = require('express');
const router = express.Router();
const authRole = require('../../middleware/role');
const auth = require('../../middleware/auth');
const Holiday = require('../../models/Holiday');


router.get('/all', auth, async (req, res) => {
    try {
        const foundHolidays = await Holiday.find({});
        if (foundHolidays) {
            res.json(foundHolidays);
        } else {
            res.status(403).json({
                status: "failure",
                error: "FETCHING_LIST_FAILED"
            })
        }
    } catch (err) {
        res.status(403).json({
            status: "failure",
            error: err.message
        });
    }
})



router.get('/:holidayId', auth, async (req, res) => {
    try {
        const foundHoliday = await Holiday.findById(req.params.holidayId);
        if (foundHoliday) {
            res.json(foundHoliday);
        } else {
            res.status(403).json({
                status: "failure",
                error: "FETCH_FAILED"
            })
        }
    } catch (err) {
        res.status(403).json({
            status: "failure",
            error: err.message
        });
    }
})


router.post('/create', auth, authRole("admin"), async (req, res) => {

    const {
        name,
        count
    } = req.body;

    const foundHoliday = await Holiday.findOne({
        name: name
    });
    if (foundHoliday) {
        res.status(400).json({
            status: "failure",
            error: "HOLIDAY_EXISTS"
        });
    } else {
        try {
            const newHoliday = new Holiday({
                name,
                count
            })
            const saved = newHoliday.save();
            if (saved) {
                res.json({
                    status: "success",
                    message: "HOLIDAY_CREATED"
                })
            } else {
                res.status(403).json({
                    status: "failure",
                    error: "NOT_SAVED"
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



router.post('/create', auth, authRole("admin"), async (req, res) => {

    const {
        name,
        count,
        from,
        to
    } = req.body;
    const foundHoliday = await Holiday.findOne({
        name: name
    });
    if (foundHoliday) {
        res.status(400).json({
            status: "failure",
            error: "HOLIDAY_EXISTS"
        });
    } else {
        try {
            const newHoliday = new Holiday({
                name,
                count,
                from,
                to
            })
            const saved = newHoliday.save();
            if (saved) {
                res.json({
                    status: "success",
                    message: "HOLIDAY_CREATED"
                })
            } else {
                res.status(403).json({
                    status: "failure",
                    error: "NOT_SAVED"
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


router.patch('/update/:holidayId', auth, authRole("admin"), async (req, res) => {

    const {
        name,
        count
    } = req.body;

    try {
        const updateHoliday = await Holiday.findByIdAndUpdate(req.params.holidayId, {
            $set: {
                name,
                count
            }
        });
        if (updateHoliday) {
            res.status(200).json({
                status: "success",
                message: "UPDATED"
            })
        }

    } catch (err) {
        res.status(403).json({
            status: "failure",
            error: err.message
        });
    }

})


router.delete('/delete/:holidayId', auth, authRole("admin"), async (req, res) => {


    try {
        const deleteHoliday = await Holiday.findByIdAndDelete(req.params.holidayId);
        if (deleteHoliday) {
            res.status(200).json({
                status: "success",
                message: "DELETED"
            })
        } else {
            res.status(403).json({
                status: "failure",
                error: "DELETE_FAILED"
            })
        }
    } catch (err) {
        res.status(403).json({
            status: "failure",
            error: err.message
        });
    }

})

module.exports = router;
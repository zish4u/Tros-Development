const express = require('express');
const router = express.Router();
const authRole = require('../../middleware/role');
const auth = require('../../middleware/auth');
const Task = require('../../models/Task');
const Attendance = require('../../models/Attendance');


router.get('/all-tasks', auth, authRole("admin"), async (req, res) => {

    let { date, startDate, endDate, all } = req.query;

    const isoStartDate = new Date(new Date(startDate).setHours(00, 00, 00));
    const isoEndDate = new Date(new Date(endDate).setHours(23, 59, 59));

    if (date) {


        if (date === '') {
            return res.status(400).json({
                status: 'failure',
                error: 'Please ensure you pick date'
            })
        } else {
            try {

                var d = new Date(date);
                d.setMinutes(d.setMinutes() + d.getTimezoneOffset() + d.setHours(00, 00, 00));


                const foundTask = await Task.find({
                    taskDate: {
                        $gte: new Date(new Date(date).setHours(00, 00, 00)),
                        $lte: new Date(new Date(date).setHours(23, 59, 59))
                    }, submit: true
                }).sort({ taskDate: 'asc' });

                if (!foundTask) {
                    res.status(404).json({
                        status: "failure",
                        error: "No task found in requested date"
                    });
                }
                res.status(200).json(foundTask);

            } catch (err) {
                res.status(400).json({ status: "failure", error: err.message });
            }
        }



    }
    else if (startDate && endDate) {
        if (startDate === '' || endDate === '') {
            return res.status(400).json({
                status: 'failure',
                error: 'Please ensure you pick two dates'
            })
        }

        try {
            if (isoStartDate > isoEndDate) {
                res.json({
                    status: "failure",
                    error: "Please ensure that start date is not greater than end date"
                })
            }

            const foundTask = await Task.find({
                taskDate: {
                    $gte: isoStartDate,
                    $lte: isoEndDate
                }, submit: true
            }).sort({ taskDate: 'asc' });

            if (!foundTask) {
                res.status(404).json({ status: "failure", error: "No task found in requested date range" });
            }
            res.status(200).json(foundTask);

        } catch (err) {
            res.status(400).json({ status: "failure", hint: "From and To date are required", error: err.message });
        }
    }
    else if (all) {
        try {
            const foundTasks = await Task.find({ submit: true });
            res.json(foundTasks);
        } catch (err) {
            res.status(500).json({
                status: "failure",
                error: err.message
            })
        }
    }
})


router.get("/all-tasks/by-user/:userId", auth, authRole("admin", "manager"), async (req, res) => {


    let { date, startDate, endDate, all } = req.query;

    const isoStartDate = new Date(new Date(startDate).setHours(00, 00, 00));
    const isoEndDate = new Date(new Date(endDate).setHours(23, 59, 59));

    if (date) {
        if (date === '') {
            return res.status(400).json({
                status: 'failure',
                error: 'Please ensure you pick date'
            })
        }
        try {
            const foundTask = await Task.find({
                submittedBy: req.params.userId,
                taskDate: {
                    $gte: new Date(new Date(date).setHours(00, 00, 00)),
                    $lte: new Date(new Date(date).setHours(23, 59, 59))
                }, submit: true
            }).sort({ taskDate: 'asc' });

            if (!foundTask) {
                res.status(404).json({
                    status: "failure",
                    error: "No task found in requested date"
                });
            }
            res.status(200).json(foundTask);
        } catch (err) {
            res.status(400).json({ status: "failure", error: err.message });
        }
    }
    else if (startDate && endDate) {
        if (startDate === '' || endDate === '') {
            return res.status(400).json({
                status: 'failure',
                error: 'Please ensure you pick two dates'
            })
        }

        try {
            if (isoStartDate > isoEndDate) {
                res.json({
                    status: "failure",
                    error: "Please ensure that start date is not greater than end date"
                })
            }

            const foundTask = await Task.find({
                submittedBy: req.params.userId,
                taskDate: {
                    $gte: isoStartDate,
                    $lte: isoEndDate
                }, submit: true
            }).sort({ taskDate: 'asc' });

            if (!foundTask) {
                res.status(404).json({ status: "failure", error: "No task found in requested date range" });
            }
            res.status(200).json(foundTask);

        } catch (err) {
            res.status(400).json({ status: "failure", hint: "From and To date are required", error: err.message });
        }
    }
    else if (all) {
        try {
            const foundTasks = await Task.find({
                submittedBy: req.params.userId,
                submit: true
            }).sort({
                taskDate: 'asc'
            }).exec();

            foundTasks ? res.status(200).json(foundTasks) : res.status(404).json({
                status: "failure",
                error: "Record not found"
            });
        } catch (err) {
            res.status(500).json({
                status: "failure",
                error: err.message
            })
        }
    }

})



router.get('/all-tasks/by-work/:workId', auth, authRole("admin"), async (req, res) => {

    let { date, startDate, endDate, all } = req.query;

    const isoStartDate = new Date(new Date(startDate).setHours(00, 00, 00));
    const isoEndDate = new Date(new Date(endDate).setHours(23, 59, 59));



    if (startDate && endDate) {

        if (startDate === '' || endDate === '') {
            return res.status(400).json({
                status: 'failure',
                error: 'Please ensure you pick two dates'
            });
        } else {
            try {
                if (isoStartDate > isoEndDate) {
                    res.json({
                        status: "failure",
                        error: "Please ensure that start date is not greater than end date"
                    });
                } else {

                    const foundTask = await Task.find({
                        titleId: req.params.workId,
                        taskDate: {
                            $gte: isoStartDate,
                            $lte: isoEndDate
                        }, submit: true
                    }).sort({ taskDate: 'asc' });

                    if (!foundTask) {
                        res.status(404).json({ status: "failure", error: "No task found in requested date range" });
                    }
                    res.status(200).json(foundTask);
                }

            } catch (err) {

                res.status(400).json({ status: "failure", hint: "From and To date are required", error: err.message });
            }
        }


    }

    else if (date) {
        if (date === '') {
            return res.status(400).json({
                status: 'failure',
                error: 'Please ensure you pick date'
            })
        } else {
            try {

                const foundTask = await Task.find({
                    titleId: req.params.workId,
                    taskDate: {
                        $gte: new Date(new Date(date).setHours(00, 00, 00)),
                        $lte: new Date(new Date(date).setHours(23, 59, 59))
                    }, submit: true
                }).sort({ taskDate: 'asc' });

                if (!foundTask) {
                    res.status(404).json({
                        status: "failure",
                        error: "No task found in requested date"
                    });
                }
                res.status(200).json(foundTask);
            } catch (err) {

                res.status(400).json({ status: "failure", error: err.message });
            }

        }
    }

    else if (all) {
        try {
            const foundTask = await Task.find({ titleId: req.params.workId });

            foundTask ? res.status(200).json(foundTask) : res.status(404).json({ status: "failure", error: "Record not found" });

        } catch (err) {
            res.status(403).json({
                status: "failure",
                error: err.message
            })
        }
    }

})

router.get('/all-tasks/by-ulb/:ulbId', auth, authRole("admin"), async (req, res) => {

    let { date, startDate, endDate, all } = req.query;

    const isoStartDate = new Date(new Date(startDate).setHours(00, 00, 00));
    const isoEndDate = new Date(new Date(endDate).setHours(23, 59, 59));

    if (startDate && endDate) {
        if (startDate === '' || endDate === '') {
            return res.status(400).json({
                status: 'failure',
                error: 'Please ensure you pick two dates'
            });
        } else {
            try {
                if (isoStartDate > isoEndDate) {
                    res.json({
                        status: "failure",
                        error: "Please ensure that start date is not greater than end date"
                    });
                } else {

                    const foundTask = await Task.find({
                        ulbId: req.params.ulbId,
                        taskDate: {
                            $gte: isoStartDate,
                            $lte: isoEndDate
                        }, submit: true
                    }).sort({ taskDate: 'asc' });

                    if (!foundTask) {
                        res.status(404).json({ status: "failure", error: "No task found in requested date range" });
                    }
                    res.status(200).json(foundTask);
                }

            } catch (err) {

                res.status(400).json({ status: "failure", hint: "From and To date are required", error: err.message });
            }
        }


    }

    else if (date) {
        if (date === '') {
            return res.status(400).json({
                status: 'failure',
                error: 'Please ensure you pick date'
            })
        } else {
            try {
                const foundTask = await Task.find({
                    ulbId: req.params.ulbId,
                    taskDate: {
                        $gte: new Date(new Date(date).setHours(00, 00, 00)),
                        $lte: new Date(new Date(date).setHours(23, 59, 59))
                    }, submit: true
                }).sort({ taskDate: 'asc' });

                if (!foundTask) {
                    res.status(404).json({
                        status: "failure",
                        error: "No task found in requested date"
                    });
                }
                res.status(200).json(foundTask);
            } catch (err) {
                res.status(400).json({ status: "failure", error: err.message });
            }

        }
    }

    else if (all) {
        try {
            const foundTask = await Task.find({ ulbId: req.params.ulbId });

            foundTask ? res.status(200).json(foundTask) : res.status(404).json({ status: "failure", error: "Record not found" });

        } catch (err) {
            res.status(403).json({
                status: "failure",
                error: err.message
            })
        }
    }

})


module.exports = router;

const express = require('express');
const Task = require('../../models/Task');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const authRole = require('../../middleware/role');
const paginatedTasks = require('../../middleware/paginatedTask');
const Work = require('../../models/Work');
const { v4: uuidv4 } = require('uuid');


const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/files');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().getTime() + "__" + file.originalname);
    },
});

const fileFilter = (req, file, cb) => {

    if (file.mimetype === '	application/pdf' || file.mimetype === 'application/vnd.ms-excel' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 10,
    },
    fileFilter: fileFilter,
});


router.get('/all', auth, authRole("admin"), paginatedTasks(Task), async (req, res) => {
    try {
        res.json(res.paginatedTasks);
    } catch (err) {
        res.status(500).json({
            status: "failure",
            error: err.message
        })
    }

});


router.get("/", auth, async (req, res) => {
    try {
        const foundTasks = await Task.find({
            submittedBy: req.user.id,
            submit: true
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

})


router.get("/preview", auth, async (req, res) => {
    try {
        const foundTasks = await Task.find({
            submittedBy: req.user.id,
            submit: false
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

})


router.get("/ulb-tasks", auth, authRole("manager"), async (req, res) => {

    const foundTask = await User.findById(req.user.id, 'assignedUlb -_id');
    try {
        const ulbnames = foundTask.assignedUlb.map((ulb) => {
            return ulb;
        })
        const foundDeos = await Task.find({ ulb: { $in: ulbnames }, submit: true });

        foundDeos ? res.status(200).json(foundDeos) : res.status(404).json({
            status: "failure",
            error: "Record not found"
        });
    } catch (err) {
        res.status(500).json({
            status: "failure",
            error: err.message
        })
    }

})


router.get("/:managerId/ulb-tasks", auth, authRole("admin"), async (req, res) => {

    const foundTask = await User.findById(req.params.managerId, 'assignedUlb -_id');
    try {
        const ulbnames = foundTask.assignedUlb.map((ulb) => {
            return ulb;
        })
        const foundDeos = await Task.find({ ulb: { $in: ulbnames }, submit: true });

        foundDeos ? res.status(200).json(foundDeos) : res.status(404).json({
            status: "failure",
            error: "Record not found"
        });
    } catch (err) {
        res.status(500).json({
            status: "failure",
            error: err.message
        })
    }

})


router.get("/task/:userId", auth, authRole("admin", "manager"), async (req, res) => {
    try {
        const foundTasks = await Task.find({
            submittedBy: req.params.userId,
            submit: true
        }).sort({
            createdAt: 'asc'
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

})


router.get('/:taskId', auth, async (req, res) => {


    try {
        const foundTask = await Task.find({
            _id: req.params.taskId,
            submit: true
        });
        foundTask ? res.status(200).json(foundTask) : res.status(404).json({
            status: "failure",
            error: "Record not found"
        });

    } catch (err) {
        res.status(500).json({
            status: "failure",
            error: err.message
        })
    }
});


router.patch('/submit/:taskId', auth, authRole("manager", "deo"), async (req, res) => {

    const {
        title,
        details,
        cause,
        status,
        taskDate
    } = req.body;

    try {
        await Task.findByIdAndUpdate(req.params.taskId, {
            $set: {
                submit: true,
                title,
                details,
                cause,
                status,
                taskDate
            }
        });
        res.status(200).json({
            status: "success",
            message: "Task submitted successfully"
        });
    } catch (err) {
        res.status(500).json({
            status: "failure",
            error: err.message
        })
    }

})


router.patch('/submit', auth, authRole("manager", "deo"), async (req, res) => {

    try {
        const idArray = req.body;
        console.log(idArray);

        const updated = await Task.updateMany({ _id: { $in: idArray } }, { $set: { submit: true } }, { multi: true });
        if (updated) {
            res.status(200).json({
                status: "success",
                message: "Tasks submitted successfully"
            })
        }

    } catch (err) {
        res.status(500).json({
            status: "failure",
            error: err.message
        })
    }

})


router.delete('/:taskId', auth, authRole("admin"), async (req, res) => {

    try {
        await Task.findByIdAndDelete(req.params.taskId);

        res.status(200).json({
            status: "success",
            message: "Task Successfully Deleted"
        });
    } catch (err) {
        res.status(500).json({
            status: "failure",
            error: err.message
        })
    }
});


router.post('/create-task', auth, authRole("deo", "manager"), upload.single('docs'), async (req, res) => {

    const keygen = uuidv4();
    const currentUser = await User.findById(req.user.id);
    const {
        title,
        details,
        cause,
        ulb,
        status,
        taskDate
    } = req.body;
    const foundTitle = await Work.findOne({
        title
    });
    const foundUlb = await Ulb.findOne({
        name: ulb
    });


    try {

        if (!currentUser.active) {
            res.status(403).json({
                status: "failure",
                "message": "Access is denied"
            });
        }
        if (!foundTitle) {
            res.json(`${title} not found in database`)
        }
        if (!foundUlb) {
            res.json(`${ulb} not found in database`)
        }
        let newDoc;
        if (req.file) {
            newDoc = req.file.path;
        } else {
            newDoc = null;
        }

        const task = await new Task({
            titleId: foundTitle._id,
            title: foundTitle.title,
            details,
            cause,
            key: keygen,
            taskDate,
            ulbId: foundUlb._id,
            ulb: foundUlb.name,
            file: newDoc,
            status,
            submittedBy: currentUser._id,
            reportingStaff: currentUser.name
        });
        await task.save();
        let currentTask;
        console.log(keygen);

        currentTask = await Task.findOne({
            key: keygen
        }, '_id');
        console.log(currentTask);
        res.status(201).json({
            status: "success",
            _id: currentTask,
            "message": "Task successfully submitted by " + currentUser.name
        });

    } catch (err) {
        res.status(500).json({
            status: "failure",
            error: err.message
        })
    }

})


router.post('/add-remark/:taskId', auth, authRole("manager"), async (req, res) => {

    const {
        remark
    } = req.body;
    const foundUser = await User.findById(req.user.id);

    try {
        const updateTask = await Task.findByIdAndUpdate(req.params.taskId, {
            $set: {
                remark,
                manager: foundUser.name,
                managerId: foundUser._id
            }
        });

        if (updateTask) {
            res.status(200).json({
                status: "success",
                message: "REMARK_ADDED"
            });
        } else {
            res.status(403).json({
                status: "failure",
                error: "REMARK_ADD_FAILED"
            })
        }

    } catch (err) {
        res.status(500).json({
            status: "failure",
            error: err.message
        })
    }

})

router.get("/manager/deos", auth, authRole("manager"), async (req, res) => {
    let deoList = [];
    const foundTask = await User.findById(req.user.id, 'assignedUlb -_id');


    try {
        const ulbnames = foundTask.assignedUlb.map((ulb) => {
            return ulb;
        })


        const foundDeos = await User.find({ role: "deo", banned: false }, 'name assignedUlb');



        foundDeos.forEach((deo) => {


            if (ulbnames.includes(deo.assignedUlb[0])) {

                deoList.push(deo);

            }
        });
        res.json(deoList);

    } catch (err) {
        res.status(500).json({
            status: "failure",
            error: err.message
        })
    }

});

module.exports = router;
const express = require('express');
const router = express.Router();
const Ulb = require('../../models/Ulb');
const District = require('../../models/District');
const auth = require('../../middleware/auth');
const authRole = require('../../middleware/role');
const Work = require('../../models/Work');


router.get('/ulb', auth, async (req, res) => {

    const foundUlb = await Ulb.find({}, null, { sort: { name: 1 } });

    try {
        res.json(foundUlb);
    } catch (err) {
        res.status(500).json({ status: "failure", error: err.message })
    }

});


router.get('/ulb/assigned/', auth, async (req, res) => {


    try {
        const foundUlb = await User.findById(req.user.id, { _id: 0, assignedUlb: 1 });
        const ulbIdArr = foundUlb.assignedUlb;
        const ulbArr = [];

        for (let i = 0; i < ulbIdArr.length; i++) {
            const ulbName = ulbIdArr[i];
            const ulb = await Ulb.findOne({ name: ulbName }, 'name district');
            ulbArr.push(ulb);
        }

        if (!foundUlb) {
            res.status(400).json({ status: "failure", error: "NO_ULB_ASSIGNED" })
        } else {
            res.status(200).json(ulbArr)
        }
    } catch (err) {
        res.status(403).json({ status: "failure", error: "FAILED_FETCHING_ULB" })
    }

})


router.get('/ulb/:ulbId', auth, async (req, res) => {

    const foundUlb = await Ulb.findOne({ _id: req.params.ulbId });

    try {
        res.json(foundUlb);
    } catch (err) {
        res.status(500).json({ status: "failure", error: err.message })
    }

});



router.get('/ulb/assigned/:userId', auth, async (req, res) => {

    try {
        const foundUlb = await User.findById(req.params.userId, { _id: 0, assignedUlb: 1 });
        const ulbIdArr = foundUlb.assignedUlb;
        const ulbArr = [];

        for (let i = 0; i < ulbIdArr.length; i++) {
            const ulbName = ulbIdArr[i];
            const ulb = await Ulb.findOne({ name: ulbName }, 'name district');
            ulbArr.push(ulb);
        }

        if (!foundUlb) {
            res.status(400).json({ status: "failure", error: "NO_ULB_ASSIGNED" })
        } else {
            res.status(200).json(ulbArr)
        }
    } catch (err) {
        res.status(403).json({ status: "failure", error: "FAILED_FETCHING_ULB" })
    }
}

)


router.get('/ulb/:ulbId/tasks', auth, authRole("admin"), async (req, res) => {
    try {
        const foundTasks = await Task.find({ ulbId: req.params.ulbId });
        res.status(200).json(foundTasks);
    } catch (err) {
        res.status(403).json({ status: "failure", error: "FAILED_FETCHING_TASKS" })
    }
})


router.get('/districts', auth, async (req, res) => {

    const foundDistricts = await District.find({}, null, { sort: { name: 1 } });

    try {
        res.json(foundDistricts);
    } catch (err) {
        res.status(500).json({ status: "failure", error: err.message })
    }

});


router.get('/districts/:districtId', auth, async (req, res) => {

    const foundDistricts = await District.findOne({ _id: req.params.districtId });

    try {
        res.json(foundDistricts);
    } catch (err) {
        res.status(500).json({ status: "failure", error: err.message })
    }

});


router.patch('/ulb/update/:ulbId', auth, authRole("admin"), async (req, res) => {

    const { name, districtId } = req.body;
    const foundUlb = await Ulb.findById(req.params.ulbId);
    const ulbName = foundUlb.name;
    const usedInAnyTask = await Task.find({ ulbId: foundUlb._id });
    const isAssignedtoDeo = await User.find({ assignedulb: { $elemMatch: { $eq: ulbName } } });


    if (usedInAnyTask.length !== 0 || isAssignedtoDeo.length !== 0) {
        res.status(400).json({
            status: "failure", error: "ULB is associated with task or deo"
        });
    } else {
        const foundDist = await District.findOne({ _id: districtId });
        try {
            const update = await Ulb.findByIdAndUpdate(req.params.ulbId, { $set: { name: name, districtId: districtId, district: foundDist.name } });
            if (!update) {
                res.json({
                    status: "failure", error: "ULB not updated"
                });
            }
            res.json({ status: "success", message: "ULB updated successfully" });
        } catch (err) {
            res.status(500).json({ status: "failure", error: err.message });
        }
    }


})



router.post('/create-ulb', auth, authRole("admin"), async (req, res) => {

    const { name, districtId } = req.body

    const foundUlb = await Ulb.findOne({ name });
    const foundDist = await District.findOne({ _id: districtId }).exec();

    if (!foundUlb) {
        try {

            const ulb = new Ulb({
                name,
                district: foundDist.name,
                districtId

            })

            const saved = await ulb.save();
            if (!saved) {
                res.json({ status: "failure", error: "Cannot save to database" });
            }
            res.json({ status: "success", message: `${name} is successfully saved to ULB` });

        } catch (err) {
            res.status(500).json({ status: "failure", error: err.message })
        }
    }
    res.json({ status: "failure", error: "ULB exists" });
})



router.post('/create-district', auth, authRole("admin"), async (req, res) => {


    const { name, state } = req.body
    const foundDist = await District.findOne({ name });
    if (!foundDist) {

        try {
            const dist = new District({
                name,
                state
            })

            const saved = await dist.save();
            if (!saved) {
                res.status(403).json({ status: "failure", error: `Failed to save ${name} in districts` });
            }
            res.json({ status: "success", message: `${name} is successfully saved in districts` });
        } catch (err) {
            res.status(500).json({ status: "failure", error: err.message })
        }
    }
    res.json({ status: "failure", error: `${name} exists` });
});



router.get('/works', auth, async (req, res) => {

    const foundWorks = await Work.find({});

    try {
        res.json(foundWorks);
    } catch (err) {
        res.status(500).json({ status: "failure", error: err.message })
    }

});


router.post('/create-work', auth, authRole("admin"), async (req, res) => {


    const { title } = req.body;
    const foundWork = await Work.findOne({ title });
    if (!foundWork) {

        try {
            const work = new Work({
                title
            })

            const saved = await work.save();
            if (!saved) {
                res.json({ status: "failure", error: `Failed to save ${title} in Works` });
            }
            res.json({ status: "success", message: `${title} is successfully saved in Works` });
        } catch (err) {
            res.status(500).json({ status: "failure", message: err.message })
        }
    }
    res.json({ status: "failure", error: `${title} exists` });
});



router.get('/work/:workId', async (req, res) => {

    try {
        const foundWork = await Work.findById(req.params.workId);
        res.status(200).json(foundWork);
    } catch (err) {
        res.status(500).json({ status: "failure", error: err.message });
    }

})


router.patch('/work/update/:workId', auth, authRole("admin"), async (req, res) => {

    const { title } = req.body;

    try {
        const update = await Work.findByIdAndUpdate(req.params.workId, { $set: { title } });
        if (!update) {
            res.status(403).json({ status: "failure", error: "Updation failed" });
        }
        res.status(200).json({ status: "success", message: "Work updated successfully" });
    } catch (err) {
        res.status(500).json({ status: "failure", error: err.message });
    }

})


router.delete('/work/delete/:workId', auth, authRole("admin"), async (req, res) => {

    try {
        const deleted = await Work.findOneAndDelete({ _id: req.params.workId });
        if (!deleted) {
            res.status(403).json({ status: "failure", error: "Deletion failed" });
        }
        res.status(200).json({ status: "success", message: "Work deleted successfully" });
    } catch (err) {
        res.status(500).json({ status: "failure", error: err.message });
    }

})


module.exports = router;
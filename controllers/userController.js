const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const AppError = require('./../utils/appError')


const filterObj = (obj, ...allowFields) => {
    const newObj = {};
    Object.keys(obj).forEach(key => {
        if (allowFields.includes(key)) newObj[key] = obj[key]
    });

    return newObj
}


exports.createUser = catchAsync(async (req, res, next) => {
     // Cloudinary URL is now available in req.file.path
    if (req.file) {
        req.body.photo = req.file.path; // Cloudinary URL
    }
    const user = await User.create(req.body)

    res.status(201).json({
        status: "success",
        data: {
            user
        }
    })
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find({active:true}).sort({ createdAt: -1 });
    res.status(200).json({
        status: "success",
        result: users.length,
        data: {
            users
        }
    })
})

exports.getUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id)
    if (!user) {
        return next(new AppError("No user found with that ID", '', 404))
    }
    res.status(200).json({
        status: "success",
        data: {
            user
        }
    })
});


exports.getMe = (req, res, next) => {
    req.params.id = req.user._id;
    next();
}

exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Create an error if user trys to update password field
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError("This route is not for password updates, please use /updateMyPassword", '', 401));
    }

    // 2) Remove unwanted fields that are not allowed to be updated
    const filterBody = filterObj(req.body, 'name', 'email', 'phone', 'photo');

    // Cloudinary URL is now available in req.file.path
    if (req.file) {
        req.body.photo = req.file.path; // Cloudinary URL
    }


    //3) Update the user document
    const updatedUser = await User.findByIdAndUpdate(req.user._id, filterBody, {
        new: true,
        runValidators: true
    });
    res.status(200).json({
        status: "success",
        data: {
            user: updatedUser
        }
    })
});

exports.updateUser = catchAsync(async (req, res, next) => {
    // 1) Create an error if user trys to update password field
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError("This route is not for password updates, please use /updateMyPassword", '', 401));
    }

    if (req.file) {
        const host = `${req.protocol}://${req.get('host')}`;
        req.body.photo = `${host}/uploads/users/${req.file.filename}`;
    }

    //2) Update the user document
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    res.status(200).json({
        status: "success",
        data: {
            user: updatedUser
        }
    })
});

exports.deleteUser = catchAsync(async (req, res, next) => {
    // const user = await User.findByIdAndDelete(req.params.id);

    // Instead of findByIdAndDelete, use:
    const user = await User.findByIdAndUpdate(req.params.id, {active: false,}, { new: true });
    if (!user) {
        return next(new AppError('No user was found with that ID', '', 404))
    }
    res.status(204).json({
        data: null
    })
})
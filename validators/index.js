const { body, param } = require('express-validator');

const validateSignUpInput = [
    body("name").trim().not().isEmpty().withMessage("Name is required"),
    body("email").trim().not().isEmpty().withMessage("Email is required").bail().isEmail().withMessage("Please enter a valid email"),
    body("phone_no").trim().not().isEmpty().withMessage("Phone Number is required"),
    body("password").trim().not().isEmpty().withMessage("Password is required").bail().isLength({min:8}).withMessage("Password length is too short"),
    body("country").trim().not().isEmpty().withMessage("Country is required"),
    body("role").trim().not().isEmpty().withMessage("Role is required"),
    body("countryCode").trim().not().isEmpty().withMessage("Country code is required")
];

const validateSigninInput = [
    body("email").trim().not().isEmpty().withMessage("Email is required").bail().isEmail().withMessage("Please enter a valid email"),
    body("password").trim().not().isEmpty().withMessage("Password is required").bail().isLength({min:5}).withMessage("Password length is too short"),
];

const validateBlockUnblockUserInput = [
    body("isBlocked").isBoolean().withMessage("Parameter is required"),
    body("_id").trim().not().isEmpty().withMessage("User Parameter is required")
];


const validateServiceId = [
    body("serviceid").trim().not().isEmpty().withMessage("Parameter is required")
];

// const validateCreateService = [
//     body("service").trim().not().isEmpty().withMessage("Parameter is required")
// ];

const validateUpdateService = [
    body("name").trim().not().isEmpty().withMessage("Name is required"),
    body("amount").isNumeric().withMessage("Amount is required"),
    body("category").trim().not().isEmpty().withMessage("Category is required"),
    body("description").trim().not().isEmpty().withMessage("Description is required"),
    body("chargeAmount").isNumeric().withMessage("Charge amount is required")
];

// const validateCreateCenter = [
//     body("center").trim().not().isEmpty().withMessage("Parameter is required")
// ];

const validateUpdateCenter = [
    body("address").trim().not().isEmpty().withMessage("Address is required"),
    body("email").trim().not().isEmpty().withMessage("Email is required").bail().isEmail().withMessage("Please enter a valid email"),
    body("location").trim().isEmpty().withMessage("Location is required"),
    body("phone").trim().not().isEmpty().withMessage("Location is required"),
    body("_id").trim().not().isEmpty().withMessage("Parameter is required"),
    body("name").trim().not().isEmpty().withMessage("Name is required"),
];

// const validateBookService = [
//     body("address").trim().not().isEmpty().withMessage("Address is required"),
//     body("email").trim().not().isEmpty().withMessage("Email is required"),
//     body("location").trim().not().isEmpty().withMessage("Location is required"),
//     body("phone").trim().not().isEmpty().withMessage("Location is required"),
//     body("_id").trim().not().isEmpty().withMessage("Parameter is required"),
//     body("name").trim().not().isEmpty().withMessage("Name is required"),
// ];

const validateUpdateBooking = [
    body("organization").trim().not().isEmpty().withMessage("Organization is required"),
    body("date").trim().not().isEmpty().withMessage("Date is required"),
    body("time").trim().not().isEmpty().withMessage("Time is required"),
    body("userCenter").trim().not().isEmpty().withMessage("User center is required"),
    body("_id").trim().not().isEmpty().withMessage("Parameter is required"),
    body("status").trim().not().isEmpty().withMessage("Status is required"),
];

const validateBookingByUserId = [
    body("serviceid").trim().not().isEmpty().withMessage("Parameter is required")
];

const validateBookingByEmail = [
    param("email").trim().not().isEmpty().withMessage("Email is required").bail().isEmail().withMessage("Please enter a valid email")
];

const validateProfile = [
    body("email").trim().not().isEmpty().withMessage("Email is required").bail().isEmail().withMessage("Please enter a valid email"),
    body("_id").trim().not().isEmpty().withMessage("Parameter is required"),
    body("phone_no").trim().not().isEmpty().withMessage("Location is required"),
    body("name").trim().not().isEmpty().withMessage("Name is required"),
];

const validateEditUser = [
    body("name").trim().not().isEmpty().withMessage("Name is required"),
    body("email").trim().not().isEmpty().withMessage("Email is required").bail().isEmail().withMessage("Please enter a valid email"),
    body("phone_no").trim().not().isEmpty().withMessage("Phone Number is required"),
    body("country").trim().not().isEmpty().withMessage("Country is required"),
    body("role").trim().not().isEmpty().withMessage("Role is required"),
    body("countryCode").trim().not().isEmpty().withMessage("Country code is required")
];

const validateCancelBooking = [
    body("serviceid").trim().not().isEmpty().withMessage("Parameter is required"),
    body("bookingid").trim().not().isEmpty().withMessage("Parameter is required")
];

module.exports = {validateSignUpInput, validateSigninInput, validateBlockUnblockUserInput, validateServiceId, validateUpdateService, validateUpdateCenter, validateUpdateBooking, validateBookingByUserId, validateCancelBooking, validateBookingByEmail,validateProfile, validateEditUser};
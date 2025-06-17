import { body } from "express-validator";
import { validarCampos } from "./validar-campos.js";
//import { existenteEmail,  } from "../helpers/db-validator.js";

export const registerValidator = [
    body("name", "The naem is required!").not().isEmpty(),
    body("email", "You must enter a valid email!").isEmail(),
    body("password", "Password must be at least 8 cahracters!").isLength({ min: 8 }),
    validarCampos
];

export const loginValidator = [
    body("email").optional().isEmail().withMessage("Enter a valid email address!"),
    body("username").optional().isString().withMessage("Enter a valid username!"),
    body("password", "Password must be at least 8 characters!").isLength({ min: 8 }),
    validarCampos
];

export const createProductValidator = [
    body("name", "El nombre del producto es requerido").not().isEmpty(),
    body("description", "La descripción es requerida").not().isEmpty(),
    body("category", "La categoría es requerida").not().isEmpty(),
    validarCampos
];

export const createServiceValidator = [
    body("name", "El nombre del servicio es requerido").not().isEmpty(),
    body("description", "La descripción del servicio es requerida").not().isEmpty(),
    validarCampos
];


export const createBrandValidator = [
    body("name", "El nombre de la marca es requerido").not().isEmpty(),
    validarCampos
];
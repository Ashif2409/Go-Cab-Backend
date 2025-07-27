import express from 'express';
import { authUser } from '../middleware/auth.middleware';
import { getAutoCompleteAddressSuggestion, getCoordinates, getDistTime } from '../controllers/map.controller';
const {query} = require('express-validator');
const router = express.Router();

router.get('/get-coordinates',
            query('address').isString().isLength({min:3}).withMessage('Address must be a string with at least 3 characters'),
            authUser,
            getCoordinates);

router.get('/get-distance-time',
            query('origin').isString().withMessage('Origin must be a valid address'),
            query('destination').isString().withMessage('Destination must be a valid address'),
            authUser,
            getDistTime
)

router.get('/get-suggestions',
            query('input').isString().isLength({min:3}).withMessage('Input must be a string with at least 3 characters'),
            authUser,
            getAutoCompleteAddressSuggestion
);
export default router;
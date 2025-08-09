import express from 'express';
import cql from '../handlers/cqlHandler.js';

const CQLRouter = express.Router();

// Routes for /authoring/api/cql
CQLRouter.route('/').post(cql.objToZippedCql);

CQLRouter.route('/validate').post(cql.objToELM);
CQLRouter.route('/viewCql').post(cql.objToViewableCql);

export default CQLRouter;

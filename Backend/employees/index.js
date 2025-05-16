const express = require('express');
const router = express.Router();
const db = require('../_helpers/db');
const authorize = require('../_middleware/authorize');
const Role = require('../_helpers/role');

router.get('/next-id', authorize(), getNextEmployeeId);
router.post('/', authorize(Role.Admin), create);
router.get('/', authorize(), getAll);
router.get('/:id', authorize(), getById);
router.put('/:id', authorize(Role.Admin), update);
router.delete('/:id', authorize(Role.Admin), _delete);
router.post('/:id/transfer', authorize(Role.Admin), transfer);

async function getNextEmployeeId(req, res, next) {
    try {
        const latestEmployee = await db.Employee.findOne({
            order: [['id', 'DESC']]
        });
        const nextId = latestEmployee ? latestEmployee.id + 1 : 1;
        res.json({ employeeId: `EM${nextId}` });
    } catch (err) { next(err); }
}

async function create(req, res, next) {
    try {
        // Get the latest employee to determine the next ID
        const latestEmployee = await db.Employee.findOne({
            order: [['id', 'DESC']]
        });

        // Generate the next employee ID
        const nextId = latestEmployee ? latestEmployee.id + 1 : 1;
        const defaultEmployeeId = `EM${nextId}`;

        // Create the employee with the provided ID or default ID
        const employee = await db.Employee.create({
            ...req.body,
            employeeId: req.body.employeeId || defaultEmployeeId
        });

        res.status(201).json(employee);
    } catch (err) { next(err); }
}

async function getAll(req, res, next) {
    try {
        const employees = await db.Employee.findAll({
            include: [
                { model: db.Account, as: 'user' },
                { model: db.Department, as: 'Department' }
            ]
        });
        res.json(employees);
    } catch (err) { next(err); }
}

async function getById(req, res, next) {
    try {
        const employee = await db.Employee.findByPk(req.params.id, {
            include: [
                { model: db.Account, as: 'user' },
                { model: db.Department, as: 'Department' }
            ]
        });
        if (!employee) throw new Error('Employee not found');
        res.json(employee);
    } catch (err) { next(err); }
}

async function update(req, res, next) {
    try {
        const employee = await db.Employee.findByPk(req.params.id);
        if (!employee) throw new Error('Employee not found');
        await employee.update(req.body);
        
        // Fetch the updated employee with related data
        const updatedEmployee = await db.Employee.findByPk(req.params.id, {
            include: [
                { model: db.Account, as: 'user' },
                { model: db.Department, as: 'Department' }
            ]
        });
        
        res.json(updatedEmployee);
    } catch (err) { next(err); }
}

async function _delete(req, res, next) {
    try {
        const employee = await db.Employee.findByPk(req.params.id);
        if (!employee) throw new Error('Employee not found');
        await employee.destroy();
        res.json({ message: 'Employee deleted' });
    } catch (err) { next(err); }
}

async function transfer(req, res, next) {
    try {
        const employee = await db.Employee.findByPk(req.params.id);
       if (!employee) throw new Error('Employee not found');
       await employee.update({ departmentId: req.body.departmentId });
       await db.Workflow.create({
           employeeId: employee.id,
           type: 'transfer',
           details: {newDepartmentId: req.body.departmentId}
       });
       res.json({ message: 'Employee transferred'});
    } catch (err) { next(err); }
}

module.exports = router;
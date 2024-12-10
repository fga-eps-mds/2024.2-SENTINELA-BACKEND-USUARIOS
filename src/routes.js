const express = require("express");
const routes = express.Router();
const UserController = require("./Controllers/userController");
const RoleController = require("./Controllers/roleController");

const { tokenValidation } = require("./Utils/token");

const MembershipForm = require("./Controllers/membershipController");
const TokenController = require("./Controllers/tokenController");
const OrganController = require("./Controllers/organController");

//// Private Routes
// --user
routes.get("/users", tokenValidation, UserController.getUsers);
routes.get("/users/:id", tokenValidation, UserController.getUserById);
routes.get("/user", tokenValidation, UserController.getLoggedUser);
routes.patch("/users/patch/:id", tokenValidation, UserController.patchUser);
routes.delete("/users/delete/:id", tokenValidation, UserController.deleteUser);
routes.put("/user", tokenValidation, UserController.update);

// --roles
routes.post("/role/create", RoleController.createRole);
routes.get("/role", RoleController.getAllRoles);
routes.get("/role/:id", RoleController.getRoleById);
routes.patch("/role/patch/:id", RoleController.updateRoleById);
routes.delete("/role/delete/:id", RoleController.deleteRoleById);

// --organ
routes.post("/organ/create", OrganController.createOrgan);
routes.get("/organ/list", OrganController.listOrgans);
routes.patch("/organ/update/:id", OrganController.updateOrgan);
routes.get("/organ/get/:id", OrganController.getOrganById);
routes.delete("/organ/delete/:id", OrganController.deleteOrganById);

//// Public Routes (No token required)
// --user and memberShip
routes.post("/signup", UserController.signUp);
routes.post("/login", UserController.login);
routes.post("/users/recover-password", UserController.recoverPassword);
routes.post("/verify-token", TokenController.getToken);
routes.patch("/users/change-password/:id", UserController.changePassword);
routes.patch(
    "/users/renew-password",
    tokenValidation,
    UserController.changePasswordInProfile
);

//
routes.post("/membership/create", MembershipForm.createMembershipForm);
routes.get("/membership", MembershipForm.getMembershipForm);
routes.delete("/membership/delete/:id", MembershipForm.deleteMembershipForm);
routes.patch(
    "/membership/updateStatus/:id",
    MembershipForm.updateStatusMembership
);
routes.patch("/membership/update/:id", MembershipForm.updateMembership);
routes.get("/membership/:id", MembershipForm.getMembershipById);

module.exports = routes;

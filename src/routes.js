const express = require("express");
const routes = express.Router();
const UserController = require("./Controllers/userController");
const RoleController = require("./Controllers/roleController");

const { tokenValidation } = require("./Utils/token");

const MembershipForm = require("./Controllers/membershipController");
const TokenController = require("./Controllers/tokenController");
const OrganController = require("./Controllers/organController");
const permissionController = require("./Controllers/permissionsController");
const checkPermissions = require("./Middlewares/accessControlMiddleware");

//// Private Routes
// Users Routes
routes.get(
    "/users",
    checkPermissions("usuarios_visualizar"),
    UserController.getUsers
);
routes.get(
    "/users/:id",
    checkPermissions("usuarios_visualizar"),
    UserController.getUserById
);
routes.get(
    "/user",
    checkPermissions("usuarios_visualizar"),
    UserController.getLoggedUser
);
routes.patch(
    "/users/patch/:id",
    checkPermissions("usuarios_editar"),
    UserController.patchUser
);
routes.delete(
    "/users/delete/:id",
    checkPermissions("usuarios_deletar"),
    UserController.deleteUser
);
routes.put("/user", checkPermissions("usuarios_editar"), UserController.update);

// Roles Routes
routes.post(
    "/role/create",
    checkPermissions("perfis_criar"),
    RoleController.createRole
);
routes.get(
    "/role",
    checkPermissions("perfis_visualizar"),
    RoleController.getAllRoles
);
routes.get(
    "/role/:id",
    checkPermissions("perfis_visualizar"),
    RoleController.getRoleById
);
routes.patch(
    "/role/patch/:id",
    checkPermissions("perfis_editar"),
    RoleController.updateRoleById
);
routes.delete(
    "/role/delete/:id",
    checkPermissions("perfis_deletar"),
    RoleController.deleteRoleById
);
routes.put(
    "/roles/:roleId/permissions",
    checkPermissions("permissoes_editar"),
    RoleController.assignPermissionsToRole
);

// Permissions Routes
routes.post(
    "/permission/create",
    checkPermissions("permissoes_criar"),
    permissionController.createPermission
);
routes.get(
    "/permission",
    checkPermissions("permissoes_visualizar"),
    permissionController.getAllPermissions
);
routes.get(
    "/permission/:id",
    checkPermissions("permissoes_visualizar"),
    permissionController.getPermissionById
);
routes.patch(
    "/permission/patch/:id",
    checkPermissions("permissoes_editar"),
    permissionController.updatePermissionById
);
routes.delete(
    "/permission/delete/:id",
    checkPermissions("permissoes_deletar"),
    permissionController.deletePermissionById
);

routes.get(
    "/permissions/search",
    checkPermissions("permissoes_visualizar"),
    permissionController.searchPermissionByName
);

// Organ Routes
routes.post(
    "/organ/create",
    checkPermissions("orgaos_criar"),
    OrganController.createOrgan
);
routes.get(
    "/organ/list",
    checkPermissions("orgaos_visualizar"),
    OrganController.listOrgans
);
routes.patch(
    "/organ/update/:id",
    checkPermissions("orgaos_editar"),
    OrganController.updateOrgan
);
routes.get(
    "/organ/get/:id",
    checkPermissions("orgaos_visualizar"),
    OrganController.getOrganById
);
routes.delete(
    "/organ/delete/:id",
    checkPermissions("orgaos_deletar"),
    OrganController.deleteOrganById
);

// Membership Routes
routes.post(
    "/membership/create",
    checkPermissions("beneficios_criar"),
    MembershipForm.createMembershipForm
);
routes.get(
    "/membership",
    checkPermissions("beneficios_visualizar"),
    MembershipForm.getMembershipForm
);
routes.get(
    "/logged-membership",
    checkPermissions("beneficios_visualizar"),
    MembershipForm.getLoggedMembershipForm
);
routes.delete(
    "/membership/delete/:id",
    checkPermissions("beneficios_deletar"),
    MembershipForm.deleteMembershipForm
);
routes.patch(
    "/membership/updateStatus/:id",
    checkPermissions("beneficios_editar"),
    MembershipForm.updateStatusMembership
);
routes.patch(
    "/membership/update/:id",
    checkPermissions("beneficios_editar"),
    MembershipForm.updateMembership
);
routes.get(
    "/membership/:id",
    checkPermissions("beneficios_visualizar"),
    MembershipForm.getMembershipById
);

routes.post("/signup", UserController.signUp);
routes.post("/login", UserController.login);
routes.post("/users/recover-password", UserController.recoverPassword);
routes.post("/verify-token", TokenController.getToken);
routes.patch("/users/change-password/:id", UserController.changePassword);
routes.patch("/users/renew-password", UserController.changePasswordInProfile);

module.exports = routes;

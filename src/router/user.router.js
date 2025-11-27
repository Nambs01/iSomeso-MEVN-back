const router = require("express").Router();
const AuthMiddleware = require("../middleware/auth.middleware");
const AvatarMiddleware = require("../middleware/avatar.middleware");
const AuthController = require("../controllers/auth.controller");
const UserController = require("../controllers/user.controller");

/*================================
        AUTHENTIFICATION
==================================*/

router.post("/login", AuthController.login);

router.post("/logout", AuthMiddleware, AuthController.logout);

router.post("/logoutAll", AuthMiddleware, AuthController.logoutAll);

router.post("/refresh-token", AuthController.refreshToken);

router.post("/register", AuthController.register);

/*=========================
            USER
===========================*/

router.get("/user/:id", AuthMiddleware, UserController.getUser);

router.get("/users", AuthMiddleware, UserController.getAllUsers);

router.get("/users/me", AuthMiddleware, UserController.getUserInfo);

router.patch("/users/me", AuthMiddleware, UserController.updateUser);

router.delete("/users/me", AuthMiddleware, UserController.deleteUser);

/*============================
            AVATAR
==============================*/

router.post("/users/me/avatar", AuthMiddleware, AvatarMiddleware, UserController.updateUserAvatar);

router.delete("/users/me/avatar", AuthMiddleware, UserController.deleteUserAvatar);

router.get("/users/:id/avatar", UserController.getUserAvatar);

module.exports = router;

const { AuthService } = require("../services/auth.service");

const login = async (req, res) => await AuthService.handleLogin(req, res);

const logout = async (req, res) => await AuthService.handleLogout(req, res);

const logoutAll = async (req, res) => await AuthService.handleLogoutAll(req, res);

const refreshToken = async (req, res) => await AuthService.handleRefreshToken(req, res);

const register = async (req, res) => await AuthService.handleRegister(req, res);

module.exports = {
    login,
    logout,
    logoutAll,
    refreshToken,
    register,
};

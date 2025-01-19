const User = require("../Models/userSchema");
const jwt = require("jsonwebtoken");
const { SECRET } = process.env;

const bcrypt = require("bcryptjs");
const {
    generateToken,
    generateRecoveryPasswordToken,
} = require("../Utils/token");
const { sendEmail } = require("../Utils/email");
const generator = require("generate-password");
const Token = require("../Models/tokenSchema");
const Role = require("../Models/roleSchema");

const salt = bcrypt.genSaltSync();

const signUp = async (req, res) => {
    try {
        const user = new User(req.body);

        const temp_pass = generator.generate({
            length: 8,
            numbers: true,
        });

        user.password = bcrypt.hashSync(temp_pass, salt);

        await user.save();

        const token = generateRecoveryPasswordToken(user._id);

        await Token.findOneAndDelete({ email: user.email });

        const newToken = new Token({ token: token, email: user.email });
        await newToken.save();

        let url;
        if (process.env.NODE_ENV === "deployment") {
            url = `https://seu-dominio.com/trocar-senha/${token}`;
        } else {
            url = `http://localhost:5173/trocar-senha/${token}`;
        }

        if (process.env.NODE_ENV !== "test") {
            const bodyEmail = `Olá ${user.name},
            <br /><br />
            É um prazer tê-la conosco. O Sentinela oferece uma experiência única em gestão sindical, com suporte e atendimento personalizados.
            <br />
            sua senha temporária é:
            <br />
            ${temp_pass}
            <br />
            Para criar uma senha de acesso ao sistema clique: <a href="${url}">Link</a>
            <br /><br />
            Caso tenha dúvidas sobre o acesso à sua conta ou outras questões, entre em contato com nossa equipe de Suporte através do e-mail 
            suporte@sentinela.sindpol.org.br ou pelo telefone (61) 3321-1949. Estamos disponíveis de segunda a sexta-feira
            , das 8h às 12h e das 14h às 18h no horário de Brasília.
            `;
            const sended = await sendEmail(
                user.email,
                "Acesso a plataforma Sentinela",
                bodyEmail
            );

            if (!sended) {
                return res.json({ mensagem: "Falha ao enviar email." });
            }
        }

        res.status(201).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (typeof email == "string") {
            const user = await User.findOne({ email: email, status: true });
            if (!user) {
                return res
                    .status(400)
                    .send({ error: "Email ou senha inválidos." });
            } else if (!bcrypt.compareSync(password, user.password)) {
                return res
                    .status(400)
                    .send({ error: "Email ou senha inválidos." });
            }

            const roles_permissions = await Role.findOne({
                _id: user.role._id,
            }).populate("permissions");

            roles_permissions_data = {
                _id: roles_permissions._id,
                name: roles_permissions.name,
                permissions: [
                    ...roles_permissions._doc.permissions.map(x => {return x.name})
                ]
            }
            const token = generateToken(user._id, roles_permissions_data);


            return res.status(200).json({
                token,
                user,
                permissions: roles_permissions._doc.permissions.map(x => {return x.name})
            });
        } else {
            return res.status(500).send({ error: "Tipo de dado incorreto" });
        }
    } catch (error) {
        res.status(500).send(error);
    }
};

const getUsers = async (req, res) => {
    try {
        const user = await User.find().populate("role");
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send(error);
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate("role");
        if (!user) {
            return res.status(404).send();
        }
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send(error);
    }
};

const getLoggedUserId = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Token não fornecido" });
    }
    try {
        const decoded = jwt.verify(token, SECRET ?? "S3T1N3L3L4");

        userId = decoded.id;
    } catch (err) {
        console.log(err);
        return -1;
    }
    return userId;
};

const getLoggedUser = async (req, res) => {
    const userId = await getLoggedUserId(req, res);

    try {
        const user = await User.findById(userId).populate("role");
        if (!user) {
            return res.status(404).send();
        }
        return res.status(200).send(user);
    } catch (error) {
        // return res.status(500).send(error);
        return res
            .status(500)
            .send({ message: error.message || "Erro interno no servidor" });
    }
};

const patchUser = async (req, res) => {
    const userId = req.params.id;

    try {
        // Encontre o usuário pelo ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send();
        }

        Object.assign(user, req.body.updatedUser);

        user.updatedAt = new Date();

        await user.save();

        res.status(200).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
};
const deleteUser = async (req, res) => {
    try {
        // Encontre o usuário pelo ID
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verifique se o usuário está protegido
        if (user.isProtected) {
            return res
                .status(403)
                .json({ message: "Cannot delete protected user" });
        }

        // Se o usuário não for protegido, realize a exclusão
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const update = async (req, res) => {
    let userId;

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Token não fornecido" });
    }

    try {
        const decoded = jwt.verify(token, SECRET);

        userId = decoded.id;
    } catch (err) {
        console.log(err);

        return res.status(401).json({ message: "Token inválido ou expirado" });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send();
        }

        Object.assign(user, req.body.updatedUser);

        user.updatedAt = new Date();

        await user.save();

        res.status(200).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
};

const recoverPassword = async (req, res) => {
    try {
        const { email } = req.body.data;
        const user = await User.findOne({ email: email });

        if (!user) {
            return res
                .status(404)
                .json({ mensagem: "Usuário não encontrado." });
        }

        // Gerar o token de recuperação de senha
        const token = generateRecoveryPasswordToken(user._id);

        // Verificar se já existe um token para o email
        if (typeof email == "string") {
            await Token.findOneAndDelete({ email });
        }

        // Criar e salvar um novo token
        const newToken = new Token({ token, email });
        await newToken.save();

        let url;
        if (process.env.NODE_ENV === "deployment") {
            url = `${process.env.DOMINIO}/trocar-senha/${token}`;
        } else {
            url = `http://localhost:5173/trocar-senha/${token}`;
        }

        const bodyEmail = `
            Acesse o link abaixo para trocar a senha: 
            <br />
            <a href="${url}">Link</a>
        `;
        const sended = await sendEmail(
            user.email,
            "Redefinição de senha",
            bodyEmail
        );

        if (!sended) {
            return res.json({ mensagem: "Falha ao enviar email." });
        }

        return res.json({
            mensagem: "Email enviado com instruções para redefinir sua senha.",
        });
    } catch (err) {
        return res
            .status(500)
            .json({ mensagem: "Erro interno ao processar solicitação.", err });
    }
};

const changePassword = async (req, res) => {
    const { newPassword } = req.body;
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);

        // if (!user) {
        //     return res.status(404).send({ message: "usuário não encontrado" });
        // }

        user.password = bcrypt.hashSync(newPassword, salt);

        await user.save();
        await Token.findOneAndDelete({ email: user.email });

        return res.status(200).json({
            mensagem: "senha alterada com sucesso.",
        });
    } catch (error) {
        return res.status(500).send({
            message: "Erro ao salvar o usuário",
            error: error.message,
        });
    }
};

const changePasswordInProfile = async (req, res) => {
    const { old_password, new_password } = req.body;

    const userId = await getLoggedUserId(req, res);

    const user = await User.findById(userId);

    if (!bcrypt.compareSync(old_password, user.password)) {
        return res.status(401).json({
            mensagem: "Senha atual incorreta.",
        });
    }

    user.password = bcrypt.hashSync(new_password, salt);
    await user.save();

    return res.status(200).json({
        mensagem: "senha alterada com sucesso.",
    });
};

module.exports = {
    signUp,
    login,
    getUsers,
    getUserById,
    update,
    getLoggedUser,
    deleteUser,
    patchUser,
    recoverPassword,
    changePassword,
    changePasswordInProfile,
};

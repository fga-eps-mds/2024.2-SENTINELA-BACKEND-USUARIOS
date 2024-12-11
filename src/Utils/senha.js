const bcrypt = require("bcryptjs");
const saltRounds = 13;

const hashSenha = async (senha) => {
    try {
        const hashSenha = await bcrypt.hash(senha, saltRounds);
        return hashSenha;
    } catch (error) {
        console.error("Nao foi possivel criar a hash", error);
        return {
            status: false,
            erro: "Erro ao criar hash da senha",
        };
    }
};

const comparaSenha = async (senha, senhaSalva) => {
    try {
        const comparaSenha = await bcrypt.compare(senha, senhaSalva);
        return comparaSenha;
    } catch (error) {
        console.error("erro ao comparar senha", error);
        return {
            status: false,
            error: "erro ao comparar sneha",
        };
    }
};

module.exports = {
    hashSenha,
    comparaSenha,
};

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

const validaSenha = (novaSenha) => {
    const comprimentoMinimo = 8;
    const temMaiuscula = /[A-Z]/.test(novaSenha);
    const temMinuscula = /[a-z]/.test(novaSenha);
    const temNumero = /\d/.test(novaSenha);

    return (
        novaSenha.legnth >= comprimentoMinimo &&
        temMinuscula &&
        temMaiuscula &&
        temNumero
    );
};

module.exports = {
    hashSenha,
    comparaSenha,
    validaSenha,
};

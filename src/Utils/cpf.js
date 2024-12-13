const validarCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]+/g, "");

    if (cpf.length !== 11) {
        console.error("Erro: CPF deve conter 11 d�gitos");
        return false;
    }

    if (/^(\d)\1+$/.test(cpf)) {
        console.error("Erro: CPF n�o pode conter todos d�gitos iguais");
        return false;
    }

    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) {
        resto = 0;
    }
    if (resto !== parseInt(cpf.charAt(9))) {
        console.error("Erro: Primeiro d�gito verificador do CPF � inv�lido");
        return false;
    }

    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) {
        resto = 0;
    }
    if (resto !== parseInt(cpf.charAt(10))) {
        console.error("Erro: Segundo d�gito verificador do CPF � inv�lido");
        return false;
    }

    return true;
};

module.exports = {
    validarCPF,
};

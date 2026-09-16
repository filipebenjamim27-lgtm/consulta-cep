from api import consultar_cep, ErroConsultaCEP


def validar_cep(cep: str) -> str:
    """
    Valida e normaliza um CEP.

    Args:
        cep: CEP informado pelo usuário.

    Returns:
        CEP contendo apenas números.

    Raises:
        ValueError: quando o CEP não possui oito dígitos.
    """
    cep = cep.replace("-", "").replace(".", "").replace(" ", "")

    if not cep.isdigit() or len(cep) != 8:
        raise ValueError("O CEP deve possuir 8 dígitos.")

    return cep


def exibir_endereco(endereco):
    """
    Exibe os dados de um endereço no terminal.
    """
    print("\n--- Endereço encontrado ---")
    print(f"CEP: {endereco.cep}")
    print(f"Logradouro: {endereco.logradouro}")
    print(f"Bairro: {endereco.bairro}")
    print(f"Cidade: {endereco.cidade}")
    print(f"Estado: {endereco.estado}")


def main():
    """
    Executa o fluxo principal da aplicação.
    """
    import sys
    sys.stdout.flush()
    cep = input("Digite o CEP: ")

    try:
        cep = validar_cep(cep)
        endereco = consultar_cep(cep)
        exibir_endereco(endereco)

    except ValueError as error:
        print(f"\nErro: {error}")

    except ErroConsultaCEP as error:
        print(f"\nErro: {error}")


if __name__ == "__main__":
    main()
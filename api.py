import requests

from models import Endereco


BASE_URL = "https://viacep.com.br/ws"


class ErroConsultaCEP(Exception):
    """Representa erros ocorridos durante a consulta do CEP."""


def consultar_cep(cep: str) -> Endereco:
    """
    Consulta um CEP na API ViaCEP.

    Args:
        cep: CEP que será consultado.

    Returns:
        Um objeto Endereco com os dados encontrados.

    Raises:
        ErroConsultaCEP: quando ocorre algum problema na consulta.
    """
    url = f"{BASE_URL}/{cep}/json/"

    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
    except requests.exceptions.Timeout as exc:
        raise ErroConsultaCEP(
            "A consulta demorou muito. Tente novamente."
        ) from exc
    except requests.exceptions.RequestException as exc:
        raise ErroConsultaCEP(
            "Não foi possível consultar a API. Verifique sua conexão."
        ) from exc

    data = response.json()

    if data.get("erro"):
        raise ErroConsultaCEP("CEP não encontrado.")

    return Endereco(
        cep=data.get("cep", ""),
        logradouro=data.get("logradouro", ""),
        bairro=data.get("bairro", ""),
        cidade=data.get("localidade", ""),
        estado=data.get("uf", ""),
    )
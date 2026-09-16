from dataclasses import dataclass


@dataclass
class Endereco:
    cep: str
    logradouro: str
    bairro: str
    cidade: str
    estado: str

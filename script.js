// =====================================================
// CONFIGURAÇÃO
// =====================================================

// Chave da Geoapify fornecida pelo usuário
const GEOAPIFY_API_KEY =
    "e72c83ba8587470d9b1e0d8aca2a7d9a";


// =====================================================
// ELEMENTOS DA PÁGINA
// =====================================================

const campoCep =
    document.getElementById("cep");

const botaoBuscar =
    document.getElementById("buscar");

const mensagem =
    document.getElementById("mensagem");

const resultado =
    document.getElementById("resultado");

const resultadoCep =
    document.getElementById("resultadoCep");

const logradouro =
    document.getElementById("logradouro");

const bairro =
    document.getElementById("bairro");

const cidade =
    document.getElementById("cidade");

const estado =
    document.getElementById("estado");

const coordenadas =
    document.getElementById("coordenadas");


// =====================================================
// MAPA
// =====================================================

// Começa mostrando o Brasil
const mapa = L.map("mapa", {
    zoomControl: true,
    scrollWheelZoom: true,
    dragging: true,
    doubleClickZoom: true,
    touchZoom: true
}).setView(
    [-14.2350, -51.9253],
    4
);


// =====================================================
// OPENSTREETMAP
// =====================================================

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom: 19,

        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
    }
).addTo(mapa);


// Marcador atual
let marcador = null;


// =====================================================
// FORMATAR CEP
// =====================================================

function formatarCep(valor) {

    valor = valor.replace(/\D/g, "");

    if (valor.length > 5) {

        valor =
            valor.substring(0, 5) +
            "-" +
            valor.substring(5, 8);

    }

    return valor;
}


// =====================================================
// MENSAGEM
// =====================================================

function mostrarMensagem(
    texto,
    tipo = "normal"
) {

    mensagem.textContent = texto;

    if (tipo === "erro") {

        mensagem.style.color = "#dc2626";

    } else if (tipo === "sucesso") {

        mensagem.style.color = "#16a34a";

    } else {

        mensagem.style.color = "#2563eb";

    }
}


// =====================================================
// INPUT DO CEP
// =====================================================

campoCep.addEventListener(
    "input",
    function () {

        campoCep.value =
            formatarCep(
                campoCep.value
            );

    }
);


// =====================================================
// CONSULTAR CEP
// =====================================================

async function consultarCep() {

    const cep =
        campoCep.value
            .replace(/\D/g, "");


    // -----------------------------------------------
    // VALIDAR CEP
    // -----------------------------------------------

    if (cep.length !== 8) {

        mostrarMensagem(
            "Digite um CEP válido com 8 números.",
            "erro"
        );

        resultado.style.display = "none";

        return;
    }


    // -----------------------------------------------
    // VERIFICAR API KEY
    // -----------------------------------------------

    if (
        !GEOAPIFY_API_KEY ||
        GEOAPIFY_API_KEY ===
            "COLE_SUA_CHAVE_AQUI"
    ) {

        mostrarMensagem(
            "A chave da Geoapify não foi configurada.",
            "erro"
        );

        return;
    }


    // -----------------------------------------------
    // ESTADO DO BOTÃO
    // -----------------------------------------------

    botaoBuscar.disabled = true;

    botaoBuscar.textContent =
        "Consultando...";


    mostrarMensagem(
        "Consultando o CEP..."
    );

    resultado.style.display =
        "none";


    try {

        // =================================================
        // VIA CEP
        // =================================================

        const respostaCep =
            await fetch(
                `https://viacep.com.br/ws/${cep}/json/`
            );


        if (!respostaCep.ok) {

            throw new Error(
                "Não foi possível acessar o ViaCEP."
            );

        }


        const endereco =
            await respostaCep.json();


        // CEP inexistente
        if (endereco.erro) {

            throw new Error(
                "CEP não encontrado."
            );

        }


        // =================================================
        // PREENCHER DADOS
        // =================================================

        resultadoCep.textContent =
            formatarCep(cep);


        logradouro.textContent =
            endereco.logradouro ||
            "Não informado";


        bairro.textContent =
            endereco.bairro ||
            "Não informado";


        cidade.textContent =
            endereco.localidade ||
            "Não informado";


        estado.textContent =
            endereco.uf ||
            "Não informado";


        // =================================================
        // ENDEREÇO COMPLETO
        // =================================================

        const partesEndereco = [

            endereco.logradouro,

            endereco.bairro,

            endereco.localidade,

            endereco.uf,

            cep,

            "Brasil"

        ].filter(Boolean);


        const enderecoCompleto =
            partesEndereco.join(", ");


        // =================================================
        // GEOAPIFY
        // =================================================

        mostrarMensagem(
            "Localizando o endereço no mapa..."
        );


        const parametros =
            new URLSearchParams({

                text: enderecoCompleto,

                lang: "pt",

                limit: "1",

                format: "json",

                filter: "countrycode:br",

                apiKey:
                    GEOAPIFY_API_KEY

            });


        const url =
            `https://api.geoapify.com/v1/geocode/search?${parametros}`;


        const respostaGeoapify =
            await fetch(url);


        // =================================================
        // TRATAMENTO DOS ERROS
        // =================================================

        if (!respostaGeoapify.ok) {

            if (
                respostaGeoapify.status === 401
            ) {

                throw new Error(
                    "A chave da Geoapify é inválida ou não está autorizada."
                );

            }


            if (
                respostaGeoapify.status === 403
            ) {

                throw new Error(
                    "A Geoapify recusou o acesso. Verifique as restrições da chave."
                );

            }


            if (
                respostaGeoapify.status === 429
            ) {

                throw new Error(
                    "O limite gratuito da Geoapify foi atingido. Tente novamente mais tarde."
                );

            }


            throw new Error(
                `Erro da Geoapify: HTTP ${respostaGeoapify.status}`
            );

        }


        const dadosGeoapify =
            await respostaGeoapify.json();


        // =================================================
        // VERIFICAR RESULTADOS
        // =================================================

        if (
            !dadosGeoapify.results ||
            dadosGeoapify.results.length === 0
        ) {

            throw new Error(
                "O endereço foi encontrado pelo ViaCEP, mas não foi localizado no mapa."
            );

        }


        const localizacao =
            dadosGeoapify.results[0];


        const latitude =
            Number(localizacao.lat);


        const longitude =
            Number(localizacao.lon);


        // =================================================
        // VALIDAR COORDENADAS
        // =================================================

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {

            throw new Error(
                "A API não retornou coordenadas válidas."
            );

        }


        // =================================================
        // MOSTRAR COORDENADAS
        // =================================================

        coordenadas.textContent =
            `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;


        // =================================================
        // MOSTRAR RESULTADO
        // =================================================

        resultado.style.display =
            "block";


        // =================================================
        // REMOVER MARCADOR ANTERIOR
        // =================================================

        if (marcador !== null) {

            mapa.removeLayer(
                marcador
            );

        }


        // =================================================
        // NOVO MARCADOR
        // =================================================

        marcador =
            L.marker(
                [
                    latitude,
                    longitude
                ]
            ).addTo(mapa);


        // =================================================
        // POPUP
        // =================================================

        const popup = `

            <div>

                <div class="popup-titulo">
                    📍 Localização encontrada
                </div>

                <div class="popup-endereco">

                    <strong>
                        ${endereco.logradouro || "Endereço não informado"}
                    </strong>

                    ${
                        endereco.bairro
                            ? `<br>${endereco.bairro}`
                            : ""
                    }

                    ${
                        endereco.localidade
                            ? `<br>${endereco.localidade}`
                            : ""
                    }

                    ${
                        endereco.uf
                            ? ` - ${endereco.uf}`
                            : ""
                    }

                    <br>

                    CEP:
                    ${formatarCep(cep)}

                </div>

            </div>

        `;


        marcador
            .bindPopup(popup)
            .openPopup();


        // CENTRALIZAR MAPA

        mapa.flyTo(
            [
                latitude,
                longitude
            ],
            17,
            {
                duration: 1.5
            }
        );


        // SUCESSO

        mostrarMensagem(
            "CEP localizado com sucesso!",
            "sucesso"
        );


    } catch (erro) {

        console.error(
            "Erro na consulta:",
            erro
        );


        mostrarMensagem(
            erro.message ||
            "Ocorreu um erro inesperado.",
            "erro"
        );


        resultado.style.display =
            "none";


    } finally {

        // RESTAURAR BOTÃO

        botaoBuscar.disabled =
            false;

        botaoBuscar.textContent =
            "Consultar";

    }

}


// BOTÃO CONSULTAR

botaoBuscar.addEventListener(
    "click",
    consultarCep
);


// ENTER

campoCep.addEventListener(
    "keydown",
    function (evento) {

        if (evento.key === "Enter") {

            consultarCep();

        }

    }
);


// AJUSTAR MAPA

setTimeout(
    function () {

        mapa.invalidateSize();

    },
    500
);
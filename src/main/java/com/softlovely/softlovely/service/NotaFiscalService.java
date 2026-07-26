package com.softlovely.softlovely.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.UUID;

/**
 * Emite NFS-e (Nota Fiscal de Serviços Eletrônica) via API Focus NFe.
 *
 * Configuração necessária em application.properties:
 *   focusnfe.token                    = SEU_TOKEN_AQUI
 *   focusnfe.ambiente                 = homologacao  (ou producao)
 *   focusnfe.prestador.cnpj           = 00000000000000
 *   focusnfe.prestador.inscricao      = 00000000
 *   focusnfe.prestador.cod-municipio  = 3550308  (código IBGE do município)
 *   focusnfe.servico.item-lista       = 1.03
 *   focusnfe.servico.aliquota         = 5.00
 */
@Service
public class NotaFiscalService {

    @Value("${focusnfe.token:}")
    private String token;

    @Value("${focusnfe.ambiente:homologacao}")
    private String ambiente;

    @Value("${focusnfe.prestador.cnpj:}")
    private String prestadorCnpj;

    @Value("${focusnfe.prestador.inscricao:}")
    private String prestadorInscricao;

    @Value("${focusnfe.prestador.cod-municipio:3550308}")
    private String prestadorCodMunicipio;

    @Value("${focusnfe.servico.item-lista:1.03}")
    private String itemLista;

    @Value("${focusnfe.servico.aliquota:5.00}")
    private String aliquota;

    private static final String BASE_URL_HOMOLOGACAO = "https://homologacao.focusnfe.com.br";
    private static final String BASE_URL_PRODUCAO     = "https://api.focusnfe.com.br";

    /**
     * Emite a NFS-e para o cliente.
     *
     * @param customerEmail  e-mail do tomador (recebe a NF por email)
     * @param customerName   nome completo do tomador
     * @param customerCpf    CPF do tomador (pode ser nulo/vazio)
     * @param valorReais     valor em reais (ex: 14.90)
     * @param descricao      descrição do serviço
     */
    public void emitirNfse(String customerEmail, String customerName,
                           String customerCpf, double valorReais, String descricao) {

        if (token == null || token.isBlank()) {
            System.out.println("[NotaFiscal] Token Focus NFe não configurado — NFS-e não emitida.");
            return;
        }
        if (prestadorCnpj == null || prestadorCnpj.isBlank()) {
            System.out.println("[NotaFiscal] CNPJ do prestador não configurado — NFS-e não emitida.");
            return;
        }

        try {
            String ref     = "softlovely-" + UUID.randomUUID().toString().substring(0, 8);
            String baseUrl = "producao".equalsIgnoreCase(ambiente) ? BASE_URL_PRODUCAO : BASE_URL_HOMOLOGACAO;
            String url     = baseUrl + "/v2/nfse?ref=" + ref;

            String dataEmissao = LocalDateTime.now()
                    .format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss")) + "-03:00";

            /* ── Monta tomador ── */
            String tomadorJson;
            if (customerCpf != null && !customerCpf.isBlank()) {
                String cpfLimpo = customerCpf.replaceAll("[^0-9]", "");
                tomadorJson = String.format("""
                    "tomador": {
                      "cpf": "%s",
                      "razao_social": "%s",
                      "email": "%s"
                    }""", cpfLimpo, sanitize(customerName), sanitize(customerEmail));
            } else {
                tomadorJson = String.format("""
                    "tomador": {
                      "razao_social": "%s",
                      "email": "%s"
                    }""", sanitize(customerName), sanitize(customerEmail));
            }

            String body = String.format("""
                {
                  "data_emissao": "%s",
                  "natureza_operacao": 1,
                  "optante_simples_nacional": 1,
                  "prestador": {
                    "cnpj": "%s",
                    "inscricao_municipal": "%s",
                    "codigo_municipio": "%s"
                  },
                  %s,
                  "servico": {
                    "aliquota": %s,
                    "descricao": "%s",
                    "discriminacao": "%s",
                    "iss_retido": 0,
                    "item_lista_servico": "%s",
                    "valor_servicos": %.2f
                  }
                }""",
                    dataEmissao,
                    prestadorCnpj.replaceAll("[^0-9]", ""),
                    prestadorInscricao,
                    prestadorCodMunicipio,
                    tomadorJson,
                    aliquota,
                    sanitize(descricao),
                    sanitize(descricao),
                    itemLista,
                    valorReais);

            String credentials = Base64.getEncoder().encodeToString((token + ":").getBytes());

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Authorization", "Basic " + credentials)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            System.out.println("[NotaFiscal] Resposta Focus NFe: " + response.statusCode() + " — " + response.body());

        } catch (Exception e) {
            System.err.println("[NotaFiscal] Erro ao emitir NFS-e: " + e.getMessage());
        }
    }

    private String sanitize(String s) {
        if (s == null) return "";
        return s.replace("\"", "'").replace("\n", " ").replace("\r", "");
    }
}

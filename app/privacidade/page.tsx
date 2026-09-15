import { LegalPage } from "@/components/legal-page";

export default function Privacidade(){
  return <LegalPage kicker="INFORMAÇÕES LEGAIS" title="Política de Privacidade" intro="Esta política explica, de forma simples, como as informações podem ser tratadas durante o uso do site oficial da Valete." sections={[
    {heading:"1. Dados fornecidos pelo visitante",paragraphs:["O site público não exige cadastro. No formulário de contato, coletamos nome, telefone, e-mail e a mensagem enviada. Esses dados são usados para responder ao pedido, conversar sobre eventos ou contratações e manter o histórico necessário do atendimento.","Quando você escolhe falar com a banda por serviços externos, como WhatsApp ou Instagram, os dados enviados passam a ser tratados também conforme as políticas dessas plataformas."]},
    {heading:"2. Dados técnicos",paragraphs:["O serviço de hospedagem pode registrar informações técnicas necessárias para segurança e funcionamento, como endereço IP, tipo de navegador, data, horário e páginas acessadas."]},
    {heading:"3. Vídeos e serviços externos",paragraphs:["Os vídeos são exibidos por meio do player do YouTube. Ao reproduzir ou interagir com esse conteúdo, a plataforma pode processar dados conforme sua própria política de privacidade."]},
    {heading:"4. Cookies e área administrativa",paragraphs:["A área pública não utiliza cookies de publicidade próprios. Cookies essenciais podem ser usados para autenticação e segurança do painel administrativo restrito."]},
    {heading:"5. Finalidade, acesso e conservação",paragraphs:["As mensagens do formulário ficam disponíveis apenas na área administrativa restrita da Valete. Os dados são mantidos pelo tempo necessário para realizar o atendimento e cumprir obrigações aplicáveis, e depois podem ser excluídos.","As informações técnicas são utilizadas apenas para disponibilizar, proteger e melhorar o funcionamento do site. Medidas razoáveis de segurança são adotadas para evitar acessos indevidos."]},
    {heading:"6. Direitos e alterações",paragraphs:["Você pode solicitar informações, correção ou exclusão de dados pessoais tratados diretamente pela Valete, quando aplicável. Para isso, use os canais informados na página de contato. Esta política pode ser atualizada para acompanhar mudanças no site ou nas regras aplicáveis."]},
  ]}/>;
}

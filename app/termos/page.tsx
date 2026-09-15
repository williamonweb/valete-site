import { LegalPage } from "@/components/legal-page";

export default function Termos(){
  return <LegalPage kicker="INFORMAÇÕES LEGAIS" title="Termos de Uso" intro="Ao acessar o site oficial da Valete, você concorda com as condições apresentadas abaixo." sections={[
    {heading:"1. Finalidade do site",paragraphs:["Este site divulga a banda Valete, seus integrantes, repertório, vídeos, agenda de apresentações e canais de contato para contratação."]},
    {heading:"2. Conteúdo e atualizações",paragraphs:["As informações podem ser alteradas ou atualizadas a qualquer momento. Datas, horários e locais de apresentações podem sofrer mudanças por decisão da produção, dos contratantes ou dos organizadores dos eventos."]},
    {heading:"3. Direitos autorais",paragraphs:["O nome Valete, a identidade visual, os textos, as fotografias, os vídeos e demais materiais próprios apresentados neste site não podem ser reproduzidos para fins comerciais sem autorização.","Conteúdos incorporados de plataformas externas permanecem sujeitos às regras e aos direitos de seus respectivos titulares."]},
    {heading:"4. Links externos",paragraphs:["O site pode direcionar para YouTube, Instagram, WhatsApp e outros serviços. O uso dessas plataformas é regido pelos termos e políticas de cada empresa."]},
    {heading:"5. Uso adequado",paragraphs:["É proibido tentar comprometer o funcionamento do site, acessar áreas restritas sem autorização, copiar dados de forma automatizada ou utilizar o conteúdo para atividades ilícitas."]},
    {heading:"6. Responsabilidade",paragraphs:["A Valete busca manter as informações corretas e o site disponível, mas não garante funcionamento ininterrupto nem se responsabiliza por indisponibilidades temporárias ou alterações realizadas por serviços externos."]},
  ]}/>;
}

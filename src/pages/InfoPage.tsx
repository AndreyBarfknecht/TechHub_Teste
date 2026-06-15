import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Truck, RefreshCcw, ShieldCheck, Mail, ArrowLeft, Ghost } from 'lucide-react';

const INFO_CONTENT: Record<string, { title: string; icon: any; content: string; irony: string }> = {
  'shipping': {
    title: 'Política de Frete',
    icon: Truck,
    content: 'Nossa logística é baseada em física quântica: o produto está simultaneamente entregue e perdido até que você abra a porta.',
    irony: 'Prazo de entrega: Entre amanhã e o dia de São Nunca. Se o entregador não for abduzido por alienígenas, talvez chegue antes do Natal de 2030.'
  },
  'returns': {
    title: 'Trocas e Devoluções',
    icon: RefreshCcw,
    content: 'O arrependimento é um sentimento complexo, e nós respeitamos isso não fazendo nada a respeito.',
    irony: 'Trocas só serão aceitas se o produto for devolvido pessoalmente na base secreta da TechStore no fundo do Oceano Atlântico, acompanhado de uma prova de vida e uma carta de recomendação do Papa.'
  },
  'privacy': {
    title: 'Privacidade',
    icon: ShieldCheck,
    content: 'Seus dados são tão preciosos para nós que o estagiário os usa como papel de rascunho.',
    irony: 'Nós vendemos seus dados apenas para empresas que prometem te ligar no meio do seu almoço de domingo. É um serviço de utilidade pública para garantir que você nunca se sinta sozinho.'
  },
  'contact': {
    title: 'Contato',
    icon: Mail,
    content: 'Estamos ansiosos para ignorar a sua mensagem.',
    irony: 'Para falar conosco, por favor, envie um sinal de fumaça em um dia de chuva ou tente telepatia. Nosso tempo médio de resposta é de 3 a 5 eras geológicas.'
  }
};

const InfoPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const info = slug ? INFO_CONTENT[slug] : null;

  if (!info) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
        <Ghost size={64} style={{ marginBottom: '1rem', color: 'var(--text-muted)' }} />
        <h2>Página não encontrada no multiverso.</h2>
        <Link to="/" className="btn-primary" style={{ marginTop: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={18} /> Voltar para a Realidade
        </Link>
      </div>
    );
  }

  const Icon = info.icon;

  return (
    <div className="info-page fade-in" style={{ padding: '4rem 0', minHeight: '60vh' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', textDecoration: 'none', marginBottom: '2rem', fontWeight: 600 }}>
          <ArrowLeft size={18} /> Voltar ao Início
        </Link>
        
        <div className="card" style={{ padding: '3rem', textAlign: 'center', borderTop: '5px solid var(--primary)' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: 'var(--primary-light)', 
            color: 'var(--primary)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 1.5rem' 
          }}>
            <Icon size={40} />
          </div>
          
          <h1 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>{info.title}</h1>
          
          <div style={{ fontSize: '1.2rem', lineHeight: '1.6', color: 'var(--text-main)', marginBottom: '2rem' }}>
            <p>{info.content}</p>
          </div>
          
          <div style={{ 
            background: '#f8fafc', 
            padding: '2rem', 
            borderRadius: '12px', 
            border: '1px dashed var(--border)',
            fontStyle: 'italic',
            color: 'var(--text-muted)'
          }}>
            <p>"{info.irony}"</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;

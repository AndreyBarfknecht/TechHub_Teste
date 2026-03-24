-- ==========================================
-- SCRIPT DE SEED (DADOS FICTÍCIOS)
-- ==========================================

-- Habilitar pgcrypto para criptografar senhas no auth.users
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Inserir Usuários (2 Admins e 1 Cliente)
-- A senha para todos os usuários será: 123456
-- NOTA: Ao rodar esse INSERT, o gatilho que configuramos anteriormente
-- criará as respectivas linhas na tabela "public.profiles" de forma automática!
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES
('a1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin1@loja.com', crypt('123456', gen_salt('bf')), NOW(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Admin Master"}', NOW(), NOW()),

('a2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin2@loja.com', crypt('123456', gen_salt('bf')), NOW(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Admin Secundário"}', NOW(), NOW()),

('c1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'cliente@loja.com', crypt('123456', gen_salt('bf')), NOW(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Cliente Comprador"}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Atualizar o perfil do Cliente com dados de endereço para poder simular um checkout
UPDATE public.profiles
SET phone = '11999999999', cpf = '12345678900', cep = '01001-000', address = 'Praça da Sé, 1', city = 'São Paulo', state = 'SP'
WHERE id = 'c1111111-1111-1111-1111-111111111111';

-- 2. Inserir Categorias
INSERT INTO public.categories (id, name, slug, description)
VALUES
('c0000001-0000-0000-0000-000000000001', 'Eletrônicos', 'eletronicos', 'Celulares, notebooks e gadgets tecnológicos'),
('c0000002-0000-0000-0000-000000000002', 'Vestuário', 'vestuario', 'Roupas, calçados e moda'),
('c0000003-0000-0000-0000-000000000003', 'Casa e Decoração', 'casa-decoracao', 'Itens para o seu lar')
ON CONFLICT (id) DO NOTHING;

-- 3. Inserir Produtos (Alguns marcados como 'is_featured = true' para aparecer na HomePage)
INSERT INTO public.products (id, category_id, name, description, price, stock_quantity, image_url, is_featured)
VALUES
('p0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'iPhone 15 Pro', 'Smartphone Apple com 256GB - Cor Titânio Natural', 7299.00, 15, 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=500&q=80', true),

('p0000002-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001', 'Notebook Dell XPS 13', 'Notebook ultrafino com processador i7 e 16GB RAM', 9500.00, 8, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&q=80', true),

('p0000003-0000-0000-0000-000000000003', 'c0000002-0000-0000-0000-000000000002', 'Camiseta Básica Preta', 'Camiseta 100% algodão super confortável', 59.90, 50, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80', false),

('p0000004-0000-0000-0000-000000000004', 'c0000002-0000-0000-0000-000000000002', 'Tênis Esportivo Running', 'Tênis de corrida de alta performance com amortecimento', 299.90, 30, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80', true),

('p0000005-0000-0000-0000-000000000005', 'c0000003-0000-0000-0000-000000000003', 'Cafeteira Expresso Premium', 'Máquina de café em cápsulas automática', 450.00, 20, 'https://images.unsplash.com/photo-1517246286466-231a47738f71?w=500&q=80', false)
ON CONFLICT (id) DO NOTHING;

-- 4. Inserir Pedido Fictício para o Cliente (Para popular a tela de Checkout)
INSERT INTO public.orders (id, user_id, status, subtotal, shipping_fee, total_amount, shipping_address, payment_method)
VALUES
('o0000001-0000-0000-0000-000000000001', 'c1111111-1111-1111-1111-111111111111', 'paid', 7358.90, 25.00, 7383.90, 'Praça da Sé, 1 - São Paulo/SP - CEP: 01001-000', 'credit_card')
ON CONFLICT (id) DO NOTHING;

-- 5. Inserir Itens do Pedido Fictício
INSERT INTO public.order_items (id, order_id, product_id, quantity, unit_price)
VALUES
('i0000001-0000-0000-0000-000000000001', 'o0000001-0000-0000-0000-000000000001', 'p0000001-0000-0000-0000-000000000001', 1, 7299.00),
('i0000002-0000-0000-0000-000000000002', 'o0000001-0000-0000-0000-000000000001', 'p0000003-0000-0000-0000-000000000003', 1, 59.90)
ON CONFLICT (id) DO NOTHING;

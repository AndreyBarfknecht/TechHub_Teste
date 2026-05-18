-- ==========================================
-- SCRIPT DE SEED (DADOS REAIS DA LOJA TECH)
-- ==========================================

-- Habilitar pgcrypto para criptografar senhas no auth.users
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Inserir Usuários (Admins e Cliente)
-- Senha: 123
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES
('a1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@techhub.com', crypt('123', gen_salt('bf')), NOW(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Admin TechHub"}', NOW(), NOW()),
('c1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'cliente@email.com', crypt('123', gen_salt('bf')), NOW(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Usuário Teste"}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Inserir Categorias
INSERT INTO public.categories (id, name, slug, description)
VALUES
('c0000001-0000-0000-0000-000000000001', 'Smartphones e Wearables', 'smartphones-wearables', 'Celulares, Smartwatches e acessórios essenciais'),
('c0000002-0000-0000-0000-000000000002', 'Informática e Hardware', 'informatica-hardware', 'Notebooks, SSDs e componentes de performance'),
('c0000003-0000-0000-0000-000000000003', 'Periféricos Gamers', 'perifericos-gamers', 'Teclados, mouses e equipamentos para gamers'),
('c0000004-0000-0000-0000-000000000004', 'Áudio', 'audio', 'Fones de ouvido e caixas de som premium'),
('c0000005-0000-0000-0000-000000000005', 'TVs e Vídeo', 'tvs-video', 'Smart TVs e equipamentos de vídeo 4K'),
('c0000006-0000-0000-0000-000000000006', 'Games', 'games', 'Consoles, controles e acessórios para jogos')
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, slug = EXCLUDED.slug, description = EXCLUDED.description;

-- 3. Inserir Produtos
INSERT INTO public.products (id, category_id, name, description, price, stock_quantity, image_urls, is_featured)
VALUES
-- Smartphones e Wearables
('d0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'iPhone 15 Pro', 'O mais poderoso iPhone com Titânio e Chip A17 Pro.', 7299.00, 10, '{"https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800"}', true),
('d0000002-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001', 'Smartwatch Haylou RS4', 'Tela AMOLED, monitoramento de saúde e bateria de longa duração.', 289.90, 25, '{"https://images.unsplash.com/photo-1508685096489-77a5ad2ba979?w=800"}', true),
('d0000003-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000001', 'Carregador Turbo 30W USB-C', 'Carregamento ultra-rápido para seus dispositivos.', 129.00, 50, '{"https://images.unsplash.com/photo-1619193100630-f56ec8000497?w=800"}', false),

-- Informática e Hardware
('d0000004-0000-0000-0000-000000000004', 'c0000002-0000-0000-0000-000000000002', 'Notebook Dell XPS 13', 'Elegância e poder com processador Intel i7 de última geração.', 9450.00, 5, '{"https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800"}', true),
('d0000005-0000-0000-0000-000000000005', 'c0000002-0000-0000-0000-000000000002', 'SSD Kingston NV2 1TB', 'Velocidade NVMe PCIe 4.0 para seu computador.', 389.00, 20, '{"https://images.unsplash.com/photo-1597872200370-493dea2393c0?w=800"}', true),

-- Periféricos Gamers
('d0000006-0000-0000-0000-000000000006', 'c0000003-0000-0000-0000-000000000003', 'Teclado Mecânico RGB K500', 'Switches azuis, iluminação RGB e durabilidade extrema.', 259.90, 15, '{"https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800"}', true),
('d0000007-0000-0000-0000-000000000007', 'c0000003-0000-0000-0000-000000000003', 'Mouse Gamer RGB Pro', 'Sensor de alta precisão 12000 DPI e botões programáveis.', 189.00, 30, '{"https://images.unsplash.com/photo-1527814050087-3793815479db?w=800"}', true),
('d0000008-0000-0000-0000-000000000008', 'c0000003-0000-0000-0000-000000000003', 'Webcam Full HD 1080p', 'Perfeita para streaming e reuniões com microfone integrado.', 220.00, 12, '{"https://images.unsplash.com/photo-1588508065123-287b28e013da?w=800"}', false),

-- Áudio
('d0000009-0000-0000-0000-000000000009', 'c0000004-0000-0000-0000-000000000004', 'Fone Bluetooth JBL Tune 520BT', 'Som JBL Pure Bass e 57 horas de bateria.', 349.00, 40, '{"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"}', true),
('d0000010-0000-0000-0000-000000000010', 'c0000004-0000-0000-0000-000000000004', 'Caixa de Som Bluetooth XSound', 'Potência e fidelidade sonora à prova d''água.', 499.00, 18, '{"https://images.unsplash.com/photo-1608155613951-367468897587?w=800"}', false),

-- TVs e Vídeo
('d0000011-0000-0000-0000-000000000011', 'c0000005-0000-0000-0000-000000000005', 'Smart TV 50 Polegadas 4K UHD', 'Qualidade de cinema em casa com HDR e Inteligência Artificial.', 2450.00, 8, '{"https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800"}', true),

-- Games
('d0000012-0000-0000-0000-000000000012', 'c0000006-0000-0000-0000-000000000006', 'Controle sem fio DualSense Edge', 'Alta performance e personalização para seu PS5.', 1250.00, 10, '{"https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800"}', true)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price, 
    stock_quantity = EXCLUDED.stock_quantity, image_urls = EXCLUDED.image_urls, is_featured = EXCLUDED.is_featured;

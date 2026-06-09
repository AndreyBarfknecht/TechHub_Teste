-- ==========================================================
-- SCRIPT FINAL DE BACK-END - TECHHUB
-- Copie e cole todo este código no SQL Editor do Supabase e clique em RUN
-- ==========================================================

-- 1. LIMPEZA (Opcional, mas garante que não haverá conflito de nomes)
DROP FUNCTION IF EXISTS public.validate_coupon(text);
DROP FUNCTION IF EXISTS public.process_order(uuid, text, text, numeric, jsonb, uuid);

-- 2. FUNÇÃO: VALIDAÇÃO DE CUPOM SEGURA
-- Retorna um objeto JSON com o status da validação
CREATE OR REPLACE FUNCTION public.validate_coupon(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_coupon_record RECORD;
BEGIN
    -- Busca o cupom usando apelido 'c' para evitar ambiguidade na coluna 'code'
    SELECT * INTO v_coupon_record 
    FROM public.coupons c
    WHERE UPPER(c.code) = UPPER(p_code);

    -- Verifica se o cupom existe
    IF NOT FOUND THEN
        RETURN jsonb_build_object('is_valid', false, 'message', 'Cupom não encontrado');
    END IF;

    -- Verifica se está ativo
    IF v_coupon_record.is_active = FALSE THEN
        RETURN jsonb_build_object('is_valid', false, 'message', 'Este cupom não está mais ativo');
    END IF;

    -- Verifica limite de uso (max_uses e usage_count)
    IF v_coupon_record.max_uses IS NOT NULL AND v_coupon_record.usage_count >= v_coupon_record.max_uses THEN
        RETURN jsonb_build_object('is_valid', false, 'message', 'Este cupom atingiu o limite de usos');
    END IF;

    -- Retorna sucesso com os dados do cupom
    RETURN jsonb_build_object(
        'is_valid', true, 
        'id', v_coupon_record.id,
        'code', v_coupon_record.code,
        'discount_percent', v_coupon_record.discount_percent,
        'message', 'Cupom aplicado com sucesso!'
    );
END;
$$;

-- 3. FUNÇÃO: CHECKOUT ATÔMICO (PROCESS_ORDER)
-- Realiza toda a transação de compra em um único passo
CREATE OR REPLACE FUNCTION public.process_order(
    p_user_id UUID,
    p_shipping_address TEXT,
    p_payment_method TEXT,
    p_shipping_fee NUMERIC,
    p_items JSONB,
    p_coupon_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_id UUID;
    v_item RECORD;
    v_subtotal NUMERIC := 0;
    v_discount_percent NUMERIC := 0;
    v_discount_amount NUMERIC := 0;
    v_total_amount NUMERIC := 0;
    v_product_price NUMERIC;
    v_current_stock INTEGER;
BEGIN
    -- PASSO 1: Validar estoque de todos os itens antes de começar
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, quantity INTEGER)
    LOOP
        SELECT p.price, p.stock_quantity INTO v_product_price, v_current_stock
        FROM public.products p 
        WHERE p.id = v_item.product_id;
        
        IF NOT FOUND THEN 
            RAISE EXCEPTION 'Produto não encontrado: %', v_item.product_id; 
        END IF;
        
        IF v_current_stock < v_item.quantity THEN 
            RAISE EXCEPTION 'Estoque insuficiente para um ou mais itens'; 
        END IF;
        
        v_subtotal := v_subtotal + (v_product_price * v_item.quantity);
    END LOOP;

    -- PASSO 2: Validar e aplicar cupom (se enviado)
    IF p_coupon_id IS NOT NULL THEN
        SELECT cp.discount_percent INTO v_discount_percent 
        FROM public.coupons cp
        WHERE cp.id = p_coupon_id 
          AND cp.is_active = TRUE 
          AND (cp.max_uses IS NULL OR cp.usage_count < cp.max_uses);
        
        IF NOT FOUND THEN 
            RAISE EXCEPTION 'Cupom inválido ou expirado'; 
        END IF;
        
        v_discount_amount := (v_subtotal * v_discount_percent) / 100;
        
        -- Incrementa uso do cupom
        UPDATE public.coupons SET usage_count = usage_count + 1 WHERE id = p_coupon_id;
    END IF;

    -- Cálculo do total final
    v_total_amount := v_subtotal + p_shipping_fee - v_discount_amount;

    -- PASSO 3: Criar o registro principal do Pedido
    INSERT INTO public.orders (
        user_id, status, subtotal, shipping_fee, total_amount, shipping_address, payment_method
    ) VALUES (
        p_user_id, 'paid', v_subtotal, p_shipping_fee, v_total_amount, p_shipping_address, p_payment_method
    ) RETURNING id INTO v_order_id;

    -- PASSO 4: Inserir itens do pedido e baixar o estoque
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, quantity INTEGER)
    LOOP
        -- Pega o preço no momento da compra
        SELECT p.price INTO v_product_price FROM public.products p WHERE p.id = v_item.product_id;
        
        -- Registra o item
        INSERT INTO public.order_items (order_id, product_id, quantity, unit_price)
        VALUES (v_order_id, v_item.product_id, v_item.quantity, v_product_price);
        
        -- Baixa o estoque físico
        UPDATE public.products 
        SET stock_quantity = stock_quantity - v_item.quantity 
        WHERE id = v_item.product_id;
    END LOOP;

    -- RETORNO DE SUCESSO
    RETURN jsonb_build_object(
        'success', true, 
        'order_id', v_order_id,
        'total_paid', v_total_amount
    );

-- TRATAMENTO DE ERROS (Rollback automático)
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false, 
        'error', SQLERRM
    );
END;
$$;

-- FIM DO SCRIPT

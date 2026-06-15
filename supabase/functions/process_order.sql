-- Função process_order corrigida com os nomes das colunas do seu banco
CREATE OR REPLACE FUNCTION public.process_order(
    p_user_id UUID,
    p_shipping_address TEXT,
    p_payment_method TEXT,
    p_shipping_fee DECIMAL,
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
    v_subtotal DECIMAL(10, 2) := 0;
    v_discount_percent DECIMAL(5, 2) := 0;
    v_discount_amount DECIMAL(10, 2) := 0;
    v_total_amount DECIMAL(10, 2) := 0;
    v_product_price DECIMAL(10, 2);
    v_current_stock INTEGER;
BEGIN
    -- 1. Validar Estoque e calcular subtotal
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, quantity INTEGER)
    LOOP
        SELECT price, stock_quantity INTO v_product_price, v_current_stock
        FROM public.products
        WHERE id = v_item.product_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Produto % não encontrado', v_item.product_id;
        END IF;

        IF v_current_stock < v_item.quantity THEN
            RAISE EXCEPTION 'Estoque insuficiente para o produto %', v_item.product_id;
        END IF;

        v_subtotal := v_subtotal + (v_product_price * v_item.quantity);
    END LOOP;

    -- 2. Validar e aplicar cupom usando NOMES CORRETOS: usage_count e max_uses
    IF p_coupon_id IS NOT NULL THEN
        SELECT discount_percent INTO v_discount_percent
        FROM public.coupons
        WHERE id = p_coupon_id AND is_active = TRUE 
        AND (max_uses IS NULL OR usage_count < max_uses);

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Cupom inválido ou expirado';
        END IF;

        v_discount_amount := (v_subtotal * v_discount_percent) / 100;
        
        -- Atualizar usage_count (nome correto)
        UPDATE public.coupons 
        SET usage_count = usage_count + 1 
        WHERE id = p_coupon_id;
    END IF;

    v_total_amount := v_subtotal + p_shipping_fee - v_discount_amount;

    -- 3. Criar o Pedido
    INSERT INTO public.orders (
        user_id, status, subtotal, shipping_fee, total_amount, shipping_address, payment_method
    ) VALUES (
        p_user_id, 'paid', v_subtotal, p_shipping_fee, v_total_amount, p_shipping_address, p_payment_method
    ) RETURNING id INTO v_order_id;

    -- 4. Inserir itens e reduzir estoque
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, quantity INTEGER)
    LOOP
        SELECT price INTO v_product_price FROM public.products WHERE id = v_item.product_id;

        INSERT INTO public.order_items (order_id, product_id, quantity, unit_price)
        VALUES (v_order_id, v_item.product_id, v_item.quantity, v_product_price);

        UPDATE public.products
        SET stock_quantity = stock_quantity - v_item.quantity
        WHERE id = v_item.product_id;
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'total_amount', v_total_amount
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$;

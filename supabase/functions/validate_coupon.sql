-- Função para validar cupom corrigida com os nomes das colunas do seu banco
CREATE OR REPLACE FUNCTION public.validate_coupon(p_code TEXT)
RETURNS TABLE (
    id UUID,
    code TEXT,
    discount_percent DECIMAL,
    is_valid BOOLEAN,
    message TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_coupon_record RECORD;
BEGIN
    -- Busca o cupom
    SELECT * INTO v_coupon_record 
    FROM public.coupons 
    WHERE UPPER(code) = UPPER(p_code);

    IF v_coupon_record.id IS NULL THEN
        RETURN QUERY SELECT NULL::UUID, p_code, 0.0, FALSE, 'Cupom não encontrado'::TEXT;
        RETURN;
    END IF;

    IF v_coupon_record.is_active = FALSE THEN
        RETURN QUERY SELECT v_coupon_record.id, v_coupon_record.code, 0.0, FALSE, 'Este cupom não está mais ativo'::TEXT;
        RETURN;
    END IF;

    -- USANDO NOMES CORRETOS: max_uses e usage_count
    IF v_coupon_record.max_uses IS NOT NULL AND v_coupon_record.usage_count >= v_coupon_record.max_uses THEN
        RETURN QUERY SELECT v_coupon_record.id, v_coupon_record.code, 0.0, FALSE, 'Este cupom atingiu o limite de usos'::TEXT;
        RETURN;
    END IF;

    RETURN QUERY SELECT v_coupon_record.id, v_coupon_record.code, v_coupon_record.discount_percent::DECIMAL, TRUE, 'Cupom aplicado com sucesso!'::TEXT;
END;
$$;
